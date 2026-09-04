<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeedPostComment extends Model
{
    protected $fillable = ['feed_post_id', 'user_id', 'body', 'is_active'];
    protected $casts = ['is_active' => 'boolean'];
    public function user() { return $this->belongsTo(User::class); }
    public function post() { return $this->belongsTo(FeedPost::class, 'feed_post_id'); }
}
