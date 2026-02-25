import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const BASE_URL = "https://upgraderpx-sparkle.lovable.app";

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
      .select("title, slug, excerpt, author, published_at, category, tags")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(50);

    const items = (posts ?? []).map((p: any) => `    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${BASE_URL}/blog/${p.slug}</link>
      <guid isPermaLink="true">${BASE_URL}/blog/${p.slug}</guid>
      <description><![CDATA[${p.excerpt}]]></description>
      <author>${p.author}</author>
      <category>${p.category}</category>
      <pubDate>${new Date(p.published_at).toUTCString()}</pubDate>
    </item>`).join("\n");

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>UpgradedProxy Blog</title>
    <link>${BASE_URL}/blog</link>
    <description>Latest articles about proxies, web scraping, data collection, and network security from UpgradedProxy.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

    return new Response(rss, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("RSS feed error:", err);
    return new Response("Internal error", { status: 500 });
  }
});
