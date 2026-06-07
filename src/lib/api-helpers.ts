import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";
import { UnauthorizedError } from "@/lib/errors";

// -----------------------------------------------------------------------------
// Shared helpers for Route Handlers: consistent JSON success/error envelopes,
// body parsing with Zod, and a single error mapper used in every catch block.
// -----------------------------------------------------------------------------

export function jsonOk<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function jsonError(
  message: string,
  status = 400,
  details?: unknown
): NextResponse {
  return NextResponse.json({ error: message, details }, { status });
}

/** Parse + validate a JSON request body against a Zod schema (throws ZodError). */
export async function parseBody<T>(
  req: Request,
  schema: ZodSchema<T>
): Promise<T> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    raw = {};
  }
  return schema.parse(raw);
}

/** Maps thrown errors to a JSON response. Use in every route's catch block. */
export function handleError(error: unknown): NextResponse {
  if (error instanceof UnauthorizedError) {
    return jsonError("Unauthorized", 401);
  }
  if (error instanceof ZodError) {
    return jsonError("Validation failed", 422, error.flatten());
  }
  // Prisma "record not found" on update/delete.
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2025"
  ) {
    return jsonError("Not found", 404);
  }
  console.error("[api] Unhandled error:", error);
  return jsonError("Internal server error", 500);
}
