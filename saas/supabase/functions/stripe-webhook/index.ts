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
    // Webhook - no auth header, verify with Stripe signature
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeKey || !webhookSecret) {
      return new Response(JSON.stringify({ error: "Stripe webhook not configured" }), { status: 503, headers: corsHeaders });
    }

    const body = await req.text();
    const sig = req.headers.get("stripe-signature");
    if (!sig) {
      return new Response(JSON.stringify({ error: "Missing stripe-signature" }), { status: 400, headers: corsHeaders });
    }

    const Stripe = (await import("https://esm.sh/stripe@14.14.0")).default;
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400, headers: corsHeaders });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Log webhook
    await adminClient.from("webhook_logs").insert({
      source: "stripe",
      event_type: event.type,
      payload: event.data,
      status: "received",
    });

    const MetadataSchema = z.object({
      user_id: z.string().uuid().optional(),
      product_id: z.string().uuid().optional(),
      quantity: z.string().regex(/^\d+$/).optional(),
    });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const metadata = MetadataSchema.safeParse(session.metadata ?? {});
        const { user_id, product_id, quantity } = metadata.success ? metadata.data : {};

        // Update invoice
        await adminClient.from("invoices")
          .update({ status: "completed", paid_at: new Date().toISOString() })
          .eq("gateway_payment_id", session.id);

        // Update order
        if (user_id) {
          await adminClient.from("orders")
            .update({ status: "active" })
            .eq("user_id", user_id)
            .eq("product_id", product_id)
            .eq("status", "pending");
        }

        // Record transaction
        await adminClient.from("payment_transactions").insert({
          user_id,
          gateway: "stripe",
          gateway_event: event.type,
          gateway_payload: event.data,
          amount: (session.amount_total ?? 0) / 100,
          currency: session.currency ?? "usd",
          status: "completed",
        });

        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object;
        await adminClient.from("payment_transactions").insert({
          gateway: "stripe",
          gateway_event: event.type,
          gateway_payload: event.data,
          amount: (pi.amount ?? 0) / 100,
          status: "failed",
        });
        break;
      }
    }

    // Update webhook log status
    await adminClient.from("webhook_logs")
      .update({ status: "processed" })
      .eq("source", "stripe")
      .eq("event_type", event.type)
      .order("created_at", { ascending: false })
      .limit(1);

    return new Response(JSON.stringify({ received: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("stripe-webhook error:", err);
    return new Response(JSON.stringify({ error: "An internal error occurred. Please try again later." }), { status: 500, headers: corsHeaders });
  }
});
