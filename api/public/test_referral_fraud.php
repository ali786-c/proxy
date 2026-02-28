<?php

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle($request = Illuminate\Http\Request::capture());

// SETUP: Create a "Referrer" with a specific IP
$referrer = User::create([
    'name' => 'Referrer User',
    'email' => 'referrer_' . Str::random(5) . '@example.com',
    'password' => Hash::make('password123'),
    'referral_code' => 'TEST-REF-' . Str::random(4),
    'signup_ip' => '127.0.0.1' // Mocking local IP
]);

echo "Created Referrer: " . $referrer->email . " with IP: " . $referrer->signup_ip . "<br>";

// TEST: Register a "Referred" user with the SAME IP
$request = new Request([
    'name' => 'Referred Fraud',
    'email' => 'fraud_' . Str::random(5) . '@example.com',
    'password' => 'password123',
    'referral_code' => $referrer->referral_code
]);

// Mock the IP
$request->server->set('REMOTE_ADDR', '127.0.0.1');

echo "Attempting to register new user with same IP: " . $request->ip() . "<br>";

$controller = new AuthController();
$controller->register($request);

// CHECK: Verify if referral record exists
$referralCount = \App\Models\Referral::where('referrer_id', $referrer->id)->count();

if ($referralCount === 0) {
    echo "✅ SUCCESS: Self-referral was blocked correctly due to matching IP.";
} else {
    echo "❌ FAILURE: Referral record was created despite matching IP.";
}
