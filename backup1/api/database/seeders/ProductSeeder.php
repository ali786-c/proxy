<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Product::create([
            'name' => 'Residential Proxy (GB)',
            'type' => 'rp',
            'price' => 5.00,
            'evomi_product_id' => 'reseller_rp_plan',
        ]);

        \App\Models\Product::create([
            'name' => 'Mobile Proxy (GB)',
            'type' => 'mp',
            'price' => 12.00,
            'evomi_product_id' => 'reseller_mp_plan',
        ]);
    }
}
