<?php

namespace App\Listeners;

use App\Models\LoginHistory;
use Illuminate\Auth\Events\Login;

class LogSuccessfulLogin
{
    public function handle(Login $event): void
    {
        $request = request();

        LoginHistory::create([
            'user_id' => $event->user->getKey(),
            'email' => $event->user->email,
            'ip_address' => $request->ip(),
            'user_agent' => (string) $request->userAgent(),
            'successful' => true,
            'device' => $this->guessDevice((string) $request->userAgent()),
        ]);

        $event->user->forceFill([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ])->saveQuietly();
    }

    protected function guessDevice(string $userAgent): string
    {
        return match (true) {
            str_contains($userAgent, 'Mobile') => 'Mobile',
            str_contains($userAgent, 'Tablet') => 'Tablet',
            default => 'Desktop',
        };
    }
}
