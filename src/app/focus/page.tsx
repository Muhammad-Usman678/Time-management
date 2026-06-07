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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Focus</h1>
        <p className="text-sm text-muted-foreground">
          Deep-work mode. Pick a task, start the timer, and stay in flow.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
        {/* Timer — the visual anchor. */}
        <Card>
          <CardContent className="flex flex-col items-center gap-8 py-10">
            <ModeSwitcher />
            <TimerDisplay />
            <TimerControls />
            <div className="flex w-full flex-col items-center gap-4">
              <TaskSelect />
              <PomodoroSettings />
            </div>
          </CardContent>
        </Card>

        {/* Today's sessions. */}
        <Card>
          <CardContent className="py-6">
            <SessionList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
