<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FulfillmentLog extends Model
{
    protected $fillable = [
        'user_id',
        'event_id',
        'provider',
        'type',
        'stage',
        'status',
        'error_message',
        'details'
    ];

    protected $casts = [
        'details' => 'array',
        'stage'   => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
