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
        if (!$this->proof_path) return null;
        
        $baseUrl = rtrim(config('app.url'), '/');
        // Ensure we point to the public distribution of storage
        return $baseUrl . '/storage/' . $this->proof_path;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
