<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrackLike extends Model
{
    protected $fillable = ['track_id', 'user_id'];
}
