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
        Schema::table('blog_posts', function (Blueprint $table) {
            $table->string('excerpt')->nullable()->after('slug');
            $table->string('category')->nullable()->after('excerpt');
            $table->json('tags')->nullable()->after('category');
            $table->integer('reading_time_min')->default(5)->after('tags');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('blog_posts', function (Blueprint $table) {
            $table->dropColumn(['excerpt', 'category', 'tags', 'reading_time_min']);
        });
    }
};
