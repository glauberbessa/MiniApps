"use client";

import { Video } from "@/types/video";
import { VideoTable } from "./VideoTable";
import { VideoCard } from "./VideoCard";
import { Button } from "@/components/ui/button";
import { UI_TEXT } from "@/lib/i18n";

interface VideoTableResponsiveProps {
  videos: Video[];
  selectedVideos: Set<string>;
  onToggleSelect: (videoId: string) => void;
  onToggleSelectAll: () => void;
}

export function VideoTableResponsive({
  videos,
  selectedVideos,
  onToggleSelect,
  onToggleSelectAll,
}: VideoTableResponsiveProps) {
  const allSelected = videos.length > 0 && videos.every((v) => selectedVideos.has(v.id));

  return (
    <div className="space-y-3">
      {/* Select All Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleSelectAll}
          disabled={videos.length === 0}
        >
          {allSelected ? "Limpar seleção" : "Selecionar todos"}
        </Button>
        <span className="text-sm text-muted-foreground">
          {videos.length} vídeos
        </span>
      </div>

      {/* Desktop: Table */}
      <div className="hidden md:block">
        <div className="rounded-md border">
          <VideoTable
            videos={videos}
            selectedVideos={selectedVideos}
            onToggleSelect={onToggleSelect}
            onToggleSelectAll={onToggleSelectAll}
          />
        </div>
      </div>

      {/* Mobile: Cards Grid */}
      <div className="md:hidden space-y-2">
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                isSelected={selectedVideos.has(video.id)}
                onToggleSelect={onToggleSelect}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-ytpm-border bg-ytpm-surface/50 p-6 text-center">
            <p className="text-sm text-ytpm-muted">
              {UI_TEXT.playlists.noVideos}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
