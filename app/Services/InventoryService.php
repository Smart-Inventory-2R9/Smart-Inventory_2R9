<?php

namespace App\Services;

use App\Models\InventoryItem;
use App\Models\User;
use Illuminate\Support\Carbon;

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

    public function expiringSoonForUser(User $user, int $days = 7)
    {
        $today = Carbon::today();
        $until = Carbon::today()->addDays($days);

        return InventoryItem::with('foodProduct')
            ->where('user_id', $user->id)
            ->whereNotNull('expiration_date')
            ->whereDate('expiration_date', '>=', $today)
            ->whereDate('expiration_date', '<=', $until)
            ->orderBy('expiration_date')
            ->get();
    }

    public function expiredForUser(User $user)
    {
        return InventoryItem::with('foodProduct')
            ->where('user_id', $user->id)
            ->whereNotNull('expiration_date')
            ->whereDate('expiration_date', '<', Carbon::today())
            ->orderBy('expiration_date')
            ->get();
    }

    public function lowStockForUser(User $user)
    {
        return InventoryItem::with('foodProduct')
            ->where('user_id', $user->id)
            ->whereColumn('quantity', '<=', 'minimum_stock')
            ->orderBy('quantity')
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