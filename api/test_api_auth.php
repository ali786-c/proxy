<?php
// Manual Test Script for API Key Auth
require_once __DIR__ . '/vendor/autoload.php';

use App\Models\User;
use App\Models\ApiKey;
use Illuminate\Support\Str;

// Boot Laravel (Simple approach for script)
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

echo "--- Phase 1 & 2 Test: API Authentication ---\n";

// 1. Setup a test key
$user = User::first(); // Use first user for testing
if (!$user) {
    die("No users found in database.\n");
}

$plainKey = 'uproxy_test_' . Str::random(10);
$hash = hash('sha256', $plainKey);

$apiKey = ApiKey::create([
    'user_id' => $user->id,
    'key_name' => 'Testing Key',
    'key_hash' => $hash,
    'abilities' => ['*'],
    'is_active' => true
]);

echo "Created test key: $plainKey (Hash: $hash)\n";

// 2. Mock a request to the /api/v1/me/balance endpoint
echo "Mocking request with X-API-KEY header...\n";

$response = $app->handle(
    Illuminate\Http\Request::create('/api/v1/me/balance', 'GET', [], [], [], [
        'HTTP_X-API-KEY' => $plainKey,
        'HTTP_ACCEPT' => 'application/json'
    ])
);

echo "Response Status: " . $response->getStatusCode() . "\n";
echo "Response Body: " . $response->getContent() . "\n";

if ($response->getStatusCode() === 200 && strpos($response->getContent(), '"success":true') !== false) {
    echo "✅ TEST PASSED: Authentication successful.\n";
} else {
    echo "❌ TEST FAILED.\n";
}

// Clean up
$apiKey->delete();
echo "Cleaned up test key.\n";
