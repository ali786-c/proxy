<?php

namespace App\Http\Controllers;

use App\Models\Referral;
use Illuminate\Http\Request;

class ReferralController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $referrals = Referral::where('referrer_id', $user->id)
            ->with('referred:id,name,email,created_at')
            ->get();

        $earnings = \App\Models\ReferralEarning::where('referrer_id', $user->id)
            ->with('referred:id,name,email')
            ->latest()
            ->get();

        $totalEarned = $earnings->where('status', 'completed')->sum('amount');
        $pendingAmount = $earnings->where('status', 'pending')->sum('amount');
        
        // Count unique referred users who have made at least one purchase (optional, but let's just count total signups)
        $totalReferrals = $referrals->count();

        return response()->json([
            'referral_code' => $user->referral_code,
            'stats' => [
                'total_referrals' => $totalReferrals,
                'total_earned' => (float) $totalEarned,
                'pending_amount' => (float) $pendingAmount,
            ],
            'earnings' => $earnings->map(fn($e) => [
                'id' => $e->id,
                'amount' => (float) $e->amount,
                'description' => $e->description,
                'status' => $e->status,
                'date' => $e->created_at,
                'referred_user' => $e->referred ? [
                    'name' => $e->referred->name,
                    'email' => $e->referred->email,
                ] : null,
            ]),
            'referred_users' => $referrals->map(fn($r) => [
                'id' => $r->referred->id,
                'name' => $r->referred->name,
                'email' => $r->referred->email,
                'joined_at' => $r->referred->created_at,
            ]),
        ]);
    }
}
