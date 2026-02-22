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
    logger.info("API", "GET /ytpm/api/quota - Request started", { traceId });

    const session = await auth();

    logger.info("API", "GET /ytpm/api/quota - Session retrieved", {
      traceId,
      hasSession: !!session,
      hasUserId: !!session?.user?.id,
      userId: session?.user?.id,
    });

    if (!session?.user?.id) {
      logger.warn("API", "GET /ytpm/api/quota - Unauthorized", { traceId });
      clearTraceId();
      return NextResponse.json({ error: "Não autorizado", traceId }, { status: 401 });
    }

    const quotaStatus = await getQuotaStatus(session.user.id);
    const totalElapsed = Date.now() - startTime;

    logger.info("API", "GET /ytpm/api/quota - Request completed", {
      traceId,
      consumedUnits: quotaStatus.consumedUnits,
      remainingUnits: quotaStatus.remainingUnits,
      totalElapsed: `${totalElapsed}ms`,
    });

    clearTraceId();
    return NextResponse.json(quotaStatus);
  } catch (error) {
    const totalElapsed = Date.now() - startTime;
    logger.error("API", "GET /ytpm/api/quota - Request FAILED", error instanceof Error ? error : undefined, {
      traceId,
      elapsed: `${totalElapsed}ms`,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    clearTraceId();
    return NextResponse.json(
      { error: "Erro ao buscar status de quota", traceId },
      { status: 500 }
    );
  }
}
