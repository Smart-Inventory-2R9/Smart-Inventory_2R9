<?php

namespace App\Http\Controllers;

use App\Http\Requests\PaginationRequest;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function __construct(private ActivityLogService $activityLogService) {}

    public function index(PaginationRequest $request)
    {
        return response()->json(
            $this->activityLogService->listForUser(
                $request->user(),
                $request->validated('per_page') ?? 15
            )
        );
    }

    public function show(Request $request, int $id)
    {
        return response()->json([
            'data' => $this->activityLogService->findForUser($request->user(), $id),
        ]);
    }
}