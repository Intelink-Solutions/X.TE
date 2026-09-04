<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContentView extends Model
{
    protected $fillable = [
        'viewable_type', 'viewable_id', 'viewer_key', 'user_id',
    ];
}
