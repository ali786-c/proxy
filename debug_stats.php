<?php
require 'api/vendor/autoload.php';
$app = require_once 'api/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Order;
use App\Models\WalletTransaction;
use App\Models\Setting;

try {
    $errorThreshold = (float) Setting::getValue('alert_error_spike_pct', 5.0);
    $banThreshold   = (float) Setting::getValue('alert_ban_spike_pct', 8.0);
    
    $stats = [
        'total_users'          => (int) User::count(),
        'total_active_proxies' => (int) Order::where('status', 'active')->count(),
        'total_revenue'        => (float) WalletTransaction::where('type', 'credit')->sum('amount'),
        'system_total_balance' => (float) User::sum('balance'),
        'recent_registrations' => (int) User::where('created_at', '>=', now()->subDays(7))->count(),
        'revenue_last_24h'     => (float) WalletTransaction::where('type', 'credit')
            ->where('created_at', '>=', now()->subDay())
            ->sum('amount'),
        'bandwidth_30d_gb'     => 0.0,
        'uptime'               => 99.99,
        'error_rate'           => 0.05,
    ];
    
    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'data' => $stats], JSON_PRETTY_PRINT);
} catch (\Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()], JSON_PRETTY_PRINT);
}
