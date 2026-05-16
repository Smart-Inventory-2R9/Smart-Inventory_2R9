<?php

namespace App\Services;

use App\Models\InventoryItem;
use App\Models\User;

class InventoryService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function listForUser(User $user)
    {
        return InventoryItem::with('foodProduct')
            ->where('user_id', $user->id)
            ->latest()
            ->get();
    }

    public function createForUser(User $user, array $data): InventoryItem
    {
        $data['user_id'] = $user->id;

        return InventoryItem::create($data);
    }

    public function findForUser(User $user, int $id): InventoryItem
    {
        return InventoryItem::with('foodProduct')
            ->where('user_id', $user->id)
            ->findOrFail($id);
    }

    public function updateForUser(User $user, int $id, array $data): InventoryItem
    {
        $item = $this->findForUser($user, $id);
        $item->update($data);

        return $item->fresh('foodProduct');
    }

    public function deleteForUser(User $user, int $id): void
    {
        $item = $this->findForUser($user, $id);
        $item->delete();
    }
}
