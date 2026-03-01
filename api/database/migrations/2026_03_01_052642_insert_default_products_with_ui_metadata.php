<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Product;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add default products with full UI metadata matching exactly user names
        $products = [
            [
                'name' => 'Residential',
                'type' => 'rp',
                'price' => 0.99,
                'evomi_product_id' => 'core_residential_1',
                'is_active' => true,
                'tagline' => '100% ethical residential proxies',
                'features' => [
                    'Unbeatable Pricing at €0.99/GB',
                    '50M+ real residential IPs from around the world',
                    'Free IP rotation, sticky sessions, and geo-targeting',
                    '99.9% uptime with outstanding 24/7 support'
                ]
            ],
            [
                'name' => 'Datacenter',
                'type' => 'dc',
                'price' => 0.79,
                'evomi_product_id' => 'datacenter_proxy_4',
                'is_active' => true,
                'tagline' => 'High-Speed Affordable Datacenter IPs',
                'features' => [
                    '200ms response time',
                    'Affordable for high-performance scraper',
                    '500k+ IPs in 10k+ datacenters worldwide',
                    '99.9% uptime with outstanding 24/7 support'
                ]
            ],
            [
                'name' => 'Mobile',
                'type' => 'mp',
                'price' => 2.95,
                'evomi_product_id' => 'mobile_proxy_5',
                'is_active' => true,
                'tagline' => 'Real human phone IPs',
                'features' => [
                    'Real human 3G/4G/5G IPs from 195+ countries',
                    'No phone farms, no datacenter IPs, no worries',
                    '99.9% uptime with outstanding 24/7 support',
                    'Unlimited Concurrent Sessions'
                ]
            ],
            [
                'name' => 'Datacenter IPv6',
                'type' => 'dc_ipv6',
                'price' => 0.59,
                'evomi_product_id' => 'datacenter_ipv6_6',
                'is_active' => true,
                'tagline' => 'High-Performance IPv6 IPs',
                'features' => [
                    'Unblocked almost everywhere',
                    'Ultra-Fast Network configuration',
                    '500k+ IPv6 IPs in 10k+ datacenters worldwide',
                    '99.9% uptime with outstanding 24/7 support'
                ]
            ],
            [
                'name' => 'Datacenter (Unmetered)',
                'type' => 'dc_unmetered',
                'price' => 15.00,
                'evomi_product_id' => 'datacenter_unmetered_7',
                'is_active' => true,
                'tagline' => 'Unlimited Bandwidth Scraping IPs',
                'features' => [
                    'No data transfer limits',
                    'Monthly billing, unmetered usage',
                    'Optimized for large-scale crawling',
                    '99.9% uptime with outstanding 24/7 support'
                ]
            ],
        ];

        foreach ($products as $prodData) {
            Product::updateOrCreate(
                ['evomi_product_id' => $prodData['evomi_product_id']],
                $prodData
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $ids = [
            'core_residential_1',
            'datacenter_proxy_4',
            'mobile_proxy_5',
            'datacenter_ipv6_6',
            'datacenter_unmetered_7'
        ];
        Product::whereIn('evomi_product_id', $ids)->delete();
    }
};
