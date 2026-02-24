<?php

namespace App\Http\Controllers;

use App\Models\AdminLog;
use App\Models\User;
use App\Models\Order;
use App\Models\WalletTransaction;
use App\Models\UsageLog;
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

        $isBanning = $target->role !== 'banned';
        $target->role = $isBanning ? 'banned' : 'client';
        $target->save();

        AdminLog::create([
            'admin_id' => $admin->id,
            'action' => $isBanning ? 'ban_user' : 'unban_user',
            'target_user_id' => $target->id,
            'details' => ($isBanning ? "User banned. " : "User unbanned. ") . "Reason: {$request->reason}",
        ]);

        return response()->json(['message' => 'User status updated successfully', 'new_role' => $target->role]);
    }

    /**
     * POST /admin/users/{id}/role - Change user role
     */
    public function updateRole(Request $request, $id)
    {
        $request->validate(['role' => 'required|in:admin,client']);
        
        $user = User::findOrFail($id);
        $oldRole = $user->role;
        $user->role = $request->role;
        $user->save();

        AdminLog::create([
            'admin_id' => $request->user()->id,
            'target_user_id' => $user->id,
            'action' => 'change_role',
            'details' => "Role changed from {$oldRole} to {$request->role}",
        ]);

        return response()->json(['message' => "Role updated to {$request->role}"]);
    }

    public function stats()
    {
        return response()->json([
            'total_users'          => (int) User::count(),
            'total_active_proxies' => (int) Order::where('status', 'active')->count(),
            'total_revenue'        => (float) WalletTransaction::where('type', 'credit')->sum('amount'),
            'system_total_balance' => (float) User::sum('balance'),
            'recent_registrations' => (int) User::where('created_at', '>=', now()->subDays(7))->count(),
            'revenue_last_24h'     => (float) WalletTransaction::where('type', 'credit')
                ->where('created_at', '>=', now()->subDay())
                ->sum('amount'),
            
            'bandwidth_30d_gb'     => 0.0, // Future: UsageLog::where('date', '>=', now()->subDays(30))->sum('gb_used')
            'uptime'               => 99.99,
            'error_rate'           => 0.05,
            
            // Phase 1.1: Dynamic data for Dashboard
            'recent_sales'         => WalletTransaction::with('user:id,name,email')
                ->where('type', 'credit')
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn($t) => [
                    'user'   => $t->user ? ($t->user->name ?? $t->user->email) : 'Unknown',
                    'amount' => (float) $t->amount,
                    'time'   => $t->created_at->diffForHumans(),
                    'plan'   => 'Wallet Top-up'
                ]),

            'alerts' => [
                [
                    'id' => 'alert_1',
                    'type' => 'info',
                    'message' => 'System is running normally. No critical issues detected.',
                    'icon' => 'Activity'
                ]
            ]
        ]);
    }

    public function logs(Request $request)
    {
        $query = AdminLog::with(['admin', 'targetUser']);
        
        if ($request->has('action') && $request->action !== 'all') {
            $query->where('action', $request->action);
        }
        
        return response()->json($query->latest()->limit(100)->get());
    }

    /**
     * GET /admin/users/{id}/stats - Detailed stats for a single user
     */
    public function userStats($id)
    {
        $user = User::findOrFail($id);
        
        return response()->json([
            'total_spent'   => (float) \App\Models\WalletTransaction::where('user_id', $id)->where('type', 'debit')->sum('amount'),
            'total_orders'  => (int) \App\Models\Order::where('user_id', $id)->count(),
            'active_orders' => (int) \App\Models\Order::where('user_id', $id)->where('status', 'active')->count(),
            'total_keys'    => (int) \App\Models\ApiKey::where('user_id', $id)->count(),
            'active_keys'   => (int) \App\Models\ApiKey::where('user_id', $id)->count(),
            'total_tickets' => (int) \App\Models\SupportTicket::where('user_id', $id)->count(),
            'open_tickets'  => (int) \App\Models\SupportTicket::where('user_id', $id)->where('status', 'open')->count(),
        ]);
    }

    public function listResellers()
    {
        return response()->json(\App\Models\ResellerProfile::with('user')->latest()->get());
    }

    public function storeReseller(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'company_name' => 'required|string|max:255',
            'commission_rate' => 'required|numeric|min:0|max:100',
            'brand_primary_color' => 'nullable|string',
            'brand_secondary_color' => 'nullable|string',
            'custom_domain' => 'nullable|string|unique:reseller_profiles,custom_domain',
        ]);

        $reseller = \App\Models\ResellerProfile::create($validated);
        return response()->json($reseller, 201);
    }

    public function updateReseller(Request $request, $id)
    {
        $reseller = \App\Models\ResellerProfile::findOrFail($id);
        
        $validated = $request->validate([
            'company_name' => 'sometimes|required|string|max:255',
            'commission_rate' => 'sometimes|required|numeric|min:0|max:100',
            'brand_primary_color' => 'nullable|string',
            'brand_secondary_color' => 'nullable|string',
            'custom_domain' => 'nullable|string|unique:reseller_profiles,custom_domain,' . $id,
            'is_active' => 'sometimes|boolean',
        ]);

        $reseller->update($validated);
        return response()->json($reseller);
    }
}
