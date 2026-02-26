<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

header('Content-Type: text/plain');

$key = \App\Models\Setting::where('key', 'gemini_api_key')->first();

if (!$key) {
    echo "NO KEY FOUND IN DB\n";
} else {
    echo "KEY FOUND: [" . $key->value . "]\n";
    echo "LENGTH: " . strlen($key->value) . "\n";
    echo "STARTS WITH AIza: " . (str_starts_with($key->value, 'AIza') ? "YES" : "NO") . "\n";
    echo "HEX: " . bin2hex($key->value) . "\n";
}

echo "\nCONFIG services.gemini.key: [" . config('services.gemini.key') . "]\n";
echo "CONFIG HEX: " . bin2hex(config('services.gemini.key')) . "\n";
