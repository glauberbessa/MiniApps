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
    logger.info("API", "GET /api/export/videos - Request started", { traceId });

    const session = await auth();

    if (!session?.user?.id) {
      logger.warn("API", "GET /api/export/videos - Unauthorized", { traceId });
      clearTraceId();
      return NextResponse.json(
        { error: "Não autorizado", traceId },
        { status: 401 }
      );
    }

    const { searchParams } = request.nextUrl;
    const language = searchParams.get("language") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const result = await getExportedVideos(session.user.id, {
      language,
      page,
      limit,
    });

    const totalElapsed = Date.now() - startTime;

    logger.info("API", "GET /api/export/videos - Request completed", {
      traceId,
      totalElapsed: `${totalElapsed}ms`,
      videosReturned: result.videos.length,
      total: result.total,
      language: language || "all",
    });

    clearTraceId();
    return NextResponse.json(result);
  } catch (error) {
    const totalElapsed = Date.now() - startTime;
    logger.error(
      "API",
      "GET /api/export/videos - Request failed",
      error instanceof Error ? error : undefined,
      { traceId, elapsed: `${totalElapsed}ms` }
    );
    clearTraceId();
    return NextResponse.json(
      {
        error: "Erro ao buscar vídeos exportados",
        traceId,
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
