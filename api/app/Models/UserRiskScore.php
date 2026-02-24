<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserRiskScore extends Model
{
    protected $fillable = ['user_id', 'risk_score', 'risk_level', 'factors', 'last_calculated_at'];

    protected $casts = [
        'factors' => 'array',
        'last_calculated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
