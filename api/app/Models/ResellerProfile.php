<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResellerProfile extends Model
{
    protected $fillable = [
        'user_id', 
        'company_name', 
        'commission_rate', 
        'brand_primary_color', 
        'brand_secondary_color', 
        'custom_domain', 
        'is_active'
    ];

    protected $casts = [
        'commission_rate' => 'float',
        'is_active' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
