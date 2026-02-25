import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const BASE_URL = "https://upgraderpx.com";

const STATIC_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/pricing", priority: "0.9", changefreq: "weekly" },
  { path: "/residential-proxies", priority: "0.9", changefreq: "monthly" },
  { path: "/datacenter-proxies", priority: "0.9", changefreq: "monthly" },
  { path: "/isp-proxies", priority: "0.9", changefreq: "monthly" },
  { path: "/mobile-proxies", priority: "0.9", changefreq: "monthly" },
  { path: "/socks5-proxies", priority: "0.9", changefreq: "monthly" },
  { path: "/proxy-api", priority: "0.9", changefreq: "monthly" },
  { path: "/locations", priority: "0.8", changefreq: "monthly" },
  { path: "/blog", priority: "0.8", changefreq: "daily" },
  { path: "/docs", priority: "0.7", changefreq: "weekly" },
  { path: "/use-cases", priority: "0.7", changefreq: "monthly" },
  { path: "/status", priority: "0.5", changefreq: "daily" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: posts } = await supabase
      .from("blog_posts")
      .select("slug, updated_at")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    const staticUrls = STATIC_ROUTES.map(
      (r) =>
        `  <url>\n    <loc>${BASE_URL}${r.path}</loc>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`
    );

    const blogUrls = (posts ?? []).map(
      (p: any) =>
        `  <url>\n    <loc>${BASE_URL}/blog/${p.slug}</loc>\n    <lastmod>${p.updated_at?.slice(0, 10)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`
    );

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...blogUrls].join("\n")}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("Sitemap error:", err);
    return new Response("Internal error", { status: 500 });
  }
});
