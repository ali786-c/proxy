<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

header('Content-Type: text/plain');

$columns = DB::select('SHOW COLUMNS FROM blog_posts');
foreach ($columns as $column) {
    echo "{$column->Field} - {$column->Type}\n";
}
