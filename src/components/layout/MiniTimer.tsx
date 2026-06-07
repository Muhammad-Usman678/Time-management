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
        "flex items-center gap-2 rounded-full border bg-card/80 px-2.5 py-1 shadow-soft backdrop-blur transition-all duration-200",
        running
          ? "border-primary/40 text-primary"
          : "border-border text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "h-2 w-2 shrink-0 rounded-full transition-all",
          running ? "brand-gradient shadow-glow" : "bg-muted-foreground/40"
        )}
        aria-hidden="true"
      />
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
