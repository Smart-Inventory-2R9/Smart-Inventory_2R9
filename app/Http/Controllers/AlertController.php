<?php

namespace App\Http\Controllers;

use App\Http\Requests\SendInventoryAlertRequest;
use App\Services\AlertService;

class AlertController extends Controller
{
    public function __construct(private AlertService $alertService) {}

    public function lowStock(SendInventoryAlertRequest $request)
    {
        return response()->json(
            $this->alertService->sendLowStockAlert($request->user(), $request->validated())
        );
    }

    public function expiringSoon(SendInventoryAlertRequest $request)
    {
        return response()->json(
            $this->alertService->sendExpiringSoonAlert($request->user(), $request->validated())
        );
    }
}