<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Artist;
use App\Models\ArtistFollow;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ArtistFollowController extends Controller
{
    public function status(Request $request, Artist $artist): JsonResponse
    {
        return response()->json($this->payload($request, $artist));
    }

    public function toggle(Request $request, Artist $artist): JsonResponse
    {
        $follow = ArtistFollow::where('user_id', $request->user()->id)
            ->where('artist_id', $artist->id)
            ->first();

        if ($follow) {
            $follow->delete();
        } else {
            ArtistFollow::create([
                'user_id' => $request->user()->id,
                'artist_id' => $artist->id,
            ]);
        }

        return response()->json($this->payload($request, $artist));
    }

    private function payload(Request $request, Artist $artist): array
    {
        return [
            'following' => ArtistFollow::where('user_id', $request->user()->id)
                ->where('artist_id', $artist->id)
                ->exists(),
            'followers_count' => $artist->followers()->count(),
        ];
    }
}
