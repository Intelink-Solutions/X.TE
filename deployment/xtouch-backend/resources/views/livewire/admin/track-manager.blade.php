<x-slot name="header">
    <h2 class="font-semibold text-2xl text-gold">Tracks</h2>
</x-slot>

<div class="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="mb-6 flex justify-end">
        <button type="button" wire:click="create" class="bg-gold text-black px-5 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-400 transition">+ Add Track</button>
    </div>
    @if(session('message'))<div class="mb-4 bg-green-900/30 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg">{{ session('message') }}</div>@endif
    
    <div class="mb-6 flex gap-3"><input wire:model.live.debounce.300ms="search" placeholder="Search tracks..." class="w-full sm:w-96 bg-admin-card border border-gold/30 rounded-lg px-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-gold"><select wire:model.live="filterApproval" class="bg-admin-card border border-gold/30 rounded-lg px-4 py-2 text-sm text-gray-200"><option value="">All approvals</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></div>
    
    @if($showForm)
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div class="bg-admin-card border border-gold/20 rounded-2xl shadow-2xl w-full max-w-2xl p-8 overflow-y-auto max-h-[90vh]">
            <h3 class="text-2xl font-bold text-gold mb-6">{{ $editingId ? 'Edit Track' : 'New Track' }}</h3>
            <form wire:submit="save" class="grid gap-5">
                <div>
                    <label class="block text-sm font-semibold text-gray-300 mb-2">Artist *</label>
                    <select wire:model="artist_id" required class="w-full bg-dark-bg border border-gold/20 rounded-lg px-4 py-2 text-sm text-gray-100 focus:ring-2 focus:ring-gold">
                        <option value="">Select artist...</option>
                        @foreach($artists as $id=>$name)<option value="{{ $id }}">{{ $name }}</option>@endforeach
                    </select>
                </div>
                <div><label class="block text-sm font-semibold text-gray-300 mb-2">Title *</label><input wire:model="title" required class="w-full bg-dark-bg border border-gold/20 rounded-lg px-4 py-2 text-sm text-gray-100 focus:ring-2 focus:ring-gold"></div>
                <div class="grid grid-cols-2 gap-4">
                    <div><label class="block text-sm font-semibold text-gray-300 mb-2">Album</label><input wire:model="album" class="w-full bg-dark-bg border border-gold/20 rounded-lg px-4 py-2 text-sm text-gray-100 focus:ring-2 focus:ring-gold"></div>
                    <div><label class="block text-sm font-semibold text-gray-300 mb-2">Duration</label><input wire:model="duration" placeholder="3:42" class="w-full bg-dark-bg border border-gold/20 rounded-lg px-4 py-2 text-sm text-gray-100 focus:ring-2 focus:ring-gold"></div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div><label class="block text-sm font-semibold text-gray-300 mb-2">Plays</label><input wire:model="plays" placeholder="1.2M" class="w-full bg-dark-bg border border-gold/20 rounded-lg px-4 py-2 text-sm text-gray-100 focus:ring-2 focus:ring-gold"></div>
                    <div><label class="block text-sm font-semibold text-gray-300 mb-2">Genre</label><input wire:model="genre" class="w-full bg-dark-bg border border-gold/20 rounded-lg px-4 py-2 text-sm text-gray-100 focus:ring-2 focus:ring-gold"></div>
                </div>
                <div><label class="block text-sm font-semibold text-gray-300 mb-2">Audio URL</label><input wire:model="audio_url" class="w-full bg-dark-bg border border-gold/20 rounded-lg px-4 py-2 text-sm text-gray-100 focus:ring-2 focus:ring-gold"></div>
                <div>
                    <label class="block text-sm font-semibold text-gray-300 mb-2">Album Art</label>
                    @if($cover)
                        <div class="mb-2"><img src="{{ $cover->temporaryUrl() }}" class="h-24 rounded-lg object-cover"></div>
                    @endif
                    <input type="file" wire:model="cover" accept="image/*" class="w-full bg-dark-bg border border-gold/20 rounded-lg px-4 py-2 text-sm text-gray-300">
                    @error('cover') <span class="text-red-400 text-xs">{{ $message }}</span> @enderror
                </div>
                <div class="flex gap-4"><label class="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" wire:model="is_featured" class="accent-gold"> Featured</label><label class="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" wire:model="is_active" class="accent-gold"> Active</label></div>
                <div class="flex justify-end gap-3 mt-4 pt-4 border-t border-gold/10">
                    <button type="button" wire:click="$set('showForm',false)" class="px-5 py-2 text-sm border border-gold/30 rounded-lg text-gray-300 hover:bg-gold/10 transition">Cancel</button>
                    <button type="submit" class="px-5 py-2 text-sm bg-gold text-black font-semibold rounded-lg hover:bg-yellow-400 transition">Save</button>
                </div>
            </form>
        </div>
    </div>
    @endif
    
    <div class="bg-admin-card rounded-xl shadow-lg overflow-hidden">
        <table class="min-w-full text-sm">
            <thead class="bg-gold/10 text-gold uppercase text-xs font-bold border-b border-gold/20">
                <tr>
                    <th class="px-6 py-4 text-left">Title</th>
                    <th class="px-6 py-4 text-left">Artist</th>
                    <th class="px-6 py-4 text-left">Album</th>
                    <th class="px-6 py-4 text-left">Duration</th>
                    <th class="px-6 py-4 text-left">Plays</th>
                    <th class="px-6 py-4 text-left">Approval</th>
                    <th class="px-6 py-4 text-left">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gold/10">
                @forelse($tracks as $t)
                <tr class="hover:bg-gold/5 transition">
                    <td class="px-6 py-4 font-medium text-gray-100">{{ $t->title }}@if($t->is_featured) <span class="ml-1 text-gold">★</span>@endif</td>
                    <td class="px-6 py-4 text-gray-400">{{ $t->artist?->name ?? '—' }}</td>
                    <td class="px-6 py-4 text-gray-400">{{ $t->album ?? '—' }}</td>
                    <td class="px-6 py-4 text-gray-400">{{ $t->duration ?? '—' }}</td>
                    <td class="px-6 py-4 text-gray-400">{{ $t->plays ?? '—' }}</td>
                    <td class="px-6 py-4 capitalize">{{ $t->approval_status }}</td>
                    <td class="px-6 py-4 flex gap-3">
                        <button wire:click="edit({{ $t->id }})" class="text-gold hover:text-yellow-400 text-xs font-semibold">Edit</button>
                        @if($t->approval_status !== 'approved')<button wire:click="review({{ $t->id }},'approved')" class="text-green-400 text-xs font-semibold">Approve</button>@endif
                        @if($t->approval_status !== 'rejected')<button wire:click="review({{ $t->id }},'rejected')" class="text-orange-400 text-xs font-semibold">Reject</button>@endif
                        <button wire:click="delete({{ $t->id }})" wire:confirm="Delete track?" class="text-red-400 hover:text-red-300 text-xs font-semibold">Delete</button>
                    </td>
                </tr>
                @empty<tr><td colspan="7" class="px-6 py-4 text-gray-500 text-center">No tracks found.</td></tr>
                @endforelse
            </tbody>
        </table>
        <div class="px-6 py-4 text-gray-400 text-sm">{{ $tracks->links() }}</div>
    </div>
</div>
