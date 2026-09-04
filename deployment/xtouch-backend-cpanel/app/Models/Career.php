<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Career extends Model
{
    protected $fillable = [
        'title', 'department', 'location', 'type',
        'description', 'requirements', 'salary_range', 'closes_at', 'is_active',
    ];

    protected $casts = [
        'closes_at' => 'date',
        'is_active' => 'boolean',
    ];
}
