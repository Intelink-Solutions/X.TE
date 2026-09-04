<?php

namespace App\Services;

use App\Models\FeedPost;
use App\Models\User;
use App\Notifications\NewFeedPostEmailNotification;
use App\Notifications\NewFeedPostNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Schema;

class FeedPostNotificationService
{
    public function publish(FeedPost $post): void
    {
        if (! Schema::hasTable('notifications') || ! Schema::hasColumn('feed_posts', 'notified_at')) {
            return;
        }

        if (! $post->is_active || $post->approval_status !== 'approved' || $post->notified_at) {
            return;
        }

        $claimed = FeedPost::whereKey($post->id)
            ->whereNull('notified_at')
            ->update(['notified_at' => now()]);

        if (! $claimed) {
            return;
        }

        User::query()
            ->whereNull('blocked_at')
            ->select(['id', 'name', 'email'])
            ->chunkById(200, function ($users) use ($post): void {
                Notification::sendNow($users, new NewFeedPostNotification($post));
                Notification::send($users, new NewFeedPostEmailNotification($post));
            });
    }
}
