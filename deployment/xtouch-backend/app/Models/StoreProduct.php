<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreProduct extends Model
{
    protected $fillable = [
        'name', 'slug', 'category', 'description', 'price',
        'currency', 'image_url', 'stock', 'is_featured', 'is_active',
    ];

    protected $casts = [
        'price'       => 'decimal:2',
        'is_featured' => 'boolean',
        'is_active'   => 'boolean',
    ];
}
