<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Artist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ArtistController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Artist::withCount('followers')->where('is_active', true)
                ->orderByDesc('is_featured')
                ->orderBy('name')
                ->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'genre' => 'nullable|string|max:100',
            'monthly_listeners' => 'nullable|string|max:50',
            'bio' => 'nullable|string',
            'image_url' => 'nullable|string|max:500',
            'instagram_url' => 'nullable|string|max:500',
            'spotify_url' => 'nullable|string|max:500',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ]);
        $data['slug'] = Str::slug($data['name']);

        return response()->json(Artist::create($data), 201);
    }

    public function show(Artist $artist): JsonResponse
    {
        return response()->json($artist->load(['tracks' => fn ($query) => $query
            ->where('is_active', true)->where('approval_status', 'approved')])->loadCount('followers'));
    }

    public function update(Request $request, Artist $artist): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'role' => 'sometimes|string|max:255',
            'genre' => 'nullable|string|max:100',
            'monthly_listeners' => 'nullable|string|max:50',
            'bio' => 'nullable|string',
            'image_url' => 'nullable|string|max:500',
            'instagram_url' => 'nullable|string|max:500',
            'spotify_url' => 'nullable|string|max:500',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ]);
        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }
        $artist->update($data);

        return response()->json($artist);
    }

    public function destroy(Artist $artist): JsonResponse
    {
        $artist->delete();

        return response()->json(null, 204);
    }
}
