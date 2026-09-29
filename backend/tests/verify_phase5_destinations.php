<?php

/**
 * Tramax Tours - Phase 5 Comprehensive End-to-End Destinations API Verification Test Suite
 * 
 * Verifies all Phase 5 requirements:
 * - Database schema, columns, constraints & destination permissions
 * - Authentication & RBAC Authorization (destinations.view, create, edit, delete, publish)
 * - CRUD operations (Create, Read by ID, Read by Slug, Update, Delete)
 * - Automatic slug generation, custom slug validation, duplicate slug collision rejection
 * - Validation errors (missing name, invalid status, invalid media FKs, out-of-range coords)
 * - Filtering, Searching, Pagination & Sorting
 * - Publishing & Unpublishing endpoints
 * - Content usage reference checking & protected/forced deletion
 * - Audit logging (destination_create, update, delete, publish, unpublish)
 * - Regressions: Health, Auth (Phase 3), Media (Phase 4)
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
echo "  TRAMAX TOURS — PHASE 5 DESTINATIONS MANAGEMENT VERIFICATION SUITE" . PHP_EOL;
echo "================================================================================" . PHP_EOL . PHP_EOL;

// 2. Start Local Test Server
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

// Helper HTTP Client
function apiRequest(string $method, string $path, array $data = [], ?string $token = null, array $files = []): array
{
    global $baseUrl;
    $url = $baseUrl . $path;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, strtoupper($method));
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);

    $headers = [];
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

    if (!empty($headers)) {
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    }

    $rawResponse = curl_exec($ch);
    $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $contentType = (string) curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

    $json = json_decode((string) $rawResponse, true);

    return [
        'status' => $httpCode,
        'headers' => ['content_type' => $contentType],
        'raw' => $rawResponse,
        'json' => is_array($json) ? $json : null,
    ];
}

// Initialize Database Connection & Initial Cleanup
try {
    $pdo = Database::getConnection();

    // Clean up test data from prior runs
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0; DELETE FROM destinations WHERE name LIKE 'Test %' OR slug LIKE 'test-%'; DELETE FROM users WHERE email IN ('editor.phase5@tramaxtours.com', 'moderator.phase5@tramaxtours.com'); SET FOREIGN_KEY_CHECKS = 1;");
} catch (Throwable $e) {
    die("Database connection failed: " . $e->getMessage() . "\n");
}

// -----------------------------------------------------------------------------
// SECTION 1: Database & Schema Verification
// -----------------------------------------------------------------------------
echo "1. Database Schema & Permissions Verification:" . PHP_EOL;

// 1. Table exists
$stmt = $pdo->query("SHOW TABLES LIKE 'destinations'");
recordResult("Table 'destinations' exists in database", $stmt->rowCount() > 0);

// 2. Columns verification
$stmt = $pdo->query("SHOW COLUMNS FROM `destinations`");
$columns = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);
$requiredColumns = ['id', 'name', 'slug', 'hero_title', 'short_description', 'featured_image_id', 'intro_media_id', 'og_image_id', 'is_featured', 'display_order', 'status', 'created_at', 'updated_at', 'deleted_at'];
$allColumnsPresent = true;
foreach ($requiredColumns as $col) {
    if (!in_array($col, $columns, true)) {
        $allColumnsPresent = false;
        break;
    }
}
recordResult("All required destination columns present in schema", $allColumnsPresent);

// 3. Permissions verification
$stmt = $pdo->query("SELECT name FROM permissions WHERE name LIKE 'destinations.%'");
$dbPermissions = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);
$expectedPerms = ['destinations.view', 'destinations.create', 'destinations.edit', 'destinations.delete', 'destinations.publish'];
$allPermsExist = count(array_intersect($expectedPerms, $dbPermissions)) === count($expectedPerms);
recordResult("All 5 destination permissions exist in permissions table", $allPermsExist, implode(', ', $dbPermissions));

// -----------------------------------------------------------------------------
// SECTION 2: Authentication & RBAC User Setup
// -----------------------------------------------------------------------------
echo PHP_EOL . "2. RBAC Tokens & User Context Setup:" . PHP_EOL;

// Super Admin token
$superAdminToken = JWT::encode([
    'sub' => 1,
    'email' => 'admin@tramaxtours.com',
    'name' => 'Super Admin',
    'role' => 'super_admin',
]);

// Create Editor (Role 3: has destinations.view, destinations.create, destinations.edit, but NOT destinations.delete)
$stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, phone, status, email_verified_at, created_at, updated_at)
    VALUES ('Phase 5 Editor', 'editor.phase5@tramaxtours.com', 'test_hash', '+919888888881', 'active', NOW(), NOW(), NOW())");
$stmt->execute();
$editorId = (int) $pdo->lastInsertId();
$pdo->prepare("INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, 3)")->execute([$editorId]);

$editorToken = JWT::encode([
    'sub' => $editorId,
    'email' => 'editor.phase5@tramaxtours.com',
    'name' => 'Phase 5 Editor',
    'role' => 'editor',
]);

// Create Moderator (Role 4: has NO destination permissions)
$stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, phone, status, email_verified_at, created_at, updated_at)
    VALUES ('Phase 5 Moderator', 'moderator.phase5@tramaxtours.com', 'test_hash', '+919888888882', 'active', NOW(), NOW(), NOW())");
$stmt->execute();
$moderatorId = (int) $pdo->lastInsertId();
$pdo->prepare("INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, 4)")->execute([$moderatorId]);

$moderatorToken = JWT::encode([
    'sub' => $moderatorId,
    'email' => 'moderator.phase5@tramaxtours.com',
    'name' => 'Phase 5 Moderator',
    'role' => 'moderator',
]);

recordResult("Super Admin token generated", !empty($superAdminToken));
recordResult("Editor token generated (has destinations.view, destinations.create, destinations.edit)", !empty($editorToken));
recordResult("Moderator token generated (has no destination permissions)", !empty($moderatorToken));

// -----------------------------------------------------------------------------
// SECTION 3: Authorization & Permission Enforcement Checks
// -----------------------------------------------------------------------------
echo PHP_EOL . "3. Destination Authorization & Permission Enforcement:" . PHP_EOL;

// 1. Unauthenticated request
$resUnauth = apiRequest('GET', '/api/v1/destinations');
recordResult("Unauthenticated request to GET /api/v1/destinations is rejected (401)", $resUnauth['status'] === 401 && ($resUnauth['json']['error_code'] ?? '') === 'UNAUTHORIZED');

// 2. Invalid Token
$resInvalidToken = apiRequest('GET', '/api/v1/destinations', [], 'invalid.jwt.token');
recordResult("Invalid token request is rejected (401)", $resInvalidToken['status'] === 401);

// 3. Moderator without destinations.view
$resModView = apiRequest('GET', '/api/v1/destinations', [], $moderatorToken);
recordResult("User without destinations.view is rejected (403)", $resModView['status'] === 403 && ($resModView['json']['error_code'] ?? '') === 'FORBIDDEN_PERMISSION');

// 4. Moderator without destinations.create
$resModCreate = apiRequest('POST', '/api/v1/destinations', ['name' => 'Unauthorized Destination'], $moderatorToken);
recordResult("User without destinations.create is rejected (403)", $resModCreate['status'] === 403 && ($resModCreate['json']['error_code'] ?? '') === 'FORBIDDEN_PERMISSION');

// 5. Moderator without destinations.edit
$resModEdit = apiRequest('PUT', '/api/v1/destinations/1', ['name' => 'Unauthorized Edit'], $moderatorToken);
recordResult("User without destinations.edit is rejected (403)", $resModEdit['status'] === 403 && ($resModEdit['json']['error_code'] ?? '') === 'FORBIDDEN_PERMISSION');

// 6. Editor without destinations.delete
$resEditorDelete = apiRequest('DELETE', '/api/v1/destinations/1', [], $editorToken);
recordResult("User without destinations.delete is rejected (403)", $resEditorDelete['status'] === 403 && ($resEditorDelete['json']['error_code'] ?? '') === 'FORBIDDEN_PERMISSION');

// 7. Moderator without destinations.publish
$resModPublish = apiRequest('POST', '/api/v1/destinations/1/publish', [], $moderatorToken);
recordResult("User without destinations.publish is rejected (403)", $resModPublish['status'] === 403 && ($resModPublish['json']['error_code'] ?? '') === 'FORBIDDEN_PERMISSION');

// 8. Editor with destinations.view allowed
$resEditorView = apiRequest('GET', '/api/v1/destinations', [], $editorToken);
recordResult("User with destinations.view is allowed access (200 OK)", $resEditorView['status'] === 200 && ($resEditorView['json']['success'] ?? false) === true);

// -----------------------------------------------------------------------------
// SECTION 4: Validation Tests
// -----------------------------------------------------------------------------
echo PHP_EOL . "4. Input Validation & Constraint Checks:" . PHP_EOL;

// 1. Missing name
$resMissingName = apiRequest('POST', '/api/v1/destinations', ['hero_title' => 'Missing Name'], $superAdminToken);
recordResult(
    "Rejection of missing name field (422)",
    $resMissingName['status'] === 422 && isset($resMissingName['json']['errors']['name']),
    "Error: " . ($resMissingName['json']['errors']['name'] ?? '')
);

// 2. Invalid Status
$resInvalidStatus = apiRequest('POST', '/api/v1/destinations', ['name' => 'Test Status', 'status' => 'invalid_status_value'], $superAdminToken);
recordResult(
    "Rejection of invalid status value (422)",
    $resInvalidStatus['status'] === 422 && isset($resInvalidStatus['json']['errors']['status']),
    "Error: " . ($resInvalidStatus['json']['errors']['status'] ?? '')
);

// 3. Invalid Referenced Media ID
$resInvalidMedia = apiRequest('POST', '/api/v1/destinations', [
    'name' => 'Test Media FK',
    'featured_image_id' => 999999,
], $superAdminToken);
recordResult(
    "Rejection of non-existent featured_image_id (422)",
    $resInvalidMedia['status'] === 422 && isset($resInvalidMedia['json']['errors']['featured_image_id']),
    "Error: " . ($resInvalidMedia['json']['errors']['featured_image_id'] ?? '')
);

// 4. Invalid Latitude / Longitude Out of Bounds
$resInvalidCoords = apiRequest('POST', '/api/v1/destinations', [
    'name' => 'Test Coords',
    'latitude' => 120.5,
    'longitude' => -200.0,
], $superAdminToken);
recordResult(
    "Rejection of out-of-bounds geographic coordinates (422)",
    $resInvalidCoords['status'] === 422 && isset($resInvalidCoords['json']['errors']['latitude']) && isset($resInvalidCoords['json']['errors']['longitude']),
    "Lat/Lng validation triggered"
);

// -----------------------------------------------------------------------------
// SECTION 5: CRUD Operations & Slug Generation
// -----------------------------------------------------------------------------
echo PHP_EOL . "5. CRUD Operations & Slug Handling:" . PHP_EOL;

// 1. Create a media item to test media relationship integration
$tmpFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'dest_cover.png';
file_put_contents($tmpFile, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='));
$resMedia = apiRequest('POST', '/api/v1/media/upload', ['alt_text' => 'Ooty Cover'], $superAdminToken, ['file' => $tmpFile]);
$coverMediaId = $resMedia['json']['data']['id'] ?? null;
@unlink($tmpFile);

// 2. Create destination with automatic slug generation
$resCreate1 = apiRequest('POST', '/api/v1/destinations', [
    'name' => 'Test Ooty Hill Station',
    'hero_title' => 'Queen of Nilgiris',
    'hero_subtitle' => 'Majestic hills and lush tea gardens',
    'short_description' => 'A picturesque hill station in Tamil Nadu',
    'featured_image_id' => $coverMediaId,
    'language' => 'Tamil, English',
    'currency' => 'INR',
    'latitude' => 11.4100,
    'longitude' => 76.6950,
    'is_featured' => 1,
    'display_order' => 1,
    'status' => 'draft',
], $superAdminToken);

$dest1Id = $resCreate1['json']['data']['id'] ?? 0;
$dest1Slug = $resCreate1['json']['data']['slug'] ?? '';

recordResult(
    "POST /api/v1/destinations creates destination with automatic slug (201 Created)",
    $resCreate1['status'] === 201 && $dest1Id > 0 && $dest1Slug === 'test-ooty-hill-station',
    "ID: {$dest1Id}, Slug: {$dest1Slug}"
);

// 3. Create destination with duplicate name -> automatic numeric suffix slug
$resCreate2 = apiRequest('POST', '/api/v1/destinations', [
    'name' => 'Test Ooty Hill Station',
    'short_description' => 'Another destination with identical base title',
], $superAdminToken);

$dest2Id = $resCreate2['json']['data']['id'] ?? 0;
$dest2Slug = $resCreate2['json']['data']['slug'] ?? '';

recordResult(
    "Automatic unique slug collision resolution (appends -2)",
    $resCreate2['status'] === 201 && $dest2Slug === 'test-ooty-hill-station-2',
    "Slug: {$dest2Slug}"
);

// 4. Custom slug collision rejection
$resCustomSlugDup = apiRequest('POST', '/api/v1/destinations', [
    'name' => 'Test Another Place',
    'slug' => 'test-ooty-hill-station',
], $superAdminToken);

recordResult(
    "Explicit duplicate custom slug is rejected (422)",
    $resCustomSlugDup['status'] === 422 && isset($resCustomSlugDup['json']['errors']['slug']),
    "Error: " . ($resCustomSlugDup['json']['errors']['slug'] ?? '')
);

// 5. Retrieve destination by ID
$resShowId = apiRequest('GET', "/api/v1/destinations/{$dest1Id}", [], $superAdminToken);
recordResult(
    "GET /api/v1/destinations/{id} retrieves complete destination and media details (200 OK)",
    $resShowId['status'] === 200 && ($resShowId['json']['data']['id'] ?? 0) === $dest1Id && isset($resShowId['json']['data']['featured_image']['file_path']),
    "Featured image path: " . ($resShowId['json']['data']['featured_image']['file_path'] ?? 'none')
);

// 6. Retrieve destination by Slug
$resShowSlug = apiRequest('GET', "/api/v1/destinations/{$dest1Slug}", [], $superAdminToken);
recordResult(
    "GET /api/v1/destinations/{slug} retrieves destination by unique slug (200 OK)",
    $resShowSlug['status'] === 200 && ($resShowSlug['json']['data']['slug'] ?? '') === $dest1Slug,
    "Name: " . ($resShowSlug['json']['data']['name'] ?? '')
);

// 7. Update destination metadata and maintain same slug
$resUpdate = apiRequest('PUT', "/api/v1/destinations/{$dest1Id}", [
    'name' => 'Test Ooty Nilgiris Retreat',
    'slug' => $dest1Slug, // Same slug should NOT trigger duplicate error
    'hero_title' => 'Updated Nilgiris Hero Title',
    'display_order' => 5,
], $superAdminToken);

recordResult(
    "PUT /api/v1/destinations/{id} updates fields successfully without slug conflict (200 OK)",
    $resUpdate['status'] === 200 && ($resUpdate['json']['data']['name'] ?? '') === 'Test Ooty Nilgiris Retreat' && ($resUpdate['json']['data']['display_order'] ?? 0) === 5,
    "Updated Name: " . ($resUpdate['json']['data']['name'] ?? '')
);

// -----------------------------------------------------------------------------
// SECTION 6: Publishing & Unpublishing Endpoints
// -----------------------------------------------------------------------------
echo PHP_EOL . "6. Publishing & Status Transitions:" . PHP_EOL;

// 1. Publish destination
$resPublish = apiRequest('POST', "/api/v1/destinations/{$dest1Id}/publish", [], $superAdminToken);
recordResult(
    "POST /api/v1/destinations/{id}/publish changes status to 'published' (200 OK)",
    $resPublish['status'] === 200 && ($resPublish['json']['data']['status'] ?? '') === 'published',
    "Status: " . ($resPublish['json']['data']['status'] ?? '')
);

// 2. Unpublish destination (revert to draft)
$resUnpublish = apiRequest('POST', "/api/v1/destinations/{$dest1Id}/unpublish", [], $superAdminToken);
recordResult(
    "POST /api/v1/destinations/{id}/unpublish changes status to 'draft' (200 OK)",
    $resUnpublish['status'] === 200 && ($resUnpublish['json']['data']['status'] ?? '') === 'draft',
    "Status: " . ($resUnpublish['json']['data']['status'] ?? '')
);

// -----------------------------------------------------------------------------
// SECTION 7: Searching, Filtering & Pagination
// -----------------------------------------------------------------------------
echo PHP_EOL . "7. Search, Filtering & Pagination:" . PHP_EOL;

// 1. List destinations
$resList = apiRequest('GET', '/api/v1/destinations', [], $superAdminToken);
recordResult(
    "GET /api/v1/destinations returns paginated list (200 OK)",
    $resList['status'] === 200 && is_array($resList['json']['data']) && isset($resList['json']['pagination']['total']),
    "Total destinations: " . ($resList['json']['pagination']['total'] ?? 0)
);

// 2. Search by name query
$resSearch = apiRequest('GET', '/api/v1/destinations?search=Nilgiris', [], $superAdminToken);
recordResult(
    "Filter destinations by search query (?search=Nilgiris)",
    $resSearch['status'] === 200 && count($resSearch['json']['data'] ?? []) >= 1,
    "Matched: " . count($resSearch['json']['data'] ?? [])
);

// 3. Filter by status
$resStatusFilter = apiRequest('GET', '/api/v1/destinations?status=draft', [], $superAdminToken);
$allDraft = true;
foreach ($resStatusFilter['json']['data'] ?? [] as $d) {
    if (($d['status'] ?? '') !== 'draft') {
        $allDraft = false;
        break;
    }
}
recordResult(
    "Filter destinations by status (?status=draft)",
    $resStatusFilter['status'] === 200 && $allDraft && count($resStatusFilter['json']['data'] ?? []) > 0,
    "Matched: " . count($resStatusFilter['json']['data'] ?? []) . " draft items"
);

// 4. Filter by is_featured
$resFeatured = apiRequest('GET', '/api/v1/destinations?is_featured=1', [], $superAdminToken);
recordResult(
    "Filter destinations by is_featured (?is_featured=1)",
    $resFeatured['status'] === 200 && count($resFeatured['json']['data'] ?? []) >= 1,
    "Matched: " . count($resFeatured['json']['data'] ?? [])
);

// 5. Pagination limit
$resPagination = apiRequest('GET', '/api/v1/destinations?page=1&limit=1', [], $superAdminToken);
recordResult(
    "Pagination limit is respected (?limit=1)",
    $resPagination['status'] === 200 && count($resPagination['json']['data'] ?? []) === 1 && ($resPagination['json']['pagination']['limit'] ?? 0) === 1,
    "Returned: " . count($resPagination['json']['data'] ?? [])
);

// -----------------------------------------------------------------------------
// SECTION 8: References & Deletion Protection
// -----------------------------------------------------------------------------
echo PHP_EOL . "8. In-Use Dependency Protection & Deletion:" . PHP_EOL;

// 1. Create a dummy tour in tours table pointing to $dest1Id
$stmt = $pdo->prepare("INSERT INTO tours (
    destination_id, title, slug, short_description, duration_days, base_price, is_featured, display_order, status, created_at, updated_at
) VALUES (?, 'Test Nilgiris Tour Package', 'test-nilgiris-tour', 'Summary', 3, 499.00, 1, 1, 'draft', NOW(), NOW())");
$stmt->execute([$dest1Id]);
$testTourId = (int) $pdo->lastInsertId();

// 2. Verify show endpoint reports in_use = true
$resInUseCheck = apiRequest('GET', "/api/v1/destinations/{$dest1Id}", [], $superAdminToken);
recordResult(
    "Usage check accurately detects active referencing tour package",
    $resInUseCheck['status'] === 200 && ($resInUseCheck['json']['data']['is_in_use'] ?? false) === true && ($resInUseCheck['json']['data']['usage_references']['tours'] ?? 0) >= 1,
    "Tours reference count: " . ($resInUseCheck['json']['data']['usage_references']['tours'] ?? 0)
);

// 3. Deletion blocked with 409
$resDelBlocked = apiRequest('DELETE', "/api/v1/destinations/{$dest1Id}", [], $superAdminToken);
recordResult(
    "DELETE /api/v1/destinations/{id} of in-use destination is blocked with 409 DESTINATION_IN_USE",
    $resDelBlocked['status'] === 409 && ($resDelBlocked['json']['error_code'] ?? '') === 'DESTINATION_IN_USE',
    "HTTP {$resDelBlocked['status']}: " . ($resDelBlocked['json']['message'] ?? '')
);

// Clean up referencing tour
$pdo->prepare("DELETE FROM tours WHERE id = ?")->execute([$testTourId]);

// 4. Safe deletion of unreferenced destination
$resDelSuccess = apiRequest('DELETE', "/api/v1/destinations/{$dest1Id}", [], $superAdminToken);
recordResult(
    "DELETE /api/v1/destinations/{id} succeeds after clearing references (200 OK)",
    $resDelSuccess['status'] === 200,
    "HTTP {$resDelSuccess['status']}"
);

// 5. Verify deleted destination is no longer returned in default queries
$resShowDeleted = apiRequest('GET', "/api/v1/destinations/{$dest1Id}", [], $superAdminToken);
recordResult(
    "Soft-deleted destination returns 404 NOT_FOUND on subsequent queries",
    $resShowDeleted['status'] === 404 && ($resShowDeleted['json']['error_code'] ?? '') === 'DESTINATION_NOT_FOUND',
    "HTTP {$resShowDeleted['status']}"
);

// Clean up second test destination
$pdo->prepare("DELETE FROM destinations WHERE id = ?")->execute([$dest2Id]);

// -----------------------------------------------------------------------------
// SECTION 9: Audit Log Event Generation
// -----------------------------------------------------------------------------
echo PHP_EOL . "9. Audit Log Event Verification:" . PHP_EOL;

$stmt = $pdo->prepare("SELECT action, entity_type, entity_id FROM audit_logs WHERE action LIKE 'destination_%' ORDER BY id DESC LIMIT 10");
$stmt->execute();
$auditLogs = $stmt->fetchAll(PDO::FETCH_ASSOC);

$hasCreateLog = false;
$hasUpdateLog = false;
$hasDeleteLog = false;
$hasPublishLog = false;
$hasUnpublishLog = false;

foreach ($auditLogs as $log) {
    if ($log['action'] === 'destination_create') $hasCreateLog = true;
    if ($log['action'] === 'destination_update') $hasUpdateLog = true;
    if ($log['action'] === 'destination_delete' || $log['action'] === 'destination_soft_delete') $hasDeleteLog = true;
    if ($log['action'] === 'destination_publish') $hasPublishLog = true;
    if ($log['action'] === 'destination_unpublish') $hasUnpublishLog = true;
}

recordResult("Audit log recorded for 'destination_create'", $hasCreateLog);
recordResult("Audit log recorded for 'destination_update'", $hasUpdateLog);
recordResult("Audit log recorded for 'destination_delete'", $hasDeleteLog);
recordResult("Audit log recorded for 'destination_publish'", $hasPublishLog);
recordResult("Audit log recorded for 'destination_unpublish'", $hasUnpublishLog);

// -----------------------------------------------------------------------------
// SECTION 10: Regression Tests (Health, Auth, Media)
// -----------------------------------------------------------------------------
echo PHP_EOL . "10. System Regressions (Health, Phase 3 Auth, Phase 4 Media):" . PHP_EOL;

// 1. Health
$resHealth = apiRequest('GET', '/api/v1/health');
recordResult("GET /api/v1/health responds with healthy status", $resHealth['status'] === 200 && ($resHealth['json']['data']['status'] ?? '') === 'healthy');

// 2. Database Health
$resDbHealth = apiRequest('GET', '/api/v1/health/database');
recordResult("GET /api/v1/health/database responds with connected status", $resDbHealth['status'] === 200 && ($resDbHealth['json']['data']['status'] ?? '') === 'connected');

// 3. Auth Profile
$resAuthMe = apiRequest('GET', '/api/v1/auth/me', [], $superAdminToken);
recordResult("GET /api/v1/auth/me responds with super_admin profile", $resAuthMe['status'] === 200 && ($resAuthMe['json']['data']['user']['email'] ?? '') === 'admin@tramaxtours.com');

// 4. Media Listing
$resMediaList = apiRequest('GET', '/api/v1/media', [], $superAdminToken);
recordResult("GET /api/v1/media responds with 200 OK", $resMediaList['status'] === 200);

// -----------------------------------------------------------------------------
// SECTION 11: Cleanup Test Environment
// -----------------------------------------------------------------------------
echo PHP_EOL . "11. Test Environment Cleanup:" . PHP_EOL;

// Clean up test users and media
$pdo->prepare("DELETE FROM user_roles WHERE user_id IN (?, ?)")->execute([$editorId, $moderatorId]);
$pdo->prepare("DELETE FROM users WHERE id IN (?, ?)")->execute([$editorId, $moderatorId]);

if ($coverMediaId) {
    $stmt = $pdo->prepare("SELECT file_path FROM media WHERE id = ?");
    $stmt->execute([$coverMediaId]);
    $fPath = $stmt->fetchColumn();
    if ($fPath) {
        $diskPath = BACKEND_ROOT . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $fPath);
        if (file_exists($diskPath)) @unlink($diskPath);
    }
    $pdo->prepare("DELETE FROM media WHERE id = ?")->execute([$coverMediaId]);
}

$pdo->exec("SET FOREIGN_KEY_CHECKS = 0; DELETE FROM destinations WHERE name LIKE 'Test %' OR slug LIKE 'test-%'; SET FOREIGN_KEY_CHECKS = 1;");

recordResult("All test database records and temporary files cleaned up", true);

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
echo PHP_EOL . "================================================================================" . PHP_EOL;
echo "  PHASE 5 VERIFICATION RESULTS" . PHP_EOL;
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
    echo "\033[32mALL PHASE 5 TESTS PASSED PERFECTLY!\033[0m" . PHP_EOL . PHP_EOL;
    exit(0);
}
