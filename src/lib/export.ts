import { prisma } from "@/lib/prisma";
import { YouTubeService } from "@/lib/youtube";
import type {
  ExportStatusResult,
  ExportBatchResult,
  ExportInitResult,
} from "@/types/export";

export async function getExportStatus(
  userId: string
): Promise<ExportStatusResult> {
  const [progress, videos] = await Promise.all([
    prisma.exportProgress.findMany({ where: { userId } }),
    prisma.exportedVideo.findMany({ where: { userId } }),
  ]);

  const completed = progress.filter((p) => p.status === "completed").length;
  const inProgress = progress.filter((p) => p.status === "in_progress").length;
  const pending = progress.filter((p) => p.status === "pending").length;

  const englishVideos = videos.filter((v) => v.language === "en");
  const lastImport = progress
    .filter((p) => p.lastImportedAt)
    .sort((a, b) => {
      const dateA = a.lastImportedAt?.getTime() || 0;
      const dateB = b.lastImportedAt?.getTime() || 0;
      return dateB - dateA;
    })[0]?.lastImportedAt;

  return {
    totalSources: progress.length,
    completedSources: completed,
    inProgressSources: inProgress,
    pendingSources: pending,
    totalVideosImported: videos.length,
    englishVideosCount: englishVideos.length,
    quotaUsedToday: 0,
    quotaCeiling: 10000,
    lastImportedAt: lastImport?.toISOString() || null,
    hasIncompleteWork: pending > 0 || inProgress > 0,
  };
}

export async function initializeExport(
  userId: string,
  accessToken: string
): Promise<ExportInitResult> {
  const youtubeService = new YouTubeService(accessToken, userId);

  try {
    const playlists = await youtubeService.getPlaylists(accessToken);
    const playlistCount = playlists.length;

    const channels = await youtubeService.getSubscribedChannels(accessToken);
    const channelCount = channels.length;

    const totalSources = playlistCount + channelCount;

    await prisma.exportProgress.deleteMany({ where: { userId } });

    for (const playlist of playlists) {
      await prisma.exportProgress.create({
        data: {
          userId,
          sourceType: "playlist",
          sourceId: playlist.id,
          sourceTitle: playlist.snippet.title,
          status: "pending",
        },
      });
    }

    for (const channel of channels) {
      await prisma.exportProgress.create({
        data: {
          userId,
          sourceType: "channel",
          sourceId: channel.id,
          sourceTitle: channel.snippet.title,
          status: "pending",
        },
      });
    }

    const completed = await prisma.exportProgress.count({
      where: { userId, status: "completed" },
    });

    return {
      playlistSources: playlistCount,
      channelSources: channelCount,
      totalSources,
      alreadyCompleted: completed,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to initialize export"
    );
  }
}

export async function processBatch(
  userId: string,
  accessToken: string
): Promise<ExportBatchResult> {
  const source = await prisma.exportProgress.findFirst({
    where: {
      userId,
      status: { in: ["pending", "in_progress"] },
    },
  });

  if (!source) {
    const anyPending = await prisma.exportProgress.findFirst({
      where: { userId, status: { not: "completed" } },
    });

    return {
      sourceId: "",
      sourceTitle: null,
      sourceType: "",
      videosImported: 0,
      hasMore: false,
      quotaUsedToday: 0,
      quotaCeiling: 10000,
      shouldStop: false,
      exportComplete: !anyPending,
    };
  }

  await prisma.exportProgress.update({
    where: { id: source.id },
    data: { status: "in_progress" },
  });

  const youtubeService = new YouTubeService(accessToken, userId);
  let videosImported = 0;

  try {
    if (source.sourceType === "playlist") {
      const videos = await youtubeService.getPlaylistItems(
        source.sourceId
      );

      for (const video of videos) {
        const language = detectLanguage(video.title, video.description || "");

        await prisma.exportedVideo.upsert({
          where: {
            userId_videoId_sourceType_sourceId: {
              userId,
              videoId: video.videoId,
              sourceType: "playlist",
              sourceId: source.sourceId,
            },
          },
          create: {
            userId,
            videoId: video.videoId,
            title: video.title,
            channelId: video.channelId,
            channelTitle: video.channelTitle,
            language,
            sourceType: "playlist",
            sourceId: source.sourceId,
            sourceTitle: source.sourceTitle,
            publishedAt: video.publishedAt,
            thumbnailUrl: video.thumbnailUrl,
          },
          update: {
            language,
            publishedAt: video.publishedAt,
            thumbnailUrl: video.thumbnailUrl,
          },
        });

        videosImported++;
      }

      await prisma.exportProgress.update({
        where: { id: source.id },
        data: { status: "completed", lastImportedAt: new Date() },
      });
    } else if (source.sourceType === "channel") {
      const videos = await youtubeService.getChannelVideos(
        source.sourceId
      );

      for (const video of videos) {
        const language = detectLanguage(video.title, video.description || "");

        await prisma.exportedVideo.upsert({
          where: {
            userId_videoId_sourceType_sourceId: {
              userId,
              videoId: video.videoId,
              sourceType: "channel",
              sourceId: source.sourceId,
            },
          },
          create: {
            userId,
            videoId: video.videoId,
            title: video.title,
            channelId: source.sourceId,
            channelTitle: source.sourceTitle,
            language,
            sourceType: "channel",
            sourceId: source.sourceId,
            sourceTitle: source.sourceTitle,
            publishedAt: video.publishedAt,
            thumbnailUrl: video.thumbnailUrl,
          },
          update: {
            language,
            publishedAt: video.publishedAt,
            thumbnailUrl: video.thumbnailUrl,
          },
        });

        videosImported++;
      }

      await prisma.exportProgress.update({
        where: { id: source.id },
        data: { status: "completed", lastImportedAt: new Date() },
      });
    }
  } catch (error) {
    await prisma.exportProgress.update({
      where: { id: source.id },
      data: { status: "error" },
    });
    throw error;
  }

  const status = await getExportStatus(userId);

  return {
    sourceId: source.sourceId,
    sourceTitle: source.sourceTitle,
    sourceType: source.sourceType,
    videosImported,
    hasMore: false,
    quotaUsedToday: status.quotaUsedToday,
    quotaCeiling: status.quotaCeiling,
    shouldStop: status.quotaUsedToday >= status.quotaCeiling,
    exportComplete: status.pendingSources === 0 && status.inProgressSources === 0,
  };
}

function detectLanguage(title: string, description: string): string {
  const text = (title + " " + description).toLowerCase();

  const englishPatterns = [
    /\b(the|a|an|and|or|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|should|could|may|might|must|can)\b/g,
  ];

  let englishScore = 0;
  for (const pattern of englishPatterns) {
    const matches = text.match(pattern) || [];
    englishScore += matches.length;
  }

  const nonLatinChars = (text.match(/[^\x00-\x7F]/g) || []).length;
  const totalChars = text.length;

  if (nonLatinChars / totalChars > 0.3) {
    return "other";
  }

  if (englishScore > 5) {
    return "en";
  }

  return "other";
}

export async function getExportedVideos(
  userId: string,
  language?: string,
  limit: number = 100,
  offset: number = 0
) {
  const where = language ? { userId, language } : { userId };

  const [videos, total] = await Promise.all([
    prisma.exportedVideo.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.exportedVideo.count({ where }),
  ]);

  return {
    videos: videos.map((v) => ({
      ...v,
      publishedAt: v.publishedAt || null,
      channelId: v.channelId || null,
      channelTitle: v.channelTitle || null,
      language: v.language || null,
      sourceTitle: v.sourceTitle || null,
      thumbnailUrl: v.thumbnailUrl || null,
    })),
    total,
    page: Math.floor(offset / limit) + 1,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
