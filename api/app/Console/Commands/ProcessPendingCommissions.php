<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ProcessPendingCommissions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'referral:process-pending';

    protected $description = 'Process and release referral commissions older than 14 days';

    public function handle()
    {
        $holdDays = 14;
        $cutoffDate = now()->subDays($holdDays);

        $pendingEarnings = \App\Models\ReferralEarning::where('status', 'pending')
            ->where('created_at', '<=', $cutoffDate)
            ->get();

        if ($pendingEarnings->isEmpty()) {
            $this->info("No pending commissions older than {$holdDays} days found.");
            return 0;
        }

        $this->info("Processing " . $pendingEarnings->count() . " pending commissions...");

        foreach ($pendingEarnings as $earning) {
            \DB::transaction(function () use ($earning) {
                $referrer = \App\Models\User::find($earning->referrer_id);
                if ($referrer) {
                    // Update User Balance
                    $referrer->increment('balance', $earning->amount);

                    // Create Wallet Transaction
                    \App\Models\WalletTransaction::create([
                        'user_id'     => $referrer->id,
                        'type'        => 'credit',
                        'amount'      => $earning->amount,
                        'reference'   => 'REF-RELEASE-' . strtoupper(bin2hex(random_bytes(4))),
                        'description' => 'Released Referral Commission: ' . $earning->description,
                    ]);

                    // Mark Earning as Completed
                    $earning->update(['status' => 'completed']);
                    
                    $this->line("Released \${$earning->amount} to User #{$referrer->id}");
                } else {
                    $this->error("Referrer not found for earning ID: {$earning->id}");
                }
            });
        }

        $this->info("All eligible commissions released successfully.");
        return 0;
    }
}
