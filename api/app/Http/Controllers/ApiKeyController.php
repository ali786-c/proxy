<?php

namespace App\Http\Controllers;

use App\Models\ApiKey;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ApiKeyController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            ApiKey::where('user_id', $request->user()->id)->latest()->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'key_name' => 'required|string|max:255',
            'abilities' => 'nullable|array'
        ]);

        $plainTextKey = 'uproxy_' . Str::random(40);

        $apiKey = ApiKey::create([
            'user_id' => $request->user()->id,
            'key_name' => $request->key_name,
            'key_hash' => ApiKey::hash($plainTextKey),
            'abilities' => $request->abilities ?? ['*'], // Default to all permissions for now
            'is_active' => true,
        ]);

        // We return the plain text key ONLY once
        $apiKey->plain_text_key = $plainTextKey;

        return response()->json($apiKey, 201);
    }

    public function destroy($id, Request $request)
    {
        $key = ApiKey::where('user_id', $request->user()->id)->findOrFail($id);
        $key->delete();
        return response()->json(['message' => 'API Key deleted']);
    }
}
