<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\User;
use App\Models\Coupon;
use App\Models\WalletTransaction;
use App\Models\WebhookLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Stripe\PaymentIntent;
use Stripe\Webhook;
use Stripe\Account;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use App\Helpers\CryptomusHelper;
use App\Services\ReferralService;

class BillingController extends Controller
{
    public function createProductCheckout(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'coupon_code' => 'nullable|string',
        ]);

        $product = \App\Models\Product::findOrFail($request->product_id);
        $totalAmount = $product->price * $request->quantity;
        $originalAmount = $totalAmount;
        $couponCode = $request->coupon_code;

        if ($couponCode) {
            $coupon = Coupon::where('code', $couponCode)->first();
            if ($coupon && $coupon->isValid($totalAmount)) {
                $discount = $coupon->calculateDiscount($totalAmount);
                $totalAmount = max(0, $totalAmount - $discount);
            }
        }

        $amountWithVAT = $totalAmount * 1.22; // Including 22% VAT for Stripe

        Stripe::setApiKey(Setting::getValue('stripe_secret_key') ?: config('services.stripe.secret'));
        Stripe::setApiVersion('2024-04-10');

        $sessionData = [
            'automatic_payment_methods' => ['enabled' => true],
            'invoice_creation' => ['enabled' => true],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'usd',
                    'product_data' => [
                        'name' => "{$request->quantity}x {$product->name}",
                        'description' => "Direct purchase of {$request->quantity}x {$product->name} proxies",
                    ],
                    'unit_amount' => round($totalAmount * 100),
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => url('/') . '/app/billing?success=true&direct=true',
            'cancel_url' => url('/') . '/app/billing?canceled=true',
            'metadata' => [
                'user_id' => $request->user()->id,
                'type' => 'direct_purchase',
                'product_id' => $product->id,
                'quantity' => $request->quantity,
                'country' => $request->country ?? 'US',
                'session_type' => $request->session_type ?? 'rotating',
                'amount' => $totalAmount,
                'original_amount' => $originalAmount,
                'coupon_code' => $couponCode,
            ],
        ];

        if ($request->user()->stripe_customer_id) {
            $sessionData['customer'] = $request->user()->stripe_customer_id;
        }

        $session = Session::create($sessionData, ["stripe_version" => "2024-04-10"]);

        return response()->json(['url' => $session->url]);
    }

    public function createCheckout(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:5', // Min $5 top-up
            'coupon_code' => 'nullable|string',
        ]);

        $amount = (float) $request->amount;
        $originalAmount = $amount;
        $couponCode = $request->coupon_code;
        $discount = 0;

        if ($couponCode) {
            $coupon = Coupon::where('code', $couponCode)->first();
            if ($coupon && $coupon->isValid($amount)) {
                $discount = $coupon->calculateDiscount($amount);
                $amount = max(0, $amount - $discount);
            }
        }

        Stripe::setApiKey(Setting::getValue('stripe_secret_key') ?: config('services.stripe.secret'));
        Stripe::setApiVersion('2024-04-10');

        $sessionData = [
            'automatic_payment_methods' => [
                'enabled' => true,
            ],
            'invoice_creation' => [
                'enabled' => true,
            ],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'usd',
                    'product_data' => [
                        'name' => 'Balance Top-up' . ($couponCode ? " (Promo: {$couponCode})" : ""),
                        'description' => 'Add funds to your UpgradedProxy wallet',
                    ],
                    'unit_amount' => round($amount * 100 * 1.22), // Add VAT for Stripe
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => url('/') . '/app/billing?success=true',
            'cancel_url' => url('/') . '/app/billing?canceled=true',
            'metadata' => [
                'user_id' => $request->user()->id,
                'amount' => $amount,
                'original_amount' => $originalAmount,
                'coupon_code' => $couponCode,
            ],
        ];

        if ($request->user()->stripe_customer_id) {
            $sessionData['customer'] = $request->user()->stripe_customer_id;
        }

        $session = Session::create($sessionData, ["stripe_version" => "2024-04-10"]);

        return response()->json(['url' => $session->url]);
    }

    public function createCryptomusCheckout(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'coupon_code' => 'nullable|string',
        ]);

        $amount = (float) $request->amount;
        $originalAmount = $amount;
        $couponCode = $request->coupon_code;

        if ($couponCode) {
            $coupon = Coupon::where('code', $couponCode)->first();
            if ($coupon && $coupon->isValid($amount)) {
                $discount = $coupon->calculateDiscount($amount);
                $amount = max(0, $amount - $discount);
            }
        }

        $merchantId = Setting::getValue('cryptomus_merchant_id');
        $apiKey = Setting::getValue('cryptomus_api_key');

        if (!$merchantId || !$apiKey) {
            return response()->json(['error' => 'Cryptomus is not configured.'], 400);
        }

        $orderId = 'TOPUP-' . time() . '-' . $request->user()->id;
        
        $data = [
            'amount' => (string) $amount,
            'currency' => 'EUR', // Primary app currency
            'order_id' => $orderId,
            'url_return' => url('/') . '/app/billing?success=true&gateway=cryptomus',
            'url_callback' => url('/') . '/api/webhook/cryptomus',
            'additional_data' => json_encode([
                'user_id' => $request->user()->id,
                'type' => 'topup',
                'amount' => $amount,
                'original_amount' => $originalAmount,
                'coupon_code' => $couponCode,
            ]),
        ];

        $sign = CryptomusHelper::generateSignature($data, $apiKey);

        $response = Http::withHeaders([
            'merchant' => $merchantId,
            'sign' => $sign,
        ])->post('https://api.cryptomus.com/v1/payment', $data);

        if ($response->successful()) {
            return response()->json(['url' => $response->json('result.url')]);
        }

        Log::error('Cryptomus API Error: ' . $response->body());
        return response()->json(['error' => 'Could not create crypto payment.'], 500);
    }

    public function createCryptomusProductCheckout(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'coupon_code' => 'nullable|string',
        ]);

        $product = \App\Models\Product::findOrFail($request->product_id);
        $totalAmount = $product->price * $request->quantity;
        $originalAmount = $totalAmount;
        $couponCode = $request->coupon_code;

        if ($couponCode) {
            $coupon = Coupon::where('code', $couponCode)->first();
            if ($coupon && $coupon->isValid($totalAmount)) {
                $discount = $coupon->calculateDiscount($totalAmount);
                $totalAmount = max(0, $totalAmount - $discount);
            }
        }

        $merchantId = Setting::getValue('cryptomus_merchant_id');
        $apiKey = Setting::getValue('cryptomus_api_key');

        if (!$merchantId || !$apiKey) {
            return response()->json(['error' => 'Cryptomus is not configured.'], 400);
        }

        $orderId = 'PROD-' . time() . '-' . $request->user()->id;

        $data = [
            'amount' => (string) $totalAmount,
            'currency' => 'EUR',
            'order_id' => $orderId,
            'url_return' => url('/') . '/app/billing?success=true&direct=true&gateway=cryptomus',
            'url_callback' => url('/') . '/api/webhook/cryptomus',
            'additional_data' => json_encode([
                'user_id' => $request->user()->id,
                'type' => 'direct_purchase',
                'product_id' => $product->id,
                'quantity' => $request->quantity,
                'country' => $request->country ?? 'US',
                'session_type' => $request->session_type ?? 'rotating',
                'amount' => $totalAmount,
                'original_amount' => $originalAmount,
                'coupon_code' => $couponCode,
            ]),
        ];

        $sign = CryptomusHelper::generateSignature($data, $apiKey);

        $response = Http::withHeaders([
            'merchant' => $merchantId,
            'sign' => $sign,
        ])->post('https://api.cryptomus.com/v1/payment', $data);

        if ($response->successful()) {
            return response()->json(['url' => $response->json('result.url')]);
        }

        Log::error('Cryptomus API Error: ' . $response->body());
        return response()->json(['error' => 'Could not create crypto payment.'], 500);
    }

    public function handleCryptomusWebhook(Request $request)
    {
        // IP Whitelisting (Optional but recommended by Cryptomus)
        $allowedIps = ['91.227.144.54'];
        if (!in_array($request->ip(), $allowedIps) && !app()->environment('local')) {
            Log::warning("Cryptomus Webhook Warning: Request from unauthorized IP: " . $request->ip());
            // We only warn for now to avoid breaking existing setups if IPs change
        }

        $data = $request->all();
        $apiKey = Setting::getValue('cryptomus_webhook_secret') ?: Setting::getValue('cryptomus_api_key');

        if (!$apiKey) {
            Log::error('Cryptomus Webhook Error: Missing API key.');
            return response()->json(['error' => 'API Key not configured'], 401);
        }

        if (!CryptomusHelper::verifySignature($data, $apiKey)) {
            Log::error('Cryptomus Webhook Error: Signature mismatch.');
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        $status = $data['status'] ?? 'unknown';

        // Handle terminal failure states
        if (in_array($status, ['fail', 'cancel', 'system_fail'])) {
            Log::warning("Cryptomus Payment Terminal Failure: User redirected or process failed. Status: {$status}, UUID: " . ($data['uuid'] ?? 'N/A'));
            return response()->json(['message' => 'Failure recorded']);
        }

        // Handle Partial Payments (VERY IMPORTANT)
        if ($status === 'wrong_amount') {
            Log::error("Cryptomus Webhook ALERT: Partial payment detected. UUID: {$data['uuid']}. User paid {$data['payment_amount']} {$data['currency']} instead of {$data['amount']} {$data['currency']}. Manual intervention required.");
            
            // Mark invoice as failed/wrong_amount in internal records
            $metadata = isset($data['additional_data']) ? json_decode($data['additional_data'], true) : null;
            if ($metadata && isset($metadata['user_id'])) {
                \App\Models\Invoice::create([
                    'user_id' => $metadata['user_id'],
                    'amount' => $data['payment_amount'] ?? 0,
                    'currency' => $data['currency'] ?? 'EUR',
                    'status' => 'failed',
                    'description' => "Cryptomus Partial Payment: Received {$data['payment_amount']} instead of {$data['amount']}",
                ]);
            }
            
            return response()->json(['message' => 'Partial payment logged']);
        }

        // Only process successful payments (including paid_over)
        if (!in_array($status, ['paid', 'paid_over', 'completed'])) {
            return response()->json(['message' => 'Payment status ignored: ' . $status]);
        }

        $uuid = $data['uuid'] ?? null;
        if (!$uuid || WebhookLog::where('event_id', $uuid)->exists()) {
            return response()->json(['message' => 'Already processed or invalid UUID']);
        }

        $metadata = isset($data['additional_data']) ? json_decode($data['additional_data'], true) : null;
        if (!$metadata) {
            // Fallback to order_id parsing if metadata missing
            $orderId = $data['order_id'] ?? '';
            // TOPUP-12345678-USERID
            $parts = explode('-', $orderId);
            $metadata = [
                'user_id' => end($parts),
                'type' => str_starts_with($orderId, 'PROD-') ? 'direct_purchase' : 'topup',
                'amount' => $data['amount'] ?? 0,
            ];
        }

        $this->fulfillCryptomusPayment($data, $uuid, $metadata);

        return response()->json(['status' => 'success']);
    }

    protected function fulfillCryptomusPayment($data, $uuid, $metadata)
    {
        $userId = $metadata['user_id'] ?? null;
        $type   = $metadata['type'] ?? 'topup';
        $amount = (float) ($metadata['amount'] ?? ($data['amount'] ?? 0));

        if (!$userId) {
            Log::error("Cryptomus Webhook Error: No user_id in metadata for UUID {$uuid}");
            return;
        }

        $referralService = app(ReferralService::class);
        DB::transaction(function () use ($userId, $amount, $uuid, $type, $metadata, $data, $referralService) {
            $user = User::lockForUpdate()->find($userId);
            if (!$user) return;

            if ($type === 'direct_purchase') {
                // Logic identical to Stripe direct fulfillment
                $productId = $metadata['product_id'] ?? null;
                $quantity  = (int) ($metadata['quantity'] ?? 1);
                $country   = $metadata['country'] ?? 'US';
                $sessionType = $metadata['session_type'] ?? 'rotating';

                $product = \App\Models\Product::find($productId);
                $fulfilled = false;

                if ($product) {
                    $evomi = app(\App\Services\EvomiService::class);
                    $subuserResult = $evomi->ensureSubuser($user);
                    
                    if ($subuserResult['success']) {
                        $userKeys = $user->fresh()->evomi_keys ?? [];
                        $proxyKey = $userKeys[$product->type] ?? ($userKeys['residential'] ?? null);
                        
                        if ($proxyKey) {
                            try {
                                $evomi->allocateBandwidth($user->evomi_username, $quantity * 1024, $product->type);
                                $order = \App\Models\Order::create([
                                    'user_id'    => $user->id,
                                    'product_id' => $product->id,
                                    'status'     => 'active',
                                    'expires_at' => now()->addDays(30),
                                ]);

                                $portMap = ['rp' => 1000, 'mp' => 3000, 'isp' => 3000, 'dc' => 2000];
                                $hostMap = ['rp' => 'rp.evomi.com', 'mp' => 'mp.evomi.com', 'dc' => 'dcp.evomi.com', 'isp' => 'isp.evomi.com'];
                                $port = $portMap[$product->type] ?? 1000;
                                $host = $hostMap[$product->type] ?? 'gate.evomi.com';

                                for ($i = 0; $i < $quantity; $i++) {
                                    \App\Models\Proxy::create([
                                        'order_id' => $order->id,
                                        'host'     => $host,
                                        'port'     => $port,
                                        'username' => $user->evomi_username,
                                        'password' => "{$proxyKey}_country-{$country}_session-{$sessionType}",
                                        'country'  => $country,
                                    ]);
                                }
                                $fulfilled = true;
                            } catch (\Exception $e) { Log::error("Cryptomus Fulfillment Proxy Error: " . $e->getMessage()); }
                        }
                    }
                }

                if (!$fulfilled) {
                    $user->increment('balance', $amount);
                    $referralService->awardCommission($user, $amount, "Commission from Buy Fallback (Cryptomus)");
                    WalletTransaction::create([
                        'user_id' => $user->id,
                        'type' => 'credit',
                        'amount' => $amount,
                        'reference' => "CRYPTO-{$uuid}",
                        'description' => "Cryptomus Buy Fallback: Product #{$productId} (Refunded to wallet)",
                    ]);
                } else {
                    WalletTransaction::create([
                        'user_id' => $user->id,
                        'type' => 'credit',
                        'amount' => $amount,
                        'reference' => "CRYPTO-{$uuid}",
                        'description' => "Cryptomus Direct Buy: {$quantity}x Product #{$productId}",
                    ]);
                }
            } else {
                // Regular Top-up
                $originalAmount = (float) ($metadata['original_amount'] ?? $amount);
                $couponCode = $metadata['coupon_code'] ?? null;
                $creditAmount = $couponCode ? $originalAmount : $amount;

                if ($couponCode) {
                    $coupon = Coupon::where('code', $couponCode)->first();
                    if ($coupon) {
                        $coupon->increment('used_count');
                    }
                }

                $user->increment('balance', $creditAmount);
                WalletTransaction::create([
                    'user_id' => $user->id,
                    'type' => 'credit',
                    'amount' => $creditAmount,
                    'reference' => "CRYPTO-{$uuid}",
                    'description' => 'Cryptomus Wallet Top-up' . ($couponCode ? " (Used promo: {$couponCode})" : ""),
                ]);
            }

            // Mark formal invoice
            \App\Models\Invoice::create([
                'user_id' => $user->id,
                'amount' => $amount,
                'currency' => $data['currency'] ?? 'EUR',
                'status' => 'paid',
                'description' => 'Cryptomus Crypto Payment',
            ]);

            WebhookLog::create([
                'provider' => 'cryptomus',
                'event_id' => $uuid,
            ]);
        });
    }

    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = Setting::getValue('stripe_webhook_secret') ?: config('services.stripe.webhook_secret');
        Stripe::setApiKey(Setting::getValue('stripe_secret_key') ?: config('services.stripe.secret'));
        Stripe::setApiVersion('2024-04-10');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
        } catch (\Exception $e) {
            Log::error("Webhook Signature Verification Failed: " . $e->getMessage());
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Idempotency Check
        if (WebhookLog::where('event_id', $event->id)->exists()) {
            return response()->json(['message' => 'Event already processed'], 200);
        }

        switch ($event->type) {
            case 'checkout.session.completed':
            case 'checkout.session.async_payment_succeeded':
                $session = $event->data->object;
                if ($session->mode === 'payment') {
                    $this->fulfillPayment($session, $event->id);
                } elseif ($session->mode === 'setup') {
                    $this->fulfillSetup($session);
                }
                break;
            case 'invoice.paid':
                $this->handleInvoicePaid($event->data->object, $event->id);
                break;
            case 'setup_intent.succeeded':
                $this->updateUserPaymentMethod($event->data->object);
                break;
            case 'payment_intent.payment_failed':
                $this->handlePaymentFailed($event->data->object, $event->id);
                break;
            case 'checkout.session.expired':
                $this->handleSessionExpired($event->data->object, $event->id);
                break;
            case 'invoice.payment_failed':
                $this->handleInvoiceFailed($event->data->object, $event->id);
                break;
            case 'invoice.voided':
                $this->handleInvoiceVoided($event->data->object, $event->id);
                break;
        }

        return response()->json(['status' => 'success']);
    }

    protected function handleInvoicePaid($invoice, $eventId)
    {
        $user = User::where('stripe_customer_id', $invoice->customer)->first();
        if (!$user) return;

        DB::transaction(function () use ($user, $invoice, $eventId) {
            // Log formal invoice
            \App\Models\Invoice::updateOrCreate(
                ['stripe_invoice_id' => $invoice->id],
                [
                    'user_id' => $user->id,
                    'amount' => $invoice->amount_paid / 100,
                    'currency' => $invoice->currency,
                    'status' => 'paid',
                    'pdf_url' => $invoice->invoice_pdf,
                    'description' => $invoice->description ?? 'Invoice for payment',
                ]
            );

            WebhookLog::create([
                'provider' => 'stripe',
                'event_id' => $eventId,
            ]);
        });

        Log::info("Invoice paid and logged for user {$user->id}: {$invoice->id}");
    }

    protected function handleInvoiceFailed($invoice, $eventId)
    {
        $user = User::where('stripe_customer_id', $invoice->customer)->first();
        if (!$user) return;

        \App\Models\Invoice::updateOrCreate(
            ['stripe_invoice_id' => $invoice->id],
            [
                'user_id' => $user->id,
                'status' => 'failed',
                'description' => $invoice->last_payment_error ? $invoice->last_payment_error->message : 'Payment failed',
            ]
        );

        WebhookLog::create([
            'provider' => 'stripe',
            'event_id' => $eventId,
        ]);

        Log::warning("Invoice payment failed for user {$user->id}: {$invoice->id}");
    }

    protected function handleInvoiceVoided($invoice, $eventId)
    {
        $user = User::where('stripe_customer_id', $invoice->customer)->first();
        if (!$user) return;

        \App\Models\Invoice::updateOrCreate(
            ['stripe_invoice_id' => $invoice->id],
            [
                'user_id' => $user->id,
                'status' => 'voided',
            ]
        );

        WebhookLog::create([
            'provider' => 'stripe',
            'event_id' => $eventId,
        ]);

        Log::info("Invoice voided for user {$user->id}: {$invoice->id}");
    }

    protected function handlePaymentFailed($intent, $eventId)
    {
        $userId = $intent->metadata->user_id ?? null;
        $error = $intent->last_payment_error ? $intent->last_payment_error->message : 'Unknown error';

        Log::warning("Stripe Payment Failed for User #{$userId}: {$error}");

        WebhookLog::create([
            'provider' => 'stripe',
            'event_id' => $eventId,
        ]);
    }

    protected function handleSessionExpired($session, $eventId)
    {
        $userId = $session->metadata->user_id ?? 'unknown';
        Log::info("Stripe Checkout Session Expired for User #{$userId}: {$session->id}");

        WebhookLog::create([
            'provider' => 'stripe',
            'event_id' => $eventId,
        ]);
    }

    protected function fulfillPayment($session, $eventId)
    {
        $referralService = app(ReferralService::class);
        $userId = $session->metadata->user_id;
        $type   = $session->metadata->type ?? 'topup';
        $amount = (float) $session->metadata->amount; // This is the net amount paid
        $originalAmount = (float) ($session->metadata->original_amount ?? $amount);
        $couponCode = $session->metadata->coupon_code ?? null;
        $paidGross = $session->amount_total / 100;

        DB::transaction(function () use ($userId, $amount, $originalAmount, $couponCode, $paidGross, $eventId, $type, $session) {
            $user = User::lockForUpdate()->find($userId);
            if (!$user) {
                Log::error("Webhook Error: User #{$userId} not found for session {$session->id}");
                return;
            }

            // Track coupon usage
            if ($couponCode) {
                $coupon = Coupon::where('code', $couponCode)->first();
                if ($coupon) {
                    $coupon->increment('used_count');
                }
            }

            // Save Customer ID if missing
            if (!$user->stripe_customer_id && $session->customer) {
                $user->update(['stripe_customer_id' => $session->customer]);
            }

            if ($type === 'direct_purchase') {
                $productId = $session->metadata->product_id;
                $quantity  = (int) $session->metadata->quantity;
                $country   = $session->metadata->country ?? 'US';
                $sessionType = $session->metadata->session_type ?? 'rotating';
                
                $product = \App\Models\Product::find($productId);
                $fulfilled = false;
                $failReason = null;

                if ($product) {
                    // Security Check: Verify Price (Net of VAT)
                    $expectedNet = $product->price * $quantity;
                    if (abs($amount - $expectedNet) > 0.01) {
                        Log::warning("Webhook Security: Price mismatch for User #{$userId}. Paid: {$amount}, Expected: {$expectedNet}");
                        // We still credit the amount to wallet as fallback below
                    } else {
                        $evomi = app(\App\Services\EvomiService::class);
                        $subuserResult = $evomi->ensureSubuser($user);
                        
                        if ($subuserResult['success']) {
                            $userKeys = $user->fresh()->evomi_keys ?? [];
                            $proxyKey = $userKeys[$product->type] ?? ($userKeys['residential'] ?? null);
                            
                            if ($proxyKey) {
                                try {
                                    $allocated = $evomi->allocateBandwidth($user->evomi_username, $quantity * 1024, $product->type);
                                    
                                    if ($allocated) {
                                        // Create Order
                                        $order = \App\Models\Order::create([
                                            'user_id'    => $user->id,
                                            'product_id' => $product->id,
                                            'status'     => 'active',
                                            'expires_at' => now()->addDays(30),
                                        ]);

                                        // Create Proxies
                                        $portMap = ['rp' => 1000, 'mp' => 3000, 'isp' => 3000, 'dc' => 2000];
                                        $hostMap = ['rp' => 'rp.evomi.com', 'mp' => 'mp.evomi.com', 'dc' => 'dcp.evomi.com', 'isp' => 'isp.evomi.com'];
                                        $port = $portMap[$product->type] ?? 1000;
                                        $host = $hostMap[$product->type] ?? 'gate.evomi.com';

                                        for ($i = 0; $i < $quantity; $i++) {
                                            \App\Models\Proxy::create([
                                                'order_id' => $order->id,
                                                'host'     => $host,
                                                'port'     => $port,
                                                'username' => $user->evomi_username,
                                                'password' => "{$proxyKey}_country-{$country}_session-{$sessionType}",
                                                'country'  => $country,
                                            ]);
                                        }
                                        $fulfilled = true;
                                        Log::info("Direct purchase fulfilled & proxies generated for user {$user->id}");
                                    } else {
                                        $failReason = "Provider allocation failed";
                                    }
                                } catch (\Exception $e) {
                                    Log::error("Webhook Direct Fulfillment Error: " . $e->getMessage());
                                    $failReason = "Technical error during proxy generation";
                                }
                            } else {
                                $failReason = "No proxy key found for product type";
                            }
                        } else {
                            $failReason = "Provider account initialization failed";
                        }
                    }
                } else {
                    $failReason = "Product no longer exists";
                }

                if (!$fulfilled) {
                    // FALLBACK: Credit user wallet if direct fulfillment failed
                    $user->increment('balance', $amount);
                    $referralService->awardCommission($user, $amount, "Commission from Buy Fallback (Stripe)");
                    WalletTransaction::create([
                        'user_id' => $user->id,
                        'type' => 'credit',
                        'amount' => $amount,
                        'reference' => $eventId,
                        'description' => "Direct Purchase Fallback: Product #{$productId} (Refunded to wallet: {$failReason})",
                    ]);
                    Log::warning("Direct purchase fulfillment failed for User #{$userId}. Credited to wallet instead. Reason: {$failReason}");
                } else {
                    WalletTransaction::create([
                        'user_id' => $user->id,
                        'type' => 'credit',
                        'amount' => $amount,
                        'reference' => $eventId,
                        'description' => "Direct Purchase: {$quantity}x Product #{$productId} (Auto-allocated)",
                    ]);
                }
            } else {
                // Regular Top-up
                $creditAmount = $couponCode ? $originalAmount : $amount;
                $user->increment('balance', $creditAmount);
                $referralService->awardCommission($user, $amount, "Commission from Wallet Top-up (Stripe)");

                WalletTransaction::create([
                    'user_id' => $user->id,
                    'type' => 'credit',
                    'amount' => $creditAmount,
                    'reference' => $eventId,
                    'description' => 'Stripe Wallet Top-up' . ($couponCode ? " (Used promo: {$couponCode})" : ""),
                ]);
            }

            WebhookLog::create([
                'provider' => 'stripe',
                'event_id' => $eventId,
            ]);
        });
    }

    protected function fulfillSetup($session)
    {
        $user = User::where('stripe_customer_id', $session->customer)->first();
        if ($user && $session->setup_intent) {
            Stripe::setApiKey(Setting::getValue('stripe_secret_key') ?: config('services.stripe.secret'));
            $setupIntent = \Stripe\SetupIntent::retrieve($session->setup_intent);
            if ($setupIntent->payment_method) {
                $user->update(['default_payment_method' => $setupIntent->payment_method]);
                Log::info("Default payment method updated for user {$user->id}");
            }
        }
    }

    protected function updateUserPaymentMethod($setupIntent)
    {
        $user = User::where('stripe_customer_id', $setupIntent->customer)->first();
        if ($user) {
            $user->update(['default_payment_method' => $setupIntent->payment_method]);
            Log::info("Default payment method updated for user {$user->id} via setup_intent.succeeded");
        }
    }

    public function submitCrypto(Request $request)
{
    $request->validate([
        'currency'   => 'required|string',
        'amount'     => 'required|numeric|min:1',
        'txid'       => 'nullable|string',
        'binance_id' => 'nullable|string',
        'proof'      => 'nullable|image|max:5120', // Max 5MB
    ]);

    if (!$request->txid && !$request->binance_id) {
        return response()->json(['message' => 'Please provide either a TXID or a Binance ID.'], 422);
    }

    $proofPath = null;
    if ($request->hasFile('proof')) {
        $proofPath = $request->file('proof')->store('proofs', 'public');
    }

    $pending = \App\Models\PendingCryptoTransaction::create([
        'user_id'    => $request->user()->id,
        'currency'   => $request->currency,
        'amount'     => $request->amount,
        'txid'       => $request->txid,
        'binance_id' => $request->binance_id,
        'proof_path' => $proofPath,
        'status'     => 'pending',
    ]);

    return response()->json(['message' => 'Transaction submitted for review.', 'data' => $pending]);
}

    /**
     * Admin: List pending crypto transactions.
     */
    public function adminPendingCrypto()
    {
        $pending = \App\Models\PendingCryptoTransaction::with('user:id,name,email')
            ->where('status', 'pending')
            ->latest()
            ->get();

        return response()->json($pending);
    }

    /**
     * Admin: Approve or Reject a crypto transaction.
     */
    public function adminApproveCrypto(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'admin_note' => 'nullable|string',
        ]);

        $pending = \App\Models\PendingCryptoTransaction::findOrFail($id);
        
        if ($pending->status !== 'pending') {
            return response()->json(['message' => 'Transaction already processed.'], 400);
        }

        DB::transaction(function () use ($pending, $request) {
            $pending->update([
                'status' => $request->status,
                'admin_note' => $request->admin_note,
            ]);

            if ($request->status === 'approved') {
                $user = User::lockForUpdate()->find($pending->user_id);
                $user->balance += $pending->amount;
                $user->save();

                WalletTransaction::create([
                    'user_id' => $user->id,
                    'type' => 'credit',
                    'amount' => $pending->amount,
                    'reference' => "CRYPTO-" . ($pending->txid ?: $pending->binance_id ?: $pending->id),
                    'description' => "Crypto Top-up ({$pending->currency})",
                ]);
            }
        });

        return response()->json(['message' => "Transaction {$request->status} successfully."]);
    }

    /**
     * Create a Stripe Checkout Session in 'setup' mode to save a card.
     */
    public function createSetupIntent(Request $request)
    {
        Stripe::setApiKey(Setting::getValue('stripe_secret_key') ?: config('services.stripe.secret'));

        $user = $request->user();
        
        if (!$user->stripe_customer_id) {
            $customer = \Stripe\Customer::create([
                'email' => $user->email,
                'name' => $user->name,
            ]);
            $user->update(['stripe_customer_id' => $customer->id]);
        }

        $session = \Stripe\Checkout\Session::create([
            'payment_method_types' => ['card'],
            'mode' => 'setup',
            'customer' => $user->stripe_customer_id,
            'success_url' => url('/') . '/app/billing?setup_success=true',
            'cancel_url' => url('/') . '/app/billing?setup_canceled=true',
            'metadata' => [
                'user_id' => $user->id,
                'type' => 'card_setup'
            ]
        ]);

        return response()->json(['url' => $session->url]);
    }

    public function invoices(Request $request)
    {
        $userId = $request->user()->id;

        // Formal Invoices from Stripe
        $invoicesQuery = \App\Models\Invoice::where('user_id', $userId)->latest()->get();
        $stripeInvoiceIds = $invoicesQuery->pluck('stripe_invoice_id')->filter()->toArray();

        $formalInvoices = $invoicesQuery->map(function ($inv) {
            return [
                'id'             => (string) $inv->id,
                'invoice_number' => "INV-{$inv->id}",
                'amount'         => (float) $inv->amount,
                'amount_cents'   => (int) ($inv->amount * 100),
                'status'         => $inv->status,
                'gateway'        => $inv->stripe_invoice_id ? 'stripe' : 'manual',
                'period'         => $inv->created_at->format('M Y'),
                'created_at'     => $inv->created_at->toIso8601String(),
                'description'    => $inv->description ?: 'Subscription/Purchase',
                'pdf_url'        => $inv->pdf_url,
            ];
        });

        // Wallet Transactions (Top-ups, etc. that might not have formal Stripe invoices yet)
        $walletTx = WalletTransaction::where('user_id', $userId)
            ->whereNotIn('reference', $stripeInvoiceIds)
            ->latest()
            ->get()
            ->map(function ($t) {
                $gateway = 'balance';
                if (str_contains(strtolower($t->description), 'crypto')) $gateway = 'crypto';
                if (str_contains(strtolower($t->description), 'binance')) $gateway = 'binance';

                return [
                    'id'             => (string) $t->id,
                    'invoice_number' => "TX-{$t->id}",
                    'amount'         => (float) $t->amount,
                    'amount_cents'   => (int) ($t->amount * 100),
                    'status'         => 'paid',
                    'gateway'        => $gateway,
                    'period'         => $t->created_at->format('M Y'),
                    'created_at'     => $t->created_at->toIso8601String(),
                    'description'    => $t->description,
                    'pdf_url'        => null,
                ];
            });

        // Use collect() to avoid Eloquent Collection merge/sort errors with arrays
        return response()->json(collect($formalInvoices)->merge(collect($walletTx))->sortByDesc('created_at')->values());
    }

    /**
     * Admin: List all invoices/transactions for all users.
     */
    public function adminInvoices()
    {
        $transactions = WalletTransaction::with('user:id,name,email')
            ->latest()
            ->get();

        return response()->json($transactions);
    }

    /**
     * Admin: Check status of payment gateways.
     */
    public function gatewayStatus(Request $request)
    {
        $refresh = $request->query('refresh') === 'true';
        $cacheKey = 'admin_gateway_status';

        try {
            if (!$refresh && Cache::has($cacheKey)) {
                return response()->json(Cache::get($cacheKey));
            }
        } catch (\Exception $e) {
            Log::error("Cache Error: " . $e->getMessage());
        }

        $stripeSecret = Setting::getValue('stripe_secret_key') ?: config('services.stripe.secret');
        $stripePublishable = Setting::getValue('stripe_publishable_key') ?: config('services.stripe.publishable');
        $stripeWebhook = Setting::getValue('stripe_webhook_secret') ?: config('services.stripe.webhook_secret');

        $stripeStatus = 'not_configured';
        if ($stripeSecret && $stripePublishable) {
            try {
                Stripe::setApiKey($stripeSecret);
                // Simple call to verify key
                Account::retrieve();
                $stripeStatus = 'connected';
            } catch (\Exception $e) {
                Log::warning("Stripe Connection Error: " . $e->getMessage());
                $stripeStatus = 'error';
            }
        }

        $status = [
            'gateways' => [
                [
                    'id' => 'stripe',
                    'name' => 'Stripe',
                    'status' => $stripeStatus,
                    'webhook_health' => $stripeWebhook ? 'good' : 'missing',
                    'last_sync' => now()->toIso8601String(),
                ],
                [
                    'id' => 'paypal',
                    'name' => 'PayPal',
                    'status' => Setting::getValue('paypal_client_id') ? 'connected' : 'not_configured',
                    'webhook_health' => 'unknown',
                    'last_sync' => now()->toIso8601String(),
                ],
                [
                    'id' => 'cryptomus',
                    'name' => 'Cryptomus',
                    'status' => Setting::getValue('cryptomus_merchant_id') ? 'connected' : 'not_configured',
                    'webhook_health' => Setting::getValue('cryptomus_webhook_secret') ? 'good' : 'missing',
                    'last_sync' => now()->toIso8601String(),
                ],
                [
                    'id' => 'crypto',
                    'name' => 'Binance Pay (Manual)',
                    'status' => Setting::getValue('binance_pay_id') ? 'connected' : 'not_configured',
                    'webhook_health' => 'manual',
                    'last_sync' => now()->toIso8601String(),
                ]
            ]
        ];

        try {
            Cache::put($cacheKey, $status, 600);
        } catch (\Exception $e) {
            Log::error("Cache Put Error: " . $e->getMessage());
        }

        return response()->json($status);
    }

    public function publicGatewayStatus()
    {
        return response()->json([
            'stripe' => !empty(Setting::getValue('stripe_publishable_key')) && Setting::getValue('gateway_stripe_enabled') == '1',
            'paypal' => !empty(Setting::getValue('paypal_client_id')) && Setting::getValue('gateway_paypal_enabled') == '1',
            'cryptomus' => !empty(Setting::getValue('cryptomus_merchant_id')) && Setting::getValue('gateway_cryptomus_enabled') == '1',
            'crypto' => !empty(Setting::getValue('binance_pay_id')) && Setting::getValue('gateway_crypto_enabled') == '1',
        ]);
    }
    /**
     * Check and execute Auto Top-up for a user (Off-session Stripe Payment)
     */
    public function checkAndTriggerAutoTopUp(User $user)
    {
        // 1. Check global master switch
        if (Setting::getValue('auto_topup_enabled') !== '1') {
            return false;
        }

        $settings = $user->auto_topup_settings;
        
        // 2. Check user level toggle and data
        if (!isset($settings['enabled']) || !$settings['enabled'] || !isset($settings['amount']) || !$user->default_payment_method) {
            return false;
        }

        Log::info("Triggering Auto Top-up check for User #{$user->id}. Balance: {$user->balance}");

        // 3. Check Threshold
        $threshold = (float) ($settings['threshold'] ?? Setting::getValue('min_balance_threshold', 5));
        if ($user->balance >= $threshold) {
             return false;
        }

        // 4. Check Monthly Cap (Safety)
        $maxMonthly = (float) ($settings['max_monthly'] ?? Setting::getValue('max_monthly_topup', 500));
        $thisMonthCharges = WalletTransaction::where('user_id', $user->id)
            ->where('description', 'LIKE', '%Auto Top-up%')
            ->where('created_at', '>=', now()->startOfMonth())
            ->sum('amount');
        
        if ($thisMonthCharges >= $maxMonthly) {
            Log::warning("Auto Top-up capped for user {$user->id}. Monthly limit reaches: {$thisMonthCharges} / {$maxMonthly}");
            return false;
        }

        $amount = (float) $settings['amount'];
        $amountWithVAT = $amount * 1.22;

        try {
            Log::info("Attempting off-session charge of \${$amount} for User #{$user->id}");
            Stripe::setApiKey(Setting::getValue('stripe_secret_key') ?: config('services.stripe.secret'));
            
            $pi = PaymentIntent::create([
                'amount' => round($amountWithVAT * 100),
                'currency' => 'usd',
                'customer' => $user->stripe_customer_id,
                'payment_method' => $user->default_payment_method,
                'off_session' => true,
                'confirm' => true,
                'description' => "Auto Top-up for User #{$user->id}",
                'metadata' => [
                    'user_id' => $user->id,
                    'type' => 'auto_topup',
                    'original_amount' => $amount
                ]
            ]);

            if ($pi->status === 'succeeded') {
                $user->increment('balance', $amount);
                
                $referralService = app(ReferralService::class);
                $referralService->awardCommission($user, $amount, "Commission from Auto Top-up (Stripe)");

                WalletTransaction::create([
                    'user_id' => $user->id,
                    'amount' => $amount,
                    'type' => 'credit',
                    'description' => "Auto Top-up: Saved Card charged successfully.",
                    'reference' => $pi->id
                ]);
                Log::info("Auto Top-up successful for User #{$user->id}. Transaction: {$pi->id}");
                return true;
            }

            Log::error("Auto Top-up PI Status: " . $pi->status);
            return false;
        } catch (\Exception $e) {
            Log::error("Auto Top-up failed for user {$user->id}: " . $e->getMessage());
            return false;
        }
    }
}
