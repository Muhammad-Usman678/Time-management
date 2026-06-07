import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { jsonOk, jsonError, parseBody, handleError } from "@/lib/api-helpers";
import { taskUpdateSchema } from "@/lib/validations";
import { taskInclude, serializeTask } from "@/lib/serialize";

const detailInclude = {
  ...taskInclude,
  focusSessions: { select: { elapsedSeconds: true } },
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    const task = await prisma.task.findFirst({
      where: { id: params.id, userId },
      include: detailInclude,
    });
    if (!task) return jsonError("Not found", 404);
    return jsonOk(serializeTask(task));
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    const data = await parseBody(req, taskUpdateSchema);

    // Scope by userId before mutating so callers can't touch others' tasks.
    const existing = await prisma.task.findFirst({
      where: { id: params.id, userId },
      select: { id: true },
    });
    if (!existing) return jsonError("Not found", 404);

    const { tagIds, deadline, status, ...rest } = data;

    const updateData: Record<string, unknown> = { ...rest };
    if (deadline !== undefined) {
      updateData.deadline = deadline ? new Date(deadline) : null;
    }
    if (status !== undefined) {
      updateData.status = status;
      // Keep completedAt in sync with the done state.
      updateData.completedAt = status === "done" ? new Date() : null;
    }

    const updated = await prisma.task.update({
      where: { id: params.id },
      data: {
        ...updateData,
        // Replace the full tag set when tagIds is provided.
        ...(tagIds !== undefined
          ? {
              tags: {
                deleteMany: {},
                create: tagIds.map((tagId) => ({ tagId })),
              },
            }
          : {}),
      },
      include: detailInclude,
    });

    return jsonOk(serializeTask(updated));
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    const result = await prisma.task.deleteMany({
      where: { id: params.id, userId },
    });
    if (result.count === 0) return jsonError("Not found", 404);
    return new Response(null, { status: 204 });
  } catch (e) {
    return handleError(e);
  }
}

export const dynamic = "force-dynamic";
