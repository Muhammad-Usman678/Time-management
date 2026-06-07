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
    <div className="flex items-center justify-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={reset}
        aria-label="Reset timer"
        className="h-11 w-11 rounded-full text-muted-foreground hover:text-foreground"
      >
        <RotateCcw size={18} />
      </Button>

      <Button
        size="lg"
        onClick={toggle}
        className="h-14 min-w-40 rounded-full px-8 text-base shadow-glow"
      >
        {running ? <Pause size={20} /> : <Play size={20} />}
        {running ? "Pause" : status === "paused" ? "Resume" : "Start"}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={skip}
        aria-label="Skip phase"
        className="h-11 w-11 rounded-full text-muted-foreground hover:text-foreground"
      >
        <SkipForward size={18} />
      </Button>
    </div>
  );
}
