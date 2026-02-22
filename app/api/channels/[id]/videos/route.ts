import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { YouTubeService } from "@/lib/youtube";
import { logger, generateTraceId, setTraceId, clearTraceId } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const traceId = generateTraceId();
  setTraceId(traceId);
  const startTime = Date.now();

  try {
    const channelId = params.id;

    logger.info("API", "GET /api/channels/[id]/videos - Request started", {
      traceId,
      channelId,
      url: request.url,
    });

    const session = await auth();

    logger.info("API", "GET /api/channels/[id]/videos - Session retrieved", {
      traceId,
      hasSession: !!session,
      hasUser: !!session?.user,
      hasUserId: !!session?.user?.id,
      userId: session?.user?.id,
      hasAccessToken: !!session?.accessToken,
      accessTokenLength: session?.accessToken?.length || 0,
    });

    if (!session?.user?.id || !session.accessToken) {
      const reason = !session ? "no_session" : !session.user?.id ? "no_user_id" : "no_access_token";
      logger.warn("API", "GET /api/channels/[id]/videos - Unauthorized", { traceId, reason });
      clearTraceId();
      return NextResponse.json({ error: "Não autorizado", reason, traceId }, { status: 401 });
    }

    if (!channelId) {
      logger.warn("API", "GET /api/channels/[id]/videos - Missing channel ID", { traceId });
      clearTraceId();
      return NextResponse.json({ error: "ID do canal é obrigatório", traceId }, { status: 400 });
    }

    logger.info("API", "GET /api/channels/[id]/videos - Creating YouTubeService (EXPENSIVE: 100 units)", {
      traceId,
      channelId,
      userId: session.user.id,
      accessTokenPreview: `${session.accessToken.substring(0, 20)}...`,
    });

    const youtubeService = new YouTubeService(
      session.accessToken,
      session.user.id
    );

    const youtubeStartTime = Date.now();
    const videos = await youtubeService.getChannelVideos(channelId);
    const youtubeElapsed = Date.now() - youtubeStartTime;
    const totalElapsed = Date.now() - startTime;

    logger.info("API", "GET /api/channels/[id]/videos - Request completed successfully", {
      traceId,
      channelId,
      videoCount: videos.length,
      youtubeApiTime: `${youtubeElapsed}ms`,
      totalElapsed: `${totalElapsed}ms`,
    });

    clearTraceId();
    return NextResponse.json(videos);
  } catch (error) {
    const totalElapsed = Date.now() - startTime;
    logger.error("API", "GET /api/channels/[id]/videos - Request FAILED", error instanceof Error ? error : undefined, {
      traceId,
      elapsed: `${totalElapsed}ms`,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorCode: (error as { code?: number })?.code,
    });
    clearTraceId();
    return NextResponse.json(
      { error: "Erro ao buscar vídeos do canal", traceId, details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
