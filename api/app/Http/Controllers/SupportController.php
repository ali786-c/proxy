<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use App\Models\TicketMessage;
use Illuminate\Http\Request;

class SupportController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            SupportTicket::where('user_id', $request->user()->id)->latest()->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'priority' => 'required|in:low,normal,high',
        ]);

        $ticket = SupportTicket::create([
            'user_id' => $request->user()->id,
            'subject' => $request->subject,
            'priority' => $request->priority,
            'status' => 'open',
        ]);

        TicketMessage::create([
            'support_ticket_id' => $ticket->id,
            'user_id' => $request->user()->id,
            'message' => $request->message,
        ]);

        return response()->json($ticket, 201);
    }

    public function show($id, Request $request)
    {
        $ticket = SupportTicket::with('messages')->findOrFail($id);
        
        // Authorization check
        if ($ticket->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($ticket);
    }
}
