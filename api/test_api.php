<?php

$apiKey = 'uproxy_admin_secret_2026';
$baseUrl = 'http://localhost/api/v1';

function callApi($endpoint, $method = 'GET', $data = null, $idKey = null) {
    global $apiKey, $baseUrl;
    
    $ch = curl_init($baseUrl . $endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $headers = [
        "X-API-KEY: $apiKey",
        "Accept: application/json",
        "Content-Type: application/json"
    ];
    if ($idKey) {
        $headers[] = "Idempotency-Key: $idKey";
    }

    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }

    $response = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        'status' => $status,
        'body' => json_decode($response, true)
    ];
}

echo "--- Unified API Test Script ---\n\n";

// 1. Check Balance
echo "[1] Checking Balance...\n";
$balance = callApi('/me/balance');
if ($balance['status'] === 200) {
    echo "Current Balance: " . $balance['body']['data']['balance'] . " " . $balance['body']['data']['currency'] . "\n";
} else {
    echo "Failed to check balance. Status: " . $balance['status'] . "\n";
    print_r($balance['body']);
}

// 2. List Products
echo "\n[2] Fetching Products...\n";
$products = callApi('/products');
if ($products['status'] === 200) {
    echo "Found " . count($products['body']['data'] ?? []) . " products.\n";
    if (count($products['body']['data']) > 0) {
        $p = $products['body']['data'][0];
        echo "Example Product: ID " . $p['id'] . " - " . $p['name'] . " (" . $p['price'] . " EUR)\n";
    }
}

// 3. Generate Proxies
echo "\n[3] Generating 2 Proxies (Purchase Request)...\n";
$idempotencyKey = 'test-batch-' . uniqid();
$genResponse = callApi('/proxies/generate', 'POST', [
    'product_id' => 1,
    'quantity' => 2,
    'country' => 'US'
], $idempotencyKey);

if ($genResponse['status'] === 200) {
    echo "Status: 200 OK\n";
    echo "Order ID: " . ($genResponse['body']['data']['order_id'] ?? 'N/A') . "\n";
    echo "Proxies Count: " . count($genResponse['body']['data']['proxies'] ?? []) . "\n";
    echo "New Balance: " . ($genResponse['body']['data']['balance_remaining'] ?? 'N/A') . " EUR\n";

    // 4. Test Idempotency
    echo "\n[4] Testing Idempotency (Sending same key again)...\n";
    $idemResponse = callApi('/proxies/generate', 'POST', [
        'product_id' => 1,
        'quantity' => 2,
        'country' => 'US'
    ], $idempotencyKey);

    echo "Status: " . $idemResponse['status'] . "\n";
    if ($genResponse['body'] == $idemResponse['body']) {
        echo "SUCCESS: Idempotency works! Responses match exactly.\n";
    } else {
        echo "WARNING: Idempotency check failed. Responses differ.\n";
    }
} else {
    echo "Failed to generate proxies. Status: " . $genResponse['status'] . "\n";
    print_r($genResponse['body']);
}

// 5. Check Logs
echo "\n[5] Checking Audit Logs...\n";
$logs = callApi('/logs');
if ($logs['status'] === 200) {
    echo "Successfully fetched " . count($logs['body']['data'] ?? []) . " log entries.\n";
    if (count($logs['body']['data']) > 0) {
        $latest = $logs['body']['data'][0];
        echo "Latest activity: " . $latest['method'] . " " . $latest['endpoint'] . " (" . $latest['status_code'] . ")\n";
    }
}

echo "\n--- All Tests Done ---\n";
