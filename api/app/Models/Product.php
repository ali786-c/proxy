<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = ['name', 'type', 'price', 'evomi_product_id', 'is_active'];
    protected $casts = [
        'price' => 'float',
        'is_active' => 'boolean',
    ];
}
