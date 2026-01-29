"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTransfer } from "@/hooks/useTransfer";
import { useQuota } from "@/hooks/useQuota";
import { useToast } from "@/components/ui/use-toast";
import { calculateTransferCost } from "@/lib/quota.shared";
import { UI_TEXT, t } from "@/lib/i18n";
import { formatNumber } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Loader2, ArrowRight, Video } from "lucide-react";

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourcePlaylistId: string;
  destinationPlaylistId: string;
  videos: Array<{ playlistItemId: string; videoId: string }>;
  onSuccess: () => void;
}

export function TransferDialog({
  open,
  onOpenChange,
  sourcePlaylistId,
  destinationPlaylistId,
  videos,
  onSuccess,
}: TransferDialogProps) {
  const { toast } = useToast();
  const { data: quota } = useQuota();
  const transferMutation = useTransfer();

  const quotaCost = calculateTransferCost(videos.length);
  const hasQuota = quota && quota.remainingUnits >= quotaCost;

  const handleTransfer = async () => {
    try {
      const result = await transferMutation.mutateAsync({
        sourcePlaylistId,
        destinationPlaylistId,
        videos,
      });

      if (result.success) {
        toast({
          title: UI_TEXT.transfer.success,
          description: t(UI_TEXT.messages.transferSuccess, {
            count: result.transferred,
          }),
          variant: "success",
        });
        onSuccess();
        onOpenChange(false);
        // Open the destination playlist on YouTube
        window.open(
          `https://www.youtube.com/playlist?list=${destinationPlaylistId}`,
          "_blank"
        );
      } else {
        toast({
          title: UI_TEXT.general.error,
          description: t(UI_TEXT.messages.transferPartial, {
            success: result.transferred,
            errors: result.errors,
          }),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: UI_TEXT.transfer.error,
        description:
          error instanceof Error ? error.message : UI_TEXT.messages.transferError,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="transfer-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" aria-hidden="true" />
            {UI_TEXT.transfer.title}
          </DialogTitle>
          <DialogDescription id="transfer-description">
            {t(UI_TEXT.transfer.description, { count: videos.length })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Transfer Summary */}
          <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-muted/50">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{videos.length}</div>
              <div className="text-xs text-muted-foreground">
                {videos.length === 1 ? "vídeo" : "vídeos"}
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                <CheckCircle className="h-6 w-6 inline" aria-hidden="true" />
              </div>
              <div className="text-xs text-muted-foreground">destino</div>
            </div>
          </div>

          {/* Quota Info */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Custo de quota</span>
              <span className="font-medium">{formatNumber(quotaCost)} unidades</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Quota disponível</span>
              <span className={`font-medium ${hasQuota ? "text-success" : "text-destructive"}`}>
                {formatNumber(quota?.remainingUnits || 0)} unidades
              </span>
            </div>
            {quota && (
              <div className="space-y-1">
                <Progress
                  value={quota.percentUsed}
                  className="h-2"
                  aria-label={`${quota.percentUsed}% da quota utilizada`}
                />
                <div className="text-xs text-muted-foreground text-right">
                  {quota.percentUsed.toFixed(0)}% utilizado
                </div>
              </div>
            )}
          </div>

          {/* Warning if no quota */}
          {!hasQuota && (
            <div
              className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4"
              role="alert"
            >
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-sm text-destructive">
                {UI_TEXT.transfer.quotaInsufficient}
              </div>
            </div>
          )}

          {/* Loading state with progress indication */}
          {transferMutation.isPending && (
            <div
              className="flex items-center justify-center gap-3 p-4 rounded-lg bg-primary/10 animate-pulse"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
              <span className="text-sm font-medium text-primary">
                Transferindo vídeos... Aguarde.
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={transferMutation.isPending}
          >
            {UI_TEXT.general.cancel}
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={!hasQuota || transferMutation.isPending}
            aria-busy={transferMutation.isPending}
          >
            {transferMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                {UI_TEXT.transfer.inProgress}
              </>
            ) : (
              <>
                {UI_TEXT.transfer.confirm}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
