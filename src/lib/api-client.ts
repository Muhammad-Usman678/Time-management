import type { ApiError } from "@/lib/types";

/**
 * Thin typed wrapper around fetch used by all client hooks. Throws an
 * `ApiClientError` (with the parsed server message) on any non-2xx response so
 * React Query surfaces it through `error`.
 */

export class ApiClientError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.details = details;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!res.ok) {
    const body = data as ApiError | undefined;
    // A 401 on a non-auth endpoint means the session expired — bounce to login
    // (skip auth endpoints themselves so failed logins don't loop).
    if (
      res.status === 401 &&
      typeof window !== "undefined" &&
      !path.startsWith("/api/auth/") &&
      !["/login", "/signup"].some((p) => window.location.pathname.startsWith(p))
    ) {
      window.location.href = "/login";
    }
    throw new ApiClientError(
      body?.error ?? `Request failed (${res.status})`,
      res.status,
      body?.details
    );
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

/** Build a querystring from a record, skipping null/undefined values. */
export function qs(params: Record<string, string | number | boolean | null | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== null && v !== undefined && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}
