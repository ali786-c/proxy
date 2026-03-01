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
        Schema::create('fulfillment_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('event_id')->index(); // Stripe session ID or Cryptomus UUID
            $table->string('provider'); // stripe, cryptomus
            $table->string('type');     // direct_purchase, topup
            $table->integer('stage')->default(1); // 1, 2, 3
            $table->string('status')->default('processing'); // processing, success, failed
            $table->text('error_message')->nullable();
            $table->json('details')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fulfillment_logs');
    }
};
