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
  port: z.coerce.number(), // coerce in case backend returns string
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
  invoice_number: z.string().optional(),
  amount: z.number().optional(),
  amount_cents: z.number(),
  status: z.string(),
  gateway: z.string().nullable().optional(),
  period: z.string(),
  created_at: z.string(),
  pdf_url: z.string().nullable().optional(),
});
export type Invoice = z.infer<typeof InvoiceSchema>;

// ── Coupons ──────────────────────────────────────────

export const CouponResponseSchema = z.object({
  valid: z.boolean(),
  code: z.string(),
  type: z.enum(["percentage", "fixed"]),
  value: z.number(),
  discount: z.number(),
});
export type CouponResponse = z.infer<typeof CouponResponseSchema>;

// ── Plans ────────────────────────────────────────────

export const PlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  price_cents: z.number(),
  included_gb: z.number(),
  features: z.array(z.string()),
});
export type Plan = z.infer<typeof PlanSchema>;

export const TopUpSettingsSchema = z.object({
  enabled: z.boolean(),
  threshold: z.number(),
  amount: z.number(),
  max_monthly: z.number(),
  has_payment_method: z.boolean(),
  global_enabled: z.boolean(),
});
export type TopUpSettings = z.infer<typeof TopUpSettingsSchema>;

// ── API Functions ────────────────────────────────────

export const clientApi = {
  // Subscription
  getSubscription: () => api.get("/me/subscription", SubscriptionSchema),

  // Usage
  getUsage: (range: string) => api.get(`/me/usage?range=${encodeURIComponent(range)}`, UsageResponseSchema),
  getEvents: () => api.get("/me/events", z.array(EventSchema)),

  // Proxy generation
  generateProxies: (input: ProxyGenerateInput) =>
    api.post("/proxies/generate", ProxyGenerateResponseSchema, input),
  getOrders: (type?: string) =>
    api.get(`/proxies${type ? `?type=${type}` : ""}`, z.array(z.any())),

  // IP Allowlist
  getAllowlist: () => api.get("/allowlist", z.array(AllowlistEntrySchema)),
  addAllowlistEntry: (ip: string, label?: string) =>
    api.post("/allowlist", AllowlistEntrySchema, { ip, label }),
  removeAllowlistEntry: (id: string) =>
    api.match(["DELETE", "POST"], `/allowlist/${encodeURIComponent(id)}`, MessageSchema),

  // Newsletters
  subscribeNewsletter: (email: string) =>
    api.post("/newsletters", MessageSchema, { email }),

  // API Keys
  getApiKeys: () => api.get("/api_keys", z.array(ApiKeySchema)),
  createApiKey: (data: { name: string; allowed_countries?: string[]; daily_gb_cap?: number; daily_request_cap?: number; allowed_scopes?: string[] }) =>
    api.post("/api_keys", ApiKeyCreateResponseSchema, data),
  revokeApiKey: (id: string) =>
    api.delete(`/api_keys/${encodeURIComponent(id)}`, MessageSchema),

  // Billing
  getPlans: () => api.get("/products", z.array(PlanSchema)),
  getInvoices: () => api.get("/invoices", z.array(InvoiceSchema)),
  createCheckout: (productId: string, amount: number, couponCode?: string) =>
    api.post("/billing/checkout", z.object({ url: z.string() }), { product_id: productId, amount, coupon_code: couponCode }),
  createCryptomusCheckout: (amount: number, couponCode?: string) =>
    api.post("/billing/cryptomus-checkout", z.object({ url: z.string() }), { amount, coupon_code: couponCode }),
  createProductCheckout: (productId: string, quantity: number, country?: string, session_type?: string, couponCode?: string) =>
    api.post("/billing/product-checkout", z.object({ url: z.string() }), {
      product_id: productId,
      quantity,
      country,
      session_type,
      coupon_code: couponCode
    }),
  createCryptomusProductCheckout: (productId: string, quantity: number, country?: string, session_type?: string, couponCode?: string) =>
    api.post("/billing/cryptomus-product-checkout", z.object({ url: z.string() }), {
      product_id: productId,
      quantity,
      country,
      session_type,
      coupon_code: couponCode
    }),
  validateCoupon: (code: string, amount: number) =>
    api.post("/coupons/validate", CouponResponseSchema, { code, amount }),
  submitCrypto: (data: { currency: string; amount: number; txid: string }) =>
    api.post("/billing/submit-crypto", MessageSchema, data),
  submitManualCrypto: (formData: FormData) =>
    api.post("/billing/submit-crypto", MessageSchema, formData),
  createSetupIntent: () =>
    api.post("/billing/setup-intent", z.object({ client_secret: z.string() }), {}),
  getGateways: () =>
    api.get("/billing/gateways", z.object({
      stripe: z.boolean(),
      paypal: z.boolean(),
      crypto: z.boolean(),
      cryptomus: z.boolean()
    })),

  // Proxy settings (geo-metadata)
  getProxySettings: () => api.get("/proxies/settings", z.any()),

  // User Top-up Settings
  getTopUpSettings: () => api.get("/me/topup-settings", TopUpSettingsSchema),
  updateTopUpSettings: (settings: { enabled: boolean; threshold: number; amount: number; max_monthly: number }) =>
    api.post("/me/topup-settings", MessageSchema, settings),

  // Referral
  getReferralStats: () => api.get("/referrals", z.any()),

  // Auth Extras
  forgotPassword: (email: string) =>
    api.post("/auth/password/email", MessageSchema, { email }),
  resetPassword: (data: any) =>
    api.post("/auth/password/reset", MessageSchema, data),
};

export const twoFactorApi = {
  setup: () => api.get("/2fa/setup", z.object({
    secret: z.string(),
    qr_code_svg: z.string()
  })),
  confirm: (code: string) => api.post("/2fa/confirm", z.object({
    message: z.string(),
    recovery_codes: z.array(z.string())
  }), { code }),
  disable: (data: { password: string; code?: string }) =>
    api.post("/2fa/disable", MessageSchema, data),
  getRecoveryCodes: () => api.get("/2fa/recovery-codes", z.object({
    recovery_codes: z.array(z.string())
  })),
};
