<?php

$base = 'https://tour.ethiodeploy.app/api/v1';

$ch = curl_init("{$base}/auth/login");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(["email" => "admin@wanderersouthindia.com", "password" => "Admin@12345"]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
$raw = curl_exec($ch);
$res = json_decode($raw, true);
$token = $res["data"]["token"] ?? null;

echo "Admin Token: " . ($token ? "OK" : "FAILED") . "\n";
if (!$token) {
    echo "Raw login response: " . $raw . "\n";
    echo "Curl error: " . curl_error($ch) . "\n";
}

$ch2 = curl_init("{$base}/media?limit=5");
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch2, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch2, CURLOPT_HTTPHEADER, ["Authorization: Bearer $token"]);
$mRes = json_decode(curl_exec($ch2), true);
echo "Media total: " . ($mRes["pagination"]["total"] ?? count($mRes["data"] ?? [])) . "\n";
if (!empty($mRes["data"])) {
    print_r(array_slice($mRes["data"], 0, 3));
}

$ch3 = curl_init("{$base}/tour-categories");
curl_setopt($ch3, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch3, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch3, CURLOPT_SSL_VERIFYHOST, false);
$catRes = json_decode(curl_exec($ch3), true);
echo "\nTour Categories count: " . count($catRes["data"] ?? []) . "\n";
foreach ($catRes["data"] ?? [] as $c) {
    echo " - [{$c['id']}] {$c['name']} (slug: {$c['slug']})\n";
}

$ch4 = curl_init("{$base}/pages/about-us");
curl_setopt($ch4, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch4, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch4, CURLOPT_SSL_VERIFYHOST, false);
$pageRes = json_decode(curl_exec($ch4), true);
echo "\nPage about-us status: " . (($pageRes["success"] ?? false) ? "Found" : "Not Found") . "\n";
if (!empty($pageRes["data"])) {
    echo "Title: " . ($pageRes["data"]["title"] ?? "") . "\n";
}
