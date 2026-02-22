import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { YouTubeService } from "@/lib/youtube";
import { checkQuotaAvailable } from "@/lib/quota";
import { calculateTransferCost } from "@/lib/quota.shared";
import { logger, generateTraceId, setTraceId, clearTraceId } from "@/lib/logger";

export const dynamic = "force-dynamic";

interface TransferRequest {
  sourcePlaylistId: string;
  destinationPlaylistId: string;
  videos: Array<{
    playlistItemId: string;
    videoId: string;
  }>;
}

export async function POST(request: NextRequest) {
  const traceId = generateTraceId();
  setTraceId(traceId);
  const startTime = Date.now();

  try {
    logger.info("API", "POST /ytpm/api/playlists/transfer - Request started", { traceId });

    const session = await auth();

    logger.info("API", "POST /ytpm/api/playlists/transfer - Session retrieved", {
      traceId,
      hasSession: !!session,
      hasUserId: !!session?.user?.id,
      userId: session?.user?.id,
      hasAccessToken: !!session?.accessToken,
      accessTokenLength: session?.accessToken?.length || 0,
    });

    if (!session?.user?.id || !session.accessToken) {
      const reason = !session ? "no_session" : !session.user?.id ? "no_user_id" : "no_access_token";
      logger.warn("API", "POST /ytpm/api/playlists/transfer - Unauthorized", { traceId, reason });
      clearTraceId();
      return NextResponse.json({ error: "Não autorizado", reason, traceId }, { status: 401 });
    }

    const body: TransferRequest = await request.json();

    logger.info("API", "POST /ytpm/api/playlists/transfer - Body parsed", {
      traceId,
      sourcePlaylistId: body.sourcePlaylistId,
      destinationPlaylistId: body.destinationPlaylistId,
      videosCount: body.videos?.length || 0,
    });

    if (!body.sourcePlaylistId || !body.destinationPlaylistId) {
      clearTraceId();
      return NextResponse.json({ error: "IDs das playlists são obrigatórios", traceId }, { status: 400 });
    }

    if (!body.videos || body.videos.length === 0) {
      clearTraceId();
      return NextResponse.json({ error: "Nenhum vídeo selecionado", traceId }, { status: 400 });
    }

    if (body.sourcePlaylistId === body.destinationPlaylistId) {
      clearTraceId();
      return NextResponse.json({ error: "Playlist de origem e destino são iguais", traceId }, { status: 400 });
    }

    const requiredQuota = calculateTransferCost(body.videos.length);
    const hasQuota = await checkQuotaAvailable(session.user.id, requiredQuota);

    logger.info("API", "POST /ytpm/api/playlists/transfer - Quota check", {
      traceId,
      requiredQuota,
      hasQuota,
    });

    if (!hasQuota) {
      clearTraceId();
      return NextResponse.json({ error: "Quota insuficiente para esta operação", requiredQuota, traceId }, { status: 429 });
    }

    const youtubeService = new YouTubeService(session.accessToken, session.user.id);
    const result = await youtubeService.transferVideos(body.sourcePlaylistId, body.destinationPlaylistId, body.videos);
    const totalElapsed = Date.now() - startTime;

    logger.info("API", "POST /ytpm/api/playlists/transfer - Request completed", {
      traceId,
      success: result.success,
      transferred: result.transferred,
      errors: result.errors,
      totalElapsed: `${totalElapsed}ms`,
    });

    clearTraceId();
    return NextResponse.json(result);
  } catch (error) {
    const totalElapsed = Date.now() - startTime;
    logger.error("API", "POST /ytpm/api/playlists/transfer - Request FAILED", error instanceof Error ? error : undefined, {
      traceId,
      elapsed: `${totalElapsed}ms`,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    clearTraceId();
    return NextResponse.json(
      { error: "Erro ao transferir vídeos", traceId, details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
