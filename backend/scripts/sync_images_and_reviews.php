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

// 1. Admin login
$login = apiCall('POST', '/auth/login', [
    'email' => 'admin@wanderersouthindia.com',
    'password' => 'Admin@12345'
]);
$token = $login['body']['data']['token'] ?? null;
if (!$token) {
    die("Login failed\n");
}
echo "Token OK\n";

// 2. Fetch all media on remote
$allMedia = [];
$page = 1;
do {
    $mRes = apiCall('GET', "/media?limit=100&page={$page}", null, $token);
    $items = $mRes['body']['data'] ?? [];
    foreach ($items as $item) {
        $allMedia[$item['filename']] = $item['id'];
        $allMedia[$item['file_path']] = $item['id'];
    }
    $page++;
    $hasMore = !empty($items) && count($items) === 100;
} while ($hasMore);
echo "Fetched " . count($allMedia) . " media mappings from remote\n";

// 3. Update destinations with featured image
$destImages = [
    'tamil-nadu' => 'uploads/media/demo_home_tamilnadu.jpg',
    'karnataka' => 'uploads/media/demo_home_karnataka.jpg',
    'kerala' => 'uploads/media/demo_home_kerala.jpg',
    'goa' => 'uploads/media/demo_home_goa.jpg'
];

$dRes = apiCall('GET', '/destinations');
foreach ($dRes['body']['data'] ?? [] as $dest) {
    $slug = $dest['slug'];
    $imgPath = $destImages[$slug] ?? null;
    $mediaId = $imgPath ? ($allMedia[$imgPath] ?? ($allMedia[basename($imgPath)] ?? null)) : null;
    
    echo "Destination {$slug} (ID: {$dest['id']}) -> Image: {$imgPath} (Media ID: {$mediaId})\n";
    $updPayload = [
        'name' => $dest['name'],
        'slug' => $dest['slug'],
        'hero_title' => $dest['hero_title'] ?? $dest['name'],
        'hero_subtitle' => $dest['hero_subtitle'] ?? '',
        'short_description' => $dest['short_description'] ?? '',
        'featured_image_id' => $mediaId,
        'intro_media_id' => $mediaId,
        'status' => 'published',
        'is_featured' => 1
    ];
    $res = apiCall('PUT', "/destinations/{$dest['id']}", $updPayload, $token);
    echo " - Update HTTP {$res['code']}\n";
}

// 4. Update Tours with featured image
$tourImages = [
    'goa-signature-luxury-experience' => 'uploads/media/demo_goa_beaches.jpg',
    'goa-scenic-family-getaway' => 'uploads/media/demo_goa_oldgoa.jpg',
    'karnataka-signature-luxury-experience' => 'uploads/media/demo_karnataka_mysore.jpg',
    'karnataka-scenic-family-getaway' => 'uploads/media/demo_karnataka_coorg.jpg',
    'kerala-signature-luxury-experience' => 'uploads/media/demo_kerala_munnar.jpg',
    'kerala-scenic-family-getaway' => 'uploads/media/demo_kerala_alappuzha.jpg',
    'tamil-nadu-signature-luxury-experience' => 'uploads/media/demo_tamilnadu_mahabalipuram.jpg',
    'tamil-nadu-scenic-family-getaway' => 'uploads/media/demo_tamilnadu_madurai.jpg',
    'mahabalipuram-day-tour' => 'uploads/media/demo_tamilnadu_mahabalipuram.jpg',
    'kanchipuram-day-tour' => 'uploads/media/demo_tamilnadu_kanchipuram.jpg',
    'pondicherry-day-tour' => 'uploads/media/demo_carousel_pondicherry.jpg',
    'chennai-day-tour' => 'uploads/media/demo_tamilnadu_chennai.jpg',
    'surfing-your-best-day' => 'uploads/media/surfing_tour_banner.jpg',
    'palmleaf-horoscope-find-your-destiny' => 'uploads/media/palmleaf_reading_session.jpg'
];

$tRes = apiCall('GET', '/tours?limit=100');
foreach ($tRes['body']['data'] ?? [] as $tour) {
    $slug = $tour['slug'];
    $imgPath = $tourImages[$slug] ?? null;
    $mediaId = $imgPath ? ($allMedia[$imgPath] ?? ($allMedia[basename($imgPath)] ?? null)) : null;

    echo "Tour {$slug} (ID: {$tour['id']}) -> Image: {$imgPath} (Media ID: {$mediaId})\n";
    $updPayload = [
        'destination_id' => $tour['destination_id'],
        'title' => $tour['title'],
        'slug' => $tour['slug'],
        'short_description' => $tour['short_description'] ?? '',
        'overview' => $tour['overview'] ?? '',
        'tour_type' => $tour['tour_type'] ?? 'One Day Tours',
        'duration_text' => $tour['duration_text'] ?? 'Full Day',
        'duration_hours' => $tour['duration_hours'] ?? null,
        'duration_days' => $tour['duration_days'] ?? 1,
        'languages' => $tour['languages'] ?? 'English',
        'base_price' => (float)$tour['base_price'],
        'currency' => $tour['currency'] ?? 'EUR',
        'min_persons' => (int)$tour['min_persons'],
        'max_persons' => (int)$tour['max_persons'],
        'featured_image_id' => $mediaId,
        'status' => 'published',
        'category_ids' => [1],
    ];
    $res = apiCall('PUT', "/tours/{$tour['id']}", $updPayload, $token);
    echo " - Update HTTP {$res['code']}\n";
    apiCall('POST', "/tours/{$tour['id']}/publish", [], $token);
}

// 5. Sync Reviews (Testimonials)
$reviews = [
    [
        'tour_id' => 1,
        'customer_name' => 'Dr. Elena Rostova',
        'customer_email' => 'elena.rostova@traveler.de',
        'customer_country' => 'Germany',
        'rating' => 5,
        'title' => 'Unforgettable South India Odyssey',
        'review_text' => 'Exploring Kerala and Tamil Nadu with a private chauffeur from Wanderer South India was the best decision we made. Our driver was polite, extremely knowledgeable about temple history, and the car was spotless every morning. Total peace of mind!',
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
        'review_text' => 'The Mahabalipuram and Kanchipuram day tours were breathtaking! The rock relief carvings and seaside Shore Temple were brought to life by our private guide. The Pay on Arrival booking option was super smooth and reassuring.',
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
        'review_text' => 'We booked the sacred Palm Leaf Nadi Horoscope reading and temple tour in Vaitheeswaran Kovil. Finding my ancient leaf from thumbprint was an astonishing and deeply spiritual revelation. Superbly organized!',
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
        'review_text' => 'Munnar mist heights and Alleppey houseboats were paradise. Wanderer South India took care of every single transfer with luxury AC vehicles. Excellent English communication and prompt WhatsApp updates throughout.',
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
        'review_text' => 'Surfing Covelong waves was the highlight of my trip to Tamil Nadu! Certified ocean instructors made me catch my first clean wave in under 45 minutes. Safe, exhilarating, and highly recommended!',
        'image' => 'https://ui-avatars.com/api/?name=Lucas+Dubois&background=01aa90&color=fff&size=128',
        'status' => 'approved',
        'is_featured' => 1
    ]
];

echo "\nSyncing Reviews...\n";
foreach ($reviews as $rev) {
    $res = apiCall('POST', '/reviews', $rev, $token);
    echo "Review by {$rev['customer_name']}: HTTP {$res['code']}\n";
}

echo "\nDone!\n";
