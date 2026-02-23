<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebhookLog extends Model
{
    protected $fillable = ['provider', 'event_id', 'processed_at'];
    protected $casts = ['processed_at' => 'datetime'];
}
