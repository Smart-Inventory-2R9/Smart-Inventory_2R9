<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(private ReportService $reportService) {}

    public function summary(Request $request)
    {
        return response()->json([
            'data' => $this->reportService->summaryForUser($request->user()),
        ]);
    }

    public function stockStatus(Request $request)
    {
        return response()->json([
            'data' => $this->reportService->stockStatusForUser($request->user()),
        ]);
    }
}