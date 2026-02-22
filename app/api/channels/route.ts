import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { YouTubeService } from "@/lib/youtube";
import { prisma } from "@/lib/prisma";
import { logger, generateTraceId, setTraceId, clearTraceId } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const traceId = generateTraceId();
  setTraceId(traceId);
  const startTime = Date.now();

  try {
    logger.info("API", "GET /api/channels - Request started", { traceId });

    const session = await auth();

    logger.info("API", "GET /api/channels - Session retrieved", {
      traceId,
      hasSession: !!session,
      hasUser: !!session?.user,
      hasUserId: !!session?.user?.id,
      userId: session?.user?.id,
      hasAccessToken: !!session?.accessToken,
      accessTokenLength: session?.accessToken?.length || 0,
      userEmail: session?.user?.email,
      youtubeChannelId: session?.user?.youtubeChannelId,
    });

    if (!session?.user?.id || !session.accessToken) {
      const reason = !session
        ? "no_session"
        : !session.user?.id
          ? "no_user_id"
          : "no_access_token";

      logger.warn("API", "GET /api/channels - Unauthorized", {
        traceId,
        reason,
        hasSession: !!session,
        hasUser: !!session?.user,
        hasUserId: !!session?.user?.id,
        hasAccessToken: !!session?.accessToken,
      });

      clearTraceId();

      return NextResponse.json(
        {
          error: "Não autorizado",
          reason,
          traceId,
          hint:
            reason === "no_session"
              ? "Sessão não encontrada. Verifique se está logado e se os cookies estão sendo enviados."
              : reason === "no_access_token"
                ? "Access token ausente. Pode ser necessário fazer login novamente."
                : "ID do usuário ausente na sessão.",
        },
        { status: 401 }
      );
    }

    logger.info("API", "GET /api/channels - Creating YouTubeService", {
      traceId,
      userId: session.user.id,
      accessTokenPreview: `${session.accessToken.substring(0, 20)}...`,
    });

    const youtubeService = new YouTubeService(
      session.accessToken,
      session.user.id
    );

    logger.info("API", "GET /api/channels - Fetching subscribed channels from YouTube API", { traceId });
    const youtubeStartTime = Date.now();
    const channels = await youtubeService.getSubscribedChannels();
    const youtubeElapsed = Date.now() - youtubeStartTime;

    logger.info("API", "GET /api/channels - Channels fetched from YouTube", {
      traceId,
      channelCount: channels.length,
      elapsed: `${youtubeElapsed}ms`,
    });

    // Buscar configurações dos canais
    logger.info("API", "GET /api/channels - Fetching channel configs from database", { traceId });
    const dbStartTime = Date.now();
    const configs = await prisma.channelConfig.findMany({
      where: { userId: session.user.id },
    });
    const dbElapsed = Date.now() - dbStartTime;

    logger.info("API", "GET /api/channels - Channel configs fetched from DB", {
      traceId,
      configCount: configs.length,
      elapsed: `${dbElapsed}ms`,
    });

    // Mesclar canais com configurações
    const channelsWithConfig = channels.map((channel) => {
      const config = configs.find((c) => c.channelId === channel.id);
      return {
        ...channel,
        config: config
          ? {
              id: config.id,
              channelId: config.channelId,
              title: config.title,
              isEnabled: config.isEnabled,
              subscriptionDate: config.subscriptionDate?.toISOString(),
              totalDurationSeconds: config.totalDurationSeconds,
            }
          : undefined,
      };
    });

    const totalElapsed = Date.now() - startTime;

    logger.info("API", "GET /api/channels - Request completed successfully", {
      traceId,
      channelCount: channelsWithConfig.length,
      configuredCount: channelsWithConfig.filter((c) => c.config).length,
      totalElapsed: `${totalElapsed}ms`,
      youtubeApiTime: `${youtubeElapsed}ms`,
      databaseTime: `${dbElapsed}ms`,
    });

    clearTraceId();

    return NextResponse.json(channelsWithConfig);
  } catch (error) {
    const totalElapsed = Date.now() - startTime;

    logger.error("API", "GET /api/channels - Request FAILED", error instanceof Error ? error : undefined, {
      traceId,
      elapsed: `${totalElapsed}ms`,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorCode: (error as { code?: number })?.code,
    });

    clearTraceId();

    return NextResponse.json(
      {
        error: "Erro ao buscar canais",
        traceId,
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
