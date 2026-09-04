<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\NewContactSubmission;
use App\Models\ContactMessage;
use App\Models\User;
use App\Notifications\AdminSubmissionReceived;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Throwable;

class ContactMessageController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            ContactMessage::orderByRaw("FIELD(status,'unread','read','replied')")
                ->latest()
                ->paginate(50)
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string|min:5|max:2000',
        ]);
        $contactMessage = ContactMessage::create($data);

        Notification::send(
            User::whereHas('roles', fn ($query) => $query->whereIn('name', ['Super Admin', 'Administrator', 'Admin']))->get(),
            new AdminSubmissionReceived(
                'contact',
                'New contact message',
                "{$contactMessage->name} sent: ".str($contactMessage->subject ?: 'General enquiry')->limit(100),
                rtrim(config('app.url'), '/').'/admin/contact-messages',
                $contactMessage->id,
            ),
        );

        try {
            Mail::to(config('mail.submissions_to'))->send(new NewContactSubmission($contactMessage));
        } catch (Throwable $exception) {
            report($exception);
        }

        return response()->json($contactMessage, 201);
    }

    public function show(ContactMessage $contactMessage): JsonResponse
    {
        if ($contactMessage->status === 'unread') {
            $contactMessage->update(['status' => 'read']);
        }

        return response()->json($contactMessage);
    }

    public function update(Request $request, ContactMessage $contactMessage): JsonResponse
    {
        $data = $request->validate([
            'status' => 'in:unread,read,replied',
            'admin_reply' => 'nullable|string|max:2000',
        ]);
        $contactMessage->update($data);

        return response()->json($contactMessage);
    }

    public function destroy(ContactMessage $contactMessage): JsonResponse
    {
        $contactMessage->delete();

        return response()->json(null, 204);
    }
}
