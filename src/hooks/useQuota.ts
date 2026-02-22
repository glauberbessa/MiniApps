"use client";

import { useQuery } from "@tanstack/react-query";
import { QuotaStatus, QuotaHistoryItem } from "@/types/quota";

async function fetchQuotaStatus(): Promise<QuotaStatus> {
  console.log(`[HOOK:useQuota] Fetching quota status | timestamp: ${new Date().toISOString()}`);
  const startTime = Date.now();

  const res = await fetch("/api/quota", { credentials: "include" });

  const elapsed = Date.now() - startTime;
  console.log(`[HOOK:useQuota] Response received | status: ${res.status} ${res.statusText} | ok: ${res.ok} | elapsed: ${elapsed}ms`);

  if (!res.ok) {
    let errorDetails = "";
    try {
      const errorBody = await res.json();
      errorDetails = JSON.stringify(errorBody);
      console.error(`[HOOK:useQuota] ERROR response body: ${errorDetails}`);
    } catch {
      console.error(`[HOOK:useQuota] Could not parse error response body`);
    }
    throw new Error(`Erro ao buscar quota (HTTP ${res.status}: ${errorDetails || res.statusText})`);
  }

  const data = await res.json();
  console.log(`[HOOK:useQuota] SUCCESS | consumed: ${data.consumedUnits} | remaining: ${data.remainingUnits} | percent: ${data.percentUsed}%`);
  return data;
}

async function fetchQuotaHistory(): Promise<QuotaHistoryItem[]> {
  console.log(`[HOOK:useQuotaHistory] Fetching quota history | timestamp: ${new Date().toISOString()}`);
  const startTime = Date.now();

  const res = await fetch("/api/quota/history", { credentials: "include" });

  const elapsed = Date.now() - startTime;
  console.log(`[HOOK:useQuotaHistory] Response received | status: ${res.status} ${res.statusText} | ok: ${res.ok} | elapsed: ${elapsed}ms`);

  if (!res.ok) {
    let errorDetails = "";
    try {
      const errorBody = await res.json();
      errorDetails = JSON.stringify(errorBody);
      console.error(`[HOOK:useQuotaHistory] ERROR response body: ${errorDetails}`);
    } catch {
      console.error(`[HOOK:useQuotaHistory] Could not parse error response body`);
    }
    throw new Error(`Erro ao buscar histórico (HTTP ${res.status}: ${errorDetails || res.statusText})`);
  }

  const data = await res.json();
  console.log(`[HOOK:useQuotaHistory] SUCCESS | historyDays: ${Array.isArray(data) ? data.length : 'non-array'}`);
  return data;
}

export function useQuota() {
  return useQuery({
    queryKey: ["quota"],
    queryFn: fetchQuotaStatus,
    refetchInterval: 30000,
  });
}

export function useQuotaHistory() {
  return useQuery({
    queryKey: ["quotaHistory"],
    queryFn: fetchQuotaHistory,
  });
}
