"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

interface TransferRequest {
  sourcePlaylistId: string;
  destinationPlaylistId: string;
  videos: Array<{
    playlistItemId: string;
    videoId: string;
  }>;
}

interface TransferResponse {
  success: boolean;
  transferred: number;
  errors: number;
  details: Array<{
    videoId: string;
    status: "success" | "error";
    error?: string;
  }>;
}

async function transferVideos(data: TransferRequest): Promise<TransferResponse> {
  console.log(`[HOOK:useTransfer] Transferring videos | source: ${data.sourcePlaylistId} | dest: ${data.destinationPlaylistId} | count: ${data.videos.length} | timestamp: ${new Date().toISOString()}`);
  const startTime = Date.now();

  const res = await fetch("/api/playlists/transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });

  const elapsed = Date.now() - startTime;
  console.log(`[HOOK:useTransfer] Response received | status: ${res.status} ${res.statusText} | ok: ${res.ok} | elapsed: ${elapsed}ms`);

  if (!res.ok) {
    let errorDetails = "";
    try {
      const errorBody = await res.json();
      errorDetails = JSON.stringify(errorBody);
      console.error(`[HOOK:useTransfer] ERROR response body: ${errorDetails}`);
    } catch {
      console.error(`[HOOK:useTransfer] Could not parse error response body`);
    }
    throw new Error(errorDetails ? JSON.parse(errorDetails)?.error || `HTTP ${res.status}` : "Erro ao transferir vídeos");
  }

  const result = await res.json();
  console.log(`[HOOK:useTransfer] SUCCESS | transferred: ${result.transferred} | errors: ${result.errors} | success: ${result.success}`);
  return result;
}

export function useTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transferVideos,
    onSuccess: (result, variables) => {
      console.log(`[HOOK:useTransfer] onSuccess - Invalidating queries | source: ${variables.sourcePlaylistId} | dest: ${variables.destinationPlaylistId} | transferred: ${result.transferred}`);
      queryClient.invalidateQueries({
        queryKey: ["playlistItems", variables.sourcePlaylistId],
      });
      queryClient.invalidateQueries({
        queryKey: ["playlistItems", variables.destinationPlaylistId],
      });
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      queryClient.invalidateQueries({ queryKey: ["quota"] });
    },
    onError: (error) => {
      console.error(`[HOOK:useTransfer] onError: ${error instanceof Error ? error.message : String(error)}`);
    },
  });
}

interface AssignRequest {
  playlistId: string;
  videoIds: string[];
}

interface AssignResponse {
  success: boolean;
  added: number;
  errors: number;
  details: Array<{
    videoId: string;
    status: "success" | "error";
    error?: string;
  }>;
}

async function assignVideos(data: AssignRequest): Promise<AssignResponse> {
  console.log(`[HOOK:useAssign] Assigning videos | playlistId: ${data.playlistId} | count: ${data.videoIds.length} | timestamp: ${new Date().toISOString()}`);
  const startTime = Date.now();

  const res = await fetch("/api/channels/assign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });

  const elapsed = Date.now() - startTime;
  console.log(`[HOOK:useAssign] Response received | status: ${res.status} ${res.statusText} | ok: ${res.ok} | elapsed: ${elapsed}ms`);

  if (!res.ok) {
    let errorDetails = "";
    try {
      const errorBody = await res.json();
      errorDetails = JSON.stringify(errorBody);
      console.error(`[HOOK:useAssign] ERROR response body: ${errorDetails}`);
    } catch {
      console.error(`[HOOK:useAssign] Could not parse error response body`);
    }
    throw new Error(errorDetails ? JSON.parse(errorDetails)?.error || `HTTP ${res.status}` : "Erro ao atribuir vídeos");
  }

  const result = await res.json();
  console.log(`[HOOK:useAssign] SUCCESS | added: ${result.added} | errors: ${result.errors} | success: ${result.success}`);
  return result;
}

export function useAssign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignVideos,
    onSuccess: (result, variables) => {
      console.log(`[HOOK:useAssign] onSuccess - Invalidating queries | playlistId: ${variables.playlistId} | added: ${result.added}`);
      queryClient.invalidateQueries({
        queryKey: ["playlistItems", variables.playlistId],
      });
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      queryClient.invalidateQueries({ queryKey: ["quota"] });
    },
    onError: (error) => {
      console.error(`[HOOK:useAssign] onError: ${error instanceof Error ? error.message : String(error)}`);
    },
  });
}

interface RemoveRequest {
  sourcePlaylistId: string;
  videos: Array<{
    playlistItemId: string;
    videoId: string;
  }>;
}

interface RemoveResponse {
  success: boolean;
  removed: number;
  errors: number;
  details: Array<{
    videoId: string;
    status: "success" | "error";
    error?: string;
  }>;
}

async function removeVideosFromPlaylist(
  data: RemoveRequest
): Promise<RemoveResponse> {
  console.log(`[HOOK:useRemoveFromPlaylist] Removing videos | sourcePlaylistId: ${data.sourcePlaylistId} | count: ${data.videos.length} | timestamp: ${new Date().toISOString()}`);
  const startTime = Date.now();

  const res = await fetch("/api/playlists/remove", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });

  const elapsed = Date.now() - startTime;
  console.log(`[HOOK:useRemoveFromPlaylist] Response received | status: ${res.status} ${res.statusText} | ok: ${res.ok} | elapsed: ${elapsed}ms`);

  if (!res.ok) {
    let errorDetails = "";
    try {
      const errorBody = await res.json();
      errorDetails = JSON.stringify(errorBody);
      console.error(`[HOOK:useRemoveFromPlaylist] ERROR response body: ${errorDetails}`);
    } catch {
      console.error(`[HOOK:useRemoveFromPlaylist] Could not parse error response body`);
    }
    throw new Error(errorDetails ? JSON.parse(errorDetails)?.error || `HTTP ${res.status}` : "Erro ao remover vídeos");
  }

  const result = await res.json();
  console.log(`[HOOK:useRemoveFromPlaylist] SUCCESS | removed: ${result.removed} | errors: ${result.errors} | success: ${result.success}`);
  return result;
}

export function useRemoveFromPlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeVideosFromPlaylist,
    onSuccess: (result, variables) => {
      console.log(`[HOOK:useRemoveFromPlaylist] onSuccess - Invalidating queries | sourcePlaylistId: ${variables.sourcePlaylistId} | removed: ${result.removed}`);
      queryClient.invalidateQueries({
        queryKey: ["playlistItems", variables.sourcePlaylistId],
      });
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      queryClient.invalidateQueries({ queryKey: ["quota"] });
    },
    onError: (error) => {
      console.error(`[HOOK:useRemoveFromPlaylist] onError: ${error instanceof Error ? error.message : String(error)}`);
    },
  });
}
