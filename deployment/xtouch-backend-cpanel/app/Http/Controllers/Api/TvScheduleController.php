<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TvSchedule;
use App\Services\MediaSyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TvScheduleController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            TvSchedule::where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('time')
                ->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'show_name' => 'required|string|max:255',
            'time' => 'required|string|max:10',
            'tag' => 'required|string|max:50',
            'channel' => 'nullable|string|max:100',
            'stream_url' => 'nullable|url|max:1000',
            'stream_provider' => 'nullable|in:youtube,facebook,tiktok,instagram,direct',
            'description' => 'nullable|string|max:2000',
            'day_of_week' => 'nullable|string|max:50',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after:starts_at',
            'is_live' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);
        $schedule = TvSchedule::create($data);
        app(MediaSyncService::class)->tv($schedule);

        return response()->json($schedule->fresh(), 201);
    }

    public function show(TvSchedule $tvSchedule): JsonResponse
    {
        return response()->json($tvSchedule);
    }

    public function update(Request $request, TvSchedule $tvSchedule): JsonResponse
    {
        $data = $request->validate([
            'show_name' => 'sometimes|string|max:255',
            'time' => 'sometimes|string|max:10',
            'tag' => 'sometimes|string|max:50',
            'channel' => 'nullable|string|max:100',
            'stream_url' => 'nullable|url|max:1000',
            'stream_provider' => 'nullable|in:youtube,facebook,tiktok,instagram,direct',
            'description' => 'nullable|string|max:2000',
            'day_of_week' => 'nullable|string|max:50',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after:starts_at',
            'is_live' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);
        $tvSchedule->update($data);
        app(MediaSyncService::class)->tv($tvSchedule->fresh());

        return response()->json($tvSchedule);
    }

    public function destroy(TvSchedule $tvSchedule): JsonResponse
    {
        $tvSchedule->delete();

        return response()->json(null, 204);
    }
}
