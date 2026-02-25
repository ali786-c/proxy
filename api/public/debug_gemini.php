<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(Illuminate\Http\Request::capture());

use App\Models\Setting;
use Illuminate\Support\Facades\Http;

header('Content-Type: application/json');

try {
    $apiKey = Setting::getValue('gemini_api_key') ?: env('GEMINI_API_KEY');
    $model = Setting::getValue('gemini_model') ?: 'gemini-2.5-flash';

    if (!$apiKey) {
        echo json_encode(['error' => 'No API Key found in DB or .env']);
        exit;
    }

    $url = "https://generativelanguage.googleapis.com/v1/models/{$model}:generateContent?key={$apiKey}";
    
    echo "Testing Connection to: https://generativelanguage.googleapis.com/v1/models/{$model}...\n\n";

    $response = Http::withoutVerifying()->timeout(30)->post($url, [
        'contents' => [
            ['parts' => [['text' => 'Hello, reply with "OK" if you can hear me.']]]
        ]
    ]);

    echo "Status: " . $response->status() . "\n";
    echo "Body: " . $response->body() . "\n";

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
