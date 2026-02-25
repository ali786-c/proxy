<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    /**
     * Public: List all published posts
     */
    public function publicIndex()
    {
        $posts = BlogPost::published()
            ->with('author:id,name')
            ->latest('published_at')
            ->get();

        return response()->json($posts);
    }

    /**
     * Public: Show a single published post
     */
    public function show($slug)
    {
        $post = BlogPost::published()
            ->with('author:id,name')
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json($post);
    }

    /**
     * Admin: List all posts (including drafts)
     */
    public function index()
    {
        $posts = BlogPost::with('author:id,name')
            ->latest()
            ->get();

        return response()->json($posts);
    }

    /**
     * Admin: Store a new post
     */
    public function store(Request $request)
    {
        $request->validate([
            'title'   => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string',
            'category' => 'nullable|string',
            'tags'    => 'nullable|array',
            'image_url' => 'nullable|string',
            'reading_time_min' => 'nullable|integer',
        ]);

        $post = BlogPost::create([
            'title'     => $request->title,
            'slug'      => Str::slug($request->title) . '-' . Str::random(5),
            'content'   => $request->content,
            'excerpt'   => $request->excerpt,
            'category'  => $request->category,
            'tags'      => $request->tags,
            'image_url' => $request->image_url,
            'reading_time_min' => $request->reading_time_min ?? 5,
            'author_id' => $request->user()->id,
            'is_draft'  => true,
        ]);

        return response()->json($post, 201);
    }

    /**
     * Admin: Update an existing post
     */
    public function update(Request $request, $id)
    {
        $post = BlogPost::findOrFail($id);

        $request->validate([
            'title'   => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'excerpt' => 'nullable|string',
            'category' => 'nullable|string',
            'tags'    => 'nullable|array',
            'image_url' => 'nullable|string',
            'reading_time_min' => 'nullable|integer',
        ]);

        if ($request->has('title') && $request->title !== $post->title) {
            $post->title = $request->title;
            $post->slug  = Str::slug($request->title) . '-' . Str::random(5);
        }

        if ($request->has('content')) $post->content = $request->content;
        if ($request->has('excerpt')) $post->excerpt = $request->excerpt;
        if ($request->has('category')) $post->category = $request->category;
        if ($request->has('tags')) $post->tags = $request->tags;
        if ($request->has('image_url')) $post->image_url = $request->image_url;
        if ($request->has('reading_time_min')) $post->reading_time_min = $request->reading_time_min;

        $post->save();

        return response()->json($post);
    }

    /**
     * Admin: Toggle publish status
     */
    public function publish(Request $request, $id)
    {
        $post = BlogPost::findOrFail($id);
        $post->is_draft = $request->is_draft ?? !$post->is_draft;
        
        if (!$post->is_draft && !$post->published_at) {
            $post->published_at = now();
        }

        $post->save();

        return response()->json($post);
    }

    /**
     * Admin: Delete a post
     */
    public function destroy($id)
    {
        $post = BlogPost::findOrFail($id);
        $post->delete();

        return response()->json(['message' => 'Post deleted successfully']);
    }
}
