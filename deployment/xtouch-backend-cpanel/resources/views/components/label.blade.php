@props(['value'])

<label {{ $attributes->merge(['class' => 'block font-medium text-sm text-white/70']) }}>
    {{ $value ?? $slot }}
</label>
