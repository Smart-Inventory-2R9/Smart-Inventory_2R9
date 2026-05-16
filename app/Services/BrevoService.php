<?php

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

class BrevoService
{
    public function sendEmail(array $data): Response
    {
        $payload = [
            'sender' => [
                'name' => $data['sender_name'] ?? config('services.brevo.sender_name'),
                'email' => $data['sender_email'] ?? config('services.brevo.sender_email'),
            ],
            'to' => [
                [
                    'email' => $data['to_email'],
                    'name' => $data['to_name'] ?? $data['to_email'],
                ],
            ],
            'subject' => $data['subject'],
        ];

        if (! empty($data['html_content'])) {
            $payload['htmlContent'] = $data['html_content'];
        }

        if (! empty($data['text_content'])) {
            $payload['textContent'] = $data['text_content'];
        }

        return Http::withHeaders([
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
            'api-key' => config('services.brevo.api_key'),
        ])->post(rtrim(config('services.brevo.base_uri'), '/') . '/smtp/email', $payload);
    }
}