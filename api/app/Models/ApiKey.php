<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApiKey extends Model
{
    protected $fillable = ['user_id', 'key_name', 'key_hash', 'abilities', 'is_active', 'last_used_at'];
    
    protected $casts = [
        'abilities' => 'array',
        'is_active' => 'boolean',
        'last_used_at' => 'datetime',
    ];

    public function user() 
    { 
        return $this->belongsTo(User::class); 
    }

    /**
     * Hash the plain text API key.
     */
    public static function hash(string $key): string
    {
        return hash('sha256', $key);
    }

    /**
     * Check if the key has a specific ability.
     */
    public function hasAbility(string $ability): bool
    {
        if (!$this->abilities) return false;
        return in_array('*', $this->abilities) || in_array($ability, $this->abilities);
    }
}
