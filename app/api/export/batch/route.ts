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

    // Step 1: Auth
    logger.info("API", "POST /api/export/batch - Step 1: Calling auth()", { traceId });
    const authStartTime = Date.now();
    let session;
    try {
      session = await auth();
    } catch (authError) {
      const authElapsed = Date.now() - authStartTime;
      logger.error(
        "API",
        "POST /api/export/batch - auth() threw an exception",
        authError instanceof Error ? authError : undefined,
        {
          traceId,
          authElapsed: `${authElapsed}ms`,
          errorType: authError?.constructor?.name,
          errorString: String(authError),
        }
      );
      throw authError;
    }
    const authElapsed = Date.now() - authStartTime;
    logger.info("API", "POST /api/export/batch - Step 1 complete: auth() returned", {
      traceId,
      authElapsed: `${authElapsed}ms`,
      hasSession: !!session,
      hasUser: !!session?.user,
      hasUserId: !!session?.user?.id,
      userId: session?.user?.id || "MISSING",
      hasAccessToken: !!session?.accessToken,
      accessTokenLength: session?.accessToken ? session.accessToken.length : 0,
      accessTokenPrefix: session?.accessToken ? session.accessToken.substring(0, 10) + "..." : "MISSING",
      sessionKeys: session ? Object.keys(session) : [],
      userKeys: session?.user ? Object.keys(session.user) : [],
    });

    if (!session?.user?.id || !session.accessToken) {
      logger.warn("API", "POST /api/export/batch - Unauthorized: missing session data", {
        traceId,
        hasSession: !!session,
        hasUser: !!session?.user,
        hasUserId: !!session?.user?.id,
        hasAccessToken: !!session?.accessToken,
      });
      clearTraceId();
      return NextResponse.json(
        { error: "Não autorizado", traceId },
        { status: 401 }
      );
    }

    // Step 2: Create YouTubeService
    logger.info("API", "POST /api/export/batch - Step 2: Creating YouTubeService", {
      traceId,
      userId: session.user.id,
    });
    let youtubeService;
    try {
      youtubeService = new YouTubeService(
        session.accessToken,
        session.user.id
      );
    } catch (ytError) {
      logger.error(
        "API",
        "POST /api/export/batch - YouTubeService constructor failed",
        ytError instanceof Error ? ytError : undefined,
        {
          traceId,
          userId: session.user.id,
          errorType: ytError?.constructor?.name,
          errorString: String(ytError),
        }
      );
      throw ytError;
    }
    logger.info("API", "POST /api/export/batch - Step 2 complete: YouTubeService created", { traceId });

    // Step 3: Process batch
    logger.info("API", "POST /api/export/batch - Step 3: Calling processBatch()", {
      traceId,
      userId: session.user.id,
    });
    const batchStartTime = Date.now();
    let result;
    try {
      result = await processBatch(session.user.id, youtubeService);
    } catch (batchError) {
      const batchElapsed = Date.now() - batchStartTime;
      logger.error(
        "API",
        "POST /api/export/batch - processBatch() threw an exception",
        batchError instanceof Error ? batchError : undefined,
        {
          traceId,
          userId: session.user.id,
          batchElapsed: `${batchElapsed}ms`,
          errorType: batchError?.constructor?.name,
          errorString: String(batchError),
          errorStack: batchError instanceof Error ? batchError.stack : undefined,
        }
      );
      throw batchError;
    }
    const batchElapsed = Date.now() - batchStartTime;
    const totalElapsed = Date.now() - startTime;

    logger.info("API", "POST /api/export/batch - Step 3 complete: processBatch() returned", {
      traceId,
      batchElapsed: `${batchElapsed}ms`,
      totalElapsed: `${totalElapsed}ms`,
      sourceId: result.sourceId,
      sourceTitle: result.sourceTitle,
      sourceType: result.sourceType,
      videosImported: result.videosImported,
      hasMore: result.hasMore,
      quotaUsedToday: result.quotaUsedToday,
      quotaCeiling: result.quotaCeiling,
      shouldStop: result.shouldStop,
      exportComplete: result.exportComplete,
      resultKeys: Object.keys(result),
    });

    // Step 4: Return response
    logger.info("API", "POST /api/export/batch - Step 4: Returning JSON response", { traceId });
    clearTraceId();
    return NextResponse.json(result);
  } catch (error) {
    const totalElapsed = Date.now() - startTime;
    logger.error(
      "API",
      "POST /api/export/batch - UNHANDLED ERROR - Request failed",
      error instanceof Error ? error : undefined,
      {
        traceId,
        elapsed: `${totalElapsed}ms`,
        errorType: error?.constructor?.name,
        errorString: String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        errorKeys: error && typeof error === "object" ? Object.keys(error) : [],
      }
    );
    clearTraceId();
    return NextResponse.json(
      {
        error: "Erro ao processar batch de exportação",
        traceId,
        details: error instanceof Error ? error.message : String(error),
        errorType: error?.constructor?.name,
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
