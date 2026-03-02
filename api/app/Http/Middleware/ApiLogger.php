<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ApiLogger
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $request->attributes->set('api_start_time', microtime(true));
        
        return $next($request);
    }

    /**
     * Handle tasks after the response has been sent to the browser.
     */
    public function terminate(Request $request, Response $response): void
    {
        try {
            $user = $request->user();
            if (!$user) {
                return; // Only log authenticated API requests
            }

            $apiKey = $request->attributes->get('api_key');
            $startTime = $request->attributes->get('api_start_time');
            $endTime = microtime(true);
            $responseTime = $startTime ? (int) (($endTime - $startTime) * 1000) : null;

            // Prepare payload (sanitize sensitive data if needed)
            $payload = $request->except(['password', 'api_key', 'X-API-KEY']);

            DB::table('api_logs')->insert([
                'user_id' => $user->id,
                'api_key_id' => $apiKey ? $apiKey->id : null,
                'endpoint' => $request->fullUrl(),
                'method' => $request->method(),
                'status_code' => $response->getStatusCode(),
                'payload' => json_encode($payload),
                'response' => $response->getContent(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'response_time_ms' => $responseTime,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('API Logger Error: ' . $e->getMessage());
        }
    }
}
