<x-slot name="header"><h2 class="font-semibold text-xl text-gray-800">Contact Messages</h2></x-slot>
<div class="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    @if(session('message'))<div class="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{{ session('message') }}</div>@endif
    <div class="mb-4 flex gap-3">
        <select wire:model.live="filterStatus" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="unread">Unread</option><option value="read">Read</option><option value="replied">Replied</option><option value="">All</option>
        </select>
    </div>
    @if($viewingId && $viewing)
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h3 class="text-lg font-bold mb-1">{{ $viewing->name }}</h3>
            <p class="text-sm text-gray-500 mb-1">{{ $viewing->email }} @if($viewing->phone)· {{ $viewing->phone }}@endif</p>
            @if($viewing->subject)<p class="text-sm font-semibold text-gray-700 mb-3">{{ $viewing->subject }}</p>@endif
            <p class="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-4">{{ $viewing->message }}</p>
            <form wire:submit="reply" class="grid gap-3">
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Reply</label><textarea wire:model="adminReply" rows="4" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"></textarea></div>
                <div class="flex justify-end gap-3"><button type="button" wire:click="$set('viewingId',null)" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Close</button><button type="submit" class="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Reply</button></div>
            </form>
        </div>
    </div>
    @endif
    <div class="bg-white rounded-xl shadow overflow-hidden">
        <table class="min-w-full text-sm"><thead class="bg-gray-50 text-gray-500 uppercase text-xs"><tr>
            <th class="px-6 py-3 text-left">From</th><th class="px-6 py-3 text-left">Subject</th><th class="px-6 py-3 text-left">Message</th><th class="px-6 py-3 text-left">Status</th><th class="px-6 py-3 text-left">Actions</th>
        </tr></thead><tbody class="divide-y">
        @forelse($messages as $m)
        <tr class="hover:bg-gray-50 {{ $m->status==='unread' ? 'font-semibold' : '' }}">
            <td class="px-6 py-3">{{ $m->name }}<br><span class="text-gray-400 text-xs font-normal">{{ $m->email }}</span></td>
            <td class="px-6 py-3 text-gray-600">{{ $m->subject ?? '—' }}</td>
            <td class="px-6 py-3 text-gray-500 max-w-xs truncate">{{ $m->message }}</td>
            <td class="px-6 py-3"><span @class(['text-xs px-2 py-1 rounded-full font-semibold','bg-red-100 text-red-700'=>$m->status==='unread','bg-blue-100 text-blue-700'=>$m->status==='read','bg-green-100 text-green-700'=>$m->status==='replied'])>{{ ucfirst($m->status) }}</span></td>
            <td class="px-6 py-3 flex gap-2"><button wire:click="view({{ $m->id }})" class="text-indigo-600 hover:underline text-xs">Open</button><button wire:click="delete({{ $m->id }})" wire:confirm="Delete?" class="text-red-500 hover:underline text-xs">Delete</button></td>
        </tr>
        @empty<tr><td colspan="5" class="px-6 py-4 text-gray-400">No messages.</td></tr>
        @endforelse
        </tbody></table>
        <div class="px-6 py-4">{{ $messages->links() }}</div>
    </div>
</div>
