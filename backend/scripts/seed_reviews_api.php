<?php

$base = 'https://tour.ethiodeploy.app/api/v1';

function apiCall($method, $endpoint, $payload = null, $token = null) {
    global $base;
    $ch = curl_init("{$base}{$endpoint}");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    $headers = ['Accept: application/json'];
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

$login = apiCall('POST', '/auth/login', [
    'email' => 'admin@wanderersouthindia.com',
    'password' => 'Admin@12345'
]);
$token = $login['body']['data']['token'] ?? null;
echo "Token: " . ($token ? 'OK' : 'FAILED') . "\n";

$reviews = [
    [
        'tour_id' => 1,
        'customer_name' => 'Dr. Elena Rostova',
        'customer_email' => 'elena.rostova@traveler.de',
        'customer_country' => 'Germany',
        'rating' => 5,
        'title' => 'Unforgettable South India Odyssey',
        'content' => 'Exploring Kerala and Tamil Nadu with a private chauffeur from Wanderer South India was the best decision we made. Our driver was polite, extremely knowledgeable about temple history, and the car was spotless every morning. Total peace of mind!',
        'image' => 'https://ui-avatars.com/api/?name=Elena+Rostova&background=01aa90&color=fff&size=128',
        'status' => 'approved',
        'is_featured' => 1
    ],
    [
        'tour_id' => 9,
        'customer_name' => 'David & Sarah Miller',
        'customer_email' => 'miller.travels@ukmail.co.uk',
        'customer_country' => 'United Kingdom',
        'rating' => 5,
        'title' => 'Magnificent Heritage & Shore Temples',
        'content' => 'The Mahabalipuram and Kanchipuram day tours were breathtaking! The rock relief carvings and seaside Shore Temple were brought to life by our private guide. The Pay on Arrival booking option was super smooth and reassuring.',
        'image' => 'https://ui-avatars.com/api/?name=David+Miller&background=01aa90&color=fff&size=128',
        'status' => 'approved',
        'is_featured' => 1
    ],
    [
        'tour_id' => 14,
        'customer_name' => 'Arjun & Priya Sharma',
        'customer_email' => 'arjun.sharma@gmail.com',
        'customer_country' => 'India',
        'rating' => 5,
        'title' => 'Mystical Palm Leaf Horoscope Experience',
        'content' => 'We booked the sacred Palm Leaf Nadi Horoscope reading and temple tour in Vaitheeswaran Kovil. Finding my ancient leaf from thumbprint was an astonishing and deeply spiritual revelation. Superbly organized!',
        'image' => 'https://ui-avatars.com/api/?name=Arjun+Sharma&background=01aa90&color=fff&size=128',
        'status' => 'approved',
        'is_featured' => 1
    ],
    [
        'tour_id' => 5,
        'customer_name' => 'Thomas & Claudia Weber',
        'customer_email' => 'thomas.weber@munich-travel.de',
        'customer_country' => 'Germany',
        'rating' => 5,
        'title' => 'First-Class Chauffeur & Tea Gardens',
        'content' => 'Munnar mist heights and Alleppey houseboats were paradise. Wanderer South India took care of every single transfer with luxury AC vehicles. Excellent English communication and prompt WhatsApp updates throughout.',
        'image' => 'https://ui-avatars.com/api/?name=Thomas+Weber&background=01aa90&color=fff&size=128',
        'status' => 'approved',
        'is_featured' => 1
    ],
    [
        'tour_id' => 13,
        'customer_name' => 'Lucas Dubois',
        'customer_email' => 'lucas.dubois@paris-voyage.fr',
        'customer_country' => 'France',
        'rating' => 5,
        'title' => 'Incredible Waves at Covelong Point',
        'content' => 'Surfing Covelong waves was the highlight of my trip to Tamil Nadu! Certified ocean instructors made me catch my first clean wave in under 45 minutes. Safe, exhilarating, and highly recommended!',
        'image' => 'https://ui-avatars.com/api/?name=Lucas+Dubois&background=01aa90&color=fff&size=128',
        'status' => 'approved',
        'is_featured' => 1
    ]
];

foreach ($reviews as $r) {
    $res = apiCall('POST', '/reviews', $r, $token);
    echo "Review by {$r['customer_name']}: HTTP {$res['code']} - " . json_encode($res['body'] ?? $res['raw']) . "\n";
}
