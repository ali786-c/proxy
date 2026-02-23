<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Cache;
use App\Services\EvomiService;

class AuthController extends Controller
{
    /**
     * Register a new user.
     * POST /auth/signup
     */
    public function register(Request $request)
    {
        $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'required|string|email|max:255|unique:users',
            'password'      => 'required|string|min:8',
            'referral_code' => 'nullable|string|exists:users,referral_code',
        ]);

        $user = User::create([
            'name'          => $request->name,
            'email'         => $request->email,
            'password'      => Hash::make($request->password),
            'referral_code' => 'UP-' . strtoupper(Str::random(8)),
            'role'          => 'client',
            'balance'       => 0,
        ]);

        // Link referral if provided
        if ($request->referral_code) {
            $referrer = User::where('referral_code', $request->referral_code)->first();
            if ($referrer) {
                \App\Models\Referral::create([
                    'referrer_id' => $referrer->id,
                    'referred_id' => $user->id,
                ]);
            }
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => $this->formatUser($user),
            'token' => $token,
        ]);
    }

    /**
     * Login user.
     * POST /auth/login
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['Invalid email or password.'],
            ]);
        }

        $user  = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => $this->formatUser($user),
            'token' => $token,
        ]);
    }

    /**
     * Get current authenticated user.
     * GET /auth/me
     */
    public function me(Request $request)
    {
        return response()->json($this->formatUser($request->user()));
    }

    /**
     * Logout user.
     * POST /auth/logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully.']);
    }

    /**
     * Get user profile with balance.
     * GET /profile
     */
    public function profile(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'id'            => (string) $user->id,
            'name'          => $user->name,
            'email'         => $user->email,
            'role'          => $user->role,
            'balance'       => (float) $user->balance,
            'referral_code' => $user->referral_code,
            'created_at'    => $user->created_at,
        ]);
    }

    /**
     * Get user dashboard stats.
     * GET /stats
     */
    public function stats(Request $request)
    {
        $user = $request->user();
        $cacheKey = "user_stats_{$user->id}";

        return Cache::remember($cacheKey, 300, function () use ($user) {
            $activeOrders = Order::where('user_id', $user->id)
                ->where('status', 'active')
                ->count();

            $totalOrders = Order::where('user_id', $user->id)->count();

            $totalSpent = \App\Models\WalletTransaction::where('user_id', $user->id)
                ->where('type', 'debit')
                ->sum('amount');

            // --- Bandwidth Stats from Evomi ---
            $bandwidthTotal = 0;
            $bandwidthUsed  = 0;

            if ($user->evomi_username) {
                $evomi = app(EvomiService::class);
                $data  = $evomi->getSubuserData($user->evomi_username);
                
                if ($data && isset($data['data']['products'])) {
                    // Evomi returns products as key => data object
                    foreach ($data['data']['products'] as $type => $product) {
                        $bandwidthTotal += (float) ($product['balance'] ?? 0);
                        $bandwidthUsed  += (float) ($product['usage'] ?? 0);
                    }
                }
            }

            return [
                'balance'          => (float) $user->balance,
                'active_proxies'   => $activeOrders,
                'total_orders'     => $totalOrders,
                'total_spent'      => (float) $totalSpent,
                'bandwidth_total'  => $bandwidthTotal,
                'bandwidth_used'   => $bandwidthUsed,
                'bandwidth_unit'   => 'MB',
            ];
        });
    }

    /**
     * Update user profile (name/password).
     * POST /profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name'     => 'nullable|string|max:255',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        if ($request->name) {
            $user->name = $request->name;
        }

        if ($request->password) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user'    => $this->formatUser($user),
        ]);
    }

    /**
     * Format user for API response — ensures id is string for frontend Zod schema.
     */
    private function formatUser(User $user): array
    {
        return [
            'id'            => (string) $user->id,
            'name'          => $user->name,
            'email'         => $user->email,
            'role'          => $user->role,
            'balance'       => (float) $user->balance,
            'referral_code' => $user->referral_code,
        ];
    }

    /**
     * GET /me/usage - Bandwidth usage over time (stub)
     */
    public function usage(Request $request)
    {
        return response()->json([
            'data'               => [],
            'total_bandwidth_mb' => 0,
            'total_requests'     => 0,
            'avg_success_rate'   => 0,
        ]);
    }

    /**
     * GET /me/events - Recent activity events (stub)
     */
    public function events(Request $request)
    {
        return response()->json([]);
    }

    /**
     * GET /me/subscription - Current subscription info (stub)
     */
    public function subscription(Request $request)
    {
        return response()->json([
            'plan'         => 'pay_as_you_go',
            'included_gb'  => 0,
            'used_gb'      => 0,
            'renewal_date' => now()->addMonth()->toDateString(),
            'price_cents'  => 0,
            'status'       => 'active',
        ]);
    }
}
