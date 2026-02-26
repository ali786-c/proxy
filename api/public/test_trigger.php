<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

header('Content-Type: text/plain');

try {
    echo "Resolving GeminiService...\n";
    $gemini = app(App\Services\GeminiService::class);
    
    echo "Finding keyword...\n";
    $keywordObj = App\Models\AutoBlogKeyword::active()->first();
    
    if (!$keywordObj) {
        die("No active keywords\n");
    }
    
    echo "Generating blog for keyword: " . $keywordObj->keyword . "\n";
    
    $controller = new App\Http\Controllers\AutoBlogController();
    $request = new Illuminate\Http\Request();
    
    $response = $controller->trigger($request, $gemini);
    
    echo "RESPONSE STATUS: " . $response->getStatusCode() . "\n";
    echo "RESPONSE CONTENT: " . json_encode($response->getData(), JSON_PRETTY_PRINT) . "\n";

} catch (\Throwable $e) {
    echo "FATAL ERROR: " . $e->getMessage() . "\n";
    echo "TRACE:\n" . $e->getTraceAsString() . "\n";
}
