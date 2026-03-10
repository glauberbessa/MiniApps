import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getExportedVideos } from "@/lib/export";
import { logger, generateTraceId, setTraceId, clearTraceId } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const traceId = generateTraceId();
  setTraceId(traceId);
  const startTime = Date.now();

  try {
    logger.info("API", "GET /ytpm/api/export/videos - Request started", { traceId });

    const session = await auth();

    if (!session?.user?.id) {
      logger.warn("API", "GET /ytpm/api/export/videos - Unauthorized", { traceId });
      clearTraceId();
      return NextResponse.json(
        { error: "Não autorizado", traceId },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const language = url.searchParams.get("language") || undefined;
    const limit = parseInt(url.searchParams.get("limit") || "100");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    const result = await getExportedVideos(
      session.user.id,
      language,
      limit,
      offset
    );
    const totalElapsed = Date.now() - startTime;

    logger.info("API", "GET /ytpm/api/export/videos - Request completed", {
      traceId,
      total: result.total,
      language,
      totalElapsed: `${totalElapsed}ms`,
    });

    clearTraceId();
    return NextResponse.json(result);
  } catch (error) {
    const totalElapsed = Date.now() - startTime;
    logger.error(
      "API",
      "GET /ytpm/api/export/videos - Request FAILED",
      error instanceof Error ? error : undefined,
      {
        traceId,
        elapsed: `${totalElapsed}ms`,
        errorMessage: error instanceof Error ? error.message : String(error),
      }
    );
    clearTraceId();
    return NextResponse.json(
      { error: "Erro ao buscar vídeos exportados", traceId },
      { status: 500 }
    );
  }
}
