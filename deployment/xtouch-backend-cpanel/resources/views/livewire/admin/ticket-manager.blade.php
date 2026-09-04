<x-slot name="header"><h2 class="font-semibold text-2xl text-gold">Tickets & Resale</h2></x-slot>
<div class="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    @if(session('message'))<div class="mb-4 rounded-lg border border-green-500/50 bg-green-900/30 px-4 py-3 text-green-300">{{ session('message') }}</div>@endif
    <div class="mb-6 flex gap-3">
        <button type="button" wire:click="$set('tab','orders')" @class(['rounded-lg px-4 py-2 text-sm font-semibold','bg-gold text-black'=>$tab==='orders','bg-admin-card text-gray-300'=>$tab!=='orders'])>Orders ({{ $pendingOrders }} pending)</button>
        <button type="button" wire:click="$set('tab','listings')" @class(['rounded-lg px-4 py-2 text-sm font-semibold','bg-gold text-black'=>$tab==='listings','bg-admin-card text-gray-300'=>$tab!=='listings'])>Resale listings ({{ $pendingListings }} pending)</button>
    </div>
    <div class="overflow-x-auto rounded-xl bg-admin-card">
        @if($tab === 'orders')
        <table class="min-w-full text-sm"><thead class="border-b border-white/10 text-left text-xs uppercase text-gray-400"><tr><th class="p-4">Buyer</th><th class="p-4">Event</th><th class="p-4">Qty</th><th class="p-4">QR Code</th><th class="p-4">Status</th><th class="p-4">Actions</th></tr></thead><tbody>
        @forelse($orders as $order)<tr class="border-b border-white/5"><td class="p-4"><b>{{ $order->buyer_name }}</b><br><span class="text-gray-400">{{ $order->buyer_email }}</span></td><td class="p-4">{{ $order->event?->name ?? 'Deleted event' }}</td><td class="p-4">{{ $order->quantity }}</td><td class="p-4 font-mono text-xs">{{ $order->qr_code ?: 'Generated on confirmation' }}</td><td class="p-4 capitalize">{{ $order->status }}</td><td class="p-4 space-x-2"><button wire:click="updateOrder({{ $order->id }},'confirmed')" class="text-green-400">Confirm</button><button wire:click="updateOrder({{ $order->id }},'cancelled')" class="text-red-400">Cancel</button></td></tr>
        @empty<tr><td colspan="6" class="p-8 text-center text-gray-400">No ticket orders.</td></tr>@endforelse</tbody></table>
        @else
        <table class="min-w-full text-sm"><thead class="border-b border-white/10 text-left text-xs uppercase text-gray-400"><tr><th class="p-4">Event</th><th class="p-4">Seat</th><th class="p-4">Price</th><th class="p-4">Contact</th><th class="p-4">Moderation</th><th class="p-4">Actions</th></tr></thead><tbody>
        @forelse($listings as $listing)<tr class="border-b border-white/5"><td class="p-4">{{ $listing->event?->name ?? 'Deleted event' }}</td><td class="p-4">{{ $listing->seat_info }}</td><td class="p-4 text-gold">{{ $listing->asking_price }}</td><td class="p-4">{{ $listing->contact }}</td><td class="p-4 capitalize">{{ $listing->moderation_status }} / {{ $listing->status }}</td><td class="p-4 space-x-2"><button wire:click="reviewListing({{ $listing->id }},'approved')" class="text-green-400">Approve</button><button wire:click="reviewListing({{ $listing->id }},'rejected')" class="text-red-400">Reject</button><button wire:click="updateListingStatus({{ $listing->id }},'sold')" class="text-blue-400">Sold</button></td></tr>
        @empty<tr><td colspan="6" class="p-8 text-center text-gray-400">No resale listings.</td></tr>@endforelse</tbody></table>
        @endif
    </div>
</div>
