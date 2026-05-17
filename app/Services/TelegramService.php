<?php

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

class TelegramService
{
    public function sendAlert(array $data): Response
    {
        $botToken = config('services.telegram.bot_token');
        $chatId = $data['chat_id'] ?? config('services.telegram.default_chat_id');

        $payload = [
            'chat_id' => $chatId,
            'text' => $data['message'],
            'disable_notification' => $data['disable_notification'] ?? false,
        ];

        if (! empty($data['parse_mode'])) {
            $payload['parse_mode'] = $data['parse_mode'];
        }

        return Http::withHeaders([
            'Accept' => 'application/json',
        ])->post(
            rtrim(config('services.telegram.base_uri'), '/') . "/bot{$botToken}/sendMessage",
            $payload
        );
    }
}