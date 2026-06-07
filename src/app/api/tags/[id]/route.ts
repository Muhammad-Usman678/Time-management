import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { jsonError, handleError } from "@/lib/api-helpers";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    const result = await prisma.tag.deleteMany({
      where: { id: params.id, userId },
    });
    if (result.count === 0) return jsonError("Not found", 404);
    return new Response(null, { status: 204 });
  } catch (e) {
    return handleError(e);
  }
}

export const dynamic = "force-dynamic";
