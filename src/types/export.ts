export interface ExportedVideoRow {
  id: string;
  videoId: string;
  title: string;
  channelId: string | null;
  channelTitle: string | null;
  language: string | null;
  sourceType: string;
  sourceId: string;
  sourceTitle: string | null;
  publishedAt: string | null;
  thumbnailUrl: string | null;
}

export interface ExportInitResult {
  playlistSources: number;
  channelSources: number;
  totalSources: number;
  alreadyCompleted: number;
}

export interface ExportBatchResult {
  sourceId: string;
  sourceTitle: string | null;
  sourceType: string;
  videosImported: number;
  hasMore: boolean;
  quotaUsedToday: number;
  quotaCeiling: number;
  shouldStop: boolean;
  exportComplete: boolean;
}

export interface ExportStatusResult {
  totalSources: number;
  completedSources: number;
  inProgressSources: number;
  pendingSources: number;
  totalVideosImported: number;
  englishVideosCount: number;
  quotaUsedToday: number;
  quotaCeiling: number;
  lastImportedAt: string | null;
  hasIncompleteWork: boolean;
}

export interface ExportVideosResult {
  videos: ExportedVideoRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
