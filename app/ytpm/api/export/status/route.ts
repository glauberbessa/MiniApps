import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getExportStatus } from "@/lib/export";
import { logger, generateTraceId, setTraceId, clearTraceId } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const traceId = generateTraceId();
  setTraceId(traceId);
  const startTime = Date.now();

  try {
    logger.info("API", "GET /ytpm/api/export/status - Request started", { traceId });

    const session = await auth();

    if (!session?.user?.id) {
      logger.warn("API", "GET /ytpm/api/export/status - Unauthorized", { traceId });
      clearTraceId();
      return NextResponse.json(
        { error: "Não autorizado", traceId },
        { status: 401 }
      );
    }

    const status = await getExportStatus(session.user.id);
    const totalElapsed = Date.now() - startTime;

    logger.info("API", "GET /ytpm/api/export/status - Request completed", {
      traceId,
      totalSources: status.totalSources,
      completedSources: status.completedSources,
      totalElapsed: `${totalElapsed}ms`,
    });

    clearTraceId();
    return NextResponse.json(status);
  } catch (error) {
    const totalElapsed = Date.now() - startTime;
    logger.error(
      "API",
      "GET /ytpm/api/export/status - Request FAILED",
      error instanceof Error ? error : undefined,
      {
        traceId,
        elapsed: `${totalElapsed}ms`,
        errorMessage: error instanceof Error ? error.message : String(error),
      }
    );
    clearTraceId();
    return NextResponse.json(
      { error: "Erro ao buscar status de exportação", traceId },
      { status: 500 }
    );
  }
}
