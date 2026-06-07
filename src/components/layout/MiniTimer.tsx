"use client";

import Link from "next/link";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTimerStore } from "@/store/timerStore";
import { formatClock } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { TimerPhase } from "@/store/timerStore";

const PHASE_LABELS: Record<TimerPhase, string> = {
  focus: "Focus",
  short_break: "Short break",
  long_break: "Long break",
};

export function MiniTimer() {
  const status = useTimerStore((s) => s.status);
  const phase = useTimerStore((s) => s.phase);
  const remainingSeconds = useTimerStore((s) => s.remainingSeconds);
  const plannedSeconds = useTimerStore((s) => s.plannedSeconds);
  const start = useTimerStore((s) => s.start);
  const resume = useTimerStore((s) => s.resume);
  const pause = useTimerStore((s) => s.pause);

  // Hide the pill when the timer is fully reset / untouched.
  if (status === "idle" && remainingSeconds === plannedSeconds) return null;

  const running = status === "running";

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (running) {
      pause();
    } else if (status === "paused") {
      resume();
    } else {
      start();
    }
  }

  return (
    <Link
      href="/focus"
      className={cn(
        "flex items-center gap-2 rounded-full border px-2 py-1 transition-colors",
        running
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-secondary text-secondary-foreground"
      )}
    >
      <span className="hidden text-xs font-medium sm:inline">
        {PHASE_LABELS[phase]}
      </span>
      <span className="font-mono text-sm font-semibold tabular-nums">
        {formatClock(remainingSeconds)}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        aria-label={running ? "Pause timer" : "Start timer"}
        onClick={toggle}
      >
        {running ? <Pause size={14} /> : <Play size={14} />}
      </Button>
    </Link>
  );
}
