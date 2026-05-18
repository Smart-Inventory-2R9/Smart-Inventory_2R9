<?php

namespace App\Http\Controllers;

use App\Services\NotificationLogService;
use Illuminate\Http\Request;

class NotificationLogController extends Controller
{
    public function __construct(private NotificationLogService $notificationLogService) {}

    public function index(Request $request)
    {
        return response()->json([
            'data' => $this->notificationLogService->listForUser($request->user()),
        ]);
    }

    public function show(Request $request, int $id)
    {
        return response()->json([
            'data' => $this->notificationLogService->findForUser($request->user(), $id),
        ]);
    }
}