import { NextRequest } from "next/server";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  startOfMonth,
} from "date-fns";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { jsonOk, parseBody, handleError } from "@/lib/api-helpers";
import { focusSessionCreateSchema, analyticsQuerySchema } from "@/lib/validations";
import { serializeFocusSession } from "@/lib/serialize";

// GET /api/focus-sessions?range=day|week|month -> FocusSession[]
// Sessions whose startedAt falls within the range, newest first, with task.
export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const { range } = analyticsQuerySchema.parse({
      range: req.nextUrl.searchParams.get("range") ?? undefined,
    });

    const now = new Date();
    const from =
      range === "day"
        ? startOfDay(now)
        : range === "month"
          ? startOfMonth(now)
          : startOfWeek(now, { weekStartsOn: 1 });
    const to = endOfDay(now);

    const sessions = await prisma.focusSession.findMany({
      where: { userId, startedAt: { gte: from, lte: to } },
      orderBy: { startedAt: "desc" },
      include: { task: { select: { id: true, title: true } } },
    });

    return jsonOk(sessions.map(serializeFocusSession));
  } catch (e) {
    return handleError(e);
  }
}

// POST /api/focus-sessions (focusSessionCreateSchema) -> created FocusSession
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const body = await parseBody(req, focusSessionCreateSchema);

    const created = await prisma.focusSession.create({
      data: {
        userId,
        taskId: body.taskId ?? null,
        type: body.type,
        startedAt: body.startedAt ? new Date(body.startedAt) : new Date(),
        endedAt: body.endedAt ? new Date(body.endedAt) : null,
        plannedSeconds: body.plannedSeconds,
        elapsedSeconds: body.elapsedSeconds,
        completed: body.completed,
      },
      include: { task: { select: { id: true, title: true } } },
    });

    return jsonOk(serializeFocusSession(created), 201);
  } catch (e) {
    return handleError(e);
  }
}

export const dynamic = "force-dynamic";
