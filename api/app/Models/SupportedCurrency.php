<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupportedCurrency extends Model
{
    protected $fillable = ['code', 'name', 'symbol', 'exchange_rate', 'is_active'];
    protected $casts = [
        'exchange_rate' => 'float',
        'is_active' => 'boolean',
    ];
}
