"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { api } from "@/lib/api-client";
import type { FocusType } from "@/lib/types";

// -----------------------------------------------------------------------------
// Global timer state machine (Pomodoro + custom countdown).
//
// Lives in a Zustand store so the active timer survives client-side navigation
// and is reflected simultaneously in the Focus page, the top-bar mini-timer, and
// the dashboard. A single <TimerEngine /> (mounted in the app shell) calls
// `tick()` every second; it is drift-free because it derives `remaining` from a
// wall-clock `endAtMs` rather than counting interrupts.
//
// On completion of a FOCUS phase the store logs a FocusSession to the API
// (fire-and-forget) and bumps `sessionLogCounter` — the engine watches that
// counter and invalidates the dashboard/analytics/focus-session queries.
// -----------------------------------------------------------------------------

export type TimerMode = "pomodoro" | "custom";
export type TimerPhase = "focus" | "short_break" | "long_break";
export type TimerStatus = "idle" | "running" | "paused";

export interface TimerSettings {
  pomodoroMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number; // long break after every N focus blocks
  customMinutes: number; // for "custom" mode
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

export const DEFAULT_SETTINGS: TimerSettings = {
  pomodoroMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  customMinutes: 50,
  autoStartBreaks: false,
  autoStartPomodoros: false,
};

interface TimerState {
  settings: TimerSettings;
  mode: TimerMode;
  phase: TimerPhase;
  status: TimerStatus;
  plannedSeconds: number;
  remainingSeconds: number;
  endAtMs: number | null; // wall-clock target end when running
  taskId: string | null;
  taskTitle: string | null;
  completedFocusBlocks: number; // cycle counter for long-break cadence
  sessionLogCounter: number; // bumped whenever a focus session is logged

  // actions
  configure: (patch: Partial<TimerSettings>) => void;
  setMode: (mode: TimerMode) => void;
  selectTask: (taskId: string | null, taskTitle: string | null) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;
  tick: () => void;
}

function now() {
  return Date.now();
}

/** Phase length in seconds for the current mode/phase. */
function phaseDuration(
  settings: TimerSettings,
  mode: TimerMode,
  phase: TimerPhase
): number {
  if (mode === "custom") return Math.round(settings.customMinutes * 60);
  switch (phase) {
    case "focus":
      return Math.round(settings.pomodoroMinutes * 60);
    case "short_break":
      return Math.round(settings.shortBreakMinutes * 60);
    case "long_break":
      return Math.round(settings.longBreakMinutes * 60);
  }
}

// SSR-safe storage for the persist middleware.
const safeStorage = createJSONStorage(() =>
  typeof window !== "undefined"
    ? window.localStorage
    : {
        getItem: () => null,
        setItem: () => undefined,
        removeItem: () => undefined,
      }
);

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => {
      function logFocusSession(elapsedSeconds: number) {
        const { mode, plannedSeconds, taskId } = get();
        if (elapsedSeconds <= 0) return;
        const type: FocusType = mode === "pomodoro" ? "pomodoro" : "custom";
        const startedAt = new Date(now() - elapsedSeconds * 1000).toISOString();
        api
          .post("/api/focus-sessions", {
            taskId: taskId ?? undefined,
            type,
            startedAt,
            endedAt: new Date().toISOString(),
            plannedSeconds,
            elapsedSeconds,
            completed: true,
          })
          .catch((e) => console.error("Failed to log focus session", e));
        set((s) => ({ sessionLogCounter: s.sessionLogCounter + 1 }));
      }

      /** Advance to the phase that follows the one that just completed. */
      function advancePhase() {
        const { settings, mode, phase } = get();

        if (mode === "custom") {
          // Custom countdown is single-shot: completing it returns to idle.
          set({
            status: "idle",
            phase: "focus",
            endAtMs: null,
            plannedSeconds: phaseDuration(settings, "custom", "focus"),
            remainingSeconds: phaseDuration(settings, "custom", "focus"),
          });
          return;
        }

        if (phase === "focus") {
          const completed = get().completedFocusBlocks + 1;
          const isLong = completed % settings.longBreakInterval === 0;
          const nextPhase: TimerPhase = isLong ? "long_break" : "short_break";
          const dur = phaseDuration(settings, "pomodoro", nextPhase);
          const auto = settings.autoStartBreaks;
          set({
            completedFocusBlocks: completed,
            phase: nextPhase,
            plannedSeconds: dur,
            remainingSeconds: dur,
            status: auto ? "running" : "idle",
            endAtMs: auto ? now() + dur * 1000 : null,
          });
        } else {
          // Break finished -> back to a focus block.
          const dur = phaseDuration(settings, "pomodoro", "focus");
          const auto = settings.autoStartPomodoros;
          set({
            phase: "focus",
            plannedSeconds: dur,
            remainingSeconds: dur,
            status: auto ? "running" : "idle",
            endAtMs: auto ? now() + dur * 1000 : null,
          });
        }
      }

      function handleComplete() {
        const { phase, plannedSeconds } = get();
        if (phase === "focus") {
          logFocusSession(plannedSeconds);
        }
        advancePhase();
      }

      return {
        settings: DEFAULT_SETTINGS,
        mode: "pomodoro",
        phase: "focus",
        status: "idle",
        plannedSeconds: DEFAULT_SETTINGS.pomodoroMinutes * 60,
        remainingSeconds: DEFAULT_SETTINGS.pomodoroMinutes * 60,
        endAtMs: null,
        taskId: null,
        taskTitle: null,
        completedFocusBlocks: 0,
        sessionLogCounter: 0,

        configure: (patch) => {
          const settings = { ...get().settings, ...patch };
          set({ settings });
          // If idle, reflect new durations immediately.
          if (get().status === "idle") {
            const dur = phaseDuration(settings, get().mode, get().phase);
            set({ plannedSeconds: dur, remainingSeconds: dur });
          }
        },

        setMode: (mode) => {
          const { settings } = get();
          const dur = phaseDuration(settings, mode, "focus");
          set({
            mode,
            phase: "focus",
            status: "idle",
            plannedSeconds: dur,
            remainingSeconds: dur,
            endAtMs: null,
          });
        },

        selectTask: (taskId, taskTitle) => set({ taskId, taskTitle }),

        start: () => {
          const { remainingSeconds, status } = get();
          if (status === "running") return;
          set({
            status: "running",
            endAtMs: now() + remainingSeconds * 1000,
          });
        },

        pause: () => {
          if (get().status !== "running") return;
          const { endAtMs } = get();
          const remaining = endAtMs
            ? Math.max(0, Math.round((endAtMs - now()) / 1000))
            : get().remainingSeconds;
          set({ status: "paused", remainingSeconds: remaining, endAtMs: null });
        },

        resume: () => {
          if (get().status !== "paused") return;
          set({
            status: "running",
            endAtMs: now() + get().remainingSeconds * 1000,
          });
        },

        reset: () => {
          const { settings, mode, phase } = get();
          const dur = phaseDuration(settings, mode, phase);
          set({
            status: "idle",
            plannedSeconds: dur,
            remainingSeconds: dur,
            endAtMs: null,
          });
        },

        skip: () => {
          // Skip the current phase WITHOUT logging it as completed focus time.
          advancePhase();
        },

        tick: () => {
          const { status, endAtMs } = get();
          if (status !== "running" || endAtMs == null) return;
          const remaining = Math.max(0, Math.round((endAtMs - now()) / 1000));
          if (remaining <= 0) {
            set({ remainingSeconds: 0 });
            handleComplete();
          } else {
            set({ remainingSeconds: remaining });
          }
        },
      };
    },
    {
      name: "phd-timer",
      storage: safeStorage,
      // Persist configuration + selection + cycle state; the live countdown is
      // reconstructed from endAtMs on rehydrate.
      partialize: (s) => ({
        settings: s.settings,
        mode: s.mode,
        phase: s.phase,
        status: s.status,
        plannedSeconds: s.plannedSeconds,
        remainingSeconds: s.remainingSeconds,
        endAtMs: s.endAtMs,
        taskId: s.taskId,
        taskTitle: s.taskTitle,
        completedFocusBlocks: s.completedFocusBlocks,
      }),
      onRehydrateStorage: () => (state) => {
        // Recompute remaining time after a reload if we were mid-countdown.
        if (state && state.status === "running" && state.endAtMs) {
          const remaining = Math.max(
            0,
            Math.round((state.endAtMs - Date.now()) / 1000)
          );
          state.remainingSeconds = remaining;
          if (remaining <= 0) {
            state.status = "idle";
            state.endAtMs = null;
            state.remainingSeconds = state.plannedSeconds;
          }
        }
      },
    }
  )
);
