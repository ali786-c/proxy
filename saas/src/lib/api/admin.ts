import { z } from "zod";
import { api, MessageSchema, PaginatedSchema } from "./client";

// ── KPIs ──────────────────────────────────────────────
export const KpiSchema = z.object({
  total_users: z.number(),
  active_subs: z.number(),
  bandwidth_30d_gb: z.number(),
  error_rate: z.number(),
  top_geos: z.array(z.object({ country: z.string(), bandwidth_gb: z.number() })),
});
export type Kpi = z.infer<typeof KpiSchema>;

// ── Users ─────────────────────────────────────────────
export const AdminUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.enum(["client", "admin"]),
  status: z.enum(["active", "suspended", "pending"]),
  plan: z.string(),
  allowlist_count: z.number(),
  keys_count: z.number(),
  bandwidth_used_gb: z.number(),
  created_at: z.string(),
});
export type AdminUser = z.infer<typeof AdminUserSchema>;

export const AdminUserPatchSchema = z.object({
  status: z.enum(["active", "suspended"]).optional(),
  role: z.enum(["client", "admin"]).optional(),
  daily_gb_cap: z.number().optional(),
  reset_keys: z.boolean().optional(),
});
export type AdminUserPatch = z.infer<typeof AdminUserPatchSchema>;

// ── Products ──────────────────────────────────────────
export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  proxy_type: z.string(),
  price_per_gb: z.number(),
  included_gb: z.number(),
  monthly_price: z.number(),
  is_active: z.boolean(),
});
export type Product = z.infer<typeof ProductSchema>;

export const ProductInputSchema = z.object({
  name: z.string().min(1),
  proxy_type: z.string().min(1),
  price_per_gb: z.number().min(0),
  included_gb: z.number().min(0),
  monthly_price: z.number().min(0),
  is_active: z.boolean(),
});
export type ProductInput = z.infer<typeof ProductInputSchema>;

// ── Audit ─────────────────────────────────────────────
export const AuditEntrySchema = z.object({
  id: z.string(),
  actor: z.string(),
  action: z.string(),
  target: z.string().optional(),
  meta: z.record(z.unknown()).optional(),
  timestamp: z.string(),
});
export type AuditEntry = z.infer<typeof AuditEntrySchema>;

// ── Blog ──────────────────────────────────────────────
export const BlogPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  status: z.enum(["draft", "queued", "published"]),
  keywords: z.array(z.string()),
  author: z.string(),
  created_at: z.string(),
  published_at: z.string().nullable(),
});
export type BlogPost = z.infer<typeof BlogPostSchema>;

// ── Alerts Config ─────────────────────────────────────
export const AlertConfigSchema = z.object({
  error_spike_pct: z.number(),
  ban_spike_pct: z.number(),
  spend_cap_usd: z.number(),
  unusual_geo_threshold: z.number(),
  notify_email: z.boolean(),
  notify_webhook: z.boolean(),
  webhook_url: z.string(),
});
export type AlertConfig = z.infer<typeof AlertConfigSchema>;

// ── API functions ─────────────────────────────────────
export const adminApi = {
  getKpis: () => api.get("/admin/kpis", KpiSchema),
  getUsers: (params?: string) =>
    api.get(`/admin/users${params ? `?${params}` : ""}`, PaginatedSchema(AdminUserSchema)),
  patchUser: (id: string, body: AdminUserPatch) =>
    api.patch(`/admin/users/${id}`, AdminUserSchema, body),
  getProducts: () => api.get("/admin/products", z.array(ProductSchema)),
  createProduct: (body: ProductInput) =>
    api.post("/admin/products", ProductSchema, body),
  updateProduct: (id: string, body: Partial<ProductInput>) =>
    api.patch(`/admin/products/${id}`, ProductSchema, body),
  getAudit: (params?: string) =>
    api.get(`/admin/audit${params ? `?${params}` : ""}`, PaginatedSchema(AuditEntrySchema)),
  getBlogPosts: () => api.get("/admin/blog/posts", z.array(BlogPostSchema)),
  publishPost: (id: string, scheduled_at?: string) =>
    api.post(`/admin/blog/publish`, MessageSchema, { id, scheduled_at }),
  regeneratePost: (id: string) =>
    api.post(`/admin/blog/regenerate`, MessageSchema, { id }),
  getAlertConfig: () => api.get("/admin/alerts", AlertConfigSchema),
  updateAlertConfig: (body: Partial<AlertConfig>) =>
    api.patch("/admin/alerts", AlertConfigSchema, body),
};
