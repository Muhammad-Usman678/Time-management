// -----------------------------------------------------------------------------
// Shared domain types — the contract between the API layer and the UI.
// All dates are serialized as ISO strings over the wire.
// -----------------------------------------------------------------------------

export type Priority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in_progress" | "done";
export type LinkType = "zoom" | "meet" | "custom" | "none";
export type FocusType = "pomodoro" | "custom" | "manual";
export type TaskView = "today" | "week" | "all";
export type AnalyticsRange = "day" | "week" | "month";

export const PRIORITIES: Priority[] = ["low", "medium", "high"];
export const TASK_STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];
export const LINK_TYPES: LinkType[] = ["zoom", "meet", "custom", "none"];
export const FOCUS_TYPES: FocusType[] = ["pomodoro", "custom", "manual"];

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: TaskStatus;
  deadline: string | null; // ISO
  isDaily: boolean;
  completedAt: string | null; // ISO
  sortOrder: number;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  tags: Tag[];
  /** Aggregated focused time on this task (seconds). Present on some endpoints. */
  focusSeconds?: number;
}

export interface Meeting {
  id: string;
  title: string;
  dateTime: string; // ISO
  durationMinutes: number;
  link: string | null;
  linkType: LinkType;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FocusSession {
  id: string;
  taskId: string | null;
  type: FocusType;
  startedAt: string; // ISO
  endedAt: string | null; // ISO
  plannedSeconds: number;
  elapsedSeconds: number;
  completed: boolean;
  createdAt: string;
  task?: { id: string; title: string } | null;
}

export interface DashboardStats {
  todayFocusSeconds: number;
  weekFocusSeconds: number;
  todayCompleted: number;
  todayPending: number;
  todaySessions: number;
}

export interface DashboardData {
  todayTasks: Task[];
  upcomingMeetings: Meeting[];
  stats: DashboardStats;
}

export interface AnalyticsData {
  range: AnalyticsRange;
  totalFocusSeconds: number;
  totalSessions: number;
  completedTasks: number;
  pendingTasks: number;
  /** One entry per day in the range. */
  focusByDay: { date: string; seconds: number }[];
  /** Completed task count per day in the range. */
  completedByDay: { date: string; count: number }[];
  /** 0..23 — total focused seconds bucketed by hour of day. */
  focusByHour: { hour: number; seconds: number }[];
  /** Focused time grouped by tag. */
  tagBreakdown: { tag: string; color: string; seconds: number }[];
}

/** Standard error body returned by every API route on failure. */
export interface ApiError {
  error: string;
  details?: unknown;
}
