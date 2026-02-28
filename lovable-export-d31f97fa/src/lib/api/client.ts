import { z, ZodSchema } from "zod";

const API_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
// Ensure it's absolute from root and doesn't end with a slash
const API_BASE = API_URL.startsWith("http") ? API_URL : (API_URL.startsWith("/") ? API_URL : `/${API_URL}`).replace(/\/$/, "");

const TOKEN_KEY = "up_auth_token";

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

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
    ...((customHeaders as Record<string, string>) ?? {}),
    Accept: "application/json",
  };

  // Only set Content-Type to JSON if body is NOT FormData
  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers,
    body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
  });

  if (res.status === 401) {
    tokenStorage.clear();
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
  match: <T>(methods: string[], path: string, schema: ZodSchema<T>, body?: unknown) =>
    request(path, schema, { method: methods[0], body, headers: { "X-HTTP-Method-Override": methods.join(",") } }), // Simple version for now
};

export const MessageSchema = z.object({ message: z.string() });

export const PaginatedSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    meta: z.object({
      current_page: z.number(),
      last_page: z.number(),
      per_page: z.number(),
      total: z.number(),
    }),
  });
