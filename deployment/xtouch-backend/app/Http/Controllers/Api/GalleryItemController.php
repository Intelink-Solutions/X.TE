<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FeedPost;
use App\Models\GalleryItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GalleryItemController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = GalleryItem::where('is_active', true);

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        if ($request->has('kind')) {
            $query->where('kind', $request->kind);
        }

        $managed = $query->orderBy('sort_order')->latest()->get();
        $feedImages = FeedPost::query()
            ->where('is_active', true)
            ->where('approval_status', 'approved')
            ->whereNotNull('image_url')
            ->when($request->filled('category'), fn ($feed) => $feed->where('category', $request->string('category')))
            ->latest()
            ->get()
            ->map(fn (FeedPost $post) => [
                'id' => "feed-{$post->id}",
                'title' => $post->title ?: str($post->text)->limit(80),
                'category' => $post->category,
                'image_url' => $post->image_url,
                'video_url' => in_array($post->kind, ['video', 'tv'], true) ? $post->media_url : null,
                'kind' => 'photo',
                'caption' => $post->text,
                'is_featured' => $post->is_pinned,
                'source' => 'feed',
                'created_at' => $post->created_at,
            ]);

        return response()->json($feedImages->concat($managed)->values());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:100',
            'image_url' => 'required|string|max:500',
            'video_url' => 'nullable|string|max:500',
            'kind' => 'in:photo,video',
            'caption' => 'nullable|string|max:500',
            'is_featured' => 'boolean',
            'sort_order' => 'integer',
        ]);

        return response()->json(GalleryItem::create($data), 201);
    }

    public function show(GalleryItem $galleryItem): JsonResponse
    {
        return response()->json($galleryItem);
    }

    public function update(Request $request, GalleryItem $galleryItem): JsonResponse
    {
        $data = $request->validate([
            'title' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:100',
            'image_url' => 'sometimes|string|max:500',
            'video_url' => 'nullable|string|max:500',
            'kind' => 'in:photo,video',
            'caption' => 'nullable|string|max:500',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);
        $galleryItem->update($data);

        return response()->json($galleryItem);
    }

    public function destroy(GalleryItem $galleryItem): JsonResponse
    {
        $galleryItem->delete();

        return response()->json(null, 204);
    }
}
