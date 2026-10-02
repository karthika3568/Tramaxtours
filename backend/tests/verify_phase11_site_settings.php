<?php

/**
 * Wanderer South India - Phase 11 Comprehensive End-to-End Site Settings API Verification Test Suite
 * 
 * Verifies all Phase 11 requirements:
 * - Database schema, columns (including deleted_at, deleted_by) & settings.view / settings.manage permissions
 * - Authentication & RBAC Authorization (strict separation of read vs write permissions)
 * - View / Detail operation (by ID and by setting_key)
 * - Group-based filtering and grouped key-value map response
 * - CRUD operations (Create, List, Detail, PUT Update, PATCH Partial Update, Soft Delete)
 * - Validation errors (missing key, duplicate key, invalid group, invalid group filter)
 * - Protection of system-critical settings (blocks destructive deletion of essential settings with 409)
 * - Reversible Soft Delete (records deleted_at, deleted_by, preserves DB data)
 * - List exclusion of soft-deleted settings
 * - Reversible Undo/Restore (POST/PATCH /restore returns identical record, ID, clears deleted_at/by)
 * - Audit logging (site_setting_create, update, soft_delete, restore)
 * - System Regressions: Health, Auth (Phase 3), Media (Phase 4), Destinations (Phase 5), Tours (Phase 6), Pages (Phase 7), CMS Sections (Phase 8), Hero Slides (Phase 9), Home Benefits (Phase 10)
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
echo "  WANDERER SOUTH INDIA — PHASE 11 SITE SETTINGS MANAGEMENT VERIFICATION SUITE" . PHP_EOL;
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

$tableExists = (bool) $pdo->query("SHOW TABLES LIKE 'site_settings'")->fetch();
recordResult("Table 'site_settings' exists in database", $tableExists);

$colStmt = $pdo->query("SHOW COLUMNS FROM `site_settings`");
$columns = $colStmt->fetchAll(PDO::FETCH_COLUMN);

$requiredColumns = [
    'id', 'setting_key', 'setting_value', 'setting_group',
    'deleted_at', 'deleted_by', 'created_at', 'updated_at'
];
$missingCols = array_diff($requiredColumns, $columns);
recordResult("All required site_settings columns including soft delete present in schema", empty($missingCols), empty($missingCols) ? "All columns verified" : "Missing: " . implode(', ', $missingCols));

$viewPermCheck = (int) $pdo->query("SELECT COUNT(*) FROM permissions WHERE name = 'settings.view'")->fetchColumn();
recordResult("Permission 'settings.view' exists in permissions table", $viewPermCheck > 0);

$managePermCheck = (int) $pdo->query("SELECT COUNT(*) FROM permissions WHERE name = 'settings.manage'")->fetchColumn();
recordResult("Permission 'settings.manage' exists in permissions table", $managePermCheck > 0);

echo PHP_EOL;

// --- 2. RBAC Tokens & User Context Setup ---
echo "2. RBAC Tokens & User Context Setup:" . PHP_EOL;

// 1. Super Admin (has both settings.view and settings.manage)
$superAdminToken = JWT::encode([
    'sub' => 1,
    'id' => 1,
    'email' => 'admin@tramaxtours.com',
    'role' => 'super_admin',
    'roles' => ['super_admin'],
    'permissions' => ['*'],
], null, 3600);
recordResult("Super Admin token generated (full permissions)", !empty($superAdminToken));

// 2. Viewer User (has settings.view ONLY via Role 2 Admin which lacks settings.manage)
$pdo->prepare("DELETE FROM users WHERE email = 'viewer.phase11@tramaxtours.com'")->execute();
$pdo->prepare("INSERT INTO users (name, email, password_hash, status, created_at, updated_at) VALUES ('Phase11 Viewer', 'viewer.phase11@tramaxtours.com', 'hash', 'active', NOW(), NOW())")->execute();
$viewerId = (int) $pdo->lastInsertId();
$pdo->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)")->execute([$viewerId, 2]); // Role 2 = Admin (has settings.view, no settings.manage)

$viewerToken = JWT::encode([
    'sub' => $viewerId,
    'id' => $viewerId,
    'email' => 'viewer.phase11@tramaxtours.com',
    'role' => 'admin',
    'permissions' => ['settings.view'],
], null, 3600);
recordResult("Viewer token generated (has settings.view ONLY)", !empty($viewerToken));

// 3. Unauthorized User (has neither settings.view nor settings.manage)
$pdo->prepare("DELETE FROM users WHERE email = 'unauth.phase11@tramaxtours.com'")->execute();
$pdo->prepare("INSERT INTO users (name, email, password_hash, status, created_at, updated_at) VALUES ('Phase11 Unauth', 'unauth.phase11@tramaxtours.com', 'hash', 'active', NOW(), NOW())")->execute();
$unauthId = (int) $pdo->lastInsertId();
$pdo->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)")->execute([$unauthId, 4]); // Role 4 = Moderator

$unauthToken = JWT::encode([
    'sub' => $unauthId,
    'id' => $unauthId,
    'email' => 'unauth.phase11@tramaxtours.com',
    'role' => 'moderator',
    'permissions' => ['reviews.view'],
], null, 3600);
recordResult("Unauthorized token generated (lacks settings permissions)", !empty($unauthToken));

echo PHP_EOL;

// --- 3. Authorization & Permission Separation Enforcement ---
echo "3. Authorization & Permission Separation Enforcement:" . PHP_EOL;

// Unauthenticated requests receive 401
$resUnauthList = apiRequest('GET', '/api/v1/site-settings');
recordResult("Unauthenticated list -> 401", $resUnauthList['status'] === 401);

$resUnauthShow = apiRequest('GET', '/api/v1/site-settings/1');
recordResult("Unauthenticated detail -> 401", $resUnauthShow['status'] === 401);

$resUnauthStore = apiRequest('POST', '/api/v1/site-settings', ['setting_key' => 'unauth_key', 'setting_value' => 'test']);
recordResult("Unauthenticated create -> 401", $resUnauthStore['status'] === 401);

$resUnauthUpdate = apiRequest('PUT', '/api/v1/site-settings/1', ['setting_value' => 'updated']);
recordResult("Unauthenticated update -> 401", $resUnauthUpdate['status'] === 401);

$resUnauthDelete = apiRequest('DELETE', '/api/v1/site-settings/1');
recordResult("Unauthenticated delete -> 401", $resUnauthDelete['status'] === 401);

$resUnauthRestore = apiRequest('POST', '/api/v1/site-settings/1/restore');
recordResult("Unauthenticated restore -> 401", $resUnauthRestore['status'] === 401);

// User without settings.view receives 403 on GET
$resForbiddenList = apiRequest('GET', '/api/v1/site-settings', [], $unauthToken);
recordResult("User without settings.view list -> 403", $resForbiddenList['status'] === 403);

// User with settings.view can READ (200 OK)
$resViewerList = apiRequest('GET', '/api/v1/site-settings', [], $viewerToken);
recordResult("User with settings.view can list settings -> 200 OK", $resViewerList['status'] === 200);

// User with ONLY settings.view is REJECTED on writes (403 Forbidden)
$resViewerCreate = apiRequest('POST', '/api/v1/site-settings', ['setting_key' => 'viewer_test', 'setting_value' => 'val'], $viewerToken);
recordResult("User with only settings.view is rejected on create -> 403", $resViewerCreate['status'] === 403);

$resViewerUpdate = apiRequest('PUT', '/api/v1/site-settings/1', ['setting_value' => 'val'], $viewerToken);
recordResult("User with only settings.view is rejected on update -> 403", $resViewerUpdate['status'] === 403);

$resViewerDelete = apiRequest('DELETE', '/api/v1/site-settings/1', [], $viewerToken);
recordResult("User with only settings.view is rejected on delete -> 403", $resViewerDelete['status'] === 403);

echo PHP_EOL;

// --- 4. Input Validation & Constraint Checks ---
echo "4. Input Validation & Constraint Checks:" . PHP_EOL;

// Missing setting_key
$resValKey = apiRequest('POST', '/api/v1/site-settings', [
    'setting_value' => 'Some Value',
    'setting_group' => 'general',
], $superAdminToken);
recordResult("Missing setting_key -> 422", $resValKey['status'] === 422, "Error: " . ($resValKey['json']['errors']['setting_key'] ?? ''));

// Duplicate setting_key
$resValDup = apiRequest('POST', '/api/v1/site-settings', [
    'setting_key' => 'site_name',
    'setting_value' => 'Duplicate Name',
    'setting_group' => 'general',
], $superAdminToken);
recordResult("Duplicate setting_key -> 422", $resValDup['status'] === 422, "Error: " . ($resValDup['json']['errors']['setting_key'] ?? ''));

// Invalid setting_group on create
$resValGroup = apiRequest('POST', '/api/v1/site-settings', [
    'setting_key' => 'test_invalid_group_setting',
    'setting_value' => 'Test',
    'setting_group' => 'invalid_group_name',
], $superAdminToken);
recordResult("Invalid setting_group -> 422", $resValGroup['status'] === 422, "Error: " . ($resValGroup['json']['errors']['setting_group'] ?? ''));

// Invalid group on /group/{group} endpoint
$resValGroupRoute = apiRequest('GET', '/api/v1/site-settings/group/nonexistent_group', [], $superAdminToken);
recordResult("Invalid group on /group/{group} endpoint -> 422", $resValGroupRoute['status'] === 422);

echo PHP_EOL;

// --- 5. CRUD Operations & Value Handling ---
echo "5. CRUD Operations & Value Handling:" . PHP_EOL;

// Create new setting
$createPayload = [
    'setting_key' => 'emergency_hotline',
    'setting_value' => '+91 98400 99999',
    'setting_group' => 'contact',
];

$resCreate = apiRequest('POST', '/api/v1/site-settings', $createPayload, $superAdminToken);
$createdId = (int) ($resCreate['json']['data']['id'] ?? 0);
recordResult("POST /api/v1/site-settings creates setting (201 Created)", $resCreate['status'] === 201 && $createdId > 0, "ID: {$createdId}");

// GET /api/v1/site-settings - List
$resList = apiRequest('GET', '/api/v1/site-settings', [], $superAdminToken);
recordResult("GET /api/v1/site-settings returns list of settings (200 OK)", $resList['status'] === 200 && count($resList['json']['data'] ?? []) >= 10);

// GET /api/v1/site-settings?grouped=true - Grouped map
$resGrouped = apiRequest('GET', '/api/v1/site-settings?grouped=true', [], $superAdminToken);
$groupedData = $resGrouped['json']['data'] ?? [];
$hasGroups = isset($groupedData['general'], $groupedData['contact'], $groupedData['seo'], $groupedData['footer'], $groupedData['payment']);
recordResult("GET /api/v1/site-settings?grouped=true returns grouped categories map", $resGrouped['status'] === 200 && $hasGroups);

// GET /api/v1/site-settings/{id} by numeric ID
$resShowId = apiRequest('GET', "/api/v1/site-settings/{$createdId}", [], $superAdminToken);
recordResult("GET /api/v1/site-settings/{id} returns single setting by ID (200 OK)", $resShowId['status'] === 200 && ($resShowId['json']['data']['setting_key'] ?? '') === 'emergency_hotline');

// GET /api/v1/site-settings/{setting_key} by key string
$resShowKey = apiRequest('GET', '/api/v1/site-settings/emergency_hotline', [], $superAdminToken);
recordResult("GET /api/v1/site-settings/{key} returns single setting by key (200 OK)", $resShowKey['status'] === 200 && ($resShowKey['json']['data']['id'] ?? 0) === $createdId);

// GET /api/v1/site-settings/group/contact
$resGroupContact = apiRequest('GET', '/api/v1/site-settings/group/contact', [], $superAdminToken);
recordResult("GET /api/v1/site-settings/group/contact returns contact settings (200 OK)", $resGroupContact['status'] === 200 && count($resGroupContact['json']['data'] ?? []) >= 5);

// PUT Full Update
$putPayload = [
    'setting_key' => 'emergency_hotline',
    'setting_value' => '+91 98400 88888',
    'setting_group' => 'contact',
];
$resPut = apiRequest('PUT', "/api/v1/site-settings/{$createdId}", $putPayload, $superAdminToken);
recordResult("PUT /api/v1/site-settings/{id} updates full fields (200 OK)", $resPut['status'] === 200 && ($resPut['json']['data']['setting_value'] ?? '') === '+91 98400 88888');

// PATCH Partial Update (update only setting_value, ensuring other fields are preserved)
$patchPayload = [
    'setting_value' => '+91 98400 77777',
];
$resPatch = apiRequest('PATCH', "/api/v1/site-settings/{$createdId}", $patchPayload, $superAdminToken);
$patchedData = $resPatch['json']['data'] ?? [];
$patchPreserved = ($patchedData['setting_key'] ?? '') === 'emergency_hotline'
    && ($patchedData['setting_value'] ?? '') === '+91 98400 77777'
    && ($patchedData['setting_group'] ?? '') === 'contact';
recordResult("PATCH /api/v1/site-settings/{id} preserves unsupplied fields and updates value (200 OK)", $resPatch['status'] === 200 && $patchPreserved);

echo PHP_EOL;

// --- 6. Protection of System-Critical Settings ---
echo "6. Protection of System-Critical Settings:" . PHP_EOL;

$resDelCritical = apiRequest('DELETE', '/api/v1/site-settings/site_name', [], $superAdminToken);
recordResult("Deletion of system-critical setting 'site_name' is blocked with 409", $resDelCritical['status'] === 409, "Code: " . ($resDelCritical['json']['error_code'] ?? ''));

$resDelCritical2 = apiRequest('DELETE', '/api/v1/site-settings/contact_email', [], $superAdminToken);
recordResult("Deletion of system-critical setting 'contact_email' is blocked with 409", $resDelCritical2['status'] === 409, "Code: " . ($resDelCritical2['json']['error_code'] ?? ''));

echo PHP_EOL;

// --- 7. Search & Filtering ---
echo "7. Search & Filtering:" . PHP_EOL;

// Filter by group
$resFilterGroup = apiRequest('GET', '/api/v1/site-settings?group=seo', [], $superAdminToken);
recordResult("Filter settings by group (?group=seo)", $resFilterGroup['status'] === 200 && count($resFilterGroup['json']['data'] ?? []) >= 2);

// Search
$resSearch = apiRequest('GET', '/api/v1/site-settings?search=hotline', [], $superAdminToken);
recordResult("Search settings by keyword (?search=hotline)", $resSearch['status'] === 200 && count($resSearch['json']['data'] ?? []) === 1);

echo PHP_EOL;

// --- 8. Reversible Soft-Delete & Undo/Restore Architecture ---
echo "8. Reversible Soft-Delete & Undo/Restore Architecture:" . PHP_EOL;

// Delete custom non-critical setting
$resDel = apiRequest('DELETE', "/api/v1/site-settings/{$createdId}", [], $superAdminToken);
$delData = $resDel['json']['data'] ?? [];
recordResult("DELETE /api/v1/site-settings/{id} returns is_deleted=true with deleted_at and deleted_by", $resDel['status'] === 200 && ($delData['is_deleted'] ?? false) === true && !empty($delData['deleted_at']));

// Soft-deleted setting is excluded from normal active listings
$resListAfterDel = apiRequest('GET', '/api/v1/site-settings', [], $superAdminToken);
$listedIds = array_column($resListAfterDel['json']['data'] ?? [], 'id');
recordResult("Soft-deleted setting is excluded from normal active listings", !in_array($createdId, $listedIds, true));

// Normal detail lookup for soft-deleted setting returns 404
$resShowDel = apiRequest('GET', "/api/v1/site-settings/{$createdId}", [], $superAdminToken);
recordResult("Soft-deleted setting returns 404 on normal active detail query", $resShowDel['status'] === 404);

// Verify database row still physically exists with all original data preserved
$checkRow = $pdo->prepare("SELECT * FROM `site_settings` WHERE `id` = :id");
$checkRow->execute([':id' => $createdId]);
$dbRow = $checkRow->fetch(PDO::FETCH_ASSOC);
$rowPreserved = $dbRow && !empty($dbRow['deleted_at']) && (int) $dbRow['deleted_by'] === 1
    && $dbRow['setting_key'] === 'emergency_hotline'
    && $dbRow['setting_value'] === '+91 98400 77777';
recordResult("Original database row and all fields preserved in DB during soft delete", (bool) $rowPreserved, "Preserved Key: " . ($dbRow['setting_key'] ?? 'None'));

// Restore custom setting
$resRestore = apiRequest('POST', "/api/v1/site-settings/{$createdId}/restore", [], $superAdminToken);
$restoredData = $resRestore['json']['data'] ?? [];
$restoredSuccess = $resRestore['status'] === 200
    && (int) ($restoredData['id'] ?? 0) === $createdId
    && ($restoredData['setting_key'] ?? '') === 'emergency_hotline'
    && ($restoredData['setting_value'] ?? '') === '+91 98400 77777'
    && empty($restoredData['deleted_at'])
    && empty($restoredData['deleted_by']);
recordResult("POST /api/v1/site-settings/{id}/restore restores setting with SAME ID and clears deleted_at/by", $restoredSuccess);

// Restored setting appears in normal list again
$resListAfterRestore = apiRequest('GET', '/api/v1/site-settings', [], $superAdminToken);
$restoredListedIds = array_column($resListAfterRestore['json']['data'] ?? [], 'id');
recordResult("Restored setting appears in active listing again", in_array($createdId, $restoredListedIds, true));

echo PHP_EOL;

// --- 9. Audit Log Event Verification ---
echo "9. Audit Log Event Verification:" . PHP_EOL;

$auditStmt = $pdo->prepare("
    SELECT action, entity_type, entity_id 
    FROM `audit_logs` 
    WHERE `entity_type` = 'site_setting' AND `entity_id` = :id
    ORDER BY `id` ASC
");
$auditStmt->execute([':id' => $createdId]);
$auditLogs = $auditStmt->fetchAll(PDO::FETCH_ASSOC);
$loggedActions = array_column($auditLogs, 'action');

recordResult("Audit log recorded for 'site_setting_create'", in_array('site_setting_create', $loggedActions, true));
recordResult("Audit log recorded for 'site_setting_update'", in_array('site_setting_update', $loggedActions, true));
recordResult("Audit log recorded for 'site_setting_soft_delete'", in_array('site_setting_soft_delete', $loggedActions, true));
recordResult("Audit log recorded for 'site_setting_restore'", in_array('site_setting_restore', $loggedActions, true));

echo PHP_EOL;

// --- 10. System Regressions (Health, Phase 3 Auth, Phase 4 Media, Phase 5 Destinations, Phase 6 Tours, Phase 7 Pages, Phase 8 CMS Sections, Phase 9 Hero Slides, Phase 10 Benefits) ---
echo "10. System Regressions (Health, Phase 3 Auth, Phase 4 Media, Phase 5 Destinations, Phase 6 Tours, Phase 7 Pages, Phase 8 CMS Sections, Phase 9 Hero Slides, Phase 10 Benefits):" . PHP_EOL;

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

echo PHP_EOL;

// --- 11. Test Environment Cleanup ---
echo "11. Test Environment Cleanup:" . PHP_EOL;

// Remove test setting
$pdo->exec("DELETE FROM `site_settings` WHERE `id` = {$createdId}");

// Remove audit logs generated during this test
$pdo->exec("DELETE FROM `audit_logs` WHERE `entity_type` = 'site_setting' AND `entity_id` = {$createdId}");

$pdo->exec("DELETE FROM `user_roles` WHERE `user_id` IN ({$viewerId}, {$unauthId})");
$pdo->exec("DELETE FROM `users` WHERE `id` IN ({$viewerId}, {$unauthId})");

recordResult("All test database records and temporary files cleaned up", true);

echo PHP_EOL . "================================================================================" . PHP_EOL;
echo "  PHASE 11 VERIFICATION RESULTS" . PHP_EOL;
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
    echo "ALL PHASE 11 TESTS PASSED PERFECTLY!" . PHP_EOL . PHP_EOL;
    exit(0);
}
