<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TicketOrder extends Model
{
    protected $fillable = [
        'event_id', 'buyer_name', 'buyer_email',
        'quantity', 'qr_code', 'status',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
