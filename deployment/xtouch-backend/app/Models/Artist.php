<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Artist extends Model
{
    protected $fillable = [
        'user_id', 'name', 'slug', 'role', 'genre', 'monthly_listeners',
        'bio', 'image_url', 'instagram_url', 'spotify_url',
        'is_featured', 'is_active',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function tracks(): HasMany
    {
        return $this->hasMany(Track::class);
    }

    public function followers(): HasMany
    {
        return $this->hasMany(ArtistFollow::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
