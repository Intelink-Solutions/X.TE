<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EventController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Event::where('is_active', true)
                ->orderBy('starts_at')
                ->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'venue' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'starts_at' => 'required|date',
            'ends_at' => 'nullable|date|after:starts_at',
            'price' => 'nullable|string|max:50',
            'ticket_url' => 'nullable|url|max:500',
            'status' => 'in:on_sale,selling_fast,few_left,sold_out',
            'capacity' => 'nullable|integer|min:1',
            'image_url' => 'nullable|string|max:500',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ]);
        $data['slug'] = Str::slug($data['name'].'-'.now()->format('Y'));

        return response()->json(Event::create($data), 201);
    }

    public function show(Event $event): JsonResponse
    {
        return response()->json($event->load(['ticketOrders', 'ticketListings']));
    }

    public function update(Request $request, Event $event): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'venue' => 'sometimes|string|max:255',
            'location' => 'nullable|string|max:255',
            'starts_at' => 'sometimes|date',
            'ends_at' => 'nullable|date',
            'price' => 'nullable|string|max:50',
            'ticket_url' => 'nullable|url|max:500',
            'status' => 'in:on_sale,selling_fast,few_left,sold_out',
            'capacity' => 'nullable|integer|min:1',
            'image_url' => 'nullable|string|max:500',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ]);
        $event->update($data);

        return response()->json($event);
    }

    public function destroy(Event $event): JsonResponse
    {
        $event->delete();

        return response()->json(null, 204);
    }
}
