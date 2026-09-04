<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()->notifications()->latest()->paginate(20);
        $items = collect($notifications->items())->map(function ($notification): array {
            $item = $notification->toArray();
            $imageUrl = $item['data']['image_url'] ?? null;

            if (is_string($imageUrl)) {
                $path = parse_url($imageUrl, PHP_URL_PATH) ?: $imageUrl;
                if (str_starts_with($path, '/storage/')) {
                    $item['data']['image_url'] = '/api/media/'.ltrim(
                        substr($path, strlen('/storage/')),
                        '/',
                    );
                }
            }

            return $item;
        })->all();

        return response()->json([
            'data' => $items,
            'current_page' => $notifications->currentPage(),
            'last_page' => $notifications->lastPage(),
            'total' => $notifications->total(),
            'unread_count' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    public function markRead(Request $request, string $notification): JsonResponse
    {
        $item = $request->user()->notifications()->findOrFail($notification);
        $item->markAsRead();

        return response()->json(['read' => true]);
    }

    public function readAll(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return response()->json(['read' => true]);
    }
}
