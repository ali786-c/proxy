<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

header('Content-Type: text/plain');

try {
    $columns = DB::select("DESCRIBE blog_posts");
    foreach ($columns as $column) {
        if ($column->Field === 'author_id') {
            echo "Field: " . $column->Field . "\n";
            echo "Type: " . $column->Type . "\n";
            echo "Null: " . $column->Null . "\n";
            echo "Key: " . $column->Key . "\n";
        }
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
