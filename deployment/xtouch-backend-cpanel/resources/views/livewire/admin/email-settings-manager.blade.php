<x-slot name="header">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <p class="text-xs font-semibold uppercase tracking-[0.25em] text-gold">System delivery</p>
            <h2 class="mt-1 text-xl font-bold text-gray-100 sm:text-2xl">Email Setup</h2>
        </div>
        <span class="inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold {{ $is_enabled ? 'border-green-500/40 bg-green-500/10 text-green-300' : 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300' }}">
            {{ $is_enabled ? 'SMTP enabled' : 'SMTP disabled' }}
        </span>
    </div>
</x-slot>

<div class="mx-auto max-w-5xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
    @if(session('message'))
        <div class="mb-5 rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-200">{{ session('message') }}</div>
    @endif

    <div class="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <form wire:submit="save" class="min-w-0 rounded-2xl bg-admin-card p-4 sm:p-6">
            <div class="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
                <div class="min-w-0">
                    <h3 class="font-bold text-gray-100">Webmail SMTP</h3>
                    <p class="mt-1 text-sm text-gray-400">Credentials are encrypted before being stored. The saved password is never displayed.</p>
                </div>
                <label class="flex shrink-0 items-center gap-2 text-sm text-gray-300">
                    <input type="checkbox" wire:model="is_enabled" class="rounded border-white/20 bg-black/30 text-gold focus:ring-gold">
                    Enable
                </label>
            </div>

            <div class="mt-5 grid min-w-0 gap-5 sm:grid-cols-2">
                <label class="min-w-0 text-sm text-gray-300 sm:col-span-2">SMTP host
                    <input wire:model="host" type="text" autocomplete="off" placeholder="mail.yourdomain.com" class="mt-2 w-full min-w-0 rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-gray-100 focus:border-gold focus:ring-gold">
                    @error('host')<span class="mt-1 block text-xs text-red-300">{{ $message }}</span>@enderror
                </label>
                <label class="min-w-0 text-sm text-gray-300">Port
                    <input wire:model="port" type="number" min="1" max="65535" inputmode="numeric" class="mt-2 w-full min-w-0 rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-gray-100 focus:border-gold focus:ring-gold">
                    @error('port')<span class="mt-1 block text-xs text-red-300">{{ $message }}</span>@enderror
                </label>
                <label class="min-w-0 text-sm text-gray-300">Encryption
                    <select wire:model="encryption" class="mt-2 w-full min-w-0 rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-gray-100 focus:border-gold focus:ring-gold">
                        <option value="tls">TLS / STARTTLS</option><option value="ssl">SSL</option><option value="none">None</option>
                    </select>
                    @error('encryption')<span class="mt-1 block text-xs text-red-300">{{ $message }}</span>@enderror
                </label>
                <label class="min-w-0 text-sm text-gray-300 sm:col-span-2">Webmail username
                    <input wire:model="username" type="email" autocomplete="username" class="mt-2 w-full min-w-0 rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-gray-100 focus:border-gold focus:ring-gold">
                    @error('username')<span class="mt-1 block text-xs text-red-300">{{ $message }}</span>@enderror
                </label>
                <label class="min-w-0 text-sm text-gray-300 sm:col-span-2">SMTP password
                    <input wire:model="password" type="password" autocomplete="new-password" placeholder="{{ $password_saved ? 'Saved securely — enter only to replace' : 'Enter the webmail password' }}" class="mt-2 w-full min-w-0 rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-gray-100 focus:border-gold focus:ring-gold">
                    @if($password_saved)<span class="mt-1 block text-xs text-green-300">A password is stored securely.</span>@endif
                    @error('password')<span class="mt-1 block text-xs text-red-300">{{ $message }}</span>@enderror
                </label>
            </div>

            <h3 class="mt-8 border-t border-white/10 pt-6 font-bold text-gray-100">Sender and destination</h3>
            <div class="mt-4 grid min-w-0 gap-5 sm:grid-cols-2">
                <label class="min-w-0 text-sm text-gray-300">From email
                    <input wire:model="from_address" type="email" class="mt-2 w-full min-w-0 rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-gray-100 focus:border-gold focus:ring-gold">
                    @error('from_address')<span class="mt-1 block text-xs text-red-300">{{ $message }}</span>@enderror
                </label>
                <label class="min-w-0 text-sm text-gray-300">From name
                    <input wire:model="from_name" type="text" class="mt-2 w-full min-w-0 rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-gray-100 focus:border-gold focus:ring-gold">
                    @error('from_name')<span class="mt-1 block text-xs text-red-300">{{ $message }}</span>@enderror
                </label>
                <label class="min-w-0 text-sm text-gray-300 sm:col-span-2">Booking and contact recipient
                    <input wire:model="submissions_to" type="email" class="mt-2 w-full min-w-0 rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-gray-100 focus:border-gold focus:ring-gold">
                    @error('submissions_to')<span class="mt-1 block text-xs text-red-300">{{ $message }}</span>@enderror
                </label>
            </div>

            <button type="submit" wire:loading.attr="disabled" class="mt-6 w-full rounded-xl bg-gold px-5 py-3 font-bold text-black transition hover:opacity-90 disabled:opacity-60 sm:w-auto">
                <span wire:loading.remove wire:target="save">Save email settings</span><span wire:loading wire:target="save">Saving…</span>
            </button>
        </form>

        <aside class="min-w-0 space-y-5">
            <div class="rounded-2xl bg-admin-card p-4 sm:p-5">
                <h3 class="font-bold text-gray-100">Send a test</h3>
                <p class="mt-1 text-xs leading-relaxed text-gray-400">This makes a real SMTP connection and confirms the mailbox can deliver.</p>
                <label class="mt-4 block text-sm text-gray-300">Test recipient
                    <input wire:model="test_recipient" type="email" class="mt-2 w-full min-w-0 rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-gray-100 focus:border-gold focus:ring-gold">
                </label>
                @error('test_recipient')<span class="mt-2 block break-words text-xs text-red-300">{{ $message }}</span>@enderror
                @error('is_enabled')<span class="mt-2 block text-xs text-red-300">{{ $message }}</span>@enderror
                <button type="button" wire:click="sendTest" wire:loading.attr="disabled" class="mt-4 w-full rounded-xl border border-gold/40 px-4 py-2.5 text-sm font-bold text-gold hover:bg-gold/10 disabled:opacity-60">
                    <span wire:loading.remove wire:target="sendTest">Send test email</span><span wire:loading wire:target="sendTest">Testing…</span>
                </button>
            </div>

            <div class="rounded-2xl bg-admin-card p-4 sm:p-5">
                <h3 class="font-bold text-gray-100">Connection status</h3>
                @if($settings?->last_tested_at)
                    <p class="mt-3 text-sm {{ $settings->last_test_status === 'success' ? 'text-green-300' : 'text-red-300' }}">{{ ucfirst($settings->last_test_status) }}</p>
                    <p class="mt-1 text-xs text-gray-400">{{ $settings->last_tested_at->diffForHumans() }}</p>
                    @if($settings->last_test_error)<p class="mt-3 break-words rounded-lg bg-red-500/10 p-3 text-xs text-red-200">{{ $settings->last_test_error }}</p>@endif
                @else
                    <p class="mt-2 text-sm text-gray-400">No test has been run yet.</p>
                @endif
            </div>

            <div class="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-4 text-xs leading-relaxed text-yellow-100/80">
                Use port 587 with TLS for most webmail servers. Some hosts use port 465 with SSL. Confirm the exact host and port in your hosting control panel.
            </div>
        </aside>
    </div>
</div>
