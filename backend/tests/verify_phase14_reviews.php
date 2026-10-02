<?php

/**
 * Wanderer South India - Phase 14 Comprehensive End-to-End Reviews & Testimonials API Verification Test Suite
 * 
 * Verifies all Phase 14 requirements:
 * - Database schema, columns (including deleted_at, deleted_by) & reviews.view / reviews.moderate permissions
 * - Authentication & RBAC Authorization enforcement
 * - View / Detail operation (complete stored review data + tour summary + media items)
 * - CRUD operations (Create, Read by ID, Update, Partial Update, Delete)
 * - Media attachments synchronization through review_media
 * - Validation errors (missing tour_id, missing name, invalid email, rating out of bounds, invalid status, invalid media ID)
 * - Moderation status transitions (approve, reject, feature, unfeature)
 * - Reversible Soft Delete (records deleted_at, deleted_by, preserves DB data)
 * - List exclusion of soft-deleted reviews
 * - Reversible Undo/Restore (POST/PATCH /restore returns identical record, ID, clears deleted_at/by)
 * - Filtering, Searching, Whitelist Sorting & Pagination
 * - Audit logging (review_create, update, soft_delete, restore, approve, reject, feature, unfeature)
 * - System Regressions: Health, Auth (Phase 3), Media (Phase 4), Destinations (Phase 5), Tours (Phase 6), Pages (Phase 7), CMS Sections (Phase 8), Hero Slides (Phase 9), Home Benefits (Phase 10), Site Settings (Phase 11), Footer Links (Phase 12), Social Links (Phase 13)
 * - Complete test environment cleanup
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

// 1. Load Environment Configuration
Env::load(BACKEND_ROOT . '/.env');

// Test statistics
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
        echo "  [\033[32mPASS\033[0m] {$title}" . ($details ? " - {$details}" : "") . PHP_EOL;
    } else {
        $failedTests++;
        $testErrors[] = "{$title}: {$details}";
        echo "  [\033[31mFAIL\033[0m] {$title}" . ($details ? " - {$details}" : "") . PHP_EOL;
    }
}

echo PHP_EOL . "================================================================================" . PHP_EOL;
echo "  Wanderer South India — PHASE 14 REVIEWS & TESTIMONIALS MANAGEMENT VERIFICATION SUITE" . PHP_EOL;
echo "================================================================================" . PHP_EOL . PHP_EOL;

// 2. Start Local Test Server
$testPort = 8897;
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

// Ensure server process is terminated on exit
register_shutdown_function(function () use (&$serverProcess, &$pipes) {
    if (is_resource($serverProcess)) {
        if (isset($pipes[0]) && is_resource($pipes[0])) fclose($pipes[0]);
        proc_terminate($serverProcess);
        proc_close($serverProcess);
    }
});

// Wait briefly for server startup
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

    $headers = [
        'Connection: close',
    ];
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
    curl_close($ch);

    return [
        'status' => (int) $httpCode,
        'body' => (string) $response,
        'json' => json_decode((string) $response, true),
        'error' => $curlError,
    ];
}

$pdo = Database::getConnection();

// --- 1. Database Schema & Permissions Verification ---
echo "1. Database Schema & Permissions Verification:" . PHP_EOL;

$tableExists = (bool) $pdo->query("SHOW TABLES LIKE 'reviews'")->fetch();
recordResult("Table 'reviews' exists in database", $tableExists);

$mediaTableExists = (bool) $pdo->query("SHOW TABLES LIKE 'review_media'")->fetch();
recordResult("Table 'review_media' exists in database", $mediaTableExists);

$colStmt = $pdo->query("SHOW COLUMNS FROM `reviews`");
$columns = $colStmt->fetchAll(PDO::FETCH_COLUMN);

$requiredColumns = [
    'id', 'tour_id', 'user_id', 'customer_name', 'customer_email', 'customer_country',
    'rating', 'title', 'content', 'status', 'is_featured',
    'moderated_by', 'moderated_at', 'created_at', 'updated_at', 'deleted_at', 'deleted_by'
];
$missingCols = array_diff($requiredColumns, $columns);
recordResult("All required reviews columns including soft delete present in schema", empty($missingCols), empty($missingCols) ? "All columns verified" : "Missing: " . implode(', ', $missingCols));

$permViewCheck = (int) $pdo->query("SELECT COUNT(*) FROM permissions WHERE name = 'reviews.view'")->fetchColumn();
recordResult("Permission 'reviews.view' exists in permissions table", $permViewCheck > 0);

$permModCheck = (int) $pdo->query("SELECT COUNT(*) FROM permissions WHERE name = 'reviews.moderate'")->fetchColumn();
recordResult("Permission 'reviews.moderate' exists in permissions table", $permModCheck > 0);

echo PHP_EOL;

// --- 2. Test Fixtures & RBAC Setup ---
echo "2. Test Fixtures & RBAC Setup:" . PHP_EOL;

// Create test destination & test tour for reviews
$pdo->prepare("DELETE FROM destinations WHERE slug = 'test-phase14-dest'")->execute();
$pdo->prepare("INSERT INTO destinations (name, slug, status, created_at, updated_at) VALUES ('Phase 14 Test Destination', 'test-phase14-dest', 'published', NOW(), NOW())")->execute();
$testDestId = (int) $pdo->lastInsertId();

$pdo->prepare("DELETE FROM tours WHERE slug = 'test-phase14-tour'")->execute();
$pdo->prepare("INSERT INTO tours (destination_id, title, slug, base_price, duration_days, status, created_at, updated_at) VALUES (?, 'Phase 14 Test Tour', 'test-phase14-tour', 500, 3, 'published', NOW(), NOW())")->execute([$testDestId]);
$testTourId = (int) $pdo->lastInsertId();
recordResult("Test Tour fixture prepared", $testTourId > 0, "Tour ID: {$testTourId}");

// Create test media for review attachments
$pdo->prepare("DELETE FROM media WHERE filename = 'phase14_review_photo.jpg'")->execute();
$pdo->prepare("INSERT INTO media (filename, original_name, file_path, file_size, mime_type, created_at, updated_at) VALUES ('phase14_review_photo.jpg', 'traveler_photo.jpg', 'uploads/media/phase14_review_photo.jpg', 20480, 'image/jpeg', NOW(), NOW())")->execute();
$testMediaId = (int) $pdo->lastInsertId();
recordResult("Test Media fixture prepared", $testMediaId > 0, "Media ID: {$testMediaId}");

// Super Admin Token
$superAdminToken = JWT::encode([
    'sub' => 1,
    'id' => 1,
    'email' => 'admin@wanderersouthindia.com',
    'role' => 'super_admin',
    'roles' => ['super_admin'],
    'permissions' => ['*'],
], null, 3600);
recordResult("Super Admin token generated", !empty($superAdminToken));

// Moderator Token (has reviews.view and reviews.moderate via Role 4)
$pdo->prepare("DELETE FROM users WHERE email = 'moderator.phase14@wanderersouthindia.com'")->execute();
$pdo->prepare("INSERT INTO users (name, email, password_hash, status, created_at, updated_at) VALUES ('Phase14 Moderator', 'moderator.phase14@wanderersouthindia.com', 'hash', 'active', NOW(), NOW())")->execute();
$moderatorId = (int) $pdo->lastInsertId();
$pdo->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)")->execute([$moderatorId, 4]); // Role 4 = Moderator

$moderatorToken = JWT::encode([
    'sub' => $moderatorId,
    'id' => $moderatorId,
    'email' => 'moderator.phase14@wanderersouthindia.com',
    'role' => 'moderator',
    'permissions' => ['reviews.view', 'reviews.moderate'],
], null, 3600);
recordResult("Moderator token generated (has reviews.view and reviews.moderate)", !empty($moderatorToken));

// Viewer Token (has reviews.view only)
$pdo->prepare("DELETE FROM roles WHERE slug = 'phase14_viewer_role'")->execute();
$pdo->prepare("INSERT INTO roles (name, slug, description, is_system, created_at, updated_at) VALUES ('Phase14 Review Viewer', 'phase14_viewer_role', 'Review Viewer', 0, NOW(), NOW())")->execute();
$viewerRoleId = (int) $pdo->lastInsertId();
$pdo->prepare("INSERT INTO role_permissions (role_id, permission_id) SELECT ?, id FROM permissions WHERE name = 'reviews.view'")->execute([$viewerRoleId]);

$pdo->prepare("DELETE FROM users WHERE email = 'viewer.phase14@wanderersouthindia.com'")->execute();
$pdo->prepare("INSERT INTO users (name, email, password_hash, status, created_at, updated_at) VALUES ('Phase14 Viewer', 'viewer.phase14@wanderersouthindia.com', 'hash', 'active', NOW(), NOW())")->execute();
$viewerId = (int) $pdo->lastInsertId();
$pdo->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)")->execute([$viewerId, $viewerRoleId]);

$viewerToken = JWT::encode([
    'sub' => $viewerId,
    'id' => $viewerId,
    'email' => 'viewer.phase14@wanderersouthindia.com',
    'role' => 'viewer',
    'permissions' => ['reviews.view'],
], null, 3600);
recordResult("Viewer token generated (has reviews.view ONLY)", !empty($viewerToken));

// Unauthorized Token (e.g. Editor who lacks review permissions)
$pdo->prepare("DELETE FROM users WHERE email = 'editor.phase14@wanderersouthindia.com'")->execute();
$pdo->prepare("INSERT INTO users (name, email, password_hash, status, created_at, updated_at) VALUES ('Phase14 Editor', 'editor.phase14@wanderersouthindia.com', 'hash', 'active', NOW(), NOW())")->execute();
$editorId = (int) $pdo->lastInsertId();
$pdo->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)")->execute([$editorId, 3]); // Role 3 = Editor (has no reviews permissions)

$unauthorizedToken = JWT::encode([
    'sub' => $editorId,
    'id' => $editorId,
    'email' => 'editor.phase14@wanderersouthindia.com',
    'role' => 'editor',
    'permissions' => ['pages.manage'], // no review permissions
], null, 3600);
recordResult("Unauthorized token generated (no reviews permissions)", !empty($unauthorizedToken));

echo PHP_EOL;

// --- 3. Authorization & Permission Enforcement ---
echo "3. Authorization & Permission Enforcement:" . PHP_EOL;

// Unauthenticated requests
$resUnauthList = apiRequest('GET', '/api/v1/reviews');
recordResult("Unauthenticated list -> 401", $resUnauthList['status'] === 401);

$resUnauthShow = apiRequest('GET', '/api/v1/reviews/1');
recordResult("Unauthenticated detail -> 401", $resUnauthShow['status'] === 401);

$resUnauthStore = apiRequest('POST', '/api/v1/reviews', ['tour_id' => $testTourId, 'customer_name' => 'John', 'customer_email' => 'john@example.com', 'rating' => 5, 'content' => 'Great tour']);
recordResult("Unauthenticated create -> 401", $resUnauthStore['status'] === 401);

$resUnauthUpdate = apiRequest('PUT', '/api/v1/reviews/1', ['customer_name' => 'Unauth']);
recordResult("Unauthenticated update -> 401", $resUnauthUpdate['status'] === 401);

$resUnauthDelete = apiRequest('DELETE', '/api/v1/reviews/1');
recordResult("Unauthenticated delete -> 401", $resUnauthDelete['status'] === 401);

$resUnauthRestore = apiRequest('POST', '/api/v1/reviews/1/restore');
recordResult("Unauthenticated restore -> 401", $resUnauthRestore['status'] === 401);

// Unauthorized user requests
$resForbiddenList = apiRequest('GET', '/api/v1/reviews', [], $unauthorizedToken);
recordResult("User without reviews.view -> 403", $resForbiddenList['status'] === 403);

$resForbiddenCreate = apiRequest('POST', '/api/v1/reviews', ['tour_id' => $testTourId, 'customer_name' => 'John', 'customer_email' => 'john@example.com', 'rating' => 5, 'content' => 'Great'], $unauthorizedToken);
recordResult("User without reviews.moderate create -> 403", $resForbiddenCreate['status'] === 403);

// Viewer user (with reviews.view only)
$resViewerList = apiRequest('GET', '/api/v1/reviews', [], $viewerToken);
recordResult("User with reviews.view can list reviews -> 200 OK", $resViewerList['status'] === 200);

$resViewerCreate = apiRequest('POST', '/api/v1/reviews', ['tour_id' => $testTourId, 'customer_name' => 'John', 'customer_email' => 'john@example.com', 'rating' => 5, 'content' => 'Great'], $viewerToken);
recordResult("User with only reviews.view rejected on create -> 403", $resViewerCreate['status'] === 403);

// Moderator user (with reviews.moderate)
$resModeratorList = apiRequest('GET', '/api/v1/reviews', [], $moderatorToken);
recordResult("Moderator with reviews.view & reviews.moderate -> 200 OK", $resModeratorList['status'] === 200);

echo PHP_EOL;

// --- 4. Input Validation & Constraint Checks ---
echo "4. Input Validation & Constraint Checks:" . PHP_EOL;

// Missing tour_id
$resValTour = apiRequest('POST', '/api/v1/reviews', [
    'customer_name' => 'John Doe',
    'customer_email' => 'john@example.com',
    'rating' => 5,
    'content' => 'Amazing journey',
], $moderatorToken);
recordResult("Missing tour_id -> 422", $resValTour['status'] === 422, "Error: " . ($resValTour['json']['errors']['tour_id'] ?? ''));

// Non-existent tour_id
$resValNonTour = apiRequest('POST', '/api/v1/reviews', [
    'tour_id' => 999999,
    'customer_name' => 'John Doe',
    'customer_email' => 'john@example.com',
    'rating' => 5,
    'content' => 'Amazing journey',
], $moderatorToken);
recordResult("Non-existent tour_id -> 422", $resValNonTour['status'] === 422, "Error: " . ($resValNonTour['json']['errors']['tour_id'] ?? ''));

// Missing customer_name
$resValName = apiRequest('POST', '/api/v1/reviews', [
    'tour_id' => $testTourId,
    'customer_email' => 'john@example.com',
    'rating' => 5,
    'content' => 'Amazing journey',
], $moderatorToken);
recordResult("Missing customer_name -> 422", $resValName['status'] === 422, "Error: " . ($resValName['json']['errors']['customer_name'] ?? ''));

// Missing customer_email
$resValEmail = apiRequest('POST', '/api/v1/reviews', [
    'tour_id' => $testTourId,
    'customer_name' => 'John Doe',
    'rating' => 5,
    'content' => 'Amazing journey',
], $moderatorToken);
recordResult("Missing customer_email -> 422", $resValEmail['status'] === 422, "Error: " . ($resValEmail['json']['errors']['customer_email'] ?? ''));

// Invalid customer_email
$resValInvEmail = apiRequest('POST', '/api/v1/reviews', [
    'tour_id' => $testTourId,
    'customer_name' => 'John Doe',
    'customer_email' => 'not-an-email',
    'rating' => 5,
    'content' => 'Amazing journey',
], $moderatorToken);
recordResult("Invalid customer_email format -> 422", $resValInvEmail['status'] === 422, "Error: " . ($resValInvEmail['json']['errors']['customer_email'] ?? ''));

// Rating < 1
$resValRatingLow = apiRequest('POST', '/api/v1/reviews', [
    'tour_id' => $testTourId,
    'customer_name' => 'John Doe',
    'customer_email' => 'john@example.com',
    'rating' => 0,
    'content' => 'Amazing journey',
], $moderatorToken);
recordResult("Rating < 1 -> 422", $resValRatingLow['status'] === 422, "Error: " . ($resValRatingLow['json']['errors']['rating'] ?? ''));

// Rating > 5
$resValRatingHigh = apiRequest('POST', '/api/v1/reviews', [
    'tour_id' => $testTourId,
    'customer_name' => 'John Doe',
    'customer_email' => 'john@example.com',
    'rating' => 6,
    'content' => 'Amazing journey',
], $moderatorToken);
recordResult("Rating > 5 -> 422", $resValRatingHigh['status'] === 422, "Error: " . ($resValRatingHigh['json']['errors']['rating'] ?? ''));

// Missing content
$resValContent = apiRequest('POST', '/api/v1/reviews', [
    'tour_id' => $testTourId,
    'customer_name' => 'John Doe',
    'customer_email' => 'john@example.com',
    'rating' => 5,
], $moderatorToken);
recordResult("Missing content -> 422", $resValContent['status'] === 422, "Error: " . ($resValContent['json']['errors']['content'] ?? ''));

// Invalid status
$resValStatus = apiRequest('POST', '/api/v1/reviews', [
    'tour_id' => $testTourId,
    'customer_name' => 'John Doe',
    'customer_email' => 'john@example.com',
    'rating' => 5,
    'content' => 'Amazing journey',
    'status' => 'unknown_status',
], $moderatorToken);
recordResult("Invalid status -> 422", $resValStatus['status'] === 422, "Error: " . ($resValStatus['json']['errors']['status'] ?? ''));

// Invalid media_ids
$resValMedia = apiRequest('POST', '/api/v1/reviews', [
    'tour_id' => $testTourId,
    'customer_name' => 'John Doe',
    'customer_email' => 'john@example.com',
    'rating' => 5,
    'content' => 'Amazing journey',
    'media_ids' => [999999],
], $moderatorToken);
recordResult("Non-existent media_ids -> 422", $resValMedia['status'] === 422, "Error: " . ($resValMedia['json']['errors']['media_ids'] ?? ''));

echo PHP_EOL;

// --- 5. Review CRUD Operations & Media Handling ---
echo "5. Review CRUD Operations & Media Handling:" . PHP_EOL;

// Create Review 1 (with media attachment)
$review1Payload = [
    'tour_id' => $testTourId,
    'customer_name' => 'Sarah Connor',
    'customer_email' => 'sarah.connor@example.com',
    'customer_country' => 'United States',
    'rating' => 5,
    'title' => 'Unforgettable South India Experience',
    'content' => 'The scenic landscapes and personalized itinerary were beyond exceptional!',
    'status' => 'pending',
    'is_featured' => 0,
    'media_ids' => [$testMediaId],
];

$resCreate1 = apiRequest('POST', '/api/v1/reviews', $review1Payload, $moderatorToken);
$review1Id = (int) ($resCreate1['json']['data']['id'] ?? 0);
recordResult("Create review 1 with media attachment -> 201 Created", $resCreate1['status'] === 201 && $review1Id > 0, "Created ID: {$review1Id}");

// Create Review 2
$review2Payload = [
    'tour_id' => $testTourId,
    'customer_name' => 'Marco Rossi',
    'customer_email' => 'marco.rossi@example.it',
    'customer_country' => 'Italy',
    'rating' => 4,
    'title' => 'Very Good Cultural Tour',
    'content' => 'Great guides and comfortable cab transit throughout Tamil Nadu.',
    'status' => 'approved',
    'is_featured' => 1,
];

$resCreate2 = apiRequest('POST', '/api/v1/reviews', $review2Payload, $moderatorToken);
$review2Id = (int) ($resCreate2['json']['data']['id'] ?? 0);
recordResult("Create review 2 -> 201 Created", $resCreate2['status'] === 201 && $review2Id > 0, "Created ID: {$review2Id}");

// View / Detail Review 1
$resShow1 = apiRequest('GET', "/api/v1/reviews/{$review1Id}", [], $moderatorToken);
$review1Data = $resShow1['json']['data'] ?? [];
$detailKeysValid = isset(
    $review1Data['id'],
    $review1Data['tour_id'],
    $review1Data['tour'],
    $review1Data['customer_name'],
    $review1Data['customer_email'],
    $review1Data['rating'],
    $review1Data['content'],
    $review1Data['status'],
    $review1Data['media'],
    $review1Data['created_at'],
    $review1Data['updated_at']
);
recordResult("View / Detail GET /api/v1/reviews/{id} returns complete data & tour summary", $resShow1['status'] === 200 && $detailKeysValid, "Tour Title: " . ($review1Data['tour']['title'] ?? ''));

// Verify attached media expansion in detail
$attachedMediaCount = count($review1Data['media'] ?? []);
$mediaUrlPresent = !empty($review1Data['media'][0]['url']);
recordResult("Detail expands attached media items with public URLs", $attachedMediaCount === 1 && $mediaUrlPresent, "Media URL: " . ($review1Data['media'][0]['url'] ?? ''));

// Full PUT Update
$putPayload = [
    'tour_id' => $testTourId,
    'customer_name' => 'Sarah Connor Updated',
    'customer_email' => 'sarah.updated@example.com',
    'customer_country' => 'Canada',
    'rating' => 5,
    'title' => 'Updated Unforgettable Experience',
    'content' => 'Updated review body description with even more positive feedback.',
    'status' => 'pending',
    'is_featured' => 0,
    'media_ids' => [], // clear media
];
$resPut = apiRequest('PUT', "/api/v1/reviews/{$review1Id}", $putPayload, $moderatorToken);
$putData = $resPut['json']['data'] ?? [];
$putSuccess = $resPut['status'] === 200
    && ($putData['customer_name'] ?? '') === 'Sarah Connor Updated'
    && ($putData['customer_country'] ?? '') === 'Canada'
    && count($putData['media'] ?? []) === 0;
recordResult("Full PUT update -> 200 OK & synchronizes media", $putSuccess);

// Partial PATCH Update
$patchPayload = [
    'rating' => 4,
    'media_ids' => [$testMediaId], // re-attach media
];
$resPatch = apiRequest('PATCH', "/api/v1/reviews/{$review1Id}", $patchPayload, $moderatorToken);
$patchData = $resPatch['json']['data'] ?? [];
$patchSuccess = $resPatch['status'] === 200
    && (int) ($patchData['rating'] ?? 0) === 4
    && ($patchData['customer_name'] ?? '') === 'Sarah Connor Updated'
    && count($patchData['media'] ?? []) === 1;
recordResult("Partial PATCH update preserves unsupplied fields and updates target fields", $patchSuccess);

echo PHP_EOL;

// --- 6. Moderation Actions & Feature Toggles ---
echo "6. Moderation Actions & Feature Toggles:" . PHP_EOL;

// Approve Review 1
$resApprove = apiRequest('POST', "/api/v1/reviews/{$review1Id}/approve", [], $moderatorToken);
$appData = $resApprove['json']['data'] ?? [];
$approveSuccess = $resApprove['status'] === 200
    && ($appData['status'] ?? '') === 'approved'
    && (int) ($appData['moderated_by'] ?? 0) === $moderatorId
    && !empty($appData['moderated_at']);
recordResult("POST /api/v1/reviews/{id}/approve sets status = approved, moderated_by & moderated_at", $approveSuccess);

// Reject Review 1
$resReject = apiRequest('POST', "/api/v1/reviews/{$review1Id}/reject", [], $moderatorToken);
$rejData = $resReject['json']['data'] ?? [];
$rejectSuccess = $resReject['status'] === 200
    && ($rejData['status'] ?? '') === 'rejected'
    && (int) ($rejData['moderated_by'] ?? 0) === $moderatorId
    && !empty($rejData['moderated_at']);
recordResult("POST /api/v1/reviews/{id}/reject sets status = rejected, moderated_by & moderated_at", $rejectSuccess);

// Feature Review 1
$resFeature = apiRequest('POST', "/api/v1/reviews/{$review1Id}/feature", [], $moderatorToken);
$featData = $resFeature['json']['data'] ?? [];
recordResult("POST /api/v1/reviews/{id}/feature sets is_featured = 1", $resFeature['status'] === 200 && ($featData['is_featured'] ?? false) === true);

// Unfeature Review 1
$resUnfeature = apiRequest('POST', "/api/v1/reviews/{$review1Id}/unfeature", [], $moderatorToken);
$unfeatData = $resUnfeature['json']['data'] ?? [];
recordResult("POST /api/v1/reviews/{id}/unfeature sets is_featured = 0", $resUnfeature['status'] === 200 && ($unfeatData['is_featured'] ?? true) === false);

echo PHP_EOL;

// --- 7. Search, Filtering, Whitelist Sorting & Pagination ---
echo "7. Search, Filtering, Whitelist Sorting & Pagination:" . PHP_EOL;

// Search by keyword
$resSearch = apiRequest('GET', '/api/v1/reviews?search=Connor', [], $moderatorToken);
$searchData = $resSearch['json']['data'] ?? [];
$searchFound = false;
foreach ($searchData as $item) {
    if (stripos($item['customer_name'] ?? '', 'Connor') !== false) {
        $searchFound = true;
        break;
    }
}
recordResult("Search ?search=Connor returns matching reviews", $resSearch['status'] === 200 && $searchFound);

// Filter by tour_id
$resFilterTour = apiRequest('GET', "/api/v1/reviews?tour_id={$testTourId}", [], $moderatorToken);
recordResult("Filter ?tour_id={$testTourId} returns reviews for that tour", $resFilterTour['status'] === 200 && count($resFilterTour['json']['data'] ?? []) >= 2);

// Filter by status=approved
$resFilterStatus = apiRequest('GET', '/api/v1/reviews?status=approved', [], $moderatorToken);
$approvedData = $resFilterStatus['json']['data'] ?? [];
$allApproved = count($approvedData) > 0 && array_reduce($approvedData, fn($c, $i) => $c && $i['status'] === 'approved', true);
recordResult("Filter ?status=approved returns only approved reviews", $resFilterStatus['status'] === 200 && $allApproved);

// Filter by rating
$resFilterRating = apiRequest('GET', '/api/v1/reviews?rating=4', [], $moderatorToken);
$ratingData = $resFilterRating['json']['data'] ?? [];
$allRating4 = count($ratingData) > 0 && array_reduce($ratingData, fn($c, $i) => $c && (int) $i['rating'] === 4, true);
recordResult("Filter ?rating=4 returns only 4-star reviews", $resFilterRating['status'] === 200 && $allRating4);

// Filter by is_featured=1
$resFilterFeat = apiRequest('GET', '/api/v1/reviews?is_featured=1', [], $moderatorToken);
$featuredData = $resFilterFeat['json']['data'] ?? [];
$allFeat = count($featuredData) > 0 && array_reduce($featuredData, fn($c, $i) => $c && (bool) $i['is_featured'] === true, true);
recordResult("Filter ?is_featured=1 returns only featured reviews", $resFilterFeat['status'] === 200 && $allFeat);

// Sorting by rating DESC
$resSort = apiRequest('GET', '/api/v1/reviews?sort_by=rating&sort_order=desc', [], $moderatorToken);
$sortData = $resSort['json']['data'] ?? [];
$isSorted = true;
for ($i = 0; $i < count($sortData) - 1; $i++) {
    if ((int) $sortData[$i]['rating'] < (int) $sortData[$i + 1]['rating']) {
        $isSorted = false;
        break;
    }
}
recordResult("Sorting by rating DESC works properly", $resSort['status'] === 200 && $isSorted);

// Pagination
$resPage = apiRequest('GET', '/api/v1/reviews?page=1&limit=1', [], $moderatorToken);
$paginationMeta = $resPage['json']['pagination'] ?? [];
$pageSuccess = $resPage['status'] === 200
    && count($resPage['json']['data'] ?? []) === 1
    && isset($paginationMeta['total'], $paginationMeta['page'], $paginationMeta['limit'], $paginationMeta['total_pages']);
recordResult("Pagination ?page=1&limit=1 returns proper metadata and sliced items", $pageSuccess);

echo PHP_EOL;

// --- 8. Reversible Soft Delete & Restore ---
echo "8. Reversible Soft Delete & Restore:" . PHP_EOL;

// Soft Delete Review 1
$resDel = apiRequest('DELETE', "/api/v1/reviews/{$review1Id}", [], $moderatorToken);
$delData = $resDel['json']['data'] ?? [];
$delSuccess = $resDel['status'] === 200
    && ($delData['is_deleted'] ?? false) === true
    && !empty($delData['deleted_at'])
    && (int) ($delData['deleted_by'] ?? 0) === $moderatorId;
recordResult("DELETE /api/v1/reviews/{id} performs reversible soft-delete with confirmation", $delSuccess);

// Excluded from normal listing
$resListAfterDel = apiRequest('GET', '/api/v1/reviews', [], $moderatorToken);
$activeIds = array_column($resListAfterDel['json']['data'] ?? [], 'id');
recordResult("Soft-deleted review is excluded from normal GET /api/v1/reviews listing", !in_array($review1Id, $activeIds, true));

// Normal detail returns 404
$resShowDel = apiRequest('GET', "/api/v1/reviews/{$review1Id}", [], $moderatorToken);
recordResult("Soft-deleted review returns 404 on normal active detail query", $resShowDel['status'] === 404);

// Verify physical database row and review_media rows still exist in database
$checkRow = $pdo->prepare("SELECT * FROM `reviews` WHERE `id` = :id");
$checkRow->execute([':id' => $review1Id]);
$dbRow = $checkRow->fetch(PDO::FETCH_ASSOC);
$rowPreserved = $dbRow && !empty($dbRow['deleted_at']) && (int) $dbRow['deleted_by'] === $moderatorId
    && $dbRow['customer_name'] === 'Sarah Connor Updated'
    && (int) $dbRow['tour_id'] === $testTourId;
recordResult("Original database row and all fields preserved in DB during soft delete", (bool) $rowPreserved, "Customer Name: " . ($dbRow['customer_name'] ?? 'None'));

// Cannot approve a soft-deleted review
$resAppDel = apiRequest('POST', "/api/v1/reviews/{$review1Id}/approve", [], $moderatorToken);
recordResult("Cannot approve soft-deleted review (404 NOT_FOUND)", $resAppDel['status'] === 404);

// Restore Review 1
$resRestore = apiRequest('POST', "/api/v1/reviews/{$review1Id}/restore", [], $moderatorToken);
$restoredData = $resRestore['json']['data'] ?? [];
$restoredSuccess = $resRestore['status'] === 200
    && (int) ($restoredData['id'] ?? 0) === $review1Id
    && ($restoredData['customer_name'] ?? '') === 'Sarah Connor Updated'
    && empty($restoredData['deleted_at'])
    && empty($restoredData['deleted_by']);
recordResult("POST /api/v1/reviews/{id}/restore restores review with SAME ID and clears deleted_at/by", $restoredSuccess);

// Restored review appears in normal list again
$resListAfterRestore = apiRequest('GET', '/api/v1/reviews', [], $moderatorToken);
$restoredListedIds = array_column($resListAfterRestore['json']['data'] ?? [], 'id');
recordResult("Restored review appears in active listing again", in_array($review1Id, $restoredListedIds, true));

echo PHP_EOL;

// --- 9. Audit Log Event Verification ---
echo "9. Audit Log Event Verification:" . PHP_EOL;

$auditStmt = $pdo->prepare("
    SELECT action, entity_type, entity_id 
    FROM `audit_logs` 
    WHERE `entity_type` = 'review' AND `entity_id` = :id
    ORDER BY `id` ASC
");
$auditStmt->execute([':id' => $review1Id]);
$auditLogs = $auditStmt->fetchAll(PDO::FETCH_ASSOC);
$loggedActions = array_column($auditLogs, 'action');

recordResult("Audit log recorded for 'review_create'", in_array('review_create', $loggedActions, true));
recordResult("Audit log recorded for 'review_update'", in_array('review_update', $loggedActions, true));
recordResult("Audit log recorded for 'review_soft_delete'", in_array('review_soft_delete', $loggedActions, true));
recordResult("Audit log recorded for 'review_restore'", in_array('review_restore', $loggedActions, true));
recordResult("Audit log recorded for 'review_approve'", in_array('review_approve', $loggedActions, true));
recordResult("Audit log recorded for 'review_reject'", in_array('review_reject', $loggedActions, true));
recordResult("Audit log recorded for 'review_feature'", in_array('review_feature', $loggedActions, true));
recordResult("Audit log recorded for 'review_unfeature'", in_array('review_unfeature', $loggedActions, true));

echo PHP_EOL;

// --- 10. System Regressions (Health, Phase 3 Auth, Phase 4 Media, Phase 5 Destinations, Phase 6 Tours, Phase 7 Pages, Phase 8 CMS Sections, Phase 9 Hero Slides, Phase 10 Benefits, Phase 11 Settings, Phase 12 Footer Links, Phase 13 Social Links) ---
echo "10. System Regressions (Health, Phase 3 Auth, Phase 4 Media, Phase 5 Destinations, Phase 6 Tours, Phase 7 Pages, Phase 8 CMS Sections, Phase 9 Hero Slides, Phase 10 Benefits, Phase 11 Settings, Phase 12 Footer Links, Phase 13 Social Links):" . PHP_EOL;

$resHealth = apiRequest('GET', '/api/v1/health');
recordResult("GET /api/v1/health responds with healthy status", $resHealth['status'] === 200 && ($resHealth['json']['data']['status'] ?? '') === 'healthy');

$resDbHealth = apiRequest('GET', '/api/v1/health/database');
recordResult("GET /api/v1/health/database responds with connected status", $resDbHealth['status'] === 200 && ($resDbHealth['json']['data']['status'] ?? '') === 'connected');

$resAuthMe = apiRequest('GET', '/api/v1/auth/me', [], $superAdminToken);
recordResult("GET /api/v1/auth/me responds with super_admin profile", $resAuthMe['status'] === 200 && ($resAuthMe['json']['data']['user']['email'] ?? '') === 'admin@wanderersouthindia.com');

$resMedia = apiRequest('GET', '/api/v1/media', [], $superAdminToken);
recordResult("GET /api/v1/media responds with 200 OK", $resMedia['status'] === 200);

$resDest = apiRequest('GET', '/api/v1/destinations', [], $superAdminToken);
recordResult("GET /api/v1/destinations responds with 200 OK", $resDest['status'] === 200);

$resTours = apiRequest('GET', '/api/v1/tours', [], $superAdminToken);
recordResult("GET /api/v1/tours responds with 200 OK", $resTours['status'] === 200);

$resPages = apiRequest('GET', '/api/v1/pages', [], $superAdminToken);
recordResult("GET /api/v1/pages responds with 200 OK", $resPages['status'] === 200);

$resCmsSec = apiRequest('GET', '/api/v1/cms-sections', [], $superAdminToken);
recordResult("GET /api/v1/cms-sections responds with 200 OK", $resCmsSec['status'] === 200);

$resHeroSlides = apiRequest('GET', '/api/v1/home-hero-slides', [], $superAdminToken);
recordResult("GET /api/v1/home-hero-slides responds with 200 OK", $resHeroSlides['status'] === 200);

$resBenefits = apiRequest('GET', '/api/v1/home-benefits', [], $superAdminToken);
recordResult("GET /api/v1/home-benefits responds with 200 OK", $resBenefits['status'] === 200);

$resSettings = apiRequest('GET', '/api/v1/site-settings', [], $superAdminToken);
recordResult("GET /api/v1/site-settings responds with 200 OK", $resSettings['status'] === 200);

$resFooterLinks = apiRequest('GET', '/api/v1/footer-links', [], $superAdminToken);
recordResult("GET /api/v1/footer-links responds with 200 OK", $resFooterLinks['status'] === 200);

$resSocialLinks = apiRequest('GET', '/api/v1/social-links', [], $superAdminToken);
recordResult("GET /api/v1/social-links responds with 200 OK", $resSocialLinks['status'] === 200);

echo PHP_EOL;

// --- 11. Test Environment Cleanup ---
echo "11. Test Environment Cleanup:" . PHP_EOL;

// Remove test review media and reviews
$pdo->exec("DELETE FROM `review_media` WHERE `review_id` IN ({$review1Id}, {$review2Id})");
$pdo->exec("DELETE FROM `reviews` WHERE `id` IN ({$review1Id}, {$review2Id})");

// Remove audit logs generated during this test
$pdo->exec("DELETE FROM `audit_logs` WHERE `entity_type` = 'review' AND `entity_id` IN ({$review1Id}, {$review2Id})");

// Clean test fixtures
$pdo->exec("DELETE FROM `tours` WHERE `id` = {$testTourId}");
$pdo->exec("DELETE FROM `destinations` WHERE `id` = {$testDestId}");
$pdo->exec("DELETE FROM `media` WHERE `id` = {$testMediaId}");

$pdo->exec("DELETE FROM `user_roles` WHERE `user_id` IN ({$moderatorId}, {$viewerId}, {$editorId})");
$pdo->exec("DELETE FROM `users` WHERE `id` IN ({$moderatorId}, {$viewerId}, {$editorId})");
$pdo->exec("DELETE FROM `role_permissions` WHERE `role_id` = {$viewerRoleId}");
$pdo->exec("DELETE FROM `roles` WHERE `id` = {$viewerRoleId}");

recordResult("All test database records and temporary files cleaned up", true);

echo PHP_EOL . "================================================================================" . PHP_EOL;
echo "  PHASE 14 VERIFICATION RESULTS" . PHP_EOL;
echo "================================================================================" . PHP_EOL;
echo "  Total Tests:  {$totalTests}" . PHP_EOL;
echo "  Passed Tests: {$passedTests}" . PHP_EOL;
echo "  Failed Tests: {$failedTests}" . PHP_EOL;
echo "================================================================================" . PHP_EOL . PHP_EOL;

if ($failedTests > 0) {
    echo "FAILED TESTS:" . PHP_EOL;
    foreach ($testErrors as $err) {
        echo "  - {$err}" . PHP_EOL;
    }
    exit(1);
} else {
    echo "ALL PHASE 14 TESTS PASSED PERFECTLY!" . PHP_EOL . PHP_EOL;
    exit(0);
}
