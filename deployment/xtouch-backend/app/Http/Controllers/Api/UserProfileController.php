<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContentView;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserProfileController extends Controller
{
    public function show(User $user): JsonResponse
    {
        $user->load([
            'playlists.tracks.artist',
        ]);

        $posts = $user->feedPosts()
            ->where('is_active', true)
            ->where('approval_status', 'approved')
            ->with('track')
            ->latest()
            ->get()
            ->each(function ($post) use ($user) {
                $post->setAttribute('track_id', $post->track?->id);
                $post->setAttribute('author_type', $this->creatorRole($user));
                $post->unsetRelation('user');
            });

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'handle' => $user->handle ?: '@'.str($user->name)->slug(''),
            'bio' => $user->bio,
            'location' => $user->location,
            'joined_at' => $user->created_at,
            'profile_photo_url' => $user->profile_photo_url,
            'role' => $this->creatorRole($user),
            'is_followable' => $this->isFollowable($user),
            'followers_count' => $user->followers()->count(),
            'profile_views' => (int) $user->profile_views,
            'posts_count' => $posts->count(),
            'posts' => $posts,
            'playlists' => $user->playlists,
        ]);
    }

    public function recordView(Request $request, User $user): JsonResponse
    {
        $data = $request->validate(['session_id' => 'nullable|uuid']);
        $viewer = auth('sanctum')->user();

        if ($viewer?->id === $user->id) {
            return response()->json(['views' => (int) $user->profile_views, 'recorded' => false]);
        }

        $identity = $data['session_id'] ?? ($viewer ? 'user:'.$viewer->id : 'ip:'.$request->ip());
        $view = ContentView::firstOrCreate([
            'viewable_type' => 'user_profile',
            'viewable_id' => $user->id,
            'viewer_key' => hash('sha256', $identity.'|'.config('app.key')),
        ], [
            'user_id' => $viewer?->id,
        ]);

        if ($view->wasRecentlyCreated) {
            $user->increment('profile_views');
        }

        return response()->json([
            'views' => (int) $user->fresh()->profile_views,
            'recorded' => $view->wasRecentlyCreated,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($request->filled('handle')) {
            $request->merge(['handle' => '@'.ltrim((string) $request->input('handle'), '@')]);
        }
        $data = $request->validate([
            'name' => 'required|string|min:2|max:60',
            'handle' => [
                'required',
                'string',
                'min:2',
                'max:30',
                'regex:/^@?[a-zA-Z0-9_]+$/',
                Rule::unique('users', 'handle')->ignore($user->id),
            ],
            'bio' => 'nullable|string|max:200',
            'location' => 'nullable|string|max:80',
        ]);
        $user->update($data);

        return $this->show($user->fresh());
    }

    private function isFollowable(User $user): bool
    {
        $role = strtolower($this->creatorRole($user));

        return in_array($role, ['creator', 'approved creator', 'artist', 'musician', 'podcaster'], true);
    }

    private function creatorRole(User $user): string
    {
        $role = $user->getRoleNames()->first(fn (string $name) => in_array(
            strtolower($name),
            ['artist', 'musician', 'podcaster', 'creator', 'approved creator'],
            true,
        ));
        if ($role) {
            return strtolower($role) === 'musician' ? 'Artist' : $role;
        }

        $type = $user->verificationRequests()->where('status', 'approved')->latest()->value('type');

        return match ($type) {
            'artist', 'musician' => 'Artist',
            'podcaster' => 'Podcaster',
            'approved_user' => 'Creator',
            default => 'Member',
        };
    }
}
