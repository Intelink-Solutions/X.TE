<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\LoginHistory;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\Response;

class SocialAuthController extends Controller
{
    public function redirect(): RedirectResponse|Response
    {
        if (! config('services.google.client_id')) {
            return redirect()->route('login')->with('status', 'Google sign-in isn\'t configured yet.');
        }

        return Socialite::driver('google')->redirect();
    }

    public function callback(): RedirectResponse
    {
        if (! config('services.google.client_id')) {
            return redirect()->route('login');
        }

        $googleUser = Socialite::driver('google')->stateless()->user();

        // Control panel only: never auto-create accounts from a social login.
        // The Google email must already belong to a user created via the
        // Users module.
        $user = User::where('email', $googleUser->getEmail())->first();

        if (! $user) {
            return redirect()->route('login')->withErrors([
                'email' => 'No control panel account was found for this Google email. Ask the site owner to create one first.',
            ]);
        }

        if ($user->isBlocked()) {
            return redirect()->route('login')->withErrors([
                'email' => 'This account has been blocked.',
            ]);
        }

        if (! $user->google_id) {
            $user->forceFill(['google_id' => $googleUser->getId()])->save();
        }

        Auth::login($user, remember: true);

        LoginHistory::create([
            'user_id' => $user->id,
            'email' => $user->email,
            'ip_address' => request()->ip(),
            'user_agent' => (string) request()->userAgent(),
            'successful' => true,
            'device' => 'Google OAuth',
        ]);

        $user->forceFill(['last_login_at' => now(), 'last_login_ip' => request()->ip()])->saveQuietly();

        return redirect()->intended(route('admin.dashboard', absolute: false));
    }
}
