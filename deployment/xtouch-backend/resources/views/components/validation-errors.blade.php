@if ($errors->any())
    <div {{ $attributes->merge(['class' => 'rounded-xl border border-red-500/30 bg-red-500/10 p-4']) }}>
        <div class="font-medium text-red-300">{{ __('Whoops! Something went wrong.') }}</div>

        <ul class="mt-3 list-disc list-inside text-sm text-red-300/90">
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif
