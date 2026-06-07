import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { LinkType, Priority, TaskStatus } from "@/lib/types";

/** Tailwind-aware className combiner. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ---- Time / duration --------------------------------------------------------

/** 3725 -> "1h 2m". For 0 -> "0m". */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  if (m > 0) return `${m}m`;
  return s > 0 ? `${s}s` : "0m";
}

/** 1500 -> "25:00" (clock display for timers). */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

// ---- Visual style maps ------------------------------------------------------

export const PRIORITY_STYLES: Record<Priority, string> = {
  low: "bg-secondary text-secondary-foreground border-border",
  medium:
    "bg-warning/15 text-warning-foreground border-warning/30 dark:text-warning",
  high: "bg-destructive/15 text-destructive border-destructive/30",
};

export const PRIORITY_DOT: Record<Priority, string> = {
  low: "bg-muted-foreground",
  medium: "bg-warning",
  high: "bg-destructive",
};

export const STATUS_STYLES: Record<TaskStatus, string> = {
  todo: "bg-secondary text-secondary-foreground",
  in_progress: "bg-primary/15 text-primary border-primary/30",
  done: "bg-success/15 text-success border-success/30",
};

// ---- Meeting links ----------------------------------------------------------

/** Infer the provider from a meeting URL. */
export function detectLinkType(url: string | null | undefined): LinkType {
  if (!url) return "none";
  const u = url.toLowerCase();
  if (u.includes("zoom.us") || u.includes("zoom.com")) return "zoom";
  if (u.includes("meet.google.com")) return "meet";
  return "custom";
}

export const LINK_LABELS: Record<LinkType, string> = {
  zoom: "Zoom",
  meet: "Google Meet",
  custom: "Join link",
  none: "No link",
};

// ---- Misc -------------------------------------------------------------------

/** Pick readable black/white text for a given hex background. */
export function contrastText(hex: string): "#000000" | "#ffffff" {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return "#ffffff";
  const int = parseInt(m[1], 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  // Perceived luminance.
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#000000" : "#ffffff";
}

export const TAG_COLOR_PRESETS = [
  "#ef4444", // research / red
  "#f59e0b", // writing / amber
  "#10b981", // admin / emerald
  "#3b82f6", // reading / blue
  "#8b5cf6", // experiments / violet
  "#ec4899", // teaching / pink
  "#14b8a6", // teal
  "#64748b", // slate / default
];
