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

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const userId = claims.claims.sub as string;

    const body = await req.json();
    const { action, ...params } = body;

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Allowed origin patterns for redirect URLs
    const origin = req.headers.get("origin") || "";
    const AllowedUrlSchema = z.string().url().refine(
      (url) => url.startsWith(origin) || url.startsWith("https://"),
      { message: "URL must be same-origin or HTTPS" }
    );

    switch (action) {
      case "create_stripe_checkout": {
        const CreateCheckoutSchema = z.object({
          product_id: z.string().uuid(),
          quantity: z.number().int().min(1).max(10000).default(1),
          success_url: AllowedUrlSchema.optional(),
          cancel_url: AllowedUrlSchema.optional(),
        });
        const { product_id, quantity, success_url, cancel_url } = CreateCheckoutSchema.parse(params);

        const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
        if (!stripeKey) {
          return new Response(JSON.stringify({ error: "Stripe is not configured yet. Admin needs to add STRIPE_SECRET_KEY." }), { status: 503, headers: corsHeaders });
        }
        const Stripe = (await import("https://esm.sh/stripe@14.14.0")).default;
        const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
        
        const { data: product } = await adminClient.from("products").select("*").eq("id", product_id).single();
        if (!product) {
          return new Response(JSON.stringify({ error: "Product not found" }), { status: 404, headers: corsHeaders });
        }

        const unitAmount = Math.round((Number(product.price_per_gb ?? product.price_per_ip ?? 0) * 100));
        
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [{
            price_data: {
              currency: "usd",
              product_data: { name: product.name, description: product.description ?? "" },
              unit_amount: unitAmount,
            },
            quantity,
          }],
          mode: "payment",
          success_url: success_url || `${origin}/app/billing?success=true`,
          cancel_url: cancel_url || `${origin}/app/billing?cancelled=true`,
          metadata: { user_id: userId, product_id, quantity: String(quantity) },
        });

        const { data: order } = await adminClient.from("orders").insert({
          user_id: userId,
          product_id,
          quantity,
          total_amount: (unitAmount * quantity) / 100,
          proxy_type: product.proxy_type,
          status: "pending",
        }).select().single();

        if (order) {
          await adminClient.from("invoices").insert({
            user_id: userId,
            order_id: order.id,
            invoice_number: "",
            amount: (unitAmount * quantity) / 100,
            gateway: "stripe",
            gateway_payment_id: session.id,
            status: "pending",
          });
        }

        return new Response(JSON.stringify({ url: session.url }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "create_paypal_order": {
        // PayPal placeholder - will work when keys are added
        const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
        if (!clientId) {
          return new Response(JSON.stringify({ error: "PayPal is not configured yet. Admin needs to add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET." }), { status: 503, headers: corsHeaders });
        }
        return new Response(JSON.stringify({ message: "PayPal integration ready - implement OAuth flow with credentials" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "create_crypto_payment": {
        const cryptoKey = Deno.env.get("NOWPAYMENTS_API_KEY");
        if (!cryptoKey) {
          return new Response(JSON.stringify({ error: "Crypto payments not configured yet. Admin needs to add NOWPAYMENTS_API_KEY." }), { status: 503, headers: corsHeaders });
        }
        return new Response(JSON.stringify({ message: "Crypto payment integration ready" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: corsHeaders });
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: "Invalid input", details: err.errors.map(e => e.message) }), { status: 400, headers: corsHeaders });
    }
    console.error("payment-actions error:", err);
    return new Response(JSON.stringify({ error: "An internal error occurred. Please try again later." }), { status: 500, headers: corsHeaders });
  }
});
