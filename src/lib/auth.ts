import { prisma } from "@/lib/db";

/**
 * Auth is OPTIONAL. The app ships single-user: every request resolves to a
 * stable demo user that is created by the seed script. The entire data model
 * already carries `userId`, so enabling real multi-user auth later is a matter
 * of swapping the body of `getCurrentUserId()` for a session lookup — no schema
 * or query changes required.
 *
 * To enable real auth (Auth.js / NextAuth v5):
 *   1. npm i next-auth@beta
 *   2. Add a provider + the Prisma adapter in src/lib/auth.config.ts
 *   3. Replace the body below with:
 *        const session = await auth();
 *        if (!session?.user?.id) throw new UnauthorizedError();
 *        return session.user.id;
 */

export const DEMO_USER_ID = "demo-user";
export const DEMO_USER_EMAIL = "phd@example.com";

/**
 * Returns the id of the acting user. In single-user mode this lazily ensures the
 * demo user exists so the app works on a fresh database even before seeding.
 */
export async function getCurrentUserId(): Promise<string> {
  if (process.env.AUTH_ENABLED === "true") {
    // Placeholder for a real session lookup (see note above).
    throw new Error(
      "AUTH_ENABLED=true but no auth provider is wired up. See src/lib/auth.ts."
    );
  }

  const user = await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: {},
    create: { id: DEMO_USER_ID, email: DEMO_USER_EMAIL, name: "PhD Researcher" },
    select: { id: true },
  });

  return user.id;
}
