import { google, youtube_v3 } from "googleapis";
import { trackQuotaUsage } from "./quota";
import { Playlist, Channel, Video } from "@/types";
import { parseDuration } from "./utils";
import { logger } from "./logger";

export class YouTubeService {
  private youtube: youtube_v3.Youtube;
  private userId: string;
  private accessTokenPreview: string;
  private instanceId: string;

  constructor(accessToken: string, userId: string) {
    this.instanceId = `yt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    logger.info("YOUTUBE_API", "YouTubeService constructor START", {
      instanceId: this.instanceId,
      userId,
      accessTokenLength: accessToken?.length ?? 0,
      accessTokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : "EMPTY/NULL",
      accessTokenType: typeof accessToken,
      hasAccessToken: !!accessToken,
    });

    if (!accessToken) {
      logger.error("YOUTUBE_API", "YouTubeService constructor called with EMPTY/NULL access token!", undefined, {
        instanceId: this.instanceId,
        userId,
        accessTokenValue: String(accessToken),
      });
    }

    try {
      const oauth2Client = new google.auth.OAuth2();
      logger.debug("YOUTUBE_API", "OAuth2 client created for YouTubeService", {
        instanceId: this.instanceId,
      });

      oauth2Client.setCredentials({ access_token: accessToken });
      logger.debug("YOUTUBE_API", "OAuth2 credentials set on client", {
        instanceId: this.instanceId,
      });

      this.youtube = google.youtube({ version: "v3", auth: oauth2Client });
      logger.info("YOUTUBE_API", "YouTube API v3 client initialized successfully", {
        instanceId: this.instanceId,
        userId,
      });
    } catch (error) {
      logger.error("YOUTUBE_API", "YouTubeService constructor FAILED to initialize API client", error instanceof Error ? error : undefined, {
        instanceId: this.instanceId,
        userId,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorName: error instanceof Error ? error.name : "unknown",
      });
      throw error;
    }

    this.userId = userId;
    this.accessTokenPreview = accessToken ? `${accessToken.substring(0, 20)}...` : "EMPTY";

    logger.info("YOUTUBE_API", "YouTubeService constructor END - instance ready", {
      instanceId: this.instanceId,
      userId,
      accessTokenPreview: this.accessTokenPreview,
    });
  }

  // Listar playlists do usuário
  async getPlaylists(): Promise<Playlist[]> {
    logger.info("YOUTUBE_API", "getPlaylists START", {
      instanceId: this.instanceId,
      userId: this.userId,
      accessTokenPreview: this.accessTokenPreview,
    });

    const playlists: Playlist[] = [];
    let pageToken: string | undefined;
    let pageCount = 0;

    try {
      do {
        pageCount++;
        const startTime = Date.now();

        logger.info("YOUTUBE_API", `getPlaylists - Fetching page ${pageCount}`, {
          instanceId: this.instanceId,
          pageToken: pageToken || "initial",
          playlistsSoFar: playlists.length,
        });

        const response = await this.youtube.playlists.list({
          part: ["snippet", "contentDetails"],
          mine: true,
          maxResults: 50,
          pageToken,
        });

        const elapsed = Date.now() - startTime;

        await trackQuotaUsage(this.userId, "playlists.list");

        logger.youtubeApi(`playlists.list page ${pageCount}`, true, {
          instanceId: this.instanceId,
          elapsed: `${elapsed}ms`,
          itemsCount: response.data.items?.length || 0,
          hasNextPage: !!response.data.nextPageToken,
          totalResults: response.data.pageInfo?.totalResults,
          responseStatus: response.status,
          responseStatusText: response.statusText,
        });

        for (const item of response.data.items || []) {
          playlists.push({
            id: item.id!,
            title: item.snippet?.title || "",
            description: item.snippet?.description || "",
            itemCount: item.contentDetails?.itemCount || 0,
            createdDate: item.snippet?.publishedAt || "",
            thumbnailUrl: item.snippet?.thumbnails?.medium?.url ?? undefined,
          });
        }

        pageToken = response.data.nextPageToken || undefined;
      } while (pageToken);

      logger.youtubeApi("getPlaylists END - completed successfully", true, {
        instanceId: this.instanceId,
        totalPlaylists: playlists.length,
        pagesLoaded: pageCount,
        playlistIds: playlists.map(p => p.id).slice(0, 10),
        playlistTitles: playlists.map(p => p.title).slice(0, 10),
      });

      return playlists;
    } catch (error) {
      const gaxiosError = error as { code?: number; response?: { status?: number; statusText?: string; data?: unknown; headers?: unknown } };
      logger.youtubeApi(
        "getPlaylists FAILED",
        false,
        {
          instanceId: this.instanceId,
          userId: this.userId,
          accessTokenPreview: this.accessTokenPreview,
          pagesLoadedBeforeError: pageCount,
          playlistsLoadedBeforeError: playlists.length,
          errorCode: gaxiosError?.code,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorName: error instanceof Error ? error.name : "unknown",
          httpStatus: gaxiosError?.response?.status,
          httpStatusText: gaxiosError?.response?.statusText,
          responseData: gaxiosError?.response?.data ? JSON.stringify(gaxiosError.response.data).substring(0, 500) : undefined,
        },
        error instanceof Error ? error : undefined
      );
      throw error;
    }
  }

  // Listar vídeos de uma playlist
  async getPlaylistItems(playlistId: string): Promise<Video[]> {
    logger.info("YOUTUBE_API", "getPlaylistItems START", {
      instanceId: this.instanceId,
      playlistId,
      userId: this.userId,
      accessTokenPreview: this.accessTokenPreview,
    });

    const items: Video[] = [];
    const videoIds: string[] = [];
    let pageToken: string | undefined;
    let pageCount = 0;

    try {
      // 1. Buscar IDs dos vídeos
      do {
        pageCount++;
        const startTime = Date.now();

        logger.debug("YOUTUBE_API", `getPlaylistItems - Fetching items page ${pageCount}`, {
          instanceId: this.instanceId,
          playlistId,
          pageToken: pageToken || "initial",
          itemsSoFar: items.length,
        });

        const response = await this.youtube.playlistItems.list({
          part: ["snippet", "contentDetails"],
          playlistId,
          maxResults: 50,
          pageToken,
        });

        const elapsed = Date.now() - startTime;
        await trackQuotaUsage(this.userId, "playlistItems.list");

        logger.youtubeApi(`playlistItems.list page ${pageCount}`, true, {
          instanceId: this.instanceId,
          playlistId,
          elapsed: `${elapsed}ms`,
          itemsCount: response.data.items?.length || 0,
          hasNextPage: !!response.data.nextPageToken,
          totalResults: response.data.pageInfo?.totalResults,
          responseStatus: response.status,
        });

        for (const item of response.data.items || []) {
          const videoId = item.contentDetails?.videoId || "";
          if (videoId) {
            items.push({
              id: item.id!,
              videoId,
              title: item.snippet?.title || "",
              description: item.snippet?.description || undefined,
              channelId: item.snippet?.videoOwnerChannelId || undefined,
              channelTitle: item.snippet?.videoOwnerChannelTitle || "",
              thumbnailUrl: item.snippet?.thumbnails?.medium?.url || "",
              addedToPlaylistAt: item.snippet?.publishedAt || undefined,
              duration: "",
              durationInSeconds: 0,
              viewCount: 0,
              language: "",
              publishedAt: "",
              isSelected: false,
            });
            videoIds.push(videoId);
          }
        }

        pageToken = response.data.nextPageToken || undefined;
      } while (pageToken);

      logger.info("YOUTUBE_API", "getPlaylistItems - Items fetched, now fetching video details", {
        instanceId: this.instanceId,
        playlistId,
        totalItems: items.length,
        pagesLoaded: pageCount,
        totalVideoIds: videoIds.length,
      });

      // 2. Buscar metadados completos em batches de 50
      const totalBatches = Math.ceil(videoIds.length / 50);
      for (let i = 0; i < videoIds.length; i += 50) {
        const batchNum = Math.floor(i / 50) + 1;
        const batch = videoIds.slice(i, i + 50);
        const startTime = Date.now();

        logger.debug("YOUTUBE_API", `getPlaylistItems - Fetching video details batch ${batchNum}/${totalBatches}`, {
          instanceId: this.instanceId,
          batchSize: batch.length,
        });

        try {
          const response = await this.youtube.videos.list({
            part: ["snippet", "contentDetails", "statistics"],
            id: batch,
          });

          const elapsed = Date.now() - startTime;
          await trackQuotaUsage(this.userId, "videos.list");

          logger.youtubeApi(`videos.list batch ${batchNum}/${totalBatches}`, true, {
            instanceId: this.instanceId,
            elapsed: `${elapsed}ms`,
            batchSize: batch.length,
            returnedCount: response.data.items?.length || 0,
            responseStatus: response.status,
          });

          for (const video of response.data.items || []) {
            const item = items.find((i) => i.videoId === video.id);
            if (item) {
              item.duration = video.contentDetails?.duration || "";
              item.durationInSeconds = parseDuration(
                video.contentDetails?.duration || ""
              );
              item.viewCount = parseInt(video.statistics?.viewCount || "0");
              item.language = video.snippet?.defaultAudioLanguage || "";
              item.publishedAt = video.snippet?.publishedAt || "";
            }
          }
        } catch (error) {
          const gaxiosError = error as { code?: number; response?: { status?: number; data?: unknown } };
          logger.youtubeApi(
            `videos.list batch ${batchNum}/${totalBatches} FAILED`,
            false,
            {
              instanceId: this.instanceId,
              batchSize: batch.length,
              httpStatus: gaxiosError?.response?.status,
              errorCode: gaxiosError?.code,
              errorMessage: error instanceof Error ? error.message : String(error),
            },
            error instanceof Error ? error : undefined
          );
        }
      }

      logger.youtubeApi("getPlaylistItems END - completed successfully", true, {
        instanceId: this.instanceId,
        playlistId,
        totalItems: items.length,
        totalBatches,
      });

      return items;
    } catch (error) {
      const gaxiosError = error as { code?: number; response?: { status?: number; statusText?: string; data?: unknown } };
      logger.youtubeApi(
        "getPlaylistItems FAILED",
        false,
        {
          instanceId: this.instanceId,
          playlistId,
          accessTokenPreview: this.accessTokenPreview,
          pagesLoadedBeforeError: pageCount,
          itemsLoadedBeforeError: items.length,
          errorCode: gaxiosError?.code,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorName: error instanceof Error ? error.name : "unknown",
          httpStatus: gaxiosError?.response?.status,
          httpStatusText: gaxiosError?.response?.statusText,
          responseData: gaxiosError?.response?.data ? JSON.stringify(gaxiosError.response.data).substring(0, 500) : undefined,
        },
        error instanceof Error ? error : undefined
      );
      throw error;
    }
  }

  // Adicionar vídeo a uma playlist
  async addVideoToPlaylist(
    playlistId: string,
    videoId: string
  ): Promise<{ success: boolean; error?: string }> {
    logger.info("YOUTUBE_API", "addVideoToPlaylist START", {
      instanceId: this.instanceId,
      playlistId,
      videoId,
      userId: this.userId,
    });

    try {
      const startTime = Date.now();

      await this.youtube.playlistItems.insert({
        part: ["snippet"],
        requestBody: {
          snippet: {
            playlistId,
            resourceId: {
              kind: "youtube#video",
              videoId,
            },
          },
        },
      });

      const elapsed = Date.now() - startTime;
      await trackQuotaUsage(this.userId, "playlistItems.insert");

      logger.youtubeApi("playlistItems.insert SUCCESS", true, {
        instanceId: this.instanceId,
        playlistId,
        videoId,
        elapsed: `${elapsed}ms`,
      });

      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      const isDuplicate =
        errorMessage.includes("videoAlreadyInPlaylist") ||
        errorMessage.includes("duplicate");
      const gaxiosError = error as { code?: number; response?: { status?: number; data?: unknown } };

      logger.youtubeApi(
        "playlistItems.insert FAILED",
        false,
        {
          instanceId: this.instanceId,
          playlistId,
          videoId,
          isDuplicate,
          errorMessage,
          errorCode: gaxiosError?.code,
          httpStatus: gaxiosError?.response?.status,
          responseData: gaxiosError?.response?.data ? JSON.stringify(gaxiosError.response.data).substring(0, 500) : undefined,
        },
        error instanceof Error ? error : undefined
      );

      if (isDuplicate) {
        return { success: false, error: "Vídeo já existe na playlist de destino" };
      }
      return { success: false, error: errorMessage };
    }
  }

  // Remover vídeo de uma playlist
  async removeVideoFromPlaylist(
    playlistItemId: string
  ): Promise<{ success: boolean; error?: string }> {
    logger.info("YOUTUBE_API", "removeVideoFromPlaylist START", {
      instanceId: this.instanceId,
      playlistItemId,
      userId: this.userId,
    });

    try {
      const startTime = Date.now();

      await this.youtube.playlistItems.delete({
        id: playlistItemId,
      });

      const elapsed = Date.now() - startTime;
      await trackQuotaUsage(this.userId, "playlistItems.delete");

      logger.youtubeApi("playlistItems.delete SUCCESS", true, {
        instanceId: this.instanceId,
        playlistItemId,
        elapsed: `${elapsed}ms`,
      });

      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      const gaxiosError = error as { code?: number; response?: { status?: number; data?: unknown } };

      logger.youtubeApi(
        "playlistItems.delete FAILED",
        false,
        {
          instanceId: this.instanceId,
          playlistItemId,
          errorMessage,
          errorCode: gaxiosError?.code,
          httpStatus: gaxiosError?.response?.status,
          responseData: gaxiosError?.response?.data ? JSON.stringify(gaxiosError.response.data).substring(0, 500) : undefined,
        },
        error instanceof Error ? error : undefined
      );

      return { success: false, error: errorMessage };
    }
  }

  // Transferir vídeos entre playlists
  async transferVideos(
    sourcePlaylistId: string,
    destinationPlaylistId: string,
    videos: Array<{ playlistItemId: string; videoId: string }>
  ): Promise<{
    success: boolean;
    transferred: number;
    errors: number;
    details: Array<{
      videoId: string;
      status: "success" | "error";
      error?: string;
    }>;
  }> {
    logger.info("YOUTUBE_API", "transferVideos START", {
      instanceId: this.instanceId,
      sourcePlaylistId,
      destinationPlaylistId,
      videosCount: videos.length,
      userId: this.userId,
      videoIds: videos.map(v => v.videoId),
    });

    const details: Array<{
      videoId: string;
      status: "success" | "error";
      error?: string;
    }> = [];
    let transferred = 0;
    let errors = 0;
    const overallStartTime = Date.now();

    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      logger.info("YOUTUBE_API", `transferVideos - Processing video ${i + 1}/${videos.length}`, {
        instanceId: this.instanceId,
        videoId: video.videoId,
        playlistItemId: video.playlistItemId,
        transferredSoFar: transferred,
        errorsSoFar: errors,
      });

      try {
        // 1. Adicionar ao destino
        const addResult = await this.addVideoToPlaylist(
          destinationPlaylistId,
          video.videoId
        );

        if (addResult.success) {
          // 2. Remover da origem
          const removeResult = await this.removeVideoFromPlaylist(
            video.playlistItemId
          );

          if (removeResult.success) {
            transferred++;
            details.push({ videoId: video.videoId, status: "success" });
            logger.debug("YOUTUBE_API", `transferVideos - Video ${i + 1} transferred successfully`, {
              instanceId: this.instanceId,
              videoId: video.videoId,
            });
          } else {
            errors++;
            details.push({
              videoId: video.videoId,
              status: "error",
              error: removeResult.error || "Erro ao remover da playlist de origem",
            });
            logger.warn("YOUTUBE_API", `transferVideos - Video ${i + 1} added but failed to remove from source`, {
              instanceId: this.instanceId,
              videoId: video.videoId,
              removeError: removeResult.error,
            });
          }
        } else {
          errors++;
          details.push({
            videoId: video.videoId,
            status: "error",
            error: addResult.error || "Erro ao adicionar à playlist de destino",
          });
          logger.warn("YOUTUBE_API", `transferVideos - Video ${i + 1} failed to add to destination`, {
            instanceId: this.instanceId,
            videoId: video.videoId,
            addError: addResult.error,
          });
        }
      } catch (error) {
        errors++;
        details.push({
          videoId: video.videoId,
          status: "error",
          error: error instanceof Error ? error.message : "Erro desconhecido",
        });
        logger.error("YOUTUBE_API", `transferVideos - Video ${i + 1} threw exception`, error instanceof Error ? error : undefined, {
          instanceId: this.instanceId,
          videoId: video.videoId,
        });
      }
    }

    const totalElapsed = Date.now() - overallStartTime;

    logger.youtubeApi("transferVideos END", errors === 0, {
      instanceId: this.instanceId,
      sourcePlaylistId,
      destinationPlaylistId,
      totalVideos: videos.length,
      transferred,
      errors,
      totalElapsed: `${totalElapsed}ms`,
      avgPerVideo: videos.length > 0 ? `${Math.round(totalElapsed / videos.length)}ms` : "N/A",
    });

    return {
      success: errors === 0,
      transferred,
      errors,
      details,
    };
  }

  // Listar canais inscritos
  async getSubscribedChannels(): Promise<Channel[]> {
    logger.info("YOUTUBE_API", "getSubscribedChannels START", {
      instanceId: this.instanceId,
      userId: this.userId,
      accessTokenPreview: this.accessTokenPreview,
    });

    const channels: Channel[] = [];
    const channelIds: string[] = [];
    const seenChannelIds = new Set<string>();
    let pageToken: string | undefined;
    let pageCount = 0;

    try {
      // 1. Buscar inscrições
      do {
        pageCount++;
        const startTime = Date.now();

        logger.debug("YOUTUBE_API", `getSubscribedChannels - Fetching subscriptions page ${pageCount}`, {
          instanceId: this.instanceId,
          pageToken: pageToken || "initial",
          channelsSoFar: channels.length,
        });

        const response = await this.youtube.subscriptions.list({
          part: ["snippet"],
          mine: true,
          maxResults: 50,
          pageToken,
        });

        const elapsed = Date.now() - startTime;
        await trackQuotaUsage(this.userId, "subscriptions.list");

        logger.youtubeApi(`subscriptions.list page ${pageCount}`, true, {
          instanceId: this.instanceId,
          elapsed: `${elapsed}ms`,
          itemsCount: response.data.items?.length || 0,
          hasNextPage: !!response.data.nextPageToken,
          totalResults: response.data.pageInfo?.totalResults,
          responseStatus: response.status,
        });

        for (const item of response.data.items || []) {
          const channelId = item.snippet?.resourceId?.channelId || "";
          if (channelId && !seenChannelIds.has(channelId)) {
            seenChannelIds.add(channelId);
            channelIds.push(channelId);
            channels.push({
              id: channelId,
              title: item.snippet?.title || "",
              description: item.snippet?.description || "",
              thumbnailUrl: item.snippet?.thumbnails?.medium?.url || "",
              subscriberCount: 0,
              videoCount: 0,
              subscribedAt: item.snippet?.publishedAt || undefined,
            });
          }
        }

        pageToken = response.data.nextPageToken || undefined;
      } while (pageToken);

      logger.info("YOUTUBE_API", "getSubscribedChannels - Subscriptions fetched, now fetching channel details", {
        instanceId: this.instanceId,
        totalChannels: channels.length,
        pagesLoaded: pageCount,
        duplicatesFiltered: pageCount * 50 - channels.length,
      });

      // 2. Buscar detalhes dos canais em batches de 50
      const totalBatches = Math.ceil(channelIds.length / 50);
      for (let i = 0; i < channelIds.length; i += 50) {
        const batchNum = Math.floor(i / 50) + 1;
        const batch = channelIds.slice(i, i + 50);
        const startTime = Date.now();

        logger.debug("YOUTUBE_API", `getSubscribedChannels - Fetching channel details batch ${batchNum}/${totalBatches}`, {
          instanceId: this.instanceId,
          batchSize: batch.length,
        });

        try {
          const response = await this.youtube.channels.list({
            part: ["statistics"],
            id: batch,
          });

          const elapsed = Date.now() - startTime;
          await trackQuotaUsage(this.userId, "channels.list");

          logger.youtubeApi(`channels.list batch ${batchNum}/${totalBatches}`, true, {
            instanceId: this.instanceId,
            elapsed: `${elapsed}ms`,
            batchSize: batch.length,
            returnedCount: response.data.items?.length || 0,
            responseStatus: response.status,
          });

          for (const channel of response.data.items || []) {
            const item = channels.find((c) => c.id === channel.id);
            if (item) {
              item.subscriberCount = parseInt(
                channel.statistics?.subscriberCount || "0"
              );
              item.videoCount = parseInt(channel.statistics?.videoCount || "0");
            }
          }
        } catch (error) {
          const gaxiosError = error as { code?: number; response?: { status?: number; data?: unknown } };
          logger.youtubeApi(
            `channels.list batch ${batchNum}/${totalBatches} FAILED`,
            false,
            {
              instanceId: this.instanceId,
              batchSize: batch.length,
              errorCode: gaxiosError?.code,
              httpStatus: gaxiosError?.response?.status,
              errorMessage: error instanceof Error ? error.message : String(error),
            },
            error instanceof Error ? error : undefined
          );
        }
      }

      logger.youtubeApi("getSubscribedChannels END - completed successfully", true, {
        instanceId: this.instanceId,
        totalChannels: channels.length,
        pagesLoaded: pageCount,
        batchesProcessed: totalBatches,
      });

      return channels;
    } catch (error) {
      const gaxiosError = error as { code?: number; response?: { status?: number; statusText?: string; data?: unknown } };
      logger.youtubeApi(
        "getSubscribedChannels FAILED",
        false,
        {
          instanceId: this.instanceId,
          accessTokenPreview: this.accessTokenPreview,
          pagesLoadedBeforeError: pageCount,
          channelsLoadedBeforeError: channels.length,
          errorCode: gaxiosError?.code,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorName: error instanceof Error ? error.name : "unknown",
          httpStatus: gaxiosError?.response?.status,
          httpStatusText: gaxiosError?.response?.statusText,
          responseData: gaxiosError?.response?.data ? JSON.stringify(gaxiosError.response.data).substring(0, 500) : undefined,
        },
        error instanceof Error ? error : undefined
      );
      throw error;
    }
  }

  // Buscar vídeos de um canal (CARO: 100 unidades!)
  async getChannelVideos(channelId: string): Promise<Video[]> {
    logger.info("YOUTUBE_API", "getChannelVideos START (expensive: 100 units)", {
      instanceId: this.instanceId,
      channelId,
      userId: this.userId,
      accessTokenPreview: this.accessTokenPreview,
    });

    try {
      const searchStartTime = Date.now();

      logger.debug("YOUTUBE_API", "getChannelVideos - Calling search.list", {
        instanceId: this.instanceId,
        channelId,
      });

      const response = await this.youtube.search.list({
        part: ["snippet"],
        channelId,
        type: ["video"],
        maxResults: 50,
        order: "date",
      });

      const searchElapsed = Date.now() - searchStartTime;
      await trackQuotaUsage(this.userId, "search.list");

      logger.youtubeApi("search.list (channel videos)", true, {
        instanceId: this.instanceId,
        channelId,
        elapsed: `${searchElapsed}ms`,
        itemsCount: response.data.items?.length || 0,
        totalResults: response.data.pageInfo?.totalResults,
        responseStatus: response.status,
      });

      const videoIds =
        response.data.items?.map((i) => i.id?.videoId || "").filter(Boolean) ||
        [];
      const videos: Video[] = [];

      logger.debug("YOUTUBE_API", "getChannelVideos - Video IDs extracted from search", {
        instanceId: this.instanceId,
        videoIdsCount: videoIds.length,
        videoIds: videoIds.slice(0, 10),
      });

      // Buscar metadados completos
      if (videoIds.length > 0) {
        const detailsStartTime = Date.now();

        logger.debug("YOUTUBE_API", "getChannelVideos - Fetching video details", {
          instanceId: this.instanceId,
          videoIdsCount: videoIds.length,
        });

        const detailsResponse = await this.youtube.videos.list({
          part: ["snippet", "contentDetails", "statistics"],
          id: videoIds,
        });

        const detailsElapsed = Date.now() - detailsStartTime;
        await trackQuotaUsage(this.userId, "videos.list");

        logger.youtubeApi("videos.list (channel video details)", true, {
          instanceId: this.instanceId,
          elapsed: `${detailsElapsed}ms`,
          videoIdsCount: videoIds.length,
          returnedCount: detailsResponse.data.items?.length || 0,
          responseStatus: detailsResponse.status,
        });

        for (const video of detailsResponse.data.items || []) {
          videos.push({
            id: "", // Não há playlistItemId aqui
            videoId: video.id!,
            title: video.snippet?.title || "",
            description: video.snippet?.description || undefined,
            channelId: video.snippet?.channelId || undefined,
            channelTitle: video.snippet?.channelTitle || "",
            duration: video.contentDetails?.duration || "",
            durationInSeconds: parseDuration(
              video.contentDetails?.duration || ""
            ),
            viewCount: parseInt(video.statistics?.viewCount || "0"),
            language: video.snippet?.defaultAudioLanguage || "",
            publishedAt: video.snippet?.publishedAt || "",
            thumbnailUrl: video.snippet?.thumbnails?.medium?.url || "",
            isSelected: false,
          });
        }
      } else {
        logger.warn("YOUTUBE_API", "getChannelVideos - No video IDs found from search", {
          instanceId: this.instanceId,
          channelId,
        });
      }

      logger.youtubeApi("getChannelVideos END - completed successfully", true, {
        instanceId: this.instanceId,
        channelId,
        totalVideos: videos.length,
      });

      return videos;
    } catch (error) {
      const gaxiosError = error as { code?: number; response?: { status?: number; statusText?: string; data?: unknown } };
      logger.youtubeApi(
        "getChannelVideos FAILED",
        false,
        {
          instanceId: this.instanceId,
          channelId,
          accessTokenPreview: this.accessTokenPreview,
          errorCode: gaxiosError?.code,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorName: error instanceof Error ? error.name : "unknown",
          httpStatus: gaxiosError?.response?.status,
          httpStatusText: gaxiosError?.response?.statusText,
          responseData: gaxiosError?.response?.data ? JSON.stringify(gaxiosError.response.data).substring(0, 500) : undefined,
        },
        error instanceof Error ? error : undefined
      );
      throw error;
    }
  }

  // Atribuir vídeos a uma playlist (apenas adiciona, não remove)
  async assignVideosToPlaylist(
    playlistId: string,
    videoIds: string[]
  ): Promise<{
    success: boolean;
    added: number;
    errors: number;
    details: Array<{
      videoId: string;
      status: "success" | "error";
      error?: string;
    }>;
  }> {
    logger.info("YOUTUBE_API", "assignVideosToPlaylist START", {
      instanceId: this.instanceId,
      playlistId,
      videosCount: videoIds.length,
      userId: this.userId,
      videoIds: videoIds.slice(0, 10),
    });

    const details: Array<{
      videoId: string;
      status: "success" | "error";
      error?: string;
    }> = [];
    let added = 0;
    let errors = 0;
    const overallStartTime = Date.now();

    for (let i = 0; i < videoIds.length; i++) {
      const videoId = videoIds[i];
      logger.debug("YOUTUBE_API", `assignVideosToPlaylist - Processing video ${i + 1}/${videoIds.length}`, {
        instanceId: this.instanceId,
        videoId,
        playlistId,
        addedSoFar: added,
        errorsSoFar: errors,
      });

      try {
        const result = await this.addVideoToPlaylist(playlistId, videoId);

        if (result.success) {
          added++;
          details.push({ videoId, status: "success" });
        } else {
          errors++;
          details.push({
            videoId,
            status: "error",
            error: result.error || "Erro ao adicionar à playlist",
          });
        }
      } catch (error) {
        errors++;
        details.push({
          videoId,
          status: "error",
          error: error instanceof Error ? error.message : "Erro desconhecido",
        });
        logger.error("YOUTUBE_API", `assignVideosToPlaylist - Video ${i + 1} threw exception`, error instanceof Error ? error : undefined, {
          instanceId: this.instanceId,
          videoId,
        });
      }
    }

    const totalElapsed = Date.now() - overallStartTime;

    logger.youtubeApi("assignVideosToPlaylist END", errors === 0, {
      instanceId: this.instanceId,
      playlistId,
      totalVideos: videoIds.length,
      added,
      errors,
      totalElapsed: `${totalElapsed}ms`,
      avgPerVideo: videoIds.length > 0 ? `${Math.round(totalElapsed / videoIds.length)}ms` : "N/A",
    });

    return {
      success: errors === 0,
      added,
      errors,
      details,
    };
  }

  // Buscar uma página de itens de playlist com detalhes dos vídeos (para exportação incremental)
  // Custo: 2 unidades (1 playlistItems.list + 1 videos.list)
  async getPlaylistItemsPage(
    playlistId: string,
    pageToken?: string
  ): Promise<{
    videos: Array<{
      videoId: string;
      title: string;
      channelId: string;
      channelTitle: string;
      language: string;
      publishedAt: string;
      thumbnailUrl: string;
    }>;
    nextPageToken: string | null;
    totalResults: number;
  }> {
    logger.info("YOUTUBE_API", "getPlaylistItemsPage START", {
      instanceId: this.instanceId,
      playlistId,
      pageToken: pageToken || "initial",
      userId: this.userId,
    });

    try {
      const startTime = Date.now();

      const response = await this.youtube.playlistItems.list({
        part: ["snippet", "contentDetails"],
        playlistId,
        maxResults: 50,
        pageToken,
      });

      const elapsed = Date.now() - startTime;
      await trackQuotaUsage(this.userId, "playlistItems.list");

      logger.youtubeApi("playlistItems.list (page)", true, {
        instanceId: this.instanceId,
        playlistId,
        elapsed: `${elapsed}ms`,
        itemsCount: response.data.items?.length || 0,
        hasNextPage: !!response.data.nextPageToken,
        totalResults: response.data.pageInfo?.totalResults,
      });

      const items = response.data.items || [];
      const videoIds = items
        .map((item) => item.contentDetails?.videoId || "")
        .filter(Boolean);

      if (videoIds.length === 0) {
        return {
          videos: [],
          nextPageToken: response.data.nextPageToken || null,
          totalResults: response.data.pageInfo?.totalResults || 0,
        };
      }

      // Buscar detalhes dos vídeos (snippet + contentDetails)
      const detailsStartTime = Date.now();
      const detailsResponse = await this.youtube.videos.list({
        part: ["snippet", "contentDetails"],
        id: videoIds,
      });

      const detailsElapsed = Date.now() - detailsStartTime;
      await trackQuotaUsage(this.userId, "videos.list");

      logger.youtubeApi("videos.list (page details)", true, {
        instanceId: this.instanceId,
        elapsed: `${detailsElapsed}ms`,
        videoIdsCount: videoIds.length,
        returnedCount: detailsResponse.data.items?.length || 0,
      });

      const detailsMap = new Map<string, youtube_v3.Schema$Video>();
      for (const video of detailsResponse.data.items || []) {
        if (video.id) detailsMap.set(video.id, video);
      }

      const videos = items
        .map((item) => {
          const videoId = item.contentDetails?.videoId || "";
          const detail = detailsMap.get(videoId);
          return {
            videoId,
            title: detail?.snippet?.title || item.snippet?.title || "",
            channelId:
              detail?.snippet?.channelId ||
              item.snippet?.videoOwnerChannelId ||
              "",
            channelTitle:
              detail?.snippet?.channelTitle ||
              item.snippet?.videoOwnerChannelTitle ||
              "",
            language: detail?.snippet?.defaultAudioLanguage || "",
            publishedAt: detail?.snippet?.publishedAt || "",
            thumbnailUrl:
              detail?.snippet?.thumbnails?.medium?.url || "",
          };
        })
        .filter((v) => v.videoId);

      logger.youtubeApi("getPlaylistItemsPage END", true, {
        instanceId: this.instanceId,
        playlistId,
        videosReturned: videos.length,
        hasNextPage: !!response.data.nextPageToken,
      });

      return {
        videos,
        nextPageToken: response.data.nextPageToken || null,
        totalResults: response.data.pageInfo?.totalResults || 0,
      };
    } catch (error) {
      const gaxiosError = error as {
        code?: number;
        response?: { status?: number; statusText?: string; data?: unknown };
      };
      logger.youtubeApi("getPlaylistItemsPage FAILED", false, {
        instanceId: this.instanceId,
        playlistId,
        pageToken: pageToken || "initial",
        errorCode: gaxiosError?.code,
        errorMessage: error instanceof Error ? error.message : String(error),
        httpStatus: gaxiosError?.response?.status,
      }, error instanceof Error ? error : undefined);
      throw error;
    }
  }
}
