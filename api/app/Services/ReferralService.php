<?php

namespace App\Services;

use App\Models\User;
use App\Models\Referral;
use App\Models\ReferralEarning;
use App\Models\Setting;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ReferralService
{
    /**
     * Award commission to the referrer if the user was referred.
     * 
     * @param User $user The user who made the purchase/top-up
     * @param float $amount The amount of the transaction
     * @param string $description Description for the earning record
     */
    public function awardCommission(User $user, float $amount, string $description = 'Referral Commission')
    {
        try {
            // Check if referral system is enabled globally
            if (Setting::getValue('referral_system_enabled', '1') !== '1') {
                return;
            }

            // Check if user has a referrer
            $referral = Referral::where('referred_id', $user->id)->first();
            
            if (!$referral) {
                return;
            }

            $referrer = User::find($referral->referrer_id);
            if (!$referrer) {
                return;
            }

            // Get commission percentage (Influencer custom rate or global default)
            $percentage = $referrer->custom_referral_rate 
                ? (float) $referrer->custom_referral_rate 
                : (float) Setting::getValue('referral_commission_percentage', 10);
            $commissionAmount = round(($amount * $percentage) / 100, 2);

            if ($commissionAmount <= 0) {
                return;
            }

            DB::transaction(function () use ($referrer, $user, $commissionAmount, $description) {
                // Create earning record (Status is pending by default for security)
                ReferralEarning::create([
                    'referrer_id' => $referrer->id,
                    'referred_id' => $user->id,
                    'amount'      => $commissionAmount,
                    'description' => $description,
                    'status'      => 'pending',
                ]);

                Log::info("Recorded {$commissionAmount} PENDING commission for User #{$referrer->id} from User #{$user->id}");
            });

        } catch (\Exception $e) {
            Log::error("Referral Commission Award Failed: " . $e->getMessage());
        }
    }
}
