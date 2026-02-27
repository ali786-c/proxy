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
        Schema::table('pending_crypto_transactions', function (Blueprint $table) {
            $table->string('binance_id')->nullable()->after('amount');
            $table->string('proof_path')->nullable()->after('binance_id');
            $table->string('txid')->nullable()->change();
            $table->dropUnique('pending_crypto_transactions_txid_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pending_crypto_transactions', function (Blueprint $table) {
            $table->unique('txid');
            $table->string('txid')->nullable(false)->change();
            $table->dropColumn(['binance_id', 'proof_path']);
        });
    }
};
