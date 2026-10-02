<?php

require_once __DIR__ . '/vendor/autoload.php';

$ch = curl_init('http://127.0.0.1:8080/api/v1/auth/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['email' => 'admin@wanderersouthindia.com', 'password' => 'Admin@12345']));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$login = json_decode(curl_exec($ch), true);
$token = $login['data']['token'];

$ch = curl_init('http://127.0.0.1:8080/api/v1/reviews');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'tour_id' => 7,
    'customer_name' => 'Live Sync Reviewer',
    'customer_email' => 'reviewer@example.com',
    'customer_country' => 'Germany',
    'rating' => 5,
    'review_title' => 'Unforgettable Journey',
    'review_text' => 'Outstanding hospitality and private tour arrangements.',
    'status' => 'approved',
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer {$token}", 'Content-Type: application/json']);
$res = curl_exec($ch);
echo "Review Create: " . $res . "\n";
