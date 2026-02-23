<?php
/**
 * Standalone Proxy Connectivity Tester
 * Usage: gate.evomi.com:1000:user:pass
 */

$proxy = $_GET['proxy'] ?? ''; // Format: host:port:user:pass
if (!$proxy) {
    die("Usage: ?proxy=host:port:user:pass");
}

$parts = explode(':', $proxy);
if (count($parts) < 4) {
    die("Invalid format. Use host:port:user:pass");
}

$host = $parts[0];
$port = $parts[1];
$user = $parts[2];
$pass = $parts[3];

echo "<h3>Testing Proxy Connection...</h3>";
echo "<b>Host:</b> $host<br>";
echo "<b>Port:</b> $port<br>";
echo "<b>User:</b> $user<br>";
echo "<b>Pass:</b> $pass<hr>";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://api.ipify.org?format=json");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_PROXY, "$host:$port");
curl_setopt($ch, CURLOPT_PROXYUSERPWD, "$user:$pass");
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Bypass for test

$start = microtime(true);
$response = curl_exec($ch);
$elapsed = round(microtime(true) - $start, 2);
$error = curl_error($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response) {
    echo "<div style='color:green; font-weight:bold;'>SUCCESS!</div>";
    echo "<b>Time:</b> {$elapsed}s<br>";
    echo "<b>Proxy IP:</b> $response<br>";
} else {
    echo "<div style='color:red; font-weight:bold;'>FAILED!</div>";
    echo "<b>Error:</b> $error<br>";
    echo "<b>HTTP Code:</b> $httpCode<br>";
}
