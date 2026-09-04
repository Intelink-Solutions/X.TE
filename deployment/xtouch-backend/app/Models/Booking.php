<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'service_type', 'client_name', 'client_email', 'client_phone',
        'preferred_date', 'preferred_time', 'location', 'duration', 'budget',
        'attendees', 'contact_method', 'project_details', 'status', 'admin_notes',
    ];

    protected $appends = ['reference'];

    protected $casts = [
        'preferred_date' => 'date',
        'attendees' => 'integer',
    ];

    public function getReferenceAttribute(): string
    {
        return 'XTB-'.str_pad((string) $this->id, 6, '0', STR_PAD_LEFT);
    }
}
