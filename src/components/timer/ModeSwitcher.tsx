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
    <div className="flex flex-col items-center gap-1.5">
      <div className={locked ? "pointer-events-none opacity-50" : undefined}>
        <Tabs
          tabs={MODE_TABS}
          value={mode}
          onValueChange={(v) => setMode(v as TimerMode)}
        />
      </div>
      {locked && (
        <p className="text-xs text-muted-foreground">Reset to switch mode</p>
      )}
    </div>
  );
}
