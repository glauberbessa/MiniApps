import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getActiveAutoResumes,
  getPausedAutoResumes,
  processAutoResumeForUser,
  resumeAutoResumeIfReady,
} from "@/lib/auto-resume-export";
import { validateCronRequest } from "@/lib/vercel-ip-validator";
import { logger, LogCategory } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

// This route is called by Vercel's cron scheduler every 30 minutes
// Schedule: */30 * * * * (every 30 minutes)
export const runtime = "nodejs";

interface CronResult {
  processed: number;
  paused: number;
  completed: number;
  errors: Array<{ userId: string; error: string }>;
  timestamp: string;
  duration: number;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  logger.info(LogCategory.EXPORT, "Auto-resume cron job started");

  // Validate request is from Vercel
  if (!validateCronRequest(request)) {
    logger.warn(LogCategory.EXPORT, "Unauthorized cron request", {
      ip: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const result: CronResult = {
    processed: 0,
    paused: 0,
    completed: 0,
    errors: [],
    timestamp: new Date().toISOString(),
    duration: 0,
  };

  try {
    // 1. Resume any paused auto-resumes that are ready
    const pausedAutoResumes = await getPausedAutoResumes();
    logger.info(LogCategory.EXPORT, "Processing paused auto-resumes", {
      count: pausedAutoResumes.length,
    });

    for (const { userId } of pausedAutoResumes) {
      try {
        await resumeAutoResumeIfReady(userId);
        result.paused++;
      } catch (error) {
        logger.error(
          LogCategory.EXPORT,
          "Failed to resume auto-resume",
          error instanceof Error ? error : undefined,
          { userId }
        );
        result.errors.push({
          userId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // 2. Process active auto-resumes
    // Limit processing to prevent timeout (Vercel has 30s timeout)
    const MAX_BATCHES_PER_RUN = 15; // Conservative limit
    const activeAutoResumes = await getActiveAutoResumes();

    logger.info(LogCategory.EXPORT, "Processing active auto-resumes", {
      count: activeAutoResumes.length,
      maxBatches: MAX_BATCHES_PER_RUN,
    });

    let batchesProcessed = 0;

    for (const { userId } of activeAutoResumes) {
      // Stop if we're getting close to timeout
      if (batchesProcessed >= MAX_BATCHES_PER_RUN) {
        logger.info(LogCategory.EXPORT, "Reached batch limit for this cron run", {
          processed: batchesProcessed,
          remaining: activeAutoResumes.length - result.processed,
        });
        break;
      }

      try {
        const processResult = await processAutoResumeForUser(userId);

        if (processResult.success) {
          if (processResult.quotaExceeded) {
            logger.info(LogCategory.EXPORT, "Auto-resume paused due to quota", {
              userId,
            });
            result.paused++;
          } else if (processResult.error?.includes("complete")) {
            result.completed++;
          } else {
            result.processed++;
          }
        } else {
          // Log non-critical errors but continue processing
          logger.warn(LogCategory.EXPORT, "Auto-resume processing failed", {
            userId,
            error: processResult.error,
          });
          result.errors.push({
            userId,
            error: processResult.error || "Unknown error",
          });
        }

        batchesProcessed++;
      } catch (error) {
        logger.error(
          LogCategory.EXPORT,
          "Error processing auto-resume",
          error instanceof Error ? error : undefined,
          { userId }
        );
        result.errors.push({
          userId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        batchesProcessed++;
      }
    }

    result.duration = Date.now() - startTime;

    logger.info(LogCategory.EXPORT, "Auto-resume cron job completed", result);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    result.duration = Date.now() - startTime;

    logger.error(
      LogCategory.EXPORT,
      "Auto-resume cron job failed",
      error instanceof Error ? error : undefined
    );

    return NextResponse.json(
      {
        ...result,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
