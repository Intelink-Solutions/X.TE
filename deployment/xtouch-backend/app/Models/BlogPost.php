<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlogPost extends Model
{
    protected $fillable = [
        'title', 'slug', 'category', 'tags', 'excerpt', 'body', 'author',
        'read_time', 'image_url', 'published_at', 'is_featured', 'is_published',
    ];

    protected $casts = [
        'published_at' => 'date',
        'is_featured' => 'boolean',
        'is_published' => 'boolean',
        'tags' => 'array',
    ];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
