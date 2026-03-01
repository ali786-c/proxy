<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = ['name', 'type', 'price', 'evomi_product_id', 'is_active', 'tagline', 'features', 'volume_discounts'];

    protected $casts = [
        'is_active' => 'boolean',
        'price' => 'decimal:2',
        'features' => 'array',
        'volume_discounts' => 'array',
    ];
}
