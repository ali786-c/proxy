<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Proxy extends Model
{
    protected $fillable = ['order_id', 'host', 'port', 'username', 'password', 'country', 'city'];
    
    public function order() { return $this->belongsTo(Order::class); }
}
