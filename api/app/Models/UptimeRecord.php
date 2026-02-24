<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UptimeRecord extends Model
{
    protected $fillable = [
        'proxy_type',
        'status',
        'response_time_ms',
        'region',
        'checked_at',
    ];

    protected $casts = [
        'checked_at' => 'datetime',
    ];
}
