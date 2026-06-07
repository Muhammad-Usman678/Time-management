"use client";

import Link from "next/link";
import { Pause, Play, Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { useTimerStore } from "@/store/timerStore";
import { cn, formatClock } from "@/lib/utils";
import type { TimerPhase } from "@/store/timerStore";

const PHASE_LABELS: Record<TimerPhase, string> = {
  focus: "Focus",
  short_break: "Short break",
  long_break: "Long break",
};

/** Shows the live timer when one is active, otherwise a prompt to start. */
export function ActiveTimerCard() {
  const status = useTimerStore((s) => s.status);
  const phase = useTimerStore((s) => s.phase);
  const remainingSeconds = useTimerStore((s) => s.remainingSeconds);
  const plannedSeconds = useTimerStore((s) => s.plannedSeconds);
  const taskTitle = useTimerStore((s) => s.taskTitle);
  const pause = useTimerStore((s) => s.pause);
  const resume = useTimerStore((s) => s.resume);

  const isActive = status !== "idle" || remainingSeconds !== plannedSeconds;

  if (!isActive) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Timer size={18} className="text-muted-foreground" />
            Focus timer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Start a focus session to make progress on your work.
          </p>
          <Link
            href="/focus"
            className={cn(buttonVariants({ size: "sm" }), "w-full")}
          >
            <Play size={16} />
            Start a focus session
          </Link>
        </CardContent>
      </Card>
    );
  }

  const running = status === "running";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Timer size={18} className="text-muted-foreground" />
          {PHASE_LABELS[phase]}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-4xl font-semibold tabular-nums tracking-tight">
            {formatClock(remainingSeconds)}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {taskTitle ?? "No task"}
          </p>
        </div>
        <div className="flex gap-2">
          {running ? (
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={pause}
            >
              <Pause size={16} />
              Pause
            </Button>
          ) : (
            <Button size="sm" className="flex-1" onClick={resume}>
              <Play size={16} />
              Resume
            </Button>
          )}
          <Link
            href="/focus"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "flex-1"
            )}
          >
            Open focus
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
