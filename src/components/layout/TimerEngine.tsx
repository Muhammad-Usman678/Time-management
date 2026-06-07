"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTimerStore } from "@/store/timerStore";
import { queryKeys } from "@/lib/query-keys";

/**
 * Drives the global timer: ticks the store every second and reacts to logged
 * focus sessions by invalidating the dependent queries. Renders nothing.
 */
export function TimerEngine() {
  const queryClient = useQueryClient();
  const sessionLogCounter = useTimerStore((s) => s.sessionLogCounter);
  const prevCounter = useRef(sessionLogCounter);

  useEffect(() => {
    const interval = setInterval(() => {
      useTimerStore.getState().tick();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (sessionLogCounter === prevCounter.current) return;
    prevCounter.current = sessionLogCounter;
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
    queryClient.invalidateQueries({ queryKey: queryKeys.allFocusSessions() });
    queryClient.invalidateQueries({ queryKey: ["analytics"] });
    queryClient.invalidateQueries({ queryKey: queryKeys.allTasks() });
    toast.success("Focus session logged");
  }, [sessionLogCounter, queryClient]);

  return null;
}
