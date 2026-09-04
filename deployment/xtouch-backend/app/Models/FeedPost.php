<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeedPost extends Model
{
    protected $fillable = [
        'user_id', 'author', 'handle', 'verified', 'category', 'kind', 'title', 'text',
        'hashtags', 'tags', 'location', 'image_key', 'image_url', 'poll_options',
        'media_url', 'event_date', 'venue', 'ticket_price', 'ticket_url',
        'likes', 'comments', 'shares', 'reposts', 'views', 'is_pinned', 'is_active', 'approval_status',
        'notified_at',
    ];

    protected $casts = [
        'hashtags' => 'array',
        'tags' => 'array',
        'poll_options' => 'array',
        'verified' => 'boolean',
        'is_pinned' => 'boolean',
        'is_active' => 'boolean',
        'event_date' => 'datetime',
        'notified_at' => 'datetime',
    ];

    public function reports()
    {
        return $this->hasMany(PostReport::class);
    }

    public function userLikes()
    {
        return $this->hasMany(FeedPostLike::class);
    }

    public function userComments()
    {
        return $this->hasMany(FeedPostComment::class);
    }

    public function bookmarks()
    {
        return $this->hasMany(FeedPostBookmark::class);
    }

    public function reposts()
    {
        return $this->hasMany(FeedPostRepost::class);
    }

    public function pollVotes()
    {
        return $this->hasMany(FeedPollVote::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function track()
    {
        return $this->hasOne(Track::class);
    }
}
