<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnalyticsEvent extends Model
{
    protected $fillable = [
        'user_id', 'session_id', 'event_type', 'path', 'entity_type',
        'entity_id', 'metadata', 'ip_hash',
    ];

    protected $casts = ['metadata' => 'array'];
}
