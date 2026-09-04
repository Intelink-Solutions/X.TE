<x-guest-layout>
    <x-authentication-card>
        <x-slot name="logo">
            <x-authentication-card-logo />
        </x-slot>

        <p class="mt-6 text-center text-xs uppercase tracking-[0.3em] text-white/40">X'Touch Control Panel</p>

        <x-validation-errors class="mt-4" />

        @session('status')
            <div class="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm font-medium text-emerald-300">
                {{ $value }}
            </div>
        @endsession

        <form method="POST" action="{{ route('login') }}" class="mt-6">
            @csrf

            <div>
                <x-label for="email" value="{{ __('Email') }}" />
                <x-input id="email" class="block mt-1" type="email" name="email" :value="old('email')" required autofocus autocomplete="username" />
            </div>

            <div class="mt-4">
                <x-label for="password" value="{{ __('Password') }}" />
                <x-input id="password" class="block mt-1" type="password" name="password" required autocomplete="current-password" />
            </div>

            @if (config('services.recaptcha.site_key'))
                <div class="mt-4 g-recaptcha" data-sitekey="{{ config('services.recaptcha.site_key') }}"></div>
            @endif

            <div class="block mt-4">
                <label for="remember_me" class="flex items-center">
                    <x-checkbox id="remember_me" name="remember" />
                    <span class="ms-2 text-sm text-white/50">{{ __('Remember me') }}</span>
                </label>
            </div>

            <div class="flex items-center justify-between mt-6">
                @if (Route::has('password.request'))
                    <a class="text-sm text-white/50 hover:text-white transition-colors" href="{{ route('password.request') }}">
                        {{ __('Forgot your password?') }}
                    </a>
                @endif

                <x-button>
                    {{ __('Sign in') }}
                </x-button>
            </div>
        </form>

        <div class="mt-6 flex items-center gap-3 text-xs uppercase tracking-widest text-white/30">
            <span class="h-px flex-1 bg-white/10"></span>
            or
            <span class="h-px flex-1 bg-white/10"></span>
        </div>

        <a
            href="{{ route('auth.google.redirect') }}"
            class="mt-6 flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors"
        >
            <svg class="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"/><path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3a7.4 7.4 0 0 1-11-3.89H1.06v3.09A12 12 0 0 0 12 24Z"/><path fill="#FBBC05" d="M5.07 14.2a7.2 7.2 0 0 1 0-4.4V6.71H1.06a12 12 0 0 0 0 10.58l4.01-3.09Z"/><path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.59 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.06 6.71l4.01 3.09A7.16 7.16 0 0 1 12 4.75Z"/></svg>
            Continue with Google
        </a>

    </x-authentication-card>

    @if (config('services.recaptcha.site_key'))
        <script src="https://www.google.com/recaptcha/api.js" async defer></script>
    @endif
</x-guest-layout>
