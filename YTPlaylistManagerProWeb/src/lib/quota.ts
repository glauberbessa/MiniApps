import { supabase } from "./supabase";
import { QUOTA_COSTS, DAILY_QUOTA_LIMIT, QuotaStatus, QuotaHistoryItem } from "@/types/quota";

export async function trackQuotaUsage(
  userId: string,
  endpoint: string,
  multiplier: number = 1
): Promise<void> {
  const cost = (QUOTA_COSTS[endpoint] || 0) * multiplier;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  // Try to find existing record
  const { data: existing, error: selectError } = await supabase
    .from("QuotaHistory")
    .select("consumedUnits")
    .eq("userId", userId)
    .eq("date", todayStr)
    .single();

  if (selectError && selectError.code !== 'PGRST116') throw selectError;

  if (existing) {
    // Update existing record
    const { error: updateError } = await supabase
      .from("QuotaHistory")
      .update({ consumedUnits: existing.consumedUnits + cost })
      .eq("userId", userId)
      .eq("date", todayStr);

    if (updateError) throw updateError;
  } else {
    // Create new record
    const { error: insertError } = await supabase
      .from("QuotaHistory")
      .insert({
        userId,
        date: todayStr,
        consumedUnits: cost,
        dailyLimit: DAILY_QUOTA_LIMIT,
      });

    if (insertError && insertError.code !== '23505') throw insertError;
  }
}

export async function getQuotaStatus(userId: string): Promise<QuotaStatus> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const { data: quota, error } = await supabase
    .from("QuotaHistory")
    .select("consumedUnits")
    .eq("userId", userId)
    .eq("date", todayStr)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  const consumedUnits = quota?.consumedUnits || 0;
  const dailyLimit = DAILY_QUOTA_LIMIT;

  return {
    date: today.toISOString(),
    consumedUnits,
    dailyLimit,
    remainingUnits: dailyLimit - consumedUnits,
    percentUsed: (consumedUnits / dailyLimit) * 100,
  };
}

export async function checkQuotaAvailable(
  userId: string,
  requiredUnits: number
): Promise<boolean> {
  const status = await getQuotaStatus(userId);
  return status.remainingUnits >= requiredUnits;
}

export async function getQuotaHistory(
  userId: string,
  days: number = 7
): Promise<QuotaHistoryItem[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);
  const startDateStr = startDate.toISOString().split('T')[0];

  const { data: history, error } = await supabase
    .from("QuotaHistory")
    .select("date, consumedUnits, dailyLimit")
    .eq("userId", userId)
    .gte("date", startDateStr)
    .order("date", { ascending: false });

  if (error) throw error;

  return (history || []).map((item) => ({
    date: new Date(item.date).toISOString(),
    consumedUnits: item.consumedUnits,
    dailyLimit: item.dailyLimit,
  }));
}

// Calculations moved to ./quota.shared.ts
