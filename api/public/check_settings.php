<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

use App\Models\Setting;

header('Content-Type: text/plain');

$dbKey = Setting::where('key', 'gemini_api_key')->first()?->value;
$envKey = env('GEMINI_API_KEY');
$configKey = config('services.gemini.key');

echo "DB Key: [" . $dbKey . "] (Length: " . strlen($dbKey ?? '') . ")\n";
echo "ENV Key: [" . $envKey . "] (Length: " . strlen($envKey ?? '') . ")\n";
echo "Config Key: [" . $configKey . "] (Length: " . strlen($configKey ?? '') . ")\n";

echo "\nIndex Logic Test:\n";
$dbApiKeyVal = Setting::getValue('gemini_api_key') ?? '';
echo "Setting::getValue: [" . $dbApiKeyVal . "]\n";
$starts = str_starts_with($dbApiKeyVal, 'AIza') ? 'YES' : 'NO';
echo "Starts with AIza: " . $starts . "\n";
$finalKey = ($starts === 'YES') ? $dbApiKeyVal : config('services.gemini.key', '');
echo "Final Key to UI: [" . $finalKey . "] (Length: " . strlen($finalKey ?? '') . ")\n";
