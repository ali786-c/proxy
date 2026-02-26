<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

use App\Models\Setting;
use App\Models\AutoBlogKeyword;

header('Content-Type: application/json');

echo json_encode([
    'db_gemini_api_key' => Setting::getValue('gemini_api_key'),
    'env_gemini_api_key' => env('GEMINI_API_KEY'),
    'config_gemini_api_key' => config('services.gemini.key'),
    'index_response_logic' => [
        'gemini_api_key' => Setting::getValue('gemini_api_key') ?: config('services.gemini.key', ''),
    ]
], JSON_PRETTY_PRINT);
