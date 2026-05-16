<?php

namespace App\Http\Controllers;

use App\Http\Requests\SendEmailRequest;
use App\Services\BrevoService;

class BrevoController extends Controller
{
    public function sendEmail(SendEmailRequest $request, BrevoService $brevoService)
    {
        $response = $brevoService->sendEmail($request->validated());

        return response()->json($response->json(), $response->status());
    }
}