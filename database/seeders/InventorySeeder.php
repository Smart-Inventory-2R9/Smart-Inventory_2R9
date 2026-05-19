<?php

namespace Database\Seeders;

use App\Models\FoodProduct;
use App\Models\InventoryItem;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    public function run(): void
    {
        $staffRole = Role::firstOrCreate(['name' => 'staff']);
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'role_id' => $staffRole->id,
                'name' => 'Test User',
                'password' => 'password123',
            ]
        );

        $nutella = FoodProduct::where('barcode', '3017620422003')->first();

        $items = [
            [
                'name' => 'Rice',
                'barcode' => '4800012345678',
                'quantity' => 10,
                'unit' => 'kg',
                'minimum_stock' => 2,
                'location' => 'Shelf A',
                'expiration_date' => now()->addDays(90)->toDateString(),
            ],
            [
                'name' => 'Milk',
                'barcode' => '4800012345679',
                'quantity' => 1,
                'unit' => 'cartons',
                'minimum_stock' => 5,
                'location' => 'Chiller',
                'expiration_date' => now()->addDays(3)->toDateString(),
            ],
            [
                'name' => 'Canned Tuna',
                'barcode' => '4800012345680',
                'quantity' => 0,
                'unit' => 'cans',
                'minimum_stock' => 3,
                'location' => 'Shelf B',
                'expiration_date' => now()->addYear()->toDateString(),
            ],
            [
                'name' => 'Yogurt',
                'barcode' => '4800012345681',
                'quantity' => 4,
                'unit' => 'cups',
                'minimum_stock' => 2,
                'location' => 'Chiller',
                'expiration_date' => now()->subDays(2)->toDateString(),
            ],
            [
                'food_product_id' => $nutella?->id,
                'name' => 'Nutella',
                'barcode' => '3017620422003',
                'quantity' => 2,
                'unit' => 'jars',
                'minimum_stock' => 1,
                'location' => 'Shelf C',
                'expiration_date' => now()->addMonths(6)->toDateString(),
            ],
        ];

        foreach ($items as $item) {
            InventoryItem::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'name' => $item['name'],
                ],
                array_merge($item, ['user_id' => $user->id])
            );
        }
    }
}
