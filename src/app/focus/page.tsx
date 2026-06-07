"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ModeSwitcher } from "@/components/timer/ModeSwitcher";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { TimerControls } from "@/components/timer/TimerControls";
import { TaskSelect } from "@/components/timer/TaskSelect";
import { PomodoroSettings } from "@/components/timer/PomodoroSettings";
import { SessionList } from "@/components/timer/SessionList";

export default function FocusPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl animate-fade-in flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-semibold tracking-tight">
          <span className="text-gradient">Focus</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Deep-work mode. Pick a task, start the timer, and stay in flow.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
        {/* Timer — the visual anchor. */}
        <Card className="glass overflow-hidden shadow-soft">
          <CardContent className="flex flex-col items-center gap-9 px-6 py-12">
            <ModeSwitcher />
            <TimerDisplay />
            <TimerControls />
            <div className="flex w-full flex-col items-center gap-5 border-t border-border/60 pt-8">
              <TaskSelect />
              <PomodoroSettings />
            </div>
          </CardContent>
        </Card>

        {/* Today's sessions. */}
        <Card className="glass shadow-soft">
          <CardContent className="py-6">
            <SessionList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
