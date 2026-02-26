<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PendingCryptoTransaction extends Model
{
    protected $fillable = [
        'user_id',
        'currency',
        'amount',
        'txid',
        'status',
        'admin_note',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
