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

        // 2. Usage Sync (Simplified for MVP)
        // Here we would loop through active orders and call Evomi for usage stats
        
        $this->info('Sync Complete.');
    }
}
