<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Models\WebhookLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Stripe\Webhook;
use Illuminate\Support\Facades\Http;
use App\Helpers\CryptomusHelper;

class BillingController extends Controller
{
    public function createProductCheckout(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = \App\Models\Product::findOrFail($request->product_id);
        $totalAmount = ($product->price * $request->quantity) * 1.22; // Including 22% VAT for Stripe

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
                'amount' => $product->price * $request->quantity,
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
        ]);

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
                        'name' => 'Balance Top-up',
                        'description' => 'Add funds to your UpgradedProxy wallet',
                    ],
                    'unit_amount' => $request->amount * 100,
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => url('/') . '/app/billing?success=true',
            'cancel_url' => url('/') . '/app/billing?canceled=true',
            'metadata' => [
                'user_id' => $request->user()->id,
                'amount' => $request->amount,
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
        ]);

        $merchantId = Setting::getValue('cryptomus_merchant_id');
        $apiKey = Setting::getValue('cryptomus_api_key');

        if (!$merchantId || !$apiKey) {
            return response()->json(['error' => 'Cryptomus is not configured.'], 400);
        }

        $orderId = 'TOPUP-' . time() . '-' . $request->user()->id;
        
        $data = [
            'amount' => (string) $request->amount,
            'currency' => 'EUR', // Primary app currency
            'order_id' => $orderId,
            'url_return' => url('/') . '/app/billing?success=true&gateway=cryptomus',
            'url_callback' => url('/') . '/api/webhook/cryptomus',
            'additional_data' => json_encode([
                'user_id' => $request->user()->id,
                'type' => 'topup',
                'amount' => $request->amount,
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
        ]);

        $product = \App\Models\Product::findOrFail($request->product_id);
        $totalAmount = $product->price * $request->quantity; // No VAT on crypto as per UI instructions

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
        $payload = $request->getContent();
        $signHeader = $request->header('sign');
        $apiKey = Setting::getValue('cryptomus_webhook_secret') ?: Setting::getValue('cryptomus_api_key');

        if (!$signHeader || !$apiKey) {
            Log::error('Cryptomus Webhook Error: Missing sign header or API key.');
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        if (!CryptomusHelper::verifySignature($payload, $signHeader, $apiKey)) {
            Log::error('Cryptomus Webhook Error: Signature mismatch.');
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        $data = $request->all();
        $status = $data['status'] ?? 'unknown';

        // Only process successful payments
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

        DB::transaction(function () use ($userId, $amount, $uuid, $type, $metadata, $data) {
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
                $user->increment('balance', $amount);
                WalletTransaction::create([
                    'user_id' => $user->id,
                    'type' => 'credit',
                    'amount' => $amount,
                    'reference' => "CRYPTO-{$uuid}",
                    'description' => 'Cryptomus Wallet Top-up',
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

    protected function fulfillPayment($session, $eventId)
    {
        $userId = $session->metadata->user_id;
        $type   = $session->metadata->type ?? 'topup';
        $amount = (float) $session->metadata->amount; // This is the net amount we expect
        $paidGross = $session->amount_total / 100;

        DB::transaction(function () use ($userId, $amount, $paidGross, $eventId, $type, $session) {
            $user = User::lockForUpdate()->find($userId);
            if (!$user) {
                Log::error("Webhook Error: User #{$userId} not found for session {$session->id}");
                return;
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
                $user->increment('balance', $amount);

                WalletTransaction::create([
                    'user_id' => $user->id,
                    'type' => 'credit',
                    'amount' => $amount,
                    'reference' => $eventId,
                    'description' => 'Stripe Wallet Top-up',
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
            'currency' => 'required|string',
            'amount'   => 'required|numeric|min:1',
            'txid'     => 'required|string|unique:pending_crypto_transactions,txid',
        ]);

        $pending = \App\Models\PendingCryptoTransaction::create([
            'user_id'  => $request->user()->id,
            'currency' => $request->currency,
            'amount'   => $request->amount,
            'txid'     => $request->txid,
            'status'   => 'pending',
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
                    'reference' => "CRYPTO-{$pending->txid}",
                    'description' => "Crypto Top-up ({$pending->currency})",
                ]);
            }
        });

        return response()->json(['message' => "Transaction {$request->status} successfully."]);
    }

    /**
     * Create a SetupIntent for saving a card for Auto Top-Up.
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

        $setupIntent = \Stripe\SetupIntent::create([
            'customer' => $user->stripe_customer_id,
            'payment_method_types' => ['card'],
        ]);

        return response()->json(['client_secret' => $setupIntent->client_secret]);
    }

    public function invoices(Request $request)
    {
        $userId = $request->user()->id;

        // Formal Invoices from Stripe
        $invoicesQuery = \App\Models\Invoice::where('user_id', $userId)->latest()->get();
        $stripeInvoiceIds = $invoicesQuery->pluck('stripe_invoice_id')->filter()->toArray();

        $formalInvoices = $invoicesQuery->map(function ($inv) {
            return [
                'id'           => "INV-{$inv->id}",
                'amount_cents' => (int) ($inv->amount * 100),
                'status'       => $inv->status,
                'period'       => $inv->created_at->format('M Y'),
                'created_at'   => $inv->created_at->toIso8601String(),
                'description'  => $inv->description ?: 'Subscription/Purchase',
                'pdf_url'      => $inv->pdf_url,
            ];
        });

        // Wallet Transactions (Top-ups, etc. that might not have formal Stripe invoices yet)
        $walletTx = WalletTransaction::where('user_id', $userId)
            ->whereNotIn('reference', $stripeInvoiceIds)
            ->latest()
            ->get()
            ->map(function ($t) {
                return [
                    'id'           => (string) $t->id,
                    'amount_cents' => (int) ($t->amount * 100),
                    'status'       => 'paid',
                    'period'       => $t->created_at->format('M Y'),
                    'created_at'   => $t->created_at->toIso8601String(),
                    'description'  => $t->description,
                    'pdf_url'      => null,
                ];
            });

        return response()->json($formalInvoices->merge($walletTx)->sortByDesc('created_at')->values());
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
    public function gatewayStatus()
    {
        $stripeSecret = Setting::getValue('stripe_secret_key') ?: config('services.stripe.secret');
        $stripePublishable = Setting::getValue('stripe_publishable_key') ?: config('services.stripe.publishable');
        $stripeWebhook = Setting::getValue('stripe_webhook_secret') ?: config('services.stripe.webhook_secret');

        $stripeStatus = 'not_configured';
        if ($stripeSecret && $stripePublishable) {
            try {
                Stripe::setApiKey($stripeSecret);
                // Simple call to verify key
                \Stripe\Account::retrieve();
                $stripeStatus = 'connected';
            } catch (\Exception $e) {
                $stripeStatus = 'error';
            }
        }

        return response()->json([
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
                ]
            ]
        ]);
    }

    public function publicGatewayStatus()
    {
        return response()->json([
            'stripe' => !empty(Setting::getValue('stripe_publishable_key')),
            'paypal' => !empty(Setting::getValue('paypal_client_id')),
            'cryptomus' => !empty(Setting::getValue('cryptomus_merchant_id')),
        ]);
    }
    public function checkAndTriggerAutoTopUp($user)
    {
        $settings = $user->auto_topup_settings;
        if (!$settings || !($settings['enabled'] ?? false)) {
            return;
        }

        $threshold = $settings['threshold'] ?? 10;
        $amount    = $settings['amount'] ?? 50;

        if ($user->balance < $threshold && $user->default_payment_method) {
            $this->chargeSavedCard($user, $amount);
        }
    }

    protected function chargeSavedCard($user, $amount)
    {
        Stripe::setApiKey(Setting::getValue('stripe_secret_key') ?: config('services.stripe.secret'));

        try {
            $paymentIntent = \Stripe\PaymentIntent::create([
                'amount' => $amount * 100, // cents
                'currency' => 'usd',
                'customer' => $user->stripe_customer_id,
                'payment_method' => $user->default_payment_method,
                'off_session' => true,
                'confirm' => true,
            ]);

            if ($paymentIntent->status === 'succeeded') {
                DB::transaction(function () use ($user, $amount, $paymentIntent) {
                    $user->increment('balance', $amount);
                    WalletTransaction::create([
                        'user_id' => $user->id,
                        'type' => 'credit',
                        'amount' => $amount,
                        'description' => 'Auto Top-Up via Stripe',
                        'reference' => $paymentIntent->id,
                    ]);
                });
                Log::info("Auto Top-Up successful for User {$user->id}");
            }
        } catch (\Stripe\Exception\CardException $e) {
            Log::error("Auto Top-Up failed for User {$user->id}: " . $e->getMessage());
        } catch (\Exception $e) {
            Log::error("Auto Top-Up error for User {$user->id}: " . $e->getMessage());
        }
    }
}
