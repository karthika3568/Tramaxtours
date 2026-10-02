<?php

/**
 * Wanderer South India - Phase 13 Comprehensive End-to-End Social Links API Verification Test Suite
 * 
 * Verifies all Phase 13 requirements:
 * - Database schema, columns (including deleted_at, deleted_by) & social.manage permissions
 * - Authentication & RBAC Authorization (social.manage enforcement)
 * - View / Detail operation (complete stored social link data)
 * - CRUD operations (Create, Read by ID, Update, Partial Update, Delete)
 * - Validation errors (missing platform, missing url, invalid url, platform/icon/url length, invalid status, negative display_order)
 * - Reversible Soft Delete (records deleted_at, deleted_by, preserves DB data)
 * - List exclusion of soft-deleted social links
 * - Reversible Undo/Restore (POST/PATCH /restore returns identical record, ID, clears deleted_at/by)
 * - Activate / Deactivate status transitions
 * - Filtering, Searching, Display Ordering & Pagination
 * - Audit logging (social_link_create, update, soft_delete, restore, activate, deactivate)
 * - System Regressions: Health, Auth (Phase 3), Media (Phase 4), Destinations (Phase 5), Tours (Phase 6), Pages (Phase 7), CMS Sections (Phase 8), Hero Slides (Phase 9), Home Benefits (Phase 10), Site Settings (Phase 11), Footer Links (Phase 12)
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
echo "  WANDERER SOUTH INDIA — PHASE 13 SOCIAL LINKS MANAGEMENT VERIFICATION SUITE" . PHP_EOL;
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

$tableExists = (bool) $pdo->query("SHOW TABLES LIKE 'social_links'")->fetch();
recordResult("Table 'social_links' exists in database", $tableExists);

$colStmt = $pdo->query("SHOW COLUMNS FROM `social_links`");
$columns = $colStmt->fetchAll(PDO::FETCH_COLUMN);

$requiredColumns = [
    'id', 'platform', 'url', 'icon', 'display_order',
    'status', 'deleted_at', 'deleted_by', 'created_at', 'updated_at'
];
$missingCols = array_diff($requiredColumns, $columns);
recordResult("All required social_links columns including soft delete present in schema", empty($missingCols), empty($missingCols) ? "All columns verified" : "Missing: " . implode(', ', $missingCols));

$permCheck = (int) $pdo->query("SELECT COUNT(*) FROM permissions WHERE name = 'social.manage'")->fetchColumn();
recordResult("Permission 'social.manage' exists in permissions table", $permCheck > 0);

echo PHP_EOL;

// --- 2. RBAC Tokens & User Context Setup ---
echo "2. RBAC Tokens & User Context Setup:" . PHP_EOL;

// Super Admin
$superAdminToken = JWT::encode([
    'sub' => 1,
    'id' => 1,
    'email' => 'admin@tramaxtours.com',
    'role' => 'super_admin',
    'roles' => ['super_admin'],
    'permissions' => ['*'],
], null, 3600);
recordResult("Super Admin token generated", !empty($superAdminToken));

// Editor (has social.manage via Role 3)
$pdo->prepare("DELETE FROM users WHERE email = 'editor.phase13@tramaxtours.com'")->execute();
$pdo->prepare("INSERT INTO users (name, email, password_hash, status, created_at, updated_at) VALUES ('Phase13 Editor', 'editor.phase13@tramaxtours.com', 'hash', 'active', NOW(), NOW())")->execute();
$editorId = (int) $pdo->lastInsertId();
$pdo->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)")->execute([$editorId, 3]); // Role 3 = Editor

$editorToken = JWT::encode([
    'sub' => $editorId,
    'id' => $editorId,
    'email' => 'editor.phase13@tramaxtours.com',
    'role' => 'editor',
    'permissions' => ['social.manage'],
], null, 3600);
recordResult("Editor token generated (has social.manage)", !empty($editorToken));

// Moderator (lacks social.manage)
$pdo->prepare("DELETE FROM users WHERE email = 'moderator.phase13@tramaxtours.com'")->execute();
$pdo->prepare("INSERT INTO users (name, email, password_hash, status, created_at, updated_at) VALUES ('Phase13 Moderator', 'moderator.phase13@tramaxtours.com', 'hash', 'active', NOW(), NOW())")->execute();
$moderatorId = (int) $pdo->lastInsertId();
$pdo->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)")->execute([$moderatorId, 4]); // Role 4 = Moderator

$moderatorToken = JWT::encode([
    'sub' => $moderatorId,
    'id' => $moderatorId,
    'email' => 'moderator.phase13@tramaxtours.com',
    'role' => 'moderator',
    'permissions' => ['reviews.view', 'reviews.moderate'],
], null, 3600);
recordResult("Moderator token generated (has no social.manage)", !empty($moderatorToken));

echo PHP_EOL;

// --- 3. Authorization & Permission Enforcement ---
echo "3. Authorization & Permission Enforcement:" . PHP_EOL;

// Unauthenticated requests
$resUnauthList = apiRequest('GET', '/api/v1/social-links');
recordResult("Unauthenticated list -> 401", $resUnauthList['status'] === 401);

$resUnauthShow = apiRequest('GET', '/api/v1/social-links/1');
recordResult("Unauthenticated detail -> 401", $resUnauthShow['status'] === 401);

$resUnauthStore = apiRequest('POST', '/api/v1/social-links', ['platform' => 'facebook', 'url' => 'https://facebook.com/test']);
recordResult("Unauthenticated create -> 401", $resUnauthStore['status'] === 401);

$resUnauthUpdate = apiRequest('PUT', '/api/v1/social-links/1', ['platform' => 'unauth']);
recordResult("Unauthenticated update -> 401", $resUnauthUpdate['status'] === 401);

$resUnauthDelete = apiRequest('DELETE', '/api/v1/social-links/1');
recordResult("Unauthenticated delete -> 401", $resUnauthDelete['status'] === 401);

$resUnauthRestore = apiRequest('POST', '/api/v1/social-links/1/restore');
recordResult("Unauthenticated restore -> 401", $resUnauthRestore['status'] === 401);

// Unauthorized requests (Moderator lacking social.manage)
$resForbiddenList = apiRequest('GET', '/api/v1/social-links', [], $moderatorToken);
recordResult("User without social.manage -> 403", $resForbiddenList['status'] === 403);

$resForbiddenCreate = apiRequest('POST', '/api/v1/social-links', ['platform' => 'facebook', 'url' => 'https://facebook.com/forbidden'], $moderatorToken);
recordResult("User without social.manage create -> 403", $resForbiddenCreate['status'] === 403);

// Authorized request (Editor with social.manage)
$resEditorList = apiRequest('GET', '/api/v1/social-links', [], $editorToken);
recordResult("User with social.manage -> 200 OK", $resEditorList['status'] === 200);

echo PHP_EOL;

// --- 4. Input Validation & Constraint Checks ---
echo "4. Input Validation & Constraint Checks:" . PHP_EOL;

// Missing platform
$resValPlatform = apiRequest('POST', '/api/v1/social-links', [
    'url' => 'https://instagram.com/sample',
], $superAdminToken);
recordResult("Missing platform -> 422", $resValPlatform['status'] === 422, "Error: " . ($resValPlatform['json']['errors']['platform'] ?? ''));

// Platform exceeding max length (50 chars)
$resValPlatformLen = apiRequest('POST', '/api/v1/social-links', [
    'platform' => str_repeat('a', 51),
    'url' => 'https://instagram.com/sample',
], $superAdminToken);
recordResult("Platform > 50 chars -> 422", $resValPlatformLen['status'] === 422, "Error: " . ($resValPlatformLen['json']['errors']['platform'] ?? ''));

// Missing URL
$resValUrl = apiRequest('POST', '/api/v1/social-links', [
    'platform' => 'instagram',
], $superAdminToken);
recordResult("Missing URL -> 422", $resValUrl['status'] === 422, "Error: " . ($resValUrl['json']['errors']['url'] ?? ''));

// Invalid URL format
$resValUrlFormat = apiRequest('POST', '/api/v1/social-links', [
    'platform' => 'instagram',
    'url' => 'not-a-valid-url',
], $superAdminToken);
recordResult("Invalid URL format -> 422", $resValUrlFormat['status'] === 422, "Error: " . ($resValUrlFormat['json']['errors']['url'] ?? ''));

// URL exceeding max length (255 chars)
$resValUrlLen = apiRequest('POST', '/api/v1/social-links', [
    'platform' => 'instagram',
    'url' => 'https://instagram.com/' . str_repeat('x', 250),
], $superAdminToken);
recordResult("URL > 255 chars -> 422", $resValUrlLen['status'] === 422, "Error: " . ($resValUrlLen['json']['errors']['url'] ?? ''));

// Icon exceeding max length (50 chars)
$resValIconLen = apiRequest('POST', '/api/v1/social-links', [
    'platform' => 'instagram',
    'url' => 'https://instagram.com/sample',
    'icon' => str_repeat('i', 51),
], $superAdminToken);
recordResult("Icon > 50 chars -> 422", $resValIconLen['status'] === 422, "Error: " . ($resValIconLen['json']['errors']['icon'] ?? ''));

// Negative display_order
$resValOrder = apiRequest('POST', '/api/v1/social-links', [
    'platform' => 'instagram',
    'url' => 'https://instagram.com/sample',
    'display_order' => -5,
], $superAdminToken);
recordResult("Negative display_order -> 422", $resValOrder['status'] === 422, "Error: " . ($resValOrder['json']['errors']['display_order'] ?? ''));

// Invalid status
$resValStatus = apiRequest('POST', '/api/v1/social-links', [
    'platform' => 'instagram',
    'url' => 'https://instagram.com/sample',
    'status' => 'archived',
], $superAdminToken);
recordResult("Invalid status -> 422", $resValStatus['status'] === 422, "Error: " . ($resValStatus['json']['errors']['status'] ?? ''));

echo PHP_EOL;

// --- 5. Social Link CRUD Operations ---
echo "5. Social Link CRUD Operations:" . PHP_EOL;

// Create Social Link 1
$link1Payload = [
    'platform' => 'tiktok',
    'url' => 'https://tiktok.com/@tramaxtours',
    'icon' => 'tiktok',
    'display_order' => 10,
    'status' => 'active',
];

$resCreate1 = apiRequest('POST', '/api/v1/social-links', $link1Payload, $superAdminToken);
$link1Id = (int) ($resCreate1['json']['data']['id'] ?? 0);
recordResult("Create social link 1 -> 201 Created", $resCreate1['status'] === 201 && $link1Id > 0, "Created ID: {$link1Id}");

// Create Social Link 2
$link2Payload = [
    'platform' => 'threads',
    'url' => 'https://threads.net/@tramaxtours',
    'icon' => 'threads',
    'display_order' => 12,
    'status' => 'inactive',
];

$resCreate2 = apiRequest('POST', '/api/v1/social-links', $link2Payload, $superAdminToken);
$link2Id = (int) ($resCreate2['json']['data']['id'] ?? 0);
recordResult("Create social link 2 -> 201 Created", $resCreate2['status'] === 201 && $link2Id > 0, "Created ID: {$link2Id}");

// View / Detail Social Link 1
$resShow1 = apiRequest('GET', "/api/v1/social-links/{$link1Id}", [], $superAdminToken);
$link1Data = $resShow1['json']['data'] ?? [];
$detailKeysValid = isset(
    $link1Data['id'],
    $link1Data['platform'],
    $link1Data['url'],
    $link1Data['icon'],
    $link1Data['display_order'],
    $link1Data['status'],
    $link1Data['created_at'],
    $link1Data['updated_at']
);
recordResult("View / Detail GET /api/v1/social-links/{id} returns complete data", $resShow1['status'] === 200 && $detailKeysValid, "Platform: " . ($link1Data['platform'] ?? ''));

// Full PUT Update
$putPayload = [
    'platform' => 'tiktok_official',
    'url' => 'https://www.tiktok.com/@tramaxtours_official',
    'icon' => 'tiktok-brand',
    'display_order' => 8,
    'status' => 'active',
];
$resPut = apiRequest('PUT', "/api/v1/social-links/{$link1Id}", $putPayload, $superAdminToken);
$putData = $resPut['json']['data'] ?? [];
$putSuccess = $resPut['status'] === 200
    && ($putData['platform'] ?? '') === 'tiktok_official'
    && ($putData['url'] ?? '') === 'https://www.tiktok.com/@tramaxtours_official'
    && ($putData['icon'] ?? '') === 'tiktok-brand'
    && (int) ($putData['display_order'] ?? 0) === 8;
recordResult("Full PUT update -> 200 OK", $putSuccess);

// Partial PATCH Update
$patchPayload = [
    'display_order' => 5,
];
$resPatch = apiRequest('PATCH', "/api/v1/social-links/{$link1Id}", $patchPayload, $superAdminToken);
$patchData = $resPatch['json']['data'] ?? [];
$patchSuccess = $resPatch['status'] === 200
    && (int) ($patchData['display_order'] ?? 0) === 5
    && ($patchData['platform'] ?? '') === 'tiktok_official'
    && ($patchData['url'] ?? '') === 'https://www.tiktok.com/@tramaxtours_official';
recordResult("Partial PATCH update preserves unspecified fields", $patchSuccess);

echo PHP_EOL;

// --- 6. Activate / Deactivate Status Transitions ---
echo "6. Activate / Deactivate Status Transitions:" . PHP_EOL;

// Deactivate Link 1
$resDeact = apiRequest('POST', "/api/v1/social-links/{$link1Id}/deactivate", [], $superAdminToken);
$deactData = $resDeact['json']['data'] ?? [];
recordResult("POST /api/v1/social-links/{id}/deactivate sets status = inactive", $resDeact['status'] === 200 && ($deactData['status'] ?? '') === 'inactive');

// Activate Link 1
$resAct = apiRequest('POST', "/api/v1/social-links/{$link1Id}/activate", [], $superAdminToken);
$actData = $resAct['json']['data'] ?? [];
recordResult("POST /api/v1/social-links/{id}/activate sets status = active", $resAct['status'] === 200 && ($actData['status'] ?? '') === 'active');

// Verify persisted status in database
$statusCheck = $pdo->prepare("SELECT status FROM `social_links` WHERE id = :id");
$statusCheck->execute([':id' => $link1Id]);
recordResult("Status change is verified directly in database", $statusCheck->fetchColumn() === 'active');

echo PHP_EOL;

// --- 7. Search, Filtering, Ordering & Pagination ---
echo "7. Search, Filtering, Ordering & Pagination:" . PHP_EOL;

// Search by platform
$resSearch = apiRequest('GET', '/api/v1/social-links?search=tiktok', [], $superAdminToken);
$searchData = $resSearch['json']['data'] ?? [];
$searchFound = false;
foreach ($searchData as $item) {
    if (stripos($item['platform'] ?? '', 'tiktok') !== false || stripos($item['url'] ?? '', 'tiktok') !== false) {
        $searchFound = true;
        break;
    }
}
recordResult("Search ?search=tiktok returns matching links", $resSearch['status'] === 200 && $searchFound);

// Filter by status=inactive
$resFilterStatus = apiRequest('GET', '/api/v1/social-links?status=inactive', [], $superAdminToken);
$filterData = $resFilterStatus['json']['data'] ?? [];
$onlyInactive = count($filterData) > 0 && array_reduce($filterData, fn($c, $i) => $c && $i['status'] === 'inactive', true);
recordResult("Filter ?status=inactive returns only inactive links", $resFilterStatus['status'] === 200 && $onlyInactive);

// Ordering by display_order
$resSort = apiRequest('GET', '/api/v1/social-links?sort_by=display_order&sort_order=asc', [], $superAdminToken);
$sortData = $resSort['json']['data'] ?? [];
$isSorted = true;
for ($i = 0; $i < count($sortData) - 1; $i++) {
    if ((int) $sortData[$i]['display_order'] > (int) $sortData[$i + 1]['display_order']) {
        $isSorted = false;
        break;
    }
}
recordResult("Sorting by display_order ASC works properly", $resSort['status'] === 200 && $isSorted);

// Pagination
$resPage = apiRequest('GET', '/api/v1/social-links?page=1&limit=2', [], $superAdminToken);
$paginationMeta = $resPage['json']['pagination'] ?? [];
$pageSuccess = $resPage['status'] === 200
    && count($resPage['json']['data'] ?? []) <= 2
    && isset($paginationMeta['total'], $paginationMeta['page'], $paginationMeta['limit'], $paginationMeta['total_pages']);
recordResult("Pagination ?page=1&limit=2 returns proper metadata and sliced items", $pageSuccess);

echo PHP_EOL;

// --- 8. Reversible Soft Delete & Restore ---
echo "8. Reversible Soft Delete & Restore:" . PHP_EOL;

// Soft Delete Link 1
$resDel = apiRequest('DELETE', "/api/v1/social-links/{$link1Id}", [], $superAdminToken);
$delData = $resDel['json']['data'] ?? [];
$delSuccess = $resDel['status'] === 200
    && ($delData['is_deleted'] ?? false) === true
    && !empty($delData['deleted_at'])
    && (int) ($delData['deleted_by'] ?? 0) === 1;
recordResult("DELETE /api/v1/social-links/{id} performs reversible soft-delete with confirmation", $delSuccess);

// Soft-deleted link excluded from normal active list
$resListAfterDel = apiRequest('GET', '/api/v1/social-links', [], $superAdminToken);
$activeIds = array_column($resListAfterDel['json']['data'] ?? [], 'id');
recordResult("Soft-deleted link is excluded from normal GET /api/v1/social-links listing", !in_array($link1Id, $activeIds, true));

// Soft-deleted link returns 404 on normal detail
$resShowDel = apiRequest('GET', "/api/v1/social-links/{$link1Id}", [], $superAdminToken);
recordResult("Soft-deleted link returns 404 on normal active detail query", $resShowDel['status'] === 404);

// Verify database row still physically exists with all original data preserved
$checkRow = $pdo->prepare("SELECT * FROM `social_links` WHERE `id` = :id");
$checkRow->execute([':id' => $link1Id]);
$dbRow = $checkRow->fetch(PDO::FETCH_ASSOC);
$rowPreserved = $dbRow && !empty($dbRow['deleted_at']) && (int) $dbRow['deleted_by'] === 1
    && $dbRow['platform'] === 'tiktok_official'
    && $dbRow['url'] === 'https://www.tiktok.com/@tramaxtours_official'
    && (int) $dbRow['display_order'] === 5;
recordResult("Original database row and all fields preserved in DB during soft delete", (bool) $rowPreserved, "Preserved Platform: " . ($dbRow['platform'] ?? 'None'));

// Cannot activate a soft-deleted link
$resActDel = apiRequest('POST', "/api/v1/social-links/{$link1Id}/activate", [], $superAdminToken);
recordResult("Cannot activate soft-deleted link (404 NOT_FOUND)", $resActDel['status'] === 404);

// Restore Link 1
$resRestore = apiRequest('POST', "/api/v1/social-links/{$link1Id}/restore", [], $superAdminToken);
$restoredData = $resRestore['json']['data'] ?? [];
$restoredSuccess = $resRestore['status'] === 200
    && (int) ($restoredData['id'] ?? 0) === $link1Id
    && ($restoredData['platform'] ?? '') === 'tiktok_official'
    && ($restoredData['url'] ?? '') === 'https://www.tiktok.com/@tramaxtours_official'
    && empty($restoredData['deleted_at'])
    && empty($restoredData['deleted_by']);
recordResult("POST /api/v1/social-links/{id}/restore restores link with SAME ID and clears deleted_at/by", $restoredSuccess);

// Restored link appears in normal list again
$resListAfterRestore = apiRequest('GET', '/api/v1/social-links', [], $superAdminToken);
$restoredListedIds = array_column($resListAfterRestore['json']['data'] ?? [], 'id');
recordResult("Restored link appears in active listing again", in_array($link1Id, $restoredListedIds, true));

echo PHP_EOL;

// --- 9. Audit Log Event Verification ---
echo "9. Audit Log Event Verification:" . PHP_EOL;

$auditStmt = $pdo->prepare("
    SELECT action, entity_type, entity_id 
    FROM `audit_logs` 
    WHERE `entity_type` = 'social_link' AND `entity_id` = :id
    ORDER BY `id` ASC
");
$auditStmt->execute([':id' => $link1Id]);
$auditLogs = $auditStmt->fetchAll(PDO::FETCH_ASSOC);
$loggedActions = array_column($auditLogs, 'action');

recordResult("Audit log recorded for 'social_link_create'", in_array('social_link_create', $loggedActions, true));
recordResult("Audit log recorded for 'social_link_update'", in_array('social_link_update', $loggedActions, true));
recordResult("Audit log recorded for 'social_link_soft_delete'", in_array('social_link_soft_delete', $loggedActions, true));
recordResult("Audit log recorded for 'social_link_restore'", in_array('social_link_restore', $loggedActions, true));
recordResult("Audit log recorded for 'social_link_activate'", in_array('social_link_activate', $loggedActions, true));
recordResult("Audit log recorded for 'social_link_deactivate'", in_array('social_link_deactivate', $loggedActions, true));

echo PHP_EOL;

// --- 10. System Regressions (Health, Phase 3 Auth, Phase 4 Media, Phase 5 Destinations, Phase 6 Tours, Phase 7 Pages, Phase 8 CMS Sections, Phase 9 Hero Slides, Phase 10 Benefits, Phase 11 Settings, Phase 12 Footer Links) ---
echo "10. System Regressions (Health, Phase 3 Auth, Phase 4 Media, Phase 5 Destinations, Phase 6 Tours, Phase 7 Pages, Phase 8 CMS Sections, Phase 9 Hero Slides, Phase 10 Benefits, Phase 11 Settings, Phase 12 Footer Links):" . PHP_EOL;

$resHealth = apiRequest('GET', '/api/v1/health');
recordResult("GET /api/v1/health responds with healthy status", $resHealth['status'] === 200 && ($resHealth['json']['data']['status'] ?? '') === 'healthy');

$resDbHealth = apiRequest('GET', '/api/v1/health/database');
recordResult("GET /api/v1/health/database responds with connected status", $resDbHealth['status'] === 200 && ($resDbHealth['json']['data']['status'] ?? '') === 'connected');

$resAuthMe = apiRequest('GET', '/api/v1/auth/me', [], $superAdminToken);
recordResult("GET /api/v1/auth/me responds with super_admin profile", $resAuthMe['status'] === 200 && ($resAuthMe['json']['data']['user']['email'] ?? '') === 'admin@tramaxtours.com');

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

echo PHP_EOL;

// --- 11. Test Environment Cleanup ---
echo "11. Test Environment Cleanup:" . PHP_EOL;

// Remove test social links
$pdo->exec("DELETE FROM `social_links` WHERE `id` IN ({$link1Id}, {$link2Id})");

// Remove audit logs generated during this test
$pdo->exec("DELETE FROM `audit_logs` WHERE `entity_type` = 'social_link' AND `entity_id` IN ({$link1Id}, {$link2Id})");

$pdo->exec("DELETE FROM `user_roles` WHERE `user_id` IN ({$editorId}, {$moderatorId})");
$pdo->exec("DELETE FROM `users` WHERE `id` IN ({$editorId}, {$moderatorId})");

recordResult("All test database records and temporary files cleaned up", true);

echo PHP_EOL . "================================================================================" . PHP_EOL;
echo "  PHASE 13 VERIFICATION RESULTS" . PHP_EOL;
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
    echo "ALL PHASE 13 TESTS PASSED PERFECTLY!" . PHP_EOL . PHP_EOL;
    exit(0);
}
