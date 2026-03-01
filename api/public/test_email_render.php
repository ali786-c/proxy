<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

header('Content-Type: text/plain');

$service = new App\Services\EmailTemplateService();

$data = [
    'user' => [
        'name' => 'Aliyan',
        'email' => 'test@example.com'
    ],
    'app' => [
        'name' => 'MySaaS'
    ],
    'action_url' => 'https://example.com/activate'
];

echo "TESTING: welcome_user template rendering...\n\n";

$result = $service->render('welcome_user', $data);

echo "SUBJECT: " . $result['subject'] . "\n";
echo "BODY (MARKDOWN):\n" . $result['body'] . "\n\n";
echo "HTML OUTPUT:\n" . $result['html'] . "\n";
echo "-------------------------------------------\n";

echo "TESTING: Fallback rendering (non-existent key)...\n";
$fallback = $service->render('non_existent', $data);
echo "FALLBACK SUBJECT: " . $fallback['subject'] . "\n";
