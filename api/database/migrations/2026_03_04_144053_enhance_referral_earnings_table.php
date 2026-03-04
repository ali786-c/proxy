<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('referral_earnings', function (Blueprint $table) {
            $table->unsignedBigInteger('invoice_id')->nullable()->after('referred_id');
            $table->unsignedBigInteger('transaction_id')->nullable()->after('invoice_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('referral_earnings', function (Blueprint $table) {
            $table->dropColumn(['invoice_id', 'transaction_id']);
        });
    }
};
