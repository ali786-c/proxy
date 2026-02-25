import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VAT_RATE = 0.22; // 22% Italian VAT
const MIN_PURCHASE_EUR = 5; // Minimum €5 purchase

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
          amount_eur: z.number().min(MIN_PURCHASE_EUR).optional(),
          success_url: AllowedUrlSchema.optional(),
          cancel_url: AllowedUrlSchema.optional(),
        });
        const { product_id, quantity, amount_eur, success_url, cancel_url } = CreateCheckoutSchema.parse(params);

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

        const unitPrice = Number(product.price_per_gb ?? product.price_per_ip ?? 0);
        const subtotal = amount_eur ?? (unitPrice * quantity);

        // Enforce minimum purchase
        if (subtotal < MIN_PURCHASE_EUR) {
          return new Response(JSON.stringify({ 
            error: `Minimum purchase is €${MIN_PURCHASE_EUR}. Your total is €${subtotal.toFixed(2)}.` 
          }), { status: 400, headers: corsHeaders });
        }

        // Add 22% VAT for Stripe/card payments
        const vatAmount = subtotal * VAT_RATE;
        const totalWithVat = subtotal + vatAmount;
        const totalCents = Math.round(totalWithVat * 100);
        
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "eur",
                product_data: { name: product.name, description: product.description ?? "" },
                unit_amount: Math.round(subtotal * 100),
              },
              quantity: 1,
            },
            {
              price_data: {
                currency: "eur",
                product_data: { name: "VAT (22%)", description: "Italian VAT" },
                unit_amount: Math.round(vatAmount * 100),
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: success_url || `${origin}/app/billing?success=true`,
          cancel_url: cancel_url || `${origin}/app/billing?cancelled=true`,
          metadata: { 
            user_id: userId, 
            product_id, 
            quantity: String(quantity),
            subtotal_eur: subtotal.toFixed(2),
            vat_eur: vatAmount.toFixed(2),
            total_eur: totalWithVat.toFixed(2),
          },
        });

        const { data: order } = await adminClient.from("orders").insert({
          user_id: userId,
          product_id,
          quantity,
          total_amount: totalWithVat,
          proxy_type: product.proxy_type,
          status: "pending",
        }).select().single();

        if (order) {
          await adminClient.from("invoices").insert({
            user_id: userId,
            order_id: order.id,
            invoice_number: "",
            amount: totalWithVat,
            currency: "EUR",
            gateway: "stripe",
            gateway_payment_id: session.id,
            status: "pending",
          });
        }

        return new Response(JSON.stringify({ 
          url: session.url,
          subtotal: subtotal,
          vat: vatAmount,
          total: totalWithVat,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "create_paypal_order": {
        const PayPalSchema = z.object({
          amount_eur: z.number().min(MIN_PURCHASE_EUR),
          product_id: z.string().uuid().optional(),
        });
        const { amount_eur } = PayPalSchema.parse(params);

        const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
        if (!clientId) {
          return new Response(JSON.stringify({ error: "PayPal is not configured yet. Admin needs to add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET." }), { status: 503, headers: corsHeaders });
        }

        // Add 22% VAT for PayPal
        const vatAmount = amount_eur * VAT_RATE;
        const totalWithVat = amount_eur + vatAmount;

        return new Response(JSON.stringify({ 
          message: "PayPal integration ready — implement OAuth flow with credentials",
          subtotal: amount_eur,
          vat: vatAmount,
          total: totalWithVat,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "create_crypto_payment": {
        const CryptoSchema = z.object({
          amount_eur: z.number().min(MIN_PURCHASE_EUR),
          product_id: z.string().uuid().optional(),
          crypto_currency: z.enum(["btc", "ltc", "sol", "trx", "bnb"]),
        });
        const { amount_eur, crypto_currency, product_id } = CryptoSchema.parse(params);

        // NO VAT for crypto payments
        const total = amount_eur;

        // Check for wallet addresses in env
        const walletEnvKey = `CRYPTO_WALLET_${crypto_currency.toUpperCase()}`;
        const walletAddress = Deno.env.get(walletEnvKey);
        
        // Also check for a payment gateway link
        const gatewayEnvKey = `CRYPTO_GATEWAY_${crypto_currency.toUpperCase()}`;
        const gatewayLink = Deno.env.get(gatewayEnvKey);

        if (!walletAddress && !gatewayLink) {
          return new Response(JSON.stringify({ 
            error: `Crypto payment for ${crypto_currency.toUpperCase()} is not configured yet. Admin needs to add ${walletEnvKey} or ${gatewayEnvKey}.` 
          }), { status: 503, headers: corsHeaders });
        }

        // Create a pending order
        if (product_id) {
          const { data: product } = await adminClient.from("products").select("*").eq("id", product_id).single();
          if (product) {
            const { data: order } = await adminClient.from("orders").insert({
              user_id: userId,
              product_id,
              quantity: 1,
              total_amount: total,
              proxy_type: product.proxy_type,
              status: "pending",
            }).select().single();

            if (order) {
              await adminClient.from("invoices").insert({
                user_id: userId,
                order_id: order.id,
                invoice_number: "",
                amount: total,
                currency: "EUR",
                gateway: "crypto",
                status: "pending",
              });
            }
          }
        }

        return new Response(JSON.stringify({ 
          wallet_address: walletAddress || null,
          gateway_link: gatewayLink || null,
          amount_eur: total,
          vat: 0,
          crypto_currency,
          message: "No VAT on crypto payments. Send exact amount to the wallet address.",
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
