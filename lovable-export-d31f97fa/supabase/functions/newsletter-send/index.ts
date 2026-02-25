import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { z } from "https://esm.sh/zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("subscribe"), email: z.string().email().max(320) }),
  z.object({ action: z.literal("unsubscribe"), email: z.string().email().max(320) }),
  z.object({ action: z.literal("send_digest") }),
]);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const parsed = ActionSchema.parse(body);

    // ── Subscribe ──────────────────────────────────
    if (parsed.action === "subscribe") {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .upsert(
          { email: parsed.email, is_active: true, unsubscribed_at: null },
          { onConflict: "email" }
        );
      if (error) throw error;
      return new Response(
        JSON.stringify({ success: true, message: "Subscribed successfully!" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Unsubscribe ────────────────────────────────
    if (parsed.action === "unsubscribe") {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
        .eq("email", parsed.email);
      if (error) throw error;
      return new Response(
        JSON.stringify({ success: true, message: "Unsubscribed successfully." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Send Weekly Digest ─────────────────────────
    if (parsed.action === "send_digest") {
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      const NEWSLETTER_FROM_EMAIL = Deno.env.get("NEWSLETTER_FROM_EMAIL") ?? "blog@upgradedproxy.com";

      if (!RESEND_API_KEY) {
        return new Response(
          JSON.stringify({ error: "RESEND_API_KEY not configured. Add it to secrets when ready." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get last 7 days of published posts
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: recentPosts } = await supabase
        .from("blog_posts")
        .select("title, slug, excerpt, published_at")
        .eq("status", "published")
        .gte("published_at", weekAgo)
        .order("published_at", { ascending: false });

      if (!recentPosts?.length) {
        return new Response(
          JSON.stringify({ success: true, message: "No new posts this week. Skipping digest." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get active subscribers
      const { data: subscribers } = await supabase
        .from("newsletter_subscribers")
        .select("email")
        .eq("is_active", true);

      if (!subscribers?.length) {
        return new Response(
          JSON.stringify({ success: true, message: "No active subscribers." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const BASE_URL = "https://upgraderpx-sparkle.lovable.app";
      const articlesHtml = recentPosts.map((p: any) => `
        <div style="margin-bottom:24px;padding:16px;border:1px solid #e5e7eb;border-radius:8px;">
          <h3 style="margin:0 0 8px;font-size:16px;"><a href="${BASE_URL}/blog/${p.slug}" style="color:#3b82f6;text-decoration:none;">${p.title}</a></h3>
          <p style="margin:0;color:#6b7280;font-size:14px;">${p.excerpt}</p>
        </div>
      `).join("");

      const htmlBody = `
        <div style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <div style="padding:24px;background:#3b82f6;border-radius:8px 8px 0 0;text-align:center;">
            <h1 style="color:white;margin:0;font-size:24px;">📰 UpgradedProxy Weekly</h1>
            <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Your weekly dose of proxy & scraping insights</p>
          </div>
          <div style="padding:24px;background:white;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
            <p style="color:#374151;font-size:14px;">Here's what we published this week:</p>
            ${articlesHtml}
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
            <p style="color:#9ca3af;font-size:12px;text-align:center;">
              You're receiving this because you subscribed to UpgradedProxy updates.<br/>
              <a href="${BASE_URL}" style="color:#3b82f6;">Visit our blog</a>
            </p>
          </div>
        </div>
      `;

      // Send via Resend batch API
      const emails = subscribers.map((s: any) => ({
        from: `UpgradedProxy <${NEWSLETTER_FROM_EMAIL}>`,
        to: [s.email],
        subject: `📰 UpgradedProxy Weekly — ${recentPosts.length} New Article${recentPosts.length > 1 ? "s" : ""}`,
        html: htmlBody,
      }));

      // Send in batches of 100
      let sent = 0;
      for (let i = 0; i < emails.length; i += 100) {
        const batch = emails.slice(i, i + 100);
        const res = await fetch("https://api.resend.com/emails/batch", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(batch),
        });
        if (!res.ok) {
          const errText = await res.text();
          console.error(`Resend batch error: ${errText}`);
        } else {
          sent += batch.length;
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: `Digest sent to ${sent} subscribers.`, articles: recentPosts.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: "Invalid input", details: err.errors }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("newsletter-send error:", err);
    return new Response(
      JSON.stringify({ error: "Unable to process request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
