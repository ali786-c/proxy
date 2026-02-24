<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SLAConfig extends Model
{
    protected $fillable = [
        'proxy_type',
        'guaranteed_uptime',
        'credit_per_percent',
        'measurement_window',
        'is_active',
    ];
}
