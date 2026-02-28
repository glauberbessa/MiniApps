import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { getAutoResumeStatus } from "@/lib/auto-resume-export";
import { logger, LogCategory } from "@/lib/logger";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    logger.debug(LogCategory.EXPORT, "Get auto-resume status", { userId });

    const autoResume = await getAutoResumeStatus(userId);

    if (!autoResume) {
      return NextResponse.json(
        { autoResume: null },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        autoResume: {
          id: autoResume.id,
          status: autoResume.status,
          pausedReason: autoResume.pausedReason,
          pausedUntil: autoResume.pausedUntil,
          lastAttempt: autoResume.lastAttempt,
          nextAttempt: autoResume.nextAttempt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error(
      LogCategory.EXPORT,
      "Get auto-resume status failed",
      error instanceof Error ? error : undefined
    );

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
