<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    protected $fillable = [
        'feed_post_id', 'name', 'slug', 'description', 'venue', 'location',
        'starts_at', 'ends_at', 'price', 'ticket_url', 'status', 'capacity',
        'image_url', 'is_featured', 'is_active',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function ticketOrders(): HasMany
    {
        return $this->hasMany(TicketOrder::class);
    }

    public function ticketListings(): HasMany
    {
        return $this->hasMany(TicketListing::class);
    }
}
