<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class EvomiService
{
    protected $baseUrl = 'https://reseller.evomi.com/v2';
    protected $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.evomi.key');
    }

    // ─── Internal helper ────────────────────────────────────────────────────

    private function http()
    {
        return Http::withoutVerifying()->withHeaders([
            'X-API-KEY' => $this->apiKey,
            'Accept'    => 'application/json',
        ]);
    }

    // ─── Subuser Management ─────────────────────────────────────────────────

    /**
     * Create a new subuser on Evomi.
     */
    public function createSubUser(string $username, string $email)
    {
        try {
            $response = $this->http()->put("{$this->baseUrl}/reseller/sub_users/create", [
                'username' => $username,
                'email'    => $email,
            ]);

            Log::info('Evomi CreateSubUser', [
                'username' => $username,
                'status'   => $response->status(),
                'body'     => $response->body(),
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Evomi API Fail: Create Subuser', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            return false;
        } catch (\Exception $e) {
            Log::error('Evomi API Exception (CreateSubuser): ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Fetch subuser data including proxy_keys from Evomi.
     * Endpoint: GET /v2/reseller/sub_users/{username}
     */
    public function getSubuserData(string $username)
    {
        try {
            // Correct endpoint: username is a PATH parameter, not query string
            $response = $this->http()->get("{$this->baseUrl}/reseller/sub_users/{$username}");

            Log::info('Evomi GetSubuserData', [
                'username' => $username,
                'url'      => "{$this->baseUrl}/reseller/sub_users/{$username}",
                'status'   => $response->status(),
                'body'     => $response->body(),
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Evomi API Fail: Fetch Subuser Data', [
                'url'    => "{$this->baseUrl}/reseller/sub_users/{$username}",
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            return false;
        } catch (\Exception $e) {
            Log::error('Evomi API Exception (GetSubuserData): ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Allocate bandwidth MB to a subuser for a given proxy type.
     */
    public function allocateBandwidth(string $username, int $balanceMb, string $type = 'rp')
    {
        $map = [
            'rp'  => 'give_rp_balance',
            'mp'  => 'give_mp_balance',
            'isp' => 'give_isp_balance',
            'dc'  => 'give_dc_balance',
        ];
        $endpoint = $map[$type] ?? 'give_rp_balance';

        try {
            $response = $this->http()->post("{$this->baseUrl}/reseller/sub_users/{$endpoint}", [
                'username' => $username,
                'balance'  => $balanceMb,
            ]);

            Log::info("Evomi AllocateBandwidth [{$type}]", [
                'username' => $username,
                'mb'       => $balanceMb,
                'status'   => $response->status(),
                'body'     => $response->body(),
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error("Evomi API Fail: Allocate {$type} Balance", [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            return false;
        } catch (\Exception $e) {
            Log::error("Evomi API Exception (AllocateBandwidth {$type}): " . $e->getMessage());
            return false;
        }
    }

    /**
     * Fetch global proxy settings (countries, cities, etc.)
     */
    public function getProxySettings()
    {
        try {
            $response = $this->http()->get("{$this->baseUrl}/reseller/proxy_settings");

            if ($response->successful()) {
                return $response->json();
            }

            return [
                'error'  => 'API_FAIL',
                'status' => $response->status(),
                'body'   => $response->body(),
            ];
        } catch (\Exception $e) {
            return [
                'error'   => 'EXCEPTION',
                'message' => $e->getMessage(),
            ];
        }
    }

    // ─── Utilities ──────────────────────────────────────────────────────────

    /**
     * Extract proxy keys from a subuser data response.
     * Handles various response shapes from Evomi API.
     */
    public function extractKeys(array $data): array
    {
        $keys = [];
        // Try nested data.products first, then top-level products
        $products = $data['data']['products'] ?? $data['products'] ?? [];
        foreach ($products as $type => $info) {
            if (is_array($info) && isset($info['proxy_key'])) {
                $keys[$type] = $info['proxy_key'];
            } elseif (is_string($info)) {
                // Sometimes API just returns the key directly
                $keys[$type] = $info;
            }
        }
        // Also check for a direct proxy_key at top level
        if (empty($keys) && isset($data['data']['proxy_key'])) {
            $keys['rp'] = $data['data']['proxy_key'];
        }
        return $keys;
    }

    /**
     * Ensure the user has a fully-initialized Evomi subuser with keys.
     * Handles: missing username, username-but-no-id (partial init), missing keys.
     * Returns ['success'=>true, 'keys'=>[...]] or ['success'=>false, 'error'=>'...']
     */
    public function ensureSubuser(User $user): array
    {
        // Case 1: Fully initialized
        if ($user->evomi_username && $user->evomi_subuser_id && !empty($user->evomi_keys)) {
            return ['success' => true, 'keys' => $user->evomi_keys];
        }

        // Case 2: Has username (maybe ID too), but no keys — try to fetch from Evomi
        if ($user->evomi_username) {
            Log::info('ensureSubuser: has username, fetching data from Evomi', ['username' => $user->evomi_username]);
            $data = $this->getSubuserData($user->evomi_username);

            // Accept various response shapes from Evomi
            $subuserFound = $data && (
                isset($data['data']['id']) ||
                isset($data['id']) ||
                isset($data['username'])
            );

            if ($subuserFound) {
                $keys = $this->extractKeys($data);
                $subuserDataBlock = $data['data'] ?? $data;
                $user->update([
                    'evomi_subuser_id' => $subuserDataBlock['id'] ?? $user->evomi_subuser_id,
                    'evomi_keys'       => $keys,
                ]);
                $user->refresh();
                Log::info('ensureSubuser: synced from Evomi', ['keys' => $keys]);
                return ['success' => true, 'keys' => $keys];
            }

            // Subuser not found on Evomi side — clear stale username and re-create below
            Log::warning('ensureSubuser: username exists locally but not found on Evomi, resetting', [
                'username' => $user->evomi_username,
            ]);
            $user->update([
                'evomi_username'   => null,
                'evomi_subuser_id' => null,
                'evomi_keys'       => null,
            ]);
            $user->refresh();
        }

        // Case 3: No username at all — create new subuser
        $newUsername = 'up_' . $user->id . '_' . strtolower(Str::random(6));
        Log::info('ensureSubuser: creating new subuser', ['username' => $newUsername]);

        $result = $this->createSubUser($newUsername, $user->email);

        if ($result && isset($result['data']['id'])) {
            $keys = $this->extractKeys($result);
            $user->update([
                'evomi_username'   => $newUsername,
                'evomi_subuser_id' => $result['data']['id'],
                'evomi_keys'       => $keys,
            ]);
            $user->refresh();
            Log::info('ensureSubuser: created successfully', ['username' => $newUsername, 'id' => $result['data']['id']]);
            return ['success' => true, 'keys' => $keys];
        }

        Log::error('ensureSubuser: failed to create subuser on Evomi');
        return ['success' => false, 'error' => 'Failed to initialize proxy account with provider. Please try again or contact support.'];
    }
}
