<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FoodProduct extends Model
{
    protected $fillable = [
        'barcode',
        'product_name',
        'brand',
        'image_url',
        'categories',
        'nutrition_grade',
        'raw_data',
    ];

    protected $casts = [
        'raw_data' => 'array',
    ];
}
