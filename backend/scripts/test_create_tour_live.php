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
    return ['code' => $code, 'body' => json_decode($res, true), 'raw' => $res];
}

$baseUrl = 'https://tour.ethiodeploy.app/api/v1';

$login = httpCall('POST', $baseUrl . '/auth/login', [
    'email' => 'admin@tramaxtours.com',
    'password' => 'Admin@12345'
]);
$token = $login['body']['data']['token'] ?? null;

$tourPayload = [
    'destination_id' => 3,
    'title' => 'Mahabalipuram Day Tour',
    'slug' => 'mahabalipuram-day-tour',
    'short_description' => 'Explore the UNESCO Shore Temple and ancient rock reliefs.',
    'overview' => 'Full day guided tour to Mahabalipuram from Chennai.',
    'tour_type' => 'One Day Tours',
    'duration_text' => 'Full Day',
    'duration_days' => 1,
    'base_price' => 45.00,
    'currency' => 'EUR',
    'status' => 'published',
];

$res = httpCall('POST', $baseUrl . '/tours', $tourPayload, $token);
echo "HTTP Code: {$res['code']}\n";
print_r($res['body'] ?: $res['raw']);

