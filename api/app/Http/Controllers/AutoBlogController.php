<?php

namespace App\Http\Controllers;

use App\Models\AutoBlogKeyword;
use App\Models\BlogPost;
use App\Models\Setting;
use App\Services\GeminiService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AutoBlogController extends Controller
{
    /**
     * Admin: List keywords and settings.
     */
    public function index()
    {
        return response()->json([
            'keywords' => AutoBlogKeyword::latest()->get(),
            'settings' => [
                'gemini_api_key' => Setting::getValue('gemini_api_key', ''),
                'gemini_model'   => Setting::getValue('gemini_model', 'gemini-1.5-flash'),
                'auto_posting_enabled' => Setting::getValue('auto_blog_enabled', '0') === '1',
            ]
        ]);
    }

    /**
     * Admin: Add a new keyword.
     */
    public function storeKeyword(Request $request)
    {
        $request->validate([
            'keyword' => 'required|string|unique:auto_blog_keywords,keyword|max:255',
            'category' => 'nullable|string|max:100',
        ]);

        $keyword = AutoBlogKeyword::create($request->only('keyword', 'category'));

        return response()->json($keyword, 201);
    }

    /**
     * Admin: Delete a keyword.
     */
    public function destroyKeyword($id)
    {
        $keyword = AutoBlogKeyword::findOrFail($id);
        $keyword->delete();

        return response()->json(['message' => 'Keyword deleted.']);
    }

    /**
     * Admin: Update Gemini settings.
     */
    public function updateSettings(Request $request)
    {
        $request->validate([
            'gemini_api_key' => 'nullable|string',
            'gemini_model'   => 'nullable|string',
            'auto_blog_enabled' => 'nullable|boolean',
        ]);

        if ($request->has('gemini_api_key')) {
            Setting::updateOrCreate(['key' => 'gemini_api_key'], ['value' => $request->gemini_api_key]);
        }

        if ($request->has('gemini_model')) {
            Setting::updateOrCreate(['key' => 'gemini_model'], ['value' => $request->gemini_model]);
        }

        if ($request->has('auto_blog_enabled')) {
            Setting::updateOrCreate(['key' => 'auto_blog_enabled'], ['value' => $request->auto_blog_enabled ? '1' : '0']);
        }

        return response()->json(['message' => 'Settings updated.']);
    }

    /**
     * Admin: Manually trigger a blog post generation.
     */
    public function trigger(Request $request, GeminiService $gemini)
    {
        $keywordObj = null;

        if ($request->has('keyword_id')) {
            $keywordObj = AutoBlogKeyword::findOrFail($request->keyword_id);
        } else {
            // Pick least recently used active keyword
            $keywordObj = AutoBlogKeyword::active()
                ->orderBy('last_used_at', 'asc')
                ->first();
        }

        if (!$keywordObj) {
            return response()->json(['message' => 'No active keywords found.'], 400);
        }

        try {
            $rawResponse = $gemini->generateBlogPost($keywordObj->keyword);

            // Robustly extract JSON object from the response
            if (preg_match('/\{.*\}/s', $rawResponse, $matches)) {
                $data = json_decode($matches[0], true);
            } else {
                $data = null;
            }

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
                'author_id' => null, // System post
            ]);

            $keywordObj->update(['last_used_at' => now()]);

            return response()->json([
                'message' => 'AI blog post generated and published successfully!',
                'post' => $post
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'AI Generation Failed: ' . $e->getMessage()], 500);
        }
    }
}
