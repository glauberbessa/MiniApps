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
    logger.info("API", "GET /api/export/status - Request started", { traceId });

    const session = await auth();

    if (!session?.user?.id) {
      logger.warn("API", "GET /api/export/status - Unauthorized", { traceId });
      clearTraceId();
      return NextResponse.json(
        { error: "Não autorizado", traceId },
        { status: 401 }
      );
    }

    const status = await getExportStatus(session.user.id);
    const totalElapsed = Date.now() - startTime;

    logger.info("API", "GET /api/export/status - Request completed", {
      traceId,
      totalElapsed: `${totalElapsed}ms`,
      totalSources: status.totalSources,
      completedSources: status.completedSources,
    });

    clearTraceId();
    return NextResponse.json(status);
  } catch (error) {
    const totalElapsed = Date.now() - startTime;
    logger.error(
      "API",
      "GET /api/export/status - Request failed",
      error instanceof Error ? error : undefined,
      { traceId, elapsed: `${totalElapsed}ms` }
    );
    clearTraceId();
    return NextResponse.json(
      {
        error: "Erro ao buscar status de exportação",
        traceId,
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
