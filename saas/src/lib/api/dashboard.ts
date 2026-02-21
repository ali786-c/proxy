import { z } from "zod";
import { api, MessageSchema } from "./client";

// ── Subscription ─────────────────────────────────────

export const SubscriptionSchema = z.object({
  plan: z.string(),
  included_gb: z.number(),
  used_gb: z.number(),
  renewal_date: z.string(),
  price_cents: z.number(),
  status: z.enum(["active", "past_due", "canceled"]),
});
export type Subscription = z.infer<typeof SubscriptionSchema>;

// ── Usage ────────────────────────────────────────────

export const UsagePointSchema = z.object({
  date: z.string(),
  bandwidth_mb: z.number(),
  requests: z.number(),
  errors: z.number(),
  success_rate: z.number(),
});
export type UsagePoint = z.infer<typeof UsagePointSchema>;

export const UsageResponseSchema = z.object({
  data: z.array(UsagePointSchema),
  total_bandwidth_mb: z.number(),
  total_requests: z.number(),
  avg_success_rate: z.number(),
});
export type UsageResponse = z.infer<typeof UsageResponseSchema>;

// ── Events ───────────────────────────────────────────

export const EventSchema = z.object({
  id: z.string(),
  type: z.enum(["generated", "ban", "auth_failure", "error", "info"]),
  message: z.string(),
  created_at: z.string(),
});
export type AppEvent = z.infer<typeof EventSchema>;

// ── Proxy Generation ─────────────────────────────────

export const ProxyGenerateInputSchema = z.object({
  product: z.enum(["residential", "datacenter", "isp", "mobile", "socks5"]),
  country: z.string().min(1, "Country is required"),
  city: z.string().optional(),
  session_type: z.enum(["rotating", "sticky"]),
  quantity: z.number().min(1).max(1000),
});
export type ProxyGenerateInput = z.infer<typeof ProxyGenerateInputSchema>;

export const GeneratedProxySchema = z.object({
  host: z.string(),
  port: z.number(),
  username: z.string(),
  password: z.string(),
});
export type GeneratedProxy = z.infer<typeof GeneratedProxySchema>;

export const ProxyGenerateResponseSchema = z.object({
  proxies: z.array(GeneratedProxySchema),
  expires_at: z.string().optional(),
});

// ── IP Allowlist ─────────────────────────────────────

export const AllowlistEntrySchema = z.object({
  id: z.string(),
  ip: z.string(),
  label: z.string().optional(),
  created_at: z.string(),
});
export type AllowlistEntry = z.infer<typeof AllowlistEntrySchema>;

// ── API Keys ─────────────────────────────────────────

export const ApiKeySchema = z.object({
  id: z.string(),
  name: z.string(),
  key_prefix: z.string(),
  allowed_countries: z.array(z.string()).optional(),
  daily_gb_cap: z.number().nullable().optional(),
  daily_request_cap: z.number().nullable().optional(),
  allowed_scopes: z.array(z.string()).optional(),
  created_at: z.string(),
  last_used_at: z.string().nullable().optional(),
});
export type ApiKey = z.infer<typeof ApiKeySchema>;

export const ApiKeyCreateResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  key: z.string(), // full key shown once
});

// ── Invoices ─────────────────────────────────────────

export const InvoiceSchema = z.object({
  id: z.string(),
  amount_cents: z.number(),
  status: z.enum(["paid", "pending", "failed"]),
  period: z.string(),
  created_at: z.string(),
});
export type Invoice = z.infer<typeof InvoiceSchema>;

// ── Plans ────────────────────────────────────────────

export const PlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  price_cents: z.number(),
  included_gb: z.number(),
  features: z.array(z.string()),
});
export type Plan = z.infer<typeof PlanSchema>;

// ── API Functions ────────────────────────────────────

export const clientApi = {
  // Subscription
  getSubscription: () => api.get("/me/subscription", SubscriptionSchema),

  // Usage
  getUsage: (range: string) => api.get(`/me/usage?range=${encodeURIComponent(range)}`, UsageResponseSchema),
  getEvents: () => api.get("/me/events", z.array(EventSchema)),

  // Proxy generation
  generateProxies: (input: ProxyGenerateInput) =>
    api.post("/proxy/generate", ProxyGenerateResponseSchema, input),

  // IP Allowlist
  getAllowlist: () => api.get("/me/ip-allowlist", z.array(AllowlistEntrySchema)),
  addAllowlistEntry: (ip: string, label?: string) =>
    api.post("/me/ip-allowlist", AllowlistEntrySchema, { ip, label }),
  removeAllowlistEntry: (id: string) =>
    api.delete(`/me/ip-allowlist/${encodeURIComponent(id)}`, MessageSchema),

  // API Keys
  getApiKeys: () => api.get("/me/api-keys", z.array(ApiKeySchema)),
  createApiKey: (data: { name: string; allowed_countries?: string[]; daily_gb_cap?: number; daily_request_cap?: number; allowed_scopes?: string[] }) =>
    api.post("/me/api-keys", ApiKeyCreateResponseSchema, data),
  revokeApiKey: (id: string) =>
    api.delete(`/me/api-keys/${encodeURIComponent(id)}`, MessageSchema),

  // Billing
  getPlans: () => api.get("/me/plans", z.array(PlanSchema)),
  getInvoices: () => api.get("/me/invoices", z.array(InvoiceSchema)),
};
