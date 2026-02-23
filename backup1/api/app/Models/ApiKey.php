<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApiKey extends Model
{
    protected $fillable = ['user_id', 'key_name', 'api_key', 'is_active'];
    
    public function user() { return $this->belongsTo(User::class); }
}
