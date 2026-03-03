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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('evomi_username')->nullable()->after('product_id');
            $table->json('evomi_keys')->nullable()->after('evomi_username');
            $table->decimal('bandwidth_total', 15, 2)->default(0)->after('evomi_keys'); // In MB
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['evomi_username', 'evomi_keys', 'bandwidth_total']);
        });
    }
};
