<?php

namespace App\Actions\Auth;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

/**
 * No-ops when RECAPTCHA_SECRET_KEY isn't configured, so local/demo
 * logins keep working without real Google credentials. Set the key
 * in .env (and render the widget — see auth/login.blade.php) to
 * enforce it for real.
 */
class VerifyRecaptcha
{
    public function handle(Request $request, callable $next)
    {
        $secret = config('services.recaptcha.secret');

        if (! $secret) {
            return $next($request);
        }

        $token = $request->input('g-recaptcha-response');

        $verified = $token && Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret' => $secret,
            'response' => $token,
            'remoteip' => $request->ip(),
        ])->json('success', false);

        if (! $verified) {
            throw ValidationException::withMessages([
                'email' => __('Please confirm you are not a robot.'),
            ]);
        }

        return $next($request);
    }
}
