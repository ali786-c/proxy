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

    // IP Allowlist
    Route::get('/allowlist',        [\App\Http\Controllers\AllowlistController::class, 'index']);
    Route::post('/allowlist',       [\App\Http\Controllers\AllowlistController::class, 'store']);
    Route::match(['DELETE', 'POST'], '/allowlist/{id}', [\App\Http\Controllers\AllowlistController::class, 'destroy']);

    // Support Routes
    Route::get('/support/tickets',      [\App\Http\Controllers\SupportController::class, 'index']);
    Route::post('/support/tickets',     [\App\Http\Controllers\SupportController::class, 'store']);
    Route::get('/support/tickets/{id}', [\App\Http\Controllers\SupportController::class, 'show']);
    Route::post('/support/tickets/{id}/reply', [\App\Http\Controllers\SupportController::class, 'reply']);

    // Referral Routes
    Route::get('/referrals', [\App\Http\Controllers\ReferralController::class, 'index']);

    // API Key Routes
    Route::get('/api_keys',         [\App\Http\Controllers\ApiKeyController::class, 'index']);
    Route::post('/api_keys',        [\App\Http\Controllers\ApiKeyController::class, 'store']);
    Route::delete('/api_keys/{id}', [\App\Http\Controllers\ApiKeyController::class, 'destroy']);

    // Coupon validation
    Route::post('/coupons/validate', [\App\Http\Controllers\CouponController::class, 'validateCoupon']);
    Route::get('/me/usage',          [\App\Http\Controllers\AuthController::class, 'usage']);
    Route::get('/me/events',         [\App\Http\Controllers\AuthController::class, 'events']);
    Route::get('/me/subscription',   [\App\Http\Controllers\AuthController::class, 'subscription']);
});

// ─────────────────────────────────────────────
// Public Routes (no auth)
// ─────────────────────────────────────────────
Route::post('/webhook/stripe', [\App\Http\Controllers\BillingController::class, 'handleWebhook']);
Route::get('/currencies', [\App\Http\Controllers\CurrencyController::class, 'index']);
Route::get('/products', [\App\Http\Controllers\ProductController::class, 'index']);
Route::post('/auth/password/email', [\App\Http\Controllers\PasswordResetController::class, 'sendResetLink']);
Route::post('/auth/password/reset', [\App\Http\Controllers\PasswordResetController::class, 'reset']);
Route::post('/newsletters', function() {
    return response()->json(['message' => 'Successfully subscribed to newsletter.']);
});

// ─────────────────────────────────────────────
// Admin Routes
// ─────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/users',          [\App\Http\Controllers\AdminController::class, 'users']);
    Route::get('/users/{id}/stats', [\App\Http\Controllers\AdminController::class, 'userStats']);
    Route::post('/users/balance', [\App\Http\Controllers\AdminController::class, 'updateBalance']);
    Route::post('/users/ban',     [\App\Http\Controllers\AdminController::class, 'banUser']);
    Route::post('/users/{id}/role', [\App\Http\Controllers\AdminController::class, 'updateRole']);
    Route::get('/stats',          [\App\Http\Controllers\AdminController::class, 'stats']);
    Route::get('/logs',           [\App\Http\Controllers\AdminController::class, 'logs']);
    Route::get('/invoices',       [\App\Http\Controllers\BillingController::class, 'adminInvoices']);
    Route::get('/payment-gateways', [\App\Http\Controllers\BillingController::class, 'gatewayStatus']);
    Route::get('/settings',       [\App\Http\Controllers\SettingsController::class, 'index']);
    Route::post('/settings',      [\App\Http\Controllers\SettingsController::class, 'update']);
    Route::get('/alerts/config',  [\App\Http\Controllers\AdminController::class, 'getAlertConfig']);
    Route::patch('/alerts/config', [\App\Http\Controllers\AdminController::class, 'updateAlertConfig']);

    // Blog
    Route::get('/orders', [\App\Http\Controllers\OrderController::class, 'index']);
    Route::post('/orders', [\App\Http\Controllers\OrderController::class, 'store']);
    Route::get('/blog',           [\App\Http\Controllers\BlogController::class, 'index']);
    Route::post('/blog',          [\App\Http\Controllers\BlogController::class, 'store']);
    Route::put('/blog/{id}',      [\App\Http\Controllers\BlogController::class, 'update']);
    Route::post('/blog/{id}/publish', [\App\Http\Controllers\BlogController::class, 'publish']);
    Route::delete('/blog/{id}',   [\App\Http\Controllers\BlogController::class, 'destroy']);

    // Admin Products Management
    Route::post('/products',        [\App\Http\Controllers\ProductController::class, 'store']);
    Route::put('/products/{id}',     [\App\Http\Controllers\ProductController::class, 'update']);
    Route::delete('/products/{id}',  [\App\Http\Controllers\ProductController::class, 'destroy']);

    // Admin Coupons Management
    Route::get('/coupons',           [\App\Http\Controllers\CouponController::class, 'index']);
    Route::post('/coupons',          [\App\Http\Controllers\CouponController::class, 'store']);
    Route::delete('/coupons/{id}',   [\App\Http\Controllers\CouponController::class, 'destroy']);
    Route::post('/coupons/{id}/toggle', [\App\Http\Controllers\CouponController::class, 'toggle']);

    // Admin Support Management
    Route::get('/support/tickets',    [\App\Http\Controllers\SupportController::class, 'adminIndex']);
    Route::post('/support/tickets/{id}/status', [\App\Http\Controllers\SupportController::class, 'updateStatus']);
    Route::post('/support/tickets/{id}/reply', [\App\Http\Controllers\SupportController::class, 'reply']);

    // Admin Resellers Management
    Route::get('/resellers',          [\App\Http\Controllers\AdminController::class, 'listResellers']);
    Route::post('/resellers',         [\App\Http\Controllers\AdminController::class, 'storeReseller']);
    Route::put('/resellers/{id}',      [\App\Http\Controllers\AdminController::class, 'updateReseller']);

    // Admin Currencies Management
    Route::get('/currencies',          [\App\Http\Controllers\CurrencyController::class, 'adminIndex']);
    Route::post('/currencies',         [\App\Http\Controllers\CurrencyController::class, 'store']);
    Route::put('/currencies/{id}',      [\App\Http\Controllers\CurrencyController::class, 'update']);
    Route::post('/currencies/{id}/toggle', [\App\Http\Controllers\CurrencyController::class, 'toggle']);

    // Admin Fraud Detection
    Route::get('/fraud/signals',      [\App\Http\Controllers\FraudController::class, 'signals']);
    Route::get('/fraud/risk-scores',  [\App\Http\Controllers\FraudController::class, 'riskScores']);
    Route::get('/fraud/login-history', [\App\Http\Controllers\FraudController::class, 'loginHistory']);
    Route::put('/fraud/signals/{id}/resolve', [\App\Http\Controllers\FraudController::class, 'resolveSignal']);

    // Admin SLA Monitoring
    Route::get('/sla', [\App\Http\Controllers\SLAController::class, 'index']);
    Route::get('/sla/configs', [\App\Http\Controllers\SLAController::class, 'getConfigs']);
    Route::post('/sla/configs', [\App\Http\Controllers\SLAController::class, 'storeConfig']);
    Route::get('/sla/credits', [\App\Http\Controllers\SLAController::class, 'getCredits']);
    Route::post('/sla/credits/{id}/approve', [\App\Http\Controllers\SLAController::class, 'approveCredit']);
});

// Public test route removed from bottom, moved to top.
