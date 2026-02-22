<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\EvomiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SubuserController extends Controller
{
    protected $evomi;

    public function __construct(EvomiService $evomi)
    {
        $this->evomi = $evomi;
    }

    /**
     * Create or link an Evomi subuser for the authenticated user.
     * POST /api/subusers/setup
     */
    public function setup(Request $request)
    {
        $user = $request->user();

        if ($user->evomi_subuser_id && !empty($user->evomi_keys)) {
            return response()->json([
                'message' => 'Subuser already exists.',
                'evomi_username' => $user->evomi_username
            ]);
        }

        if ($user->evomi_subuser_id && empty($user->evomi_keys)) {
            $keys = $this->evomi->syncProxyKeys($user);
            if ($keys) {
                return response()->json([
                    'message' => 'Subuser keys synced successfully.',
                    'evomi_username' => $user->evomi_username,
                    'evomi_keys' => $keys
                ]);
            }
        }

        // Generate a unique evomi username based on user id and random string
        $evomiUsername = 'up_' . $user->id . '_' . strtolower(Str::random(4));
        
        $result = $this->evomi->createSubUser($evomiUsername, $user->email);
        
        if ($result && isset($result['data']['id'])) {
            // Extract proxy keys from the products object
            $keys = [];
            $products = $result['data']['products'] ?? [];
            
            foreach ($products as $type => $info) {
                if (isset($info['proxy_key'])) {
                    $keys[$type] = $info['proxy_key'];
                }
            }

            $user->update([
                'evomi_username' => $evomiUsername,
                'evomi_subuser_id' => $result['data']['id'],
                'evomi_keys' => $keys,
            ]);

            return response()->json([
                'message' => 'Evomi subuser created successfully.',
                'evomi_username' => $evomiUsername,
                'evomi_subuser_id' => $result['data']['id'],
                'evomi_keys' => $keys
            ]);
        }

        return response()->json([
            'message' => 'Failed to create subuser on provider side.',
            'error' => 'API_ERROR'
        ], 502);
    }

    /**
     * Get subuser status and usage.
     * GET /api/subusers/status
     */
    public function status(Request $request)
    {
        $user = $request->user();

        if (!$user->evomi_username) {
            return response()->json(['message' => 'No subuser linked.'], 404);
        }

        $cacheKey = 'evomi_stats_' . $user->id;

        $data = \Illuminate\Support\Facades\Cache::remember($cacheKey, 300, function () use ($user) {
            return $this->evomi->getSubuserData($user->evomi_username);
        });

        if (!$data) {
            return response()->json(['message' => 'Could not fetch data from provider.'], 502);
        }

        return response()->json($data);
    }
}
