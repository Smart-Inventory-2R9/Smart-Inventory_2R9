<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $staffRole = Role::firstOrCreate(['name' => 'staff']);

        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'role_id' => $adminRole->id,
                'name' => 'Admin User',
                'password' => 'password123',
            ]
        );

        User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'role_id' => $staffRole->id,
                'name' => 'Test User',
                'password' => 'password123',
            ]
        );
    }
}
