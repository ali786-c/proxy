<?php

namespace App\Http\Controllers;

use App\Models\FraudSignal;
use App\Models\UserRiskScore;
use App\Models\LoginHistory;
use Illuminate\Http\Request;

class FraudController extends Controller
{
    public function signals(Request $request)
    {
        $query = FraudSignal::with('user:id,name,email');
        
        if ($request->has('resolved')) {
            $query->where('is_resolved', $request->boolean('resolved'));
        }

        return response()->json($query->latest()->limit(100)->get());
    }

    public function riskScores()
    {
        return response()->json(
            UserRiskScore::with('user:id,name,email')
                ->orderBy('risk_score', 'desc')
                ->limit(50)
                ->get()
        );
    }

    public function loginHistory()
    {
        return response()->json(
            LoginHistory::with('user:id,name,email')
                ->latest()
                ->limit(100)
                ->get()
        );
    }

    public function resolveSignal(Request $request, $id)
    {
        $signal = FraudSignal::findOrFail($id);
        $signal->update([
            'is_resolved' => true,
            'resolved_at' => now(),
        ]);

        return response()->json(['message' => 'Signal resolved successfully']);
    }
}
