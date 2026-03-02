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
        Schema::create('api_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('api_key_id')->nullable()->constrained('api_keys')->nullOnDelete();
            $table->string('endpoint');
            $table->string('method', 10);
            $table->integer('status_code');
            $table->longText('payload')->nullable();
            $table->longText('response')->nullable();
            $table->string('ip_address', 45);
            $table->text('user_agent')->nullable();
            $table->integer('response_time_ms')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'created_at']);
        });

        Schema::create('idempotency_keys', function (Blueprint $table) {
            $table->id();
            $table->string('idempotency_key')->unique();
            $table->string('request_hash');
            $table->json('response_data');
            $table->integer('status_code');
            $table->timestamp('expires_at')->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('api_logs');
        Schema::dropIfExists('idempotency_keys');
    }
};
