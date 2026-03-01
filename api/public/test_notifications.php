<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Notifications\WelcomeNotification;
use App\Notifications\AdminNewUserNotification;
use Illuminate\Support\Facades\Notification;

header('Content-Type: text/plain');

// Ensure we have a test user or create a dummy one for testing
$user = User::first() ?? new User(['name' => 'Test User', 'email' => 'test@example.com']);

echo "TESTING: Triggering WelcomeNotification...\n";
$user->notify(new WelcomeNotification([
    'user' => ['name' => $user->name],
    'action_url' => 'https://example.com/login'
]));

echo "TESTING: Triggering AdminNewUserNotification...\n";
// Normally sent to admins, but for testing we can send to the user
$user->notify(new AdminNewUserNotification([
    'user' => [
        'name' => $user->name,
        'email' => $user->email,
        'ip' => '127.0.0.1'
    ],
    'admin_url' => 'https://example.com/admin/users'
]));

echo "\nNotifications triggered! Check storage/logs/laravel.log to see the rendered output.\n";
echo "(Note: If queue is active, they might be in the jobs table instead of sending immediately.)\n";
