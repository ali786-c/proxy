import { z, ZodSchema } from "zod";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

async function request<T>(
  path: string,
  schema: ZodSchema<T>,
  options: RequestOptions = {}
): Promise<T> {
  const { body, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...((customHeaders as Record<string, string>) ?? {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers,
    credentials: "include", // send HttpOnly cookies
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new ApiError(res.status, errorBody?.message ?? res.statusText, errorBody);
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
};

// Common response schemas
export const MessageSchema = z.object({ message: z.string() });
export const PaginatedSchema = <T extends ZodSchema>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    per_page: z.number(),
  });
