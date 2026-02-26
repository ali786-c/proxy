<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $fillable = [
        'user_id',
        'stripe_invoice_id',
        'amount',
        'currency',
        'status',
        'pdf_url',
        'description',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
