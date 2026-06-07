import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { generateSessionToken } from "@/lib/password";
import { SESSION_COOKIE } from "@/lib/auth-constants";

// Database-backed sessions. A random opaque token lives in an httpOnly cookie;
// the matching row in the Session table carries the userId + expiry. This keeps
// auth state revocable (logout deletes the row) with no signing secret to manage.

export { SESSION_COOKIE };
const SESSION_TTL_DAYS = 30;
const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

/** Create a session for a user and set the cookie. Returns the token. */
export async function createSession(userId: string): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({ data: { token, userId, expiresAt } });

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  });

  return token;
}

/** Resolve the current session's userId, or null. Clears expired sessions. */
export async function getSessionUserId(): Promise<string | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({ where: { token } });
  if (!session) return null;

  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { token } }).catch(() => {});
    return null;
  }
  return session.userId;
}

/** Delete the current session (logout) and clear the cookie. */
export async function destroySession(): Promise<void> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  cookies().delete(SESSION_COOKIE);
}
