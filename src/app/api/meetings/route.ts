import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { jsonOk, parseBody, handleError } from "@/lib/api-helpers";
import { meetingCreateSchema } from "@/lib/validations";
import { serializeMeeting } from "@/lib/serialize";
import { detectLinkType } from "@/lib/utils";

// GET /api/meetings?from=ISO&to=ISO -> Meeting[] ordered by dateTime asc.
export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const dateTime =
      from || to
        ? {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          }
        : undefined;

    const rows = await prisma.meeting.findMany({
      where: { userId, ...(dateTime ? { dateTime } : {}) },
      orderBy: { dateTime: "asc" },
    });

    return jsonOk(rows.map(serializeMeeting));
  } catch (e) {
    return handleError(e);
  }
}

// POST /api/meetings -> created Meeting. Infer linkType from the link when omitted.
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const body = await parseBody(req, meetingCreateSchema);

    const link = body.link ? body.link : null;
    // When linkType is omitted or "none", derive it from the URL.
    const linkType =
      body.linkType && body.linkType !== "none"
        ? body.linkType
        : detectLinkType(link);

    const created = await prisma.meeting.create({
      data: {
        userId,
        title: body.title,
        dateTime: new Date(body.dateTime),
        durationMinutes: body.durationMinutes,
        link,
        linkType,
        notes: body.notes ?? null,
      },
    });

    return jsonOk(serializeMeeting(created), 201);
  } catch (e) {
    return handleError(e);
  }
}

export const dynamic = "force-dynamic";
