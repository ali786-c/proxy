import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { z } from "https://esm.sh/zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLATFORMS = ["discord", "telegram", "facebook", "linkedin", "twitter", "reddit"] as const;

const ActionSchema = z.object({
  action: z.enum(["publish_and_distribute", "distribute_only"]),
  post_id: z.string().uuid(),
  platforms: z.array(z.enum(PLATFORMS)).optional(),
});

// ── Platform helpers ─────────────────────────────

async function postToDiscord(webhookUrl: string, title: string, excerpt: string, url: string, snippet: string) {
  const embed = {
    title: `📝 New Article: ${title}`,
    description: excerpt,
    url,
    color: 0x3b82f6,
    fields: [{ name: "Read More", value: `[View Article](${url})`, inline: true }],
    footer: { text: "UpgradedProxy Blog" },
    timestamp: new Date().toISOString(),
  };
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: snippet, embeds: [embed] }),
  });
  if (!res.ok) throw new Error(`Discord webhook failed [${res.status}]: ${await res.text()}`);
}

async function postToTelegram(botToken: string, chatId: string, title: string, excerpt: string, url: string) {
  const message = `📝 <b>${title}</b>\n\n${excerpt}\n\n<a href="${url}">Read Full Article →</a>\n\n#UpgradedProxy #Proxies`;
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML", disable_web_page_preview: false }),
  });
  if (!res.ok) throw new Error(`Telegram API failed [${res.status}]: ${await res.text()}`);
}

async function postToFacebook(pageToken: string, pageId: string, title: string, snippet: string, url: string) {
  const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `📝 ${title}\n\n${snippet}\n\nRead more: ${url}`,
      link: url,
      access_token: pageToken,
    }),
  });
  if (!res.ok) throw new Error(`Facebook API failed [${res.status}]: ${await res.text()}`);
}

async function postToLinkedIn(accessToken: string, orgId: string, title: string, excerpt: string, snippet: string, url: string) {
  const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: `urn:li:organization:${orgId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: `📝 ${title}\n\n${snippet}\n\n#Proxies #WebScraping #DataCollection` },
          shareMediaCategory: "ARTICLE",
          media: [{ status: "READY", description: { text: excerpt }, originalUrl: url, title: { text: title } }],
        },
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    }),
  });
  if (!res.ok) throw new Error(`LinkedIn API failed [${res.status}]: ${await res.text()}`);
}

async function postToTwitter(
  consumerKey: string, consumerSecret: string,
  accessToken: string, accessTokenSecret: string,
  text: string
) {
  // OAuth 1.0a signature generation
  const method = "POST";
  const baseUrl = "https://api.x.com/2/tweets";
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomUUID().replace(/-/g, "");

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: timestamp,
    oauth_token: accessToken,
    oauth_version: "1.0",
  };

  // Create signature base string (DO NOT include POST body params)
  const sortedParams = Object.entries(oauthParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

  const signatureBase = `${method}&${encodeURIComponent(baseUrl)}&${encodeURIComponent(sortedParams)}`;
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(accessTokenSecret)}`;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(signingKey), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(signatureBase));
  const signature = btoa(String.fromCharCode(...new Uint8Array(sig)));

  const authHeader = `OAuth ${Object.entries({ ...oauthParams, oauth_signature: signature })
    .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
    .join(", ")}`;

  const res = await fetch(baseUrl, {
    method: "POST",
    headers: { Authorization: authHeader, "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`Twitter API failed [${res.status}]: ${await res.text()}`);
}

async function postToReddit(
  username: string, password: string, clientId: string, clientSecret: string,
  subreddit: string, title: string, url: string
) {
  // Get OAuth2 token
  const tokenRes = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=password&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
  });
  if (!tokenRes.ok) throw new Error(`Reddit token failed [${tokenRes.status}]`);
  const tokenData = await tokenRes.json();

  // Submit link
  const submitRes = await fetch("https://oauth.reddit.com/api/submit", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "UpgradedProxyBot/1.0",
    },
    body: `kind=link&sr=${encodeURIComponent(subreddit)}&title=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}&resubmit=true`,
  });
  if (!submitRes.ok) throw new Error(`Reddit submit failed [${submitRes.status}]: ${await submitRes.text()}`);
}

// ── Helper to log distribution result ────────────

async function logDistribution(
  supabase: any, postId: string, platform: string,
  status: "sent" | "failed" | "pending", errorMessage?: string
) {
  await supabase.from("distribution_log").insert({
    blog_post_id: postId,
    platform,
    status,
    sent_at: status === "sent" ? new Date().toISOString() : null,
    error_message: errorMessage ?? null,
  });
}

// ── Main handler ─────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // ── Auth: require admin ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: roleData } = await supabase
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

    const body = await req.json();
    const { action, post_id, platforms } = ActionSchema.parse(body);

    const { data: post, error: postError } = await supabase
      .from("blog_posts").select("*").eq("id", post_id).single();
    if (postError || !post) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "publish_and_distribute") {
      await supabase
        .from("blog_posts")
        .update({ status: "published", published_at: new Date().toISOString() })
        .eq("id", post_id);
    }

    const postUrl = `https://upgraderpx-sparkle.lovable.app/blog/${post.slug}`;
    const snippet = post.social_snippet || post.excerpt;
    const results: Record<string, string> = {};

    const { data: config } = await supabase
      .from("auto_blog_config").select("*").limit(1).single();

    const targetPlatforms: string[] = platforms ? [...platforms] : [];
    if (!platforms) {
      if (config?.discord_enabled) targetPlatforms.push("discord");
      if (config?.telegram_enabled) targetPlatforms.push("telegram");
      if (config?.facebook_enabled) targetPlatforms.push("facebook");
      if (config?.linkedin_enabled) targetPlatforms.push("linkedin");
      if (config?.twitter_enabled) targetPlatforms.push("twitter");
      if (config?.reddit_enabled) targetPlatforms.push("reddit");
    }

    // ── Discord ──
    if (targetPlatforms.includes("discord")) {
      const webhookUrl = Deno.env.get("DISCORD_WEBHOOK_URL");
      if (webhookUrl) {
        try {
          await postToDiscord(webhookUrl, post.title, post.excerpt, postUrl, snippet);
          results.discord = "sent";
          await logDistribution(supabase, post_id, "discord", "sent");
        } catch (e) {
          results.discord = `failed: ${e instanceof Error ? e.message : "unknown"}`;
          await logDistribution(supabase, post_id, "discord", "failed", results.discord);
        }
      } else {
        results.discord = "skipped: no webhook configured";
      }
    }

    // ── Telegram ──
    if (targetPlatforms.includes("telegram")) {
      const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
      const chatId = Deno.env.get("TELEGRAM_CHAT_ID");
      if (botToken && chatId) {
        try {
          await postToTelegram(botToken, chatId, post.title, post.excerpt, postUrl);
          results.telegram = "sent";
          await logDistribution(supabase, post_id, "telegram", "sent");
        } catch (e) {
          results.telegram = `failed: ${e instanceof Error ? e.message : "unknown"}`;
          await logDistribution(supabase, post_id, "telegram", "failed", results.telegram);
        }
      } else {
        results.telegram = "skipped: no bot token or chat ID configured";
      }
    }

    // ── Facebook ──
    if (targetPlatforms.includes("facebook")) {
      const fbToken = Deno.env.get("FACEBOOK_PAGE_TOKEN");
      const fbPageId = Deno.env.get("FACEBOOK_PAGE_ID");
      if (fbToken && fbPageId) {
        try {
          await postToFacebook(fbToken, fbPageId, post.title, snippet, postUrl);
          results.facebook = "sent";
          await logDistribution(supabase, post_id, "facebook", "sent");
        } catch (e) {
          results.facebook = `failed: ${e instanceof Error ? e.message : "unknown"}`;
          await logDistribution(supabase, post_id, "facebook", "failed", results.facebook);
        }
      } else {
        results.facebook = "skipped: set FACEBOOK_PAGE_TOKEN and FACEBOOK_PAGE_ID";
        await logDistribution(supabase, post_id, "facebook", "pending", "Awaiting credentials");
      }
    }

    // ── LinkedIn ──
    if (targetPlatforms.includes("linkedin")) {
      const liToken = Deno.env.get("LINKEDIN_ACCESS_TOKEN");
      const liOrgId = Deno.env.get("LINKEDIN_ORG_ID");
      if (liToken && liOrgId) {
        try {
          await postToLinkedIn(liToken, liOrgId, post.title, post.excerpt, snippet, postUrl);
          results.linkedin = "sent";
          await logDistribution(supabase, post_id, "linkedin", "sent");
        } catch (e) {
          results.linkedin = `failed: ${e instanceof Error ? e.message : "unknown"}`;
          await logDistribution(supabase, post_id, "linkedin", "failed", results.linkedin);
        }
      } else {
        results.linkedin = "skipped: set LINKEDIN_ACCESS_TOKEN and LINKEDIN_ORG_ID";
        await logDistribution(supabase, post_id, "linkedin", "pending", "Awaiting credentials");
      }
    }

    // ── Twitter/X ──
    if (targetPlatforms.includes("twitter")) {
      const ck = Deno.env.get("TWITTER_CONSUMER_KEY");
      const cs = Deno.env.get("TWITTER_CONSUMER_SECRET");
      const at = Deno.env.get("TWITTER_ACCESS_TOKEN");
      const ats = Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET");
      if (ck && cs && at && ats) {
        try {
          const tweetText = `📝 ${post.title}\n\n${snippet}\n\n🔗 ${postUrl}\n\n#Proxies #WebScraping #DataCollection`;
          await postToTwitter(ck, cs, at, ats, tweetText.slice(0, 280));
          results.twitter = "sent";
          await logDistribution(supabase, post_id, "twitter", "sent");
        } catch (e) {
          results.twitter = `failed: ${e instanceof Error ? e.message : "unknown"}`;
          await logDistribution(supabase, post_id, "twitter", "failed", results.twitter);
        }
      } else {
        results.twitter = "skipped: set TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET";
        await logDistribution(supabase, post_id, "twitter", "pending", "Awaiting credentials");
      }
    }

    // ── Reddit ──
    if (targetPlatforms.includes("reddit")) {
      const ru = Deno.env.get("REDDIT_USERNAME");
      const rp = Deno.env.get("REDDIT_PASSWORD");
      const rci = Deno.env.get("REDDIT_CLIENT_ID");
      const rcs = Deno.env.get("REDDIT_CLIENT_SECRET");
      const subreddits = ["webscraping", "proxy"];
      if (ru && rp && rci && rcs) {
        const redditResults: string[] = [];
        for (const sr of subreddits) {
          try {
            await postToReddit(ru, rp, rci, rcs, sr, post.title, postUrl);
            redditResults.push(`r/${sr}: sent`);
          } catch (e) {
            redditResults.push(`r/${sr}: failed (${e instanceof Error ? e.message : "unknown"})`);
          }
        }
        results.reddit = redditResults.join("; ");
        await logDistribution(supabase, post_id, "reddit", redditResults.some(r => r.includes("sent")) ? "sent" : "failed",
          redditResults.filter(r => r.includes("failed")).join("; ") || undefined);
      } else {
        results.reddit = "skipped: set REDDIT_USERNAME, REDDIT_PASSWORD, REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET";
        await logDistribution(supabase, post_id, "reddit", "pending", "Awaiting credentials");
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: "Invalid input", details: err.errors }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("distribute-post error:", err);
    return new Response(
      JSON.stringify({ error: "Unable to process request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
