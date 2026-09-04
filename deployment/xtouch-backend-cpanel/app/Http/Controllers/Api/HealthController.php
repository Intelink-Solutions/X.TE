<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Throwable;

class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        try {
            DB::connection()->getPdo();
        } catch (Throwable) {
            return response()->json([
                'status' => 'unhealthy',
                'services' => ['database' => 'unavailable'],
            ], 503);
        }

        return response()->json([
            'status' => 'ok',
            'services' => ['database' => 'ok'],
        ]);
    }
}
