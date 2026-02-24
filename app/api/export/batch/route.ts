import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { YouTubeService } from "@/lib/youtube";
import { processBatch } from "@/lib/export";
import { logger, generateTraceId, setTraceId, clearTraceId } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST() {
  const traceId = generateTraceId();
  setTraceId(traceId);
  const startTime = Date.now();

  try {
    logger.info("API", "POST /api/export/batch - Request started", { traceId });

    const session = await auth();

    if (!session?.user?.id || !session.accessToken) {
      logger.warn("API", "POST /api/export/batch - Unauthorized", { traceId });
      clearTraceId();
      return NextResponse.json(
        { error: "Não autorizado", traceId },
        { status: 401 }
      );
    }

    const youtubeService = new YouTubeService(
      session.accessToken,
      session.user.id
    );

    const result = await processBatch(session.user.id, youtubeService);
    const totalElapsed = Date.now() - startTime;

    logger.info("API", "POST /api/export/batch - Request completed", {
      traceId,
      totalElapsed: `${totalElapsed}ms`,
      sourceId: result.sourceId,
      sourceType: result.sourceType,
      videosImported: result.videosImported,
      shouldStop: result.shouldStop,
      exportComplete: result.exportComplete,
    });

    clearTraceId();
    return NextResponse.json(result);
  } catch (error) {
    const totalElapsed = Date.now() - startTime;
    logger.error(
      "API",
      "POST /api/export/batch - Request failed",
      error instanceof Error ? error : undefined,
      { traceId, elapsed: `${totalElapsed}ms` }
    );
    clearTraceId();
    return NextResponse.json(
      {
        error: "Erro ao processar batch de exportação",
        traceId,
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
