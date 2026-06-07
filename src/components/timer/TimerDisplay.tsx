"use client";

import { useTimerStore } from "@/store/timerStore";
import { formatClock, cn } from "@/lib/utils";
import type { TimerPhase } from "@/store/timerStore";

const PHASE_LABELS: Record<TimerPhase, string> = {
  focus: "Focus",
  short_break: "Short Break",
  long_break: "Long Break",
};

// Geometry for the circular progress ring.
const SIZE = 280;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function TimerDisplay() {
  const phase = useTimerStore((s) => s.phase);
  const status = useTimerStore((s) => s.status);
  const remainingSeconds = useTimerStore((s) => s.remainingSeconds);
  const plannedSeconds = useTimerStore((s) => s.plannedSeconds);
  const completedFocusBlocks = useTimerStore((s) => s.completedFocusBlocks);

  const isFocus = phase === "focus";
  const running = status === "running";

  // Fraction of the phase that has elapsed, clamped to [0, 1].
  const elapsed =
    plannedSeconds > 0
      ? Math.min(
          1,
          Math.max(0, (plannedSeconds - remainingSeconds) / plannedSeconds)
        )
      : 0;
  const dashOffset = CIRCUMFERENCE * (1 - elapsed);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      {/* Circular progress ring — the hero. */}
      <div
        className={cn(
          "relative",
          running && "animate-float"
        )}
        style={{ width: SIZE, height: SIZE }}
      >
        {/* Soft colored aura behind the ring while running. */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-6 rounded-full blur-2xl transition-opacity duration-500",
            isFocus ? "bg-primary/20" : "bg-success/20",
            running ? "opacity-100" : "opacity-0"
          )}
        />

        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="relative -rotate-90"
          role="img"
          aria-label={`${PHASE_LABELS[phase]}, ${formatClock(
            remainingSeconds
          )} remaining`}
        >
          <defs>
            <linearGradient id="timer-progress" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--brand-2))" />
            </linearGradient>
          </defs>

          {/* Track. */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={STROKE}
          />

          {/* Progress. */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={
              isFocus ? "url(#timer-progress)" : "hsl(var(--success))"
            }
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            className="transition-[stroke-dashoffset] duration-700 ease-linear"
          />
        </svg>

        {/* Centered clock + phase label. */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <span
            className={cn(
              "text-xs font-semibold uppercase tracking-[0.18em]",
              isFocus ? "text-primary" : "text-success"
            )}
          >
            {PHASE_LABELS[phase]}
          </span>
          <span
            className={cn(
              "font-mono text-6xl font-semibold tabular-nums tracking-tight transition-opacity duration-300 sm:text-7xl",
              running ? "opacity-100" : "opacity-90"
            )}
          >
            {formatClock(remainingSeconds)}
          </span>
          <span className="text-xs text-muted-foreground">
            {running ? "In flow" : status === "paused" ? "Paused" : "Ready"}
          </span>
        </div>
      </div>

      {/* Completed focus blocks this cycle, shown as small dots. */}
      {completedFocusBlocks > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground animate-fade-in">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: completedFocusBlocks }).map((_, i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full brand-gradient shadow-soft"
                aria-hidden
              />
            ))}
          </div>
          <span>{completedFocusBlocks} completed</span>
        </div>
      )}
    </div>
  );
}
