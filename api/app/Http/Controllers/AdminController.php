<?php

namespace App\Http\Controllers;

use App\Models\AdminLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function users(Request $request)
    {
        return response()->json(User::latest()->get());
    }

    public function updateBalance(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric',
            'reason' => 'required|string',
        ]);

        $admin = $request->user();
        $target = User::findOrFail($request->user_id);

        DB::transaction(function () use ($admin, $target, $request) {
            $oldBalance = $target->balance;
            $target->balance += $request->amount;
            $target->save();

            AdminLog::create([
                'admin_id' => $admin->id,
                'action' => 'update_balance',
                'target_user_id' => $target->id,
                'details' => "Balance changed from {$oldBalance} to {$target->balance}. Reason: {$request->reason}",
            ]);
        });

        return response()->json(['message' => 'Balance updated successfully', 'new_balance' => $target->balance]);
    }

    public function banUser(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'reason' => 'required|string',
        ]);

        $admin = $request->user();
        $target = User::findOrFail($request->user_id);

        $target->role = 'banned';
        $target->save();

        AdminLog::create([
            'admin_id' => $admin->id,
            'action' => 'ban_user',
            'target_user_id' => $target->id,
            'details' => "User banned. Reason: {$request->reason}",
        ]);

        return response()->json(['message' => 'User banned successfully']);
    }

    public function stats()
    {
        return response()->json([
            'total_users' => User::count(),
            'total_active_proxies' => \App\Models\Order::where('status', 'active')->count(),
            'system_revenue' => \App\Models\WalletTransaction::where('type', 'credit')->sum('amount'),
            'total_balance' => User::sum('balance'),
        ]);
    }

    public function logs()
    {
        return response()->json(AdminLog::with(['admin', 'targetUser'])->latest()->limit(100)->get());
    }
}
