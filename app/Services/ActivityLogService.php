<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;

class ActivityLogService
{
    public function listForUser(User $user, int $perPage = 15)
    {
        return ActivityLog::with('user:id,name,email')
            ->where('user_id', $user->id)
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function findForUser(User $user, int $id): ActivityLog
    {
        return ActivityLog::with('user:id,name,email')
            ->where('user_id', $user->id)
            ->findOrFail($id);
    }

    public function record(?User $user, string $action, string $module, ?string $description = null, array $properties = []): ActivityLog
    {
        return ActivityLog::create([
            'user_id' => $user?->id,
            'action' => $action,
            'module' => $module,
            'description' => $description,
            'properties' => $properties,
        ]);
    }
}