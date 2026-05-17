<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Collection;

class AlertService
{
    public function __construct(
        private InventoryService $inventoryService,
        private BrevoService $brevoService,
        private TelegramService $telegramService
    ) {}

    public function sendLowStockAlert(User $user, array $data): array
    {
        $items = $this->inventoryService->lowStockForUser($user);

        if ($items->isEmpty()) {
            return [
                'message' => 'No low stock items found. No alert sent.',
                'alerts_sent' => [],
                'items' => [],
            ];
        }

        $message = $this->buildLowStockMessage($items, $data['message_prefix'] ?? null);

        return [
            'message' => 'Low stock alert processed.',
            'alerts_sent' => $this->sendToChannels(
                $data,
                $data['subject'] ?? 'Smart Inventory Low Stock Alert',
                $message
            ),
            'items' => $items,
        ];
    }

    public function sendExpiringSoonAlert(User $user, array $data): array
    {
        $days = $data['days'] ?? 7;
        $items = $this->inventoryService->expiringSoonForUser($user, $days);

        if ($items->isEmpty()) {
            return [
                'message' => "No items expiring within {$days} days. No alert sent.",
                'alerts_sent' => [],
                'items' => [],
            ];
        }

        $message = $this->buildExpiringSoonMessage($items, $days, $data['message_prefix'] ?? null);

        return [
            'message' => 'Expiring soon alert processed.',
            'days' => $days,
            'alerts_sent' => $this->sendToChannels(
                $data,
                $data['subject'] ?? 'Smart Inventory Expiry Alert',
                $message
            ),
            'items' => $items,
        ];
    }

    private function sendToChannels(array $data, string $subject, string $message): array
    {
        $results = [];
        $channels = $data['channels'];

        if (in_array('email', $channels, true)) {
            $response = $this->brevoService->sendEmail([
                'to_email' => $data['to_email'],
                'to_name' => $data['to_name'] ?? null,
                'subject' => $subject,
                'text_content' => $message,
                'html_content' => nl2br(e($message)),
            ]);

            $results['email'] = [
                'status' => $response->status(),
                'body' => $response->json(),
            ];
        }

        if (in_array('telegram', $channels, true)) {
            $payload = [
                'message' => $message,
            ];

            if (! empty($data['chat_id'])) {
                $payload['chat_id'] = $data['chat_id'];
            }

            $response = $this->telegramService->sendAlert($payload);

            $results['telegram'] = [
                'status' => $response->status(),
                'body' => $response->json(),
            ];
        }

        return $results;
    }

    private function buildLowStockMessage(Collection $items, ?string $prefix): string
    {
        $lines = array_filter([
            $prefix,
            'Smart Inventory Low Stock Alert',
        ]);

        foreach ($items as $item) {
            $lines[] = sprintf(
                '- %s: %s %s left (minimum: %s)%s',
                $item->name,
                $item->quantity,
                $item->unit ?? 'units',
                $item->minimum_stock,
                $item->location ? " at {$item->location}" : ''
            );
        }

        return implode("\n", $lines);
    }

    private function buildExpiringSoonMessage(Collection $items, int $days, ?string $prefix): string
    {
        $lines = array_filter([
            $prefix,
            "Smart Inventory Expiry Alert: items expiring within {$days} days",
        ]);

        foreach ($items as $item) {
            $lines[] = sprintf(
                '- %s: expires on %s, quantity: %s %s%s',
                $item->name,
                $item->expiration_date,
                $item->quantity,
                $item->unit ?? 'units',
                $item->location ? " at {$item->location}" : ''
            );
        }

        return implode("\n", $lines);
    }
}