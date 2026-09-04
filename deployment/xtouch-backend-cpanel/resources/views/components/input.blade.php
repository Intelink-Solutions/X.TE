@props(['disabled' => false])

<input {{ $disabled ? 'disabled' : '' }} {!! $attributes->merge(['class' => 'w-full rounded-xl border-white/10 bg-white/5 text-white placeholder-white/30 shadow-sm focus:border-purple-400 focus:ring-purple-400/40']) !!}>
