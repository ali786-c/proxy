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
        // Standardize Base URL
        $this->baseUrl = 'https://reseller.evomi.com/v2';
    }

    /**
     * Create a subuser in Evomi.
     * Returns the API response or false on failure.
     */
    public function createSubUser($username, $email)
    {
        try {
            $response = Http::withoutVerifying()->withHeaders([
                'X-API-KEY' => $this->apiKey,
                'Accept' => 'application/json',
            ])->put("{$this->baseUrl}/reseller/sub_users/create", [
                'username' => $username,
                'email' => $email,
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Evomi API Fail: Create Subuser', ['status' => $response->status(), 'response' => $response->body()]);
            return false;
        } catch (\Exception $e) {
            Log::error('Evomi API Exception (CreateSubuser): ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Allocate Bandwidth to a subuser.
     * $type: 'rp' (Residential), 'mp' (Mobile), 'isp' (ISP), 'dc' (Datacenter)
     */
    public function allocateBandwidth($username, $balanceMb, $type = 'rp')
    {
        // Map types to endpoints
        $map = [
            'rp'  => 'give_rp_balance',
            'mp'  => 'give_mp_balance',
            'isp' => 'give_isp_balance',
            'dc'  => 'give_dc_balance',
        ];

        $endpoint = $map[$type] ?? 'give_rp_balance';

        try {
            $response = Http::withoutVerifying()->withHeaders([
                'X-API-KEY' => $this->apiKey,
                'Accept' => 'application/json',
            ])->post("{$this->baseUrl}/reseller/sub_users/{$endpoint}", [
                'username' => $username,
                'balance' => $balanceMb,
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error("Evomi API Fail: Allocate {$type} Balance", ['status' => $response->status(), 'response' => $response->body()]);
            return false;
        } catch (\Exception $e) {
            Log::error("Evomi API Exception (Allocate {$type}): " . $e->getMessage());
            return false;
        }
    }

    /**
     * Fetch subuser usage and balance data.
     */
    public function getSubuserData($username)
    {
        try {
            $response = Http::withoutVerifying()->withHeaders([
                'X-API-KEY' => $this->apiKey,
                'Accept' => 'application/json',
            ])->get("{$this->baseUrl}/reseller/sub_users/sub_user_data", [
                'username' => $username,
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Evomi API Fail: Fetch Subuser Data', ['status' => $response->status(), 'response' => $response->body()]);
            return false;
        } catch (\Exception $e) {
            Log::error('Evomi API Exception (GetSubuserData): ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Fetch global proxy settings (available countries, cities, etc.)
     */
    public function getProxySettings()
    {
        try {
            $response = Http::withoutVerifying()->withHeaders([
                'X-API-KEY' => $this->apiKey,
                'Accept' => 'application/json',
            ])->get("{$this->baseUrl}/reseller/proxy_settings");

            if ($response->successful()) {
                return $response->json();
            }

            return [
                'error' => 'API_FAIL',
                'status' => $response->status(),
                'body' => $response->body()
            ];
        } catch (\Exception $e) {
            return [
                'error' => 'EXCEPTION',
                'message' => $e->getMessage()
            ];
        }
    }
    /**
     * Sync proxy keys for a user from Evomi API.
     */
    public function syncProxyKeys(\App\Models\User $user)
    {
        if (!$user->evomi_username) return false;

        $result = $this->getSubuserData($user->evomi_username);

        if ($result && isset($result['data']['products'])) {
            $keys = [];
            foreach ($result['data']['products'] as $type => $info) {
                if (isset($info['proxy_key'])) {
                    $keys[$type] = $info['proxy_key'];
                }
            }
            $user->update(['evomi_keys' => $keys]);
            return $keys;
        }

        return false;
    }
}
