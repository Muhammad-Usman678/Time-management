"use client";

import { Timer, Hourglass } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { useTimerStore } from "@/store/timerStore";
import type { TimerMode } from "@/store/timerStore";

const MODE_TABS = [
  { value: "pomodoro", label: "Pomodoro", icon: Timer },
  { value: "custom", label: "Custom", icon: Hourglass },
];

export function ModeSwitcher() {
  const mode = useTimerStore((s) => s.mode);
  const status = useTimerStore((s) => s.status);
  const setMode = useTimerStore((s) => s.setMode);

  // Switching mode resets the timer, so block it once a session is in flight.
  const locked = status !== "idle";

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={
          locked
            ? "pointer-events-none opacity-50 transition-opacity duration-200"
            : "transition-opacity duration-200"
        }
      >
        <Tabs
          tabs={MODE_TABS}
          value={mode}
          onValueChange={(v) => setMode(v as TimerMode)}
          className="glass shadow-soft"
        />
      </div>
      {locked && (
        <p className="animate-fade-in text-xs text-muted-foreground">
          Reset to switch mode
        </p>
      )}
    </div>
  );
}
