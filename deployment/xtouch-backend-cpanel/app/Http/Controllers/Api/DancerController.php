<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dancer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class DancerController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Dancer::where('is_active', true)->orderByDesc('is_featured')->orderBy('name')->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'role'        => 'nullable|string|max:255',
            'speciality'  => 'nullable|string|max:255',
            'bio'         => 'nullable|string',
            'image_url'   => 'nullable|string|max:500',
            'is_featured' => 'boolean',
            'is_active'   => 'boolean',
        ]);
        $data['slug'] = Str::slug($data['name']);
        return response()->json(Dancer::create($data), 201);
    }

    public function show(Dancer $dancer): JsonResponse
    {
        return response()->json($dancer);
    }

    public function update(Request $request, Dancer $dancer): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'role'        => 'nullable|string|max:255',
            'speciality'  => 'nullable|string|max:255',
            'bio'         => 'nullable|string',
            'image_url'   => 'nullable|string|max:500',
            'is_featured' => 'boolean',
            'is_active'   => 'boolean',
        ]);
        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }
        $dancer->update($data);
        return response()->json($dancer);
    }

    public function destroy(Dancer $dancer): JsonResponse
    {
        $dancer->delete();
        return response()->json(null, 204);
    }
}
