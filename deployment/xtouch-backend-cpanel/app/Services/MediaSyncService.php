<?php

namespace App\Services;

use App\Models\Artist;
use App\Models\Event;
use App\Models\FeedPost;
use App\Models\PodcastEpisode;
use App\Models\Track;
use App\Models\TvSchedule;
use Illuminate\Support\Str;

class MediaSyncService
{
    public function feedPost(FeedPost $post): void
    {
        if ($post->kind === 'music' && $post->media_url) {
            $artist = $this->artistFor($post->user_id, $post->author, 'Artist', $post->approval_status === 'approved');
            Track::updateOrCreate(['feed_post_id' => $post->id], [
                'artist_id' => $artist->id,
                'submitted_by' => $post->user_id,
                'title' => $post->title ?: 'Untitled track',
                'audio_url' => $post->media_url,
                'cover_url' => $post->image_url,
                'genre' => 'Community',
                'approval_status' => $post->approval_status,
                'approved_at' => $post->approval_status === 'approved' ? now() : null,
                'is_active' => $post->is_active && $post->approval_status === 'approved',
            ]);
        }

        if (in_array($post->kind, ['event', 'ticket'], true) && $post->event_date && $post->venue) {
            Event::updateOrCreate(['feed_post_id' => $post->id], [
                'name' => $post->title ?: Str::limit($post->text, 80),
                'slug' => Str::slug(($post->title ?: 'community-event').'-'.$post->id),
                'description' => $post->text,
                'venue' => $post->venue,
                'location' => $post->location,
                'starts_at' => $post->event_date,
                'price' => $post->ticket_price,
                'ticket_url' => $post->ticket_url,
                'status' => $post->ticket_price ? 'on_sale' : 'scheduled',
                'image_url' => $post->image_url,
                'is_active' => $post->is_active && $post->approval_status === 'approved',
            ]);
        }
    }

    public function podcast(PodcastEpisode $episode): void
    {
        $post = $episode->feed_post_id ? FeedPost::find($episode->feed_post_id) : null;
        $post ??= new FeedPost;
        $post->fill([
            'user_id' => $episode->submitted_by,
            'author' => $episode->submitter?->name ?? "X'Touch Podcast",
            'handle' => '@xtouchpodcast',
            'verified' => true,
            'category' => 'Podcast',
            'kind' => 'podcast',
            'title' => $episode->title,
            'text' => $episode->description ?: 'A new podcast episode is available.',
            'image_url' => $episode->cover_url,
            'media_url' => $episode->audio_url ?: $episode->video_url,
            'approval_status' => $episode->approval_status,
            'is_active' => $episode->is_active && $episode->approval_status === 'approved',
        ])->save();
        if ($episode->feed_post_id !== $post->id) {
            $episode->updateQuietly(['feed_post_id' => $post->id]);
        }
    }

    public function tv(TvSchedule $schedule): void
    {
        if (! $schedule->is_live || ! $schedule->stream_url) {
            if ($schedule->feed_post_id) {
                FeedPost::whereKey($schedule->feed_post_id)->update(['is_active' => false]);
            }

            return;
        }
        $post = $schedule->feed_post_id ? FeedPost::find($schedule->feed_post_id) : null;
        $post ??= new FeedPost;
        $post->fill([
            'author' => "X'Touch TV",
            'handle' => '@xtouchtv',
            'verified' => true,
            'category' => 'TV',
            'kind' => 'tv',
            'title' => $schedule->show_name,
            'text' => $schedule->description ?: "{$schedule->show_name} is live now.",
            'media_url' => $schedule->stream_url,
            'approval_status' => 'approved',
            'is_active' => true,
        ])->save();
        if ($schedule->feed_post_id !== $post->id) {
            $schedule->updateQuietly(['feed_post_id' => $post->id]);
        }
    }

    public function artistFor(?int $userId, string $name, string $role = 'Artist', bool $active = true): Artist
    {
        $artist = $userId ? Artist::firstOrNew(['user_id' => $userId]) : Artist::firstOrNew(['name' => $name]);
        $artist->fill([
            'name' => $name,
            'slug' => $artist->slug ?: Str::slug($name).'-'.Str::lower(Str::random(5)),
            'role' => $role,
            'is_active' => $active,
        ])->save();

        return $artist;
    }
}
