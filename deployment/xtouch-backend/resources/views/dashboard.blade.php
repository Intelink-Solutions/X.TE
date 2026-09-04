<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Dashboard') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-xl sm:rounded-lg p-6">
                <h3 class="text-lg font-bold text-gray-900 mb-4">Welcome to X'Touch Control Panel</h3>
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    @foreach([
                        ['Admin Dashboard','admin.dashboard','📊'],
                        ['Site Content','admin.site-content','🧩'],
                        ['Artists','admin.artists','🎤'],
                        ['Dancers','admin.dancers','💃'],
                        ['Tracks','admin.tracks','🎵'],
                        ['Events','admin.events','🎪'],
                        ['Bookings','admin.bookings','📋'],
                        ['Feed Posts','admin.feed-posts','📰'],
                        ['TV Schedule','admin.tv-schedule','📺'],
                        ['Blog Posts','admin.blog-posts','✍️'],
                        ['Gallery','admin.gallery','🖼️'],
                        ['Podcast','admin.podcast','🎙️'],
                        ['Store','admin.store-products','🛍️'],
                        ['Careers','admin.careers','💼'],
                        ['Messages','admin.contact-messages','✉️'],
                    ] as [$label, $route, $icon])
                    <a href="{{ route($route) }}" class="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-colors text-center">
                        <span class="text-2xl">{{ $icon }}</span>
                        <span class="text-sm font-medium text-gray-700">{{ $label }}</span>
                    </a>
                    @endforeach
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
