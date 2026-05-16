<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    protected $fillable = [
        'user_id',
        'food_product_id',
        'name',
        'barcode',
        'quantity',
        'unit',
        'minimum_stock',
        'location',
        'expiration_date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function foodProduct()
    {
        return $this->belongsTo(FoodProduct::class);
    }
}
