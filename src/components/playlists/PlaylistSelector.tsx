"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PlaylistWithConfig } from "@/types/playlist";
import { UI_TEXT } from "@/lib/i18n";
import { formatNumber } from "@/lib/utils";

interface PlaylistSelectorProps {
  value: string | null;
  onChange: (value: string) => void;
  label: string;
  excludeId?: string;
  showOnlyEnabled?: boolean;
}

async function fetchPlaylists(): Promise<PlaylistWithConfig[]> {
  const res = await fetch(`/api/playlists?t=${Date.now()}`, {
    credentials: "include",
  });
  if (!res.ok) {
    let errorMessage = `Erro ${res.status}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      errorMessage = `Erro ${res.status}: ${res.statusText || "Erro desconhecido"}`;
    }
    throw new Error(errorMessage);
  }
  return res.json();
}

export function PlaylistSelector({
  value,
  onChange,
  label,
  excludeId,
  showOnlyEnabled = false,
}: PlaylistSelectorProps) {
  const {
    data: playlists,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["playlists"],
    queryFn: fetchPlaylists,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {label && <label className="text-sm font-medium">{label}</label>}
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isError) {
    const isAuthError = error?.message?.includes("Sessão expirada") ||
      error?.message?.includes("Não autorizado") ||
      error?.message?.includes("401");

    return (
      <div className="space-y-2">
        {label && <label className="text-sm font-medium">{label}</label>}
        <div className="text-sm text-destructive p-2 border border-destructive/50 rounded-md space-y-2">
          <p>
            {isAuthError
              ? "Sessão expirada. Faça login novamente para acessar suas playlists."
              : `Erro ao carregar playlists: ${error?.message || "Erro desconhecido"}`}
          </p>
          <button
            onClick={() => refetch()}
            className="text-xs underline hover:no-underline text-destructive/80 hover:text-destructive"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const filteredPlaylists = playlists?.filter((p) => {
    if (excludeId && p.id === excludeId) return false;
    if (showOnlyEnabled && p.config?.isEnabled === false) return false;
    return true;
  });

  if (!filteredPlaylists || filteredPlaylists.length === 0) {
    return (
      <div className="space-y-2">
        {label && <label className="text-sm font-medium">{label}</label>}
        <div className="text-sm text-muted-foreground p-2 border border-dashed rounded-md">
          Nenhuma playlist encontrada. Verifique se você tem playlists no YouTube.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium">
          {label}
        </label>
      )}
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={UI_TEXT.playlists.selectPlaylist} />
        </SelectTrigger>
        <SelectContent>
          {filteredPlaylists.map((playlist) => (
            <SelectItem key={playlist.id} value={playlist.id}>
              <div className="flex items-center justify-between gap-4">
                <span className="truncate">{playlist.title}</span>
                <span className="text-xs text-muted-foreground">
                  {formatNumber(playlist.itemCount)} vídeos
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
