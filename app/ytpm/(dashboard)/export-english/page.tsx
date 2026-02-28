"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { UI_TEXT } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { exportVideoLinks } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import type { ExportStatusResult, ExportBatchResult } from "@/types/export";
import {
  Play,
  Loader2,
  Download,
  CheckCircle2,
  AlertCircle,
  Languages,
  ListVideo,
  Database,
  PauseCircle,
  RefreshCw,
  Clock,
} from "lucide-react";

type ExportPhase =
  | "idle"
  | "initializing"
  | "exporting"
  | "paused"
  | "done"
  | "error";

interface AutoResumeStatus {
  id: string;
  status: "active" | "paused";
  pausedReason?: string | null;
  pausedUntil?: string | null;
  lastAttempt?: string | null;
  nextAttempt?: string | null;
}

export default function ExportEnglishPage() {
  const { toast } = useToast();
  const [phase, setPhase] = useState<ExportPhase>("idle");
  const [status, setStatus] = useState<ExportStatusResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentSource, setCurrentSource] = useState<string>("");
  const [batchCount, setBatchCount] = useState(0);
  const abortRef = useRef(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [autoResume, setAutoResume] = useState<AutoResumeStatus | null>(null);
  const [autoResumeEnabled, setAutoResumeEnabled] = useState(false);
  const [savingAutoResume, setSavingAutoResume] = useState(false);

  // Buscar status ao montar
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/export/status", { credentials: "include" });
      if (res.ok) {
        const data: ExportStatusResult = await res.json();
        setStatus(data);
      }
    } catch {
      // Silently fail on mount
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  // Buscar auto-resume status ao montar
  const fetchAutoResumeStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/export/auto-resume/status", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.autoResume) {
          setAutoResume(data.autoResume);
          setAutoResumeEnabled(data.autoResume.status === "active");
        }
      }
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchAutoResumeStatus();
  }, [fetchStatus, fetchAutoResumeStatus]);

  const handleStartExport = useCallback(async () => {
    setError(null);
    abortRef.current = false;

    // Se não há fontes, inicializar primeiro
    if (!status || status.totalSources === 0) {
      setPhase("initializing");
      try {
        const initRes = await fetch("/api/export/init", {
          method: "POST",
          credentials: "include",
        });
        if (!initRes.ok) {
          const err = await initRes.json();
          throw new Error(err.error || "Erro ao inicializar");
        }
        await fetchStatus();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao inicializar exportação"
        );
        setPhase("error");
        return;
      }
    }

    // Processar batches
    setPhase("exporting");
    setBatchCount(0);

    while (!abortRef.current) {
      try {
        const res = await fetch("/api/export/batch", {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Erro ao processar batch");
        }

        const batch: ExportBatchResult = await res.json();

        setBatchCount((c) => c + 1);
        if (batch.sourceTitle) {
          setCurrentSource(batch.sourceTitle);
        }

        // Atualizar status periodicamente
        await fetchStatus();

        if (batch.exportComplete) {
          setPhase("done");
          toast({
            title: UI_TEXT.general.success,
            description: UI_TEXT.exportEnglish.exportComplete,
            variant: "success",
          });
          break;
        }

        if (batch.shouldStop) {
          setPhase("paused");
          toast({
            title: "Quota",
            description: UI_TEXT.exportEnglish.exportPaused,
          });
          break;
        }

        // Pequeno delay para não travar a UI
        await new Promise((r) => setTimeout(r, 200));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : UI_TEXT.exportEnglish.scanError
        );
        setPhase("error");
        toast({
          title: UI_TEXT.general.error,
          description: UI_TEXT.exportEnglish.scanError,
          variant: "destructive",
        });
        break;
      }
    }

    if (abortRef.current) {
      setPhase("idle");
      await fetchStatus();
    }
  }, [status, toast, fetchStatus]);

  const handleCancel = useCallback(() => {
    abortRef.current = true;
  }, []);

  const handleAutoResumeToggle = useCallback(async (enabled: boolean) => {
    setSavingAutoResume(true);
    try {
      const endpoint = enabled
        ? "/api/export/auto-resume/enable"
        : "/api/export/auto-resume/disable";

      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao atualizar auto-resumo");
      }

      const data = await res.json();
      setAutoResumeEnabled(enabled);

      if (data.autoResume) {
        setAutoResume(data.autoResume);
      } else {
        setAutoResume(null);
      }

      toast({
        title: "Sucesso",
        description: enabled
          ? "Auto-resumo ativado. A exportação será retomada automaticamente."
          : "Auto-resumo desativado.",
        variant: "success",
      });
    } catch (err) {
      setAutoResumeEnabled(!enabled); // Revert toggle
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Erro ao atualizar auto-resumo",
        variant: "destructive",
      });
    } finally {
      setSavingAutoResume(false);
    }
  }, [toast]);

  const handleDownload = useCallback(async () => {
    try {
      const res = await fetch(
        "/api/export/videos?language=en&limit=100000",
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Erro ao buscar vídeos");
      const data = await res.json();
      const videoIds = data.videos.map(
        (v: { videoId: string }) => v.videoId
      );
      if (videoIds.length > 0) {
        exportVideoLinks(videoIds);
      }
    } catch {
      toast({
        title: UI_TEXT.general.error,
        description: "Erro ao baixar links.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const progressPercent =
    status && status.totalSources > 0
      ? Math.round((status.completedSources / status.totalSources) * 100)
      : 0;

  const quotaPercent =
    status && status.quotaCeiling > 0
      ? Math.round((status.quotaUsedToday / status.quotaCeiling) * 100)
      : 0;

  const hasIncompleteWork = status?.hasIncompleteWork ?? false;
  const isExporting = phase === "exporting" || phase === "initializing";

  if (loadingStatus) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={UI_TEXT.exportEnglish.title}
          description={UI_TEXT.exportEnglish.description}
          breadcrumbs={[
            { label: "Home", href: "/ytpm" },
            { label: UI_TEXT.nav.exportEnglish },
          ]}
        />
        <Card>
          <CardContent className="py-12 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

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

      {/* Stats Cards */}
      {status && status.totalSources > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <ListVideo className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">
                {status.totalVideosImported.toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-muted-foreground">
                {UI_TEXT.exportEnglish.totalVideos}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
            <Languages className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-primary">
                {status.englishVideosCount.toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-muted-foreground">
                {UI_TEXT.exportEnglish.englishVideos}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <Database className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">
                {status.completedSources} / {status.totalSources}
              </p>
              <p className="text-xs text-muted-foreground">
                {UI_TEXT.exportEnglish.sourcesCompleted}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <RefreshCw className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-bold">
                {status.lastImportedAt
                  ? new Date(status.lastImportedAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {UI_TEXT.exportEnglish.lastImport}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-5 w-5 text-primary" />
            {UI_TEXT.exportEnglish.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {UI_TEXT.exportEnglish.description}
          </p>

          {/* Quota info */}
          {status && status.quotaUsedToday > 0 && (
            <p className="text-xs text-muted-foreground">
              {t(UI_TEXT.exportEnglish.quotaInfo, {
                used: status.quotaUsedToday,
                ceiling: status.quotaCeiling,
                percent: quotaPercent,
              })}
            </p>
          )}

          <div className="flex gap-2">
            <Button
              size="lg"
              onClick={handleStartExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {phase === "initializing"
                    ? UI_TEXT.exportEnglish.initializing
                    : UI_TEXT.exportEnglish.exporting}
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  {hasIncompleteWork
                    ? UI_TEXT.exportEnglish.continueExport
                    : UI_TEXT.exportEnglish.startExport}
                </>
              )}
            </Button>
            {isExporting && (
              <Button variant="outline" size="lg" onClick={handleCancel}>
                {UI_TEXT.general.cancel}
              </Button>
            )}
          </div>

          {/* Auto-Resume Section */}
          {hasIncompleteWork && (
            <div className="mt-6 pt-6 border-t space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Auto-retomar exportação</label>
                  <p className="text-xs text-muted-foreground">
                    A exportação será retomada automaticamente a cada 30 minutos
                  </p>
                </div>
                <Switch
                  checked={autoResumeEnabled}
                  onCheckedChange={handleAutoResumeToggle}
                  disabled={savingAutoResume}
                />
              </div>

              {/* Auto-Resume Status */}
              {autoResume && (
                <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-2">
                  {autoResume.status === "active" ? (
                    <div className="flex items-center gap-2 text-primary">
                      <Clock className="h-4 w-4" />
                      <span>Ativo - Verificando a cada 30 minutos</span>
                    </div>
                  ) : autoResume.status === "paused" && autoResume.pausedUntil ? (
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <Clock className="h-4 w-4" />
                      <span>
                        Pausado por falta de quota até{" "}
                        {new Date(autoResume.pausedUntil).toLocaleTimeString("pt-BR")}
                      </span>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress */}
      {isExporting && status && (
        <Card>
          <CardContent className="py-6 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t(UI_TEXT.exportEnglish.progress, {
                  current: status.completedSources,
                  total: status.totalSources,
                })}
              </span>
              <span className="font-medium">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} />
            {currentSource && (
              <p className="text-sm text-muted-foreground truncate">
                {UI_TEXT.exportEnglish.currentSource}{" "}
                <span className="font-medium text-foreground">
                  {currentSource}
                </span>
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Batches processados: {batchCount}</span>
              <span>
                Vídeos importados:{" "}
                {status.totalVideosImported.toLocaleString("pt-BR")}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paused (quota ceiling) */}
      {phase === "paused" && (
        <Card className="border-amber-500/50">
          <CardContent className="py-6">
            <div className="flex items-center gap-3">
              <PauseCircle className="h-5 w-5 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-400">
                {UI_TEXT.exportEnglish.exportPaused}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {phase === "error" && error && (
        <Card className="border-destructive">
          <CardContent className="py-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Done */}
      {phase === "done" && (
        <Card className="border-green-500/50">
          <CardContent className="py-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-400">
                {UI_TEXT.exportEnglish.exportComplete}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No data yet */}
      {status && status.totalSources === 0 && phase === "idle" && (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground text-center">
              {UI_TEXT.exportEnglish.neverImported}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Download English links */}
      {status && status.englishVideosCount > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Languages className="h-5 w-5 text-primary" />
              {UI_TEXT.exportEnglish.results}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {status.englishVideosCount.toLocaleString("pt-BR")}{" "}
              {UI_TEXT.exportEnglish.englishVideos}
            </p>
            <Button size="lg" onClick={handleDownload}>
              <Download className="mr-2 h-5 w-5" />
              {UI_TEXT.exportEnglish.downloadFile}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
