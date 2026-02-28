<?php
use App\Models\User;

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->handle(Illuminate\Http\Request::capture());

header('Content-Type: application/json');

$email = $_GET['email'] ?? 'aliyantar@gmail.com';
$user = User::where('email', $email)->first();

if (!$user) {
    echo json_encode(['error' => 'User not found']);
    exit;
}

echo json_encode([
    'user_id' => $user->id,
    'email' => $user->email,
    'referral_code' => $user->referral_code,
    'signup_ip' => $user->signup_ip,
    'current_settings' => [
        'referral_system_enabled' => \App\Models\Setting::getValue('referral_system_enabled'),
        'referral_commission_percentage' => \App\Models\Setting::getValue('referral_commission_percentage'),
        'referral_hold_days' => \App\Models\Setting::getValue('referral_hold_days'),
    ]
], JSON_PRETTY_PRINT);
