<x-guest-layout>
    <x-authentication-card>
        <x-slot name="logo">
            <x-authentication-card-logo />
        </x-slot>

        <div class="mb-6">
            <h1 class="text-2xl font-black text-white">{{ __('Reset your password') }}</h1>
            <p class="mt-2 text-sm leading-relaxed text-white/50">
                {{ __("Enter the email used for your X'Touch Media account. We will send you a secure link to choose a new password.") }}
            </p>
        </div>

        @session('status')
            <div class="mb-4 font-medium text-sm text-green-600">
                {{ $value }}
            </div>
        @endsession

        <x-validation-errors class="mb-4" />

        <form method="POST" action="{{ route('password.email') }}">
            @csrf

            <div class="block">
                <x-label for="email" value="{{ __('Email') }}" />
                <x-input id="email" class="block mt-1 w-full" type="email" name="email" :value="old('email')" required autofocus autocomplete="username" />
            </div>

            <div class="mt-5 grid gap-4">
                <x-button class="w-full justify-center">
                    {{ __('Send password reset link') }}
                </x-button>
                <a href="{{ url('/login') }}" class="text-center text-sm font-semibold text-purple-300 hover:text-purple-200">
                    {{ __('Back to user login') }}
                </a>
            </div>
        </form>
    </x-authentication-card>
</x-guest-layout>
