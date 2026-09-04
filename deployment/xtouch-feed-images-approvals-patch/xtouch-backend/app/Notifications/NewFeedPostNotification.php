<?php

namespace App\Notifications;

use App\Models\FeedPost;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewFeedPostNotification extends Notification
{
    use Queueable;

    public function __construct(public FeedPost $post) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $imageUrl = $this->mediaUrl($this->post->image_url);

        return [
            'type' => 'new_feed_post',
            'title' => $this->post->title ?: "New {$this->post->category} post",
            'message' => "{$this->post->author} posted: ".str($this->post->text)->squish()->limit(130),
            'url' => '/news-feed#post-'.$this->post->id,
            'entity_id' => $this->post->id,
            'image_url' => $imageUrl,
            'icon' => $this->post->kind,
        ];
    }

    private function mediaUrl(?string $url): ?string
    {
        if (! $url) {
            return null;
        }

        $path = parse_url($url, PHP_URL_PATH) ?: $url;

        return str_starts_with($path, '/storage/')
            ? '/api/media/'.ltrim(substr($path, strlen('/storage/')), '/')
            : $url;
    }
}
