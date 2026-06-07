import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { jsonOk, jsonError, parseBody, handleError } from "@/lib/api-helpers";
import { meetingUpdateSchema } from "@/lib/validations";
import { serializeMeeting } from "@/lib/serialize";
import { detectLinkType } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

// GET /api/meetings/:id -> Meeting.
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    const meeting = await prisma.meeting.findFirst({
      where: { id: params.id, userId },
    });
    if (!meeting) return jsonError("Not found", 404);
    return jsonOk(serializeMeeting(meeting));
  } catch (e) {
    return handleError(e);
  }
}

// PATCH /api/meetings/:id (meetingUpdateSchema) -> Meeting.
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    const body = await parseBody(req, meetingUpdateSchema);

    // Ensure the meeting belongs to the current user before mutating.
    const existing = await prisma.meeting.findFirst({
      where: { id: params.id, userId },
    });
    if (!existing) return jsonError("Not found", 404);

    const data: Prisma.MeetingUpdateInput = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.dateTime !== undefined) data.dateTime = new Date(body.dateTime);
    if (body.durationMinutes !== undefined) {
      data.durationMinutes = body.durationMinutes;
    }
    if (body.notes !== undefined) data.notes = body.notes ?? null;

    if (body.link !== undefined) {
      const link = body.link ? body.link : null;
      data.link = link;
      // Re-derive provider unless an explicit non-"none" linkType was supplied.
      data.linkType =
        body.linkType && body.linkType !== "none"
          ? body.linkType
          : detectLinkType(link);
    } else if (body.linkType !== undefined) {
      data.linkType = body.linkType;
    }

    const updated = await prisma.meeting.update({
      where: { id: params.id },
      data,
    });

    return jsonOk(serializeMeeting(updated));
  } catch (e) {
    return handleError(e);
  }
}

// DELETE /api/meetings/:id -> 204.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    const existing = await prisma.meeting.findFirst({
      where: { id: params.id, userId },
    });
    if (!existing) return jsonError("Not found", 404);

    await prisma.meeting.delete({ where: { id: params.id } });
    return new Response(null, { status: 204 });
  } catch (e) {
    return handleError(e);
  }
}

export const dynamic = "force-dynamic";
