<button {{ $attributes->merge(['type' => 'submit', 'class' => 'inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-500 to-fuchsia-600 border border-transparent rounded-full font-semibold text-xs text-white uppercase tracking-widest shadow-[0_10px_30px_-10px_rgba(168,85,247,0.7)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-[#0b0710] disabled:opacity-50 transition ease-in-out duration-150']) }}>
    {{ $slot }}
</button>
