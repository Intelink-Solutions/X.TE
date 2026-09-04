<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Artist;
use App\Models\Track;
use App\Models\TrackLike;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class TrackController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user('sanctum')?->id;
        $likedTrackIds = $userId
            ? TrackLike::where('user_id', $userId)->pluck('track_id')->all()
            : [];

        return response()->json(
            Track::with('artist')->withCount('likes')
                ->where('is_active', true)
                ->where('approval_status', 'approved')
                ->orderByDesc('is_featured')
                ->latest()
                ->get()->each(function (Track $track) use ($likedTrackIds) {
                    $hasAudio = filled($track->audio_url);
                    $track->setAttribute('stream_url', $hasAudio ? url("/api/tracks/{$track->id}/stream") : null);
                    $track->setAttribute('download_url', $hasAudio ? url("/api/tracks/{$track->id}/download") : null);
                    $track->setAttribute('is_liked', in_array($track->id, $likedTrackIds, true));
                })
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'artist_id' => 'required|exists:artists,id',
            'title' => 'required|string|max:255',
            'album' => 'nullable|string|max:255',
            'duration' => 'nullable|string|max:20',
            'plays' => 'nullable|string|max:20',
            'audio_url' => 'nullable|string|max:500',
            'cover_url' => 'nullable|string|max:500',
            'genre' => 'nullable|string|max:100',
            'released_at' => 'nullable|date',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ]);

        return response()->json(Track::create($data), 201);
    }

    public function submit(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user && ($user->approvedCreatorRequest() || $user->hasAnyRole(['Artist', 'Musician', 'Super Admin', 'Administrator'])), 403, 'Your creator account is not approved.');

        $data = $request->validate([
            'artist_id' => 'required|exists:artists,id',
            'title' => 'required|string|max:255',
            'album' => 'nullable|string|max:255',
            'duration' => 'nullable|string|max:20',
            'audio_url' => 'required|url|max:500',
            'cover_url' => 'nullable|url|max:500',
            'genre' => 'nullable|string|max:100',
            'released_at' => 'nullable|date',
        ]);

        $data['submitted_by'] = $user->id;
        $data['approval_status'] = 'pending';
        $data['is_active'] = false;

        return response()->json(Track::create($data), 202);
    }

    public function submitPublic(Request $request): JsonResponse
    {
        $data = $request->validate([
            'artist' => 'required|string|max:120',
            'title' => 'required|string|max:255',
            'genre' => 'required|string|max:100',
            'audio' => [
                Rule::requiredIf(fn () => blank($request->input('audio_url'))),
                Rule::prohibitedIf(fn () => filled($request->input('audio_url'))),
                'file',
                'mimes:mp3,wav,m4a,aac,ogg',
                'max:30720',
            ],
            'audio_url' => [
                Rule::requiredIf(fn () => ! $request->hasFile('audio')),
                Rule::prohibitedIf(fn () => $request->hasFile('audio')),
                'url:http,https',
                'max:500',
            ],
            'cover' => 'nullable|image|max:5120',
        ]);

        $artist = Artist::whereRaw('LOWER(name) = ?', [mb_strtolower($data['artist'])])->first();
        if (! $artist) {
            $artist = Artist::create([
                'name' => $data['artist'],
                'slug' => Str::slug($data['artist']).'-'.Str::lower(Str::random(5)),
                'role' => 'Independent Artist',
                'genre' => $data['genre'],
                'is_active' => false,
            ]);
        }

        $audioUrl = $data['audio_url'] ?? null;
        if ($request->hasFile('audio')) {
            $path = $request->file('audio')->store('track-submissions', 'public');
            abort_unless(is_string($path) && Storage::disk('public')->exists($path), 500, 'The audio file could not be saved.');
            $audioUrl = '/api/media/'.$path;
        }

        $coverUrl = null;
        if ($request->hasFile('cover')) {
            $coverPath = $request->file('cover')->store('track-covers', 'public');
            abort_unless(is_string($coverPath) && Storage::disk('public')->exists($coverPath), 500, 'The cover image could not be saved.');
            $coverUrl = '/api/media/'.$coverPath;
        }

        $track = Track::create([
            'artist_id' => $artist->id,
            'submitted_by' => $request->user()->id,
            'title' => $data['title'],
            'genre' => $data['genre'],
            'audio_url' => $audioUrl,
            'cover_url' => $coverUrl,
            'approval_status' => 'pending',
            'is_active' => false,
        ]);

        return response()->json($track->load('artist'), 202);
    }

    public function stream(Track $track)
    {
        $this->ensurePublicTrack($track);
        $path = $this->storedAudioPath($track->audio_url);
        if ($path === null) {
            return redirect()->away($track->audio_url);
        }
        abort_unless(Storage::disk('public')->exists($path), 404);

        return response()->file(Storage::disk('public')->path($path), [
            'Accept-Ranges' => 'bytes',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }

    public function download(Track $track)
    {
        $this->ensurePublicTrack($track);
        $track->increment('downloads');
        $path = $this->storedAudioPath($track->audio_url);
        if ($path === null) {
            return redirect()->away($track->audio_url);
        }
        abort_unless(Storage::disk('public')->exists($path), 404);
        $extension = pathinfo($path, PATHINFO_EXTENSION) ?: 'mp3';

        return response()->download(Storage::disk('public')->path($path), Str::slug($track->artist?->name.'-'.$track->title).'.'.$extension);
    }

    private function ensurePublicTrack(Track $track): void
    {
        abort_unless($track->is_active && $track->approval_status === 'approved' && $track->audio_url, 404);
    }

    private function storedAudioPath(?string $url): ?string
    {
        if (! $url) {
            return null;
        }

        $host = parse_url($url, PHP_URL_HOST);
        $appHost = parse_url((string) config('app.url'), PHP_URL_HOST);
        if ($host && ! in_array($host, array_filter([$appHost, request()->getHost()]), true)) {
            return null;
        }

        $path = parse_url($url, PHP_URL_PATH) ?: $url;
        foreach (['/storage/', '/api/media/'] as $prefix) {
            if (str_starts_with($path, $prefix)) {
                return ltrim(Str::after($path, $prefix), '/');
            }
        }

        return null;
    }

    public function show(Track $track): JsonResponse
    {
        return response()->json($track->load('artist'));
    }

    public function update(Request $request, Track $track): JsonResponse
    {
        $data = $request->validate([
            'artist_id' => 'sometimes|exists:artists,id',
            'title' => 'sometimes|string|max:255',
            'album' => 'nullable|string|max:255',
            'duration' => 'nullable|string|max:20',
            'plays' => 'nullable|string|max:20',
            'audio_url' => 'nullable|string|max:500',
            'cover_url' => 'nullable|string|max:500',
            'genre' => 'nullable|string|max:100',
            'released_at' => 'nullable|date',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ]);
        $track->update($data);

        return response()->json($track);
    }

    public function destroy(Track $track): JsonResponse
    {
        $track->delete();

        return response()->json(null, 204);
    }
}
