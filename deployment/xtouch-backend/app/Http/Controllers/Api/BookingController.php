<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\NewBookingSubmission;
use App\Models\Booking;
use App\Models\User;
use App\Notifications\AdminSubmissionReceived;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rule;
use Throwable;

class BookingController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Booking::latest()->paginate(50));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'service_type' => ['required', Rule::in([
                'Production Booking',
                'Studio Booking',
                'Dance Booking',
                'Artist Booking',
                'Event Booking',
                'Equipment Rental',
                'Live Premium Stream',
                'Live Pay-Per-View',
            ])],
            'client_name' => 'required|string|min:2|max:100',
            'client_email' => 'required|email|max:255',
            'client_phone' => ['nullable', 'required_if:contact_method,phone,whatsapp', 'string', 'max:30', 'regex:/^[+0-9()\-\s]+$/'],
            'preferred_date' => 'required|date|after_or_equal:today',
            'preferred_time' => 'nullable|date_format:H:i',
            'location' => 'nullable|string|max:255',
            'duration' => 'nullable|string|max:80',
            'budget' => 'nullable|string|max:100',
            'attendees' => 'nullable|integer|min:1|max:100000',
            'contact_method' => 'required|in:email,phone,whatsapp',
            'project_details' => 'required|string|min:10|max:2000',
        ]);
        $booking = Booking::create($data);
        $booking->refresh();

        Notification::send(
            User::whereHas('roles', fn ($query) => $query->whereIn('name', ['Super Admin', 'Administrator', 'Admin']))->get(),
            new AdminSubmissionReceived(
                'booking',
                "New {$booking->service_type}",
                "{$booking->client_name} submitted booking {$booking->reference}.",
                rtrim(config('app.url'), '/').'/admin/bookings',
                $booking->id,
            ),
        );

        try {
            Mail::to(config('mail.submissions_to'))->send(new NewBookingSubmission($booking));
        } catch (Throwable $exception) {
            report($exception);
        }

        return response()->json([
            'message' => 'Your booking request has been received.',
            'reference' => $booking->reference,
            'booking' => $booking,
        ], 201);
    }

    public function show(Booking $booking): JsonResponse
    {
        return response()->json($booking);
    }

    public function update(Request $request, Booking $booking): JsonResponse
    {
        $data = $request->validate([
            'status' => 'in:pending,confirmed,rejected,completed',
            'admin_notes' => 'nullable|string|max:2000',
        ]);
        $booking->update($data);

        return response()->json($booking);
    }

    public function destroy(Booking $booking): JsonResponse
    {
        $booking->delete();

        return response()->json(null, 204);
    }
}
