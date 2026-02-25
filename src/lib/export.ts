import { prisma } from "./prisma";
import { YouTubeService } from "./youtube";
import { getQuotaStatus } from "./quota";
import { logger } from "./logger";
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

  // Verificar quota
  const quotaStatus = await getQuotaStatus(userId);

  // Require 2 quota units per batch (playlistItems.list: 1, videos.list: 1)
  const requiredQuota = 2;
  const remainingQuota = quotaStatus.dailyLimit - quotaStatus.consumedUnits;

  if (quotaStatus.consumedUnits >= QUOTA_CEILING || remainingQuota < requiredQuota) {
    logger.info("API", "processBatch - quota insufficient", {
      userId,
      consumed: quotaStatus.consumedUnits,
      remaining: remainingQuota,
      required: requiredQuota,
      ceiling: QUOTA_CEILING,
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

  // Buscar próxima fonte incompleta - playlists primeiro (sourceType "playlist" < "channel" em ordem alfabética)
  // Dentro do mesmo tipo, in_progress primeiro, depois pending
  const progress = await prisma.exportProgress.findFirst({
    where: {
      userId,
      status: { in: ["in_progress", "pending"] },
    },
    orderBy: [{ sourceType: "desc" }, { status: "asc" }, { createdAt: "asc" }],
  });

  if (!progress) {
    logger.info("API", "processBatch - all sources completed", { userId });
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

  // Marcar como in_progress se era pending
  if (progress.status === "pending") {
    await prisma.exportProgress.update({
      where: { id: progress.id },
      data: { status: "in_progress" },
    });
  }

  logger.info("API", "processBatch - processing source", {
    userId,
    sourceType: progress.sourceType,
    sourceId: progress.sourceId,
    sourceTitle: progress.sourceTitle,
    lastPageToken: progress.lastPageToken || "initial",
  });

  try {
    // Buscar uma página de vídeos
    const page = await youtubeService.getPlaylistItemsPage(
      progress.sourceId,
      progress.lastPageToken || undefined
    );

    // Salvar vídeos no banco
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
          sourceType: progress.sourceType,
          sourceId: progress.sourceId,
          sourceTitle: progress.sourceTitle,
          publishedAt: v.publishedAt || null,
          thumbnailUrl: v.thumbnailUrl || null,
        })),
        skipDuplicates: true,
      });
      videosImported = result.count;
    }

    // Atualizar progresso
    const isCompleted = !page.nextPageToken;
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

    // Re-verificar quota após as chamadas
    const updatedQuota = await getQuotaStatus(userId);

    logger.info("API", "processBatch END", {
      userId,
      sourceId: progress.sourceId,
      videosImported,
      hasMore: !isCompleted,
      quotaUsed: updatedQuota.consumedUnits,
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
    const isQuotaExceeded =
      errorMessage.includes("quota") ||
      errorMessage.includes("quotaExceeded") ||
      errorMessage.includes("ERR_403");

    // Verificar se é erro de playlist não encontrada (404 equivalente)
    const isPlaylistNotFound =
      errorMessage.includes("cannot be found") ||
      errorMessage.includes("not found") ||
      errorMessage.includes("404");

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
      await prisma.exportProgress.update({
        where: { id: progress.id },
        data: {
          status: "completed",
          lastImportedAt: new Date(),
        },
      });

      // Buscar próxima fonte para processar
      const nextProgress = await prisma.exportProgress.findFirst({
        where: {
          userId,
          status: { in: ["in_progress", "pending"] },
        },
        orderBy: [{ sourceType: "desc" }, { status: "asc" }, { createdAt: "asc" }],
      });

      // Se não há próxima fonte, exportação está completa
      if (!nextProgress) {
        const quotaStatus = await getQuotaStatus(userId);
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
          quotaUsedToday: quotaStatus.consumedUnits,
          quotaCeiling: QUOTA_CEILING,
          shouldStop: false,
          exportComplete: true,
        };
      }

      // Recursivamente processar a próxima fonte
      return processBatch(userId, youtubeService);
    }

    // Se não é erro de quota ou playlist não encontrada, lançar o erro
    logger.error(
      "API",
      "processBatch FAILED",
      error instanceof Error ? error : undefined,
      {
        userId,
        sourceId: progress.sourceId,
        sourceType: progress.sourceType,
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
