<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class BookingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_submit_a_complete_booking_request(): void
    {
        $response = $this->postJson('/api/bookings', [
            'service_type' => 'Studio Booking',
            'client_name' => 'Ada Okafor',
            'client_email' => 'ada@example.com',
            'client_phone' => '+234 800 000 0000',
            'preferred_date' => now()->addWeek()->toDateString(),
            'preferred_time' => '14:30',
            'location' => 'Lagos studio',
            'duration' => '4 hours',
            'budget' => 'NGN 250,000',
            'attendees' => 6,
            'contact_method' => 'whatsapp',
            'project_details' => 'Recording and filming a live acoustic studio session.',
        ]);

        $response->assertCreated()
            ->assertJsonPath('reference', 'XTB-000001')
            ->assertJsonPath('booking.status', 'pending')
            ->assertJsonPath('booking.contact_method', 'whatsapp');

        $this->assertDatabaseHas('bookings', [
            'service_type' => 'Studio Booking',
            'client_email' => 'ada@example.com',
            'preferred_time' => '14:30',
            'attendees' => 6,
            'status' => 'pending',
        ]);
    }

    public function test_booking_rejects_unknown_services_past_dates_and_missing_reply_number(): void
    {
        $this->postJson('/api/bookings', [
            'service_type' => 'Unknown Service',
            'client_name' => 'Ada Okafor',
            'client_email' => 'ada@example.com',
            'preferred_date' => now()->subDay()->toDateString(),
            'contact_method' => 'whatsapp',
            'project_details' => 'This request has enough project details to validate.',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['service_type', 'preferred_date', 'client_phone']);

        $this->assertDatabaseCount('bookings', 0);
    }

    public function test_live_premium_and_pay_per_view_access_requests_are_accepted(): void
    {
        Mail::fake();
        Notification::fake();

        foreach (['Live Premium Stream', 'Live Pay-Per-View'] as $service) {
            $this->postJson('/api/bookings', [
                'service_type' => $service,
                'client_name' => 'Ada Okafor',
                'client_email' => 'ada@example.com',
                'preferred_date' => now()->toDateString(),
                'preferred_time' => '19:00',
                'contact_method' => 'email',
                'project_details' => "{$service} access request for Gold Night.",
            ])->assertCreated()
                ->assertJsonPath('booking.service_type', $service)
                ->assertJsonPath('booking.status', 'pending');
        }

        $this->assertDatabaseCount('bookings', 2);
    }
}
