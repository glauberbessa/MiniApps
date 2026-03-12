"use client";

import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Video } from "@/types/video";
import { cn, formatDuration, formatViewCount, formatDate, getLanguageName } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

interface VideoCardProps {
  video: Video;
  isSelected: boolean;
  onToggleSelect: (videoId: string) => void;
}

export function VideoCard({
  video,
  isSelected,
  onToggleSelect,
}: VideoCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border p-3 transition-all duration-200 cursor-pointer",
        isSelected
          ? "border-ytpm-accent bg-ytpm-accent/10"
          : "border-ytpm-border bg-ytpm-surface hover:bg-ytpm-surface/80"
      )}
      onClick={() => onToggleSelect(video.id)}
    >
      {/* Thumbnail + Checkbox */}
      <div className="flex gap-2 sm:gap-3">
        {/* Checkbox */}
        <div
          className="flex items-start pt-1 min-w-[44px] min-h-[44px] justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(video.id)}
            aria-label={`Selecionar ${video.title}`}
          />
        </div>

        {/* Thumbnail */}
        <div className="relative h-20 w-28 sm:w-32 overflow-hidden rounded flex-shrink-0">
          {video.thumbnailUrl ? (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="text-xs text-muted-foreground">N/A</span>
            </div>
          )}
          {/* Duration Badge */}
          <div className="absolute bottom-1 right-1 bg-black/75 px-1.5 py-0.5 rounded text-xs font-medium text-white">
            {formatDuration(video.durationInSeconds)}
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-ytpm-text line-clamp-2">
          {video.title}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="flex-shrink-0 -mr-2 min-w-[44px] min-h-[44px]"
          onClick={(e) => e.stopPropagation()}
        >
          <a
            href={`https://www.youtube.com/watch?v=${video.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4 text-ytpm-accent hover:text-ytpm-accent/80" />
          </a>
        </Button>
      </div>

      {/* Metadata */}
      <div className="space-y-2 text-xs text-ytpm-muted">
        {/* Channel */}
        <div className="flex items-center gap-2">
          <span className="font-medium text-ytpm-text">{video.channelTitle}</span>
        </div>

        {/* Stats Row 1: Views and Duration */}
        <div className="flex items-center gap-4">
          <span>{formatViewCount(video.viewCount)} views</span>
          {video.publishedAt && (
            <span>{formatDate(video.publishedAt)}</span>
          )}
        </div>

        {/* Language */}
        {video.language && (
          <div className="flex items-center gap-2">
            <span>
              {getLanguageName(video.language)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
