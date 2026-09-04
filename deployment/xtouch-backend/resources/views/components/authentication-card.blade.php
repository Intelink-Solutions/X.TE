<div class="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-[#0b0710] relative overflow-hidden">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(168,85,247,0.18),transparent_60%)]"></div>
    <div class="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl"></div>

    <div class="relative z-10">
        {{ $logo }}
    </div>

    <div class="relative z-10 w-full sm:max-w-md mt-6 px-8 py-8 bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden sm:rounded-3xl">
        {{ $slot }}
    </div>
</div>
