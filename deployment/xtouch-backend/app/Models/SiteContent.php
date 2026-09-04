<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteContent extends Model
{
    protected $fillable = ['page', 'section', 'key', 'value', 'image_url', 'type', 'is_active'];
    protected $casts = ['is_active' => 'boolean'];
}
