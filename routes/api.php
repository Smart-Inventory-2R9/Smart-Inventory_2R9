<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AdminRoleController;
use App\Http\Controllers\AdminTestController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AlertController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BrevoController;
use App\Http\Controllers\HealthController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\MealDbController;
use App\Http\Controllers\NotificationLogController;
use App\Http\Controllers\OpenFoodFactsController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TelegramController;
use App\Http\Controllers\UsdaController;
use Illuminate\Support\Facades\Route;

Route::get('/health', HealthController::class);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/reports/summary', [ReportController::class, 'summary']);
    Route::get('/reports/stock-status', [ReportController::class, 'stockStatus']);

    Route::post('/alerts/low-stock', [AlertController::class, 'lowStock']);
    Route::post('/alerts/expiring-soon', [AlertController::class, 'expiringSoon']);

    Route::get('/notifications', [NotificationLogController::class, 'index']);
    Route::get('/notifications/{id}', [NotificationLogController::class, 'show']);

    Route::get('/activity-logs', [ActivityLogController::class, 'index']);
    Route::get('/activity-logs/{id}', [ActivityLogController::class, 'show']);

    Route::get('/open-food-facts/{barcode}', [OpenFoodFactsController::class, 'show']);
    Route::get('/inventory/expiring-soon', [InventoryController::class, 'expiringSoon']);
    Route::get('/inventory/expired', [InventoryController::class, 'expired']);
    Route::get('/inventory/low-stock', [InventoryController::class, 'lowStock']);
    Route::apiResource('inventory', InventoryController::class);

    Route::post('/usda/lookup', [UsdaController::class, 'lookup']);
    Route::post('/brevo/send-email', [BrevoController::class, 'sendEmail']);
    Route::post('/telegram/send-alert', [TelegramController::class, 'sendAlert']);

    Route::post('/mealdb/search', [MealDbController::class, 'search']);
    Route::post('/mealdb/filter-by-ingredient', [MealDbController::class, 'filterByIngredient']);
    Route::post('/mealdb/lookup', [MealDbController::class, 'lookup']);
});

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/admin/test', AdminTestController::class);

    Route::get('/admin/roles', [AdminRoleController::class, 'index']);
    Route::get('/admin/users/deleted', [AdminUserController::class, 'deleted']);
    Route::get('/admin/users', [AdminUserController::class, 'index']);
    Route::get('/admin/users/{id}', [AdminUserController::class, 'show']);
    Route::put('/admin/users/{id}/role', [AdminUserController::class, 'updateRole']);
    Route::put('/admin/users/{id}/restore', [AdminUserController::class, 'restore']);
    Route::delete('/admin/users/{id}', [AdminUserController::class, 'destroy']);
});
