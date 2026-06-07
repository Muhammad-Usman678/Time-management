"use client";

import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTimerStore } from "@/store/timerStore";

export function TimerControls() {
  const status = useTimerStore((s) => s.status);
  const start = useTimerStore((s) => s.start);
  const pause = useTimerStore((s) => s.pause);
  const resume = useTimerStore((s) => s.resume);
  const reset = useTimerStore((s) => s.reset);
  const skip = useTimerStore((s) => s.skip);

  const running = status === "running";

  function toggle() {
    if (running) pause();
    else if (status === "paused") resume();
    else start();
  }

  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        variant="outline"
        size="icon"
        onClick={reset}
        aria-label="Reset timer"
      >
        <RotateCcw size={18} />
      </Button>

      <Button size="lg" className="min-w-32" onClick={toggle}>
        {running ? <Pause size={18} /> : <Play size={18} />}
        {running ? "Pause" : status === "paused" ? "Resume" : "Start"}
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={skip}
        aria-label="Skip phase"
      >
        <SkipForward size={18} />
      </Button>
    </div>
  );
}
