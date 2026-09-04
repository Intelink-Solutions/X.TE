<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PodcastEpisode extends Model
{
    protected $fillable = [
        'submitted_by', 'feed_post_id', 'title', 'slug', 'episode_number', 'guest', 'description',
        'audio_url', 'video_url', 'duration', 'cover_url',
        'published_at', 'is_featured', 'is_active', 'approval_status', 'approved_by',
        'approved_at', 'rejection_reason',
    ];

    protected $casts = [
        'published_at' => 'date',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'approved_at' => 'datetime',
    ];

    public function submitter()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }
}
