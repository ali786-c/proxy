import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, MessageSchema } from "@/lib/api/client";
import { clientApi } from "@/lib/api/dashboard";
import {
  UsageResponseSchema,
  EventSchema,
  AllowlistEntrySchema,
  ApiKeySchema,
  ApiKeyCreateResponseSchema,
  InvoiceSchema,
  PlanSchema,
  ProxyGenerateResponseSchema,
  SubscriptionSchema
} from "@/lib/api/dashboard";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";

// ── Client Hooks ──────────────────────────────

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      return api.get("/auth/me", z.any()); // Or UserSchema if defined
    },
  });
}

export function useProfileInfo() {
  return useQuery({
    queryKey: ["profile-info"],
    queryFn: async () => {
      return api.get("/profile", z.any());
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { name?: string; password?: string; password_confirmation?: string }) => {
      return api.post("/profile", MessageSchema, params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["profile-info"] });
    },
  });
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      return api.get("/stats", z.any());
    },
    refetchInterval: 1000 * 60 * 5, // 5 min auto refetch
  });
}
export function useUsage(range: string = "7d") {
  return useQuery({
    queryKey: ["usage", range],
    queryFn: async () => {
      return api.get(`/me/usage?range=${encodeURIComponent(range)}`, UsageResponseSchema);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      return api.get("/me/events", z.array(EventSchema));
    },
  });
}

export function useOrders(type?: string | null) {
  return useQuery({
    queryKey: ["orders", type],
    queryFn: async () => {
      // In Laravel, we use /proxies with optional type param
      const path = type ? `/proxies?type=${type}` : "/proxies";
      return api.get(path, z.array(z.any()));
    },
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      return api.get("/invoices", z.array(InvoiceSchema));
    },
  });
}

export function useApiKeys() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["api_keys"],
    queryFn: async () => {
      return api.get("/api_keys", z.array(ApiKeySchema));
    },
  });

  const createKey = useMutation({
    mutationFn: async (keyName: string) => {
      return api.post("/api_keys", ApiKeyCreateResponseSchema, { key_name: keyName });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["api_keys"] }),
  });

  const deleteKey = useMutation({
    mutationFn: async (keyId: string) => {
      await api.delete(`/api_keys/${keyId}`, MessageSchema);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["api_keys"] }),
  });

  return { ...query, createKey, revokeKey: deleteKey, deleteKey };
}

export function useSupportTickets() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      return api.get("/support/tickets", z.array(z.any()));
    },
  });

  const createTicket = useMutation({
    mutationFn: async (ticket: { subject: string; message: string; priority: string }) => {
      return api.post("/support/tickets", MessageSchema, ticket);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tickets"] }),
  });

  const replyTicket = useMutation({
    mutationFn: async ({ id, message }: { id: number | string; message: string }) => {
      return api.post(`/support/tickets/${id}/reply`, MessageSchema, { message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] });
    },
  });

  return { ...query, createTicket, replyTicket };
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      return api.get("/products", z.array(PlanSchema));
    },
  });
}

// ── Proxy Actions ────────────────────────────

export function useGenerateProxy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { product_id: number; quantity: number }) => {
      return api.post("/proxies/generate", ProxyGenerateResponseSchema, params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["subuser-status"] });
    },
  });
}

// ── Subuser Hooks ─────────────────────────────

export function useSubuserStatus() {
  return useQuery({
    queryKey: ["subuser-status"],
    queryFn: async () => {
      return api.get("/subusers/status", z.any());
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useSetupSubuser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return api.post("/subusers/setup", MessageSchema);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["subuser-status"] });
    },
  });
}

export function useProxySettings() {
  return useQuery({
    queryKey: ["proxy-settings"],
    queryFn: async () => {
      return clientApi.getProxySettings();
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
}

export function useAllowlist() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["allowlist"],
    queryFn: async () => {
      return api.get("/allowlist", z.array(AllowlistEntrySchema));
    },
  });

  const addEntry = useMutation({
    mutationFn: async (entry: { ip: string; label?: string }) => {
      return api.post("/allowlist", AllowlistEntrySchema, entry);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["allowlist"] }),
  });

  const removeEntry = useMutation({
    mutationFn: async (entryId: string | number) => {
      await api.post(`/allowlist/${entryId}`, MessageSchema, { _method: 'DELETE' });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["allowlist"] }),
  });

  return { ...query, addEntry, removeEntry };
}

// ── Payment Actions ──────────────────────────

export function useStripeCheckout() {
  return useMutation({
    mutationFn: async (params: { amount: number }) => {
      const data: any = await api.post("/billing/checkout", z.object({ url: z.string() }), params);
      if (data.url) window.location.href = data.url;
      return data;
    },
  });
}

// ── Admin Hooks ──────────────────────────────

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      return api.get("/admin/users", z.array(z.any()));
    },
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      return api.get("/admin/stats", z.any());
    },
    refetchInterval: 1000 * 60,
  });
}

export function useAdminTickets() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin", "tickets"],
    queryFn: async () => {
      return api.get("/admin/support/tickets", z.array(z.any()));
    },
  });

  const replyTicket = useMutation({
    mutationFn: async ({ id, message }: { id: number | string; message: string }) => {
      return api.post(`/admin/support/tickets/${id}/reply`, MessageSchema, { message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number | string; status: string }) => {
      return api.post(`/admin/support/tickets/${id}/status`, MessageSchema, { status });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] }),
  });

  return { ...query, replyTicket, updateStatus };
}

export function useAdminPaymentGateways() {
  return useQuery({
    queryKey: ["admin", "payment-gateways"],
    queryFn: async () => {
      return api.get("/admin/payment-gateways", z.any());
    },
  });
}

// Blog Hooks
export function useBlogPosts() {
  return useQuery({
    queryKey: ["blog", "posts"],
    queryFn: async () => {
      return api.get("/blog", z.array(z.any()));
    },
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog", "post", slug],
    queryFn: async () => {
      return api.get(`/blog/${slug}`, z.any());
    },
    enabled: !!slug,
  });
}

export function useAdminBlogPosts() {
  return useQuery({
    queryKey: ["admin", "blog"],
    queryFn: async () => {
      return api.get("/admin/blog", z.array(z.any()));
    },
  });
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post("/admin/blog", z.any(), data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "blog"] }),
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: any }) =>
      api.put(`/admin/blog/${id}`, z.any(), data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "blog"] }),
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => api.delete(`/admin/blog/${id}`, z.any()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "blog"] }),
  });
}

export function usePublishBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_draft }: { id: string | number; is_draft?: boolean }) =>
      api.post(`/admin/blog/${id}/publish`, z.any(), { is_draft }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
      queryClient.invalidateQueries({ queryKey: ["blog", "posts"] });
    },
  });
}

// Auto-Blog Hooks
export function useAutoBlogStatus() {
  return useQuery({
    queryKey: ["admin", "blog", "automation"],
    queryFn: () => api.get("/admin/blog/automation", z.any()),
  });
}

export function useUpdateAutoBlogSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post("/admin/blog/automation/settings", z.any(), data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "blog", "automation"] }),
  });
}

export function useAddAutoBlogKeyword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { keyword: string; category?: string }) =>
      api.post("/admin/blog/automation/keywords", z.any(), data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "blog", "automation"] }),
  });
}

export function useDeleteAutoBlogKeyword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) =>
      api.delete(`/admin/blog/automation/keywords/${id}`, z.any()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "blog", "automation"] }),
  });
}

export function useTriggerAutoBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params?: { keyword_id?: number }) =>
      api.post("/admin/blog/automation/trigger", z.any(), params || {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
      queryClient.invalidateQueries({ queryKey: ["blog", "posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "blog", "automation"] });
    },
  });
}

// Alert Hooks
export function useAdminAlertConfig() {
  return useQuery({
    queryKey: ["admin", "alerts", "config"],
    queryFn: async () => {
      return api.get("/admin/alerts/config", z.any());
    },
  });
}

export function useUpdateAlertConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.patch("/admin/alerts/config", z.any(), data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "alerts", "config"] }),
  });
}

// Fraud Detection Hooks
export function useAdminFraudSignals(resolved?: boolean) {
  return useQuery({
    queryKey: ["admin", "fraud", "signals", resolved],
    queryFn: async () => {
      const url = resolved !== undefined ? `/admin/fraud/signals?resolved=${resolved}` : "/admin/fraud/signals";
      return api.get(url, z.array(z.any()));
    },
  });
}

export function useAdminRiskScores() {
  return useQuery({
    queryKey: ["admin", "fraud", "risk-scores"],
    queryFn: async () => {
      return api.get("/admin/fraud/risk-scores", z.array(z.any()));
    },
  });
}

export function useAdminLoginHistory() {
  return useQuery({
    queryKey: ["admin", "fraud", "login-history"],
    queryFn: async () => {
      return api.get("/admin/fraud/login-history", z.array(z.any()));
    },
  });
}

export function useResolveFraudSignal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => api.put(`/admin/fraud/signals/${id}/resolve`, z.any()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "fraud", "signals"] });
      // Also invalidate dashboard stats since signals changed
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}
