<x-slot name="header"><h2 class="font-semibold text-xl text-gray-800">Blog Posts</h2></x-slot>
<div class="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div class="mb-6 flex justify-end"><button type="button" wire:click="create" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">+ Add Post</button></div>
@if(session("message"))<div class="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{{ session("message") }}</div>@endif
@if($showForm)
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"><div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 overflow-y-auto max-h-screen">
<h3 class="text-lg font-bold mb-4">{{ $editingId ? "Edit Post" : "New Post" }}</h3>
<form wire:submit="save" class="grid gap-4">
<div><label class="block text-sm font-medium text-gray-700 mb-1">Title</label><input wire:model="title" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"></div>
<div class="grid grid-cols-2 gap-3"><div><label class="block text-sm font-medium text-gray-700 mb-1">Category</label><input wire:model="category" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"></div><div><label class="block text-sm font-medium text-gray-700 mb-1">Read Time</label><input wire:model="read_time" placeholder="8 min" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"></div></div>
<div><label class="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label><input wire:model="tags" maxlength="500" placeholder="music, culture, production" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"></div>
<div><label class="block text-sm font-medium text-gray-700 mb-1">Excerpt</label><textarea wire:model="excerpt" rows="2" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"></textarea></div>
<div><label class="block text-sm font-medium text-gray-700 mb-1">Body</label><textarea wire:model="body" rows="6" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono text-xs"></textarea></div>
<div><label class="block text-sm font-medium text-gray-700 mb-1">Feature image</label><input wire:model="image" type="file" accept="image/*" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">@error('image')<p class="text-xs text-red-600 mt-1">{{ $message }}</p>@enderror</div>
<div class="grid grid-cols-2 gap-3"><div><label class="block text-sm font-medium text-gray-700 mb-1">Author</label><input wire:model="author" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"></div><div><label class="block text-sm font-medium text-gray-700 mb-1">Publish Date</label><input wire:model="published_at" type="date" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"></div></div>
<div class="flex gap-4"><label class="flex items-center gap-2 text-sm"><input type="checkbox" wire:model="is_featured"> Featured</label><label class="flex items-center gap-2 text-sm"><input type="checkbox" wire:model="is_published"> Published</label></div>
<div class="flex justify-end gap-3"><button type="button" wire:click="$set('showForm',false)" class="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancel</button><button type="submit" class="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg">Save</button></div>
</form></div></div>
@endif
<div class="bg-white rounded-xl shadow overflow-hidden">
<table class="min-w-full text-sm"><thead class="bg-gray-50 text-gray-500 uppercase text-xs"><tr><th class="px-6 py-3 text-left">Title</th><th class="px-6 py-3 text-left">Category</th><th class="px-6 py-3 text-left">Published</th><th class="px-6 py-3 text-left">Status</th><th class="px-6 py-3 text-left">Actions</th></tr></thead>
<tbody class="divide-y">
@forelse($posts as $p)
<tr class="hover:bg-gray-50"><td class="px-6 py-3 font-medium max-w-xs truncate">{{ $p->title }}</td><td class="px-6 py-3 text-gray-500">{{ $p->category }}</td><td class="px-6 py-3 text-gray-500">{{ $p->published_at?->format("d M Y") ?? "—" }}</td>
<td class="px-6 py-3"><span @class(["text-xs px-2 py-1 rounded-full font-semibold","bg-green-100 text-green-700"=>$p->is_published,"bg-gray-100 text-gray-500"=>!$p->is_published])>{{ $p->is_published?"Published":"Draft" }}</span></td>
<td class="px-6 py-3 flex gap-2"><button wire:click="edit({{ $p->id }})" class="text-indigo-600 hover:underline text-xs">Edit</button><button wire:click="delete({{ $p->id }})" wire:confirm="Delete?" class="text-red-500 hover:underline text-xs">Delete</button></td></tr>
@empty<tr><td colspan="5" class="px-6 py-4 text-gray-400">No posts.</td></tr>@endforelse
</tbody></table><div class="px-6 py-4">{{ $posts->links() }}</div></div></div>
