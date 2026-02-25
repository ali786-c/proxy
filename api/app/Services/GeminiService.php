<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    protected $apiKey;
    protected $model;

    public function __construct()
    {
        $this->apiKey = env('GEMINI_API_KEY');
        $this->model = 'gemini-2.0-flash';
    }

    /**
     * Generate blog post content using Gemini AI.
     */
    public function generateBlogPost(string $keyword)
    {
        if (!$this->apiKey) {
            throw new \Exception('Gemini API key is not configured in .env');
        }

        $url = "https://generativelanguage.googleapis.com/v1/models/{$this->model}:generateContent?key={$this->apiKey}";

        $prompt = $this->buildPrompt($keyword);

        $response = Http::withoutVerifying()->post($url, [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.7,
                'maxOutputTokens' => 2048,
            ]
        ]);

        if ($response->failed()) {
            Log::error('Gemini API Error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \Exception('Failed to generate content from Gemini AI. Body: ' . $response->body());
        }

        $result = $response->json();
        
        try {
            return $result['candidates'][0]['content']['parts'][0]['text'];
        } catch (\Exception $e) {
            Log::error('Gemini Response Parsing Error', [
                'error' => $e->getMessage(),
                'response' => $result
            ]);
            throw new \Exception('Failed to parse Gemini AI response.');
        }
    }

    /**
     * Build a structured prompt for consistent blog generation.
     */
    protected function buildPrompt(string $keyword): string
    {
        return <<<PROMPT
Act as a professional technical writer and SEO expert for a global proxy provider.
Your goal is to write a high-quality, engaging, and professional blog post about: "{$keyword}".

REQUIREMENTS:
1. Tone: Professional, authoritative, and helpful.
2. Length: Approximately 800-1200 words.
3. Formatting: Use clean HTML only (<h2>, <h3>, <p>, <ul>, <li>, <strong>).
4. Structure:
   - Introduction (hook/overview)
   - Key Features or Core Concepts (H2)
   - Use Cases or Benefits (H2)
   - Practical Tips or "How it Works" (H2)
   - Conclusion with a subtle call to action.

OUTPUT FORMAT (JSON):
{
  "title": "A catchy SEO-optimized title",
  "excerpt": "A brief 2-sentence summary for the listing page",
  "content": "The full HTML body content (starting directly with <h2> or <p>, no <h1> allowed)"
}

Do not include any other text except the JSON object.
PROMPT;
    }
}
