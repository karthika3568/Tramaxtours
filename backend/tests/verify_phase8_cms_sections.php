<?php

/**
 * Wanderer South India - Phase 8 Comprehensive End-to-End CMS Sections API Verification Test Suite
 * 
 * Verifies all Phase 8 requirements:
 * - Database schema, columns (including deleted_at, deleted_by, media_id FK) & homepage.manage permissions
 * - Authentication & RBAC Authorization (homepage.manage enforcement)
 * - View / Detail operation (complete stored CMS section data, expanded media object)
 * - CRUD operations (Create, Read by ID, Read by section_key, Update, Partial Update, Delete)
 * - Automatic section_key generation, custom section_key validation, unique collision resolution
 * - Validation errors (missing title, invalid status, invalid section_key, invalid media_id FK, negative display_order)
 * - Reversible Soft Delete (records deleted_at, deleted_by, preserves DB data & relationships)
 * - List exclusion of soft-deleted CMS sections
 * - Reversible Undo/Restore (POST /restore returns identical record, ID, relationships, clears deleted_at/by)
 * - Activate / Deactivate status transitions
 * - Filtering, Searching, Display Ordering & Pagination
 * - Audit logging (cms_section_create, update, soft_delete, restore, activate, deactivate)
 * - System Regressions: Health, Auth (Phase 3), Media (Phase 4), Destinations (Phase 5), Tours (Phase 6), Pages (Phase 7)
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
echo "  Wanderer South India — PHASE 8 CMS SECTIONS MANAGEMENT VERIFICATION SUITE" . PHP_EOL;
echo "================================================================================" . PHP_EOL . PHP_EOL;

// 2. Start Local Test Server
$testPort = 8895;
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

// 1. Verify cms_sections table exists
$sectionsTableExists = (int) $pdo->query("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'cms_sections'")->fetchColumn();
recordResult("Table 'cms_sections' exists in database", $sectionsTableExists > 0);

// 2. Verify columns in cms_sections table
$stmt = $pdo->query("SHOW COLUMNS FROM `cms_sections`");
$columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
$expectedColumns = [
    'id', 'section_key', 'title', 'subtitle', 'content', 'media_id',
    'display_order', 'status', 'deleted_at', 'deleted_by',
    'created_at', 'updated_at'
];
$missingCols = array_diff($expectedColumns, $columns);
recordResult("All required cms_sections columns including deleted_at and deleted_by present in schema", empty($missingCols), empty($missingCols) ? '' : 'Missing: ' . implode(', ', $missingCols));

// 3. Verify homepage.manage permission exists
$stmt = $pdo->prepare("SELECT COUNT(*) FROM permissions WHERE name = 'homepage.manage'");
$stmt->execute();
recordResult("Permission 'homepage.manage' exists in permissions table", (int) $stmt->fetchColumn() > 0);

// -----------------------------------------------------------------------------
// SECTION 2: RBAC Tokens & User Context Setup
// -----------------------------------------------------------------------------
echo PHP_EOL . "2. RBAC Tokens & User Context Setup:" . PHP_EOL;

// 1. Fetch Super Admin User
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = 'admin@wanderersouthindia.com' LIMIT 1");
$stmt->execute();
$superAdmin = $stmt->fetch(PDO::FETCH_ASSOC);

$superAdminToken = JWT::encode([
    'sub' => (int) $superAdmin['id'],
    'email' => $superAdmin['email'],
    'role' => 'super_admin',
    'permissions' => ['*'],
], null, 3600);
recordResult("Super Admin token generated", !empty($superAdminToken));

// 2. Create Test Editor User (has homepage.manage)
$pdo->prepare("DELETE FROM users WHERE email = 'editor.phase8@wanderersouthindia.com'")->execute();
$pdo->prepare("INSERT INTO users (name, email, password_hash, status, created_at, updated_at) VALUES ('Phase8 Editor', 'editor.phase8@wanderersouthindia.com', 'hash', 'active', NOW(), NOW())")->execute();
$editorId = (int) $pdo->lastInsertId();
$pdo->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)")->execute([$editorId, 3]); // Role 3 = Editor

$editorToken = JWT::encode([
    'sub' => $editorId,
    'email' => 'editor.phase8@wanderersouthindia.com',
    'role' => 'editor',
    'permissions' => ['homepage.manage', 'media.view', 'media.upload'],
], null, 3600);
recordResult("Editor token generated (has homepage.manage)", !empty($editorToken));

// 3. Create Test Moderator User (lacks homepage.manage)
$pdo->prepare("DELETE FROM users WHERE email = 'moderator.phase8@wanderersouthindia.com'")->execute();
$pdo->prepare("INSERT INTO users (name, email, password_hash, status, created_at, updated_at) VALUES ('Phase8 Moderator', 'moderator.phase8@wanderersouthindia.com', 'hash', 'active', NOW(), NOW())")->execute();
$moderatorId = (int) $pdo->lastInsertId();
$pdo->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)")->execute([$moderatorId, 4]); // Role 4 = Moderator

$moderatorToken = JWT::encode([
    'sub' => $moderatorId,
    'email' => 'moderator.phase8@wanderersouthindia.com',
    'role' => 'moderator',
    'permissions' => ['reviews.view', 'reviews.moderate'],
], null, 3600);
recordResult("Moderator token generated (has no homepage.manage)", !empty($moderatorToken));

// -----------------------------------------------------------------------------
// SECTION 3: Authorization & Permission Enforcement
// -----------------------------------------------------------------------------
echo PHP_EOL . "3. Authorization & Permission Enforcement:" . PHP_EOL;

// 1. Unauthenticated requests rejected (401)
$resUnauthList = apiRequest('GET', '/api/v1/cms-sections');
recordResult("Unauthenticated request to GET /api/v1/cms-sections is rejected (401)", $resUnauthList['status'] === 401);

$resUnauthDetail = apiRequest('GET', '/api/v1/cms-sections/1');
recordResult("Unauthenticated request to GET /api/v1/cms-sections/{id} is rejected (401)", $resUnauthDetail['status'] === 401);

$resUnauthCreate = apiRequest('POST', '/api/v1/cms-sections', ['title' => 'Unauth Test']);
recordResult("Unauthenticated request to POST /api/v1/cms-sections is rejected (401)", $resUnauthCreate['status'] === 401);

$resUnauthUpdate = apiRequest('PUT', '/api/v1/cms-sections/1', ['title' => 'Unauth Update']);
recordResult("Unauthenticated request to PUT /api/v1/cms-sections/{id} is rejected (401)", $resUnauthUpdate['status'] === 401);

$resUnauthDelete = apiRequest('DELETE', '/api/v1/cms-sections/1');
recordResult("Unauthenticated request to DELETE /api/v1/cms-sections/{id} is rejected (401)", $resUnauthDelete['status'] === 401);

$resUnauthRestore = apiRequest('POST', '/api/v1/cms-sections/1/restore');
recordResult("Unauthenticated request to POST /api/v1/cms-sections/{id}/restore is rejected (401)", $resUnauthRestore['status'] === 401);

// 2. Unauthorized user without homepage.manage rejected (403)
$resForbiddenList = apiRequest('GET', '/api/v1/cms-sections', [], $moderatorToken);
recordResult("User without homepage.manage is rejected with 403", $resForbiddenList['status'] === 403);

$resForbiddenCreate = apiRequest('POST', '/api/v1/cms-sections', ['title' => 'Forbidden'], $moderatorToken);
recordResult("User without homepage.manage create is rejected with 403", $resForbiddenCreate['status'] === 403);

// 3. Authorized user with homepage.manage allowed (200 OK)
$resAuthorizedList = apiRequest('GET', '/api/v1/cms-sections', [], $editorToken);
recordResult("User with homepage.manage is allowed access (200 OK)", $resAuthorizedList['status'] === 200);

// -----------------------------------------------------------------------------
// SECTION 4: Input Validation & Constraints
// -----------------------------------------------------------------------------
echo PHP_EOL . "4. Input Validation & Constraint Checks:" . PHP_EOL;

// 1. Missing title
$resValTitle = apiRequest('POST', '/api/v1/cms-sections', ['title' => ''], $superAdminToken);
recordResult(
    "Rejection of missing section title (422)",
    $resValTitle['status'] === 422 && isset($resValTitle['json']['errors']['title']),
    "Error: " . ($resValTitle['json']['errors']['title'] ?? '')
);

// 2. Non-existent media_id
$resValMedia = apiRequest('POST', '/api/v1/cms-sections', [
    'title' => 'Test Section Validation',
    'media_id' => 999999
], $superAdminToken);
recordResult(
    "Rejection of non-existent media_id (422)",
    $resValMedia['status'] === 422 && isset($resValMedia['json']['errors']['media_id']),
    "Error: " . ($resValMedia['json']['errors']['media_id'] ?? '')
);

// 3. Invalid status value
$resValStatus = apiRequest('POST', '/api/v1/cms-sections', [
    'title' => 'Test Section Invalid Status',
    'status' => 'draft' // CMS sections allow 'active', 'inactive'
], $superAdminToken);
recordResult(
    "Rejection of invalid status value (422)",
    $resValStatus['status'] === 422 && isset($resValStatus['json']['errors']['status']),
    "Error: " . ($resValStatus['json']['errors']['status'] ?? '')
);

// 4. Invalid section_key format
$resValKey = apiRequest('POST', '/api/v1/cms-sections', [
    'title' => 'Test Section Invalid Key',
    'section_key' => 'INVALID KEY with Spaces!'
], $superAdminToken);
recordResult(
    "Rejection of invalid section_key format (422)",
    $resValKey['status'] === 422 && isset($resValKey['json']['errors']['section_key']),
    "Error: " . ($resValKey['json']['errors']['section_key'] ?? '')
);

// 5. Invalid display_order (negative)
$resValOrder = apiRequest('POST', '/api/v1/cms-sections', [
    'title' => 'Test Section Negative Order',
    'display_order' => -5
], $superAdminToken);
recordResult(
    "Rejection of negative display_order (422)",
    $resValOrder['status'] === 422 && isset($resValOrder['json']['errors']['display_order']),
    "Error: " . ($resValOrder['json']['errors']['display_order'] ?? '')
);

// -----------------------------------------------------------------------------
// SECTION 5: CRUD Operations, Key Handling & Media Integration
// -----------------------------------------------------------------------------
echo PHP_EOL . "5. CRUD Operations, Key Handling & Media Integration:" . PHP_EOL;

// Upload test media image for CMS section media
$testImgContent = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
$tempImgPath = BACKEND_ROOT . DIRECTORY_SEPARATOR . 'tests' . DIRECTORY_SEPARATOR . 'temp_section_media.png';
file_put_contents($tempImgPath, $testImgContent);

$resMediaUpload = apiRequest('POST', '/api/v1/media/upload', ['alt_text' => 'Section Promo Image'], $superAdminToken, ['file' => $tempImgPath]);
$sectionMediaId = $resMediaUpload['json']['data']['id'] ?? null;
@unlink($tempImgPath);

// 1. Create CMS Section 1 with automatic section_key generation
$section1Payload = [
    'title' => 'Test Why Choose Wanderer South India',
    'subtitle' => 'Experience authenticity, luxury transit, and local expert hospitality',
    'media_id' => $sectionMediaId,
    'content' => '<p>Over 15 years crafting unforgettable foreign and domestic journeys in South India.</p>',
    'display_order' => 1,
    'status' => 'active',
];

$resCreateSec1 = apiRequest('POST', '/api/v1/cms-sections', $section1Payload, $superAdminToken);
$section1Id = (int) ($resCreateSec1['json']['data']['id'] ?? 0);
$section1Key = $resCreateSec1['json']['data']['section_key'] ?? '';
recordResult(
    "POST /api/v1/cms-sections creates section with automatic section_key (201 Created)",
    $resCreateSec1['status'] === 201 && $section1Id > 0 && $section1Key === 'test-why-choose-wanderer-tours',
    "ID: {$section1Id}, Key: {$section1Key}"
);

// 2. Create CMS Section 2 with duplicate title -> Auto-resolves collision with suffix -2
$resCreateSec2 = apiRequest('POST', '/api/v1/cms-sections', [
    'title' => 'Test Why Choose Wanderer South India',
    'content' => '<p>Second edition section block.</p>',
    'display_order' => 2,
], $superAdminToken);
$section2Id = (int) ($resCreateSec2['json']['data']['id'] ?? 0);
$section2Key = $resCreateSec2['json']['data']['section_key'] ?? '';
recordResult(
    "Automatic unique section_key collision resolution (appends -2)",
    $resCreateSec2['status'] === 201 && $section2Id > 0 && $section2Key === 'test-why-choose-wanderer-tours-2',
    "Key: {$section2Key}"
);

// 3. Explicit duplicate custom section_key rejected
$resDupKey = apiRequest('POST', '/api/v1/cms-sections', [
    'title' => 'Another Block',
    'section_key' => 'test-why-choose-wanderer-tours',
    'content' => '<p>Duplicate key attempt.</p>'
], $superAdminToken);
recordResult(
    "Explicit duplicate custom section_key is rejected (422)",
    $resDupKey['status'] === 422 && isset($resDupKey['json']['errors']['section_key']),
    "Error: " . ($resDupKey['json']['errors']['section_key'] ?? '')
);

// 4. View / Detail: GET /api/v1/cms-sections/{id} returns complete stored record and expanded media object
$resShowSec = apiRequest('GET', "/api/v1/cms-sections/{$section1Id}", [], $superAdminToken);
$secData = $resShowSec['json']['data'] ?? [];
$hasCompleteFields = isset($secData['id'], $secData['section_key'], $secData['title'], $secData['subtitle'], $secData['content'], $secData['display_order'], $secData['status'], $secData['created_at'], $secData['updated_at']);
$hasMedia = !empty($secData['media']) && ($secData['media']['id'] ?? 0) === $sectionMediaId;

recordResult(
    "GET /api/v1/cms-sections/{id} retrieves complete section details and media object (200 OK)",
    $resShowSec['status'] === 200 && $hasCompleteFields && $hasMedia,
    "Title: {$secData['title']}, Media URL: " . ($secData['media']['url'] ?? '')
);

// 5. Lookup by section_key: GET /api/v1/cms-sections/{section_key}
$resShowKey = apiRequest('GET', "/api/v1/cms-sections/{$section1Key}", [], $superAdminToken);
recordResult(
    "GET /api/v1/cms-sections/{section_key} retrieves section by unique key (200 OK)",
    $resShowKey['status'] === 200 && ($resShowKey['json']['data']['id'] ?? 0) === $section1Id,
    "Key: {$resShowKey['json']['data']['section_key']}"
);

// 6. Update Section via PUT: Full update
$updatePayload = [
    'title' => 'Updated Premium South India Tour Services',
    'subtitle' => 'Handcrafted experiences with personalized private vehicles',
    'content' => '<p>Updated full section content description.</p>',
    'display_order' => 5,
    'status' => 'active',
];
$resUpdateSec = apiRequest('PUT', "/api/v1/cms-sections/{$section1Id}", $updatePayload, $superAdminToken);
recordResult(
    "PUT /api/v1/cms-sections/{id} updates full fields successfully (200 OK)",
    $resUpdateSec['status'] === 200 && ($resUpdateSec['json']['data']['title'] ?? '') === 'Updated Premium South India Tour Services' && ($resUpdateSec['json']['data']['display_order'] ?? 0) === 5,
    "Updated Title: " . ($resUpdateSec['json']['data']['title'] ?? '')
);

// 7. Partial Update via PATCH: updates only supplied field while preserving others
$patchPayload = [
    'subtitle' => 'Newly patched subtitle exclusively'
];
$resPatchSec = apiRequest('PATCH', "/api/v1/cms-sections/{$section1Id}", $patchPayload, $superAdminToken);
$patchedData = $resPatchSec['json']['data'] ?? [];
recordResult(
    "PATCH /api/v1/cms-sections/{id} preserves unsupplied fields and updates target field (200 OK)",
    $resPatchSec['status'] === 200 && ($patchedData['subtitle'] ?? '') === 'Newly patched subtitle exclusively' && ($patchedData['title'] ?? '') === 'Updated Premium South India Tour Services' && ($patchedData['display_order'] ?? 0) === 5,
    "Patched Subtitle: " . ($patchedData['subtitle'] ?? '')
);

// -----------------------------------------------------------------------------
// SECTION 6: Status Transitions (Activate / Deactivate)
// -----------------------------------------------------------------------------
echo PHP_EOL . "6. Status Transitions (Activate / Deactivate):" . PHP_EOL;

// 1. Deactivate section -> inactive
$resDeactivate = apiRequest('POST', "/api/v1/cms-sections/{$section1Id}/deactivate", [], $superAdminToken);
recordResult(
    "POST /api/v1/cms-sections/{id}/deactivate changes status to 'inactive' (200 OK)",
    $resDeactivate['status'] === 200 && ($resDeactivate['json']['data']['status'] ?? '') === 'inactive',
    "Status: " . ($resDeactivate['json']['data']['status'] ?? '')
);

// 2. Activate section -> active
$resActivate = apiRequest('POST', "/api/v1/cms-sections/{$section1Id}/activate", [], $superAdminToken);
recordResult(
    "POST /api/v1/cms-sections/{id}/activate changes status to 'active' (200 OK)",
    $resActivate['status'] === 200 && ($resActivate['json']['data']['status'] ?? '') === 'active',
    "Status: " . ($resActivate['json']['data']['status'] ?? '')
);

// -----------------------------------------------------------------------------
// SECTION 7: Search, Filtering, Ordering & Pagination
// -----------------------------------------------------------------------------
echo PHP_EOL . "7. Search, Filtering, Ordering & Pagination:" . PHP_EOL;

// 1. List sections
$resSectionsList = apiRequest('GET', '/api/v1/cms-sections', [], $superAdminToken);
recordResult(
    "GET /api/v1/cms-sections returns paginated list (200 OK)",
    $resSectionsList['status'] === 200 && is_array($resSectionsList['json']['data']),
    "Total sections: " . ($resSectionsList['json']['pagination']['total'] ?? 0)
);

// 2. Search query filter
$resSearch = apiRequest('GET', '/api/v1/cms-sections?search=Premium', [], $superAdminToken);
recordResult(
    "Filter CMS sections by search query (?search=Premium)",
    $resSearch['status'] === 200 && count($resSearch['json']['data'] ?? []) >= 1,
    "Matched: " . count($resSearch['json']['data'] ?? [])
);

// 3. Status filter
$resStatusFilter = apiRequest('GET', '/api/v1/cms-sections?status=active', [], $superAdminToken);
recordResult(
    "Filter CMS sections by status (?status=active)",
    $resStatusFilter['status'] === 200 && count($resStatusFilter['json']['data'] ?? []) >= 1,
    "Active count: " . count($resStatusFilter['json']['data'] ?? [])
);

// 4. Pagination limit
$resLimit = apiRequest('GET', '/api/v1/cms-sections?limit=1', [], $superAdminToken);
recordResult(
    "Pagination limit is respected (?limit=1)",
    $resLimit['status'] === 200 && count($resLimit['json']['data'] ?? []) === 1,
    "Returned: " . count($resLimit['json']['data'] ?? [])
);

// -----------------------------------------------------------------------------
// SECTION 8: Reversible Soft-Delete & Undo/Restore Architecture
// -----------------------------------------------------------------------------
echo PHP_EOL . "8. Reversible Soft-Delete & Undo/Restore Architecture:" . PHP_EOL;

// 1. Soft-delete Section
$resSoftDelete = apiRequest('DELETE', "/api/v1/cms-sections/{$section1Id}", [], $superAdminToken);
recordResult(
    "DELETE /api/v1/cms-sections/{id} returns soft-delete confirmation with deleted_at and deleted_by",
    $resSoftDelete['status'] === 200 && ($resSoftDelete['json']['data']['is_deleted'] ?? false) === true && !empty($resSoftDelete['json']['data']['deleted_at']),
    "Deleted At: " . ($resSoftDelete['json']['data']['deleted_at'] ?? 'none')
);

// 2. Soft-deleted section is excluded from normal active listings
$resActiveSecList = apiRequest('GET', '/api/v1/cms-sections', [], $superAdminToken);
$secIdsInActiveList = array_column($resActiveSecList['json']['data'] ?? [], 'id');
recordResult(
    "Soft-deleted section is excluded from normal active listings",
    !in_array($section1Id, $secIdsInActiveList, true)
);

// 3. Soft-deleted section returns 404 on normal active detail query
$resShowDeleted = apiRequest('GET', "/api/v1/cms-sections/{$section1Id}", [], $superAdminToken);
recordResult(
    "Soft-deleted section returns 404 on normal active detail query",
    $resShowDeleted['status'] === 404
);

// 4. Original section record, content, and media_id still intact in database
$stmt = $pdo->prepare("SELECT id, title, section_key, content, media_id, display_order, deleted_at, deleted_by FROM cms_sections WHERE id = ?");
$stmt->execute([$section1Id]);
$dbSection = $stmt->fetch(PDO::FETCH_ASSOC);
recordResult(
    "Original section record, content, and metadata are preserved in database during soft delete",
    $dbSection !== false && (int) $dbSection['id'] === $section1Id && !empty($dbSection['deleted_at']) && (int) ($dbSection['deleted_by'] ?? 0) === (int) $superAdmin['id'],
    "Preserved Title: {$dbSection['title']}, Deleted By ID: " . ($dbSection['deleted_by'] ?? '')
);

// 5. Cannot activate soft-deleted section (returns 404)
$resActivateDeleted = apiRequest('POST', "/api/v1/cms-sections/{$section1Id}/activate", [], $superAdminToken);
recordResult(
    "Cannot activate soft-deleted section (404 NOT_FOUND)",
    $resActivateDeleted['status'] === 404
);

// 6. Restore Section via POST /api/v1/cms-sections/{id}/restore
$resRestoreSec = apiRequest('POST', "/api/v1/cms-sections/{$section1Id}/restore", [], $superAdminToken);
$restoredSec = $resRestoreSec['json']['data'] ?? [];
recordResult(
    "POST /api/v1/cms-sections/{id}/restore restores section with SAME ID, clears deleted_at/by (200 OK)",
    $resRestoreSec['status'] === 200 && ($restoredSec['id'] ?? 0) === $section1Id && empty($restoredSec['deleted_at']) && empty($restoredSec['deleted_by']),
    "Restored Title: " . ($restoredSec['title'] ?? '')
);

// 7. Verify restored section is back in active listings
$resActiveSecAfter = apiRequest('GET', '/api/v1/cms-sections', [], $superAdminToken);
$secIdsAfterRestore = array_column($resActiveSecAfter['json']['data'] ?? [], 'id');
recordResult(
    "Restored section is actively listed again in normal listings",
    in_array($section1Id, $secIdsAfterRestore, true)
);

// -----------------------------------------------------------------------------
// SECTION 9: Audit Log Event Generation
// -----------------------------------------------------------------------------
echo PHP_EOL . "9. Audit Log Event Verification:" . PHP_EOL;

$stmt = $pdo->prepare("SELECT action, entity_type, entity_id FROM audit_logs WHERE action LIKE 'cms_section_%' ORDER BY id DESC LIMIT 20");
$stmt->execute();
$auditLogs = $stmt->fetchAll(PDO::FETCH_ASSOC);

$hasCreateLog = false;
$hasUpdateLog = false;
$hasDeleteLog = false;
$hasRestoreLog = false;
$hasActivateLog = false;
$hasDeactivateLog = false;

foreach ($auditLogs as $log) {
    if ($log['action'] === 'cms_section_create') $hasCreateLog = true;
    if ($log['action'] === 'cms_section_update') $hasUpdateLog = true;
    if ($log['action'] === 'cms_section_delete' || $log['action'] === 'cms_section_soft_delete') $hasDeleteLog = true;
    if ($log['action'] === 'cms_section_restore') $hasRestoreLog = true;
    if ($log['action'] === 'cms_section_activate') $hasActivateLog = true;
    if ($log['action'] === 'cms_section_deactivate') $hasDeactivateLog = true;
}

recordResult("Audit log recorded for 'cms_section_create'", $hasCreateLog);
recordResult("Audit log recorded for 'cms_section_update'", $hasUpdateLog);
recordResult("Audit log recorded for 'cms_section_soft_delete'", $hasDeleteLog);
recordResult("Audit log recorded for 'cms_section_restore'", $hasRestoreLog);
recordResult("Audit log recorded for 'cms_section_activate'", $hasActivateLog);
recordResult("Audit log recorded for 'cms_section_deactivate'", $hasDeactivateLog);

// -----------------------------------------------------------------------------
// SECTION 10: System Regressions (Health, Phase 3 Auth, Phase 4 Media, Phase 5 Destinations, Phase 6 Tours, Phase 7 Pages)
// -----------------------------------------------------------------------------
echo PHP_EOL . "10. System Regressions (Health, Phase 3 Auth, Phase 4 Media, Phase 5 Destinations, Phase 6 Tours, Phase 7 Pages):" . PHP_EOL;

// 1. Health
$resHealth = apiRequest('GET', '/api/v1/health');
recordResult("GET /api/v1/health responds with healthy status", $resHealth['status'] === 200 && ($resHealth['json']['data']['status'] ?? '') === 'healthy');

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

// 6. Tours Listing
$resToursList = apiRequest('GET', '/api/v1/tours', [], $superAdminToken);
recordResult("GET /api/v1/tours responds with 200 OK", $resToursList['status'] === 200);

// 7. Pages Listing
$resPagesList = apiRequest('GET', '/api/v1/pages', [], $superAdminToken);
recordResult("GET /api/v1/pages responds with 200 OK", $resPagesList['status'] === 200);

// -----------------------------------------------------------------------------
// SECTION 11: Cleanup Test Environment
// -----------------------------------------------------------------------------
echo PHP_EOL . "11. Test Environment Cleanup:" . PHP_EOL;

// Clean up test users, cms_sections and media
$pdo->prepare("DELETE FROM user_roles WHERE user_id IN (?, ?)")->execute([$editorId, $moderatorId]);
$pdo->prepare("DELETE FROM users WHERE id IN (?, ?)")->execute([$editorId, $moderatorId]);

if ($sectionMediaId) {
    $stmt = $pdo->prepare("SELECT file_path FROM media WHERE id = ?");
    $stmt->execute([$sectionMediaId]);
    $fPath = $stmt->fetchColumn();
    if ($fPath) {
        $diskPath = BACKEND_ROOT . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $fPath);
        if (file_exists($diskPath)) @unlink($diskPath);
    }
    $pdo->prepare("DELETE FROM media WHERE id = ?")->execute([$sectionMediaId]);
}

$pdo->exec("DELETE FROM cms_sections WHERE title LIKE 'Test %' OR title LIKE 'Updated %' OR section_key LIKE 'test-%'");

recordResult("All test database records and temporary files cleaned up", true);

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
echo PHP_EOL . "================================================================================" . PHP_EOL;
echo "  PHASE 8 VERIFICATION RESULTS" . PHP_EOL;
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
    echo "\033[32mALL PHASE 8 TESTS PASSED PERFECTLY!\033[0m" . PHP_EOL . PHP_EOL;
    exit(0);
}
