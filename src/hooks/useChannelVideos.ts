"use client";

import { useQuery } from "@tanstack/react-query";
import { Video } from "@/types";

async function fetchChannelVideos(channelId: string): Promise<Video[]> {
  console.log(`[HOOK:useChannelVideos] Fetching channel videos | channelId: ${channelId} | timestamp: ${new Date().toISOString()}`);
  const startTime = Date.now();

  const res = await fetch(`/api/channels/${channelId}/videos`, {
    credentials: "include",
  });

  const elapsed = Date.now() - startTime;
  console.log(`[HOOK:useChannelVideos] Response received | status: ${res.status} ${res.statusText} | ok: ${res.ok} | elapsed: ${elapsed}ms | channelId: ${channelId}`);
  console.log(`[HOOK:useChannelVideos] Response headers: content-type=${res.headers.get('content-type')} | content-length=${res.headers.get('content-length')}`);

  if (!res.ok) {
    let errorDetails = "";
    try {
      const errorBody = await res.json();
      errorDetails = JSON.stringify(errorBody);
      console.error(`[HOOK:useChannelVideos] ERROR response body: ${errorDetails}`);
    } catch {
      console.error(`[HOOK:useChannelVideos] Could not parse error response body`);
    }
    throw new Error(`Erro ao buscar vídeos (HTTP ${res.status}: ${errorDetails || res.statusText})`);
  }

  const data = await res.json();
  console.log(`[HOOK:useChannelVideos] SUCCESS | videos: ${Array.isArray(data) ? data.length : 'non-array'} | channelId: ${channelId}`);
  return data;
}

export function useChannelVideos(channelId: string | null) {
  return useQuery({
    queryKey: ["channelVideos", channelId],
    queryFn: () => fetchChannelVideos(channelId!),
    enabled: !!channelId,
    staleTime: 5 * 60 * 1000,
  });
}
