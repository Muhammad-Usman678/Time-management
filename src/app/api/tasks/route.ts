import { NextRequest } from "next/server";
import { startOfDay, startOfWeek, endOfWeek } from "date-fns";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { jsonOk, parseBody, handleError } from "@/lib/api-helpers";
import { taskCreateSchema } from "@/lib/validations";
import { taskInclude, serializeTask } from "@/lib/serialize";
import type { TaskView } from "@/lib/types";

// Include tags + a thin slice of focus sessions so serializeTask can aggregate
// focusSeconds without pulling every column off each session.
const listInclude = {
  ...taskInclude,
  focusSessions: { select: { elapsedSeconds: true } },
};

/**
 * Reset daily tasks that haven't been touched since before today's start:
 * back to "todo", clear completedAt, stamp lastResetAt = now. Runs before the
 * "today" view + dashboard so opening the app first thing rolls recurring tasks.
 */
async function resetDailyTasks(userId: string, dayStart: Date): Promise<void> {
  await prisma.task.updateMany({
    where: {
      userId,
      isDaily: true,
      OR: [{ lastResetAt: null }, { lastResetAt: { lt: dayStart } }],
    },
    data: { status: "todo", completedAt: null, lastResetAt: new Date() },
  });
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const view = (req.nextUrl.searchParams.get("view") ?? "all") as TaskView;

    const now = new Date();
    const dayStart = startOfDay(now);

    if (view === "today") {
      await resetDailyTasks(userId, dayStart);
    }

    let where: Record<string, unknown> = { userId };

    if (view === "today") {
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      where = {
        userId,
        OR: [
          { deadline: { gte: dayStart, lt: dayEnd } },
          { isDaily: true },
          { status: "in_progress" },
        ],
      };
    } else if (view === "week") {
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      where = {
        userId,
        OR: [
          { deadline: { gte: weekStart, lte: weekEnd } },
          { isDaily: true },
        ],
      };
    }

    const rows = await prisma.task.findMany({
      where,
      include: listInclude,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return jsonOk(rows.map(serializeTask));
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const data = await parseBody(req, taskCreateSchema);
    const { tagIds, deadline, ...rest } = data;

    const created = await prisma.task.create({
      data: {
        ...rest,
        userId,
        deadline: deadline ? new Date(deadline) : null,
        tags: tagIds && tagIds.length
          ? { create: tagIds.map((tagId) => ({ tagId })) }
          : undefined,
      },
      include: listInclude,
    });

    return jsonOk(serializeTask(created), 201);
  } catch (e) {
    return handleError(e);
  }
}

export const dynamic = "force-dynamic";
