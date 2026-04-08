/**
 * Typed API client for EduHire.
 * All fetch calls go through this so credentials, base URL,
 * and error handling are handled in one place.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: Record<string, unknown> | FormData;
  params?: Record<string, string | number | boolean | undefined>;
};

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, params, ...rest } = options;

  // Build URL with optional query params
  let url = `${API_BASE}${path}`;
  if (params) {
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join("&");
    if (qs) url += `?${qs}`;
  }

  const headers: HeadersInit = {};
  let serializedBody: BodyInit | undefined;

  if (body instanceof FormData) {
    serializedBody = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    serializedBody = JSON.stringify(body);
  }

  const res = await fetch(url, {
    ...rest,
    headers: { ...headers, ...rest.headers },
    body: serializedBody,
    credentials: "include", // always send cookies
  });

  // Parse response
  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      typeof data === "object" && data !== null && "error" in data
        ? (data as { error: string }).error
        : `Request failed: ${res.status}`;
    throw new ApiError(res.status, message);
  }

  return data as T;
}

// ── Convenience methods ──────────────────────────────────

export const api = {
  get: <T>(path: string, params?: RequestOptions["params"]) =>
    apiFetch<T>(path, { method: "GET", params }),

  post: <T>(path: string, body?: Record<string, unknown>) =>
    apiFetch<T>(path, { method: "POST", body }),

  put: <T>(path: string, body?: Record<string, unknown>) =>
    apiFetch<T>(path, { method: "PUT", body }),

  patch: <T>(path: string, body?: Record<string, unknown>) =>
    apiFetch<T>(path, { method: "PATCH", body }),

  delete: <T>(path: string) =>
    apiFetch<T>(path, { method: "DELETE" }),
};
