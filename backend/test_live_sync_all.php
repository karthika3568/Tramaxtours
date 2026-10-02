<?php
/**
 * Detailed Live Sync Test for Tour, Destination, Testimonial and Booking
 */
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/utils/Env.php';
require_once __DIR__ . '/utils/Database.php';

\App\Utils\Env::load(__DIR__ . '/.env');
$db = \App\Utils\Database::getConnection();
$baseUrl = 'http://127.0.0.1:8080/api/v1';

function printHeader($title) {
    echo "\n======================================================================\n";
    echo "  " . strtoupper($title) . "\n";
    echo "======================================================================\n";
}

function httpReq($method, $url, $data = null, $headers = []) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_HEADER, true);
    if ($data !== null) {
        $payload = is_string($data) ? $data : json_encode($data);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        if (!in_array('Content-Type: application/json', $headers) && is_array($data)) {
            $headers[] = 'Content-Type: application/json';
        }
    }
    if (!empty($headers)) {
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    }
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $headerStr = substr($response, 0, $headerSize);
    $bodyStr = substr($response, $headerSize);
    
    return [
        'code' => $httpCode,
        'headers' => $headerStr,
        'body' => json_decode($bodyStr, true),
        'raw_body' => $bodyStr
    ];
}

$adminLogin = httpReq('POST', $baseUrl . '/auth/login', [
    'email' => 'admin@wanderersouthindia.com',
    'password' => 'Admin@12345'
]);
$adminToken = $adminLogin['body']['data']['token'] ?? null;
$adminHeaders = $adminToken ? ["Authorization: Bearer $adminToken"] : [];

// 1. TOUR LIVE SYNC
printHeader("1. TOUR LIVE SYNC");
$tourSlug = 'live-tour-' . time();
$createTour = httpReq('POST', $baseUrl . '/tours', [
    'title' => 'Live Tour ' . time(),
    'slug' => $tourSlug,
    'destination_id' => 1,
    'duration_days' => 4,
    'base_price' => 25000,
    'status' => 'published',
], $adminHeaders);
echo "Admin Create Tour: HTTP " . $createTour['code'] . "\n";
$tourId = $createTour['body']['data']['id'] ?? null;

$pubTour1 = httpReq('GET', $baseUrl . '/tours/' . $tourSlug);
echo "Public API (Immediate Check): HTTP " . $pubTour1['code'] . " | Found: " . ($pubTour1['code'] === 200 ? "YES" : "NO") . "\n";

$updateTour = httpReq('PUT', $baseUrl . '/tours/' . $tourId, [
    'title' => 'Live Tour Updated ' . time(),
    'status' => 'published',
    'base_price' => 28000,
], $adminHeaders);
echo "Admin Update Tour: HTTP " . $updateTour['code'] . "\n";

$delTour = httpReq('DELETE', $baseUrl . '/tours/' . $tourId, null, $adminHeaders);
echo "Admin Soft-Delete Tour: HTTP " . $delTour['code'] . "\n";

$pubTour2 = httpReq('GET', $baseUrl . '/tours/' . $tourSlug);
echo "Public API (After Delete): HTTP " . $pubTour2['code'] . " (Expected: 404)\n";

// 2. DESTINATION LIVE SYNC
printHeader("2. DESTINATION LIVE SYNC");
$destSlug = 'live-dest-' . time();
$createDest = httpReq('POST', $baseUrl . '/destinations', [
    'name' => 'Live Destination ' . time(),
    'slug' => $destSlug,
    'tagline' => 'Scenic hill station',
    'status' => 'published',
], $adminHeaders);
echo "Admin Create Destination: HTTP " . $createDest['code'] . "\n";
$destId = $createDest['body']['data']['id'] ?? null;

$pubDest1 = httpReq('GET', $baseUrl . '/destinations/' . $destSlug);
echo "Public API (Immediate Check): HTTP " . $pubDest1['code'] . " | Found: " . ($pubDest1['code'] === 200 ? "YES" : "NO") . "\n";

$updateDest = httpReq('PUT', $baseUrl . '/destinations/' . $destId, [
    'name' => 'Live Destination Updated ' . time(),
    'status' => 'published',
], $adminHeaders);
echo "Admin Update Destination: HTTP " . $updateDest['code'] . "\n";

$delDest = httpReq('DELETE', $baseUrl . '/destinations/' . $destId, null, $adminHeaders);
echo "Admin Soft-Delete Destination: HTTP " . $delDest['code'] . "\n";

$pubDest2 = httpReq('GET', $baseUrl . '/destinations/' . $destSlug);
echo "Public API (After Delete): HTTP " . $pubDest2['code'] . " (Expected: 404)\n";

// 3. TESTIMONIAL (REVIEW) LIVE SYNC
printHeader("3. TESTIMONIAL (REVIEW) LIVE SYNC");
$createRev = httpReq('POST', $baseUrl . '/reviews', [
    'tour_id' => 1,
    'customer_name' => 'Reviewer ' . time(),
    'customer_email' => 'reviewer' . time() . '@example.com',
    'rating' => 5,
    'title' => 'Memorable South India Holiday',
    'content' => 'Outstanding chauffeur and breathtaking hill tea plantations in Munnar.',
    'status' => 'approved',
    'is_featured' => 1,
], $adminHeaders);
echo "Admin Create Approved Review: HTTP " . $createRev['code'] . "\n";
$revId = $createRev['body']['data']['id'] ?? null;

$pubRev1 = httpReq('GET', $baseUrl . '/reviews');
echo "Public API Reviews List: HTTP " . $pubRev1['code'] . " (Found in active reviews: " . (!empty($pubRev1['body']['data']) ? "YES" : "NO") . ")\n";

$delRev = httpReq('DELETE', $baseUrl . '/reviews/' . $revId, null, $adminHeaders);
echo "Admin Delete Review: HTTP " . $delRev['code'] . "\n";

$pubRev2 = httpReq('GET', $baseUrl . '/reviews');
echo "Public API Reviews List After Delete: HTTP " . $pubRev2['code'] . "\n";

// 4. BOOKING LIVE SYNC
printHeader("4. BOOKING LIVE SYNC");
$createBook = httpReq('POST', $baseUrl . '/bookings', [
    'tour_id' => 1,
    'first_name' => 'Kishore',
    'last_name' => 'Kumar',
    'email' => 'kishore.live@example.com',
    'phone' => '+919876543210',
    'address_line1' => '123 Anna Salai',
    'city' => 'Chennai',
    'postal_code' => '600002',
    'country' => 'India',
    'booking_date' => '2026-11-20',
    'tickets_count' => 2,
    'total_price' => 30000,
]);
echo "Booking Create: HTTP " . $createBook['code'] . "\n";
$bookId = $createBook['body']['data']['id'] ?? ($createBook['body']['data']['booking']['id'] ?? null);

$adminBook = httpReq('GET', $baseUrl . '/bookings/' . ($bookId ?: 1), null, $adminHeaders);
echo "Admin Bookings Detail: HTTP " . $adminBook['code'] . "\n";

printHeader("LIVE SYNC VERIFICATION COMPLETE");
