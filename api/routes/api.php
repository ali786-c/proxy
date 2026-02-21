<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

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
    Route::get('/profile', [\App\Http\Controllers\AuthController::class, 'profile']);
    Route::get('/stats',   [\App\Http\Controllers\AuthController::class, 'stats']);

    // Proxy Routes
    Route::post('/proxies/generate', [\App\Http\Controllers\ProxyController::class, 'generate']);
    Route::get('/proxies',           [\App\Http\Controllers\ProxyController::class, 'list']);

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

// Temporary Manual Test Route for Phase 2 (Moved outside admin for easier access)
Route::middleware(['auth:sanctum', 'banned'])->group(function () {
    Route::get('/test-evomi', function() {
        return [
            'step_1_setup' => 'Visit devwithguru.site/api/subusers/setup (POST) to link account',
            'step_2_status' => 'Visit devwithguru.site/api/subusers/status (GET) to see usage',
            'api_key_configured' => config('services.evomi.key') !== 'your_reseller_api_key_here',
            'user' => auth()->user()->only(['id', 'email', 'evomi_username'])
        ];
    });
});
