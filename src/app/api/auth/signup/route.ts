import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { parseBody, jsonOk, jsonError, handleError } from "@/lib/api-helpers";
import { signupSchema } from "@/lib/validations";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await parseBody(req, signupSchema);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return jsonError("An account with this email already exists", 409);
    }

    const user = await prisma.user.create({
      data: { name, email, passwordHash: hashPassword(password) },
      select: { id: true, email: true, name: true },
    });

    await createSession(user.id);
    return jsonOk(user, 201);
  } catch (e) {
    return handleError(e);
  }
}

export const dynamic = "force-dynamic";
