<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PodcastEpisode;
use App\Services\MediaSyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PodcastEpisodeController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            PodcastEpisode::where('is_active', true)->where('approval_status', 'approved')
                ->orderByDesc('episode_number')
                ->paginate(20)
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'episode_number' => 'nullable|integer|min:1',
            'guest' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'audio_url' => 'nullable|string|max:500',
            'video_url' => 'nullable|string|max:500',
            'duration' => 'nullable|string|max:20',
            'cover_url' => 'nullable|string|max:500',
            'published_at' => 'nullable|date',
            'is_featured' => 'boolean',
        ]);
        $data['slug'] = Str::slug($data['title']);

        return response()->json(PodcastEpisode::create($data), 201);
    }

    public function submit(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string|min:2|max:255',
            'description' => 'nullable|string|max:5000',
            'guest' => 'nullable|string|max:255',
            'audio' => 'nullable|required_without:recorded_audio|file|mimetypes:audio/mpeg,audio/mp4,video/mp4,audio/webm,video/webm,audio/ogg,application/ogg,audio/wav,audio/x-wav|max:30720',
            'recorded_audio' => 'nullable|required_without:audio|file|mimetypes:audio/webm,video/webm,audio/ogg,application/ogg,audio/wav,audio/x-wav|max:30720',
            'cover' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);
        $audio = $request->file('audio') ?: $request->file('recorded_audio');
        $episode = PodcastEpisode::create([
            'submitted_by' => $request->user()->id,
            'title' => $data['title'],
            'slug' => Str::slug($data['title']).'-'.Str::lower(Str::random(5)),
            'description' => $data['description'] ?? null,
            'guest' => $data['guest'] ?? null,
            'audio_url' => Storage::url($audio->store('podcast-submissions', 'public')),
            'cover_url' => $request->hasFile('cover')
                ? Storage::url($request->file('cover')->store('podcast-covers', 'public'))
                : null,
            'approval_status' => 'pending',
            'is_active' => false,
        ]);

        return response()->json($episode, 202);
    }

    public function show(PodcastEpisode $podcastEpisode): JsonResponse
    {
        return response()->json($podcastEpisode);
    }

    public function stream(PodcastEpisode $podcastEpisode)
    {
        $this->ensurePublicEpisode($podcastEpisode);
        if (! str_starts_with((string) $podcastEpisode->audio_url, '/storage/')) {
            return redirect()->away($podcastEpisode->audio_url);
        }
        $path = Str::after($podcastEpisode->audio_url, '/storage/');
        abort_unless(Storage::disk('public')->exists($path), 404);

        return response()->file(Storage::disk('public')->path($path), [
            'Accept-Ranges' => 'bytes',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }

    public function download(PodcastEpisode $podcastEpisode)
    {
        $this->ensurePublicEpisode($podcastEpisode);
        if (! str_starts_with((string) $podcastEpisode->audio_url, '/storage/')) {
            return redirect()->away($podcastEpisode->audio_url);
        }
        $path = Str::after($podcastEpisode->audio_url, '/storage/');
        abort_unless(Storage::disk('public')->exists($path), 404);
        $extension = pathinfo($path, PATHINFO_EXTENSION) ?: 'mp3';

        return response()->download(
            Storage::disk('public')->path($path),
            Str::slug($podcastEpisode->title).'.'.$extension,
        );
    }

    private function ensurePublicEpisode(PodcastEpisode $podcastEpisode): void
    {
        abort_unless(
            $podcastEpisode->is_active
            && $podcastEpisode->approval_status === 'approved'
            && $podcastEpisode->audio_url,
            404,
        );
    }

    public function update(Request $request, PodcastEpisode $podcastEpisode): JsonResponse
    {
        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'episode_number' => 'nullable|integer|min:1',
            'guest' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'audio_url' => 'nullable|string|max:500',
            'video_url' => 'nullable|string|max:500',
            'duration' => 'nullable|string|max:20',
            'cover_url' => 'nullable|string|max:500',
            'published_at' => 'nullable|date',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ]);
        $podcastEpisode->update($data);
        app(MediaSyncService::class)->podcast($podcastEpisode->fresh());

        return response()->json($podcastEpisode);
    }

    public function destroy(PodcastEpisode $podcastEpisode): JsonResponse
    {
        $podcastEpisode->delete();

        return response()->json(null, 204);
    }
}
