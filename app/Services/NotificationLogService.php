<?php

namespace App\Services;

use App\Models\NotificationLog;
use App\Models\User;
use Illuminate\Support\Carbon;

class NotificationLogService
{
    public function listForUser(User $user)
    {
        return NotificationLog::where('user_id', $user->id)
            ->latest('sent_at')
            ->latest()
            ->get();
    }

    public function findForUser(User $user, int $id): NotificationLog
    {
        return NotificationLog::where('user_id', $user->id)->findOrFail($id);
    }

    public function create(User $user, array $data): NotificationLog
    {
        return NotificationLog::create([
            'user_id' => $user->id,
            'type' => $data['type'],
            'channel' => $data['channel'],
            'recipient' => $data['recipient'] ?? null,
            'subject' => $data['subject'] ?? null,
            'message' => $data['message'] ?? null,
            'status_code' => $data['status_code'] ?? null,
            'status' => $data['status'] ?? 'sent',
            'response' => $data['response'] ?? null,
            'sent_at' => $data['sent_at'] ?? Carbon::now(),
        ]);
    }
}