<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketMessage extends Model
{
    protected $fillable = ['support_ticket_id', 'user_id', 'message'];
    
    public function ticket() { return $this->belongsTo(SupportTicket::class); }
    public function user() { return $this->belongsTo(User::class); }
}
