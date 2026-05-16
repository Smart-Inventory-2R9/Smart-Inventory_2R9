<?php

namespace App\Http\Controllers;

use App\Http\Requests\LookupFoodProductRequest;
use App\Models\FoodProduct;
use App\Services\OpenFoodFactsService;
use Illuminate\Http\Request;

class OpenFoodFactsController extends Controller
{
    public function show(
        LookupFoodProductRequest $request,
        OpenFoodFactsService $openFoodFactsService,
        string $barcode
    ) {
        $result = $openFoodFactsService->findByBarcode($barcode);

        if (! $result['found']) {
            return response()->json([
                'message' => $result['message'],
            ], $result['status']);
        }

        $sourceProduct = $result['product'];

        $foodProduct = FoodProduct::updateOrCreate(
            ['barcode' => $barcode],
            [
                'product_name' => $sourceProduct['product_name'] ?? null,
                'brand' => $sourceProduct['brands'] ?? null,
                'image_url' => $sourceProduct['image_url'] ?? null,
                'categories' => $sourceProduct['categories'] ?? null,
                'nutrition_grade' => $sourceProduct['nutriscore_grade']
                    ?? $sourceProduct['nutrition_grades']
                    ?? null,
                'raw_data' => $sourceProduct,
            ]
        );

        return response()->json([
            'message' => 'Product found',
            'food_product' => $foodProduct,
        ]);
    }
}
