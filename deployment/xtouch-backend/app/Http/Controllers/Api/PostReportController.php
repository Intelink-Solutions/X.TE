<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FeedPost;
use App\Models\PostReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostReportController extends Controller
{
    public function store(Request $request, FeedPost $feedPost): JsonResponse
    {
        $data = $request->validate([
            'reason' => 'required|string|max:100',
            'details' => 'nullable|string|max:2000',
            'reporter_email' => 'nullable|email|max:255',
        ]);
        $data['feed_post_id'] = $feedPost->id;
        $data['user_id'] = $request->user()?->id;

        return response()->json(PostReport::create($data), 201);
    }
}
