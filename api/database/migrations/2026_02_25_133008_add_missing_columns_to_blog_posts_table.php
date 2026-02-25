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
            if (!Schema::hasColumn('blog_posts', 'excerpt')) {
                $table->text('excerpt')->nullable()->after('slug');
            }
            if (!Schema::hasColumn('blog_posts', 'category')) {
                $table->string('category')->nullable()->after('excerpt');
            }
            if (!Schema::hasColumn('blog_posts', 'tags')) {
                $table->json('tags')->nullable()->after('category');
            }
            if (!Schema::hasColumn('blog_posts', 'reading_time_min')) {
                $table->integer('reading_time_min')->nullable()->after('tags');
            }
            if (!Schema::hasColumn('blog_posts', 'meta_title')) {
                $table->string('meta_title')->nullable()->after('is_draft');
            }
            if (!Schema::hasColumn('blog_posts', 'meta_description')) {
                $table->text('meta_description')->nullable()->after('meta_title');
            }
            if (!Schema::hasColumn('blog_posts', 'meta_keywords')) {
                $table->string('meta_keywords')->nullable()->after('meta_description');
            }
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
