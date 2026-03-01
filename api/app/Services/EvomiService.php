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
        $client = Http::withHeaders([
            'X-API-KEY' => $this->apiKey,
            'Accept'    => 'application/json',
        ]);

        if (app()->environment('local')) {
            // withoutVerifying() returns a NEW instance — must be reassigned
            $client = $client->withoutVerifying();
        }

        return $client;
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
     * Fetch usage stats for a subuser from Evomi.
     */
    public function getUsage(string $username)
    {
        try {
            $response = $this->http()->get("{$this->baseUrl}/reseller/sub_users/{$username}/usage");

            if ($response->successful()) {
                return $response->json();
            }

            return false;
        } catch (\Exception $e) {
            Log::error('Evomi API Exception (GetUsage): ' . $e->getMessage());
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
     * Maps Evomi type names to our internal names AND stores both.
     * Evomi types: residential, mobile, dataCenter, sharedDataCenter, static
     * Our types:   rp,          mp,     dc,          dc,               isp
     */
    public function extractKeys(array $data): array
    {
        $keys = [];

        // Evomi internal type name → our product type code
        $typeMap = [
            'residential'      => 'rp',
            'mobile'           => 'mp',
            'dataCenter'       => 'dc',
            'sharedDataCenter' => 'dc',
            'static'           => 'isp',
            'isp'              => 'isp',
            'residentialIPV6'  => 'rp_ipv6',
            'dataCenterIPV6'   => 'dc_ipv6',
        ];

        // Try nested data.products first, then top-level products
        $products = $data['data']['products'] ?? $data['products'] ?? [];

        foreach ($products as $evomiType => $info) {
            $proxyKey = null;
            if (is_array($info) && isset($info['proxy_key'])) {
                $proxyKey = $info['proxy_key'];
            } elseif (is_string($info)) {
                $proxyKey = $info;
            }

            if ($proxyKey) {
                // Store with original Evomi name (e.g., 'residential')
                $keys[$evomiType] = $proxyKey;
                // Also store with our internal code (e.g., 'rp') for lookup compatibility
                if (isset($typeMap[$evomiType])) {
                    $keys[$typeMap[$evomiType]] = $proxyKey;
                }
            }
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

        // Case 2: Has username, but subuser_id or keys missing.
        // Since GET /sub_users/{username} returns 404, we CANNOT verify if the subuser
        // exists on Evomi. Reset stale data and create a fresh subuser.
        if ($user->evomi_username) {
            Log::warning('ensureSubuser: has username but incomplete data, resetting for fresh create', [
                'old_username'     => $user->evomi_username,
                'evomi_subuser_id' => $user->evomi_subuser_id,
                'has_keys'         => !empty($user->evomi_keys),
            ]);
            $user->update([
                'evomi_username'   => null,
                'evomi_subuser_id' => null,
                'evomi_keys'       => null,
            ]);
            $user->refresh();
        }

        // Case 3: No username — create new subuser
        $newUsername = 'up_' . $user->id . '_' . strtolower(Str::random(6));
        Log::info('ensureSubuser: creating new subuser', ['username' => $newUsername]);

        $result = $this->createSubUser($newUsername, $user->email);

        // Evomi returns status 201 with data.username (NOT data.id)
        $created = $result && (
            ($result['status'] ?? 0) === 201 ||
            isset($result['data']['username'])
        );

        if ($created) {
            $actualUsername = $result['data']['username'] ?? $newUsername;

            // The CREATE response does NOT include proxy_keys/products.
            // We must fetch the subuser data SEPARATELY to get the actual keys.
            $subuserData = $this->getSubuserData($actualUsername);
            $keys = $subuserData ? $this->extractKeys($subuserData) : [];

            Log::info('ensureSubuser: created successfully', [
                'username'    => $actualUsername,
                'keys_found'  => array_keys($keys),
                'raw_data_ok' => !empty($subuserData),
            ]);

            $user->update([
                'evomi_username'   => $actualUsername,
                'evomi_subuser_id' => $actualUsername,
                'evomi_keys'       => $keys,
            ]);
            $user->refresh();

            return ['success' => true, 'keys' => $keys];
        }

        Log::error('ensureSubuser: failed to create subuser on Evomi', ['result' => $result]);
        return ['success' => false, 'error' => 'Failed to initialize proxy account with provider. Please try again or contact support.'];
    }
}
