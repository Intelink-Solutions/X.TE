<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeedPostRepost extends Model
{
    protected $fillable = ['feed_post_id', 'user_id'];
}
