<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TicketListing extends Model
{
    protected $fillable = [
        'user_id', 'event_id', 'seat_info', 'asking_price', 'contact', 'status',
        'moderation_status', 'reviewed_by', 'reviewed_at', 'rejection_reason',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    protected function casts(): array
    {
        return ['reviewed_at' => 'datetime'];
    }
}
