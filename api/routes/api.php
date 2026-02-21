<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [\App\Http\Controllers\AuthController::class, 'register']);
Route::post('/login', [\App\Http\Controllers\AuthController::class, 'login']);

Route::middleware(['auth:sanctum', 'banned'])->group(function () {
    Route::get('/me', [\App\Http\Controllers\AuthController::class, 'me']);
    Route::post('/logout', [\App\Http\Controllers\AuthController::class, 'logout']);

    // Proxy Routes
    Route::post('/proxies/generate', [\App\Http\Controllers\ProxyController::class, 'generate']);
    Route::get('/proxies', [\App\Http\Controllers\ProxyController::class, 'list']);

    // Billing Routes
    Route::post('/billing/checkout', [\App\Http\Controllers\BillingController::class, 'createCheckout']);
    Route::get('/invoices', [\App\Http\Controllers\BillingController::class, 'invoices']);

    // Support Routes
    Route::get('/support/tickets', [\App\Http\Controllers\SupportController::class, 'index']);
    Route::post('/support/tickets', [\App\Http\Controllers\SupportController::class, 'store']);
    Route::get('/support/tickets/{id}', [\App\Http\Controllers\SupportController::class, 'show']);

    // Referral Routes
    Route::get('/referrals', [\App\Http\Controllers\ReferralController::class, 'index']);

    // Product Routes
    Route::get('/products', [\App\Http\Controllers\ProductController::class, 'index']);

    // API Key Routes
    Route::get('/api_keys', [\App\Http\Controllers\ApiKeyController::class, 'index']);
    Route::post('/api_keys', [\App\Http\Controllers\ApiKeyController::class, 'store']);
    Route::delete('/api_keys/{id}', [\App\Http\Controllers\ApiKeyController::class, 'destroy']);
});

// Public Billing Route (Webhook)
Route::post('/webhook/stripe', [\App\Http\Controllers\BillingController::class, 'handleWebhook']);

// Admin Routes
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/users', [\App\Http\Controllers\AdminController::class, 'users']);
    Route::post('/users/balance', [\App\Http\Controllers\AdminController::class, 'updateBalance']);
    Route::post('/users/ban', [\App\Http\Controllers\AdminController::class, 'banUser']);
    Route::get('/stats', [\App\Http\Controllers\AdminController::class, 'stats']);
    Route::get('/logs', [\App\Http\Controllers\AdminController::class, 'logs']);
});
