<?php

namespace App\Http\Controllers;

use App\Http\Requests\MealDbIngredientRequest;
use App\Http\Requests\MealDbLookupRequest;
use App\Http\Requests\MealDbSearchRequest;
use App\Services\MealDbService;

class MealDbController extends Controller
{
    public function search(MealDbSearchRequest $request, MealDbService $mealDbService)
    {
        $response = $mealDbService->searchByName($request->validated());

        return response()->json($response->json(), $response->status());
    }

    public function filterByIngredient(MealDbIngredientRequest $request, MealDbService $mealDbService)
    {
        $response = $mealDbService->filterByIngredient($request->validated());

        return response()->json($response->json(), $response->status());
    }

    public function lookup(MealDbLookupRequest $request, MealDbService $mealDbService)
    {
        $response = $mealDbService->lookupById($request->validated());

        return response()->json($response->json(), $response->status());
    }
}