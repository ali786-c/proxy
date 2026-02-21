import { z, ZodSchema } from "zod";

// VITE_API_BASE_URL should be set to "/api" in saas/.env
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

const TOKEN_KEY = "up_auth_token";

// ── Token helpers ────────────────────────────────────
export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

// ── Request options ──────────────────────────────────
interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

async function request<T>(
  path: string,
  schema: ZodSchema<T>,
  options: RequestOptions = {}
): Promise<T> {
  const { body, headers: customHeaders, ...rest } = options;

  const token = tokenStorage.get();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...((customHeaders as Record<string, string>) ?? {}),
  };

  // Inject Bearer token if it exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Auto-logout on 401 Unauthorized
  if (res.status === 401) {
    tokenStorage.clear();
    window.location.href = "/login";
    throw new ApiError(401, "Session expired. Please log in again.", {});
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      errorBody?.message ?? res.statusText,
      errorBody
    );
  }

  const json = await res.json();
  return schema.parse(json);
}

// ── Error class ──────────────────────────────────────
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ── API methods ──────────────────────────────────────
export const api = {
  get: <T>(path: string, schema: ZodSchema<T>) =>
    request(path, schema, { method: "GET" }),
  post: <T>(path: string, schema: ZodSchema<T>, body?: unknown) =>
    request(path, schema, { method: "POST", body }),
  put: <T>(path: string, schema: ZodSchema<T>, body?: unknown) =>
    request(path, schema, { method: "PUT", body }),
  patch: <T>(path: string, schema: ZodSchema<T>, body?: unknown) =>
    request(path, schema, { method: "PATCH", body }),
  delete: <T>(path: string, schema: ZodSchema<T>) =>
    request(path, schema, { method: "DELETE" }),
};

// ── Common response schemas ──────────────────────────
export const MessageSchema = z.object({ message: z.string() });

export const PaginatedSchema = <T extends ZodSchema>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    per_page: z.number(),
  });
