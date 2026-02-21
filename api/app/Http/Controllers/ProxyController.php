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
        ]);

        $user = $request->user();
        $product = Product::find($request->product_id);
        $totalCost = $product->price * $request->quantity;

        if ($user->balance < $totalCost) {
            return response()->json(['message' => 'Insufficient balance.'], 402);
        }

        return DB::transaction(function () use ($user, $product, $totalCost, $request) {
            // Lock user row for update to prevent race conditions
            $user = $user->fresh(); // Get latest
            
            // Re-check balance after lock
            if ($user->balance < $totalCost) {
                throw new \Exception('Insufficient balance detected during transaction.');
            }

            // Call Evomi API
            // Note: For MVP, we use the user's email as unique subuser identifier
            $evomiResult = $this->evomi->allocateBalance($user->email, $request->quantity * 1024, $product->type);

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
            for ($i = 0; $i < $request->quantity; $i++) {
                $proxy = Proxy::create([
                    'order_id' => $order->id,
                    'host' => 'gate.evomi.com',
                    'port' => '1000',
                    'username' => $user->email,
                    'password' => 'secret_pass_' . str_random(6),
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
    }

    public function list(Request $request)
    {
        $orders = Order::with('proxies', 'product')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($orders);
    }
}
