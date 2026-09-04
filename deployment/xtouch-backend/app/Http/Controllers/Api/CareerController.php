<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Career;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CareerController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Career::where('is_active', true)
                ->orderBy('department')
                ->orderBy('title')
                ->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'        => 'required|string|max:255',
            'department'   => 'required|string|max:100',
            'location'     => 'nullable|string|max:255',
            'type'         => 'in:Full-time,Part-time,Contract,Internship',
            'description'  => 'required|string',
            'requirements' => 'nullable|string',
            'salary_range' => 'nullable|string|max:100',
            'closes_at'    => 'nullable|date',
        ]);
        return response()->json(Career::create($data), 201);
    }

    public function show(Career $career): JsonResponse
    {
        return response()->json($career);
    }

    public function update(Request $request, Career $career): JsonResponse
    {
        $data = $request->validate([
            'title'        => 'sometimes|string|max:255',
            'department'   => 'sometimes|string|max:100',
            'location'     => 'nullable|string|max:255',
            'type'         => 'in:Full-time,Part-time,Contract,Internship',
            'description'  => 'sometimes|string',
            'requirements' => 'nullable|string',
            'salary_range' => 'nullable|string|max:100',
            'closes_at'    => 'nullable|date',
            'is_active'    => 'boolean',
        ]);
        $career->update($data);
        return response()->json($career);
    }

    public function destroy(Career $career): JsonResponse
    {
        $career->delete();
        return response()->json(null, 204);
    }
}
