<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'X\'Touch Admin') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @vite(['resources/css/app.css', 'resources/js/app.js'])

        <!-- Styles -->
        @livewireStyles
        <style>
            :root {
                --gold: #d4af37;
                --gold-light: #e5c158;
                --dark-bg: #0d0710;
                --dark-card: #1a1420;
                --dark-border: #2d2535;
            }
            body { background: linear-gradient(135deg, #0d0710 0%, #1a1420 100%); color: #e5e7eb; font-family: 'Inter', sans-serif; }
            .bg-admin-dark { background-color: var(--dark-bg); }
            .bg-admin-card { background-color: var(--dark-card); border: 1px solid var(--dark-border); }
            .text-gold { color: var(--gold); }
            .bg-gold { background-color: var(--gold); }
            .hover\:bg-gold:hover { background-color: var(--gold-light); }
            .border-gold { border-color: var(--gold); }
            .rounded-xl { border-radius: 0.75rem; }
        </style>
    </head>
    <body class="font-sans antialiased bg-admin-dark">
        <x-banner />

        <div class="min-h-screen">
            @livewire('navigation-menu')

            <!-- Page Heading -->
            @if (isset($header))
                <header class="bg-admin-card shadow-lg border-b border-gold/20">
                    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        {{ $header }}
                    </div>
                </header>
            @endif

            <!-- Page Content -->
            <main>
                {{ $slot }}
            </main>
        </div>

        @stack('modals')

        @livewireScripts
        <script>
            // A full-page Livewire component's named header slot is rendered by the
            // layout, so legacy header buttons are outside its normal event boundary.
            // Forward those actions to the page component until each screen is migrated.
            document.addEventListener('click', function (event) {
                const button = event.target.closest('header [wire\\:click]');
                if (!button || typeof Livewire === 'undefined') return;

                const action = button.getAttribute('wire:click');
                if (!action || action.includes('(')) return;

                const component = document.querySelector('main [wire\\:id]');
                if (!component) return;

                event.preventDefault();
                Livewire.find(component.getAttribute('wire:id')).call(action);
            });
        </script>
    </body>
</html>
