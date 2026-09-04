<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ApprovalNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $approvalType,
        public string $title,
        public string $message,
        public string $url,
        public int $entityId,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => $this->approvalType.'_approved',
            'title' => $this->title,
            'message' => $this->message,
            'url' => $this->url,
            'entity_id' => $this->entityId,
            'icon' => 'check',
        ];
    }
}
