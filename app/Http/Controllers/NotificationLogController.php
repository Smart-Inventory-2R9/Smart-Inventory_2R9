<?php

namespace App\Http\Controllers;

use App\Http\Requests\PaginationRequest;
use App\Services\NotificationLogService;
use Illuminate\Http\Request;

class NotificationLogController extends Controller
{
    public function __construct(private NotificationLogService $notificationLogService) {}

    public function index(PaginationRequest $request)
    {
        return response()->json(
            $this->notificationLogService->listForUser(
                $request->user(),
                $request->validated('per_page') ?? 15
            )
        );
    }

    public function show(Request $request, int $id)
    {
        return response()->json([
            'data' => $this->notificationLogService->findForUser($request->user(), $id),
        ]);
    }
}