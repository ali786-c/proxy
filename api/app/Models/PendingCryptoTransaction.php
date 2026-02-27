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
        'binance_id',
        'proof_path',
        'status',
        'admin_note',
    ];

    protected $appends = ['proof_url'];

    public function getProofUrlAttribute()
    {
        return $this->proof_path ? asset('storage/' . $this->proof_path) : null;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
