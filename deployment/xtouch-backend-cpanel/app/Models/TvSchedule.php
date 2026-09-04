<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TvSchedule extends Model
{
    protected $fillable = [
        'feed_post_id', 'show_name', 'time', 'tag', 'channel', 'stream_url', 'stream_provider',
        'description', 'day_of_week', 'starts_at', 'ends_at', 'is_live', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'is_live' => 'boolean',
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];
}
