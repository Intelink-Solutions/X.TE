<x-slot name="header">
    <h2 class="font-semibold text-xl text-gray-800 leading-tight">Admin Dashboard</h2>
</x-slot>

<div class="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    @if(session('message'))
        <div class="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{{ session('message') }}</div>
    @endif

    {{-- Quick actions --}}
    <div class="mb-8 flex flex-wrap gap-3">
        <a href="{{ route('admin.site-content') }}" class="inline-flex items-center rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-2 text-sm font-bold text-black shadow hover:opacity-90">
            ✨ Edit Site Content
        </a>
        <a href="{{ route('admin.feed-posts') }}" class="inline-flex items-center rounded-full border border-gold/40 bg-admin-card px-4 py-2 text-sm font-semibold text-gold hover:border-gold">
            📰 Manage Feed Posts
        </a>
        <a href="{{ route('admin.user-approvals') }}" class="inline-flex items-center rounded-full border border-gold/40 bg-admin-card px-4 py-2 text-sm font-semibold text-gold">User approvals</a>
        <a href="{{ route('admin.tickets') }}" class="inline-flex items-center rounded-full border border-gold/40 bg-admin-card px-4 py-2 text-sm font-semibold text-gold">Tickets</a>
        <a href="{{ route('admin.reports') }}" class="inline-flex items-center rounded-full border border-gold/40 bg-admin-card px-4 py-2 text-sm font-semibold text-gold">Reports</a>
        <a href="{{ route('admin.analytics') }}" class="inline-flex items-center rounded-full border border-gold/40 bg-admin-card px-4 py-2 text-sm font-semibold text-gold">Analytics</a>
        <a href="{{ route('admin.email-settings') }}" class="inline-flex items-center rounded-full border border-gold/40 bg-admin-card px-4 py-2 text-sm font-semibold text-gold">Email setup</a>
    </div>

    <div class="mb-8 rounded-xl bg-admin-card p-5">
        <h3 class="mb-4 font-bold text-gold">Manage website</h3>
        <div class="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 lg:grid-cols-5">
            @foreach([
                'Artists'=>'admin.artists','Dancers'=>'admin.dancers','Music & approvals'=>'admin.tracks','Events'=>'admin.events','Bookings'=>'admin.bookings',
                'Feed posts'=>'admin.feed-posts','TV schedule'=>'admin.tv-schedule','Blog'=>'admin.blog-posts','Gallery'=>'admin.gallery','Podcast'=>'admin.podcast',
                'Store'=>'admin.store-products','Jobs'=>'admin.careers','Messages'=>'admin.contact-messages','Tickets'=>'admin.tickets','Users'=>'admin.user-approvals','Email setup'=>'admin.email-settings'
            ] as $label => $route)
                <a href="{{ route($route) }}" class="rounded-lg border border-white/10 px-3 py-3 text-gray-200 transition hover:border-gold/50 hover:text-gold">{{ $label }}</a>
            @endforeach
        </div>
    </div>

    {{-- Stats grid --}}
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        @foreach($stats as $stat)
        <div class="bg-white rounded-xl shadow p-5">
            <p class="text-sm text-gray-500">{{ $stat['label'] }}</p>
            <p class="text-3xl font-black text-gray-900 mt-1">{{ $stat['value'] }}</p>
        </div>
        @endforeach
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
        {{-- Recent bookings --}}
        <div class="lg:col-span-2 bg-white rounded-xl shadow">
            <div class="px-6 py-4 border-b font-semibold text-gray-700 flex justify-between items-center">
                Recent Bookings
                <a href="{{ route('admin.bookings') }}" class="text-sm text-indigo-600 hover:underline">View all</a>
            </div>
            <ul class="divide-y">
                @forelse($recentBookings as $b)
                <li class="px-6 py-3 flex items-center justify-between text-sm">
                    <div>
                        <p class="font-medium text-gray-900">{{ $b->client_name }} <span class="text-gray-400 font-normal">— {{ $b->service_type }}</span></p>
                        <p class="text-gray-400">{{ $b->client_email }}</p>
                    </div>
                    <span @class(['text-xs px-2 py-1 rounded-full font-semibold',
                        'bg-yellow-100 text-yellow-700' => $b->status === 'pending',
                        'bg-green-100 text-green-700'  => $b->status === 'confirmed',
                        'bg-red-100 text-red-700'      => $b->status === 'rejected',
                        'bg-gray-100 text-gray-600'    => $b->status === 'completed',
                    ])>{{ ucfirst($b->status) }}</span>
                </li>
                @empty
                <li class="px-6 py-4 text-gray-400 text-sm">No bookings yet.</li>
                @endforelse
            </ul>
        </div>

        {{-- Unread messages --}}
        <div class="bg-white rounded-xl shadow">
            <div class="px-6 py-4 border-b font-semibold text-gray-700 flex justify-between items-center">
                Unread Messages
                <a href="{{ route('admin.contact-messages') }}" class="text-sm text-indigo-600 hover:underline">View all</a>
            </div>
            <ul class="divide-y">
                @forelse($recentMessages as $m)
                <li class="px-6 py-3">
                    <p class="font-medium text-sm text-gray-900">{{ $m->name }}</p>
                    <p class="text-xs text-gray-400 mt-0.5">{{ $m->subject ?? 'No subject' }}</p>
                    <p class="text-xs text-gray-500 mt-1 line-clamp-2">{{ $m->message }}</p>
                </li>
                @empty
                <li class="px-6 py-4 text-gray-400 text-sm">Inbox clear!</li>
                @endforelse
            </ul>
        </div>
    </div>

    {{-- Recent ticket orders --}}
    <div class="mt-6 bg-white rounded-xl shadow">
        <div class="px-6 py-4 border-b font-semibold text-gray-700">Recent Ticket Orders</div>
        <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-gray-500 uppercase text-xs">
                    <tr>
                        <th class="px-6 py-3 text-left">Buyer</th>
                        <th class="px-6 py-3 text-left">Event</th>
                        <th class="px-6 py-3 text-left">Qty</th>
                        <th class="px-6 py-3 text-left">QR</th>
                        <th class="px-6 py-3 text-left">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y">
                    @forelse($recentOrders as $o)
                    <tr>
                        <td class="px-6 py-3">{{ $o->buyer_name }}<br><span class="text-gray-400">{{ $o->buyer_email }}</span></td>
                        <td class="px-6 py-3">{{ $o->event?->name ?? '—' }}</td>
                        <td class="px-6 py-3">{{ $o->quantity }}</td>
                        <td class="px-6 py-3 font-mono text-xs">{{ $o->qr_code }}</td>
                        <td class="px-6 py-3"><span class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">{{ ucfirst($o->status) }}</span></td>
                    </tr>
                    @empty
                    <tr><td colspan="5" class="px-6 py-4 text-gray-400">No orders yet.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
