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
    const playlistId = params.id;
    logger.info("API", "GET /ytpm/api/playlists/[id]/items - Request started", { traceId, playlistId });

    const session = await auth();

    logger.info("API", "GET /ytpm/api/playlists/[id]/items - Session retrieved", {
      traceId,
      hasSession: !!session,
      hasUserId: !!session?.user?.id,
      userId: session?.user?.id,
      hasAccessToken: !!session?.accessToken,
      accessTokenLength: session?.accessToken?.length || 0,
    });

    if (!session?.user?.id || !session.accessToken) {
      const reason = !session ? "no_session" : !session.user?.id ? "no_user_id" : "no_access_token";
      logger.warn("API", "GET /ytpm/api/playlists/[id]/items - Unauthorized", { traceId, reason });
      clearTraceId();
      return NextResponse.json({ error: "Não autorizado", reason, traceId }, { status: 401 });
    }

    if (!playlistId) {
      clearTraceId();
      return NextResponse.json({ error: "ID da playlist é obrigatório", traceId }, { status: 400 });
    }

    logger.info("API", "GET /ytpm/api/playlists/[id]/items - Creating YouTubeService", {
      traceId,
      playlistId,
      accessTokenPreview: `${session.accessToken.substring(0, 20)}...`,
    });

    const youtubeService = new YouTubeService(session.accessToken, session.user.id);
    const items = await youtubeService.getPlaylistItems(playlistId);
    const totalElapsed = Date.now() - startTime;

    logger.info("API", "GET /ytpm/api/playlists/[id]/items - Request completed", {
      traceId,
      playlistId,
      itemCount: items.length,
      totalElapsed: `${totalElapsed}ms`,
    });

    clearTraceId();
    return NextResponse.json(items);
  } catch (error) {
    const totalElapsed = Date.now() - startTime;
    logger.error("API", "GET /ytpm/api/playlists/[id]/items - Request FAILED", error instanceof Error ? error : undefined, {
      traceId,
      elapsed: `${totalElapsed}ms`,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    clearTraceId();
    return NextResponse.json(
      { error: "Erro ao buscar itens da playlist", traceId, details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
