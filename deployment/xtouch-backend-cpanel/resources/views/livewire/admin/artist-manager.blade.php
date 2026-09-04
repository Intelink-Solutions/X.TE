<x-slot name="header">
    <h2 class="font-semibold text-2xl text-gold">Artists</h2>
</x-slot>

<div class="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="mb-6 flex justify-end"><button type="button" wire:click="create" class="bg-gold text-black px-5 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-400 transition">+ Add Artist</button></div>
    @if(session('message'))<div class="mb-4 bg-green-900/30 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg">{{ session('message') }}</div>@endif

    {{-- Search --}}
    <div class="mb-6"><input wire:model.live.debounce.300ms="search" placeholder="Search artists..." class="w-full sm:w-96 bg-admin-card border border-gold/30 rounded-lg px-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-gold focus:border-transparent"></div>

    {{-- Form Modal --}}
    @if($showForm)
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div class="bg-admin-card border border-gold/20 rounded-2xl shadow-2xl w-full max-w-2xl p-8 overflow-y-auto max-h-[90vh]">
            <h3 class="text-2xl font-bold text-gold mb-6">{{ $editingId ? 'Edit Artist' : 'New Artist' }}</h3>
            <form wire:submit="save" class="grid gap-5">
                <div class="grid grid-cols-2 gap-4">
                    <div><label class="block text-sm font-semibold text-gray-300 mb-2">Name *</label><input wire:model="name" required class="w-full bg-dark-bg border border-gold/20 rounded-lg px-4 py-2 text-sm text-gray-100 focus:ring-2 focus:ring-gold"></div>
                    <div><label class="block text-sm font-semibold text-gray-300 mb-2">Role *</label><input wire:model="role" required class="w-full bg-dark-bg border border-gold/20 rounded-lg px-4 py-2 text-sm text-gray-100 focus:ring-2 focus:ring-gold"></div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div><label class="block text-sm font-semibold text-gray-300 mb-2">Genre</label><input wire:model="genre" class="w-full bg-dark-bg border border-gold/20 rounded-lg px-4 py-2 text-sm text-gray-100 focus:ring-2 focus:ring-gold"></div>
                    <div><label class="block text-sm font-semibold text-gray-300 mb-2">Monthly Listeners</label><input wire:model="monthly_listeners" placeholder="e.g. 1.9M" class="w-full bg-dark-bg border border-gold/20 rounded-lg px-4 py-2 text-sm text-gray-100 focus:ring-2 focus:ring-gold"></div>
                </div>
                <div><label class="block text-sm font-semibold text-gray-300 mb-2">Bio</label><textarea wire:model="bio" rows="3" class="w-full bg-dark-bg border border-gold/20 rounded-lg px-4 py-2 text-sm text-gray-100 focus:ring-2 focus:ring-gold"></textarea></div>
                <div>
                    <label class="block text-sm font-semibold text-gray-300 mb-2">Image</label>
                    @if($image)
                        <div class="mb-2"><img src="{{ $image->temporaryUrl() }}" class="h-24 rounded-lg object-cover"></div>
                    @endif
                    <input type="file" wire:model="image" accept="image/*" class="w-full bg-dark-bg border border-gold/20 rounded-lg px-4 py-2 text-sm text-gray-300">
                    @error('image') <span class="text-red-400 text-xs">{{ $message }}</span> @enderror
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div><label class="block text-sm font-semibold text-gray-300 mb-2">Instagram</label><input wire:model="instagram_url" class="w-full bg-dark-bg border border-gold/20 rounded-lg px-4 py-2 text-sm text-gray-100 focus:ring-2 focus:ring-gold"></div>
                    <div><label class="block text-sm font-semibold text-gray-300 mb-2">Spotify</label><input wire:model="spotify_url" class="w-full bg-dark-bg border border-gold/20 rounded-lg px-4 py-2 text-sm text-gray-100 focus:ring-2 focus:ring-gold"></div>
                </div>
                <div class="flex gap-4">
                    <label class="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" wire:model="is_featured" class="accent-gold"> Featured</label>
                    <label class="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" wire:model="is_active" class="accent-gold"> Active</label>
                </div>
                <div class="flex justify-end gap-3 mt-4 pt-4 border-t border-gold/10">
                    <button type="button" wire:click="$set('showForm',false)" class="px-5 py-2 text-sm border border-gold/30 rounded-lg text-gray-300 hover:bg-gold/10 transition">Cancel</button>
                    <button type="submit" class="px-5 py-2 text-sm bg-gold text-black font-semibold rounded-lg hover:bg-yellow-400 transition">Save</button>
                </div>
            </form>
        </div>
    </div>
    @endif

    {{-- Table --}}
    <div class="bg-admin-card rounded-xl shadow-lg overflow-hidden">
        <table class="min-w-full text-sm">
            <thead class="bg-gold/10 text-gold uppercase text-xs font-bold border-b border-gold/20"><tr>
                <th class="px-6 py-4 text-left">Name</th>
                <th class="px-6 py-4 text-left">Role</th>
                <th class="px-6 py-4 text-left">Listeners</th>
                <th class="px-6 py-4 text-left">Status</th>
                <th class="px-6 py-4 text-left">Actions</th>
            </tr></thead>
            <tbody class="divide-y divide-gold/10">
                @forelse($artists as $artist)
                <tr class="hover:bg-gold/5 transition">
                    <td class="px-6 py-4 font-medium text-gray-100">{{ $artist->name }}@if($artist->is_featured) <span class="ml-1 text-gold">★</span>@endif</td>
                    <td class="px-6 py-4 text-gray-400">{{ $artist->role }}</td>
                    <td class="px-6 py-4 text-gray-400">{{ $artist->monthly_listeners ?? '—' }}</td>
                    <td class="px-6 py-4"><span @class(['text-xs px-3 py-1 rounded-full font-semibold', 'bg-green-900/30 text-green-300'=>$artist->is_active, 'bg-gray-900/30 text-gray-400'=>!$artist->is_active])>{{ $artist->is_active ? 'Active' : 'Inactive' }}</span></td>
                    <td class="px-6 py-4 flex gap-3">
                        <button wire:click="edit({{ $artist->id }})" class="text-gold hover:text-yellow-400 text-xs font-semibold">Edit</button>
                        <button wire:click="delete({{ $artist->id }})" wire:confirm="Delete {{ $artist->name }}?" class="text-red-400 hover:text-red-300 text-xs font-semibold">Delete</button>
                    </td>
                </tr>
                @empty
                <tr><td colspan="5" class="px-6 py-4 text-gray-500 text-center">No artists found.</td></tr>
                @endforelse
            </tbody>
        </table>
        <div class="px-6 py-4 text-gray-400 text-sm">{{ $artists->links() }}</div>
    </div>
</div>
