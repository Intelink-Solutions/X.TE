<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AdminNotificationController extends Controller
{
    public function markRead(Request $request, string $notification): RedirectResponse
    {
        abort_unless($request->user()?->hasAnyRole(['Super Admin', 'Administrator', 'Admin']), 403);
        $item = $request->user()->notifications()->findOrFail($notification);
        $item->markAsRead();

        return redirect()->to($item->data['url'] ?? route('admin.dashboard'));
    }

    public function readAll(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->hasAnyRole(['Super Admin', 'Administrator', 'Admin']), 403);
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return back();
    }
}
