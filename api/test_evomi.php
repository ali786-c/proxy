<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$evomiApiKey = config('services.evomi.key');

$ch = curl_init('https://reseller.evomi.com/v2/reseller/proxy_settings');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json', 
    'X-API-KEY: ' . $evomiApiKey
]);
$response = curl_exec($ch);
curl_close($ch);

file_put_contents('evomi_data.json', $response);
echo "Data saved to evomi_data.json";
