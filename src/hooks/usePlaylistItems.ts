"use client";

import { useQuery } from "@tanstack/react-query";
import { Video } from "@/types";

async function fetchPlaylistItems(playlistId: string): Promise<Video[]> {
  console.log(`[HOOK:usePlaylistItems] Fetching playlist items | playlistId: ${playlistId} | timestamp: ${new Date().toISOString()}`);
  const startTime = Date.now();

  const res = await fetch(`/api/playlists/${playlistId}/items`, {
    credentials: "include",
  });

  const elapsed = Date.now() - startTime;
  console.log(`[HOOK:usePlaylistItems] Response received | status: ${res.status} ${res.statusText} | ok: ${res.ok} | elapsed: ${elapsed}ms | playlistId: ${playlistId}`);
  console.log(`[HOOK:usePlaylistItems] Response headers: content-type=${res.headers.get('content-type')} | content-length=${res.headers.get('content-length')}`);

  if (!res.ok) {
    let errorDetails = "";
    try {
      const errorBody = await res.json();
      errorDetails = JSON.stringify(errorBody);
      console.error(`[HOOK:usePlaylistItems] ERROR response body: ${errorDetails}`);
    } catch {
      console.error(`[HOOK:usePlaylistItems] Could not parse error response body`);
    }
    throw new Error(`Erro ao buscar vídeos (HTTP ${res.status}: ${errorDetails || res.statusText})`);
  }

  const data = await res.json();
  console.log(`[HOOK:usePlaylistItems] SUCCESS | items: ${Array.isArray(data) ? data.length : 'non-array'} | playlistId: ${playlistId}`);
  return data;
}

export function usePlaylistItems(playlistId: string | null) {
  return useQuery({
    queryKey: ["playlistItems", playlistId],
    queryFn: () => fetchPlaylistItems(playlistId!),
    enabled: !!playlistId,
    staleTime: 5 * 60 * 1000,
  });
}
