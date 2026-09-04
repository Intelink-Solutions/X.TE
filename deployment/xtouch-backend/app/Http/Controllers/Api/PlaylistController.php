<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Playlist;
use App\Models\Track;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlaylistController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(
            $request->user()->playlists()->with(['tracks.artist'])->latest()->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['name' => 'required|string|min:1|max:120']);
        $playlist = $request->user()->playlists()->firstOrCreate(['name' => $data['name']]);

        return response()->json($playlist->load('tracks.artist'), 201);
    }

    public function toggleTrack(Request $request, Playlist $playlist, Track $track): JsonResponse
    {
        abort_unless($playlist->user_id === $request->user()->id, 403);
        $attached = $playlist->tracks()->whereKey($track->id)->exists();
        $attached ? $playlist->tracks()->detach($track->id) : $playlist->tracks()->attach($track->id);

        return response()->json([
            'saved' => ! $attached,
            'playlist' => $playlist->load('tracks.artist'),
        ]);
    }
}
