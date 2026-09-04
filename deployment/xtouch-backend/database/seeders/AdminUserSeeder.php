<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = (string) config('services.initial_control_panel.email');
        $password = (string) config('services.initial_control_panel.password');

        if ($email === '' || $password === '') {
            $this->command?->warn('Initial control panel account skipped; set its email and password first.');

            return;
        }

        if (! filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($password) < 12) {
            throw new \RuntimeException('The initial control panel email must be valid and its password must be at least 12 characters.');
        }

        $admin = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => (string) config('services.initial_control_panel.name', 'X\'Touch Site Owner'),
                'password' => Hash::make($password),
                'email_verified_at' => now(),
            ],
        );

        $admin->assignRole('Super Admin');
    }
}
