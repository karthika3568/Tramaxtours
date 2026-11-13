<?php
require_once __DIR__ . '/../storage/production_catalog_seed.json';
// Let's read the seed JSON and test creating destinations via REST API
$data = json_decode(file_get_contents(__DIR__ . '/../storage/production_catalog_seed.json'), true);

function httpCall($method, $url, $body = null, $token = null) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $headers = ['Accept: application/json'];
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        $headers[] = 'Content-Type: application/json';
    }
    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    return ['code' => $code, 'body' => json_decode($res, true)];
}

$baseUrl = 'https://tour.ethiodeploy.app/api/v1';

// 1. Login
$login = httpCall('POST', $baseUrl . '/auth/login', [
    'email' => 'admin@tramaxtours.com',
    'password' => 'Admin@12345'
]);
$token = $login['body']['data']['token'] ?? null;
echo "Token: " . ($token ? "OK" : "FAILED") . "\n";

// 2. Fetch current destinations
$curDests = httpCall('GET', $baseUrl . '/destinations', null, $token);
echo "Current destinations count: " . count($curDests['body']['data'] ?? []) . "\n";
$existingSlugs = [];
foreach ($curDests['body']['data'] ?? [] as $d) {
    $existingSlugs[$d['slug']] = $d['id'];
}

// 3. Create or update destinations from seed
foreach ($data['destinations'] as $dest) {
    $slug = $dest['slug'];
    $payload = [
        'name' => $dest['name'],
        'slug' => $dest['slug'],
        'hero_title' => $dest['hero_title'] ?? $dest['name'],
        'hero_subtitle' => $dest['hero_subtitle'] ?? '',
        'short_description' => $dest['short_description'] ?? '',
        'intro_label' => $dest['intro_label'] ?? '',
        'intro_heading' => $dest['intro_heading'] ?? '',
        'intro_content' => $dest['intro_content'] ?? '',
        'language' => $dest['language'] ?? 'English / Tamil',
        'currency' => $dest['currency'] ?? 'INR',
        'religion' => $dest['religion'] ?? '',
        'heritage' => $dest['heritage'] ?? '',
        'timezone' => $dest['timezone'] ?? 'GMT +5:30',
        'is_featured' => $dest['is_featured'] ?? 1,
        'status' => 'published',
    ];

    if (isset($existingSlugs[$slug])) {
        $id = $existingSlugs[$slug];
        echo "Updating destination $slug (ID: $id)...\n";
        $res = httpCall('PUT', $baseUrl . "/destinations/$id", $payload, $token);
        echo "Response: " . $res['code'] . " - " . ($res['body']['message'] ?? json_encode($res['body'])) . "\n";
    } else {
        echo "Creating destination $slug...\n";
        $res = httpCall('POST', $baseUrl . "/destinations", $payload, $token);
        echo "Response: " . $res['code'] . " - " . ($res['body']['message'] ?? json_encode($res['body'])) . "\n";
    }
}

