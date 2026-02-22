<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = [
        'code',
        'type',
        'value',
        'min_amount',
        'max_uses',
        'used_count',
        'expires_at',
        'is_active',
    ];

    protected $casts = [
        'value'      => 'float',
        'min_amount' => 'float',
        'max_uses'   => 'integer',
        'used_count' => 'integer',
        'expires_at' => 'datetime',
        'is_active'  => 'boolean',
    ];

    /**
     * Scope to only include active coupons.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                     ->where(function ($q) {
                         $q->whereNull('expires_at')
                           ->orWhere('expires_at', '>', now());
                     });
    }

    /**
     * Check if the coupon is valid for a given amount.
     */
    public function isValid(float $amount): bool
    {
        if (!$this->is_active) return false;
        if ($this->expires_at && $this->expires_at->isPast()) return false;
        if ($this->max_uses !== null && $this->used_count >= $this->max_uses) return false;
        if ($amount < $this->min_amount) return false;

        return true;
    }

    /**
     * Calculate discount for a given amount.
     */
    public function calculateDiscount(float $amount): float
    {
        if ($this->type === 'percentage') {
            return round(($amount * $this->value) / 100, 2);
        }

        return min($this->value, $amount);
    }
}
