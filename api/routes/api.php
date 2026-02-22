<?php

// ─── REAL Proxy Connectivity Test ───────────────────────────────────────────
Route::get('/debug-test-proxy', function() {
    $user = \App\Models\User::where('email', 'aliyantarar@gmail.com')->first();

    if (!$user || !$user->evomi_username || empty($user->evomi_keys)) {
        return response()->json(['error' => 'User has no proxy credentials in DB', 'user_state' => [
            'evomi_username' => $user->evomi_username ?? null,
            'evomi_keys'     => $user->evomi_keys,
        ]]);
    }

    // Get the residential proxy key
    $keys     = $user->evomi_keys;
    $proxyKey = $keys['rp'] ?? $keys['residential'] ?? null;

    if (!$proxyKey) {
        return response()->json(['error' => 'No residential proxy key found', 'available_keys' => array_keys($keys)]);
    }

    // Construct proxy URL
    $proxyUser = $user->evomi_username;
    $proxyPass = "{$proxyKey}_country-US_session-rotating";
    $proxyUrl  = "http://{$proxyUser}:{$proxyPass}@gate.evomi.com:1000";

    // Make a real HTTP request THROUGH the proxy
    try {
        $ch = curl_init('http://ip-api.com/json');
        curl_setopt($ch, CURLOPT_PROXY, $proxyUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $result = curl_exec($ch);
        $error  = curl_error($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return response()->json([
            'proxy_used'       => "gate.evomi.com:1000",
            'proxy_username'   => $proxyUser,
            'proxy_pass_hint'  => substr($proxyPass, 0, 15) . '...',
            'http_code'        => $httpCode,
            'curl_error'       => $error ?: null,
            'ip_api_response'  => $result ? json_decode($result, true) : null,
        ]);
    } catch (\Exception $e) {
        return response()->json(['exception' => $e->getMessage()]);
    }
});

// ─── Debug Route ─────────────────────────────────────────────────────────────
Route::get('/debug-proxy', function() {
    $evomi  = app(\App\Services\EvomiService::class);
    $apiKey = config('services.evomi.key');
    $user   = \App\Models\User::where('email', 'aliyantarar@gmail.com')->first();

    $subuserData = null;
    if ($user && $user->evomi_username) {
        $subuserData = $evomi->getSubuserData($user->evomi_username);
    }

    return response()->json([
        'api_key_set'    => !empty($apiKey),
        'api_key_prefix' => $apiKey ? substr($apiKey, 0, 8) . '...' : null,
        'user' => $user ? [
            'id'               => $user->id,
            'email'            => $user->email,
            'balance'          => $user->balance,
            'evomi_username'   => $user->evomi_username,
            'evomi_subuser_id' => $user->evomi_subuser_id,
            'evomi_keys'       => $user->evomi_keys,
        ] : 'user not found',
        'subuser_data_from_evomi' => $subuserData,
    ]);
});

// Simple log tail
Route::get('/debug-logs', function() {
    $path  = storage_path('logs/laravel.log');
    if (!file_exists($path)) return 'No log file found.';
    $lines = file($path);
    return implode('', array_slice($lines, -80));
});

Route::get('/test-evomi', function() {
    return [
        'status'   => 'API is reachable',
        'products' => \App\Models\Product::all(['name', 'type']),
        'time'     => now()->toDateTimeString(),
    ];
});


// ─────────────────────────────────────────────
// Auth Routes (prefix: /auth)
// Frontend calls: /auth/login, /auth/signup, /auth/me, /auth/logout
// ─────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/login',  [\App\Http\Controllers\AuthController::class, 'login']);
    Route::post('/signup', [\App\Http\Controllers\AuthController::class, 'register']);

    Route::middleware(['auth:sanctum', 'banned'])->group(function () {
        Route::get('/me',      [\App\Http\Controllers\AuthController::class, 'me']);
        Route::post('/logout', [\App\Http\Controllers\AuthController::class, 'logout']);
    });
});

// ─────────────────────────────────────────────
// Protected Routes
// ─────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'banned'])->group(function () {

    // Profile & Stats
    Route::get('/profile',  [\App\Http\Controllers\AuthController::class, 'profile']);
    Route::post('/profile', [\App\Http\Controllers\AuthController::class, 'updateProfile']);
    Route::get('/stats',    [\App\Http\Controllers\AuthController::class, 'stats']);

    // Proxy Routes
    Route::post('/proxies/generate', [\App\Http\Controllers\ProxyController::class, 'generate']);
    Route::get('/proxies',           [\App\Http\Controllers\ProxyController::class, 'list']);
    Route::get('/proxies/settings',  [\App\Http\Controllers\ProxyController::class, 'settings']);

    // Subuser Routes
    Route::post('/subusers/setup',  [\App\Http\Controllers\SubuserController::class, 'setup']);
    Route::get('/subusers/status', [\App\Http\Controllers\SubuserController::class, 'status']);

    // Billing Routes
    Route::post('/billing/checkout', [\App\Http\Controllers\BillingController::class, 'createCheckout']);
    Route::get('/invoices',          [\App\Http\Controllers\BillingController::class, 'invoices']);

    // Products
    Route::get('/products', [\App\Http\Controllers\ProductController::class, 'index']);
    Route::post('/coupons/validate', [\App\Http\Controllers\CouponController::class, 'validateCoupon']);

    // Support Routes
    Route::get('/support/tickets',      [\App\Http\Controllers\SupportController::class, 'index']);
    Route::post('/support/tickets',     [\App\Http\Controllers\SupportController::class, 'store']);
    Route::get('/support/tickets/{id}', [\App\Http\Controllers\SupportController::class, 'show']);

    // Referral Routes
    Route::get('/referrals', [\App\Http\Controllers\ReferralController::class, 'index']);

    // API Key Routes
    Route::get('/api_keys',        [\App\Http\Controllers\ApiKeyController::class, 'index']);
    Route::post('/api_keys',       [\App\Http\Controllers\ApiKeyController::class, 'store']);
    Route::delete('/api_keys/{id}', [\App\Http\Controllers\ApiKeyController::class, 'destroy']);

    // IP Allowlist Routes
    Route::get('/allowlist',        [\App\Http\Controllers\AllowlistController::class, 'index']);
    Route::post('/allowlist',       [\App\Http\Controllers\AllowlistController::class, 'store']);
    Route::match(['DELETE', 'POST'], '/allowlist/{id}', [\App\Http\Controllers\AllowlistController::class, 'destroy']);
});

// ─────────────────────────────────────────────
// Public Routes (no auth)
// ─────────────────────────────────────────────
Route::post('/webhook/stripe', [\App\Http\Controllers\BillingController::class, 'handleWebhook']);

// ─────────────────────────────────────────────
// Admin Routes
// ─────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/users',          [\App\Http\Controllers\AdminController::class, 'users']);
    Route::post('/users/balance', [\App\Http\Controllers\AdminController::class, 'updateBalance']);
    Route::post('/users/ban',     [\App\Http\Controllers\AdminController::class, 'banUser']);
    Route::get('/stats',          [\App\Http\Controllers\AdminController::class, 'stats']);
    Route::get('/logs',           [\App\Http\Controllers\AdminController::class, 'logs']);

    // Admin Products Management
    Route::post('/products',        [\App\Http\Controllers\ProductController::class, 'store']);
    Route::put('/products/{id}',     [\App\Http\Controllers\ProductController::class, 'update']);
    Route::delete('/products/{id}',  [\App\Http\Controllers\ProductController::class, 'destroy']);

    // Admin Coupons Management
    Route::get('/coupons',           [\App\Http\Controllers\CouponController::class, 'index']);
    Route::post('/coupons',          [\App\Http\Controllers\CouponController::class, 'store']);
    Route::delete('/coupons/{id}',   [\App\Http\Controllers\CouponController::class, 'destroy']);
    Route::post('/coupons/{id}/toggle', [\App\Http\Controllers\CouponController::class, 'toggle']);
});

// Public test route removed from bottom, moved to top.

