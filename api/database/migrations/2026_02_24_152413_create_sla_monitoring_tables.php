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
        Schema::create('sla_configs', function (Blueprint $table) {
            $table->id();
            $table->string('proxy_type')->unique(); // rp, mp, dc, isp
            $table->decimal('guaranteed_uptime', 5, 2)->default(99.90);
            $table->decimal('credit_per_percent', 8, 2)->default(5.00); // $5 per % below guarantee
            $table->string('measurement_window')->default('monthly'); // daily, weekly, monthly
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('uptime_records', function (Blueprint $table) {
            $table->id();
            $table->string('proxy_type');
            $table->string('status'); // up, degraded, down
            $table->integer('response_time_ms')->nullable();
            $table->string('region')->nullable();
            $table->timestamp('checked_at');
            $table->timestamps();

            $table->index(['proxy_type', 'checked_at']);
        });

        Schema::create('sla_credits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('proxy_type');
            $table->decimal('guaranteed_uptime', 5, 2);
            $table->decimal('actual_uptime', 5, 2);
            $table->decimal('credit_amount', 15, 2);
            $table->string('status')->default('pending'); // pending, approved, applied, rejected
            $table->text('reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sla_credits');
        Schema::dropIfExists('uptime_records');
        Schema::dropIfExists('sla_configs');
    }
};
