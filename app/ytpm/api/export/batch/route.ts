import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { processBatch } from "@/lib/export";
import { logger, generateTraceId, setTraceId, clearTraceId } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST() {
  const traceId = generateTraceId();
  setTraceId(traceId);
  const startTime = Date.now();

  try {
    logger.info("API", "POST /ytpm/api/export/batch - Request started", { traceId });

    const session = await auth();

    if (!session?.user?.id || !session.accessToken) {
      logger.warn("API", "POST /ytpm/api/export/batch - Unauthorized", { traceId });
      clearTraceId();
      return NextResponse.json(
        { error: "Não autorizado", traceId },
        { status: 401 }
      );
    }

    const result = await processBatch(session.user.id, session.accessToken);
    const totalElapsed = Date.now() - startTime;

    logger.info("API", "POST /ytpm/api/export/batch - Request completed", {
      traceId,
      videosImported: result.videosImported,
      sourceId: result.sourceId,
      totalElapsed: `${totalElapsed}ms`,
    });

    clearTraceId();
    return NextResponse.json(result);
  } catch (error) {
    const totalElapsed = Date.now() - startTime;
    logger.error(
      "API",
      "POST /ytpm/api/export/batch - Request FAILED",
      error instanceof Error ? error : undefined,
      {
        traceId,
        elapsed: `${totalElapsed}ms`,
        errorMessage: error instanceof Error ? error.message : String(error),
      }
    );
    clearTraceId();
    return NextResponse.json(
      { error: "Erro ao processar batch", traceId },
      { status: 500 }
    );
  }
}
