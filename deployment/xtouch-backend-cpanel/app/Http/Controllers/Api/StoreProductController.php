<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StoreProduct;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class StoreProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = StoreProduct::where('is_active', true);

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        return response()->json(
            $query->orderByDesc('is_featured')->orderBy('name')->paginate(24)
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'category'    => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'price'       => 'required|numeric|min:0',
            'currency'    => 'nullable|string|max:10',
            'image_url'   => 'nullable|string|max:500',
            'stock'       => 'integer|min:0',
            'is_featured' => 'boolean',
        ]);
        $data['slug'] = Str::slug($data['name']);
        return response()->json(StoreProduct::create($data), 201);
    }

    public function show(StoreProduct $storeProduct): JsonResponse
    {
        return response()->json($storeProduct);
    }

    public function update(Request $request, StoreProduct $storeProduct): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'category'    => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'price'       => 'sometimes|numeric|min:0',
            'currency'    => 'nullable|string|max:10',
            'image_url'   => 'nullable|string|max:500',
            'stock'       => 'integer|min:0',
            'is_featured' => 'boolean',
            'is_active'   => 'boolean',
        ]);
        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }
        $storeProduct->update($data);
        return response()->json($storeProduct);
    }

    public function destroy(StoreProduct $storeProduct): JsonResponse
    {
        $storeProduct->delete();
        return response()->json(null, 204);
    }
}
