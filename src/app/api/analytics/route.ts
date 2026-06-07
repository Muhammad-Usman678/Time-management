import { NextRequest } from "next/server";
import {
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  getHours,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { jsonOk, handleError } from "@/lib/api-helpers";
import { analyticsQuerySchema } from "@/lib/validations";
import type { AnalyticsData, AnalyticsRange } from "@/lib/types";

/**
 * GET /api/analytics?range=day|week|month -> AnalyticsData
 *
 * range "day"   => today (00:00 -> 23:59:59)
 * range "week"  => current ISO week, Monday -> Sunday
 * range "month" => current calendar month
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    const { range } = analyticsQuerySchema.parse({
      range: req.nextUrl.searchParams.get("range") ?? undefined,
    });

    const now = new Date();
    const { start, end } = rangeBounds(range, now);

    // ---- Pull the raw rows for this user within the range -------------------
    // Focus sessions are anchored on `startedAt`; tasks completed within the
    // range are anchored on `completedAt`.
    const [sessions, completedTaskRows] = await Promise.all([
      prisma.focusSession.findMany({
        where: { userId, startedAt: { gte: start, lte: end } },
        select: {
          elapsedSeconds: true,
          startedAt: true,
          task: {
            select: {
              tags: { select: { tag: { select: { name: true, color: true } } } },
            },
          },
        },
      }),
      prisma.task.findMany({
        where: { userId, status: "done", completedAt: { gte: start, lte: end } },
        select: { completedAt: true },
      }),
    ]);

    // Pending tasks are a live snapshot (not range-bound): everything not done.
    const pendingTasks = await prisma.task.count({
      where: { userId, status: { not: "done" } },
    });

    // ---- Aggregations -------------------------------------------------------
    const days = eachDayOfInterval({ start, end });

    // Zero-filled per-day buckets keyed by start-of-day ISO.
    const focusByDayMap = new Map<string, number>();
    const completedByDayMap = new Map<string, number>();
    for (const day of days) {
      const key = startOfDay(day).toISOString();
      focusByDayMap.set(key, 0);
      completedByDayMap.set(key, 0);
    }

    // 24-length, zero-filled hour buckets.
    const focusByHour: { hour: number; seconds: number }[] = Array.from(
      { length: 24 },
      (_, hour) => ({ hour, seconds: 0 })
    );

    // Tag attribution rule: when a session's task has multiple tags, the FULL
    // elapsed seconds are attributed to EACH tag (intentional — totals across
    // tags can exceed totalFocusSeconds when tasks are multi-tagged).
    const tagSecondsMap = new Map<string, { color: string; seconds: number }>();

    let totalFocusSeconds = 0;
    for (const session of sessions) {
      const secs = session.elapsedSeconds;
      totalFocusSeconds += secs;

      const dayKey = startOfDay(session.startedAt).toISOString();
      if (focusByDayMap.has(dayKey)) {
        focusByDayMap.set(dayKey, (focusByDayMap.get(dayKey) ?? 0) + secs);
      }

      focusByHour[getHours(session.startedAt)].seconds += secs;

      for (const rel of session.task?.tags ?? []) {
        const { name, color } = rel.tag;
        const entry = tagSecondsMap.get(name) ?? { color, seconds: 0 };
        entry.seconds += secs;
        entry.color = color;
        tagSecondsMap.set(name, entry);
      }
    }

    for (const row of completedTaskRows) {
      if (!row.completedAt) continue;
      const dayKey = startOfDay(row.completedAt).toISOString();
      if (completedByDayMap.has(dayKey)) {
        completedByDayMap.set(dayKey, (completedByDayMap.get(dayKey) ?? 0) + 1);
      }
    }

    const focusByDay = days.map((day) => {
      const key = startOfDay(day).toISOString();
      return { date: key, seconds: focusByDayMap.get(key) ?? 0 };
    });

    const completedByDay = days.map((day) => {
      const key = startOfDay(day).toISOString();
      return { date: key, count: completedByDayMap.get(key) ?? 0 };
    });

    const tagBreakdown = Array.from(tagSecondsMap.entries())
      .map(([tag, { color, seconds }]) => ({ tag, color, seconds }))
      .sort((a, b) => b.seconds - a.seconds);

    const data: AnalyticsData = {
      range,
      totalFocusSeconds,
      totalSessions: sessions.length,
      completedTasks: completedTaskRows.length,
      pendingTasks,
      focusByDay,
      completedByDay,
      focusByHour,
      tagBreakdown,
    };

    return jsonOk(data);
  } catch (e) {
    return handleError(e);
  }
}

function rangeBounds(range: AnalyticsRange, now: Date): { start: Date; end: Date } {
  switch (range) {
    case "day":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "week":
    default:
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }),
        end: endOfWeek(now, { weekStartsOn: 1 }),
      };
  }
}

export const dynamic = "force-dynamic";
