<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class MonitorSLA extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'proxies:monitor-sla';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    public function handle()
    {
        $this->info('Starting SLA Monitoring...');

        $configs = \App\Models\SLAConfig::where('is_active', true)->get();

        if ($configs->isEmpty()) {
            $this->warn('No active SLA configurations found. Please create one in the admin panel.');
            return;
        }

        foreach ($configs as $config) {
            $this->info("Checking uptime for: {$config->proxy_type}");

            // Pick 3 random active proxies of this type to test
            $proxies = \App\Models\Proxy::whereHas('order', function($q) use ($config) {
                $q->where('status', 'active')->whereHas('product', function($pq) use ($config) {
                    $pq->where('type', $config->proxy_type);
                });
            })->inRandomOrder()->limit(3)->get();

            if ($proxies->isEmpty()) {
                $this->line("No active proxies found for {$config->proxy_type}. Skipping.");
                continue;
            }

            foreach ($proxies as $proxy) {
                $this->checkProxyUptime($proxy, $config->proxy_type);
            }
        }

        $this->info('SLA Monitoring Complete.');
    }

    protected function checkProxyUptime($proxy, $type)
    {
        $start = microtime(true);
        $status = 'down';
        $latency = null;

        try {
            // Target a very light and reliable endpoint
            $response = \Illuminate\Support\Facades\Http::timeout(5)
                ->withOptions([
                    'proxy' => "http://{$proxy->username}:{$proxy->password}@{$proxy->host}:{$proxy->port}",
                    'verify' => false,
                ])
                ->get('http://www.google.com/generate_204');

            if ($response->successful() || $response->status() === 204) {
                $status = 'up';
                $latency = (int)((microtime(true) - $start) * 1000);
                
                // If latency is over 3 seconds, mark as degraded
                if ($latency > 3000) {
                    $status = 'degraded';
                }
            }
        } catch (\Exception $e) {
            $this->error("Error checking proxy {$proxy->id}: " . $e->getMessage());
        }

        \App\Models\UptimeRecord::create([
            'proxy_type' => $type,
            'status' => $status,
            'response_time_ms' => $latency,
            'region' => $proxy->country ?? 'Global',
            'checked_at' => now(),
        ]);

        $this->line("- Proxy {$proxy->host}: {$status} ({$latency}ms)");
    }
}
