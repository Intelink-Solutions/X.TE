<x-slot name="header">
    <h2 class="font-semibold text-2xl text-gold">Feed Posts</h2>
</x-slot>

<div class="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="mb-6 flex justify-end"><button type="button" wire:click="create" class="bg-gold text-black px-5 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-400 transition">+ Add Post</button></div>
    @if(session("message"))<div class="mb-4 bg-green-900/30 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg">{{ session("message") }}</div>@endif
    
    {{-- Search & Filter --}}
    <div class="mb-6 flex gap-3">
        <input wire:model.live.debounce.300ms="search" placeholder="Search posts..." class="flex-1 bg-admin-card border border-gold/30 rounded-lg px-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-gold">
        <select wire:model.live="filterKind" class="bg-admin-card border border-gold/30 rounded-lg px-4 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-gold">
            <option value="">All kinds</option>
            @foreach($kinds as $k)<option value="{{ $k }}">{{ ucfirst($k) }}</option>@endforeach
        </select>
        <select wire:model.live="filterApproval" class="bg-admin-card border border-gold/30 rounded-lg px-4 py-2 text-sm text-gray-200"><option value="">All approvals</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>
    </div>

    {{-- Form Modal --}}
    @if($showForm)
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div class="bg-admin-card border border-gold/20 rounded-2xl shadow-2xl w-full max-w-2xl p-8 overflow-y-auto max-h-[90vh]">
            <h3 class="text-2xl font-bold text-gold mb-6">{{ $editingId ? 'Edit Post' : 'New Feed Post' }}</h3>
            <form wire:submit="save" class="grid gap-5">
                <div class="grid grid-cols-2 gap-4">
                    <div><label class="block text-sm font-semibold text-gray-300 mb-2">Author *</label><input wire:model="author" required class="w-full bg-dark-bg border border-gold/20 rounded-lg px-4 py-2 text-sm text-gray-100 focus:ring-2 focus:ring-gold"></div>
                    <div><label class="block text-sm font-semibold text-gray-300 mb-2">Handle *</label><input wire:model="handle" required class="w-full bg-dark-bg border border-gold/20 rounded-lg px-4 py-2 text-sm text-gray-100 focus:ring-2 focus:ring-gold"></div>
                </div>
                <div><label class="block text-sm font-semibold text-gray-300 mb-2">Post Content *</label><textarea wire:model="text" required rows="4" class="w-full bg-dark-bg border border-gold/20 rounded-lg px-4 py-2 text-sm text-gray-100 focus:ring-2 focus:ring-gold"></textarea></div>
                <div><label class="block text-sm font-semibold text-gray-300 mb-2">Category *</label><input wire:model="category" required placeholder="Updates, News, Music..." class="w-full bg-dark-bg border border-gold/20 rounded-lg px-4 py-2 text-sm text-gray-100 focus:ring-2 focus:ring-gold"></div>
                <div class="grid grid-cols-2 gap-4">
                    <div><label class="block text-sm font-semibold text-gray-300 mb-2">Type *</label>
                        <select wire:model="kind" required class="w-full bg-dark-bg border border-gold/20 rounded-lg px-4 py-2 text-sm text-gray-100 focus:ring-2 focus:ring-gold">
                            <option value="photo">Photo</option>
                            <option value="update">Update</option><option value="news">News</option><option value="ticket">Ticket</option>
                            <option value="video">Video</option>
                            <option value="music">Music</option>
                            <option value="event">Event</option>
                            <option value="poll">Poll</option>
                            <option value="podcast">Podcast</option>
                            <option value="announcement">Announcement</option>
                        </select>
                    </div>
                    <div class="flex items-end">
                        <label class="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" wire:model="is_pinned" class="accent-gold"> Pin Post</label>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-300 mb-2">Image</label>
                    @if($image)
                        <div class="mb-2"><img src="{{ $image->temporaryUrl() }}" class="h-24 rounded-lg object-cover"></div>
                    @endif
                    <input type="file" wire:model="image" accept="image/*" class="w-full bg-dark-bg border border-gold/20 rounded-lg px-4 py-2 text-sm text-gray-300">
                    @error('image') <span class="text-red-400 text-xs">{{ $message }}</span> @enderror
                </div>
                <div class="flex gap-2"><label class="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" wire:model="is_active" class="accent-gold"> Active</label></div>
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
                <th class="px-6 py-4 text-left">Author</th>
                <th class="px-6 py-4 text-left">Type</th>
                <th class="px-6 py-4 text-left">Content</th>
                <th class="px-6 py-4 text-center">Pinned</th>
                <th class="px-6 py-4 text-left">Status</th>
                <th class="px-6 py-4 text-left">Actions</th>
            </tr></thead>
            <tbody class="divide-y divide-gold/10">
                @forelse($posts as $p)
                <tr class="hover:bg-gold/5 transition">
                    <td class="px-6 py-4 font-medium text-gray-100">{{ $p->author }}<br><span class="text-xs text-gray-400">@{{ $p->handle }}</span></td>
                    <td class="px-6 py-4"><span class="text-xs px-3 py-1 rounded-full bg-gold/20 text-gold font-semibold">{{ ucfirst($p->kind) }}</span></td>
                    <td class="px-6 py-4 text-gray-400 max-w-xs truncate">{{ $p->text }}</td>
                    <td class="px-6 py-4 text-center"><button wire:click="togglePin({{ $p->id }})" class="text-lg {{ $p->is_pinned ? 'text-gold' : 'text-gray-600' }} hover:scale-110 transition">{{ $p->is_pinned ? '📌' : '○' }}</button></td>
                    <td class="px-6 py-4"><span @class(['text-xs px-3 py-1 rounded-full font-semibold', 'bg-green-900/30 text-green-300'=>$p->approval_status==='approved', 'bg-yellow-900/30 text-yellow-300'=>$p->approval_status==='pending', 'bg-red-900/30 text-red-300'=>$p->approval_status==='rejected'])>{{ ucfirst($p->approval_status) }}</span></td>
                    <td class="px-6 py-4 flex gap-3">
                        <button wire:click="edit({{ $p->id }})" class="text-gold hover:text-yellow-400 text-xs font-semibold">Edit</button>
                        @if($p->approval_status !== 'approved')<button wire:click="review({{ $p->id }},'approved')" class="text-green-400 text-xs font-semibold">Approve</button>@endif
                        @if($p->approval_status !== 'rejected')<button wire:click="review({{ $p->id }},'rejected')" class="text-orange-400 text-xs font-semibold">Reject</button>@endif
                        <button wire:click="delete({{ $p->id }})" wire:confirm="Delete post?" class="text-red-400 hover:text-red-300 text-xs font-semibold">Delete</button>
                    </td>
                </tr>
                @empty
                <tr><td colspan="6" class="px-6 py-4 text-gray-500 text-center">No feed posts. Create one to get started!</td></tr>
                @endforelse
            </tbody>
        </table>
        <div class="px-6 py-4 text-gray-400 text-sm">{{ $posts->links() }}</div>
    </div>
</div>
