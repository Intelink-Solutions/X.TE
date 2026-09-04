<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AnalyticsEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsEventController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'session_id' => 'nullable|uuid',
            'event_type' => 'required|string|max:80',
            'path' => 'nullable|string|max:255',
            'entity_type' => 'nullable|string|max:100',
            'entity_id' => 'nullable|integer|min:1',
            'metadata' => 'nullable|array',
        ]);
        $data['user_id'] = $request->user()?->id;
        $data['ip_hash'] = hash('sha256', (string) $request->ip().'|'.config('app.key'));
        AnalyticsEvent::create($data);

        return response()->json(['recorded' => true], 201);
    }
}
