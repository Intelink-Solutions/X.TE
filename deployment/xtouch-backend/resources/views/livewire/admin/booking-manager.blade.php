<x-slot name="header"><h2 class="font-semibold text-xl text-gray-800">Bookings</h2></x-slot>
<div class="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    @if(session('message'))<div class="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{{ session('message') }}</div>@endif
    <div class="mb-4 flex gap-3 flex-wrap">
        <input wire:model.live.debounce.300ms="search" placeholder="Search name, email, phone or service..." class="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full sm:w-80">
        <select wire:model.live="filterStatus" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All statuses</option>
            @foreach(['pending','confirmed','rejected','completed'] as $s)<option value="{{ $s }}">{{ ucfirst($s) }}</option>@endforeach
        </select>
    </div>
    @if($viewingId)
    @php $b = App\Models\Booking::find($viewingId) @endphp
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-5 sm:p-6">
            <div class="mb-4">
                <p class="text-xs uppercase tracking-widest text-indigo-600">{{ $b->reference }}</p>
                <h3 class="text-lg font-bold">{{ $b->client_name }}</h3>
            </div>
            <dl class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm mb-4">
                <dt class="text-gray-500">Service</dt><dd class="font-medium">{{ $b->service_type }}</dd>
                <dt class="text-gray-500">Email</dt><dd>{{ $b->client_email }}</dd>
                <dt class="text-gray-500">Phone</dt><dd>{{ $b->client_phone ?? '—' }}</dd>
                <dt class="text-gray-500">Reply by</dt><dd>{{ ucfirst($b->contact_method ?? 'email') }}</dd>
                <dt class="text-gray-500">Schedule</dt><dd>{{ $b->preferred_date?->format('d M Y') ?? '—' }}{{ $b->preferred_time ? ' at '.substr($b->preferred_time, 0, 5) : '' }}</dd>
                <dt class="text-gray-500">Location</dt><dd>{{ $b->location ?? '—' }}</dd>
                <dt class="text-gray-500">Duration</dt><dd>{{ $b->duration ?? '—' }}</dd>
                <dt class="text-gray-500">Budget</dt><dd>{{ $b->budget ?? '—' }}</dd>
                <dt class="text-gray-500">People</dt><dd>{{ $b->attendees ? number_format($b->attendees) : '—' }}</dd>
                <dt class="text-gray-500">Received</dt><dd>{{ $b->created_at->format('d M Y, H:i') }}</dd>
            </dl>
            <div class="mb-4">
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Project details</p>
                <p class="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">{{ $b->project_details }}</p>
            </div>
            <form wire:submit="updateBooking" class="grid gap-3">
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select wire:model="newStatus" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                        @foreach(['pending','confirmed','rejected','completed'] as $s)<option value="{{ $s }}">{{ ucfirst($s) }}</option>@endforeach
                    </select></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label><textarea wire:model="adminNotes" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"></textarea></div>
                <div class="flex justify-end gap-3"><button type="button" wire:click="$set('viewingId',null)" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button><button type="submit" class="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button></div>
            </form>
        </div>
    </div>
    @endif
    <div class="bg-white rounded-xl shadow overflow-hidden">
        <div class="overflow-x-auto"><table class="min-w-full text-sm"><thead class="bg-gray-50 text-gray-500 uppercase text-xs"><tr>
            <th class="px-6 py-3 text-left">Client</th><th class="px-6 py-3 text-left">Service</th><th class="px-6 py-3 text-left">Date</th><th class="px-6 py-3 text-left">Status</th><th class="px-6 py-3 text-left">Actions</th>
        </tr></thead><tbody class="divide-y">
        @forelse($bookings as $b)
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-3 font-medium"><span class="block text-[10px] uppercase tracking-wider text-indigo-500">{{ $b->reference }}</span>{{ $b->client_name }}<br><span class="text-gray-400 font-normal text-xs">{{ $b->client_email }}</span></td>
            <td class="px-6 py-3 text-gray-600">{{ $b->service_type }}</td>
            <td class="px-6 py-3 text-gray-500">{{ $b->preferred_date?->format('d M Y') ?? '—' }}</td>
            <td class="px-6 py-3"><span @class(['text-xs px-2 py-1 rounded-full font-semibold','bg-yellow-100 text-yellow-700'=>$b->status==='pending','bg-green-100 text-green-700'=>$b->status==='confirmed','bg-red-100 text-red-700'=>$b->status==='rejected','bg-gray-100 text-gray-600'=>$b->status==='completed'])>{{ ucfirst($b->status) }}</span></td>
            <td class="px-6 py-3 flex gap-2"><button wire:click="view({{ $b->id }})" class="text-indigo-600 hover:underline text-xs">View</button><button wire:click="delete({{ $b->id }})" wire:confirm="Delete this booking?" class="text-red-500 hover:underline text-xs">Delete</button></td>
        </tr>
        @empty<tr><td colspan="5" class="px-6 py-4 text-gray-400">No bookings found.</td></tr>
        @endforelse
        </tbody></table></div>
        <div class="px-6 py-4">{{ $bookings->links() }}</div>
    </div>
</div>
