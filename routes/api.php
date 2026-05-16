<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BrevoController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\OpenFoodFactsController;
use App\Http\Controllers\TelegramController;
use App\Http\Controllers\UsdaController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'app' => config('app.name'),
    ]);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/open-food-facts/{barcode}', [OpenFoodFactsController::class, 'show']);
    Route::apiResource('inventory', InventoryController::class);

    Route::post('/usda/lookup', [UsdaController::class, 'lookup']);
    Route::post('/brevo/send-email', [BrevoController::class, 'sendEmail']);
    Route::post('/telegram/send-alert', [TelegramController::class, 'sendAlert']);
});

Route::middleware(['auth:sanctum', 'role:admin'])->get('/admin/test', function () {
    return response()->json([
        'message' => 'Admin access granted',
    ]);
});