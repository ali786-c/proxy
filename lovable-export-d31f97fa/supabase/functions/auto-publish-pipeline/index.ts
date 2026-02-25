import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // ── Auth: require admin JWT or service-role key (for cron) ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const bearerToken = authHeader.replace("Bearer ", "");
    const isServiceRole = bearerToken === supabaseKey;

    if (!isServiceRole) {
      const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: claims, error: claimsErr } = await userClient.auth.getClaims(bearerToken);
      if (claimsErr || !claims?.claims) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const adminCheck = createClient(supabaseUrl, supabaseKey);
      const { data: roleData } = await adminCheck
        .from("user_roles")
        .select("role")
        .eq("user_id", claims.claims.sub as string)
        .eq("role", "admin")
        .single();
      if (!roleData) {
        return new Response(JSON.stringify({ error: "Forbidden: Admin only" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if auto-blogging is enabled
    const { data: config } = await supabase
      .from("auto_blog_config")
      .select("*")
      .limit(1)
      .single();

    if (!config?.is_enabled) {
      return new Response(
        JSON.stringify({ success: true, message: "Auto-blogging is disabled. Skipping." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: Record<string, string> = {};

    // Step 1: Generate a new article
    const genRes = await fetch(`${supabaseUrl}/functions/v1/generate-blog-post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ action: "generate" }),
    });

    if (!genRes.ok) {
      const errText = await genRes.text();
      results.generate = `failed: ${errText}`;
      return new Response(JSON.stringify({ success: false, results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const genData = await genRes.json();
    const postId = genData.post?.id;
    results.generate = `success: ${genData.post?.title}`;

    if (!postId) {
      results.generate = "failed: no post ID returned";
      return new Response(JSON.stringify({ success: false, results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 2: Publish & distribute
    const distRes = await fetch(`${supabaseUrl}/functions/v1/distribute-post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ action: "publish_and_distribute", post_id: postId }),
    });

    if (distRes.ok) {
      const distData = await distRes.json();
      results.distribute = JSON.stringify(distData.results ?? {});
    } else {
      results.distribute = `failed: ${await distRes.text()}`;
    }

    // Step 3: Ping Google Indexing API (if configured)
    if (config?.google_indexing_enabled) {
      const GOOGLE_INDEXING_KEY = Deno.env.get("GOOGLE_INDEXING_API_KEY");
      if (GOOGLE_INDEXING_KEY) {
        try {
          const postSlug = genData.post?.slug;
          const postUrl = `https://upgraderpx.com/blog/${postSlug}`;
          const indexRes = await fetch(
            `https://indexing.googleapis.com/v3/urlNotifications:publish?key=${GOOGLE_INDEXING_KEY}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: postUrl, type: "URL_UPDATED" }),
            }
          );
          results.google_indexing = indexRes.ok ? "pinged" : `failed: ${await indexRes.text()}`;
        } catch (e) {
          results.google_indexing = `error: ${e instanceof Error ? e.message : "unknown"}`;
        }
      } else {
        results.google_indexing = "skipped: GOOGLE_INDEXING_API_KEY not set";
      }
    }

    // Step 4: Weekly newsletter check (only on Sundays)
    const today = new Date();
    if (today.getUTCDay() === 0 && config?.newsletter_enabled) {
      try {
        const nlRes = await fetch(`${supabaseUrl}/functions/v1/newsletter-send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ action: "send_digest" }),
        });
        const nlData = await nlRes.json();
        results.newsletter = nlData.message ?? "sent";
      } catch (e) {
        results.newsletter = `error: ${e instanceof Error ? e.message : "unknown"}`;
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("auto-publish-pipeline error:", err);
    return new Response(
      JSON.stringify({ error: "Unable to process request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
