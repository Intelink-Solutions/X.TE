<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Track extends Model
{
    protected $fillable = [
        'feed_post_id', 'artist_id', 'submitted_by', 'title', 'album', 'duration', 'plays', 'downloads',
        'audio_url', 'cover_url', 'genre', 'released_at',
        'is_featured', 'is_active', 'approval_status', 'approved_by',
        'approved_at', 'rejection_reason',
    ];

    protected $casts = [
        'released_at' => 'date',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'approved_at' => 'datetime',
    ];

    public function artist(): BelongsTo
    {
        return $this->belongsTo(Artist::class);
    }

    public function submitter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function likes()
    {
        return $this->hasMany(TrackLike::class);
    }

    public function playlists()
    {
        return $this->belongsToMany(Playlist::class, 'playlist_tracks')->withTimestamps();
    }

    public function feedPost(): BelongsTo
    {
        return $this->belongsTo(FeedPost::class);
    }
}
