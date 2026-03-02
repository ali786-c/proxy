<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateApiKey
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $key = $request->bearerToken() ?: $request->header('X-API-KEY');

        if (!$key) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'unauthenticated',
                    'message' => 'API key is missing.'
                ]
            ], 401);
        }

        $hash = \App\Models\ApiKey::hash($key);
        $apiKey = \App\Models\ApiKey::where('key_hash', $hash)
            ->where('is_active', true)
            ->with('user')
            ->first();

        if (!$apiKey) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'invalid_key',
                    'message' => 'Invalid or revoked API key.'
                ]
            ], 401);
        }

        // track usage
        $apiKey->update(['last_used_at' => now()]);

        // Log the request context as an attribute
        $request->attributes->set('api_key', $apiKey);
        
        // Log in the user for the current request
        \Illuminate\Support\Facades\Auth::setUser($apiKey->user);

        return $next($request);
    }
}
