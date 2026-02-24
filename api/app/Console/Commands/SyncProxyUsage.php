<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SyncProxyUsage extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'proxies:sync';
    protected $description = 'Sync usage from Evomi and expire old orders';

    public function handle()
    {
        $this->info('Starting Proxy Sync...');

        // 1. Handle Expiry
        $expiredCount = \App\Models\Order::where('status', 'active')
            ->where('expires_at', '<', now())
            ->update(['status' => 'expired']);

        $this->info("Expired {$expiredCount} orders.");

        // 2. Usage Sync
        $activeOrders = \App\Models\Order::with('user')->where('status', 'active')->get();
        $evomi = app(\App\Services\EvomiService::class);

        foreach ($activeOrders as $order) {
            if (!$order->user->evomi_username) continue;

            $usageData = $evomi->getUsage($order->user->evomi_username);
            
            if ($usageData && isset($usageData['data'])) {
                // Find products relevant to this order type
                $productType = $order->product->type;
                $currentUsageMb = 0;
                
                // Evomi usage structure: products are keys
                foreach ($usageData['data'] as $type => $info) {
                    if (str_contains($type, $productType) || $type == $productType) {
                        $currentUsageMb += ($info['usage'] ?? 0);
                    }
                }

                $currentUsageGb = $currentUsageMb / 1024;

                // Update usage_logs for today
                $log = \App\Models\UsageLog::updateOrCreate(
                    ['order_id' => $order->id, 'date' => now()->toDateString()],
                    ['gb_used' => $currentUsageGb]
                );

                // Fraud Detection: Spike Check (e.g., > 2GB in one day for a single order)
                if ($currentUsageGb > 2.0) {
                    \App\Models\FraudSignal::firstOrCreate(
                        [
                            'user_id' => $order->user_id,
                            'signal_type' => 'usage_spike',
                            'is_resolved' => false
                        ],
                        [
                            'severity' => 'medium',
                            'description' => "High usage detected for order #{$order->id}: {$currentUsageGb} GB used today.",
                            'ip_address' => null,
                        ]
                    );
                }
            }
        }
        
        $this->info('Sync Complete.');
    }
}
