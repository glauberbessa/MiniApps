import { prisma } from "./prisma";
import { QUOTA_COSTS, DAILY_QUOTA_LIMIT, QuotaStatus, QuotaHistoryItem } from "@/types/quota";
import { logger } from "./logger";

export async function trackQuotaUsage(
  userId: string,
  endpoint: string,
  multiplier: number = 1
): Promise<void> {
  const cost = (QUOTA_COSTS[endpoint] || 0) * multiplier;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  logger.debug("YOUTUBE_API", "trackQuotaUsage", {
    userId,
    endpoint,
    cost,
    multiplier,
    date: today.toISOString(),
  });

  try {
    await prisma.quotaHistory.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        consumedUnits: { increment: cost },
      },
      create: {
        userId,
        date: today,
        consumedUnits: cost,
        dailyLimit: DAILY_QUOTA_LIMIT,
      },
    });

    logger.debug("YOUTUBE_API", "trackQuotaUsage - Recorded successfully", {
      userId,
      endpoint,
      cost,
    });
  } catch (error) {
    logger.error("DATABASE", "trackQuotaUsage FAILED", error instanceof Error ? error : undefined, {
      userId,
      endpoint,
      cost,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function getQuotaStatus(userId: string): Promise<QuotaStatus> {
  logger.debug("YOUTUBE_API", "getQuotaStatus called", { userId });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const quota = await prisma.quotaHistory.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    const consumedUnits = quota?.consumedUnits || 0;
    const dailyLimit = DAILY_QUOTA_LIMIT;
    const status: QuotaStatus = {
      date: today.toISOString(),
      consumedUnits,
      dailyLimit,
      remainingUnits: dailyLimit - consumedUnits,
      percentUsed: (consumedUnits / dailyLimit) * 100,
    };

    logger.debug("YOUTUBE_API", "getQuotaStatus result", {
      userId,
      consumedUnits: status.consumedUnits,
      remainingUnits: status.remainingUnits,
      percentUsed: `${status.percentUsed.toFixed(1)}%`,
    });

    return status;
  } catch (error) {
    logger.error("DATABASE", "getQuotaStatus FAILED", error instanceof Error ? error : undefined, {
      userId,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function checkQuotaAvailable(
  userId: string,
  requiredUnits: number
): Promise<boolean> {
  logger.info("YOUTUBE_API", "checkQuotaAvailable", {
    userId,
    requiredUnits,
  });

  const status = await getQuotaStatus(userId);
  const available = status.remainingUnits >= requiredUnits;

  logger.info("YOUTUBE_API", "checkQuotaAvailable result", {
    userId,
    requiredUnits,
    remainingUnits: status.remainingUnits,
    available,
    consumedUnits: status.consumedUnits,
    percentUsed: `${status.percentUsed.toFixed(1)}%`,
  });

  return available;
}

export async function getQuotaHistory(
  userId: string,
  days: number = 7
): Promise<QuotaHistoryItem[]> {
  logger.debug("YOUTUBE_API", "getQuotaHistory called", { userId, days });

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  try {
    const history = await prisma.quotaHistory.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    logger.debug("YOUTUBE_API", "getQuotaHistory result", {
      userId,
      days,
      recordsFound: history.length,
    });

    return history.map((item) => ({
      date: item.date.toISOString(),
      consumedUnits: item.consumedUnits,
      dailyLimit: item.dailyLimit,
    }));
  } catch (error) {
    logger.error("DATABASE", "getQuotaHistory FAILED", error instanceof Error ? error : undefined, {
      userId,
      days,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Calculations moved to ./quota.shared.ts
