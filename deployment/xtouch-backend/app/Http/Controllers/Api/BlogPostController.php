<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BlogPostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = BlogPost::where('is_published', true);

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        return response()->json(
            $query->orderByDesc('published_at')->paginate(20)
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'tags' => 'nullable|array|max:12',
            'tags.*' => 'string|max:50',
            'excerpt' => 'required|string|max:500',
            'body' => 'nullable|string',
            'author' => 'nullable|string|max:255',
            'read_time' => 'nullable|string|max:20',
            'image_url' => 'nullable|string|max:500',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:10240',
            'published_at' => 'nullable|date',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
        ]);
        $data['slug'] = Str::slug($data['title']);
        if ($request->hasFile('image')) {
            $data['image_url'] = Storage::url($request->file('image')->store('blog-images', 'public'));
        }
        unset($data['image']);

        return response()->json(BlogPost::create($data), 201);
    }

    public function show(BlogPost $blogPost): JsonResponse
    {
        return response()->json($blogPost);
    }

    public function update(Request $request, BlogPost $blogPost): JsonResponse
    {
        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'category' => 'sometimes|string|max:100',
            'tags' => 'nullable|array|max:12',
            'tags.*' => 'string|max:50',
            'excerpt' => 'sometimes|string|max:500',
            'body' => 'nullable|string',
            'author' => 'nullable|string|max:255',
            'read_time' => 'nullable|string|max:20',
            'image_url' => 'nullable|string|max:500',
            'published_at' => 'nullable|date',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
        ]);
        if (isset($data['title'])) {
            $data['slug'] = Str::slug($data['title']);
        }
        $blogPost->update($data);

        return response()->json($blogPost);
    }

    public function destroy(BlogPost $blogPost): JsonResponse
    {
        $blogPost->delete();

        return response()->json(null, 204);
    }
}
