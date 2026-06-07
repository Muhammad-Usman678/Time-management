"use client";

import { useState } from "react";
import { Check, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  useFocusSessions,
  useDeleteFocusSession,
} from "@/hooks/useFocusSessions";
import { formatDuration } from "@/lib/utils";
import { formatTime } from "@/lib/dates";
import type { FocusSession, FocusType } from "@/lib/types";

const TYPE_LABELS: Record<FocusType, string> = {
  pomodoro: "Pomodoro",
  custom: "Custom",
  manual: "Manual",
};

export function SessionList() {
  const { data: sessions, isLoading } = useFocusSessions("day");
  const deleteSession = useDeleteFocusSession();
  const [pendingDelete, setPendingDelete] = useState<FocusSession | null>(null);

  const totalSeconds =
    sessions?.reduce((sum, s) => sum + s.elapsedSeconds, 0) ?? 0;

  function confirmDelete() {
    if (!pendingDelete) return;
    deleteSession.mutate(pendingDelete.id, {
      onSuccess: () => setPendingDelete(null),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold tracking-tight">Today</h2>
        <span className="text-xs text-muted-foreground">
          {formatDuration(totalSeconds)} focused
        </span>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : !sessions || sessions.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No sessions yet"
          description="Start the timer to log your first focus session today."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-sm font-medium">
                  {session.task?.title ?? "No task"}
                </span>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">
                    {TYPE_LABELS[session.type]}
                  </Badge>
                  <span>{formatTime(session.startedAt)}</span>
                  <span>·</span>
                  <span>{formatDuration(session.elapsedSeconds)}</span>
                  {session.completed && (
                    <Check size={14} className="text-success" aria-label="Completed" />
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => setPendingDelete(session)}
                aria-label="Delete session"
              >
                <Trash2 size={16} />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Delete focus session?"
        description="This will permanently remove this session from your logs."
        confirmText="Delete"
        destructive
        loading={deleteSession.isPending}
      />
    </div>
  );
}
