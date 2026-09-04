<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeedPostBookmark extends Model
{
    protected $fillable = ['feed_post_id', 'user_id'];

    public function feedPost()
    {
        return $this->belongsTo(FeedPost::class);
    }
}
