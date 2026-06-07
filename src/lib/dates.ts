import {
  format,
  formatDistanceToNowStrict,
  isPast,
  isToday,
  isTomorrow,
  parseISO,
} from "date-fns";
import type { TaskStatus } from "@/lib/types";

/** Safely parse an ISO string (or pass through a Date). */
export function toDate(value: string | Date): Date {
  return typeof value === "string" ? parseISO(value) : value;
}

export function formatDate(iso: string | Date): string {
  return format(toDate(iso), "MMM d, yyyy");
}

export function formatTime(iso: string | Date): string {
  return format(toDate(iso), "h:mm a");
}

export function formatDateTime(iso: string | Date): string {
  return format(toDate(iso), "MMM d, yyyy · h:mm a");
}

/** Chart axis label, e.g. "Mon 6/2". */
export function formatDayLabel(iso: string | Date): string {
  return format(toDate(iso), "EEE M/d");
}

/** "Today, 2:30 PM" / "Tomorrow, 9:00 AM" / "Jun 9, 3:00 PM". */
export function formatMeetingWhen(iso: string | Date): string {
  const d = toDate(iso);
  const time = format(d, "h:mm a");
  if (isToday(d)) return `Today, ${time}`;
  if (isTomorrow(d)) return `Tomorrow, ${time}`;
  return format(d, "EEE, MMM d · h:mm a");
}

export interface DeadlineInfo {
  label: string;
  isOverdue: boolean;
}

/** Human-friendly relative deadline + overdue flag (done tasks are never overdue). */
export function deadlineInfo(
  iso: string | null,
  status: TaskStatus = "todo"
): DeadlineInfo | null {
  if (!iso) return null;
  const d = toDate(iso);
  const overdue = status !== "done" && isPast(d) && !isToday(d);
  let label: string;
  if (isToday(d)) label = "Today";
  else if (isTomorrow(d)) label = "Tomorrow";
  else label = `${overdue ? "" : "in "}${formatDistanceToNowStrict(d, { addSuffix: !overdue })}`;
  if (overdue) label = `Overdue · ${formatDistanceToNowStrict(d, { addSuffix: true })}`;
  return { label, isOverdue: overdue };
}
