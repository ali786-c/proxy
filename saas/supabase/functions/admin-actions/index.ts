import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user and check admin role
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const actorId = claims.claims.sub as string;

    // Use service role to check admin status
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", actorId)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin only" }), { status: 403, headers: corsHeaders });
    }

    const body = await req.json();
    const { action, ...params } = body;

    // Input validation schemas
    const UuidSchema = z.string().uuid();
    const BanUserSchema = z.object({ user_id: UuidSchema, ban_reason: z.string().min(1).max(500) });
    const UnbanUserSchema = z.object({ user_id: UuidSchema });
    const UpdateRoleSchema = z.object({ user_id: UuidSchema, role: z.enum(["admin", "client"]) });
    const ReplyTicketSchema = z.object({ ticket_id: UuidSchema, reply: z.string().min(1).max(5000) });
    const AdjustBalanceSchema = z.object({ user_id: UuidSchema, amount: z.number().min(-100000).max(100000), reason: z.string().min(1).max(500) });
    const GetUserStatsSchema = z.object({ user_id: UuidSchema });

    // Extract IP and geo for audit logging
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("cf-connecting-ip") || "unknown";
    const geoCountry = req.headers.get("cf-ipcountry") || null;
    const geoCity = req.headers.get("cf-ipcity") || null;
    const userAgent = req.headers.get("user-agent") || null;

    const auditMeta = { ip_address: clientIp, geo_country: geoCountry, geo_city: geoCity, user_agent: userAgent };

    switch (action) {
      case "ban_user": {
        const { user_id, ban_reason } = BanUserSchema.parse(params);
        await adminClient.from("profiles").update({ is_banned: true, ban_reason }).eq("user_id", user_id);
        await adminClient.from("audit_log").insert({ actor_id: actorId, action: "ban_user", target_type: "user", target_id: user_id, metadata: { ban_reason }, ...auditMeta });
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "unban_user": {
        const { user_id } = UnbanUserSchema.parse(params);
        await adminClient.from("profiles").update({ is_banned: false, ban_reason: null }).eq("user_id", user_id);
        await adminClient.from("audit_log").insert({ actor_id: actorId, action: "unban_user", target_type: "user", target_id: user_id, ...auditMeta });
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "update_user_role": {
        const { user_id, role } = UpdateRoleSchema.parse(params);
        await adminClient.from("user_roles").upsert({ user_id, role }, { onConflict: "user_id,role" });
        await adminClient.from("audit_log").insert({ actor_id: actorId, action: "update_role", target_type: "user", target_id: user_id, metadata: { role }, ...auditMeta });
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "list_users": {
        const { data: profiles } = await adminClient
          .from("profiles")
          .select("*, user_roles(role)")
          .order("created_at", { ascending: false });
        return new Response(JSON.stringify({ users: profiles }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "get_dashboard_stats": {
        const { count: totalUsers } = await adminClient.from("profiles").select("*", { count: "exact", head: true });
        const { count: totalOrders } = await adminClient.from("orders").select("*", { count: "exact", head: true });
        const { count: openTickets } = await adminClient.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "open");
        const { data: recentInvoices } = await adminClient.from("invoices").select("*").order("created_at", { ascending: false }).limit(5);

        return new Response(JSON.stringify({
          stats: { total_users: totalUsers ?? 0, total_orders: totalOrders ?? 0, open_tickets: openTickets ?? 0 },
          recent_invoices: recentInvoices ?? [],
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "reply_ticket": {
        const { ticket_id, reply } = ReplyTicketSchema.parse(params);
        await adminClient.from("support_tickets").update({ admin_reply: reply, replied_at: new Date().toISOString(), status: "in_progress" }).eq("id", ticket_id);
        await adminClient.from("audit_log").insert({ actor_id: actorId, action: "reply_ticket", target_type: "ticket", target_id: ticket_id, ...auditMeta });
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "adjust_balance": {
        const { user_id, amount, reason } = AdjustBalanceSchema.parse(params);
        const { data: profile } = await adminClient.from("profiles").select("balance").eq("user_id", user_id).single();
        if (!profile) return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: corsHeaders });
        const newBalance = Number(profile.balance) + amount;
        if (newBalance < 0) return new Response(JSON.stringify({ error: "Balance cannot go below zero" }), { status: 400, headers: corsHeaders });
        await adminClient.from("profiles").update({ balance: newBalance }).eq("user_id", user_id);
        await adminClient.from("audit_log").insert({ actor_id: actorId, action: amount > 0 ? "top_up_balance" : "deduct_balance", target_type: "user", target_id: user_id, metadata: { amount, reason, new_balance: newBalance }, ...auditMeta });
        return new Response(JSON.stringify({ success: true, new_balance: newBalance }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "get_user_stats": {
        const { user_id } = GetUserStatsSchema.parse(params);
        const { data: orders } = await adminClient.from("orders").select("total_amount, quantity, proxy_type, status").eq("user_id", user_id);
        const { data: invoices } = await adminClient.from("invoices").select("amount, status").eq("user_id", user_id);
        const { data: apiKeys } = await adminClient.from("api_keys").select("id, is_active").eq("user_id", user_id);
        const { data: tickets } = await adminClient.from("support_tickets").select("id, status").eq("user_id", user_id);
        const totalSpent = (invoices ?? []).filter(i => i.status === "completed").reduce((s, i) => s + Number(i.amount), 0);
        const activeOrders = (orders ?? []).filter(o => o.status === "active").length;
        const totalOrders = (orders ?? []).length;
        const activeKeys = (apiKeys ?? []).filter(k => k.is_active).length;
        const openTickets = (tickets ?? []).filter(t => t.status === "open" || t.status === "in_progress").length;
        return new Response(JSON.stringify({
          total_spent: totalSpent,
          active_orders: activeOrders,
          total_orders: totalOrders,
          active_keys: activeKeys,
          total_keys: (apiKeys ?? []).length,
          open_tickets: openTickets,
          total_tickets: (tickets ?? []).length,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: corsHeaders });
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: "Invalid input", details: err.errors.map(e => e.message) }), { status: 400, headers: corsHeaders });
    }
    console.error("admin-actions error:", err);
    return new Response(JSON.stringify({ error: "An internal error occurred. Please try again later." }), { status: 500, headers: corsHeaders });
  }
});
