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

    // REAL BLOG PROMPT TEST
    $prompt = "Act as a technical writer. Write a blog post about 'Benefits of proxies' in JSON format with fields: title, excerpt, content.";

    $response = Http::withoutVerifying()->timeout(60)->post($url, [
        'contents' => [
            ['parts' => [['text' => $prompt]]]
        ]
    ]);

    echo "Status: " . $response->status() . "\n";
    $rawText = $response->json()['candidates'][0]['content']['parts'][0]['text'] ?? 'NO TEXT';
    echo "Raw Text Snippet: " . substr($rawText, 0, 200) . "...\n\n";

    if (preg_match('/\{.*\}/s', $rawText, $matches)) {
        $data = json_decode($matches[0], true);
        echo "JSON Parse: " . ($data ? "SUCCESS" : "FAILED (Error: " . json_last_error_msg() . ")") . "\n";
        if ($data) {
            echo "Fields found: " . implode(', ', array_keys($data)) . "\n";
        }
    } else {
        echo "JSON Parse: FAILED (No JSON object found in response)\n";
    }

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
