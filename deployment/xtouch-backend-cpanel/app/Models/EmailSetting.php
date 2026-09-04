<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailSetting extends Model
{
    protected $fillable = [
        'host', 'port', 'encryption', 'username', 'password',
        'from_address', 'from_name', 'submissions_to', 'is_enabled',
        'last_tested_at', 'last_test_status', 'last_test_error',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'encrypted',
            'port' => 'integer',
            'is_enabled' => 'boolean',
            'last_tested_at' => 'datetime',
        ];
    }
}
