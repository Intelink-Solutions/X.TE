<x-slot name="header">
    <h2 class="font-semibold text-2xl text-gold">User Approvals</h2>
</x-slot>

<div class="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    @if (session('message'))
        <div class="mb-4 rounded-lg border border-green-500/50 bg-green-900/30 px-4 py-3 text-green-300">
            {{ session('message') }}
        </div>
    @endif

    <div class="mb-6 flex flex-wrap gap-3">
        <input
            wire:model.live.debounce.300ms="search"
            placeholder="Search name or email"
            class="rounded-lg border border-gold/30 bg-admin-card px-4 py-2 text-sm"
        >
        <select wire:model.live="status" class="rounded-lg border border-gold/30 bg-admin-card px-4 py-2 text-sm">
            <option value="pending">Pending ({{ $pendingCount }})</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
        </select>
    </div>

    <div class="mb-8 overflow-x-auto rounded-xl bg-admin-card">
        <table class="min-w-full text-sm">
            <thead class="border-b border-white/10 text-left text-xs uppercase text-gray-400">
                <tr>
                    <th class="p-4">User</th>
                    <th class="p-4">Requested role</th>
                    <th class="p-4">Note</th>
                    <th class="p-4">Status</th>
                    <th class="p-4">Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($requests as $request)
                    <tr class="border-b border-white/5">
                        <td class="p-4">
                            <b>{{ $request->user?->name }}</b><br>
                            <span class="text-gray-400">{{ $request->user?->email }}</span>
                        </td>
                        <td class="p-4 capitalize">{{ str_replace('_', ' ', $request->type) }}</td>
                        <td class="max-w-sm p-4 text-gray-300">{{ $request->note ?: '—' }}</td>
                        <td class="p-4 capitalize">{{ $request->status }}</td>
                        <td class="p-4 space-x-3">
                            <button wire:click="review({{ $request->id }}, 'approved')" class="text-green-400">Approve</button>
                            <button wire:click="review({{ $request->id }}, 'rejected')" class="text-red-400">Reject</button>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="5" class="p-8 text-center text-gray-400">No verification requests in this view.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="mb-3">
        <h3 class="text-lg font-bold text-gold">Registered users</h3>
        <p class="mt-1 text-xs text-gray-400">Approve a member here to let them publish directly to the public feed.</p>
    </div>

    <div class="overflow-x-auto rounded-xl bg-admin-card">
        <table class="min-w-full text-sm">
            <thead class="border-b border-white/10 text-left text-xs uppercase text-gray-400">
                <tr>
                    <th class="p-4">User</th>
                    <th class="p-4">Roles</th>
                    <th class="p-4">Joined</th>
                    <th class="p-4">Feed posting</th>
                    <th class="p-4">Account access</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($users as $user)
                    @php
                        $roleCanPost = $user->hasAnyRole(['Artist', 'Musician', 'Super Admin', 'Administrator']);
                        $postingApproval = $user->verificationRequests
                            ->where('type', 'approved_user')
                            ->sortByDesc('created_at')
                            ->first();
                        $approvedToPost = $roleCanPost || $postingApproval?->status === 'approved';
                    @endphp
                    <tr class="border-b border-white/5" wire:key="registered-user-{{ $user->id }}">
                        <td class="p-4">
                            <b>{{ $user->name }}</b><br>
                            <span class="text-gray-400">{{ $user->email }}</span>
                        </td>
                        <td class="p-4">{{ $user->roles->pluck('name')->join(', ') ?: 'Member' }}</td>
                        <td class="p-4">{{ $user->created_at?->format('d M Y') }}</td>
                        <td class="p-4">
                            <div class="flex min-w-48 items-center justify-between gap-4">
                                <span class="rounded-full px-2.5 py-1 text-xs {{ $approvedToPost ? 'bg-green-500/15 text-green-300' : 'bg-amber-500/15 text-amber-300' }}">
                                    {{ $approvedToPost ? 'Approved to post' : 'Approval required' }}
                                </span>
                                @if ($roleCanPost)
                                    <span class="text-xs text-gray-400">Role access</span>
                                @elseif ($approvedToPost)
                                    <button
                                        wire:click="setPostingApproval({{ $user->id }}, false)"
                                        wire:confirm="Revoke feed posting access for {{ $user->name }}?"
                                        class="text-red-400"
                                    >Revoke</button>
                                @else
                                    <button
                                        wire:click="setPostingApproval({{ $user->id }}, true)"
                                        class="font-semibold text-green-400"
                                    >Approve to post</button>
                                @endif
                            </div>
                        </td>
                        <td class="p-4">
                            <button wire:click="toggleBlock({{ $user->id }})" class="{{ $user->blocked_at ? 'text-green-400' : 'text-red-400' }}">
                                {{ $user->blocked_at ? 'Unblock' : 'Block' }}
                            </button>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="5" class="p-8 text-center text-gray-400">No registered users found.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
