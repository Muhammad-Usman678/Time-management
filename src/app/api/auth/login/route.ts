import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { parseBody, jsonOk, jsonError, handleError } from "@/lib/api-helpers";
import { loginSchema } from "@/lib/validations";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await parseBody(req, loginSchema);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return jsonError("Invalid email or password", 401);
    }

    await createSession(user.id);
    return jsonOk({ id: user.id, email: user.email, name: user.name });
  } catch (e) {
    return handleError(e);
  }
}

export const dynamic = "force-dynamic";
