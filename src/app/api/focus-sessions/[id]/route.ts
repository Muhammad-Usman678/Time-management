import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { jsonOk, parseBody, handleError } from "@/lib/api-helpers";
import { focusSessionUpdateSchema } from "@/lib/validations";
import { serializeFocusSession } from "@/lib/serialize";

// PATCH /api/focus-sessions/:id (focusSessionUpdateSchema) -> FocusSession
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    const body = await parseBody(req, focusSessionUpdateSchema);

    // Scope by userId so a session that isn't owned reads as "not found".
    const result = await prisma.focusSession.updateMany({
      where: { id: params.id, userId },
      data: {
        ...(body.endedAt !== undefined
          ? { endedAt: body.endedAt ? new Date(body.endedAt) : null }
          : {}),
        ...(body.elapsedSeconds !== undefined
          ? { elapsedSeconds: body.elapsedSeconds }
          : {}),
        ...(body.completed !== undefined ? { completed: body.completed } : {}),
      },
    });

    if (result.count === 0) {
      return handleError({ code: "P2025" });
    }

    const updated = await prisma.focusSession.findFirst({
      where: { id: params.id, userId },
      include: { task: { select: { id: true, title: true } } },
    });

    if (!updated) return handleError({ code: "P2025" });
    return jsonOk(serializeFocusSession(updated));
  } catch (e) {
    return handleError(e);
  }
}

// DELETE /api/focus-sessions/:id -> 204
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    const result = await prisma.focusSession.deleteMany({
      where: { id: params.id, userId },
    });
    if (result.count === 0) return handleError({ code: "P2025" });
    return new Response(null, { status: 204 });
  } catch (e) {
    return handleError(e);
  }
}

export const dynamic = "force-dynamic";
