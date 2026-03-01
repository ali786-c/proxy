<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailTemplate extends Model
{
    use Illuminate\Database\Eloquent\SoftDeletes;

    protected $fillable = [
        'key',
        'name',
        'subject',
        'body',
        'format',
        'is_active',
        'variables',
        'description',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'variables' => 'array',
    ];
}
