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
            $table->text('excerpt')->nullable()->after('slug');
            $table->string('category')->nullable()->after('excerpt');
            $table->json('tags')->nullable()->after('category');
            $table->integer('reading_time_min')->nullable()->after('tags');
            $table->string('meta_title')->nullable()->after('is_draft');
            $table->text('meta_description')->nullable()->after('meta_title');
            $table->string('meta_keywords')->nullable()->after('meta_description');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('blog_posts', function (Blueprint $table) {
            $table->dropColumn(['excerpt', 'category', 'tags', 'reading_time_min', 'meta_title', 'meta_description', 'meta_keywords']);
        });
    }
};
