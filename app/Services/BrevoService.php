<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Throwable;

class BrevoService
{
    public function __construct(private NotificationLogService $notificationLogService) {}

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

    public function sendEmailAndLog(User $user, array $data): array
    {
        $sentMessage = $data['html_content'] ?? $data['text_content'] ?? '';

        try {
            $response = $this->sendEmail($data);
            $body = $response->json() ?? ['body' => $response->body()];
            $status = $response->successful() ? 'sent' : 'failed';

            $log = $this->notificationLogService->create($user, [
                'type' => 'brevo_email',
                'channel' => 'email',
                'recipient' => $data['to_email'],
                'subject' => $data['subject'],
                'message' => $sentMessage,
                'status_code' => $response->status(),
                'status' => $status,
                'response' => $body,
            ]);

            return [
                'http_status' => $response->successful() ? 200 : 502,
                'body' => [
                    'message' => $response->successful()
                        ? 'Email sent successfully.'
                        : 'Email sending failed.',
                    'status' => $status,
                    'external_status' => $response->status(),
                    'brevo' => $body,
                    'notification' => $log,
                ],
            ];
        } catch (Throwable $exception) {
            $log = $this->notificationLogService->create($user, [
                'type' => 'brevo_email',
                'channel' => 'email',
                'recipient' => $data['to_email'],
                'subject' => $data['subject'],
                'message' => $sentMessage,
                'status' => 'failed',
                'response' => [
                    'error' => $exception->getMessage(),
                ],
            ]);

            return [
                'http_status' => 502,
                'body' => [
                    'message' => 'Email sending failed.',
                    'status' => 'failed',
                    'error' => $exception->getMessage(),
                    'notification' => $log,
                ],
            ];
        }
    }
}
