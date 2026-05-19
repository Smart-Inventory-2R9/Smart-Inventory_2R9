<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class OpenFoodFactsService
{
    public function findByBarcode(string $barcode): array
    {
        $baseUri = rtrim(config('services.openfoodfacts.base_uri'), '/');

        $response = Http::withHeaders([
            'User-Agent' => config('services.openfoodfacts.user_agent'),
        ])
            ->acceptJson()
            ->timeout(10)
            ->get($baseUri . "/api/v2/product/{$barcode}.json", [
                'fields' => 'code,product_name,brands,image_url,categories,nutriscore_grade,nutrition_grades',
            ]);

        if ($response->failed()) {
            return [
                'found' => false,
                'status' => $response->status(),
                'message' => 'Open Food Facts request failed',
            ];
        }

        $data = $response->json();

        if (($data['status'] ?? 0) !== 1 || empty($data['product'])) {
            return [
                'found' => false,
                'status' => 404,
                'message' => 'Product not found',
            ];
        }

        return [
            'found' => true,
            'product' => $data['product'],
        ];
    }
}
