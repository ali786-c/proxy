<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FraudSignal extends Model
{
    protected $fillable = [
        'user_id', 'signal_type', 'severity', 'description', 
        'ip_address', 'geo_country', 'geo_city', 'is_resolved', 'resolved_at'
    ];

    protected $casts = [
        'is_resolved' => 'boolean',
        'resolved_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
