import type { AnalyticsRange, TaskView } from "@/lib/types";

// Centralized React Query keys so every hook + cache invalidation agrees.
export const queryKeys = {
  tasks: (view: TaskView) => ["tasks", view] as const,
  allTasks: () => ["tasks"] as const,
  tags: () => ["tags"] as const,
  meetings: () => ["meetings"] as const,
  focusSessions: (range: AnalyticsRange) => ["focus-sessions", range] as const,
  allFocusSessions: () => ["focus-sessions"] as const,
  dashboard: () => ["dashboard"] as const,
  analytics: (range: AnalyticsRange) => ["analytics", range] as const,
};
