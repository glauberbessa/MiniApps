import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getQuotaStatus } from "@/lib/quota";
import { logger, generateTraceId, setTraceId, clearTraceId } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const traceId = generateTraceId();
  setTraceId(traceId);
  const startTime = Date.now();

  try {
    logger.info("API", "GET /api/quota - Request started", { traceId });

    const session = await auth();

    logger.info("API", "GET /api/quota - Session retrieved", {
      traceId,
      hasSession: !!session,
      hasUserId: !!session?.user?.id,
      userId: session?.user?.id,
      hasAccessToken: !!session?.accessToken,
    });

    if (!session?.user?.id) {
      logger.warn("API", "GET /api/quota - Unauthorized", { traceId, hasSession: !!session });
      clearTraceId();
      return NextResponse.json({ error: "Não autorizado", traceId }, { status: 401 });
    }

    const quotaStatus = await getQuotaStatus(session.user.id);
    const totalElapsed = Date.now() - startTime;

    logger.info("API", "GET /api/quota - Request completed", {
      traceId,
      consumedUnits: quotaStatus.consumedUnits,
      remainingUnits: quotaStatus.remainingUnits,
      percentUsed: quotaStatus.percentUsed,
      totalElapsed: `${totalElapsed}ms`,
    });

    clearTraceId();
    return NextResponse.json(quotaStatus);
  } catch (error) {
    const totalElapsed = Date.now() - startTime;
    logger.error("API", "GET /api/quota - Request FAILED", error instanceof Error ? error : undefined, {
      traceId,
      elapsed: `${totalElapsed}ms`,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    clearTraceId();
    return NextResponse.json(
      { error: "Erro ao buscar status de quota", traceId, details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
