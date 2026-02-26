<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CleanupProxiesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'proxies:cleanup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Deactivate expired proxy orders and clean up resources.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $expiredOrders = \App\Models\Order::where('status', 'active')
            ->where('expires_at', '<', now())
            ->get();

        $count = $expiredOrders->count();
        $this->info("Found {$count} expired orders.");

        foreach ($expiredOrders as $order) {
            $order->update(['status' => 'expired']);
            $this->line("Deactivated Order #{$order->id} for User #{$order->user_id}");
            
            // Optional: Notify user via email or dashboard notification
        }

        $this->info("Cleanup completed.");
    }
}
