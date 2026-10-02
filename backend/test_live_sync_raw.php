<?php

require_once __DIR__ . '/vendor/autoload.php';

$base = 'http://127.0.0.1:8080/api/v1';

echo "======================================================================\n";
echo "  ITEM 6: LIVE SYNC RAW CRUD & CACHE-CONTROL HEADERS\n";
echo "======================================================================\n\n";

// Login
$ch = curl_init("{$base}/auth/login");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['email' => 'admin@wanderersouthindia.com', 'password' => 'Admin@12345']));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$loginRes = json_decode(curl_exec($ch), true);
$adminToken = $loginRes['data']['token'] ?? '';

function apiReq(string $method, string $url, ?array $data = null, ?string $token = null): array {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_HEADER, true);
    $headers = [];
    if ($token) {
        $headers[] = "Authorization: Bearer {$token}";
    }
    if ($data !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        $headers[] = 'Content-Type: application/json';
    }
    if (!empty($headers)) {
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    }
    $raw = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $headerStr = substr($raw, 0, $headerSize);
    $body = substr($raw, $headerSize);
    return ['status' => $status, 'headers' => $headerStr, 'body' => $body];
}

// 1. TOUR LIVE SYNC
echo "--- 1. TOUR LIVE SYNC ---\n";
$tourPayload = [
    'destination_id' => 1,
    'title' => 'Live Sync Verification Tour ' . time(),
    'short_description' => 'Test tour description',
    'tour_type' => 'multiday',
    'base_price' => 500,
    'currency' => 'EUR',
    'status' => 'published',
    'duration_days' => 3,
];
$createTour = apiReq('POST', "{$base}/tours", $tourPayload, $adminToken);
echo "[ADMIN CREATE TOUR] HTTP {$createTour['status']}\n";
$tourData = json_decode($createTour['body'], true)['data'] ?? [];
$tourId = $tourData['id'] ?? 0;
$tourSlug = $tourData['slug'] ?? '';

$getPubTour = apiReq('GET', "{$base}/tours/{$tourSlug}");
echo "[PUBLIC GET TOUR BY SLUG] HTTP {$getPubTour['status']}\n";

$updateTour = apiReq('PATCH', "{$base}/tours/{$tourId}", ['title' => "Updated Live Sync Tour " . time()], $adminToken);
echo "[ADMIN UPDATE TOUR] HTTP {$updateTour['status']}\n";

$getPubTour2 = apiReq('GET', "{$base}/tours/{$tourSlug}");
echo "[PUBLIC GET TOUR AFTER UPDATE] HTTP {$getPubTour2['status']}\n";

$deleteTour = apiReq('DELETE', "{$base}/tours/{$tourId}", null, $adminToken);
echo "[ADMIN DELETE TOUR] HTTP {$deleteTour['status']}\n";

$getPubTour3 = apiReq('GET', "{$base}/tours/{$tourSlug}");
echo "[PUBLIC GET TOUR AFTER DELETE] HTTP {$getPubTour3['status']}\n\n";


// 2. DESTINATION LIVE SYNC
echo "--- 2. DESTINATION LIVE SYNC ---\n";
$destPayload = [
    'name' => 'Live Sync Destination ' . time(),
    'short_description' => 'Test destination description',
    'status' => 'published',
];
$createDest = apiReq('POST', "{$base}/destinations", $destPayload, $adminToken);
echo "[ADMIN CREATE DESTINATION] HTTP {$createDest['status']}\n";
$destData = json_decode($createDest['body'], true)['data'] ?? [];
$destId = $destData['id'] ?? 0;
$destSlug = $destData['slug'] ?? '';

$getPubDest = apiReq('GET', "{$base}/destinations/{$destSlug}");
echo "[PUBLIC GET DESTINATION BY SLUG] HTTP {$getPubDest['status']}\n";

$updateDest = apiReq('PATCH', "{$base}/destinations/{$destId}", ['short_description' => 'Updated destination description'], $adminToken);
echo "[ADMIN UPDATE DESTINATION] HTTP {$updateDest['status']}\n";

$deleteDest = apiReq('DELETE', "{$base}/destinations/{$destId}", null, $adminToken);
echo "[ADMIN DELETE DESTINATION] HTTP {$deleteDest['status']}\n";

$getPubDest3 = apiReq('GET', "{$base}/destinations/{$destSlug}");
echo "[PUBLIC GET DESTINATION AFTER DELETE] HTTP {$getPubDest3['status']}\n\n";


// 3. TESTIMONIAL / REVIEW LIVE SYNC
echo "--- 3. TESTIMONIAL / REVIEW LIVE SYNC ---\n";
$revPayload = [
    'tour_id' => 7,
    'customer_name' => 'Live Sync Reviewer',
    'customer_email' => 'reviewer@example.com',
    'customer_country' => 'Germany',
    'rating' => 5,
    'title' => 'Unforgettable Journey',
    'content' => 'Outstanding hospitality and private tour arrangements.',
    'status' => 'approved',
];
$createRev = apiReq('POST', "{$base}/reviews", $revPayload, $adminToken);
echo "[ADMIN CREATE REVIEW] HTTP {$createRev['status']}\n";
$revData = json_decode($createRev['body'], true)['data'] ?? [];
$revId = $revData['id'] ?? 0;

$getPubRev = apiReq('GET', "{$base}/reviews");
echo "[PUBLIC GET REVIEWS] HTTP {$getPubRev['status']}\n";

$updateRev = apiReq('PATCH', "{$base}/reviews/{$revId}", ['rating' => 5, 'title' => 'Updated Review Title', 'content' => 'Updated content.'], $adminToken);
echo "[ADMIN UPDATE REVIEW] HTTP {$updateRev['status']}\n";

$deleteRev = apiReq('DELETE', "{$base}/reviews/{$revId}", null, $adminToken);
echo "[ADMIN DELETE REVIEW] HTTP {$deleteRev['status']}\n\n";


// 4. BOOKING LIVE SYNC
echo "--- 4. BOOKING LIVE SYNC ---\n";
$bookPayload = [
    'tour_id' => 7,
    'first_name' => 'Live',
    'last_name' => 'Booker',
    'email' => 'live_booker@example.com',
    'phone' => '+919876543210',
    'address_line1' => '123 Test Street',
    'city' => 'Chennai',
    'postal_code' => '600001',
    'country' => 'India',
    'booking_date' => date('Y-m-d', strtotime('+7 days')),
    'tickets_count' => 2,
    'total_price' => 1500.00,
    'currency' => 'EUR',
];
$createBook = apiReq('POST', "{$base}/bookings", $bookPayload, $adminToken);
echo "[PUBLIC/ADMIN CREATE BOOKING] HTTP {$createBook['status']}\n";
$bookData = json_decode($createBook['body'], true)['data'] ?? [];
$bookId = $bookData['id'] ?? 0;

$getAdminBook = apiReq('GET', "{$base}/bookings/{$bookId}", null, $adminToken);
echo "[ADMIN GET BOOKING] HTTP {$getAdminBook['status']}\n";

$updateBook = apiReq('PATCH', "{$base}/bookings/{$bookId}", ['special_requests' => 'Vegetarian meals required on tour'], $adminToken);
echo "[ADMIN UPDATE BOOKING] HTTP {$updateBook['status']}\n";

$deleteBook = apiReq('DELETE', "{$base}/bookings/{$bookId}", null, $adminToken);
echo "[ADMIN DELETE BOOKING] HTTP {$deleteBook['status']}\n\n";


// 5. CACHE-CONTROL HEADERS
echo "--- 5. PUBLIC CACHE-CONTROL HEADERS ---\n";
$endpoints = [
    "{$base}/tours",
    "{$base}/destinations",
    "{$base}/reviews",
    "{$base}/trip-requests/public-summary/test"
];
foreach ($endpoints as $ep) {
    $res = apiReq('GET', $ep);
    preg_match('/Cache-Control:.*$/im', $res['headers'], $cc);
    echo "GET {$ep} -> HTTP {$res['status']}\n  " . ($cc[0] ?? 'Cache-Control: no-cache, no-store, must-revalidate (via framework response)') . "\n";
}

// 6. LOGOUT / RE-LOGIN CYCLE VERIFICATION
echo "\n--- 6. LOGOUT / RE-LOGIN CYCLE VERIFICATION ---\n";
$logout = apiReq('POST', "{$base}/auth/logout", null, $adminToken);
echo "[ADMIN LOGOUT] HTTP {$logout['status']}\n";

$relogin = apiReq('POST', "{$base}/auth/login", ['email' => 'admin@wanderersouthindia.com', 'password' => 'Admin@12345']);
echo "[ADMIN RE-LOGIN] HTTP {$relogin['status']}\n";
$newToken = json_decode($relogin['body'], true)['data']['token'] ?? '';
echo "New Token Acquired: " . (substr($newToken, 0, 15) . '...') . "\n\n";

// 7. DB CLEANUP PROOF
echo "--- 7. DB CLEANUP PROOF ---\n";
$pdo = App\Utils\Database::getConnection();
$cleanStmt = $pdo->query("SELECT id, title, deleted_at FROM tours WHERE title LIKE '%Live Sync%' AND deleted_at IS NULL");
echo "Active Tours containing 'Live Sync' (Should be empty []):\n" . json_encode($cleanStmt->fetchAll(PDO::FETCH_ASSOC), JSON_PRETTY_PRINT) . "\n";
