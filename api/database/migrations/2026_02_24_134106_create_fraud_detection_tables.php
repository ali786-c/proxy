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
        Schema::create('login_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->string('geo_country')->nullable();
            $table->string('geo_city')->nullable();
            $table->text('user_agent')->nullable();
            $table->boolean('success')->default(true);
            $table->timestamps();
        });

        Schema::create('fraud_signals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('signal_type'); // login_anomaly, usage_spike, impossible_travel
            $table->string('severity');    // low, medium, high, critical
            $table->text('description')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('geo_country')->nullable();
            $table->string('geo_city')->nullable();
            $table->boolean('is_resolved')->default(false);
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });

        Schema::create('user_risk_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->integer('risk_score')->default(0);
            $table->string('risk_level')->default('low'); // low, medium, high
            $table->json('factors')->nullable(); // JSON array of reasons
            $table->timestamp('last_calculated_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_risk_scores');
        Schema::dropIfExists('fraud_signals');
        Schema::dropIfExists('login_history');
    }
};
