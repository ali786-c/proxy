<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Product;

echo "--- PRODUCT DIAGNOSTIC ---\n";
$products = Product::all();
foreach ($products as $p) {
    echo "ID: {$p->id} | Name: {$p->name} | Type: {$p->type}\n";
    echo "  Features: " . (is_null($p->features) ? "NULL" : json_encode($p->features)) . "\n";
    echo "  Volume Discounts: " . (is_null($p->volume_discounts) ? "NULL" : json_encode($p->volume_discounts)) . "\n";
    echo "  Is Active: " . ($p->is_active ? "YES" : "NO") . "\n";
    echo "--------------------------\n";
}
