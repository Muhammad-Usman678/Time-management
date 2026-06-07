"use client";

import { Progress } from "@/components/ui/progress";
import { useTimerStore } from "@/store/timerStore";
import { formatClock, cn } from "@/lib/utils";
import type { TimerPhase } from "@/store/timerStore";

const PHASE_LABELS: Record<TimerPhase, string> = {
  focus: "Focus",
  short_break: "Short Break",
  long_break: "Long Break",
};

export function TimerDisplay() {
  const phase = useTimerStore((s) => s.phase);
  const remainingSeconds = useTimerStore((s) => s.remainingSeconds);
  const plannedSeconds = useTimerStore((s) => s.plannedSeconds);
  const completedFocusBlocks = useTimerStore((s) => s.completedFocusBlocks);

  const isFocus = phase === "focus";
  const elapsedPct =
    plannedSeconds > 0
      ? ((plannedSeconds - remainingSeconds) / plannedSeconds) * 100
      : 0;

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <span
        className={cn(
          "text-xs font-medium uppercase tracking-wide",
          isFocus ? "text-primary" : "text-success"
        )}
      >
        {PHASE_LABELS[phase]}
      </span>

      <div className="font-mono text-6xl font-semibold tabular-nums tracking-tight sm:text-7xl">
        {formatClock(remainingSeconds)}
      </div>

      <Progress
        value={elapsedPct}
        className="w-full max-w-xs"
        indicatorClassName={isFocus ? "bg-primary" : "bg-success"}
      />

      {/* Completed focus blocks this cycle, shown as dots. */}
      {completedFocusBlocks > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            {Array.from({ length: completedFocusBlocks }).map((_, i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-primary"
                aria-hidden
              />
            ))}
          </div>
          <span>
            {completedFocusBlocks} completed
          </span>
        </div>
      )}
    </div>
  );
}
