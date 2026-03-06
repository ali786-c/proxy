<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Setting;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
    `

        // Insert only if the key doesn't exist to prevent overwriting user-configured settings
        foreach ($defaults as $key => $value) {
            Setting::firstOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Not dropping these defaults on rollback to prevent accidental data loss.
    }
};
