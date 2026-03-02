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
        Schema::table('api_keys', function (Blueprint $table) {
            $table->renameColumn('api_key', 'key_hash');
            $table->json('abilities')->nullable()->after('key_hash');
            $table->timestamp('last_used_at')->nullable()->after('abilities');
        });

        // Change the column type/length if needed (renameColumn doesn't change type in all DBs)
        Schema::table('api_keys', function (Blueprint $table) {
            $table->string('key_hash', 64)->change(); // SHA-256 hash is 64 chars
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('api_keys', function (Blueprint $table) {
            $table->renameColumn('key_hash', 'api_key');
            $table->dropColumn(['abilities', 'last_used_at']);
        });
    }
};
