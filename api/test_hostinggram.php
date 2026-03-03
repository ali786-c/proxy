<?php

$host = 'mail.hostinggram.com';
$username = 'mail@hostinggram.com';
$password = 'cTw{#gbuu=t)jQRj';

echo "=== Testing Hostinggram Connection ===\n\n";

// 1. IMAP Test (Diagnostic)
echo "--- Step 1: Testing IMAP SSL (Port 993) ---\n";
$target_imap = "ssl://" . $host;
$socket_imap = @fsockopen($target_imap, 993, $errno, $errstr, 5);

if ($socket_imap) {
    echo "[SUCCESS] IMAP Socket is OPEN.\n";
    echo "Greeting: " . fgets($socket_imap, 1024);
    fclose($socket_imap);
} else {
    echo "[FAIL] IMAP Socket Error: $errstr ($errno)\n";
}

echo "\n";

// 2. SMTP Test (Sending)
echo "--- Step 2: Testing SMTP SSL (Port 465) ---\n";
$target_smtp = "ssl://" . $host;
$socket_smtp = @fsockopen($target_smtp, 465, $errno, $errstr, 5);

if ($socket_smtp) {
    echo "[SUCCESS] SMTP Socket is OPEN.\n";
    $greeting = fgets($socket_smtp, 1024);
    echo "Greeting: $greeting";

    // Try AUTH
    fwrite($socket_smtp, "EHLO " . gethostname() . "\r\n");
    while ($line = fgets($socket_smtp, 1024)) { if (substr($line, 3, 1) === ' ') break; }

    fwrite($socket_smtp, "AUTH LOGIN\r\n");
    $authRes = fgets($socket_smtp, 1024);
    echo "AUTH LOGIN Response: $authRes";

    if (strpos($authRes, '334') === 0) {
        fwrite($socket_smtp, base64_encode($username) . "\r\n");
        fgets($socket_smtp, 1024);
        fwrite($socket_smtp, base64_encode($password) . "\r\n");
        $finalAuth = fgets($socket_smtp, 1024);
        echo "Final Auth Response: $finalAuth";

        if (strpos($finalAuth, '235') === 0) {
            echo "\n[SUCCESS] Credentials are VALID for Hostinggram SMTP!\n";
        } else {
            echo "\n[FAIL] SMTP Authentication Failed with these credentials.\n";
        }
    }
    fclose($socket_smtp);
} else {
    echo "[FAIL] SMTP Socket Error: $errstr ($errno)\n";
    echo "This indicates Port 465 is blocked or unreachable for this host.\n";
}
