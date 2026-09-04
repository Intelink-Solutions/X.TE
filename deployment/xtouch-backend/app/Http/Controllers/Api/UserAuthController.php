<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Spatie\Permission\Models\Role;

class UserAuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $user = User::create($data);
        if (Role::where('name', 'Subscriber')->exists()) $user->assignRole('Subscriber');

        return $this->tokenResponse($user, 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => 'required|email', 'password' => 'required|string']);
        $user = User::where('email', $data['email'])->first();
        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'The email or password is incorrect.'], 422);
        }
        abort_if($user->isBlocked(), 403, 'This account has been blocked.');
        $user->update(['last_login_at' => now(), 'last_login_ip' => $request->ip()]);

        return $this->tokenResponse($user);
    }

    public function user(Request $request): JsonResponse
    {
        return response()->json($this->userPayload($request->user()));
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();
        return response()->json(['message' => 'Signed out.']);
    }

    private function tokenResponse(User $user, int $status = 200): JsonResponse
    {
        return response()->json([
            'token' => $user->createToken('xtouch-web')->plainTextToken,
            'user' => $this->userPayload($user),
        ], $status);
    }

    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'handle' => $user->handle ?: '@'.str($user->name)->slug(''),
            'bio' => $user->bio,
            'location' => $user->location,
            'email' => $user->email,
            'roles' => $user->getRoleNames()->values(),
            'approval' => $user->verificationRequests()->latest()->value('status') ?? 'unverified',
        ];
    }
}
