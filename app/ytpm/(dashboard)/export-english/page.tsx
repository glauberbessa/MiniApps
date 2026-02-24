"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Progress } from "@/components/ui/progress";
import { UI_TEXT } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { exportVideoLinks } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import {
  Languages,
  Play,
  Loader2,
  Download,
  CheckCircle2,
  AlertCircle,
  Music,
  ListVideo,
  Filter,
} from "lucide-react";

type ScanStatus = "idle" | "loading" | "done" | "error";

interface ScanProgress {
  current: number;
  total: number;
  currentPlaylist: string;
}

interface ScanResults {
  totalVideos: number;
  englishVideoIds: string[];
  duplicatesRemoved: number;
  playlistsScanned: number;
  playlistErrors: number;
}

export default function ExportEnglishPage() {
  const { toast } = useToast();
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [progress, setProgress] = useState<ScanProgress>({
    current: 0,
    total: 0,
    currentPlaylist: "",
  });
  const [results, setResults] = useState<ScanResults>({
    totalVideos: 0,
    englishVideoIds: [],
    duplicatesRemoved: 0,
    playlistsScanned: 0,
    playlistErrors: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const handleStartScan = useCallback(async () => {
    setStatus("loading");
    setError(null);
    abortRef.current = false;

    try {
      // 1. Buscar todas as playlists
      const playlistsRes = await fetch(`/api/playlists?t=${Date.now()}`);
      if (!playlistsRes.ok) {
        throw new Error("Erro ao buscar playlists");
      }
      const playlists: Array<{ id: string; title: string; itemCount: number }> =
        await playlistsRes.json();

      setProgress({ current: 0, total: playlists.length, currentPlaylist: "" });

      const englishVideoIds = new Map<string, boolean>();
      let totalVideos = 0;
      let playlistErrors = 0;

      // 2. Para cada playlist, buscar vídeos
      for (let i = 0; i < playlists.length; i++) {
        if (abortRef.current) break;

        const playlist = playlists[i];
        setProgress({
          current: i + 1,
          total: playlists.length,
          currentPlaylist: playlist.title,
        });

        try {
          const videosRes = await fetch(
            `/api/playlists/${playlist.id}/items?t=${Date.now()}`
          );
          if (!videosRes.ok) {
            playlistErrors++;
            continue;
          }

          const videos: Array<{ videoId: string; language: string }> =
            await videosRes.json();
          totalVideos += videos.length;

          // 3. Filtrar inglês
          for (const video of videos) {
            if (video.language && video.language.startsWith("en")) {
              englishVideoIds.set(video.videoId, true);
            }
          }
        } catch {
          playlistErrors++;
        }
      }

      if (abortRef.current) {
        setStatus("idle");
        return;
      }

      // 4. Resultado
      const uniqueIds = Array.from(englishVideoIds.keys());
      const totalEnglishBeforeDedup = totalVideos; // aprox
      setResults({
        totalVideos,
        englishVideoIds: uniqueIds,
        duplicatesRemoved: Math.max(0, totalEnglishBeforeDedup - uniqueIds.length),
        playlistsScanned: playlists.length,
        playlistErrors,
      });
      setStatus("done");

      toast({
        title: UI_TEXT.general.success,
        description: t(UI_TEXT.exportEnglish.scanComplete),
        variant: "success",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : UI_TEXT.exportEnglish.scanError
      );
      setStatus("error");
      toast({
        title: UI_TEXT.general.error,
        description: UI_TEXT.exportEnglish.scanError,
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleCancel = useCallback(() => {
    abortRef.current = true;
  }, []);

  const handleDownload = useCallback(() => {
    if (results.englishVideoIds.length > 0) {
      exportVideoLinks(results.englishVideoIds);
    }
  }, [results.englishVideoIds]);

  const progressPercent =
    progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={UI_TEXT.exportEnglish.title}
        description={UI_TEXT.exportEnglish.description}
        breadcrumbs={[
          { label: "Home", href: "/ytpm" },
          { label: UI_TEXT.nav.exportEnglish },
        ]}
      />

      {/* Action Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Languages className="h-5 w-5 text-primary" />
            {UI_TEXT.exportEnglish.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {UI_TEXT.exportEnglish.description}
          </p>

          <div className="flex gap-2">
            <Button
              size="lg"
              onClick={handleStartScan}
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {UI_TEXT.exportEnglish.scanning}
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  {UI_TEXT.exportEnglish.startScan}
                </>
              )}
            </Button>
            {status === "loading" && (
              <Button variant="outline" size="lg" onClick={handleCancel}>
                {UI_TEXT.general.cancel}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      {status === "loading" && (
        <Card>
          <CardContent className="py-6 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t(UI_TEXT.exportEnglish.progress, {
                  current: progress.current,
                  total: progress.total,
                })}
              </span>
              <span className="font-medium">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} />
            {progress.currentPlaylist && (
              <p className="text-sm text-muted-foreground truncate">
                {UI_TEXT.exportEnglish.currentPlaylist}{" "}
                <span className="font-medium text-foreground">
                  {progress.currentPlaylist}
                </span>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {status === "error" && error && (
        <Card className="border-destructive">
          <CardContent className="py-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {status === "done" && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                {UI_TEXT.exportEnglish.results}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-lg border p-4">
                  <ListVideo className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{results.totalVideos}</p>
                    <p className="text-xs text-muted-foreground">
                      {UI_TEXT.exportEnglish.totalVideos}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <Music className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {results.englishVideoIds.length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {UI_TEXT.exportEnglish.englishVideos}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border p-4">
                  <Filter className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold">
                      {results.playlistsScanned}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Playlists varridas
                    </p>
                  </div>
                </div>
              </div>

              {results.playlistErrors > 0 && (
                <p className="text-sm text-amber-600">
                  {results.playlistErrors} playlist(s) com erro durante a
                  varredura.
                </p>
              )}

              {results.englishVideoIds.length > 0 ? (
                <Button size="lg" onClick={handleDownload}>
                  <Download className="mr-2 h-5 w-5" />
                  {UI_TEXT.exportEnglish.downloadFile}
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {UI_TEXT.exportEnglish.noEnglishVideos}
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
