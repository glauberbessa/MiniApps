import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { YouTubeService } from "@/lib/youtube";
import { checkQuotaAvailable } from "@/lib/quota";
import { calculateRemoveCost } from "@/lib/quota.shared";
import { logger, generateTraceId, setTraceId, clearTraceId } from "@/lib/logger";

export const dynamic = "force-dynamic";

interface RemoveRequest {
  sourcePlaylistId: string;
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
    logger.info("API", "POST /ytpm/api/playlists/remove - Request started", { traceId });

    const session = await auth();

    logger.info("API", "POST /ytpm/api/playlists/remove - Session retrieved", {
      traceId,
      hasSession: !!session,
      hasUserId: !!session?.user?.id,
      userId: session?.user?.id,
      hasAccessToken: !!session?.accessToken,
      accessTokenLength: session?.accessToken?.length || 0,
    });

    if (!session?.user?.id || !session.accessToken) {
      const reason = !session ? "no_session" : !session.user?.id ? "no_user_id" : "no_access_token";
      logger.warn("API", "POST /ytpm/api/playlists/remove - Unauthorized", { traceId, reason });
      clearTraceId();
      return NextResponse.json({ error: "Não autorizado", reason, traceId }, { status: 401 });
    }

    const body: RemoveRequest = await request.json();

    logger.info("API", "POST /ytpm/api/playlists/remove - Body parsed", {
      traceId,
      sourcePlaylistId: body.sourcePlaylistId,
      videosCount: body.videos?.length || 0,
    });

    if (!body.sourcePlaylistId) {
      clearTraceId();
      return NextResponse.json({ error: "ID da playlist de origem é obrigatório", traceId }, { status: 400 });
    }

    if (!body.videos || body.videos.length === 0) {
      clearTraceId();
      return NextResponse.json({ error: "Nenhum vídeo selecionado", traceId }, { status: 400 });
    }

    const requiredQuota = calculateRemoveCost(body.videos.length);
    const hasQuota = await checkQuotaAvailable(session.user.id, requiredQuota);

    logger.info("API", "POST /ytpm/api/playlists/remove - Quota check", {
      traceId,
      requiredQuota,
      hasQuota,
    });

    if (!hasQuota) {
      clearTraceId();
      return NextResponse.json({ error: "Quota insuficiente para esta operação", requiredQuota, traceId }, { status: 429 });
    }

    const youtubeService = new YouTubeService(session.accessToken, session.user.id);

    let removed = 0;
    let errors = 0;
    const details: Array<{ videoId: string; status: "success" | "error"; error?: string }> = [];

    for (let i = 0; i < body.videos.length; i++) {
      const video = body.videos[i];
      logger.debug("API", `POST /ytpm/api/playlists/remove - Removing video ${i + 1}/${body.videos.length}`, {
        traceId,
        videoId: video.videoId,
        playlistItemId: video.playlistItemId,
      });

      const result = await youtubeService.removeVideoFromPlaylist(video.playlistItemId);
      if (result.success) {
        removed++;
        details.push({ videoId: video.videoId, status: "success" });
      } else {
        errors++;
        details.push({ videoId: video.videoId, status: "error", error: result.error || "Erro ao remover vídeo" });
      }
    }

    const totalElapsed = Date.now() - startTime;
    logger.info("API", "POST /ytpm/api/playlists/remove - Request completed", {
      traceId,
      success: errors === 0,
      removed,
      errors,
      totalElapsed: `${totalElapsed}ms`,
    });

    clearTraceId();
    return NextResponse.json({ success: errors === 0, removed, errors, details });
  } catch (error) {
    const totalElapsed = Date.now() - startTime;
    logger.error("API", "POST /ytpm/api/playlists/remove - Request FAILED", error instanceof Error ? error : undefined, {
      traceId,
      elapsed: `${totalElapsed}ms`,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    clearTraceId();
    return NextResponse.json(
      { error: "Erro ao remover vídeos da playlist", traceId, details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
