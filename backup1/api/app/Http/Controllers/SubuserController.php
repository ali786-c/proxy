<?php

namespace App\Http\Controllers;

use App\Services\EvomiService;
use Illuminate\Http\Request;

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
        $user   = $request->user()->fresh();
        $result = $this->evomi->ensureSubuser($user);

        if ($result['success']) {
            $user = $user->fresh();
            return response()->json([
                'message'        => 'Proxy account is ready.',
                'evomi_username' => $user->evomi_username,
                'evomi_keys'     => array_keys($result['keys'] ?? []),
            ]);
        }

        return response()->json([
            'message' => $result['error'],
            'error'   => 'SETUP_FAILED',
        ], 503);
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
