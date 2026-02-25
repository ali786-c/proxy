<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AutoBlogKeyword extends Model
{
    protected $fillable = [
        'keyword',
        'category',
        'last_used_at',
        'is_active'
    ];

    protected $casts = [
        'last_used_at' => 'datetime',
        'is_active' => 'boolean'
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
