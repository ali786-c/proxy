<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = ['user_id', 'product_id', 'evomi_order_id', 'status', 'expires_at'];
    protected $casts = ['expires_at' => 'datetime'];

    public function user() { return $this->belongsTo(User::class); }
    public function product() { return $this->belongsTo(Product::class); }
    public function proxies() { return $this->hasMany(Proxy::class); }
    public function usage_logs() { return $this->hasMany(UsageLog::class); }
}
