<?php

$base = 'https://tour.ethiodeploy.app/api/v1';

// 1. Login
$ch = curl_init("{$base}/auth/login");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'email' => 'admin@wanderersouthindia.com',
    'password' => 'Admin@12345'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$loginRes = json_decode(curl_exec($ch), true);
$token = $loginRes['data']['token'] ?? null;

if (!$token) {
    die("Failed to obtain admin token.\n");
}
echo "Admin logged in successfully. Token obtained.\n";

function remoteReq($method, $endpoint, $payload = null, $token = null) {
    global $base;
    $ch = curl_init("{$base}{$endpoint}");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    $headers = [];
    if ($token) {
        $headers[] = "Authorization: Bearer {$token}";
    }
    if ($payload !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        $headers[] = 'Content-Type: application/json';
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $raw = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    return ['code' => $code, 'body' => json_decode($raw, true), 'raw' => $raw];
}

// 2. Fetch remote destinations & categories map
$dRes = remoteReq('GET', '/destinations');
$destMap = [];
foreach ($dRes['body']['data'] ?? [] as $d) {
    $destMap[$d['slug']] = $d['id'];
}
echo "Remote Destinations: " . json_encode($destMap) . "\n";

$cRes = remoteReq('GET', '/tour-categories');
$catMap = [];
foreach ($cRes['body']['data'] ?? [] as $c) {
    $catMap[$c['slug']] = $c['id'];
}
// Also map variations
if (isset($catMap['palmleaf-horoscope'])) {
    $catMap['palmleaf-horoscope-tour'] = $catMap['palmleaf-horoscope'];
}
echo "Remote Categories: " . json_encode($catMap) . "\n";

// 3. Load seed tours
$seedFile = dirname(__DIR__) . '/storage/production_catalog_seed.json';
$catalog = json_decode(file_get_contents($seedFile), true);
$tours = $catalog['tours'] ?? [];
echo "Local Tours to sync: " . count($tours) . "\n\n";

// Check existing remote tours
$existingToursRes = remoteReq('GET', '/tours?limit=100');
$existingSlugs = [];
foreach ($existingToursRes['body']['data'] ?? [] as $et) {
    $existingSlugs[$et['slug']] = $et['id'];
}
echo "Existing Remote Tours: " . json_encode($existingSlugs) . "\n\n";

foreach ($tours as $t) {
    $slug = $t['slug'];
    $destSlug = $t['destination_slug'] ?? 'tamil-nadu';
    $destId = $destMap[$destSlug] ?? ($destMap['tamil-nadu'] ?? 3);

    // Map categories
    $categoryIds = [];
    foreach ($t['category_slugs'] ?? [] as $cs) {
        if (isset($catMap[$cs])) {
            $categoryIds[] = $catMap[$cs];
        }
    }
    if (empty($categoryIds)) {
        $categoryIds = [1]; // Fallback to City Sightseeing
    }

    $tourPayload = [
        'destination_id' => $destId,
        'title' => $t['title'],
        'slug' => $slug,
        'short_description' => $t['short_description'] ?? '',
        'overview' => $t['overview'] ?? '',
        'tour_type' => $t['tour_type'] ?? 'One Day Tours',
        'duration_text' => $t['duration_text'] ?? 'Full Day',
        'duration_hours' => $t['duration_hours'] ?? null,
        'duration_days' => $t['duration_days'] ?? 1,
        'languages' => $t['languages'] ?? 'English, Tamil',
        'base_price' => (float)($t['base_price'] ?? 49.00),
        'currency' => $t['currency'] ?? 'EUR',
        'min_persons' => (int)($t['min_persons'] ?? 1),
        'max_persons' => (int)($t['max_persons'] ?? 12),
        'status' => 'published',
        'category_ids' => $categoryIds,
        'highlights' => $t['highlights'] ?? [],
        'itineraries' => $t['itineraries'] ?? [],
        'includes' => $t['includes'] ?? [],
        'excludes' => $t['excludes'] ?? [],
        'why_choose' => $t['why_choose'] ?? [],
        'faqs' => $t['faqs'] ?? [],
        'pricing_tiers' => $t['pricing_tiers'] ?? [],
        'places' => $t['places'] ?? [],
        'metadata' => $t['metadata'] ?? [],
    ];

    if (isset($existingSlugs[$slug])) {
        $id = $existingSlugs[$slug];
        echo "Updating tour #{$id} [{$slug}]... ";
        $updRes = remoteReq('PUT', "/tours/{$id}", $tourPayload, $token);
        echo "HTTP {$updRes['code']}\n";
        remoteReq('POST', "/tours/{$id}/publish", [], $token);
    } else {
        echo "Creating tour [{$slug}]... ";
        $createRes = remoteReq('POST', '/tours', $tourPayload, $token);
        echo "HTTP {$createRes['code']}: ";
        if ($createRes['code'] === 201 || $createRes['code'] === 200) {
            $newId = $createRes['body']['data']['id'] ?? null;
            echo "SUCCESS (ID: {$newId})\n";
            if ($newId) {
                remoteReq('POST', "/tours/{$newId}/publish", [], $token);
            }
        } else {
            echo "FAILED: " . json_encode($createRes['body']) . "\n";
        }
    }
}

echo "\n--- Tour Sync Finished ---\n";

// Verify
$finalTours = remoteReq('GET', '/tours?limit=100');
echo "Tours currently on remote: " . count($finalTours['body']['data'] ?? []) . "\n";
foreach ($finalTours['body']['data'] ?? [] as $t) {
    echo " - [{$t['id']}] {$t['title']} ({$t['slug']}) - Status: {$t['status']}\n";
}

