<?php

// ─── Debug Route ──────────────────────────────────────────────────────────
// Comprehensive test of the entire proxy generation flow.
Route::get('/debug-proxy', function() {
    $evomi = app(\App\Services\EvomiService::class);

    // 1. Check API key
    $apiKey = config('services.evomi.key');

    // 2. Get user state from DB
    $user = \App\Models\User::where('email', 'aliyantarar@gmail.com')->first();

    // 3. Test getSubuserData if username exists
    $subuserData = null;
    if ($user && $user->evomi_username) {
        $subuserData = $evomi->getSubuserData($user->evomi_username);
    }

    // 4. Test getProxySettings
    $proxySettings = $evomi->getProxySettings();

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
        'proxy_settings_ok'       => isset($proxySettings['data']) ? 'YES' : 'NO - ' . json_encode($proxySettings),
    ]);
});

// Simple log tail
Route::get('/debug-logs', function() {
    $path  = storage_path('logs/laravel.log');
    if (!file_exists($path)) return 'No log file found.';
    $lines = file($path);
    return implode('', array_slice($lines, -80));
});

// Test creating a subuser directly — shows raw Evomi API response
Route::get('/debug-create-subuser', function() {
    $apiKey  = config('services.evomi.key');
    $baseUrl = 'https://reseller.evomi.com/v2';

    // Try PUT method (documented)
    $responsePut = Illuminate\Support\Facades\Http::withoutVerifying()->withHeaders([
        'X-API-KEY' => $apiKey,
        'Accept'    => 'application/json',
    ])->put("{$baseUrl}/reseller/sub_users/create", [
        'username' => 'debug_test_' . rand(1000, 9999),
        'email'    => 'debug@test-evomi.com',
    ]);

    // Also try POST method  
    $responsePost = Illuminate\Support\Facades\Http::withoutVerifying()->withHeaders([
        'X-API-KEY' => $apiKey,
        'Accept'    => 'application/json',
    ])->post("{$baseUrl}/reseller/sub_users/create", [
        'username' => 'debug_test_' . rand(1000, 9999),
        'email'    => 'debug@test-evomi.com',
    ]);

    // Also try listing subusers to see if any exist
    $listResponse = Illuminate\Support\Facades\Http::withoutVerifying()->withHeaders([
        'X-API-KEY' => $apiKey,
        'Accept'    => 'application/json',
    ])->get("{$baseUrl}/reseller/sub_users");

    return response()->json([
        'PUT /create' => [
            'status' => $responsePut->status(),
            'body'   => $responsePut->json() ?? $responsePut->body(),
        ],
        'POST /create' => [
            'status' => $responsePost->status(),
            'body'   => $responsePost->json() ?? $responsePost->body(),
        ],
        'GET /sub_users (list)' => [
            'status' => $listResponse->status(),
            'body'   => $listResponse->json() ?? $listResponse->body(),
        ],
    ]);
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
});

// Public test route removed from bottom, moved to top.

