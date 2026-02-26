<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

header('Content-Type: text/plain');

$total = \App\Models\AutoBlogKeyword::count();
$active = \App\Models\AutoBlogKeyword::active()->count();

echo "TOTAL KEYWORDS: $total\n";
echo "ACTIVE KEYWORDS: $active\n";

if ($active > 0) {
    $kw = \App\Models\AutoBlogKeyword::active()->orderBy('last_used_at', 'asc')->first();
    echo "NEXT KEYWORD: " . $kw->keyword . " (Last used: " . ($kw->last_used_at ?: 'Never') . ")\n";
}
