import { prisma } from "@/lib/db";
import { getOptionalUserId } from "@/lib/auth";
import { jsonOk, jsonError, handleError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const userId = await getOptionalUserId();
    if (!userId) return jsonError("Unauthorized", 401);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });
    if (!user) return jsonError("Unauthorized", 401);

    return jsonOk(user);
  } catch (e) {
    return handleError(e);
  }
}

export const dynamic = "force-dynamic";
