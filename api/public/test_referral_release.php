<?php

use App\Models\User;
use App\Models\ReferralEarning;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle($request = Illuminate\Http\Request::capture());

// SETUP: Create a Referrer
$referrer = User::create([
    'name' => 'Release Tester',
    'email' => 'release_' . Str::random(5) . '@example.com',
    'password' => bcrypt('password123'),
    'referral_code' => 'REL-REF-' . Str::random(4),
    'balance' => 0
]);

echo "Created Referrer: " . $referrer->email . " with Balance: " . $referrer->balance . "<br>";

// SETUP: Create a Referred User
$referred = User::create([
    'name' => 'Referred Buyer',
    'email' => 'buyer_' . Str::random(5) . '@example.com',
    'password' => bcrypt('password123'),
]);

// 1. Create a PENDING earning exactly 15 days ago
$oldEarning = ReferralEarning::create([
    'referrer_id' => $referrer->id,
    'referred_id' => $referred->id,
    'amount' => 10.00,
    'description' => 'TESTING ESCROW RELEASE (Old)',
    'status' => 'pending',
]);
$oldEarning->created_at = Carbon::now()->subDays(15);
$oldEarning->save(['timestamps' => false]);

// 2. Create a PENDING earning 2 days ago (Should NOT release)
$recentEarning = ReferralEarning::create([
    'referrer_id' => $referrer->id,
    'referred_id' => $referred->id,
    'amount' => 5.00,
    'description' => 'TESTING ESCROW RELEASE (Recent)',
    'status' => 'pending',
    'created_at' => Carbon::now()->subDays(2)
]);

echo "Created 15-day-old pending commission ($10.00) and 2-day-old commission ($5.00).<br>";

// 3. Run the Artisan command
echo "Running 'php artisan referral:process-pending'... <br>";
Artisan::call('referral:process-pending');
echo "Command Output: " . Artisan::output() . "<br>";

// 4. VERIFY: Referrer balance should be 10.00
$referrer->refresh();
echo "New Referrer Balance: " . $referrer->balance . "<br>";

if ($referrer->balance == 10.00) {
    echo "✅ SUCCESS: Only the 15-day-old commission was released.";
} else {
    echo "❌ FAILURE: Balance is " . $referrer->balance . " (Expected 10.00)";
}

// 5. VERIFY: Statuses
$oldEarning->refresh();
$recentEarning->refresh();

if ($oldEarning->status === 'completed' && $recentEarning->status === 'pending') {
    echo "<br>✅ SUCCESS: Database statuses updated correctly.";
} else {
    echo "<br>❌ FAILURE: Database statuses are incorrect. Old: {$oldEarning->status}, Recent: {$recentEarning->status}";
}
