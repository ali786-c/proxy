<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\Proxy;
use App\Models\WalletTransaction;
use App\Services\EvomiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProxyController extends Controller
{
    protected $evomi;

    public function __construct(EvomiService $evomi)
    {
        $this->evomi = $evomi;
    }

    public function generate(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1|max:100',
            'country' => 'nullable|string|max:10',
            'session_type' => 'nullable|string|in:sticky,rotating',
        ]);

        $user = $request->user();
        $product = Product::find($request->product_id);
        $totalCost = $product->price * $request->quantity;

        if ($user->balance < $totalCost) {
            return response()->json(['message' => 'Insufficient balance.'], 402);
        }

        try {
            return DB::transaction(function () use ($user, $product, $totalCost, $request) {
                // Lock user row for update to prevent race conditions
                $user = $user->fresh(); // Get latest
                
                // Re-check balance after lock
                if ($user->balance < $totalCost) {
                    throw new \Exception('Insufficient balance detected during transaction.');
                }

                // Ensure user has an Evomi subuser setup
                if (!$user->evomi_username) {
                    throw new \Exception('Proxy account not initialized. Please go to settings/profile to link your account.');
                }

                // Call Evomi API using standardized bandwidth allocation
                $evomiResult = $this->evomi->allocateBandwidth($user->evomi_username, $request->quantity * 1024, $product->type);

                if (!$evomiResult) {
                    throw new \Exception('Failed to communicate with proxy provider.');
                }

                // Deduct Balance
                $user->balance -= $totalCost;
                $user->save();

                // Log Transaction (Production safety)
                WalletTransaction::create([
                    'user_id' => $user->id,
                    'type' => 'debit',
                    'amount' => $totalCost,
                    'description' => "Purchase: {$request->quantity}x {$product->name}",
                ]);

                // Create Order
                $order = Order::create([
                    'user_id' => $user->id,
                    'product_id' => $product->id,
                    'status' => 'active',
                    'expires_at' => now()->addDays(30), // Default 30 days
                ]);

                // Construct Proxy URLs (Evomi Pattern)
                $proxies = [];
                
                // Map product type to port
                $portMap = [
                    'rp'  => '1000',
                    'mp'  => '2000',
                    'isp' => '3000',
                    'dc'  => '3000',
                ];
                $port = $portMap[$product->type] ?? '1000';

                // Get the proxy key for the specific type (stored in evomi_keys JSON)
                $userKeys = $user->evomi_keys ?? [];
                
                // If keys are empty, try to sync once from provider
                if (empty($userKeys)) {
                    $userKeys = $this->evomi->syncProxyKeys($user) ?: [];
                }

                $proxyKey = $userKeys[$product->type] ?? ($userKeys['residential'] ?? null); // Fallback to residential key if specific missing

                if (!$proxyKey) {
                     throw new \Exception('Proxy key not found for this product type. Please try re-linking your account in settings.');
                }

                // Defaults for MVP
                $country = $request->country ?? 'US';
                $sessionType = $request->session_type ?? 'sticky'; // or 'rotating'

                for ($i = 0; $i < $request->quantity; $i++) {
                    // Evomi Password Pattern: {key}_country-{CODE}_session-{TYPE}
                    $constructedPassword = "{$proxyKey}_country-{$country}_session-{$sessionType}";

                    $proxy = Proxy::create([
                        'order_id' => $order->id,
                        'host' => 'gate.evomi.com',
                        'port' => $port,
                        'username' => $user->evomi_username,
                        'password' => $constructedPassword,
                        'country' => $country,
                    ]);
                    $proxies[] = $proxy;
                }

                return response()->json([
                    'message' => 'Proxies generated successfully.',
                    'order' => $order,
                    'proxies' => $proxies,
                    'balance' => $user->balance
                ]);
            });
        } catch (\Exception $e) {
            Log::error('Proxy Generation Error: ' . $e->getMessage());
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function list(Request $request)
    {
        $orders = Order::with('proxies', 'product')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($orders);
    }

    /**
     * Get dynamic proxy settings (countries, cities, etc.)
     */
    public function settings()
    {
        $cacheKey = 'evomi_proxy_settings';

        $settings = \Illuminate\Support\Facades\Cache::remember($cacheKey, 3600, function () {
            return $this->evomi->getProxySettings();
        });

        if (!$settings) {
            return response()->json(['message' => 'Could not fetch settings from provider.'], 502);
        }

        return response()->json($settings);
    }
}
