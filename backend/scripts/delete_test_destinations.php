<?php
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

$login = httpCall('POST', $baseUrl . '/auth/login', [
    'email' => 'admin@tramaxtours.com',
    'password' => 'Admin@12345'
]);
$token = $login['body']['data']['token'] ?? null;

// Delete test destinations
$del1 = httpCall('DELETE', $baseUrl . '/destinations/1', null, $token);
echo "Delete test-destination1: {$del1['code']}\n";
$del2 = httpCall('DELETE', $baseUrl . '/destinations/2', null, $token);
echo "Delete test-destination2: {$del2['code']}\n";

