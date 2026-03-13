import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { initAutoResume } from "@/lib/auto-resume-export";
import { logger, LogCategory } from "@/lib/logger";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    logger.info(LogCategory.EXPORT, "Enable auto-resume", { userId });

    const autoResume = await initAutoResume(userId);

    return NextResponse.json(
      {
        success: true,
        autoResume: {
          id: autoResume.id,
          status: autoResume.status,
          pausedReason: autoResume.pausedReason,
          pausedUntil: autoResume.pausedUntil,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error(
      LogCategory.EXPORT,
      "Enable auto-resume failed",
      error instanceof Error ? error : undefined
    );

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
