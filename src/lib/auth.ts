import { getSessionUserId } from "@/lib/session";
import { UnauthorizedError } from "@/lib/errors";

/**
 * Returns the id of the authenticated user, or throws UnauthorizedError (which
 * handleError maps to 401). Every API route calls this to scope its queries by
 * userId, so each account only ever sees its own data.
 */
export async function getCurrentUserId(): Promise<string> {
  const userId = await getSessionUserId();
  if (!userId) throw new UnauthorizedError();
  return userId;
}

/** Like getCurrentUserId but returns null instead of throwing (for /me). */
export async function getOptionalUserId(): Promise<string | null> {
  return getSessionUserId();
}
