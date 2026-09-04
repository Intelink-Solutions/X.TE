<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TicketListing;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TicketListingController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            TicketListing::with('event')
                ->where('status', 'available')
                ->where('moderation_status', 'approved')
                ->latest()
                ->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'event_id'     => 'required|exists:events,id',
            'seat_info'    => 'required|string|max:120',
            'asking_price' => 'required|string|max:30',
            'contact'      => 'required|string|max:120',
        ]);
        $data['user_id'] = $request->user()?->id;
        $data['moderation_status'] = 'pending';
        return response()->json(TicketListing::create($data), 202);
    }

    public function show(TicketListing $ticketListing): JsonResponse
    {
        return response()->json($ticketListing->load('event'));
    }

    public function update(Request $request, TicketListing $ticketListing): JsonResponse
    {
        $data = $request->validate([
            'status' => 'in:available,sold,removed',
            'moderation_status' => 'in:pending,approved,rejected',
            'rejection_reason' => 'nullable|string|max:1000',
        ]);
        if (array_key_exists('moderation_status', $data)) {
            $data['reviewed_by'] = $request->user()?->id;
            $data['reviewed_at'] = now();
        }
        $ticketListing->update($data);
        return response()->json($ticketListing);
    }

    public function destroy(TicketListing $ticketListing): JsonResponse
    {
        $ticketListing->delete();
        return response()->json(null, 204);
    }
}
