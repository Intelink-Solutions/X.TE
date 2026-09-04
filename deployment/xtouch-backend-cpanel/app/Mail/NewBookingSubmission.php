<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewBookingSubmission extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Booking $booking)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            replyTo: [new Address($this->booking->client_email, $this->booking->client_name)],
            subject: "New {$this->booking->service_type} — {$this->booking->reference}",
        );
    }

    public function content(): Content
    {
        return new Content(view: 'mail.new-booking-submission');
    }

    public function attachments(): array
    {
        return [];
    }
}
