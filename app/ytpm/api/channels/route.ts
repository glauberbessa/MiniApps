import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { YouTubeService } from "@/lib/youtube";
import { supabase } from "@/lib/supabase";
import { logger, generateTraceId, setTraceId, clearTraceId } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const traceId = generateTraceId();
  setTraceId(traceId);
  const startTime = Date.now();

  try {
    logger.info("API", "GET /ytpm/api/channels - Request started", { traceId });

    const session = await auth();

    logger.info("API", "GET /ytpm/api/channels - Session retrieved", {
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
      const reason = !session ? "no_session" : !session.user?.id ? "no_user_id" : "no_access_token";
      logger.warn("API", "GET /ytpm/api/channels - Unauthorized", { traceId, reason });
      clearTraceId();
      return NextResponse.json({ error: "Não autorizado", reason, traceId }, { status: 401 });
    }

    logger.info("API", "GET /ytpm/api/channels - Creating YouTubeService", {
      traceId,
      userId: session.user.id,
      accessTokenPreview: `${session.accessToken.substring(0, 20)}...`,
    });

    const youtubeService = new YouTubeService(session.accessToken, session.user.id);

    const youtubeStartTime = Date.now();
    const channels = await youtubeService.getSubscribedChannels();
    const youtubeElapsed = Date.now() - youtubeStartTime;

    logger.info("API", "GET /ytpm/api/channels - Channels fetched", {
      traceId,
      channelCount: channels.length,
      elapsed: `${youtubeElapsed}ms`,
    });

    const dbStartTime = Date.now();
    const { data: configs, error: configError } = await supabase
      .from("ChannelConfig")
      .select("*")
      .eq("userId", session.user.id);

    if (configError) throw configError;

    const dbElapsed = Date.now() - dbStartTime;

    logger.info("API", "GET /ytpm/api/channels - Configs fetched", {
      traceId,
      configCount: (configs || []).length,
      elapsed: `${dbElapsed}ms`,
    });

    const channelsWithConfig = channels.map((channel) => {
      const config = (configs || []).find((c) => c.channelId === channel.id);
      return {
        ...channel,
        config: config
          ? {
              id: config.id,
              channelId: config.channelId,
              title: config.title,
              isEnabled: config.isEnabled,
              subscriptionDate: config.subscriptionDate?.toISOString ? config.subscriptionDate.toISOString() : (config.subscriptionDate as string),
              totalDurationSeconds: config.totalDurationSeconds,
            }
          : undefined,
      };
    });

    const totalElapsed = Date.now() - startTime;
    logger.info("API", "GET /ytpm/api/channels - Request completed", {
      traceId,
      channelCount: channelsWithConfig.length,
      totalElapsed: `${totalElapsed}ms`,
    });

    clearTraceId();
    return NextResponse.json(channelsWithConfig);
  } catch (error) {
    const totalElapsed = Date.now() - startTime;
    logger.error("API", "GET /ytpm/api/channels - Request FAILED", error instanceof Error ? error : undefined, {
      traceId,
      elapsed: `${totalElapsed}ms`,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    clearTraceId();
    return NextResponse.json(
      { error: "Erro ao buscar canais", traceId, details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
