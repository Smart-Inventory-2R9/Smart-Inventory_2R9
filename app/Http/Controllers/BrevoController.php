<?php

namespace App\Http\Controllers;

use App\Http\Requests\SendEmailRequest;
use App\Services\BrevoService;

class BrevoController extends Controller
{
    public function sendEmail(SendEmailRequest $request, BrevoService $brevoService)
    {
        $result = $brevoService->sendEmailAndLog($request->user(), $request->validated());

        return response()->json($result['body'], $result['http_status']);
    }
}
