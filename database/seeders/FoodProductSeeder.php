<?php

namespace Database\Seeders;

use App\Models\FoodProduct;
use Illuminate\Database\Seeder;

class FoodProductSeeder extends Seeder
{
    public function run(): void
    {
        FoodProduct::updateOrCreate(
            ['barcode' => '3017620422003'],
            [
                'product_name' => 'Nutella',
                'brand' => 'Nutella',
                'image_url' => 'https://images.openfoodfacts.org/images/products/301/762/042/2003/front_en.820.400.jpg',
                'categories' => 'Spreads, Hazelnut cocoa spread',
                'nutrition_grade' => 'e',
                'raw_data' => [
                    'source' => 'database seeder',
                    'barcode' => '3017620422003',
                ],
            ]
        );
    }
}
