<?php

use App\Models\User;
use App\Models\Referral;
use App\Models\ReferralEarning;

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->handle($request = Illuminate\Http\Request::capture());

$email = 'aliyantarar@gmail.com';
$user = User::where('email', $email)->first();

if (!$user) {
    die("User with email $email not found.");
}

echo "User ID: " . $user->id . "<br>";
echo "User Referral Code: " . $user->referral_code . "<br>";

$referralsCount = Referral::where('referrer_id', $user->id)->count();
echo "Referrals in DB: " . $referralsCount . "<br>";

$earningsCount = ReferralEarning::where('referrer_id', $user->id)->count();
$totalEarned = ReferralEarning::where('referrer_id', $user->id)->where('status', 'completed')->sum('amount');
$pendingAmount = ReferralEarning::where('referrer_id', $user->id)->where('status', 'pending')->sum('amount');

echo "Earnings Records: " . $earningsCount . "<br>";
echo "Total Earned (Computed): $" . $totalEarned . "<br>";
echo "Pending Amount (Computed): $" . $pendingAmount . "<br>";

$allReferrals = Referral::where('referrer_id', $user->id)->get();
echo "<h3>Referral List:</h3><ul>";
foreach($allReferrals as $r) {
    $refUser = User::find($r->referred_id);
    echo "<li>ID: {$r->referred_id} - Email: " . ($refUser ? $refUser->email : 'DELETED') . " - joined at: {$r->created_at}</li>";
}
echo "</ul>";
