<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserFollow;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserFollowController extends Controller
{
    public function status(Request $request, User $user): JsonResponse
    {
        abort_unless($this->isFollowable($user), 422, 'This member does not have a followable creator profile.');

        return response()->json($this->payload($request->user()->id, $user->id));
    }

    public function toggle(Request $request, User $user): JsonResponse
    {
        abort_if($request->user()->is($user), 422, 'You cannot follow your own account.');
        abort_unless($this->isFollowable($user), 422, 'Only creators, artists and podcasters can be followed.');

        $attributes = [
            'follower_id' => $request->user()->id,
            'followed_user_id' => $user->id,
        ];
        $follow = UserFollow::where($attributes)->first();
        $follow ? $follow->delete() : UserFollow::create($attributes);

        return response()->json($this->payload($request->user()->id, $user->id));
    }

    private function isFollowable(User $user): bool
    {
        if ($user->hasAnyRole(['Artist', 'Musician', 'Podcaster', 'Creator', 'Approved Creator'])) {
            return true;
        }

        return $user->verificationRequests()
            ->where('status', 'approved')
            ->whereIn('type', ['approved_user', 'artist', 'musician', 'podcaster'])
            ->exists();
    }

    private function payload(int $followerId, int $followedUserId): array
    {
        return [
            'following' => UserFollow::where([
                'follower_id' => $followerId,
                'followed_user_id' => $followedUserId,
            ])->exists(),
            'followers_count' => UserFollow::where('followed_user_id', $followedUserId)->count(),
        ];
    }
}
