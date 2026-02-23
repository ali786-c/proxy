<?php

namespace App\Http\Controllers;

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

        Stripe::setApiKey(config('services.stripe.secret'));

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
        $endpointSecret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Idempotency Check
        if (WebhookLog::where('event_id', $event->id)->exists()) {
            return response()->json(['message' => 'Event already processed'], 200);
        }

        if ($event->type === 'checkout.session.completed') {
            $session = $event->data->object;
            $userId = $session->metadata->user_id;
            $amount = $session->metadata->amount;

            DB::transaction(function () use ($userId, $amount, $event) {
                $user = User::lockForUpdate()->find($userId);
                $user->balance += $amount;
                $user->save();

                WalletTransaction::create([
                    'user_id' => $user->id,
                    'type' => 'credit',
                    'amount' => $amount,
                    'reference' => $event->id,
                    'description' => 'Stripe Wallet Top-up',
                ]);

                WebhookLog::create([
                    'provider' => 'stripe',
                    'event_id' => $event->id,
                ]);
            });
        }

        return response()->json(['status' => 'success']);
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
}
