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

    public function listForUser(User $user, array $filters = [])
    {
        $query = InventoryItem::with('foodProduct')
            ->where('user_id', $user->id);

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['location'])) {
            $query->where('location', 'like', "%{$filters['location']}%");
        }

        if (! empty($filters['barcode'])) {
            $query->where('barcode', $filters['barcode']);
        }

        if (! empty($filters['status'])) {
            $today = Carbon::today();

            match ($filters['status']) {
                'low_stock' => $query->whereColumn('quantity', '<=', 'minimum_stock'),
                'out_of_stock' => $query->where('quantity', '<=', 0),
                'in_stock' => $query->whereColumn('quantity', '>', 'minimum_stock'),
                'expired' => $query->whereNotNull('expiration_date')
                    ->whereDate('expiration_date', '<', $today),
                'expiring_soon' => $query->whereNotNull('expiration_date')
                    ->whereDate('expiration_date', '>=', $today)
                    ->whereDate('expiration_date', '<=', Carbon::today()->addDays((int) ($filters['expires_within_days'] ?? 7))),
            };
        } elseif (! empty($filters['expires_within_days'])) {
            $query->whereNotNull('expiration_date')
                ->whereDate('expiration_date', '>=', Carbon::today())
                ->whereDate('expiration_date', '<=', Carbon::today()->addDays((int) $filters['expires_within_days']));
        }

        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortDirection = $filters['sort_direction'] ?? 'desc';
        $perPage = $filters['per_page'] ?? 15;

        return $query->orderBy($sortBy, $sortDirection)->paginate($perPage)->withQueryString();
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