import { prisma } from "@/lib/prisma";
import { YouTubeService } from "@/lib/youtube";
import { getQuotaStatus } from "@/lib/quota";
import { logger } from "@/lib/logger";
import { DAILY_QUOTA_LIMIT } from "@/types/quota";
import type {
  ExportInitResult,
  ExportBatchResult,
  ExportStatusResult,
  ExportedVideoRow,
} from "@/types/export";

const QUOTA_CEILING_PERCENT = 70;
export const QUOTA_CEILING = Math.floor(
  (DAILY_QUOTA_LIMIT * QUOTA_CEILING_PERCENT) / 100
); // 7000

export function channelIdToUploadsPlaylistId(channelId: string): string {
  if (channelId.startsWith("UC")) {
    return "UU" + channelId.slice(2);
  }
  return channelId;
}

export async function initExport(
  userId: string,
  youtubeService: YouTubeService
): Promise<ExportInitResult> {
  logger.info("API", "initExport START", { userId });

  // Verificar se já existe progresso
  const existingCount = await prisma.exportProgress.count({
    where: { userId },
  });

  if (existingCount > 0) {
    const completed = await prisma.exportProgress.count({
      where: { userId, status: "completed" },
    });
    logger.info("API", "initExport - already initialized", {
      userId,
      existingCount,
      completed,
    });
    return {
      playlistSources: 0,
      channelSources: 0,
      totalSources: existingCount,
      alreadyCompleted: completed,
    };
  }

  // 1. Buscar playlists
  const playlists = await youtubeService.getPlaylists();
  logger.info("API", "initExport - playlists fetched", {
    userId,
    count: playlists.length,
  });

  // 2. Buscar canais inscritos
  const channels = await youtubeService.getSubscribedChannels();
  logger.info("API", "initExport - channels fetched", {
    userId,
    count: channels.length,
  });

  // 3. Criar entradas ExportProgress - playlists primeiro (prioridade)
  const playlistData = playlists.map((p) => ({
    userId,
    sourceType: "playlist",
    sourceId: p.id,
    sourceTitle: p.title,
    status: "pending",
    totalItems: p.itemCount || 0,
    importedItems: 0,
  }));

  const channelData = channels.map((c) => ({
    userId,
    sourceType: "channel",
    sourceId: channelIdToUploadsPlaylistId(c.id),
    originalId: c.id,
    sourceTitle: c.title,
    status: "pending",
    totalItems: 0,
    importedItems: 0,
  }));

  if (playlistData.length > 0) {
    await prisma.exportProgress.createMany({
      data: playlistData,
      skipDuplicates: true,
    });
  }

  if (channelData.length > 0) {
    await prisma.exportProgress.createMany({
      data: channelData,
      skipDuplicates: true,
    });
  }

  logger.info("API", "initExport END", {
    userId,
    playlists: playlistData.length,
    channels: channelData.length,
  });

  return {
    playlistSources: playlistData.length,
    channelSources: channelData.length,
    totalSources: playlistData.length + channelData.length,
    alreadyCompleted: 0,
  };
}

export async function processBatch(
  userId: string,
  youtubeService: YouTubeService
): Promise<ExportBatchResult> {
  logger.info("API", "processBatch START", { userId });

  // Step 1: Verificar quota
  logger.info("API", "processBatch - Step 1: Checking quota status", { userId });
  let quotaStatus;
  try {
    quotaStatus = await getQuotaStatus(userId);
    logger.info("API", "processBatch - Step 1 complete: Quota status retrieved", {
      userId,
      consumedUnits: quotaStatus.consumedUnits,
      dailyLimit: quotaStatus.dailyLimit,
      remaining: quotaStatus.dailyLimit - quotaStatus.consumedUnits,
      ceiling: QUOTA_CEILING,
      ceilingPercent: QUOTA_CEILING_PERCENT,
    });
  } catch (quotaError) {
    logger.error(
      "API",
      "processBatch - Step 1 FAILED: getQuotaStatus threw an exception",
      quotaError instanceof Error ? quotaError : undefined,
      {
        userId,
        errorType: quotaError?.constructor?.name,
        errorString: String(quotaError),
        errorStack: quotaError instanceof Error ? quotaError.stack : undefined,
      }
    );
    throw quotaError;
  }

  // Require 2 quota units per batch (playlistItems.list: 1, videos.list: 1)
  const requiredQuota = 2;
  const remainingQuota = quotaStatus.dailyLimit - quotaStatus.consumedUnits;

  if (quotaStatus.consumedUnits >= QUOTA_CEILING || remainingQuota < requiredQuota) {
    logger.info("API", "processBatch - quota insufficient, returning shouldStop=true", {
      userId,
      consumed: quotaStatus.consumedUnits,
      remaining: remainingQuota,
      required: requiredQuota,
      ceiling: QUOTA_CEILING,
      exceedsCeiling: quotaStatus.consumedUnits >= QUOTA_CEILING,
      insufficientRemaining: remainingQuota < requiredQuota,
    });
    return {
      sourceId: "",
      sourceTitle: null,
      sourceType: "",
      videosImported: 0,
      hasMore: false,
      quotaUsedToday: quotaStatus.consumedUnits,
      quotaCeiling: QUOTA_CEILING,
      shouldStop: true,
      exportComplete: false,
    };
  }

  // Step 2: Buscar próxima fonte incompleta
  logger.info("API", "processBatch - Step 2: Finding next incomplete source", { userId });
  let progress;
  try {
    progress = await prisma.exportProgress.findFirst({
      where: {
        userId,
        status: { in: ["in_progress", "pending"] },
      },
      orderBy: [{ sourceType: "desc" }, { status: "asc" }, { createdAt: "asc" }],
    });
    logger.info("API", "processBatch - Step 2 complete: findFirst returned", {
      userId,
      found: !!progress,
      progressId: progress?.id || "none",
      sourceType: progress?.sourceType || "none",
      sourceId: progress?.sourceId || "none",
      sourceTitle: progress?.sourceTitle || "none",
      status: progress?.status || "none",
      lastPageToken: progress?.lastPageToken || "null",
      importedItems: progress?.importedItems ?? 0,
      totalItems: progress?.totalItems ?? 0,
    });
  } catch (dbError) {
    logger.error(
      "API",
      "processBatch - Step 2 FAILED: DB findFirst threw an exception",
      dbError instanceof Error ? dbError : undefined,
      {
        userId,
        errorType: dbError?.constructor?.name,
        errorString: String(dbError),
        errorStack: dbError instanceof Error ? dbError.stack : undefined,
      }
    );
    throw dbError;
  }

  if (!progress) {
    logger.info("API", "processBatch - all sources completed, returning exportComplete=true", { userId });
    return {
      sourceId: "",
      sourceTitle: null,
      sourceType: "",
      videosImported: 0,
      hasMore: false,
      quotaUsedToday: quotaStatus.consumedUnits,
      quotaCeiling: QUOTA_CEILING,
      shouldStop: false,
      exportComplete: true,
    };
  }

  // Step 3: Marcar como in_progress se era pending
  if (progress.status === "pending") {
    logger.info("API", "processBatch - Step 3: Updating status from pending to in_progress", {
      userId,
      progressId: progress.id,
      sourceId: progress.sourceId,
    });
    try {
      await prisma.exportProgress.update({
        where: { id: progress.id },
        data: { status: "in_progress" },
      });
      logger.info("API", "processBatch - Step 3 complete: Status updated to in_progress", {
        userId,
        progressId: progress.id,
      });
    } catch (updateError) {
      logger.error(
        "API",
        "processBatch - Step 3 FAILED: DB update status threw an exception",
        updateError instanceof Error ? updateError : undefined,
        {
          userId,
          progressId: progress.id,
          errorType: updateError?.constructor?.name,
          errorString: String(updateError),
        }
      );
      throw updateError;
    }
  }

  logger.info("API", "processBatch - processing source", {
    userId,
    sourceType: progress.sourceType,
    sourceId: progress.sourceId,
    sourceTitle: progress.sourceTitle,
    lastPageToken: progress.lastPageToken || "initial",
  });

  try {
    // Step 4: Buscar uma página de vídeos
    logger.info("API", "processBatch - Step 4: Calling getPlaylistItemsPage", {
      userId,
      sourceId: progress.sourceId,
      pageToken: progress.lastPageToken || "initial (first page)",
    });
    const pageStartTime = Date.now();
    const page = await youtubeService.getPlaylistItemsPage(
      progress.sourceId,
      progress.lastPageToken || undefined
    );
    const pageElapsed = Date.now() - pageStartTime;
    logger.info("API", "processBatch - Step 4 complete: getPlaylistItemsPage returned", {
      userId,
      sourceId: progress.sourceId,
      pageElapsed: `${pageElapsed}ms`,
      videosCount: page.videos.length,
      hasNextPage: !!page.nextPageToken,
      nextPageToken: page.nextPageToken ? page.nextPageToken.substring(0, 20) + "..." : "null",
      totalResults: page.totalResults,
      firstVideoId: page.videos.length > 0 ? page.videos[0].videoId : "none",
      firstVideoTitle: page.videos.length > 0 ? page.videos[0].title.substring(0, 50) : "none",
    });

    // Step 5: Salvar vídeos no banco
    let videosImported = 0;
    if (page.videos.length > 0) {
      logger.info("API", "processBatch - Step 5: Saving videos to database", {
        userId,
        videosToSave: page.videos.length,
        sourceId: progress.sourceId,
      });
      const saveStartTime = Date.now();
      try {
        const result = await prisma.exportedVideo.createMany({
          data: page.videos.map((v) => ({
            userId,
            videoId: v.videoId,
            title: v.title,
            channelId: v.channelId || null,
            channelTitle: v.channelTitle || null,
            language: v.language || null,
            sourceType: progress.sourceType,
            sourceId: progress.sourceId,
            sourceTitle: progress.sourceTitle,
            publishedAt: v.publishedAt || null,
            thumbnailUrl: v.thumbnailUrl || null,
          })),
          skipDuplicates: true,
        });
        videosImported = result.count;
        const saveElapsed = Date.now() - saveStartTime;
        logger.info("API", "processBatch - Step 5 complete: Videos saved to database", {
          userId,
          videosImported,
          videosSkipped: page.videos.length - videosImported,
          saveElapsed: `${saveElapsed}ms`,
        });
      } catch (saveError) {
        const saveElapsed = Date.now() - saveStartTime;
        logger.error(
          "API",
          "processBatch - Step 5 FAILED: createMany threw an exception",
          saveError instanceof Error ? saveError : undefined,
          {
            userId,
            sourceId: progress.sourceId,
            videosToSave: page.videos.length,
            saveElapsed: `${saveElapsed}ms`,
            errorType: saveError?.constructor?.name,
            errorString: String(saveError),
            errorStack: saveError instanceof Error ? saveError.stack : undefined,
          }
        );
        throw saveError;
      }
    } else {
      logger.info("API", "processBatch - Step 5: No videos to save (empty page)", {
        userId,
        sourceId: progress.sourceId,
      });
    }

    // Step 6: Atualizar progresso
    const isCompleted = !page.nextPageToken;
    logger.info("API", "processBatch - Step 6: Updating progress record", {
      userId,
      progressId: progress.id,
      isCompleted,
      nextPageToken: page.nextPageToken || "null",
      incrementBy: page.videos.length,
      newTotalItems: page.totalResults || progress.totalItems,
    });
    try {
      await prisma.exportProgress.update({
        where: { id: progress.id },
        data: {
          lastPageToken: page.nextPageToken,
          importedItems: { increment: page.videos.length },
          totalItems: page.totalResults || progress.totalItems,
          lastImportedAt: new Date(),
          status: isCompleted ? "completed" : "in_progress",
        },
      });
      logger.info("API", "processBatch - Step 6 complete: Progress updated", {
        userId,
        progressId: progress.id,
        newStatus: isCompleted ? "completed" : "in_progress",
      });
    } catch (updateError) {
      logger.error(
        "API",
        "processBatch - Step 6 FAILED: DB update progress threw an exception",
        updateError instanceof Error ? updateError : undefined,
        {
          userId,
          progressId: progress.id,
          errorType: updateError?.constructor?.name,
          errorString: String(updateError),
        }
      );
      throw updateError;
    }

    // Step 7: Re-verificar quota após as chamadas
    logger.info("API", "processBatch - Step 7: Re-checking quota after API calls", { userId });
    let updatedQuota;
    try {
      updatedQuota = await getQuotaStatus(userId);
      logger.info("API", "processBatch - Step 7 complete: Updated quota retrieved", {
        userId,
        consumedUnits: updatedQuota.consumedUnits,
        shouldStop: updatedQuota.consumedUnits >= QUOTA_CEILING,
      });
    } catch (quotaError) {
      logger.error(
        "API",
        "processBatch - Step 7 FAILED: getQuotaStatus (post-batch) threw an exception",
        quotaError instanceof Error ? quotaError : undefined,
        { userId, errorString: String(quotaError) }
      );
      throw quotaError;
    }

    logger.info("API", "processBatch END - SUCCESS", {
      userId,
      sourceId: progress.sourceId,
      sourceTitle: progress.sourceTitle,
      videosImported,
      hasMore: !isCompleted,
      quotaUsed: updatedQuota.consumedUnits,
      shouldStop: updatedQuota.consumedUnits >= QUOTA_CEILING,
    });

    return {
      sourceId: progress.sourceId,
      sourceTitle: progress.sourceTitle,
      sourceType: progress.sourceType,
      videosImported,
      hasMore: !isCompleted,
      quotaUsedToday: updatedQuota.consumedUnits,
      quotaCeiling: QUOTA_CEILING,
      shouldStop: updatedQuota.consumedUnits >= QUOTA_CEILING,
      exportComplete: false,
    };
  } catch (error) {
    // Verificar se é erro de quota
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    const isQuotaExceeded =
      errorMessage.includes("quota") ||
      errorMessage.includes("quotaExceeded") ||
      errorMessage.includes("ERR_403");

    // Verificar se é erro de limite de armazenamento do banco (Neon 512 MB limit)
    const isStorageLimitExceeded =
      errorMessage.includes("53100") ||
      errorMessage.includes("max_cluster_size") ||
      errorMessage.includes("could not extend file") ||
      errorMessage.includes("project size limit");

    // Verificar se é erro de playlist não encontrada (404 equivalente)
    const isPlaylistNotFound =
      errorMessage.includes("cannot be found") ||
      errorMessage.includes("not found") ||
      errorMessage.includes("404");

    logger.warn("API", "processBatch - CAUGHT ERROR in source processing", {
      userId,
      sourceId: progress.sourceId,
      sourceType: progress.sourceType,
      sourceTitle: progress.sourceTitle,
      errorMessage,
      errorStack,
      errorType: error?.constructor?.name,
      isQuotaExceeded,
      isStorageLimitExceeded,
      isPlaylistNotFound,
      isUnknownError: !isQuotaExceeded && !isStorageLimitExceeded && !isPlaylistNotFound,
    });

    if (isStorageLimitExceeded) {
      logger.error("API", "processBatch - Database storage limit exceeded (Neon 512MB), stopping export", undefined, {
        userId,
        sourceId: progress.sourceId,
        error: errorMessage,
      });

      const currentQuota = await getQuotaStatus(userId);
      return {
        sourceId: "",
        sourceTitle: null,
        sourceType: "",
        videosImported: 0,
        hasMore: false,
        quotaUsedToday: currentQuota.consumedUnits,
        quotaCeiling: QUOTA_CEILING,
        shouldStop: true,
        exportComplete: false,
        storageLimitExceeded: true,
      };
    }

    if (isQuotaExceeded) {
      logger.warn("API", "processBatch - YouTube quota exceeded, stopping export", {
        userId,
        sourceId: progress.sourceId,
        error: errorMessage,
      });

      const currentQuota = await getQuotaStatus(userId);
      return {
        sourceId: "",
        sourceTitle: null,
        sourceType: "",
        videosImported: 0,
        hasMore: false,
        quotaUsedToday: currentQuota.consumedUnits,
        quotaCeiling: QUOTA_CEILING,
        shouldStop: true,
        exportComplete: false,
      };
    }

    if (isPlaylistNotFound) {
      logger.warn("API", "processBatch - playlist not found, skipping source", {
        userId,
        sourceId: progress.sourceId,
        sourceTitle: progress.sourceTitle,
        sourceType: progress.sourceType,
        error: errorMessage,
      });

      // Marcar como completed para pular para a próxima fonte
      try {
        await prisma.exportProgress.update({
          where: { id: progress.id },
          data: {
            status: "completed",
            lastImportedAt: new Date(),
          },
        });
        logger.info("API", "processBatch - Marked skipped source as completed", {
          userId,
          sourceId: progress.sourceId,
        });
      } catch (skipUpdateError) {
        logger.error(
          "API",
          "processBatch - FAILED to mark skipped source as completed",
          skipUpdateError instanceof Error ? skipUpdateError : undefined,
          { userId, sourceId: progress.sourceId }
        );
        throw skipUpdateError;
      }

      // Buscar próxima fonte para processar
      logger.info("API", "processBatch - Finding next source after skip", { userId });
      const nextProgress = await prisma.exportProgress.findFirst({
        where: {
          userId,
          status: { in: ["in_progress", "pending"] },
        },
        orderBy: [{ sourceType: "desc" }, { status: "asc" }, { createdAt: "asc" }],
      });

      logger.info("API", "processBatch - Next source after skip", {
        userId,
        found: !!nextProgress,
        nextSourceId: nextProgress?.sourceId || "none",
        nextSourceType: nextProgress?.sourceType || "none",
      });

      // Se não há próxima fonte, exportação está completa
      if (!nextProgress) {
        const quotaStatus2 = await getQuotaStatus(userId);
        logger.info("API", "processBatch - all sources completed after skipping", {
          userId,
          skippedSource: progress.sourceId,
        });
        return {
          sourceId: "",
          sourceTitle: null,
          sourceType: "",
          videosImported: 0,
          hasMore: false,
          quotaUsedToday: quotaStatus2.consumedUnits,
          quotaCeiling: QUOTA_CEILING,
          shouldStop: false,
          exportComplete: true,
        };
      }

      // Processar a próxima fonte sem recursão
      logger.info("API", "processBatch - processing next source after skip", {
        userId,
        nextSourceId: nextProgress.sourceId,
        nextSourceTitle: nextProgress.sourceTitle,
        nextLastPageToken: nextProgress.lastPageToken || "initial",
      });

      try {
        const page = await youtubeService.getPlaylistItemsPage(
          nextProgress.sourceId,
          nextProgress.lastPageToken || undefined
        );

        logger.info("API", "processBatch - next source page fetched", {
          userId,
          nextSourceId: nextProgress.sourceId,
          videosCount: page.videos.length,
          hasNextPage: !!page.nextPageToken,
        });

        let videosImported = 0;
        if (page.videos.length > 0) {
          const result = await prisma.exportedVideo.createMany({
            data: page.videos.map((v) => ({
              userId,
              videoId: v.videoId,
              title: v.title,
              channelId: v.channelId || null,
              channelTitle: v.channelTitle || null,
              language: v.language || null,
              sourceType: nextProgress.sourceType,
              sourceId: nextProgress.sourceId,
              sourceTitle: nextProgress.sourceTitle,
              publishedAt: v.publishedAt || null,
              thumbnailUrl: v.thumbnailUrl || null,
            })),
            skipDuplicates: true,
          });
          videosImported = result.count;
        }

        const isCompleted = !page.nextPageToken;
        await prisma.exportProgress.update({
          where: { id: nextProgress.id },
          data: {
            lastPageToken: page.nextPageToken,
            importedItems: { increment: page.videos.length },
            totalItems: page.totalResults || nextProgress.totalItems,
            lastImportedAt: new Date(),
            status: isCompleted ? "completed" : "in_progress",
          },
        });

        const updatedQuota = await getQuotaStatus(userId);

        logger.info("API", "processBatch - next source processed successfully after skip", {
          userId,
          nextSourceId: nextProgress.sourceId,
          videosImported,
          hasMore: !isCompleted,
        });

        return {
          sourceId: nextProgress.sourceId,
          sourceTitle: nextProgress.sourceTitle,
          sourceType: nextProgress.sourceType,
          videosImported,
          hasMore: !isCompleted,
          quotaUsedToday: updatedQuota.consumedUnits,
          quotaCeiling: QUOTA_CEILING,
          shouldStop: updatedQuota.consumedUnits >= QUOTA_CEILING,
          exportComplete: false,
        };
      } catch (nextError) {
        const nextErrorMessage = nextError instanceof Error ? nextError.message : String(nextError);
        const isNextStorageLimitExceeded =
          nextErrorMessage.includes("53100") ||
          nextErrorMessage.includes("max_cluster_size") ||
          nextErrorMessage.includes("could not extend file") ||
          nextErrorMessage.includes("project size limit");

        if (isNextStorageLimitExceeded) {
          logger.error(
            "API",
            "processBatch - Database storage limit exceeded while processing next source",
            nextError instanceof Error ? nextError : undefined,
            {
              userId,
              sourceId: nextProgress.sourceId,
            }
          );

          const quotaStatus3 = await getQuotaStatus(userId);
          return {
            sourceId: "",
            sourceTitle: null,
            sourceType: "",
            videosImported: 0,
            hasMore: false,
            quotaUsedToday: quotaStatus3.consumedUnits,
            quotaCeiling: QUOTA_CEILING,
            shouldStop: true,
            exportComplete: false,
            storageLimitExceeded: true,
          };
        }

        logger.error(
          "API",
          "processBatch - error processing next source after skip",
          nextError instanceof Error ? nextError : undefined,
          {
            userId,
            sourceId: nextProgress.sourceId,
            errorType: nextError?.constructor?.name,
            errorString: String(nextError),
            errorStack: nextError instanceof Error ? nextError.stack : undefined,
          }
        );

        // If the next source also fails, return empty result and let the client try again
        const quotaStatus3 = await getQuotaStatus(userId);
        return {
          sourceId: "",
          sourceTitle: null,
          sourceType: "",
          videosImported: 0,
          hasMore: false,
          quotaUsedToday: quotaStatus3.consumedUnits,
          quotaCeiling: QUOTA_CEILING,
          shouldStop: false,
          exportComplete: false,
        };
      }
    }

    // Se não é erro de quota ou playlist não encontrada, lançar o erro
    logger.error(
      "API",
      "processBatch FAILED - UNKNOWN ERROR TYPE - rethrowing",
      error instanceof Error ? error : undefined,
      {
        userId,
        sourceId: progress.sourceId,
        sourceType: progress.sourceType,
        sourceTitle: progress.sourceTitle,
        errorMessage,
        errorStack,
        errorType: error?.constructor?.name,
        errorKeys: error && typeof error === "object" ? Object.keys(error) : [],
      }
    );
    throw error;
  }
}

export async function getExportStatus(
  userId: string
): Promise<ExportStatusResult> {
  logger.debug("API", "getExportStatus", { userId });

  const [
    totalSources,
    completedSources,
    inProgressSources,
    pendingSources,
    totalVideosImported,
    englishVideosCount,
    lastImport,
  ] = await Promise.all([
    prisma.exportProgress.count({ where: { userId } }),
    prisma.exportProgress.count({ where: { userId, status: "completed" } }),
    prisma.exportProgress.count({ where: { userId, status: "in_progress" } }),
    prisma.exportProgress.count({ where: { userId, status: "pending" } }),
    prisma.exportedVideo.count({ where: { userId } }),
    prisma.exportedVideo.count({
      where: { userId, language: { startsWith: "en" } },
    }),
    prisma.exportProgress.findFirst({
      where: { userId, lastImportedAt: { not: null } },
      orderBy: { lastImportedAt: "desc" },
      select: { lastImportedAt: true },
    }),
  ]);

  let quotaUsedToday = 0;
  try {
    const quotaStatus = await getQuotaStatus(userId);
    quotaUsedToday = quotaStatus.consumedUnits;
  } catch {
    // Quota fetch pode falhar se não há registro para hoje
  }

  return {
    totalSources,
    completedSources,
    inProgressSources,
    pendingSources,
    totalVideosImported,
    englishVideosCount,
    quotaUsedToday,
    quotaCeiling: QUOTA_CEILING,
    lastImportedAt: lastImport?.lastImportedAt?.toISOString() || null,
    hasIncompleteWork: inProgressSources > 0 || pendingSources > 0,
  };
}

export async function getExportedVideos(
  userId: string,
  options: { language?: string; page?: number; limit?: number }
): Promise<{
  videos: ExportedVideoRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const page = options.page || 1;
  const limit = Math.min(options.limit || 100, 100000);

  const where: {
    userId: string;
    language?: { startsWith: string };
  } = { userId };

  if (options.language) {
    where.language = { startsWith: options.language };
  }

  const [videos, total] = await Promise.all([
    prisma.exportedVideo.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        videoId: true,
        title: true,
        channelId: true,
        channelTitle: true,
        language: true,
        sourceType: true,
        sourceId: true,
        sourceTitle: true,
        publishedAt: true,
        thumbnailUrl: true,
      },
    }),
    prisma.exportedVideo.count({ where }),
  ]);

  return {
    videos,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
