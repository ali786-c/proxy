<?php

namespace App\Http\Controllers;

use App\Models\AllowlistEntry;
use Illuminate\Http\Request;

class AllowlistController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            AllowlistEntry::where('user_id', $request->user()->id)->latest()->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'ip'    => 'required|string|max:45', // max length for IPv6
            'label' => 'nullable|string|max:255',
        ]);

        $entry = AllowlistEntry::create([
            'user_id' => $request->user()->id,
            'ip'      => $request->ip,
            'label'   => $request->label,
        ]);

        return response()->json($entry, 201);
    }

    public function destroy($id, Request $request)
    {
        \Log::info("Allowlist Delete Attempt", ['user_id' => $request->user()->id, 'entry_id' => $id]);
        $entry = AllowlistEntry::where('user_id', $request->user()->id)->findOrFail($id);
        $entry->delete();
        \Log::info("Allowlist Delete Success", ['entry_id' => $id]);
        return response()->json(['message' => 'IP removed from allowlist']);
    }
}
