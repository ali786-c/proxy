import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

// ── Client Hooks ──────────────────────────────

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await api.get("/me");
      return data;
    },
  });
}

export function useProfileInfo() {
  return useQuery({
    queryKey: ["profile-info"],
    queryFn: async () => {
      const { data } = await api.get("/profile");
      return data;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { name?: string; password?: string; password_confirmation?: string }) => {
      const { data } = await api.post("/profile", params);
      return data;
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
      const { data } = await api.get("/stats");
      return data;
    },
    refetchInterval: 1000 * 60 * 5, // 5 min auto refetch
  });
}

export function useOrders(type?: string | null) {
  return useQuery({
    queryKey: ["orders", type],
    queryFn: async () => {
      const { data } = await api.get("/proxies", {
        params: { type },
      });
      return data;
    },
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data } = await api.get("/invoices");
      return data;
    },
  });
}

export function useApiKeys() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["api_keys"],
    queryFn: async () => {
      const { data } = await api.get("/api_keys");
      return data;
    },
  });

  const createKey = useMutation({
    mutationFn: async (keyName: string) => {
      const { data } = await api.post("/api_keys", { key_name: keyName });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["api_keys"] }),
  });

  const deleteKey = useMutation({
    mutationFn: async (keyId: string) => {
      await api.delete(`/api_keys/${keyId}`);
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
      const { data } = await api.get("/support/tickets");
      return data;
    },
  });

  const createTicket = useMutation({
    mutationFn: async (ticket: { subject: string; message: string; priority: string }) => {
      const { data } = await api.post("/support/tickets", ticket);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tickets"] }),
  });

  return { ...query, createTicket };
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await api.get("/products");
      return data;
    },
  });
}

// ── Proxy Actions ────────────────────────────

export function useGenerateProxy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { product_id: number; quantity: number }) => {
      const { data } = await api.post("/proxies/generate", params);
      return data;
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
      const { data } = await api.get("/subusers/status");
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 min cache on frontend
  });
}

export function useSetupSubuser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/subusers/setup");
      return data;
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
      const { data } = await api.get("/proxies/settings");
      return data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
}

export function useAllowlist() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["allowlist"],
    queryFn: async () => {
      const { data } = await api.get("/allowlist");
      return data;
    },
  });

  const addEntry = useMutation({
    mutationFn: async (entry: { ip: string; label?: string }) => {
      const { data } = await api.post("/allowlist", entry);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["allowlist"] }),
  });

  const removeEntry = useMutation({
    mutationFn: async (entryId: string | number) => {
      // Use POST with _method spoofing if standard DELETE is blocked by some servers
      await api.post(`/allowlist/${entryId}`, { _method: 'DELETE' });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["allowlist"] }),
  });

  return { ...query, addEntry, removeEntry };
}

// ── Payment Actions ──────────────────────────

export function useStripeCheckout() {
  return useMutation({
    mutationFn: async (params: { amount: number }) => {
      const { data } = await api.post("/billing/checkout", params);
      if (data.url) window.location.href = data.url;
      return data;
    },
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: async (params: { code: string; amount: number }) => {
      const { data } = await api.post("/coupons/validate", params);
      return data;
    },
  });
}

// ── Admin Hooks ──────────────────────────────

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const { data } = await api.get("/admin/users");
      return data;
    },
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const { data } = await api.get("/admin/stats");
      return data;
    },
    refetchInterval: 1000 * 60, // 1 min refresh for admin stats
  });
}

export function useAdminLogs() {
  return useQuery({
    queryKey: ["admin", "logs"],
    queryFn: async () => {
      const { data } = await api.get("/admin/logs");
      return data;
    },
  });
}

export function useAdminAction() {
  const queryClient = useQueryClient();

  const updateBalance = useMutation({
    mutationFn: async (params: { user_id: number; amount: number; reason: string }) => {
      const { data } = await api.post("/admin/users/balance", params);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });

  const banUser = useMutation({
    mutationFn: async (params: { user_id: number; reason: string }) => {
      const { data } = await api.post("/admin/users/ban", params);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  return { updateBalance, banUser };
}

export function useAdminProducts() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      const { data } = await api.get("/products");
      return data;
    },
  });

  const createProduct = useMutation({
    mutationFn: async (product: any) => {
      const { data } = await api.post("/admin/products", product);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "products"] }),
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...product }: any) => {
      const { data } = await api.put(`/admin/products/${id}`, product);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "products"] }),
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/products/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "products"] }),
  });

  return { ...query, createProduct, updateProduct, deleteProduct };
}

export function useAdminCoupons() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: async () => {
      const { data } = await api.get("/admin/coupons");
      return data;
    },
  });

  const createCoupon = useMutation({
    mutationFn: async (coupon: any) => {
      const { data } = await api.post("/admin/coupons", coupon);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] }),
  });

  const deleteCoupon = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/coupons/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] }),
  });

  const toggleCoupon = useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post(`/admin/coupons/${id}/toggle`);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] }),
  });

  return { ...query, createCoupon, deleteCoupon, toggleCoupon };
}
