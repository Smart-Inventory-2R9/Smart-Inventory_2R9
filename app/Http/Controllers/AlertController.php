<?php

namespace App\Http\Controllers;

use App\Http\Requests\SendInventoryAlertRequest;
use App\Services\ActivityLogService;
use App\Services\AlertService;

class AlertController extends Controller
{
    public function __construct(
        private AlertService $alertService,
        private ActivityLogService $activityLogService
    ) {}

    public function lowStock(SendInventoryAlertRequest $request)
    {
        $result = $this->alertService->sendLowStockAlert($request->user(), $request->validated());

        $this->activityLogService->record(
            $request->user(),
            'sent',
            'alerts',
            'Triggered low stock alert',
            ['channels' => $request->validated('channels'), 'alerts_sent' => $result['alerts_sent'] ?? []]
        );

        return response()->json($result);
    }

    public function expiringSoon(SendInventoryAlertRequest $request)
    {
        $result = $this->alertService->sendExpiringSoonAlert($request->user(), $request->validated());

        $this->activityLogService->record(
            $request->user(),
            'sent',
            'alerts',
            'Triggered expiring soon alert',
            [
                'channels' => $request->validated('channels'),
                'days' => $request->validated('days') ?? 7,
                'alerts_sent' => $result['alerts_sent'] ?? [],
            ]
        );

        return response()->json($result);
    }
}