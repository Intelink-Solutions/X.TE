<?php

namespace Tests\Feature;

use App\Mail\NewBookingSubmission;
use App\Mail\NewContactSubmission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class SubmissionEmailTest extends TestCase
{
    use RefreshDatabase;

    public function test_booking_request_is_emailed_to_the_submission_inbox(): void
    {
        Mail::fake();

        $this->postJson('/api/bookings', [
            'service_type' => 'Studio Booking',
            'client_name' => 'Ada Artist',
            'client_email' => 'ada@example.com',
            'preferred_date' => now()->addDay()->toDateString(),
            'contact_method' => 'email',
            'project_details' => 'Recording and mixing a four track project.',
        ])->assertCreated();

        Mail::assertSent(NewBookingSubmission::class, function (NewBookingSubmission $mail): bool {
            return $mail->hasTo('xtouchentertainments@gmail.com')
                && $mail->booking->client_email === 'ada@example.com';
        });
    }

    public function test_contact_message_is_emailed_to_the_submission_inbox(): void
    {
        Mail::fake();

        $this->postJson('/api/contact-messages', [
            'name' => 'Chris Caller',
            'email' => 'chris@example.com',
            'phone' => '+234 800 000 0000',
            'subject' => 'Press enquiry',
            'message' => 'Please contact us about an upcoming interview.',
        ])->assertCreated();

        Mail::assertSent(NewContactSubmission::class, function (NewContactSubmission $mail): bool {
            return $mail->hasTo('xtouchentertainments@gmail.com')
                && $mail->contactMessage->email === 'chris@example.com';
        });
    }
}
