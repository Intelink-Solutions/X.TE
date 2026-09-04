<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TicketOrder;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class TicketOrderController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            TicketOrder::with('event')->latest()->paginate(50)
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'event_id'    => 'required|exists:events,id',
            'buyer_name'  => 'required|string|max:255',
            'buyer_email' => 'required|email|max:255',
            'quantity'    => 'required|integer|min:1|max:10',
        ]);
        $data['qr_code'] = strtoupper(Str::random(12));
        $data['status']  = 'confirmed';
        return response()->json(TicketOrder::create($data), 201);
    }

    public function show(TicketOrder $ticketOrder): JsonResponse
    {
        return response()->json($ticketOrder->load('event'));
    }

    public function update(Request $request, TicketOrder $ticketOrder): JsonResponse
    {
        $data = $request->validate([
            'status' => 'in:pending,confirmed,cancelled',
        ]);
        $ticketOrder->update($data);
        return response()->json($ticketOrder);
    }

    public function destroy(TicketOrder $ticketOrder): JsonResponse
    {
        $ticketOrder->delete();
        return response()->json(null, 204);
    }
}
