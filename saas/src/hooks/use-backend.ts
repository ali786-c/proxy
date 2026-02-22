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

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data } = await api.get("/proxies");
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
