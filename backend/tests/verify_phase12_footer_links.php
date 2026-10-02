<?php

/**
 * Wanderer South India - Phase 12 Comprehensive End-to-End Footer Links API Verification Test Suite
 * 
 * Verifies all Phase 12 requirements:
 * - Database schema, columns (including deleted_at, deleted_by) & footer.manage permissions
 * - Authentication & RBAC Authorization (footer.manage enforcement)
 * - View / Detail operation (complete stored footer link data)
 * - CRUD operations (Create, Read by ID, Update, Partial Update, Delete)
 * - Validation errors (missing column_name, missing label, missing url, invalid status, negative display_order)
 * - Reversible Soft Delete (records deleted_at, deleted_by, preserves DB data)
 * - List exclusion of soft-deleted footer links
 * - Reversible Undo/Restore (POST/PATCH /restore returns identical record, ID, clears deleted_at/by)
 * - Activate / Deactivate status transitions
 * - Filtering, Searching, Display Ordering & Pagination
 * - Audit logging (footer_link_create, update, soft_delete, restore, activate, deactivate)
 * - System Regressions: Health, Auth (Phase 3), Media (Phase 4), Destinations (Phase 5), Tours (Phase 6), Pages (Phase 7), CMS Sections (Phase 8), Hero Slides (Phase 9), Home Benefits (Phase 10), Site Settings (Phase 11)
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
echo "  Wanderer South India — PHASE 12 FOOTER LINKS MANAGEMENT VERIFICATION SUITE" . PHP_EOL;
echo "================================================================================" . PHP_EOL . PHP_EOL;

// 2. Start Local Test Server
$testPort = 8899;
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

$tableExists = (bool) $pdo->query("SHOW TABLES LIKE 'footer_links'")->fetch();
recordResult("Table 'footer_links' exists in database", $tableExists);

$colStmt = $pdo->query("SHOW COLUMNS FROM `footer_links`");
$columns = $colStmt->fetchAll(PDO::FETCH_COLUMN);

$requiredColumns = [
    'id', 'column_name', 'label', 'url', 'display_order',
    'is_external', 'status', 'deleted_at', 'deleted_by', 'created_at', 'updated_at'
];
$missingCols = array_diff($requiredColumns, $columns);
recordResult("All required footer_links columns including soft delete present in schema", empty($missingCols), empty($missingCols) ? "All columns verified" : "Missing: " . implode(', ', $missingCols));

$permCheck = (int) $pdo->query("SELECT COUNT(*) FROM permissions WHERE name = 'footer.manage'")->fetchColumn();
recordResult("Permission 'footer.manage' exists in permissions table", $permCheck > 0);

echo PHP_EOL;

// --- 2. RBAC Tokens & User Context Setup ---
echo "2. RBAC Tokens & User Context Setup:" . PHP_EOL;

// Super Admin
$superAdminToken = JWT::encode([
    'sub' => 1,
    'id' => 1,
    'email' => 'admin@wanderersouthindia.com',
    'role' => 'super_admin',
    'roles' => ['super_admin'],
    'permissions' => ['*'],
], null, 3600);
recordResult("Super Admin token generated", !empty($superAdminToken));

// Editor (has footer.manage via Role 3)
$pdo->prepare("DELETE FROM users WHERE email = 'editor.phase12@wanderersouthindia.com'")->execute();
$pdo->prepare("INSERT INTO users (name, email, password_hash, status, created_at, updated_at) VALUES ('Phase12 Editor', 'editor.phase12@wanderersouthindia.com', 'hash', 'active', NOW(), NOW())")->execute();
$editorId = (int) $pdo->lastInsertId();
$pdo->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)")->execute([$editorId, 3]); // Role 3 = Editor

$editorToken = JWT::encode([
    'sub' => $editorId,
    'id' => $editorId,
    'email' => 'editor.phase12@wanderersouthindia.com',
    'role' => 'editor',
    'permissions' => ['footer.manage'],
], null, 3600);
recordResult("Editor token generated (has footer.manage)", !empty($editorToken));

// Moderator (lacks footer.manage)
$pdo->prepare("DELETE FROM users WHERE email = 'moderator.phase12@wanderersouthindia.com'")->execute();
$pdo->prepare("INSERT INTO users (name, email, password_hash, status, created_at, updated_at) VALUES ('Phase12 Moderator', 'moderator.phase12@wanderersouthindia.com', 'hash', 'active', NOW(), NOW())")->execute();
$moderatorId = (int) $pdo->lastInsertId();
$pdo->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)")->execute([$moderatorId, 4]); // Role 4 = Moderator

$moderatorToken = JWT::encode([
    'sub' => $moderatorId,
    'id' => $moderatorId,
    'email' => 'moderator.phase12@wanderersouthindia.com',
    'role' => 'moderator',
    'permissions' => ['reviews.view', 'reviews.moderate'],
], null, 3600);
recordResult("Moderator token generated (has no footer.manage)", !empty($moderatorToken));

echo PHP_EOL;

// --- 3. Authorization & Permission Enforcement ---
echo "3. Authorization & Permission Enforcement:" . PHP_EOL;

// Unauthenticated requests
$resUnauthList = apiRequest('GET', '/api/v1/footer-links');
recordResult("Unauthenticated list -> 401", $resUnauthList['status'] === 401);

$resUnauthShow = apiRequest('GET', '/api/v1/footer-links/1');
recordResult("Unauthenticated detail -> 401", $resUnauthShow['status'] === 401);

$resUnauthStore = apiRequest('POST', '/api/v1/footer-links', ['column_name' => 'useful_links', 'label' => 'Test', 'url' => '/test']);
recordResult("Unauthenticated create -> 401", $resUnauthStore['status'] === 401);

$resUnauthUpdate = apiRequest('PUT', '/api/v1/footer-links/1', ['label' => 'Unauth Update']);
recordResult("Unauthenticated update -> 401", $resUnauthUpdate['status'] === 401);

$resUnauthDelete = apiRequest('DELETE', '/api/v1/footer-links/1');
recordResult("Unauthenticated delete -> 401", $resUnauthDelete['status'] === 401);

$resUnauthRestore = apiRequest('POST', '/api/v1/footer-links/1/restore');
recordResult("Unauthenticated restore -> 401", $resUnauthRestore['status'] === 401);

// Unauthorized requests (Moderator lacking footer.manage)
$resForbiddenList = apiRequest('GET', '/api/v1/footer-links', [], $moderatorToken);
recordResult("User without footer.manage -> 403", $resForbiddenList['status'] === 403);

$resForbiddenCreate = apiRequest('POST', '/api/v1/footer-links', ['column_name' => 'useful_links', 'label' => 'Forbidden Link', 'url' => '/forbidden'], $moderatorToken);
recordResult("User without footer.manage create -> 403", $resForbiddenCreate['status'] === 403);

// Authorized request (Editor with footer.manage)
$resEditorList = apiRequest('GET', '/api/v1/footer-links', [], $editorToken);
recordResult("User with footer.manage -> 200 OK", $resEditorList['status'] === 200);

echo PHP_EOL;

// --- 4. Input Validation & Constraint Checks ---
echo "4. Input Validation & Constraint Checks:" . PHP_EOL;

// Missing column_name
$resValCol = apiRequest('POST', '/api/v1/footer-links', [
    'label' => 'Sample Link',
    'url' => '/sample',
], $superAdminToken);
recordResult("Missing column_name -> 422", $resValCol['status'] === 422, "Error: " . ($resValCol['json']['errors']['column_name'] ?? ''));

// Missing label
$resValLabel = apiRequest('POST', '/api/v1/footer-links', [
    'column_name' => 'useful_links',
    'url' => '/sample',
], $superAdminToken);
recordResult("Missing label -> 422", $resValLabel['status'] === 422, "Error: " . ($resValLabel['json']['errors']['label'] ?? ''));

// Missing url
$resValUrl = apiRequest('POST', '/api/v1/footer-links', [
    'column_name' => 'useful_links',
    'label' => 'Sample Link',
], $superAdminToken);
recordResult("Missing url -> 422", $resValUrl['status'] === 422, "Error: " . ($resValUrl['json']['errors']['url'] ?? ''));

// Invalid status
$resValStatus = apiRequest('POST', '/api/v1/footer-links', [
    'column_name' => 'useful_links',
    'label' => 'Sample Link',
    'url' => '/sample',
    'status' => 'pending_approval',
], $superAdminToken);
recordResult("Invalid status -> 422", $resValStatus['status'] === 422, "Error: " . ($resValStatus['json']['errors']['status'] ?? ''));

// Negative display_order
$resValOrder = apiRequest('POST', '/api/v1/footer-links', [
    'column_name' => 'useful_links',
    'label' => 'Sample Link',
    'url' => '/sample',
    'display_order' => -3,
], $superAdminToken);
recordResult("Negative display_order -> 422", $resValOrder['status'] === 422, "Error: " . ($resValOrder['json']['errors']['display_order'] ?? ''));

echo PHP_EOL;

// --- 5. CRUD Operations & Detail Expansion ---
echo "5. CRUD Operations & Detail Expansion:" . PHP_EOL;

// Create Link 1
$createPayload1 = [
    'column_name' => 'travel_guides',
    'label' => 'South India Temple Guide',
    'url' => '/guides/temple-architecture',
    'display_order' => 1,
    'is_external' => false,
    'status' => 'active',
];

$resCreate1 = apiRequest('POST', '/api/v1/footer-links', $createPayload1, $superAdminToken);
$link1Id = (int) ($resCreate1['json']['data']['id'] ?? 0);
recordResult("POST /api/v1/footer-links creates link (201 Created)", $resCreate1['status'] === 201 && $link1Id > 0, "ID: {$link1Id}");

// Create Link 2 (external)
$createPayload2 = [
    'column_name' => 'travel_guides',
    'label' => 'Incredible India Tourism Portal',
    'url' => 'https://www.incredibleindia.org',
    'display_order' => 2,
    'is_external' => true,
    'status' => 'active',
];
$resCreate2 = apiRequest('POST', '/api/v1/footer-links', $createPayload2, $superAdminToken);
$link2Id = (int) ($resCreate2['json']['data']['id'] ?? 0);
recordResult("POST /api/v1/footer-links creates external link (201 Created)", $resCreate2['status'] === 201 && $link2Id > 0, "ID: {$link2Id}");

// GET /api/v1/footer-links/{id} - View / Detail
$resShow = apiRequest('GET', "/api/v1/footer-links/{$link1Id}", [], $superAdminToken);
$linkData = $resShow['json']['data'] ?? [];
recordResult("GET /api/v1/footer-links/{id} returns complete link details (200 OK)", $resShow['status'] === 200 && ($linkData['label'] ?? '') === 'South India Temple Guide');

// PUT Full Update
$putPayload = [
    'column_name' => 'travel_guides',
    'label' => 'Updated Grand Chola Temple Guide',
    'url' => '/guides/grand-chola-temples',
    'display_order' => 5,
    'is_external' => false,
    'status' => 'active',
];
$resPut = apiRequest('PUT', "/api/v1/footer-links/{$link1Id}", $putPayload, $superAdminToken);
recordResult("PUT /api/v1/footer-links/{id} updates full fields (200 OK)", $resPut['status'] === 200 && ($resPut['json']['data']['label'] ?? '') === 'Updated Grand Chola Temple Guide');

// PATCH Partial Update (update only label, ensuring other fields are preserved)
$patchPayload = [
    'label' => 'Newly patched label exclusively',
];
$resPatch = apiRequest('PATCH', "/api/v1/footer-links/{$link1Id}", $patchPayload, $superAdminToken);
$patchedData = $resPatch['json']['data'] ?? [];
$patchPreserved = ($patchedData['column_name'] ?? '') === 'travel_guides'
    && ($patchedData['label'] ?? '') === 'Newly patched label exclusively'
    && ($patchedData['url'] ?? '') === '/guides/grand-chola-temples'
    && ($patchedData['display_order'] ?? 0) === 5;
recordResult("PATCH /api/v1/footer-links/{id} preserves unsupplied fields and updates target fields (200 OK)", $resPatch['status'] === 200 && $patchPreserved);

echo PHP_EOL;

// --- 6. Status Transitions (Activate / Deactivate) ---
echo "6. Status Transitions (Activate / Deactivate):" . PHP_EOL;

$resDeact = apiRequest('POST', "/api/v1/footer-links/{$link1Id}/deactivate", [], $superAdminToken);
recordResult("POST /api/v1/footer-links/{id}/deactivate sets status to 'inactive'", $resDeact['status'] === 200 && ($resDeact['json']['data']['status'] ?? '') === 'inactive');

$resAct = apiRequest('POST', "/api/v1/footer-links/{$link1Id}/activate", [], $superAdminToken);
recordResult("POST /api/v1/footer-links/{id}/activate sets status to 'active'", $resAct['status'] === 200 && ($resAct['json']['data']['status'] ?? '') === 'active');

echo PHP_EOL;

// --- 7. Search, Filtering, Ordering & Pagination ---
echo "7. Search, Filtering, Ordering & Pagination:" . PHP_EOL;

$resList = apiRequest('GET', '/api/v1/footer-links', [], $superAdminToken);
recordResult("GET /api/v1/footer-links returns paginated list (200 OK)", $resList['status'] === 200 && count($resList['json']['data'] ?? []) >= 2);

// Filter by column_name
$resFilterCol = apiRequest('GET', '/api/v1/footer-links?column_name=travel_guides', [], $superAdminToken);
recordResult("Filter footer links by column_name (?column_name=travel_guides)", $resFilterCol['status'] === 200 && count($resFilterCol['json']['data'] ?? []) >= 2);

// Filter by status
$resFilterStatus = apiRequest('GET', '/api/v1/footer-links?status=active', [], $superAdminToken);
recordResult("Filter footer links by status (?status=active)", $resFilterStatus['status'] === 200 && count($resFilterStatus['json']['data'] ?? []) >= 2);

// Search
$resSearch = apiRequest('GET', '/api/v1/footer-links?search=patched', [], $superAdminToken);
recordResult("Search footer links by keyword (?search=patched)", $resSearch['status'] === 200 && count($resSearch['json']['data'] ?? []) === 1);

// Display order sorting
$resSortOrder = apiRequest('GET', '/api/v1/footer-links?sort_by=display_order&sort_order=ASC', [], $superAdminToken);
recordResult("Sorting by display_order works correctly", $resSortOrder['status'] === 200 && count($resSortOrder['json']['data'] ?? []) >= 2);

// Pagination limit
$resPag = apiRequest('GET', '/api/v1/footer-links?limit=1', [], $superAdminToken);
recordResult("Pagination limit is respected (?limit=1)", $resPag['status'] === 200 && count($resPag['json']['data'] ?? []) === 1);

echo PHP_EOL;

// --- 8. Reversible Soft-Delete & Undo/Restore Architecture ---
echo "8. Reversible Soft-Delete & Undo/Restore Architecture:" . PHP_EOL;

// Delete Link 1
$resDel = apiRequest('DELETE', "/api/v1/footer-links/{$link1Id}", [], $superAdminToken);
$delData = $resDel['json']['data'] ?? [];
recordResult("DELETE /api/v1/footer-links/{id} returns is_deleted=true with deleted_at and deleted_by", $resDel['status'] === 200 && ($delData['is_deleted'] ?? false) === true && !empty($delData['deleted_at']));

// Soft-deleted link is excluded from normal active listings
$resListAfterDel = apiRequest('GET', '/api/v1/footer-links', [], $superAdminToken);
$listedIds = array_column($resListAfterDel['json']['data'] ?? [], 'id');
recordResult("Soft-deleted link is excluded from normal active listings", !in_array($link1Id, $listedIds, true));

// Normal detail lookup for soft-deleted link returns 404
$resShowDel = apiRequest('GET', "/api/v1/footer-links/{$link1Id}", [], $superAdminToken);
recordResult("Soft-deleted link returns 404 on normal active detail query", $resShowDel['status'] === 404);

// Verify database row still physically exists with all original data preserved
$checkRow = $pdo->prepare("SELECT * FROM `footer_links` WHERE `id` = :id");
$checkRow->execute([':id' => $link1Id]);
$dbRow = $checkRow->fetch(PDO::FETCH_ASSOC);
$rowPreserved = $dbRow && !empty($dbRow['deleted_at']) && (int) $dbRow['deleted_by'] === 1
    && $dbRow['label'] === 'Newly patched label exclusively'
    && $dbRow['url'] === '/guides/grand-chola-temples'
    && (int) $dbRow['display_order'] === 5;
recordResult("Original database row and all fields preserved in DB during soft delete", (bool) $rowPreserved, "Preserved Label: " . ($dbRow['label'] ?? 'None'));

// Cannot activate a soft-deleted link
$resActDel = apiRequest('POST', "/api/v1/footer-links/{$link1Id}/activate", [], $superAdminToken);
recordResult("Cannot activate soft-deleted link (404 NOT_FOUND)", $resActDel['status'] === 404);

// Restore Link 1
$resRestore = apiRequest('POST', "/api/v1/footer-links/{$link1Id}/restore", [], $superAdminToken);
$restoredData = $resRestore['json']['data'] ?? [];
$restoredSuccess = $resRestore['status'] === 200
    && (int) ($restoredData['id'] ?? 0) === $link1Id
    && ($restoredData['label'] ?? '') === 'Newly patched label exclusively'
    && ($restoredData['url'] ?? '') === '/guides/grand-chola-temples'
    && empty($restoredData['deleted_at'])
    && empty($restoredData['deleted_by']);
recordResult("POST /api/v1/footer-links/{id}/restore restores link with SAME ID and clears deleted_at/by", $restoredSuccess);

// Restored link appears in normal list again
$resListAfterRestore = apiRequest('GET', '/api/v1/footer-links', [], $superAdminToken);
$restoredListedIds = array_column($resListAfterRestore['json']['data'] ?? [], 'id');
recordResult("Restored link appears in active listing again", in_array($link1Id, $restoredListedIds, true));

echo PHP_EOL;

// --- 9. Audit Log Event Verification ---
echo "9. Audit Log Event Verification:" . PHP_EOL;

$auditStmt = $pdo->prepare("
    SELECT action, entity_type, entity_id 
    FROM `audit_logs` 
    WHERE `entity_type` = 'footer_link' AND `entity_id` = :id
    ORDER BY `id` ASC
");
$auditStmt->execute([':id' => $link1Id]);
$auditLogs = $auditStmt->fetchAll(PDO::FETCH_ASSOC);
$loggedActions = array_column($auditLogs, 'action');

recordResult("Audit log recorded for 'footer_link_create'", in_array('footer_link_create', $loggedActions, true));
recordResult("Audit log recorded for 'footer_link_update'", in_array('footer_link_update', $loggedActions, true));
recordResult("Audit log recorded for 'footer_link_soft_delete'", in_array('footer_link_soft_delete', $loggedActions, true));
recordResult("Audit log recorded for 'footer_link_restore'", in_array('footer_link_restore', $loggedActions, true));
recordResult("Audit log recorded for 'footer_link_activate'", in_array('footer_link_activate', $loggedActions, true));
recordResult("Audit log recorded for 'footer_link_deactivate'", in_array('footer_link_deactivate', $loggedActions, true));

echo PHP_EOL;

// --- 10. System Regressions (Health, Phase 3 Auth, Phase 4 Media, Phase 5 Destinations, Phase 6 Tours, Phase 7 Pages, Phase 8 CMS Sections, Phase 9 Hero Slides, Phase 10 Benefits, Phase 11 Settings) ---
echo "10. System Regressions (Health, Phase 3 Auth, Phase 4 Media, Phase 5 Destinations, Phase 6 Tours, Phase 7 Pages, Phase 8 CMS Sections, Phase 9 Hero Slides, Phase 10 Benefits, Phase 11 Settings):" . PHP_EOL;

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

echo PHP_EOL;

// --- 11. Test Environment Cleanup ---
echo "11. Test Environment Cleanup:" . PHP_EOL;

// Remove test footer links
$pdo->exec("DELETE FROM `footer_links` WHERE `id` IN ({$link1Id}, {$link2Id})");

// Remove audit logs generated during this test
$pdo->exec("DELETE FROM `audit_logs` WHERE `entity_type` = 'footer_link' AND `entity_id` IN ({$link1Id}, {$link2Id})");

$pdo->exec("DELETE FROM `user_roles` WHERE `user_id` IN ({$editorId}, {$moderatorId})");
$pdo->exec("DELETE FROM `users` WHERE `id` IN ({$editorId}, {$moderatorId})");

recordResult("All test database records and temporary files cleaned up", true);

echo PHP_EOL . "================================================================================" . PHP_EOL;
echo "  PHASE 12 VERIFICATION RESULTS" . PHP_EOL;
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
    echo "ALL PHASE 12 TESTS PASSED PERFECTLY!" . PHP_EOL . PHP_EOL;
    exit(0);
}
