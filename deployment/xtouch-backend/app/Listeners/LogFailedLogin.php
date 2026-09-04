<?php

namespace App\Listeners;

use App\Models\LoginHistory;
use Illuminate\Auth\Events\Failed;

class LogFailedLogin
{
    public function handle(Failed $event): void
    {
        $request = request();

        LoginHistory::create([
            'user_id' => $event->user?->getKey(),
            'email' => $event->credentials['email'] ?? $event->user?->email,
            'ip_address' => $request->ip(),
            'user_agent' => (string) $request->userAgent(),
            'successful' => false,
        ]);
    }
}
