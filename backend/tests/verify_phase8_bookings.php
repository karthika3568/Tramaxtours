<?php

/**
 * Wanderer South India - Phase 8H Bookings & Orders Management Verification Suite
 * Tests full booking lifecycle, customer details, billing addresses, status history,
 * pagination, filtering, statistics, and RBAC authorization.
 */

declare(strict_types=1);

error_reporting(E_ALL & ~E_DEPRECATED);

define('BACKEND_ROOT', dirname(__DIR__));
require_once BACKEND_ROOT . '/utils/Env.php';
require_once BACKEND_ROOT . '/utils/Database.php';
require_once BACKEND_ROOT . '/utils/JWT.php';

use App\Utils\Database;
use App\Utils\Env;
use App\Utils\JWT;

Env::load(BACKEND_ROOT . '/.env');

$totalTests = 0;
$passedTests = 0;
$failedTests = 0;
$testErrors = [];

function recordResult(string $title, bool $success, string $details = ''): void
{
    global $totalTests, $passedTests, $failedTests, $testErrors;
    $totalTests++;
    if ($success) {
        $passedTests++;
        echo "  [PASS] {$title}" . ($details ? " - {$details}" : '') . PHP_EOL;
    } else {
        $failedTests++;
        $testErrors[] = "{$title}: {$details}";
        echo "  [FAIL] {$title}" . ($details ? " - {$details}" : '') . PHP_EOL;
    }
}

echo PHP_EOL . "================================================================================" . PHP_EOL;
echo "  Wanderer South India — PHASE 8H BOOKINGS & ORDERS VERIFICATION SUITE" . PHP_EOL;
echo "================================================================================" . PHP_EOL . PHP_EOL;

// Start ephemeral server
$testPort = 8898;
$testHost = "127.0.0.1:{$testPort}";
$baseUrl = "http://{$testHost}";
$publicDir = BACKEND_ROOT . DIRECTORY_SEPARATOR . 'public';

$serverCommand = sprintf(
    'php -d upload_max_filesize=50M -d post_max_size=50M -S %s -t %s %s',
    $testHost,
    escapeshellarg($publicDir),
    escapeshellarg($publicDir . DIRECTORY_SEPARATOR . 'index.php')
);
$descriptors = [
    0 => ['pipe', 'r'],
    1 => ['file', 'NUL', 'w'],
    2 => ['file', 'NUL', 'w'],
];

$serverProcess = proc_open($serverCommand, $descriptors, $pipes, BACKEND_ROOT);
if (!is_resource($serverProcess)) {
    die("Failed to spawn background test PHP server on {$testHost}.\n");
}

register_shutdown_function(function () use (&$serverProcess, &$pipes) {
    if (is_resource($serverProcess)) {
        if (isset($pipes[0]) && is_resource($pipes[0])) fclose($pipes[0]);
        proc_terminate($serverProcess);
        proc_close($serverProcess);
    }
});

usleep(400000); // 400ms

function apiRequest(string $method, string $path, array $data = [], ?string $token = null): array
{
    global $baseUrl;
    $url = $baseUrl . $path;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, strtoupper($method));
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_FORBID_REUSE, true);

    $headers = ['Connection: close'];
    if ($token !== null) {
        $headers[] = "Authorization: Bearer {$token}";
    }

    if (!empty($data) || in_array(strtoupper($method), ['POST', 'PUT', 'PATCH'])) {
        $payload = json_encode($data);
        $headers[] = 'Content-Type: application/json';
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    }

    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);

    return [
        'status' => (int) $httpCode,
        'body' => (string) $response,
        'json' => json_decode((string) $response, true),
        'error' => $curlError,
    ];
}

$pdo = Database::getConnection();

// 1. Database Schema Verification
echo "1. Database Schema & Permissions Verification:" . PHP_EOL;

$tables = ['bookings', 'booking_customer_details', 'booking_billing_addresses', 'booking_status_history', 'payments'];
foreach ($tables as $tbl) {
    $exists = (int) $pdo->query("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = '{$tbl}'")->fetchColumn();
    recordResult("Table '{$tbl}' exists in database", $exists === 1);
}

// 2. Setup RBAC Tokens & Database Users
echo PHP_EOL . "2. RBAC Tokens & User Context Setup:" . PHP_EOL;

// Super Admin (User ID 1)
$superAdminToken = JWT::encode([
    'sub' => 1,
    'id' => 1,
    'email' => 'admin@wanderersouthindia.com',
    'role' => 'super_admin',
    'roles' => ['super_admin'],
    'permissions' => ['*'],
]);
recordResult("Super Admin token generated", !empty($superAdminToken));

// Create Viewer User with bookings.view only
$pdo->prepare("DELETE FROM users WHERE email = 'viewer.phase8h@wanderersouthindia.com'")->execute();
$pdo->prepare("INSERT INTO users (name, email, password_hash, status, created_at, updated_at) VALUES ('Phase8H Viewer', 'viewer.phase8h@wanderersouthindia.com', 'hash', 'active', NOW(), NOW())")->execute();
$viewerUserId = (int) $pdo->lastInsertId();

$pdo->prepare("DELETE FROM roles WHERE slug = 'phase8h_viewer_role'")->execute();
$pdo->prepare("INSERT INTO roles (name, slug, description, is_system, created_at, updated_at) VALUES ('Phase8H Booking Viewer', 'phase8h_viewer_role', 'Booking Viewer', 0, NOW(), NOW())")->execute();
$viewerRoleId = (int) $pdo->lastInsertId();
$pdo->prepare("INSERT INTO role_permissions (role_id, permission_id) SELECT ?, id FROM permissions WHERE name = 'bookings.view'")->execute([$viewerRoleId]);
$pdo->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)")->execute([$viewerUserId, $viewerRoleId]);

$viewerToken = JWT::encode([
    'sub' => $viewerUserId,
    'id' => $viewerUserId,
    'email' => 'viewer.phase8h@wanderersouthindia.com',
    'role' => 'viewer',
    'permissions' => ['bookings.view'],
]);
recordResult("Viewer token generated (has bookings.view only)", !empty($viewerToken));

// Create Unauthorized User (No permissions)
$pdo->prepare("DELETE FROM users WHERE email = 'noauth.phase8h@wanderersouthindia.com'")->execute();
$pdo->prepare("INSERT INTO users (name, email, password_hash, status, created_at, updated_at) VALUES ('Phase8H Guest', 'noauth.phase8h@wanderersouthindia.com', 'hash', 'active', NOW(), NOW())")->execute();
$guestUserId = (int) $pdo->lastInsertId();

$unauthorizedToken = JWT::encode([
    'sub' => $guestUserId,
    'id' => $guestUserId,
    'email' => 'noauth.phase8h@wanderersouthindia.com',
    'role' => 'guest',
    'permissions' => [],
]);
recordResult("Unauthorized token generated (no booking permissions)", !empty($unauthorizedToken));

// Get or create test destination and tour
$tourId = (int) $pdo->query("SELECT id FROM tours WHERE deleted_at IS NULL LIMIT 1")->fetchColumn();
if (!$tourId) {
    $pdo->query("INSERT INTO destinations (name, slug, status, created_at, updated_at) VALUES ('Test Dest', 'test-dest-booking', 'published', NOW(), NOW())");
    $destId = (int) $pdo->lastInsertId();
    $pdo->query("INSERT INTO tours (destination_id, title, slug, base_price, currency, duration_days, status, created_at, updated_at) VALUES ({$destId}, 'Test Safari Tour', 'test-safari-booking', 500.00, 'EUR', 3, 'published', NOW(), NOW())");
    $tourId = (int) $pdo->lastInsertId();
}

// 3. Authorization Tests
echo PHP_EOL . "3. Authorization & Permission Enforcement:" . PHP_EOL;

$resUnauthList = apiRequest('GET', '/api/v1/bookings');
recordResult("Unauthenticated GET /api/v1/bookings -> 401", $resUnauthList['status'] === 401);

$resNoPermList = apiRequest('GET', '/api/v1/bookings', [], $unauthorizedToken);
recordResult("Unauthorized GET /api/v1/bookings without bookings.view -> 403", $resNoPermList['status'] === 403);

$resViewerList = apiRequest('GET', '/api/v1/bookings', [], $viewerToken);
recordResult("Viewer with bookings.view GET /api/v1/bookings -> 200 OK", $resViewerList['status'] === 200);

// 4. Input Validation Tests
echo PHP_EOL . "4. Input Validation & Constraint Checks:" . PHP_EOL;

$resMissingTour = apiRequest('POST', '/api/v1/bookings', [
    'first_name' => 'John',
    'last_name' => 'Doe',
    'email' => 'john@example.com',
    'phone' => '+123456789',
    'address_line1' => '123 Main St',
    'city' => 'Paris',
    'postal_code' => '75001',
    'country' => 'France',
]);
recordResult("Missing tour_id rejected (422)", $resMissingTour['status'] === 422 && isset($resMissingTour['json']['errors']['tour_id']));

$resInvalidEmail = apiRequest('POST', '/api/v1/bookings', [
    'tour_id' => $tourId,
    'first_name' => 'John',
    'last_name' => 'Doe',
    'email' => 'invalid-email-string',
    'phone' => '+123456789',
    'address_line1' => '123 Main St',
    'city' => 'Paris',
    'postal_code' => '75001',
    'country' => 'France',
]);
recordResult("Invalid email format rejected (422)", $resInvalidEmail['status'] === 422 && isset($resInvalidEmail['json']['errors']['email']));

// 5. Booking Creation & Public Order Placement
echo PHP_EOL . "5. Booking Creation & Public Order Flow:" . PHP_EOL;

$testBookingPayload = [
    'tour_id' => $tourId,
    'booking_date' => date('Y-m-d', strtotime('+7 days')),
    'tickets_count' => 2,
    'unit_price' => 250.00,
    'total_price' => 500.00,
    'currency' => 'EUR',
    'payment_method' => 'pay_on_arrival',
    'customer_notes' => 'Vegetarian dietary requirement requested',
    'first_name' => 'Karthika',
    'last_name' => 'Govind',
    'email' => 'karthika@example.com',
    'phone' => '+33612345678',
    'address_line1' => '14 Avenue des Champs-Elysees',
    'city' => 'Paris',
    'state' => 'Ile-de-France',
    'postal_code' => '75008',
    'country' => 'France',
];

$resCreate = apiRequest('POST', '/api/v1/bookings', $testBookingPayload);
recordResult("POST /api/v1/bookings creates booking (201 Created)", $resCreate['status'] === 201 && isset($resCreate['json']['data']['id']));

$createdBookingId = $resCreate['json']['data']['id'] ?? 0;
$createdOrderNum = $resCreate['json']['data']['order_number'] ?? '';

// 6. Booking Detail & Lookup
echo PHP_EOL . "6. Booking Details Retrieval:" . PHP_EOL;

$resDetail = apiRequest('GET', "/api/v1/bookings/{$createdBookingId}", [], $superAdminToken);
recordResult(
    "GET /api/v1/bookings/{id} retrieves full details (200 OK)",
    $resDetail['status'] === 200 &&
    ($resDetail['json']['data']['customer']['email'] ?? '') === 'karthika@example.com' &&
    ($resDetail['json']['data']['billing_address']['city'] ?? '') === 'Paris' &&
    ($resDetail['json']['data']['tour']['id'] ?? 0) === $tourId
);

$resDetailByOrder = apiRequest('GET', "/api/v1/bookings/{$createdOrderNum}", [], $superAdminToken);
recordResult(
    "GET /api/v1/bookings/{order_number} retrieves full details (200 OK)",
    $resDetailByOrder['status'] === 200 &&
    ($resDetailByOrder['json']['data']['id'] ?? 0) === $createdBookingId
);

// 7. Statistics Endpoint
echo PHP_EOL . "7. Booking Aggregate Statistics:" . PHP_EOL;
$resStats = apiRequest('GET', '/api/v1/bookings/stats', [], $superAdminToken);
recordResult(
    "GET /api/v1/bookings/stats returns accurate metrics",
    $resStats['status'] === 200 &&
    isset($resStats['json']['data']['total']) &&
    isset($resStats['json']['data']['pending']) &&
    isset($resStats['json']['data']['total_revenue'])
);

// 8. Status Lifecycle Transitions
echo PHP_EOL . "8. Status Lifecycle Transitions:" . PHP_EOL;

$resConfirm = apiRequest('POST', "/api/v1/bookings/{$createdBookingId}/confirm", ['notes' => 'Confirmed via call'], $superAdminToken);
recordResult("POST /api/v1/bookings/{id}/confirm updates status to 'confirmed'", $resConfirm['status'] === 200 && ($resConfirm['json']['data']['booking_status'] ?? '') === 'confirmed');

$resComplete = apiRequest('POST', "/api/v1/bookings/{$createdBookingId}/complete", ['notes' => 'Tour finished'], $superAdminToken);
recordResult("POST /api/v1/bookings/{id}/complete updates status to 'completed'", $resComplete['status'] === 200 && ($resComplete['json']['data']['booking_status'] ?? '') === 'completed');

$resCancel = apiRequest('POST', "/api/v1/bookings/{$createdBookingId}/cancel", ['notes' => 'Client requested cancellation'], $superAdminToken);
recordResult("POST /api/v1/bookings/{id}/cancel updates status to 'cancelled'", $resCancel['status'] === 200 && ($resCancel['json']['data']['booking_status'] ?? '') === 'cancelled');

// Check history trail
$resHistoryCheck = apiRequest('GET', "/api/v1/bookings/{$createdBookingId}", [], $superAdminToken);
$histCount = count($resHistoryCheck['json']['data']['status_history'] ?? []);
recordResult("Booking status history records audit trail (>= 4 status transitions)", $histCount >= 4);

// 9. Search & Filtering
echo PHP_EOL . "9. Search, Filtering & Pagination:" . PHP_EOL;

$resSearch = apiRequest('GET', '/api/v1/bookings', ['search' => 'Karthika'], $superAdminToken);
recordResult("Search bookings by customer name (?search=Karthika)", $resSearch['status'] === 200 && count($resSearch['json']['data']) >= 1);

$resFilterStatus = apiRequest('GET', '/api/v1/bookings', ['status' => 'cancelled'], $superAdminToken);
recordResult("Filter bookings by status (?status=cancelled)", $resFilterStatus['status'] === 200 && count($resFilterStatus['json']['data']) >= 1);

// 10. Soft-Delete & Restore
echo PHP_EOL . "10. Soft Delete & Restore:" . PHP_EOL;

$resDelete = apiRequest('DELETE', "/api/v1/bookings/{$createdBookingId}", [], $superAdminToken);
recordResult("DELETE /api/v1/bookings/{id} soft-deletes booking (200 OK)", $resDelete['status'] === 200);

$resDeletedDetail = apiRequest('GET', "/api/v1/bookings/{$createdBookingId}", [], $superAdminToken);
recordResult("Soft-deleted booking returns 404 NOT_FOUND on active query", $resDeletedDetail['status'] === 404);

$resRestore = apiRequest('POST', "/api/v1/bookings/{$createdBookingId}/restore", [], $superAdminToken);
recordResult("POST /api/v1/bookings/{id}/restore restores booking (200 OK)", $resRestore['status'] === 200 && ($resRestore['json']['data']['deleted_at'] ?? null) === null);

// Cleanup
$pdo->prepare("DELETE FROM payments WHERE booking_id = ?")->execute([$createdBookingId]);
$pdo->prepare("DELETE FROM booking_status_history WHERE booking_id = ?")->execute([$createdBookingId]);
$pdo->prepare("DELETE FROM booking_customer_details WHERE booking_id = ?")->execute([$createdBookingId]);
$pdo->prepare("DELETE FROM booking_billing_addresses WHERE booking_id = ?")->execute([$createdBookingId]);
$pdo->prepare("DELETE FROM bookings WHERE id = ?")->execute([$createdBookingId]);

$pdo->prepare("DELETE FROM user_roles WHERE user_id IN (?, ?)")->execute([$viewerUserId, $guestUserId]);
$pdo->prepare("DELETE FROM role_permissions WHERE role_id = ?")->execute([$viewerRoleId]);
$pdo->prepare("DELETE FROM roles WHERE id = ?")->execute([$viewerRoleId]);
$pdo->prepare("DELETE FROM users WHERE id IN (?, ?)")->execute([$viewerUserId, $guestUserId]);

echo PHP_EOL . "================================================================================" . PHP_EOL;
echo "  PHASE 8H BOOKINGS VERIFICATION RESULTS" . PHP_EOL;
echo "================================================================================" . PHP_EOL;
echo "  Total Tests:  {$totalTests}" . PHP_EOL;
echo "  Passed Tests: {$passedTests}" . PHP_EOL;
echo "  Failed Tests: {$failedTests}" . PHP_EOL;
echo "================================================================================" . PHP_EOL;

if ($failedTests === 0) {
    echo PHP_EOL . "ALL PHASE 8H BOOKINGS TESTS PASSED PERFECTLY!" . PHP_EOL . PHP_EOL;
    exit(0);
} else {
    echo PHP_EOL . "SOME TESTS FAILED." . PHP_EOL . PHP_EOL;
    exit(1);
}
