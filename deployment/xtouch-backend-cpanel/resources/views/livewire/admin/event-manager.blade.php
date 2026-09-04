<x-slot name="header"><h2 class="font-semibold text-xl text-gray-800">Events</h2></x-slot>
<div class="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="mb-6 flex justify-end"><button type="button" wire:click="create" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">+ Add Event</button></div>
    @if(session('message'))<div class="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{{ session('message') }}</div>@endif
    <div class="mb-4"><input wire:model.live.debounce.300ms="search" placeholder="Search events..." class="w-64 border border-gray-300 rounded-lg px-4 py-2 text-sm"></div>
    @if($showForm)
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 overflow-y-auto max-h-[90vh]">
            <h3 class="text-lg font-bold mb-4">{{ $editingId ? 'Edit Event' : 'New Event' }}</h3>
            <form wire:submit="save" class="grid gap-4">
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Name *</label><input wire:model="name" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Venue *</label><input wire:model="venue" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"></div>
                <div class="grid grid-cols-2 gap-3">
                    <div><label class="block text-sm font-medium text-gray-700 mb-1">Starts At *</label><input wire:model="starts_at" type="datetime-local" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"></div>
                    <div><label class="block text-sm font-medium text-gray-700 mb-1">Ends At</label><input wire:model="ends_at" type="datetime-local" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"></div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div><label class="block text-sm font-medium text-gray-700 mb-1">Price</label><input wire:model="price" placeholder="e.g. K350" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"></div>
                    <div><label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select wire:model="status" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                            <option value="on_sale">On Sale</option><option value="selling_fast">Selling Fast</option><option value="few_left">Few Left</option><option value="sold_out">Sold Out</option>
                        </select></div>
                </div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea wire:model="description" rows="2" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"></textarea></div>
                <div class="flex gap-4"><label class="flex items-center gap-2 text-sm"><input type="checkbox" wire:model="is_featured"> Featured</label><label class="flex items-center gap-2 text-sm"><input type="checkbox" wire:model="is_active"> Active</label></div>
                <div class="flex justify-end gap-3"><button type="button" wire:click="$set('showForm',false)" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button><button type="submit" class="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button></div>
            </form>
        </div>
    </div>
    @endif
    <div class="bg-white rounded-xl shadow overflow-hidden">
        <table class="min-w-full text-sm"><thead class="bg-gray-50 text-gray-500 uppercase text-xs"><tr><th class="px-6 py-3 text-left">Event</th><th class="px-6 py-3 text-left">Venue</th><th class="px-6 py-3 text-left">Date</th><th class="px-6 py-3 text-left">Price</th><th class="px-6 py-3 text-left">Status</th><th class="px-6 py-3 text-left">Actions</th></tr></thead>
        <tbody class="divide-y">
        @forelse($events as $e)
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-3 font-medium">{{ $e->name }}</td>
            <td class="px-6 py-3 text-gray-500">{{ $e->venue }}</td>
            <td class="px-6 py-3 text-gray-500">{{ $e->starts_at->format('d M Y H:i') }}</td>
            <td class="px-6 py-3 font-semibold text-indigo-600">{{ $e->price ?? '—' }}</td>
            <td class="px-6 py-3"><span class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">{{ str_replace('_',' ',ucfirst($e->status)) }}</span></td>
            <td class="px-6 py-3 flex gap-2"><button wire:click="edit({{ $e->id }})" class="text-indigo-600 hover:underline text-xs">Edit</button><button wire:click="delete({{ $e->id }})" wire:confirm="Delete this event?" class="text-red-500 hover:underline text-xs">Delete</button></td>
        </tr>
        @empty<tr><td colspan="6" class="px-6 py-4 text-gray-400">No events.</td></tr>
        @endforelse
        </tbody></table>
        <div class="px-6 py-4">{{ $events->links() }}</div>
    </div>
</div>
