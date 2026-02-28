<?php
use App\Models\Setting;

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->handle(Illuminate\Http\Request::capture());

header('Content-Type: application/json');

$settings = [
    'referral_system_enabled' => '1',
    'referral_commission_percentage' => '10',
    'referral_hold_days' => '14',
];

$results = [];
foreach ($settings as $key => $value) {
    if (!Setting::where('key', $key)->exists()) {
        Setting::create(['key' => $key, 'value' => $value]);
        $results[$key] = "Created with value: $value";
    } else {
        $results[$key] = "Already exists";
    }
}

echo json_encode(['status' => 'success', 'results' => $results], JSON_PRETTY_PRINT);
