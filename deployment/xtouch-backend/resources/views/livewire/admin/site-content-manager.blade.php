<x-slot name="header">
    <div class="flex items-center justify-between">
        <h2 class="font-semibold text-2xl text-gold">Site Content Manager</h2>
        <button wire:click="save" class="bg-gold text-black px-5 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-400 transition">Save All</button>
    </div>
</x-slot>

<div class="py-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    @if(session('message'))<div class="mb-4 bg-green-900/30 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg">{{ session('message') }}</div>@endif
    
    {{-- Tabs --}}
    <div class="mb-6 flex gap-3 border-b border-gold/20">
        @foreach(['home' => 'Home Page', 'about' => 'About Page', 'production' => 'Production Page'] as $tab => $label)
        <button wire:click="$set('activeTab', '{{ $tab }}')" 
            @class(['px-4 py-3 font-semibold border-b-2 transition', 
                    'text-gold border-gold' => $activeTab === $tab,
                    'text-gray-400 border-transparent hover:text-gray-300' => $activeTab !== $tab])>
            {{ $label }}
        </button>
        @endforeach
    </div>
    
    {{-- Home Page Tab --}}
    @if($activeTab === 'home')
    <div class="grid gap-6">
        @foreach($homeContent->groupBy('section') as $section => $items)
        <div class="bg-admin-card border border-gold/20 rounded-xl p-6">
            <h3 class="text-lg font-bold text-gold mb-4 capitalize">{{ str_replace('-', ' ', $section) }}</h3>
            <div class="grid gap-4">
                @foreach($items as $item)
                <div>
                    <label class="block text-sm font-semibold text-gray-300 mb-2">{{ $item->key }}</label>
                    @if($item->type === 'textarea')
                        <textarea wire:model.defer="editingFields.{{ $item->page }}.{{ $item->key }}" rows="3" class="w-full bg-dark-bg border border-gold/20 rounded-lg px-4 py-2 text-sm text-gray-100 focus:ring-2 focus:ring-gold"></textarea>
                    @else
                        <input type="text" wire:model.defer="editingFields.{{ $item->page }}.{{ $item->key }}" class="w-full bg-dark-bg border border-gold/20 rounded-lg px-4 py-2 text-sm text-gray-100 focus:ring-2 focus:ring-gold">
                    @endif
                </div>
                @endforeach
            </div>
        </div>
        @endforeach
    </div>
    @endif
    
    {{-- About Page Tab --}}
    @if($activeTab === 'about')
    <div class="grid gap-6">
        @foreach($aboutContent->groupBy('section') as $section => $items)
        <div class="bg-admin-card border border-gold/20 rounded-xl p-6">
            <h3 class="text-lg font-bold text-gold mb-4 capitalize">{{ str_replace('-', ' ', $section) }}</h3>
            <div class="grid gap-4">
                @foreach($items as $item)
                <div>
                    <label class="block text-sm font-semibold text-gray-300 mb-2">{{ $item->key }}</label>
                    @if($item->type === 'textarea')
                        <textarea wire:model.defer="editingFields.{{ $item->page }}.{{ $item->key }}" rows="3" class="w-full bg-dark-bg border border-gold/20 rounded-lg px-4 py-2 text-sm text-gray-100 focus:ring-2 focus:ring-gold"></textarea>
                    @else
                        <input type="text" wire:model.defer="editingFields.{{ $item->page }}.{{ $item->key }}" class="w-full bg-dark-bg border border-gold/20 rounded-lg px-4 py-2 text-sm text-gray-100 focus:ring-2 focus:ring-gold">
                    @endif
                </div>
                @endforeach
            </div>
        </div>
        @endforeach
    </div>
    @endif
    
    {{-- Production Page Tab --}}
    @if($activeTab === 'production')
    <div class="grid gap-6">
        @foreach($productionContent->groupBy('section') as $section => $items)
        <div class="bg-admin-card border border-gold/20 rounded-xl p-6">
            <h3 class="text-lg font-bold text-gold mb-4 capitalize">{{ str_replace('-', ' ', $section) }}</h3>
            <div class="grid gap-4">
                @foreach($items as $item)
                <div>
                    <label class="block text-sm font-semibold text-gray-300 mb-2">{{ $item->key }}</label>
                    @if($item->type === 'textarea')
                        <textarea wire:model.defer="editingFields.{{ $item->page }}.{{ $item->key }}" rows="3" class="w-full bg-dark-bg border border-gold/20 rounded-lg px-4 py-2 text-sm text-gray-100 focus:ring-2 focus:ring-gold"></textarea>
                    @else
                        <input type="text" wire:model.defer="editingFields.{{ $item->page }}.{{ $item->key }}" class="w-full bg-dark-bg border border-gold/20 rounded-lg px-4 py-2 text-sm text-gray-100 focus:ring-2 focus:ring-gold">
                    @endif
                </div>
                @endforeach
            </div>
        </div>
        @endforeach
    </div>
    @endif
    
    <div class="mt-8 pt-6 border-t border-gold/10">
        <button wire:click="save" class="bg-gold text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition">✓ Save Changes</button>
    </div>
</div>
