<?php

namespace App\Http\Controllers;

use App\Http\Requests\SendTelegramAlertRequest;
use App\Services\TelegramService;

class TelegramController extends Controller
{
    public function sendAlert(SendTelegramAlertRequest $request, TelegramService $telegramService)
    {
        $response = $telegramService->sendAlert($request->validated());

        return response()->json($response->json(), $response->status());
    }
}