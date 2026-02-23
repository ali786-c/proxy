<?php

namespace App\Http\Controllers;

use App\Models\Referral;
use Illuminate\Http\Request;

class ReferralController extends Controller
{
    public function index(Request $request)
    {
        $referrals = Referral::where('referrer_id', $request->user()->id)
            ->with('referred:id,name,email,created_at')
            ->get();

        return response()->json([
            'referral_code' => $request->user()->referral_code,
            'referrals' => $referrals,
            'total_commission' => $referrals->sum('commission_amount'),
        ]);
    }
}
