<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dancer extends Model
{
    protected $fillable = [
        'name', 'slug', 'role', 'speciality', 'bio',
        'image_url', 'is_featured', 'is_active',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'is_active'   => 'boolean',
    ];
}
