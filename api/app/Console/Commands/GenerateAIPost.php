<?php

namespace App\Console\Commands;

use App\Models\AutoBlogKeyword;
use App\Models\BlogPost;
use App\Models\Setting;
use App\Services\GeminiService;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class GenerateAIPost extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'blog:generate-ai';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate a blog post using Gemini AI based on active keywords';

    /**
     * Execute the console command.
     */
    public function handle(GeminiService $gemini)
    {
        $this->info('Starting AI blog generation...');

        if (Setting::getValue('auto_blog_enabled', '0') !== '1') {
            $this->warn('Auto-blogging is currently disabled in settings.');
            return;
        }

        $keywordObj = AutoBlogKeyword::active()
            ->orderBy('last_used_at', 'asc')
            ->first();

        if (!$keywordObj) {
            $this->error('No active keywords found in the database.');
            return;
        }

        $this->info("Generating post for keyword: {$keywordObj->keyword}");

        try {
            $rawResponse = $gemini->generateBlogPost($keywordObj->keyword);
            
            // Clean up potentially returned markdown code blocks and parse JSON
            $cleanResponse = preg_replace('/^```json\s*|```$/m', '', $rawResponse);
            $data = json_decode(trim($cleanResponse), true);

            if (!$data || !isset($data['title'], $data['content'], $data['excerpt'])) {
                throw new \Exception('Invalid or missing JSON fields in AI response.');
            }

            $post = BlogPost::create([
                'title'     => $data['title'],
                'slug'      => Str::slug($data['title']) . '-' . Str::random(5),
                'content'   => $data['content'],
                'excerpt'   => $data['excerpt'],
                'category'  => $keywordObj->category ?? 'General',
                'is_draft'  => false,
                'published_at' => now(),
                'author_id' => null,
            ]);

            $keywordObj->update(['last_used_at' => now()]);

            $this->info("Success! Blog post published: {$post->title}");
            
        } catch (\Exception $e) {
            $this->error("AI Generation Failed: " . $e->getMessage());
        }
    }
}
