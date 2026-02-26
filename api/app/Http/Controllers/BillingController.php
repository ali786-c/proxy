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

class BillingController extends Controller
{
    public function createCheckout(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:5', // Min $5 top-up
        ]);

        Stripe::setApiKey(Setting::getValue('stripe_secret_key') ?: config('services.stripe.secret'));

        $session = Session::create([
            'payment_method_types' => ['card'],
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
            // Redirect back to the root SPA, not the /api subdirectory
            'success_url' => url('/') . '/app/billing?success=true',
            'cancel_url' => url('/') . '/app/billing?canceled=true',
            'metadata' => [
                'user_id' => $request->user()->id,
                'amount' => $request->amount,
            ],
        ]);

        return response()->json(['url' => $session->url]);
    }

    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = Setting::getValue('stripe_webhook_secret') ?: config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Idempotency Check
        if (WebhookLog::where('event_id', $event->id)->exists()) {
            return response()->json(['message' => 'Event already processed'], 200);
        }

        switch ($event->type) {
            case 'checkout.session.completed':
                $session = $event->data->object;
                if ($session->mode === 'payment') {
                    $this->fulfillPayment($session, $event->id);
                } elseif ($session->mode === 'setup') {
                    $this->fulfillSetup($session);
                }
                break;
            case 'setup_intent.succeeded':
                $this->updateUserPaymentMethod($event->data->object);
                break;
        }

        return response()->json(['status' => 'success']);
    }

    protected function fulfillPayment($session, $eventId)
    {
        $userId = $session->metadata->user_id;
        $amount = $session->metadata->amount;

        DB::transaction(function () use ($userId, $amount, $eventId) {
            $user = User::lockForUpdate()->find($userId);
            $user->balance += $amount;
            $user->save();

            WalletTransaction::create([
                'user_id' => $user->id,
                'type' => 'credit',
                'amount' => $amount,
                'reference' => $eventId,
                'description' => 'Stripe Wallet Top-up',
            ]);

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
        $transactions = WalletTransaction::where('user_id', $request->user()->id)
            ->latest()
            ->get();

        $invoices = $transactions->map(function ($t) {
            return [
                'id'           => (string) $t->id,
                'amount_cents' => (int) ($t->amount * 100),
                'status'       => 'paid', // All transactions in wallet_transactions are completed
                'period'       => $t->created_at->format('M Y'),
                'created_at'   => $t->created_at->toIso8601String(),
                'description'  => $t->description,
            ];
        });

        return response()->json($invoices);
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
                    'id' => 'crypto',
                    'name' => 'Crypto',
                    'status' => Setting::getValue('crypto_wallet_address') ? 'connected' : 'not_configured',
                    'webhook_health' => 'unknown',
                    'last_sync' => now()->toIso8601String(),
                ]
            ]
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
