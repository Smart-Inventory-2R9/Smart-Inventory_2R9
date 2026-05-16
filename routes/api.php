<?php

use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'app' => config('app.name'),
    ]);
});


use App\Http\Controllers\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});


Route::middleware(['auth:sanctum', 'role:admin'])->get('/admin/test', function () {
    return response()->json([
        'message' => 'Admin access granted',
    ]);
});


use App\Http\Controllers\OpenFoodFactsController;

Route::middleware('auth:sanctum')->get(
    '/open-food-facts/{barcode}',
    [OpenFoodFactsController::class, 'show']
);


use App\Http\Controllers\InventoryController;

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('inventory', InventoryController::class);
});