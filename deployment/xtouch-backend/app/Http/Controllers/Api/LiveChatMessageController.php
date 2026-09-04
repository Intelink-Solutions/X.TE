<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LiveChatMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LiveChatMessageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'tv_schedule_id' => 'nullable|integer|exists:tv_schedules,id',
        ]);

        $messages = LiveChatMessage::query()
            ->with('user:id,name')
            ->where('is_active', true)
            ->when(
                $data['tv_schedule_id'] ?? null,
                fn ($query, $scheduleId) => $query->where('tv_schedule_id', $scheduleId),
            )
            ->latest('id')
            ->limit(100)
            ->get()
            ->reverse()
            ->values();

        return response()->json($messages);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'tv_schedule_id' => 'nullable|integer|exists:tv_schedules,id',
            'body' => 'required|string|min:1|max:500',
        ]);

        $message = LiveChatMessage::create([
            ...$data,
            'user_id' => $request->user()->id,
            'is_active' => true,
        ]);

        return response()->json($message->load('user:id,name'), 201);
    }
}
