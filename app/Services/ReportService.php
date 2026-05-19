<?php

namespace App\Services;

use App\Models\InventoryItem;
use App\Models\User;
use Illuminate\Support\Carbon;

class ReportService
{
    public function summaryForUser(User $user): array
    {
        $baseQuery = InventoryItem::where('user_id', $user->id);
        $today = Carbon::today();
        $sevenDaysFromNow = Carbon::today()->addDays(7);

        return [
            'total_items' => (clone $baseQuery)->count(),
            'total_quantity' => (int) (clone $baseQuery)->sum('quantity'),
            'out_of_stock_count' => (clone $baseQuery)->where('quantity', '<=', 0)->count(),
            'low_stock_count' => (clone $baseQuery)
                ->whereColumn('quantity', '<=', 'minimum_stock')
                ->count(),
            'expired_count' => (clone $baseQuery)
                ->whereNotNull('expiration_date')
                ->whereDate('expiration_date', '<', $today)
                ->count(),
            'expiring_soon_count' => (clone $baseQuery)
                ->whereNotNull('expiration_date')
                ->whereDate('expiration_date', '>=', $today)
                ->whereDate('expiration_date', '<=', $sevenDaysFromNow)
                ->count(),
        ];
    }

    public function stockStatusForUser(User $user): array
    {
        return [
            'out_of_stock' => InventoryItem::with('foodProduct')
                ->where('user_id', $user->id)
                ->where('quantity', '<=', 0)
                ->orderBy('name')
                ->get(),
            'low_stock' => InventoryItem::with('foodProduct')
                ->where('user_id', $user->id)
                ->where('quantity', '>', 0)
                ->whereColumn('quantity', '<=', 'minimum_stock')
                ->orderBy('quantity')
                ->get(),
            'in_stock' => InventoryItem::with('foodProduct')
                ->where('user_id', $user->id)
                ->whereColumn('quantity', '>', 'minimum_stock')
                ->orderBy('name')
                ->get(),
        ];
    }
}