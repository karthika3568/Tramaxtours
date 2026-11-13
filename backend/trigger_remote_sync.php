<?php

function httpCall($method, $url, $body = null, $headers = []) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    if ($body !== null) {
        $payload = is_string($body) ? $body : json_encode($body);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        $headers[] = 'Content-Type: application/json';
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    return ['code' => $code, 'body' => json_decode($res, true), 'raw' => $res];
}

$baseUrl = 'https://tour.ethiodeploy.app/api/v1';

echo "1. Checking Health...\n";
$health = httpCall('GET', $baseUrl . '/health');
echo "Health status: {$health['code']}\n";
print_r($health['body']);

echo "\n2. Logging in as Admin...\n";
$login = httpCall('POST', $baseUrl . '/auth/login', [
    'email' => 'admin@tramaxtours.com',
    'password' => 'Admin@12345'
]);
$token = $login['body']['data']['token'] ?? null;
if (!$token) {
    echo "Login failed. Trying backup admin email...\n";
    $login = httpCall('POST', $baseUrl . '/auth/login', [
        'email' => 'admin@wanderersouthindia.com',
        'password' => 'Admin@12345'
    ]);
    $token = $login['body']['data']['token'] ?? null;
}

echo "Admin Token obtained: " . ($token ? 'YES' : 'NO') . "\n";

echo "\n3. Triggering Catalog and Schema Sync on Remote Backend...\n";
$syncKey = 'wanderer_tours_jwt_secret_key_2026_super_secure_9b78c1d3f4e5a6b7c8d9e0f1a2b3c4d5';
$headers = [
    'Accept: application/json',
    'X-Sync-Key: ' . $syncKey
];
if ($token) {
    $headers[] = 'Authorization: Bearer ' . $token;
}

$sync = httpCall('POST', $baseUrl . '/health/sync-catalog', [], $headers);
echo "Sync HTTP Code: {$sync['code']}\n";
print_r($sync['body'] ?: $sync['raw']);

echo "\n4. Verifying Remote Tours After Sync...\n";
$tours = httpCall('GET', $baseUrl . '/tours');
$count = is_array($tours['body']['data'] ?? null) ? count($tours['body']['data']) : 0;
echo "Tours on Remote Backend: {$count}\n";
if (!empty($tours['body']['data'])) {
    foreach ($tours['body']['data'] as $t) {
        echo " - [{$t['id']}] {$t['title']} ({$t['slug']}) - Price: {$t['base_price']} {$t['currency']}\n";
    }
}

echo "\n5. Verifying Remote Destinations...\n";
$dests = httpCall('GET', $baseUrl . '/destinations');
$dCount = is_array($dests['body']['data'] ?? null) ? count($dests['body']['data']) : 0;
echo "Destinations on Remote Backend: {$dCount}\n";
if (!empty($dests['body']['data'])) {
    foreach ($dests['body']['data'] as $d) {
        echo " - [{$d['id']}] {$d['name']} ({$d['slug']}) - Status: {$d['status']}\n";
    }
}

