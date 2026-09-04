<?php

use App\Models\FeedPost;
use App\Models\PodcastEpisode;
use App\Models\TvSchedule;
use App\Services\MediaSyncService;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $sync = app(MediaSyncService::class);

        FeedPost::query()
            ->whereIn('kind', ['music', 'event', 'ticket'])
            ->chunkById(100, fn ($posts) => $posts->each(fn (FeedPost $post) => $sync->feedPost($post)));

        PodcastEpisode::query()
            ->where('approval_status', 'approved')
            ->chunkById(100, fn ($episodes) => $episodes->each(fn (PodcastEpisode $episode) => $sync->podcast($episode)));

        TvSchedule::query()
            ->where('is_live', true)
            ->whereNotNull('stream_url')
            ->chunkById(100, fn ($schedules) => $schedules->each(fn (TvSchedule $schedule) => $sync->tv($schedule)));
    }

    public function down(): void
    {
        // Synced records are user-visible content and are intentionally retained on rollback.
    }
};
