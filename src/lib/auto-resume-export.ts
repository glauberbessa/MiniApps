import { prisma } from "./prisma";
import { getExportStatus, processBatch, QUOTA_CEILING } from "./export";
import { YouTubeService } from "./youtube";
import { getQuotaStatus } from "./quota";
import { logger, LogCategory } from "./logger";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth.config";

const AUTO_RESUME_CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes
const AUTO_RESUME_PAUSE_DURATION = 8 * 60 * 60 * 1000; // 8 hours

/**
 * Initialize auto-resume for a user
 */
export async function initAutoResume(userId: string) {
  logger.info(LogCategory.EXPORT, "initAutoResume START", { userId });

  const autoResume = await prisma.exportAutoResume.upsert({
    where: { userId },
    update: { status: "active", pausedUntil: null, pausedReason: null },
    create: {
      userId,
      status: "active",
    },
  });

  logger.info(LogCategory.EXPORT, "initAutoResume END", { userId });
  return autoResume;
}

/**
 * Disable auto-resume for a user
 */
export async function disableAutoResume(userId: string) {
  logger.info(LogCategory.EXPORT, "disableAutoResume START", { userId });

  const autoResume = await prisma.exportAutoResume.delete({
    where: { userId },
  }).catch(() => null); // Ignore if not found

  logger.info(LogCategory.EXPORT, "disableAutoResume END", { userId });
  return autoResume;
}

/**
 * Pause auto-resume due to quota exceeded
 */
export async function pauseAutoResumeForQuota(userId: string) {
  const pausedUntil = new Date(Date.now() + AUTO_RESUME_PAUSE_DURATION);

  logger.info(LogCategory.EXPORT, "pauseAutoResumeForQuota", {
    userId,
    pausedUntil: pausedUntil.toISOString(),
  });

  return await prisma.exportAutoResume.update({
    where: { userId },
    data: {
      status: "paused",
      pausedReason: "quota_exceeded",
      pausedUntil,
      lastAttempt: new Date(),
    },
  });
}

/**
 * Resume auto-resume if pause duration has passed
 */
export async function resumeAutoResumeIfReady(userId: string) {
  const autoResume = await prisma.exportAutoResume.findUnique({
    where: { userId },
  });

  if (!autoResume) return null;

  if (
    autoResume.status === "paused" &&
    autoResume.pausedUntil &&
    new Date() >= autoResume.pausedUntil
  ) {
    logger.info(LogCategory.EXPORT, "resumeAutoResumeIfReady - resuming", {
      userId,
    });

    return await prisma.exportAutoResume.update({
      where: { userId },
      data: {
        status: "active",
        pausedUntil: null,
        pausedReason: null,
        nextAttempt: new Date(),
      },
    });
  }

  return autoResume;
}

/**
 * Get current auto-resume status for a user
 */
export async function getAutoResumeStatus(userId: string) {
  const autoResume = await prisma.exportAutoResume.findUnique({
    where: { userId },
  });

  if (!autoResume) {
    return null;
  }

  // Check if pause duration has passed
  if (
    autoResume.status === "paused" &&
    autoResume.pausedUntil &&
    new Date() >= autoResume.pausedUntil
  ) {
    // Resume automatically
    return await resumeAutoResumeIfReady(userId);
  }

  return autoResume;
}

/**
 * Process one batch for a user with auto-resume enabled
 * Returns whether export is still in progress
 */
export async function processAutoResumeForUser(userId: string): Promise<{
  success: boolean;
  error?: string;
  resumed?: boolean;
  quotaExceeded?: boolean;
}> {
  logger.info(LogCategory.EXPORT, "processAutoResumeForUser START", { userId });

  try {
    // Check auto-resume status and resume if ready
    const autoResume = await resumeAutoResumeIfReady(userId);

    if (!autoResume) {
      logger.info(LogCategory.EXPORT, "processAutoResumeForUser - no auto-resume", {
        userId,
      });
      return { success: false, error: "Auto-resume not enabled" };
    }

    if (autoResume.status !== "active") {
      logger.info(LogCategory.EXPORT, "processAutoResumeForUser - not active", {
        userId,
        status: autoResume.status,
      });
      return { success: false, error: `Auto-resume paused: ${autoResume.pausedReason}` };
    }

    // Check if there's work to do
    const exportStatus = await getExportStatus(userId);

    if (!exportStatus.pendingSources && !exportStatus.inProgressSources) {
      logger.info(LogCategory.EXPORT, "processAutoResumeForUser - export complete", {
        userId,
      });
      return { success: true, error: "Export already complete" };
    }

    // Get user session for YouTubeService
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      logger.error(LogCategory.EXPORT, "processAutoResumeForUser - no session", { userId });
      return { success: false, error: "No session found" };
    }

    // Get user with YouTube token
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { accounts: true },
    });

    if (!user) {
      logger.error(LogCategory.EXPORT, "processAutoResumeForUser - user not found", {
        userId,
      });
      return { success: false, error: "User not found" };
    }

    // Get access token from Google OAuth account
    const googleAccount = user.accounts.find((acc) => acc.provider === "google");
    if (!googleAccount?.access_token) {
      logger.warn(LogCategory.EXPORT, "processAutoResumeForUser - no google token", {
        userId,
      });
      return { success: false, error: "No Google OAuth token found" };
    }

    // Process one batch
    const youtubeService = new YouTubeService(userId, googleAccount.access_token);
    const batchResult = await processBatch(userId, youtubeService);

    if (batchResult.shouldStop) {
      logger.info(LogCategory.EXPORT, "processAutoResumeForUser - quota exceeded", {
        userId,
        quotaUsed: batchResult.quotaUsedToday,
        ceiling: batchResult.quotaCeiling,
      });

      await pauseAutoResumeForQuota(userId);
      return { success: true, quotaExceeded: true };
    }

    logger.info(LogCategory.EXPORT, "processAutoResumeForUser END", {
      userId,
      videosImported: batchResult.videosImported,
      exportComplete: batchResult.exportComplete,
    });

    return { success: true, resumed: true };
  } catch (error) {
    logger.error(
      LogCategory.EXPORT,
      "processAutoResumeForUser FAILED",
      error instanceof Error ? error : undefined,
      { userId }
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all active auto-resumes that need processing
 */
export async function getActiveAutoResumes() {
  return await prisma.exportAutoResume.findMany({
    where: { status: "active" },
    select: { userId: true },
  });
}

/**
 * Get all paused auto-resumes that might be ready to resume
 */
export async function getPausedAutoResumes() {
  return await prisma.exportAutoResume.findMany({
    where: {
      status: "paused",
      pausedUntil: { lte: new Date() },
    },
    select: { userId: true },
  });
}
