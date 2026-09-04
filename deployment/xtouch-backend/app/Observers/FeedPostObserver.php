<?php

namespace App\Observers;

use App\Models\FeedPost;
use App\Services\FeedPostNotificationService;

class FeedPostObserver
{
    public function created(FeedPost $post): void
    {
        app(FeedPostNotificationService::class)->publish($post);
    }

    public function updated(FeedPost $post): void
    {
        if ($post->wasChanged(['approval_status', 'is_active'])) {
            app(FeedPostNotificationService::class)->publish($post);
        }
    }
}
