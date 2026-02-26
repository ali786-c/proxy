<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

header('Content-Type: text/plain');

echo "ENV GEMINI_API_KEY: [" . env('GEMINI_API_KEY') . "]\n";
echo "CONFIG services.gemini.key: [" . config('services.gemini.key') . "]\n";
echo "DB gemini_api_key: [" . \App\Models\Setting::getValue('gemini_api_key') . "]\n";

echo "DB gemini_model: [" . \App\Models\Setting::getValue('gemini_model') . "]\n";
echo "CONFIG services.gemini.model: [" . config('services.gemini.model') . "]\n";
