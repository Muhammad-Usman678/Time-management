import { jsonOk, handleError } from "@/lib/api-helpers";
import { destroySession } from "@/lib/session";

export async function POST() {
  try {
    await destroySession();
    return jsonOk({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}

export const dynamic = "force-dynamic";
