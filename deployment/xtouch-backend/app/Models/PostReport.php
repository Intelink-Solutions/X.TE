<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PostReport extends Model
{
    protected $fillable = [
        'feed_post_id', 'user_id', 'reporter_email', 'reason', 'details',
        'status', 'resolved_by', 'resolved_at',
    ];

    protected $casts = ['resolved_at' => 'datetime'];

    public function post() { return $this->belongsTo(FeedPost::class, 'feed_post_id'); }
    public function reporter() { return $this->belongsTo(User::class, 'user_id'); }
    public function resolver() { return $this->belongsTo(User::class, 'resolved_by'); }
}
