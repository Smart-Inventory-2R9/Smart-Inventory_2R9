<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\NotificationLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ManagementApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_reports_summary_returns_inventory_counts(): void
    {
        $user = $this->createUserWithRole('staff');

        $this->actingAs($user, 'sanctum')->postJson('/api/inventory', [
            'name' => 'Milk',
            'quantity' => 1,
            'unit' => 'cartons',
            'minimum_stock' => 5,
            'expiration_date' => now()->addDays(3)->toDateString(),
        ])->assertCreated();

        $this->actingAs($user, 'sanctum')->postJson('/api/inventory', [
            'name' => 'Rice',
            'quantity' => 10,
            'unit' => 'kg',
            'minimum_stock' => 2,
        ])->assertCreated();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/reports/summary')
            ->assertOk()
            ->assertJsonPath('data.total_items', 2)
            ->assertJsonPath('data.total_quantity', 11)
            ->assertJsonPath('data.low_stock_count', 1)
            ->assertJsonPath('data.expiring_soon_count', 1);
    }

    public function test_notification_history_returns_paginated_logs(): void
    {
        $user = $this->createUserWithRole('staff');

        NotificationLog::create([
            'user_id' => $user->id,
            'type' => 'low_stock',
            'channel' => 'telegram',
            'recipient' => '123456789',
            'subject' => 'Smart Inventory Low Stock Alert',
            'message' => 'Rice is low stock.',
            'status_code' => 200,
            'status' => 'sent',
            'response' => ['ok' => true],
            'sent_at' => now(),
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/notifications?per_page=5')
            ->assertOk()
            ->assertJsonPath('data.0.channel', 'telegram')
            ->assertJsonPath('per_page', 5);
    }

    public function test_activity_logs_returns_paginated_logs(): void
    {
        $user = $this->createUserWithRole('staff');

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'created',
            'module' => 'inventory',
            'description' => 'Created inventory item: Rice',
            'properties' => ['inventory_item_id' => 1],
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/activity-logs?per_page=5')
            ->assertOk()
            ->assertJsonPath('data.0.module', 'inventory')
            ->assertJsonPath('per_page', 5);
    }

    public function test_admin_users_requires_admin_role(): void
    {
        $staff = $this->createUserWithRole('staff');

        $this->actingAs($staff, 'sanctum')
            ->getJson('/api/admin/users')
            ->assertForbidden()
            ->assertJsonPath('message', 'Forbidden');
    }

    public function test_admin_can_soft_delete_and_restore_user(): void
    {
        $admin = $this->createUserWithRole('admin');
        $staff = $this->createUserWithRole('staff');

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/admin/users/{$staff->id}")
            ->assertOk()
            ->assertJsonPath('message', 'User deleted');

        $this->assertSoftDeleted('users', [
            'id' => $staff->id,
        ]);

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/users/deleted')
            ->assertOk()
            ->assertJsonPath('data.0.id', $staff->id);

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/admin/users/{$staff->id}/restore")
            ->assertOk()
            ->assertJsonPath('message', 'User restored')
            ->assertJsonPath('data.id', $staff->id);

        $this->assertDatabaseHas('users', [
            'id' => $staff->id,
            'deleted_at' => null,
        ]);
    }

    private function createUserWithRole(string $roleName): User
    {
        $role = Role::firstOrCreate(['name' => $roleName]);

        return User::factory()->create([
            'role_id' => $role->id,
        ]);
    }
}