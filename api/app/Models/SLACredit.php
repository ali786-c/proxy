<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SLACredit extends Model
{
    protected $table = 'sla_credits';

    protected $fillable = [
        'user_id',
        'proxy_type',
        'guaranteed_uptime',
        'actual_uptime',
        'credit_amount',
        'status',
        'reason',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
