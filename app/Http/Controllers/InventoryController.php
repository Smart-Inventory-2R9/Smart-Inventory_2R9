<?php

namespace App\Http\Controllers;

use App\Http\Requests\ExpiringInventoryRequest;
use App\Http\Requests\StoreInventoryItemRequest;
use App\Http\Requests\UpdateInventoryItemRequest;
use App\Services\InventoryService;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function __construct(private InventoryService $inventoryService) {}

    public function index(Request $request)
    {
        return response()->json([
            'data' => $this->inventoryService->listForUser($request->user()),
        ]);
    }

    public function expiringSoon(ExpiringInventoryRequest $request)
    {
        $days = $request->validated('days') ?? 7;

        return response()->json([
            'days' => $days,
            'data' => $this->inventoryService->expiringSoonForUser($request->user(), $days),
        ]);
    }

    public function expired(Request $request)
    {
        return response()->json([
            'data' => $this->inventoryService->expiredForUser($request->user()),
        ]);
    }

    public function lowStock(Request $request)
    {
        return response()->json([
            'data' => $this->inventoryService->lowStockForUser($request->user()),
        ]);
    }

    public function store(StoreInventoryItemRequest $request)
    {
        $item = $this->inventoryService->createForUser(
            $request->user(),
            $request->validated()
        );

        return response()->json([
            'message' => 'Inventory item created',
            'data' => $item,
        ], 201);
    }

    public function show(Request $request, int $id)
    {
        return response()->json([
            'data' => $this->inventoryService->findForUser($request->user(), $id),
        ]);
    }

    public function update(UpdateInventoryItemRequest $request, int $id)
    {
        $item = $this->inventoryService->updateForUser(
            $request->user(),
            $id,
            $request->validated()
        );

        return response()->json([
            'message' => 'Inventory item updated',
            'data' => $item,
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        $this->inventoryService->deleteForUser($request->user(), $id);

        return response()->json([
            'message' => 'Inventory item deleted',
        ]);
    }
}