<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EvomiService
{
    protected $baseUrl = 'https://reseller.evomi.com/v2';
    protected $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.evomi.key');
    }

    /**
     * Create a subuser in Evomi.
     */
    public function createSubUser($username, $email)
    {
        try {
            $response = Http::withHeaders([
                'X-API-KEY' => $this->apiKey,
                'Accept' => 'application/json',
            ])->put("{$this->baseUrl}/reseller/sub_users/create", [
                'username' => $username,
                'email' => $email,
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Evomi API Fail: Create Subuser', ['response' => $response->body()]);
            return false;
        } catch (\Exception $e) {
            Log::error('Evomi API Exception: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Allocate Residential Proxy balance to a subuser.
     */
    public function allocateBalance($username, $balanceMb, $type = 'rp')
    {
        $endpoint = ($type === 'rp') ? 'give_rp_balance' : 'give_mp_balance';

        try {
            $response = Http::withHeaders([
                'X-API-KEY' => $this->apiKey,
            ])->post("{$this->baseUrl}/reseller/sub_users/{$endpoint}", [
                'username' => $username,
                'balance' => $balanceMb,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Evomi Balance Allocation Exception: ' . $e->getMessage());
            return false;
        }
    }
}
