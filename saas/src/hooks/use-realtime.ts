import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useRealtimeOrders(userId?: string) {
  useEffect(() => {
    // Realtime disabled (Supabase migration)
  }, [userId]);
}

export function useRealtimeTickets(userId?: string) {
  useEffect(() => {
    // Realtime disabled
  }, [userId]);
}

export function useRealtimeInvoices(userId?: string) {
  useEffect(() => {
    // Realtime disabled
  }, [userId]);
}

// Admin: listen to all changes
export function useRealtimeAdminOrders() {
  useEffect(() => {
    // Realtime disabled
  }, []);
}

export function useRealtimeAdminTickets() {
  useEffect(() => {
    // Realtime disabled
  }, []);
}
