<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Switch SupportedCurrency exchange rates to EUR-based.
 *
 * Previous system: exchange_rate = "1 USD = X units of currency"
 * New system:      exchange_rate = "1 EUR = X units of currency"
 *
 * Conversion logic:
 *   If you have 1 USD = R_usd units, and 1 USD = 0.92 EUR:
 *   Then 1 EUR = R_usd / 0.92 units
 *
 * EUR itself is now the base: exchange_rate = 1.0000
 */
return new class extends Migration
{
    public function up(): void
    {
        // Standard EUR-based rates (1 EUR = X units)
        // These match real-world approximate rates as of early 2026
        $eurBasedRates = [
            'USD' => 1.0900,   // 1 EUR ≈ 1.09 USD
            'EUR' => 1.0000,   // BASE
            'GBP' => 0.8500,   // 1 EUR ≈ 0.85 GBP
            'PKR' => 303.0000, // 1 EUR ≈ 303 PKR
            'INR' => 90.2500,  // 1 EUR ≈ 90.25 INR
            'AED' => 4.0000,   // 1 EUR ≈ 4.00 AED
        ];

        foreach ($eurBasedRates as $code => $rate) {
            DB::table('supported_currencies')
                ->where('code', $code)
                ->update(['exchange_rate' => $rate]);
        }

        // If EUR doesn't exist yet, insert it
        if (!DB::table('supported_currencies')->where('code', 'EUR')->exists()) {
            DB::table('supported_currencies')->insert([
                'code'          => 'EUR',
                'name'          => 'Euro',
                'symbol'        => '€',
                'exchange_rate' => 1.0000,
                'is_active'     => 1,
            ]);
        }
    }

    public function down(): void
    {
        // Revert to USD-based rates (1 USD = X units)
        $usdBasedRates = [
            'USD' => 1.0000,
            'EUR' => 0.9200,
            'GBP' => 0.7900,
            'PKR' => 278.5000,
            'INR' => 83.0000,
            'AED' => 3.6700,
        ];

        foreach ($usdBasedRates as $code => $rate) {
            DB::table('supported_currencies')
                ->where('code', $code)
                ->update(['exchange_rate' => $rate]);
        }
    }
};
