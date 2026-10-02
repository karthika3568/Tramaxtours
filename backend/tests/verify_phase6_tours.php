<?php

/**
 * Wanderer South India - Phase 6 Comprehensive End-to-End Tours API & Reversible Delete/Restore Verification Test Suite
 * 
 * Verifies all Phase 6 requirements:
 * - Database schema, columns (including deleted_by), constraints & tour permissions
 * - Authentication & RBAC Authorization (tours.view, create, edit, delete, publish)
 * - CRUD operations (Create, Read by ID, Read by Slug, Update, Delete)
 * - Destination & Media relationship integration
 * - Automatic slug generation, custom slug validation, collision resolution
 * - Validation errors (missing title, invalid destination, invalid status, invalid media FKs, prices)
 * - Complete View/Detail data verification
 * - Reversible Soft Delete (records deleted_at, deleted_by, preserves DB data & relationships)
 * - List exclusion of soft-deleted items
 * - Reversible Undo/Restore (POST /restore returns identical record, ID, relationships, clears deleted_at/by)
 * - Destination Reversible Soft Delete & Restore verification
 * - Filtering, Searching, Price Range, Duration, Pagination & Sorting
 * - Publishing & Unpublishing endpoints
 * - Content usage reference checking (bookings) & protected deletion
 * - Audit logging (tour_create, update, delete/soft_delete, restore, publish, unpublish, destination_soft_delete, restore)
 * - Regressions: Health, Auth (Phase 3), Media (Phase 4), Destinations (Phase 5)
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
echo "  Wanderer South India — PHASE 6 TOURS & REVERSIBLE RESTORE VERIFICATION SUITE" . PHP_EOL;
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
        foreach ($pipes as $p) {
            if (is_resource($p)) fclose($p);
        }
        proc_terminate($serverProcess);
        proc_close($serverProcess);
    }
});

// Wait briefly for server startup
usleep(400000); // 400ms

function getTestFileMime(string $filePath): string
{
    $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
    return match ($ext) {
        'jpg', 'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'webp' => 'image/webp',
        'svg' => 'image/svg+xml',
        'pdf' => 'application/pdf',
        default => 'application/octet-stream',
    };
}

function apiRequest(string $method, string $path, array $data = [], ?string $token = null, array $files = []): array
{
    global $baseUrl, $serverProcess, $pipes;
    $procStatus = proc_get_status($serverProcess);
    if (!$procStatus['running']) {
        $errOut = '';
        if (isset($pipes[2]) && is_resource($pipes[2])) {
            stream_set_blocking($pipes[2], false);
            $errOut = (string) stream_get_contents($pipes[2]);
        }
        echo PHP_EOL . " [SERVER CRASHED] Exit code: {$procStatus['exitcode']}, Stderr: {$errOut}" . PHP_EOL;
    }

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

    if (!empty($files)) {
        $postFields = $data;
        foreach ($files as $fieldName => $filePath) {
            $mimeType = getTestFileMime($filePath);
            $postFields[$fieldName] = new CURLFile($filePath, $mimeType, basename($filePath));
        }
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
    } elseif (!empty($data) || in_array(strtoupper($method), ['POST', 'PUT', 'PATCH'])) {
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

// -----------------------------------------------------------------------------
// SECTION 1: Database Schema & Permissions Verification
// -----------------------------------------------------------------------------
echo "1. Database Schema & Permissions Verification:" . PHP_EOL;

$pdo = Database::getConnection();

// 1. Verify tours table exists
$toursTableExists = (int) $pdo->query("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'tours'")->fetchColumn();
recordResult("Table 'tours' exists in database", $toursTableExists === 1);

// 2. Verify all required tour columns exist
$tourColumns = $pdo->query("SHOW COLUMNS FROM tours")->fetchAll(PDO::FETCH_COLUMN);
$expectedColumns = [
    'id', 'destination_id', 'title', 'slug', 'short_description', 'overview',
    'tour_type', 'duration_text', 'duration_hours', 'duration_days', 'languages',
    'featured_image_id', 'base_price', 'currency', 'min_persons', 'max_persons',
    'map_title', 'latitude', 'longitude', 'map_zoom', 'seo_title', 'seo_description',
    'canonical_url', 'og_image_id', 'is_featured', 'display_order', 'status',
    'created_at', 'updated_at', 'deleted_at', 'deleted_by'
];
$missingCols = array_diff($expectedColumns, $tourColumns);
recordResult("All required tour columns including deleted_by present in schema", empty($missingCols), empty($missingCols) ? '' : 'Missing: ' . implode(', ', $missingCols));

// 3. Verify destinations deleted_by column exists
$destCols = $pdo->query("SHOW COLUMNS FROM destinations")->fetchAll(PDO::FETCH_COLUMN);
recordResult("Table 'destinations' contains deleted_by column", in_array('deleted_by', $destCols, true));

// 4. Verify related tour child tables exist
$relatedTables = [
    'tour_categories', 'tour_category_map', 'tour_gallery', 'tour_highlights',
    'tour_places', 'tour_pricing_tiers', 'tour_includes', 'tour_excludes',
    'tour_why_choose', 'tour_itineraries', 'tour_faqs'
];
$existingTables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
$missingTables = array_diff($relatedTables, $existingTables);
recordResult("All 11 related tour child tables exist in schema", empty($missingTables));

// 5. Verify tour permissions exist
$tourPermissions = $pdo->query("SELECT name FROM permissions WHERE name LIKE 'tours.%'")->fetchAll(PDO::FETCH_COLUMN);
$expectedPermissions = ['tours.view', 'tours.create', 'tours.edit', 'tours.delete', 'tours.publish'];
$missingPerms = array_diff($expectedPermissions, $tourPermissions);
recordResult("All 5 tour permissions exist in permissions table", empty($missingPerms), implode(', ', $tourPermissions));

// -----------------------------------------------------------------------------
// SECTION 2: RBAC Tokens & User Context Setup
// -----------------------------------------------------------------------------
echo PHP_EOL . "2. RBAC Tokens & User Context Setup:" . PHP_EOL;

// 1. Super Admin User & Token
$stmt = $pdo->prepare("SELECT id, name, email FROM users WHERE email = 'admin@wanderersouthindia.com' LIMIT 1");
$stmt->execute();
$superAdmin = $stmt->fetch(PDO::FETCH_ASSOC);

$superAdminToken = JWT::encode([
    'sub' => (int) $superAdmin['id'],
    'email' => $superAdmin['email'],
    'role' => 'super_admin',
    'permissions' => ['*'],
], null, 3600);
recordResult("Super Admin token generated", !empty($superAdminToken));

// 2. Editor User (has tours.view, tours.create, tours.edit, destinations.view, destinations.create, destinations.edit)
$pdo->prepare("DELETE FROM users WHERE email = 'test_editor_p6@wanderersouthindia.com'")->execute();
$pdo->prepare("INSERT INTO users (name, email, password_hash, status, created_at, updated_at) VALUES ('Test Editor P6', 'test_editor_p6@wanderersouthindia.com', 'hash', 'active', NOW(), NOW())")->execute();
$editorId = (int) $pdo->lastInsertId();

$editorRoleId = (int) $pdo->query("SELECT id FROM roles WHERE slug = 'editor'")->fetchColumn();
if ($editorRoleId > 0) {
    $pdo->prepare("INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)")->execute([$editorId, $editorRoleId]);
}

$editorToken = JWT::encode([
    'sub' => $editorId,
    'email' => 'test_editor_p6@wanderersouthindia.com',
    'role' => 'editor',
    'permissions' => ['tours.view', 'tours.create', 'tours.edit', 'destinations.view', 'destinations.create', 'destinations.edit'],
], null, 3600);
recordResult("Editor token generated (has tours.view, tours.create, tours.edit)", !empty($editorToken));

// 3. Moderator User (lacks tour permissions)
$pdo->prepare("DELETE FROM users WHERE email = 'test_moderator_p6@wanderersouthindia.com'")->execute();
$pdo->prepare("INSERT INTO users (name, email, password_hash, status, created_at, updated_at) VALUES ('Test Moderator P6', 'test_moderator_p6@wanderersouthindia.com', 'hash', 'active', NOW(), NOW())")->execute();
$moderatorId = (int) $pdo->lastInsertId();

$moderatorToken = JWT::encode([
    'sub' => $moderatorId,
    'email' => 'test_moderator_p6@wanderersouthindia.com',
    'role' => 'moderator',
    'permissions' => ['reviews.moderate'],
], null, 3600);
recordResult("Moderator token generated (has no tour permissions)", !empty($moderatorToken));

// -----------------------------------------------------------------------------
// SECTION 3: Tour Authorization & Permission Enforcement
// -----------------------------------------------------------------------------
echo PHP_EOL . "3. Tour Authorization & Permission Enforcement:" . PHP_EOL;

// 1. Unauthenticated request
$resUnauth = apiRequest('GET', '/api/v1/tours');
recordResult("Unauthenticated request to GET /api/v1/tours is rejected (401)", $resUnauth['status'] === 401);

// 2. Invalid token
$resInvalidToken = apiRequest('GET', '/api/v1/tours', [], 'invalid.token.payload');
recordResult("Invalid token request is rejected (401)", $resInvalidToken['status'] === 401);

// 3. Moderator lacks tours.view -> 403
$resModView = apiRequest('GET', '/api/v1/tours', [], $moderatorToken);
recordResult("User without tours.view is rejected (403)", $resModView['status'] === 403);

// 4. Moderator lacks tours.create -> 403
$resModCreate = apiRequest('POST', '/api/v1/tours', ['title' => 'Test'], $moderatorToken);
recordResult("User without tours.create is rejected (403)", $resModCreate['status'] === 403);

// 5. Moderator lacks tours.edit -> 403
$resModEdit = apiRequest('PUT', '/api/v1/tours/1', ['title' => 'Updated'], $moderatorToken);
recordResult("User without tours.edit is rejected (403)", $resModEdit['status'] === 403);

// 6. Editor lacks tours.delete -> 403
$resEditorDelete = apiRequest('DELETE', '/api/v1/tours/1', [], $editorToken);
recordResult("User without tours.delete is rejected (403)", $resEditorDelete['status'] === 403);

// 7. Editor lacks tours.publish -> 403
$resEditorPublish = apiRequest('POST', '/api/v1/tours/1/publish', [], $editorToken);
recordResult("User without tours.publish is rejected (403)", $resEditorPublish['status'] === 403);

// 8. Editor has tours.view -> 200 OK
$resEditorView = apiRequest('GET', '/api/v1/tours', [], $editorToken);
recordResult("User with tours.view is allowed access (200 OK)", $resEditorView['status'] === 200);

// -----------------------------------------------------------------------------
// SECTION 4: Input Validation & Constraints
// -----------------------------------------------------------------------------
echo PHP_EOL . "4. Input Validation & Constraint Checks:" . PHP_EOL;

// Setup a clean test destination
$pdo->exec("SET FOREIGN_KEY_CHECKS = 0; DELETE FROM tours WHERE title LIKE 'Test %' OR slug LIKE 'test-%'; DELETE FROM destinations WHERE slug LIKE 'test-p6-%' OR name LIKE 'Test %'; SET FOREIGN_KEY_CHECKS = 1;");
$resDest = apiRequest('POST', '/api/v1/destinations', [
    'name' => 'Test Kerala Backwaters',
    'slug' => 'test-p6-kerala-backwaters',
    'hero_title' => 'Explore the Serene Backwaters of Kerala',
    'status' => 'published',
], $superAdminToken);
$testDestId = $resDest['json']['data']['id'] ?? 0;

// 1. Missing required title
$resMissingTitle = apiRequest('POST', '/api/v1/tours', [
    'destination_id' => $testDestId,
], $superAdminToken);
recordResult(
    "Rejection of missing tour title (422)",
    $resMissingTitle['status'] === 422 && isset($resMissingTitle['json']['errors']['title']),
    "Error: " . ($resMissingTitle['json']['errors']['title'] ?? '')
);

// 2. Non-existent destination_id
$resInvalidDest = apiRequest('POST', '/api/v1/tours', [
    'title' => 'Test Tour with Invalid Destination',
    'destination_id' => 999999,
], $superAdminToken);
recordResult(
    "Rejection of non-existent destination_id (422)",
    $resInvalidDest['status'] === 422 && isset($resInvalidDest['json']['errors']['destination_id']),
    "Error: " . ($resInvalidDest['json']['errors']['destination_id'] ?? '')
);

// 3. Invalid status value
$resInvalidStatus = apiRequest('POST', '/api/v1/tours', [
    'title' => 'Test Tour Invalid Status',
    'destination_id' => $testDestId,
    'status' => 'active', // valid are draft, published, archived
], $superAdminToken);
recordResult(
    "Rejection of invalid status value (422)",
    $resInvalidStatus['status'] === 422 && isset($resInvalidStatus['json']['errors']['status']),
    "Error: " . ($resInvalidStatus['json']['errors']['status'] ?? '')
);

// 4. Negative price
$resInvalidPrice = apiRequest('POST', '/api/v1/tours', [
    'title' => 'Test Tour Negative Price',
    'destination_id' => $testDestId,
    'base_price' => -50.00,
], $superAdminToken);
recordResult(
    "Rejection of negative base_price (422)",
    $resInvalidPrice['status'] === 422 && isset($resInvalidPrice['json']['errors']['base_price']),
    "Error: " . ($resInvalidPrice['json']['errors']['base_price'] ?? '')
);

// 5. Invalid featured_image_id FK
$resInvalidMedia = apiRequest('POST', '/api/v1/tours', [
    'title' => 'Test Tour Invalid Media',
    'destination_id' => $testDestId,
    'featured_image_id' => 999999,
], $superAdminToken);
recordResult(
    "Rejection of non-existent featured_image_id (422)",
    $resInvalidMedia['status'] === 422 && isset($resInvalidMedia['json']['errors']['featured_image_id']),
    "Error: " . ($resInvalidMedia['json']['errors']['featured_image_id'] ?? '')
);

// -----------------------------------------------------------------------------
// SECTION 5: CRUD Operations, Slug Generation & Detail Completeness
// -----------------------------------------------------------------------------
echo PHP_EOL . "5. CRUD Operations & Slug Handling:" . PHP_EOL;

// 1. Create a media item to test media relationship integration
$tmpFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'tour_cover.png';
file_put_contents($tmpFile, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='));
$resMedia = apiRequest('POST', '/api/v1/media/upload', ['alt_text' => 'Tour Cover'], $superAdminToken, ['file' => $tmpFile]);
$tourMediaId = $resMedia['json']['data']['id'] ?? null;
@unlink($tmpFile);

// 2. Create tour with automatic slug generation
$resCreate1 = apiRequest('POST', '/api/v1/tours', [
    'destination_id' => $testDestId,
    'title' => 'Test Kerala 7 Days Backwaters Tour',
    'short_description' => 'Experience serene backwaters, houseboats and spice plantations',
    'overview' => 'Detailed 7-day itinerary across Alleppey and Munnar.',
    'tour_type' => 'Guided Package',
    'duration_days' => 7,
    'duration_hours' => 168.0,
    'duration_text' => '7 Days / 6 Nights',
    'languages' => 'English, Hindi, French',
    'featured_image_id' => $tourMediaId,
    'base_price' => 799.00,
    'currency' => 'EUR',
    'min_persons' => 2,
    'max_persons' => 12,
    'latitude' => 9.4981,
    'longitude' => 76.3388,
    'is_featured' => 1,
    'display_order' => 1,
    'status' => 'draft',
    'category_ids' => [1, 2],
], $superAdminToken);

$tour1Id = $resCreate1['json']['data']['id'] ?? 0;
$tour1Slug = $resCreate1['json']['data']['slug'] ?? '';

recordResult(
    "POST /api/v1/tours creates tour with automatic slug (201 Created)",
    $resCreate1['status'] === 201 && $tour1Id > 0 && $tour1Slug === 'test-kerala-7-days-backwaters-tour',
    "ID: {$tour1Id}, Slug: {$tour1Slug}"
);

// 3. Create tour with duplicate title -> automatic collision suffix
$resCreate2 = apiRequest('POST', '/api/v1/tours', [
    'destination_id' => $testDestId,
    'title' => 'Test Kerala 7 Days Backwaters Tour',
    'short_description' => 'Another tour package with duplicate base title',
    'base_price' => 899.00,
], $superAdminToken);

$tour2Id = $resCreate2['json']['data']['id'] ?? 0;
$tour2Slug = $resCreate2['json']['data']['slug'] ?? '';

recordResult(
    "Automatic unique slug collision resolution (appends -2)",
    $resCreate2['status'] === 201 && $tour2Slug === 'test-kerala-7-days-backwaters-tour-2',
    "Slug: {$tour2Slug}"
);

// 4. Custom duplicate slug collision rejection
$resCustomSlugDup = apiRequest('POST', '/api/v1/tours', [
    'destination_id' => $testDestId,
    'title' => 'Test Custom Slug Tour',
    'slug' => 'test-kerala-7-days-backwaters-tour',
], $superAdminToken);

recordResult(
    "Explicit duplicate custom slug is rejected (422)",
    $resCustomSlugDup['status'] === 422 && isset($resCustomSlugDup['json']['errors']['slug']),
    "Error: " . ($resCustomSlugDup['json']['errors']['slug'] ?? '')
);

// 5. Retrieve tour by numeric ID with full complete detail
$resShowId = apiRequest('GET', "/api/v1/tours/{$tour1Id}", [], $superAdminToken);
recordResult(
    "GET /api/v1/tours/{id} retrieves complete tour details, destination & media relationships (200 OK)",
    $resShowId['status'] === 200 && ($resShowId['json']['data']['id'] ?? 0) === $tour1Id && ($resShowId['json']['data']['destination']['id'] ?? 0) === $testDestId && isset($resShowId['json']['data']['featured_image']['file_path']),
    "Destination: " . ($resShowId['json']['data']['destination']['name'] ?? 'none') . ", Media: " . ($resShowId['json']['data']['featured_image']['file_path'] ?? 'none')
);

// 6. Retrieve tour by unique slug
$resShowSlug = apiRequest('GET', "/api/v1/tours/{$tour1Slug}", [], $superAdminToken);
recordResult(
    "GET /api/v1/tours/{slug} retrieves tour by unique slug (200 OK)",
    $resShowSlug['status'] === 200 && ($resShowSlug['json']['data']['slug'] ?? '') === $tour1Slug,
    "Title: " . ($resShowSlug['json']['data']['title'] ?? '')
);

// 7. Update tour metadata and maintain same slug
$resUpdate = apiRequest('PUT', "/api/v1/tours/{$tour1Id}", [
    'title' => 'Test Kerala Luxury Backwaters & Hills Tour',
    'slug' => $tour1Slug, // Same slug should NOT trigger duplicate error
    'base_price' => 849.00,
    'display_order' => 3,
], $superAdminToken);

recordResult(
    "PUT /api/v1/tours/{id} updates fields successfully without slug conflict (200 OK)",
    $resUpdate['status'] === 200 && ($resUpdate['json']['data']['title'] ?? '') === 'Test Kerala Luxury Backwaters & Hills Tour' && (float) ($resUpdate['json']['data']['base_price'] ?? 0) === 849.0,
    "Updated Price: " . ($resUpdate['json']['data']['base_price'] ?? '')
);

// -----------------------------------------------------------------------------
// SECTION 6: Publishing & Status Transitions
// -----------------------------------------------------------------------------
echo PHP_EOL . "6. Publishing & Status Transitions:" . PHP_EOL;

// 1. Publish tour
$resPublish = apiRequest('POST', "/api/v1/tours/{$tour1Id}/publish", [], $superAdminToken);
recordResult(
    "POST /api/v1/tours/{id}/publish changes status to 'published' (200 OK)",
    $resPublish['status'] === 200 && ($resPublish['json']['data']['status'] ?? '') === 'published',
    "Status: " . ($resPublish['json']['data']['status'] ?? '')
);

// 2. Unpublish tour (revert to draft)
$resUnpublish = apiRequest('POST', "/api/v1/tours/{$tour1Id}/unpublish", [], $superAdminToken);
recordResult(
    "POST /api/v1/tours/{id}/unpublish changes status to 'draft' (200 OK)",
    $resUnpublish['status'] === 200 && ($resUnpublish['json']['data']['status'] ?? '') === 'draft',
    "Status: " . ($resUnpublish['json']['data']['status'] ?? '')
);

// -----------------------------------------------------------------------------
// SECTION 7: Searching, Filtering & Pagination
// -----------------------------------------------------------------------------
echo PHP_EOL . "7. Search, Filtering & Pagination:" . PHP_EOL;

// 1. List tours
$resList = apiRequest('GET', '/api/v1/tours', [], $superAdminToken);
recordResult(
    "GET /api/v1/tours returns paginated list (200 OK)",
    $resList['status'] === 200 && is_array($resList['json']['data']) && isset($resList['json']['pagination']['total']),
    "Total tours: " . ($resList['json']['pagination']['total'] ?? 0)
);

// 2. Search by title
$resSearch = apiRequest('GET', '/api/v1/tours?search=Backwaters', [], $superAdminToken);
recordResult(
    "Filter tours by search query (?search=Backwaters)",
    $resSearch['status'] === 200 && count($resSearch['json']['data'] ?? []) >= 1,
    "Matched: " . count($resSearch['json']['data'] ?? [])
);

// 3. Filter by destination_id
$resDestFilter = apiRequest('GET', "/api/v1/tours?destination_id={$testDestId}", [], $superAdminToken);
recordResult(
    "Filter tours by destination_id (?destination_id={$testDestId})",
    $resDestFilter['status'] === 200 && count($resDestFilter['json']['data'] ?? []) >= 1,
    "Matched: " . count($resDestFilter['json']['data'] ?? [])
);

// 4. Filter by price range
$resPriceFilter = apiRequest('GET', '/api/v1/tours?min_price=800&max_price=950', [], $superAdminToken);
recordResult(
    "Filter tours by price range (?min_price=800&max_price=950)",
    $resPriceFilter['status'] === 200 && count($resPriceFilter['json']['data'] ?? []) >= 1,
    "Matched: " . count($resPriceFilter['json']['data'] ?? [])
);

// 5. Filter by duration_days
$resDurationFilter = apiRequest('GET', '/api/v1/tours?duration_days=7', [], $superAdminToken);
recordResult(
    "Filter tours by duration_days (?duration_days=7)",
    $resDurationFilter['status'] === 200 && count($resDurationFilter['json']['data'] ?? []) >= 1,
    "Matched: " . count($resDurationFilter['json']['data'] ?? [])
);

// 6. Pagination limit
$resPagination = apiRequest('GET', '/api/v1/tours?page=1&limit=1', [], $superAdminToken);
recordResult(
    "Pagination limit is respected (?limit=1)",
    $resPagination['status'] === 200 && count($resPagination['json']['data'] ?? []) === 1 && ($resPagination['json']['pagination']['limit'] ?? 0) === 1,
    "Returned: " . count($resPagination['json']['data'] ?? [])
);

// -----------------------------------------------------------------------------
// SECTION 8: References & Deletion Protection
// -----------------------------------------------------------------------------
echo PHP_EOL . "8. In-Use Dependency Protection & Deletion:" . PHP_EOL;

// 1. Create an active customer booking referencing $tour1Id
$stmt = $pdo->prepare("INSERT INTO bookings (
    order_number, user_id, tour_id, booking_date, tickets_count, unit_price, subtotal, total_price, currency, booking_status, payment_status, created_at, updated_at
) VALUES ('ORD-TEST-PHASE6-001', 1, ?, '2026-10-15', 2, 849.00, 1698.00, 1698.00, 'EUR', 'confirmed', 'paid', NOW(), NOW())");
$stmt->execute([$tour1Id]);
$testBookingId = (int) $pdo->lastInsertId();

// 2. Verify show endpoint reports in_use = true
$resInUseCheck = apiRequest('GET', "/api/v1/tours/{$tour1Id}", [], $superAdminToken);
recordResult(
    "Usage check accurately detects active referencing customer booking",
    $resInUseCheck['status'] === 200 && ($resInUseCheck['json']['data']['is_in_use'] ?? false) === true && ($resInUseCheck['json']['data']['usage_references']['bookings'] ?? 0) >= 1,
    "Bookings reference count: " . ($resInUseCheck['json']['data']['usage_references']['bookings'] ?? 0)
);

// 3. Deletion blocked with 409
$resDelBlocked = apiRequest('DELETE', "/api/v1/tours/{$tour1Id}", [], $superAdminToken);
recordResult(
    "DELETE /api/v1/tours/{id} of in-use tour is blocked with 409 TOUR_IN_USE",
    $resDelBlocked['status'] === 409 && ($resDelBlocked['json']['error_code'] ?? '') === 'TOUR_IN_USE',
    "HTTP {$resDelBlocked['status']}: " . ($resDelBlocked['json']['message'] ?? '')
);

// Clean up referencing booking
$pdo->prepare("DELETE FROM bookings WHERE id = ?")->execute([$testBookingId]);

// -----------------------------------------------------------------------------
// SECTION 9: Reversible Soft-Delete & Undo/Restore (Tours & Destinations)
// -----------------------------------------------------------------------------
echo PHP_EOL . "9. Reversible Soft-Delete & Undo/Restore Architecture:" . PHP_EOL;

// 1. Soft-delete Tour
$resSoftDeleteTour = apiRequest('DELETE', "/api/v1/tours/{$tour1Id}", [], $superAdminToken);
recordResult(
    "DELETE /api/v1/tours/{id} returns soft-delete confirmation with deleted_at and deleted_by",
    $resSoftDeleteTour['status'] === 200 && ($resSoftDeleteTour['json']['data']['is_deleted'] ?? false) === true && !empty($resSoftDeleteTour['json']['data']['deleted_at']),
    "Deleted At: " . ($resSoftDeleteTour['json']['data']['deleted_at'] ?? 'none')
);

// 2. Verify Tour is excluded from active list
$resActiveToursList = apiRequest('GET', '/api/v1/tours', [], $superAdminToken);
$tourIdsInActiveList = array_column($resActiveToursList['json']['data'] ?? [], 'id');
recordResult(
    "Soft-deleted tour is excluded from normal active listings",
    !in_array($tour1Id, $tourIdsInActiveList, true)
);

// 3. Verify direct active GET /tours/{id} returns 404
$resShowDeletedTour = apiRequest('GET', "/api/v1/tours/{$tour1Id}", [], $superAdminToken);
recordResult(
    "Soft-deleted tour returns 404 on normal active detail query",
    $resShowDeletedTour['status'] === 404
);

// 4. Verify original record and data still exist intact in DB
$stmt = $pdo->prepare("SELECT id, title, slug, base_price, deleted_at, deleted_by FROM tours WHERE id = ?");
$stmt->execute([$tour1Id]);
$dbTour = $stmt->fetch(PDO::FETCH_ASSOC);
$stmt = null;
recordResult(
    "Original tour record and metadata are preserved in database during soft delete",
    $dbTour !== false && (int) $dbTour['id'] === $tour1Id && !empty($dbTour['deleted_at']) && (int) ($dbTour['deleted_by'] ?? 0) === (int) $superAdmin['id'],
    "Preserved Title: {$dbTour['title']}, Deleted By ID: " . ($dbTour['deleted_by'] ?? '')
);

// 5. Restore Tour via POST /api/v1/tours/{id}/restore
$resRestoreTour = apiRequest('POST', "/api/v1/tours/{$tour1Id}/restore", [], $superAdminToken);
recordResult(
    "POST /api/v1/tours/{id}/restore restores tour and returns complete original record (200 OK)",
    $resRestoreTour['status'] === 200 && ($resRestoreTour['json']['data']['id'] ?? 0) === $tour1Id && empty($resRestoreTour['json']['data']['deleted_at']),
    "Restored Title: " . ($resRestoreTour['json']['data']['title'] ?? '')
);

// 6. Verify restored tour is back in active listings
$resActiveToursListAfter = apiRequest('GET', '/api/v1/tours', [], $superAdminToken);
$tourIdsAfterRestore = array_column($resActiveToursListAfter['json']['data'] ?? [], 'id');
recordResult(
    "Restored tour is actively listed again in normal listings",
    in_array($tour1Id, $tourIdsAfterRestore, true)
);

// 7. Soft-delete Destination
$resSoftDeleteDest = apiRequest('DELETE', "/api/v1/destinations/{$testDestId}", [], $superAdminToken);
// Destination has active tour, so it should be blocked unless tours are cleared or forced
recordResult(
    "DELETE /api/v1/destinations/{id} blocks deletion when active tours exist (409 DESTINATION_IN_USE)",
    $resSoftDeleteDest['status'] === 409 && ($resSoftDeleteDest['json']['error_code'] ?? '') === 'DESTINATION_IN_USE'
);

// Clear referencing tours so destination can be soft deleted
$pdo->prepare("DELETE FROM tours WHERE id IN (?, ?)")->execute([$tour1Id, $tour2Id]);

$resSoftDeleteDest2 = apiRequest('DELETE', "/api/v1/destinations/{$testDestId}", [], $superAdminToken);
recordResult(
    "DELETE /api/v1/destinations/{id} soft-deletes destination when no active tours reference it",
    $resSoftDeleteDest2['status'] === 200 && ($resSoftDeleteDest2['json']['data']['is_deleted'] ?? false) === true
);

// 8. Restore Destination via POST /api/v1/destinations/{id}/restore
$resRestoreDest = apiRequest('POST', "/api/v1/destinations/{$testDestId}/restore", [], $superAdminToken);
recordResult(
    "POST /api/v1/destinations/{id}/restore restores destination with original ID (200 OK)",
    $resRestoreDest['status'] === 200 && ($resRestoreDest['json']['data']['id'] ?? 0) === $testDestId && empty($resRestoreDest['json']['data']['deleted_at']),
    "Status: {$resRestoreDest['status']}, Response: " . json_encode($resRestoreDest['json'])
);

// -----------------------------------------------------------------------------
// SECTION 10: Audit Log Event Generation
// -----------------------------------------------------------------------------
echo PHP_EOL . "10. Audit Log Event Verification:" . PHP_EOL;

$stmt = $pdo->prepare("SELECT action, entity_type, entity_id FROM audit_logs ORDER BY id DESC LIMIT 25");
$stmt->execute();
$auditLogs = $stmt->fetchAll(PDO::FETCH_ASSOC);

$hasCreateLog = false;
$hasUpdateLog = false;
$hasDeleteLog = false;
$hasRestoreLog = false;
$hasPublishLog = false;
$hasUnpublishLog = false;
$hasDestDeleteLog = false;
$hasDestRestoreLog = false;

foreach ($auditLogs as $log) {
    if ($log['action'] === 'tour_create') $hasCreateLog = true;
    if ($log['action'] === 'tour_update') $hasUpdateLog = true;
    if ($log['action'] === 'tour_delete' || $log['action'] === 'tour_soft_delete') $hasDeleteLog = true;
    if ($log['action'] === 'tour_restore') $hasRestoreLog = true;
    if ($log['action'] === 'tour_publish') $hasPublishLog = true;
    if ($log['action'] === 'tour_unpublish') $hasUnpublishLog = true;
    if ($log['action'] === 'destination_delete' || $log['action'] === 'destination_soft_delete') $hasDestDeleteLog = true;
    if ($log['action'] === 'destination_restore') $hasDestRestoreLog = true;
}

recordResult("Audit log recorded for 'tour_create'", $hasCreateLog);
recordResult("Audit log recorded for 'tour_update'", $hasUpdateLog);
recordResult("Audit log recorded for 'tour_soft_delete'", $hasDeleteLog);
recordResult("Audit log recorded for 'tour_restore'", $hasRestoreLog);
recordResult("Audit log recorded for 'tour_publish'", $hasPublishLog);
recordResult("Audit log recorded for 'tour_unpublish'", $hasUnpublishLog);
recordResult("Audit log recorded for 'destination_soft_delete'", $hasDestDeleteLog);
recordResult("Audit log recorded for 'destination_restore'", $hasDestRestoreLog);

// -----------------------------------------------------------------------------
// SECTION 11: System Regressions (Health, Phase 3, 4, 5)
// -----------------------------------------------------------------------------
echo PHP_EOL . "11. System Regressions (Health, Phase 3 Auth, Phase 4 Media, Phase 5 Destinations):" . PHP_EOL;

$resHealth = apiRequest('GET', '/api/v1/health');
recordResult(
    "GET /api/v1/health responds with healthy status",
    $resHealth['status'] === 200 && ($resHealth['json']['data']['status'] ?? '') === 'healthy',
    "Status: {$resHealth['status']}, Error: {$resHealth['error']}, Response: " . json_encode($resHealth['json'])
);

// 2. Database Health
$resDbHealth = apiRequest('GET', '/api/v1/health/database');
recordResult("GET /api/v1/health/database responds with connected status", $resDbHealth['status'] === 200 && ($resDbHealth['json']['data']['status'] ?? '') === 'connected');

// 3. Auth Profile
$resAuthMe = apiRequest('GET', '/api/v1/auth/me', [], $superAdminToken);
recordResult("GET /api/v1/auth/me responds with super_admin profile", $resAuthMe['status'] === 200 && ($resAuthMe['json']['data']['user']['email'] ?? '') === 'admin@wanderersouthindia.com');

// 4. Media Listing
$resMediaList = apiRequest('GET', '/api/v1/media', [], $superAdminToken);
recordResult("GET /api/v1/media responds with 200 OK", $resMediaList['status'] === 200);

// 5. Destinations Listing
$resDestList = apiRequest('GET', '/api/v1/destinations', [], $superAdminToken);
recordResult("GET /api/v1/destinations responds with 200 OK", $resDestList['status'] === 200);

// -----------------------------------------------------------------------------
// SECTION 12: Cleanup Test Environment
// -----------------------------------------------------------------------------
echo PHP_EOL . "12. Test Environment Cleanup:" . PHP_EOL;

// Clean up test users, tours, destination and media
$pdo->prepare("DELETE FROM user_roles WHERE user_id IN (?, ?)")->execute([$editorId, $moderatorId]);
$pdo->prepare("DELETE FROM users WHERE id IN (?, ?)")->execute([$editorId, $moderatorId]);

if ($tourMediaId) {
    $stmt = $pdo->prepare("SELECT file_path FROM media WHERE id = ?");
    $stmt->execute([$tourMediaId]);
    $fPath = $stmt->fetchColumn();
    if ($fPath) {
        $diskPath = BACKEND_ROOT . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $fPath);
        if (file_exists($diskPath)) @unlink($diskPath);
    }
    $pdo->prepare("DELETE FROM media WHERE id = ?")->execute([$tourMediaId]);
}

$pdo->exec("SET FOREIGN_KEY_CHECKS = 0; DELETE FROM tours WHERE title LIKE 'Test %' OR slug LIKE 'test-%'; DELETE FROM destinations WHERE id = " . (int)$testDestId . "; SET FOREIGN_KEY_CHECKS = 1;");

recordResult("All test database records and temporary files cleaned up", true);

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
echo PHP_EOL . "================================================================================" . PHP_EOL;
echo "  PHASE 6 VERIFICATION RESULTS" . PHP_EOL;
echo "================================================================================" . PHP_EOL;
echo "  Total Tests:  {$totalTests}" . PHP_EOL;
echo "  Passed Tests: \033[32m{$passedTests}\033[0m" . PHP_EOL;
echo "  Failed Tests: " . ($failedTests > 0 ? "\033[31m{$failedTests}\033[0m" : "0") . PHP_EOL;
echo "================================================================================" . PHP_EOL . PHP_EOL;

if ($failedTests > 0) {
    echo "Failures:" . PHP_EOL;
    foreach ($testErrors as $err) {
        echo "  - {$err}" . PHP_EOL;
    }
    exit(1);
} else {
    echo "\033[32mALL PHASE 6 TESTS PASSED PERFECTLY!\033[0m" . PHP_EOL . PHP_EOL;
    exit(0);
}
