<?php

use App\Models\VerificationRequest;
use App\Services\MediaSyncService;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $sync = app(MediaSyncService::class);

        VerificationRequest::query()
            ->with('user')
            ->where('status', 'approved')
            ->whereIn('type', ['artist', 'musician'])
            ->chunkById(100, function ($requests) use ($sync) {
                foreach ($requests as $request) {
                    if (! $request->user) {
                        continue;
                    }
                    $sync->artistFor(
                        $request->user->id,
                        $request->user->name,
                        $request->type === 'musician' ? 'Musician' : 'Artist',
                    );
                }
            });
    }

    public function down(): void
    {
        // Artist profiles can receive followers and music, so they are retained on rollback.
    }
};
