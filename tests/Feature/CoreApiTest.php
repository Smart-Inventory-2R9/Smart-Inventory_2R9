<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CoreApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_and_view_profile(): void
    {
        $staffRole = Role::create(['name' => 'staff']);
        User::factory()->create([
            'role_id' => $staffRole->id,
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $loginResponse = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $loginResponse
            ->assertOk()
            ->assertJsonStructure(['message', 'user', 'token']);

        $token = $loginResponse->json('token');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('user.email', 'test@example.com');
    }

    public function test_authenticated_user_can_create_inventory_item(): void
    {
        $user = $this->createUserWithRole('staff');

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/inventory', [
            'name' => 'Rice',
            'barcode' => '4800012345678',
            'quantity' => 10,
            'unit' => 'kg',
            'minimum_stock' => 2,
            'location' => 'Storage Room',
            'expiration_date' => '2026-12-31',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('message', 'Inventory item created')
            ->assertJsonPath('data.name', 'Rice');

        $this->assertDatabaseHas('inventory_items', [
            'user_id' => $user->id,
            'name' => 'Rice',
            'quantity' => 10,
        ]);
    }

    public function test_inventory_status_filter_returns_low_stock_items(): void
    {
        $user = $this->createUserWithRole('staff');

        $this->actingAs($user, 'sanctum')->postJson('/api/inventory', [
            'name' => 'Milk',
            'quantity' => 1,
            'unit' => 'cartons',
            'minimum_stock' => 5,
        ])->assertCreated();

        $this->actingAs($user, 'sanctum')->postJson('/api/inventory', [
            'name' => 'Rice',
            'quantity' => 10,
            'unit' => 'kg',
            'minimum_stock' => 2,
        ])->assertCreated();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/inventory?status=low_stock&per_page=5');

        $response
            ->assertOk()
            ->assertJsonPath('data.data.0.name', 'Milk')
            ->assertJsonMissing(['name' => 'Rice']);
    }

    public function test_admin_cannot_assign_same_admin_role_again(): void
    {
        $admin = $this->createUserWithRole('admin');
        $targetUser = $this->createUserWithRole('admin');

        $response = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/admin/users/{$targetUser->id}/role", [
                'role' => 'admin',
            ]);

        $response
            ->assertUnprocessable()
            ->assertJsonPath('errors.role.0', 'The selected user is already an admin.');
    }

    private function createUserWithRole(string $roleName): User
    {
        $role = Role::firstOrCreate(['name' => $roleName]);

        return User::factory()->create([
            'role_id' => $role->id,
        ]);
    }
}