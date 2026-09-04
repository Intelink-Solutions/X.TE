<?php

namespace App\Notifications;

use App\Models\FeedPost;
use App\Services\MailSettingsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewFeedPostEmailNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 30;

    public function __construct(public FeedPost $post)
    {
        $this->onQueue('emails');
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        app(MailSettingsService::class)->apply();
        $title = $this->post->title ?: "New {$this->post->category} post";
        $summary = (string) str($this->post->text)->squish()->limit(220);

        return (new MailMessage)
            ->subject("New on X'Touch: {$title}")
            ->greeting("Hello {$notifiable->name},")
            ->line("{$this->post->author} has published a new {$this->post->kind} post.")
            ->line($summary ?: 'Open the feed to see the latest update.')
            ->action('View the post', rtrim(config('app.frontend_url'), '/').'/news-feed#post-'.$this->post->id)
            ->line("You are receiving this because you have an X'Touch account.");
    }
}
