import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { initializeExport } from "@/lib/export";
import { logger, generateTraceId, setTraceId, clearTraceId } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST() {
  const traceId = generateTraceId();
  setTraceId(traceId);
  const startTime = Date.now();

  try {
    logger.info("API", "POST /ytpm/api/export/init - Request started", { traceId });

    const session = await auth();

    if (!session?.user?.id || !session.accessToken) {
      logger.warn("API", "POST /ytpm/api/export/init - Unauthorized", { traceId });
      clearTraceId();
      return NextResponse.json(
        { error: "Não autorizado", traceId },
        { status: 401 }
      );
    }

    const result = await initializeExport(session.user.id, session.accessToken);
    const totalElapsed = Date.now() - startTime;

    logger.info("API", "POST /ytpm/api/export/init - Request completed", {
      traceId,
      totalSources: result.totalSources,
      totalElapsed: `${totalElapsed}ms`,
    });

    clearTraceId();
    return NextResponse.json(result);
  } catch (error) {
    const totalElapsed = Date.now() - startTime;
    logger.error(
      "API",
      "POST /ytpm/api/export/init - Request FAILED",
      error instanceof Error ? error : undefined,
      {
        traceId,
        elapsed: `${totalElapsed}ms`,
        errorMessage: error instanceof Error ? error.message : String(error),
      }
    );
    clearTraceId();
    return NextResponse.json(
      { error: "Erro ao inicializar exportação", traceId },
      { status: 500 }
    );
  }
}
