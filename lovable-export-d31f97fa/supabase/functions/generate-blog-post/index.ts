import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { z } from "https://esm.sh/zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ActionSchema = z.object({
  action: z.enum(["generate", "manual_generate"]),
  topic: z.string().max(300).optional(),
});

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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const body = await req.json();
    const { action, topic } = ActionSchema.parse(body);

    // Get config for topics
    const { data: config } = await supabase
      .from("auto_blog_config")
      .select("*")
      .limit(1)
      .single();

    // Pick a topic
    const topics = config?.topics ?? ["proxy services", "web scraping", "network security"];
    const selectedTopic = topic ?? topics[Math.floor(Math.random() * topics.length)];

    // Get existing slugs to avoid duplicates
    const { data: existingPosts } = await supabase
      .from("blog_posts")
      .select("slug, title")
      .order("created_at", { ascending: false })
      .limit(20);

    const existingTitles = (existingPosts ?? []).map((p: any) => p.title).join(", ");

    // Generate article with AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert SEO content writer for UpgradedProxy, a premium proxy service provider. 
Write unique, informative, SEO-optimized blog articles about proxies, web scraping, data collection, network security, and related topics.

RULES:
- Write 1200-2000 word articles
- Include practical examples and actionable advice  
- Use professional but approachable tone
- Naturally mention UpgradedProxy's services where relevant (residential, datacenter, ISP, mobile, SOCKS5 proxies)
- Include FAQ section with 3-5 questions
- Create engaging headlines and subheadings

You MUST respond using the suggest_blog_post tool.`,
          },
          {
            role: "user",
            content: `Write a unique blog post about "${selectedTopic}" for the proxy/networking industry. 
These titles already exist, so create something DIFFERENT: ${existingTitles || "none yet"}.
The article should be educational, SEO-friendly, and provide real value to readers interested in proxies, web scraping, or data collection.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_blog_post",
              description: "Return a complete blog post with metadata",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "SEO-optimized title (50-70 chars)" },
                  slug: { type: "string", description: "URL slug (lowercase, hyphens, no spaces)" },
                  excerpt: { type: "string", description: "Meta description (120-160 chars)" },
                  category: { type: "string", enum: ["Guides", "Comparisons", "Use Cases", "Technical", "Industry News"] },
                  tags: { type: "array", items: { type: "string" }, description: "3-6 relevant tags" },
                  keywords: { type: "array", items: { type: "string" }, description: "3-5 SEO keywords" },
                  html_content: { type: "string", description: "Full article in HTML with h2, h3, p, ul, li, strong, em tags" },
                  headings: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        text: { type: "string" },
                        level: { type: "number" },
                      },
                      required: ["id", "text", "level"],
                    },
                  },
                  faqs: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        answer: { type: "string" },
                      },
                      required: ["question", "answer"],
                    },
                  },
                  social_snippet: { type: "string", description: "Short social media post text (100-200 chars) promoting this article" },
                  reading_time_min: { type: "number", description: "Estimated reading time in minutes" },
                },
                required: ["title", "slug", "excerpt", "category", "tags", "keywords", "html_content", "headings", "faqs", "social_snippet", "reading_time_min"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_blog_post" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", status, errText);
      throw new Error("AI generation failed");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI did not return tool call");

    const post = JSON.parse(toolCall.function.arguments);

    // Ensure unique slug
    let finalSlug = post.slug;
    const { data: slugCheck } = await supabase
      .from("blog_posts")
      .select("slug")
      .eq("slug", finalSlug)
      .maybeSingle();
    if (slugCheck) {
      finalSlug = `${finalSlug}-${Date.now().toString(36)}`;
    }

    // Insert into DB
    const { data: newPost, error: insertError } = await supabase
      .from("blog_posts")
      .insert({
        title: post.title,
        slug: finalSlug,
        excerpt: post.excerpt,
        content: post.html_content,
        html_content: post.html_content,
        category: post.category,
        tags: post.tags,
        keywords: post.keywords,
        headings: post.headings,
        faqs: post.faqs,
        social_snippet: post.social_snippet,
        reading_time_min: post.reading_time_min,
        status: "draft",
        author: "UpgradedProxy AI",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Update last generated timestamp
    if (config?.id) {
      await supabase
        .from("auto_blog_config")
        .update({ last_generated_at: new Date().toISOString() })
        .eq("id", config.id);
    }

    return new Response(JSON.stringify({ success: true, post: newPost }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: "Invalid input", details: err.errors }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("generate-blog-post error:", err);
    return new Response(
      JSON.stringify({ error: "Unable to process request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
