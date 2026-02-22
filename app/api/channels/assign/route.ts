import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { YouTubeService } from "@/lib/youtube";
import { checkQuotaAvailable } from "@/lib/quota";
import { calculateAssignCost } from "@/lib/quota.shared";
import { logger, generateTraceId, setTraceId, clearTraceId } from "@/lib/logger";

export const dynamic = "force-dynamic";

interface AssignRequest {
  playlistId: string;
  videoIds: string[];
}

export async function POST(request: NextRequest) {
  const traceId = generateTraceId();
  setTraceId(traceId);
  const startTime = Date.now();

  try {
    logger.info("API", "POST /api/channels/assign - Request started", { traceId });

    const session = await auth();

    logger.info("API", "POST /api/channels/assign - Session retrieved", {
      traceId,
      hasSession: !!session,
      hasUserId: !!session?.user?.id,
      userId: session?.user?.id,
      hasAccessToken: !!session?.accessToken,
      accessTokenLength: session?.accessToken?.length || 0,
    });

    if (!session?.user?.id || !session.accessToken) {
      const reason = !session ? "no_session" : !session.user?.id ? "no_user_id" : "no_access_token";
      logger.warn("API", "POST /api/channels/assign - Unauthorized", { traceId, reason });
      clearTraceId();
      return NextResponse.json({ error: "Não autorizado", reason, traceId }, { status: 401 });
    }

    const body: AssignRequest = await request.json();

    logger.info("API", "POST /api/channels/assign - Request body parsed", {
      traceId,
      playlistId: body.playlistId,
      videoIdsCount: body.videoIds?.length || 0,
    });

    if (!body.playlistId) {
      logger.warn("API", "POST /api/channels/assign - Missing playlist ID", { traceId });
      clearTraceId();
      return NextResponse.json({ error: "ID da playlist é obrigatório", traceId }, { status: 400 });
    }

    if (!body.videoIds || body.videoIds.length === 0) {
      logger.warn("API", "POST /api/channels/assign - No videos selected", { traceId });
      clearTraceId();
      return NextResponse.json({ error: "Nenhum vídeo selecionado", traceId }, { status: 400 });
    }

    const requiredQuota = calculateAssignCost(body.videoIds.length);
    const hasQuota = await checkQuotaAvailable(session.user.id, requiredQuota);

    logger.info("API", "POST /api/channels/assign - Quota check", {
      traceId,
      requiredQuota,
      hasQuota,
      videoCount: body.videoIds.length,
    });

    if (!hasQuota) {
      logger.warn("API", "POST /api/channels/assign - Insufficient quota", { traceId, requiredQuota });
      clearTraceId();
      return NextResponse.json({ error: "Quota insuficiente para esta operação", requiredQuota, traceId }, { status: 429 });
    }

    const youtubeService = new YouTubeService(session.accessToken, session.user.id);
    const result = await youtubeService.assignVideosToPlaylist(body.playlistId, body.videoIds);
    const totalElapsed = Date.now() - startTime;

    logger.info("API", "POST /api/channels/assign - Request completed", {
      traceId,
      success: result.success,
      added: result.added,
      errors: result.errors,
      totalElapsed: `${totalElapsed}ms`,
    });

    clearTraceId();
    return NextResponse.json(result);
  } catch (error) {
    const totalElapsed = Date.now() - startTime;
    logger.error("API", "POST /api/channels/assign - Request FAILED", error instanceof Error ? error : undefined, {
      traceId,
      elapsed: `${totalElapsed}ms`,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    clearTraceId();
    return NextResponse.json(
      { error: "Erro ao atribuir vídeos", traceId, details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
