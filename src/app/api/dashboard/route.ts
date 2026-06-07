import { NextRequest } from "next/server";
import {
  endOfDay,
  startOfDay,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { jsonOk, handleError } from "@/lib/api-helpers";
import { taskInclude, serializeTask, serializeMeeting } from "@/lib/serialize";
import type { DashboardData } from "@/lib/types";

// -----------------------------------------------------------------------------
// GET /api/dashboard — aggregated home view: today's tasks (with daily auto-
// reset), the next 5 upcoming meetings, and summary focus/task stats.
// -----------------------------------------------------------------------------

/**
 * Reset daily tasks whose lastResetAt is before the start of today: status back
 * to "todo", clear completedAt, stamp lastResetAt. Mirrors GET /api/tasks?view=today.
 */
async function resetDailyTasks(userId: string, dayStart: Date): Promise<void> {
  await prisma.task.updateMany({
    where: {
      userId,
      isDaily: true,
      OR: [{ lastResetAt: null }, { lastResetAt: { lt: dayStart } }],
    },
    data: {
      status: "todo",
      completedAt: null,
      lastResetAt: new Date(),
    },
  });
}

export async function GET(_req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const now = new Date();
    const dayStart = startOfDay(now);
    const dayEnd = endOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    // Auto-reset recurring daily tasks before reading them.
    await resetDailyTasks(userId, dayStart);

    // Today's tasks: due today OR daily OR currently in progress.
    const taskRows = await prisma.task.findMany({
      where: {
        userId,
        OR: [
          { deadline: { gte: dayStart, lte: dayEnd } },
          { isDaily: true },
          { status: "in_progress" },
        ],
      },
      include: {
        ...taskInclude,
        focusSessions: { select: { elapsedSeconds: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    const todayTasks = taskRows.map(serializeTask);

    // Next 5 upcoming meetings from now forward.
    const meetingRows = await prisma.meeting.findMany({
      where: { userId, dateTime: { gte: now } },
      orderBy: { dateTime: "asc" },
      take: 5,
    });
    const upcomingMeetings = meetingRows.map(serializeMeeting);

    // Focus aggregates — today and this week (Mon–Sun).
    const [todayFocus, weekFocus, todaySessions] = await Promise.all([
      prisma.focusSession.aggregate({
        where: { userId, startedAt: { gte: dayStart, lte: dayEnd } },
        _sum: { elapsedSeconds: true },
      }),
      prisma.focusSession.aggregate({
        where: { userId, startedAt: { gte: weekStart, lte: weekEnd } },
        _sum: { elapsedSeconds: true },
      }),
      prisma.focusSession.count({
        where: { userId, startedAt: { gte: dayStart, lte: dayEnd } },
      }),
    ]);

    const todayCompleted = todayTasks.filter((t) => t.status === "done").length;
    const todayPending = todayTasks.length - todayCompleted;

    const data: DashboardData = {
      todayTasks,
      upcomingMeetings,
      stats: {
        todayFocusSeconds: todayFocus._sum.elapsedSeconds ?? 0,
        weekFocusSeconds: weekFocus._sum.elapsedSeconds ?? 0,
        todayCompleted,
        todayPending,
        todaySessions,
      },
    };

    return jsonOk(data);
  } catch (e) {
    return handleError(e);
  }
}

export const dynamic = "force-dynamic";
