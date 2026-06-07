import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { jsonOk, parseBody, handleError } from "@/lib/api-helpers";
import { tagCreateSchema } from "@/lib/validations";
import { serializeTag } from "@/lib/serialize";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const tags = await prisma.tag.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });
    return jsonOk(tags.map(serializeTag));
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const { name, color } = await parseBody(req, tagCreateSchema);

    // Tags are unique per [userId, name] — return the existing one on duplicate
    // instead of erroring, so re-creating a tag inline is idempotent.
    const existing = await prisma.tag.findUnique({
      where: { userId_name: { userId, name } },
    });
    if (existing) return jsonOk(serializeTag(existing));

    const tag = await prisma.tag.create({
      data: { userId, name, color },
    });
    return jsonOk(serializeTag(tag), 201);
  } catch (e) {
    return handleError(e);
  }
}

export const dynamic = "force-dynamic";
