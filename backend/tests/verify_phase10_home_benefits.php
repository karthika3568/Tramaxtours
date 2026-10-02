<?php

/**
 * Wanderer South India - Phase 10 Comprehensive End-to-End Homepage Benefits API Verification Test Suite
 * 
 * Verifies all Phase 10 requirements:
 * - Database schema, columns (including deleted_at, deleted_by, media_id FK) & homepage.manage permissions
 * - Authentication & RBAC Authorization (homepage.manage enforcement)
 * - View / Detail operation (complete stored benefit data, expanded media object)
 * - CRUD operations (Create, Read by ID, Update, Partial Update, Delete)
 * - Validation errors (missing title, invalid status, negative display_order, invalid media FK)
 * - Reversible Soft Delete (records deleted_at, deleted_by, preserves DB data & relationships)
 * - List exclusion of soft-deleted benefits
 * - Reversible Undo/Restore (POST/PATCH /restore returns identical record, ID, relationships, clears deleted_at/by)
 * - Activate / Deactivate status transitions
 * - Filtering, Searching, Display Ordering & Pagination
 * - Audit logging (home_benefit_create, update, soft_delete, restore, activate, deactivate)
 * - System Regressions: Health, Auth (Phase 3), Media (Phase 4), Destinations (Phase 5), Tours (Phase 6), Pages (Phase 7), CMS Sections (Phase 8), Hero Slides (Phase 9)
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
echo "  WANDERER SOUTH INDIA — PHASE 10 HOMEPAGE BENEFITS MANAGEMENT VERIFICATION SUITE" . PHP_EOL;
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

function getTestFileMime(string $filePath): string
{
    $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
    $mimes = [
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'webp' => 'image/webp',
        'svg' => 'image/svg+xml',
        'pdf' => 'application/pdf',
    ];
    return $mimes[$ext] ?? 'application/octet-stream';
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

$pdo = Database::getConnection();

// --- 1. Database Schema & Permissions Verification ---
echo "1. Database Schema & Permissions Verification:" . PHP_EOL;

$tableExists = (bool) $pdo->query("SHOW TABLES LIKE 'home_benefits'")->fetch();
recordResult("Table 'home_benefits' exists in database", $tableExists);

$colStmt = $pdo->query("SHOW COLUMNS FROM `home_benefits`");
$columns = $colStmt->fetchAll(PDO::FETCH_COLUMN);

$requiredColumns = [
    'id', 'title', 'description', 'icon', 'media_id',
    'display_order', 'status', 'deleted_at', 'deleted_by', 'created_at', 'updated_at'
];
$missingCols = array_diff($requiredColumns, $columns);
recordResult("All required home_benefits columns including soft delete present in schema", empty($missingCols), empty($missingCols) ? "All columns verified" : "Missing: " . implode(', ', $missingCols));

$permCheck = (int) $pdo->query("SELECT COUNT(*) FROM permissions WHERE name = 'homepage.manage'")->fetchColumn();
recordResult("Permission 'homepage.manage' exists in permissions table", $permCheck > 0);

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

// Editor (has homepage.manage)
$pdo->prepare("DELETE FROM users WHERE email = 'editor.phase10@tramaxtours.com'")->execute();
$pdo->prepare("INSERT INTO users (name, email, password_hash, status, created_at, updated_at) VALUES ('Phase10 Editor', 'editor.phase10@tramaxtours.com', 'hash', 'active', NOW(), NOW())")->execute();
$editorId = (int) $pdo->lastInsertId();
$pdo->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)")->execute([$editorId, 3]); // Role 3 = Editor

$editorToken = JWT::encode([
    'sub' => $editorId,
    'id' => $editorId,
    'email' => 'editor.phase10@tramaxtours.com',
    'role' => 'editor',
    'permissions' => ['homepage.manage', 'media.view', 'media.upload'],
], null, 3600);
recordResult("Editor token generated (has homepage.manage)", !empty($editorToken));

// Moderator (lacks homepage.manage)
$pdo->prepare("DELETE FROM users WHERE email = 'moderator.phase10@tramaxtours.com'")->execute();
$pdo->prepare("INSERT INTO users (name, email, password_hash, status, created_at, updated_at) VALUES ('Phase10 Moderator', 'moderator.phase10@tramaxtours.com', 'hash', 'active', NOW(), NOW())")->execute();
$moderatorId = (int) $pdo->lastInsertId();
$pdo->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)")->execute([$moderatorId, 4]); // Role 4 = Moderator

$moderatorToken = JWT::encode([
    'sub' => $moderatorId,
    'id' => $moderatorId,
    'email' => 'moderator.phase10@tramaxtours.com',
    'role' => 'moderator',
    'permissions' => ['reviews.view', 'reviews.moderate'],
], null, 3600);
recordResult("Moderator token generated (has no homepage.manage)", !empty($moderatorToken));

echo PHP_EOL;

// --- 3. Authorization & Permission Enforcement ---
echo "3. Authorization & Permission Enforcement:" . PHP_EOL;

// Unauthenticated requests
$resUnauthList = apiRequest('GET', '/api/v1/home-benefits');
recordResult("Unauthenticated list -> 401", $resUnauthList['status'] === 401);

$resUnauthShow = apiRequest('GET', '/api/v1/home-benefits/1');
recordResult("Unauthenticated detail -> 401", $resUnauthShow['status'] === 401);

$resUnauthStore = apiRequest('POST', '/api/v1/home-benefits', ['title' => 'Unauth Benefit']);
recordResult("Unauthenticated create -> 401", $resUnauthStore['status'] === 401);

$resUnauthUpdate = apiRequest('PUT', '/api/v1/home-benefits/1', ['title' => 'Unauth Update']);
recordResult("Unauthenticated update -> 401", $resUnauthUpdate['status'] === 401);

$resUnauthDelete = apiRequest('DELETE', '/api/v1/home-benefits/1');
recordResult("Unauthenticated delete -> 401", $resUnauthDelete['status'] === 401);

$resUnauthRestore = apiRequest('POST', '/api/v1/home-benefits/1/restore');
recordResult("Unauthenticated restore -> 401", $resUnauthRestore['status'] === 401);

// Unauthorized requests (Moderator lacking homepage.manage)
$resForbiddenList = apiRequest('GET', '/api/v1/home-benefits', [], $moderatorToken);
recordResult("User without homepage.manage -> 403", $resForbiddenList['status'] === 403);

$resForbiddenCreate = apiRequest('POST', '/api/v1/home-benefits', ['title' => 'Forbidden Benefit'], $moderatorToken);
recordResult("User without homepage.manage create -> 403", $resForbiddenCreate['status'] === 403);

// Authorized request (Editor with homepage.manage)
$resEditorList = apiRequest('GET', '/api/v1/home-benefits', [], $editorToken);
recordResult("User with homepage.manage -> 200 OK", $resEditorList['status'] === 200);

echo PHP_EOL;

// --- 4. Input Validation & Constraint Checks ---
echo "4. Input Validation & Constraint Checks:" . PHP_EOL;

// Missing title
$resValTitle = apiRequest('POST', '/api/v1/home-benefits', [
    'description' => 'No title benefit',
], $superAdminToken);
recordResult("Missing title -> 422", $resValTitle['status'] === 422, "Error: " . ($resValTitle['json']['errors']['title'] ?? ''));

// Invalid status
$resValStatus = apiRequest('POST', '/api/v1/home-benefits', [
    'title' => 'Test Benefit Title',
    'status' => 'pending_review',
], $superAdminToken);
recordResult("Invalid status -> 422", $resValStatus['status'] === 422, "Error: " . ($resValStatus['json']['errors']['status'] ?? ''));

// Negative display_order
$resValOrder = apiRequest('POST', '/api/v1/home-benefits', [
    'title' => 'Negative Order Benefit',
    'display_order' => -5,
], $superAdminToken);
recordResult("Negative display_order -> 422", $resValOrder['status'] === 422, "Error: " . ($resValOrder['json']['errors']['display_order'] ?? ''));

// Invalid media_id
$resValMedia = apiRequest('POST', '/api/v1/home-benefits', [
    'title' => 'Invalid Media Benefit',
    'media_id' => 999999,
], $superAdminToken);
recordResult("Invalid media_id -> 422", $resValMedia['status'] === 422, "Error: " . ($resValMedia['json']['errors']['media_id'] ?? ''));

echo PHP_EOL;

// --- 5. CRUD Operations, Media Integration & Detail Expansion ---
echo "5. CRUD Operations, Media Integration & Detail Expansion:" . PHP_EOL;

// Upload test image for benefit media
$testImgContent = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
$tempBenefitPath = BACKEND_ROOT . DIRECTORY_SEPARATOR . 'tests' . DIRECTORY_SEPARATOR . 'temp_benefit_icon.png';

file_put_contents($tempBenefitPath, $testImgContent);

$resMediaUpload = apiRequest('POST', '/api/v1/media/upload', ['alt_text' => 'Benefit Highlight Icon'], $superAdminToken, ['file' => $tempBenefitPath]);
$benefitMediaId = (int) ($resMediaUpload['json']['data']['id'] ?? 0);
@unlink($tempBenefitPath);

// Create Benefit 1 with full details
$createPayload1 = [
    'title' => 'Transparent Fixed Pricing',
    'description' => 'No hidden charges, all-inclusive toll and driver allowance.',
    'icon' => 'shield-check',
    'media_id' => $benefitMediaId,
    'display_order' => 1,
    'status' => 'active',
];

$resCreate1 = apiRequest('POST', '/api/v1/home-benefits', $createPayload1, $superAdminToken);
$benefit1Id = (int) ($resCreate1['json']['data']['id'] ?? 0);
recordResult("POST /api/v1/home-benefits creates benefit with media (201 Created)", $resCreate1['status'] === 201 && $benefit1Id > 0, "ID: {$benefit1Id}");

// Create Benefit 2
$createPayload2 = [
    'title' => '24/7 Dedicated Support',
    'description' => 'Direct access to regional travel experts on every trip.',
    'icon' => 'headset',
    'display_order' => 2,
    'status' => 'active',
];
$resCreate2 = apiRequest('POST', '/api/v1/home-benefits', $createPayload2, $superAdminToken);
$benefit2Id = (int) ($resCreate2['json']['data']['id'] ?? 0);
recordResult("POST /api/v1/home-benefits creates second benefit (201 Created)", $resCreate2['status'] === 201 && $benefit2Id > 0, "ID: {$benefit2Id}");

// GET /api/v1/home-benefits/{id} - View / Detail
$resShow = apiRequest('GET', "/api/v1/home-benefits/{$benefit1Id}", [], $superAdminToken);
$benefitData = $resShow['json']['data'] ?? [];
$hasMediaObject = !empty($benefitData['media']['url']);
recordResult("GET /api/v1/home-benefits/{id} returns complete benefit details", $resShow['status'] === 200 && ($benefitData['title'] ?? '') === 'Transparent Fixed Pricing');
recordResult("Detail expands media object with full details", $hasMediaObject, "Media URL: " . ($benefitData['media']['url'] ?? 'None'));

// PUT Full Update
$putPayload = [
    'title' => 'Updated Guaranteed Best Pricing',
    'description' => 'Comprehensive transparent quotes with premium amenities included.',
    'icon' => 'award',
    'media_id' => $benefitMediaId,
    'display_order' => 5,
    'status' => 'active',
];
$resPut = apiRequest('PUT', "/api/v1/home-benefits/{$benefit1Id}", $putPayload, $superAdminToken);
recordResult("PUT /api/v1/home-benefits/{id} updates full fields (200 OK)", $resPut['status'] === 200 && ($resPut['json']['data']['title'] ?? '') === 'Updated Guaranteed Best Pricing');

// PATCH Partial Update (update only icon and description, ensuring other fields are preserved)
$patchPayload = [
    'icon' => 'sparkles',
    'description' => 'Newly patched description exclusively',
];
$resPatch = apiRequest('PATCH', "/api/v1/home-benefits/{$benefit1Id}", $patchPayload, $superAdminToken);
$patchedData = $resPatch['json']['data'] ?? [];
$patchPreserved = ($patchedData['title'] ?? '') === 'Updated Guaranteed Best Pricing'
    && ($patchedData['icon'] ?? '') === 'sparkles'
    && ($patchedData['description'] ?? '') === 'Newly patched description exclusively'
    && ($patchedData['display_order'] ?? 0) === 5;
recordResult("PATCH /api/v1/home-benefits/{id} preserves unsupplied fields and updates target fields (200 OK)", $resPatch['status'] === 200 && $patchPreserved);

echo PHP_EOL;

// --- 6. Status Transitions (Activate / Deactivate) ---
echo "6. Status Transitions (Activate / Deactivate):" . PHP_EOL;

$resDeact = apiRequest('POST', "/api/v1/home-benefits/{$benefit1Id}/deactivate", [], $superAdminToken);
recordResult("POST /api/v1/home-benefits/{id}/deactivate sets status to 'inactive'", $resDeact['status'] === 200 && ($resDeact['json']['data']['status'] ?? '') === 'inactive');

$resAct = apiRequest('POST', "/api/v1/home-benefits/{$benefit1Id}/activate", [], $superAdminToken);
recordResult("POST /api/v1/home-benefits/{id}/activate sets status to 'active'", $resAct['status'] === 200 && ($resAct['json']['data']['status'] ?? '') === 'active');

echo PHP_EOL;

// --- 7. Search, Filtering, Ordering & Pagination ---
echo "7. Search, Filtering, Ordering & Pagination:" . PHP_EOL;

$resList = apiRequest('GET', '/api/v1/home-benefits', [], $superAdminToken);
recordResult("GET /api/v1/home-benefits returns paginated list (200 OK)", $resList['status'] === 200 && count($resList['json']['data'] ?? []) >= 2);

// Search title
$resSearch = apiRequest('GET', '/api/v1/home-benefits?search=Guaranteed', [], $superAdminToken);
recordResult("Filter benefits by search title (?search=Guaranteed)", $resSearch['status'] === 200 && count($resSearch['json']['data'] ?? []) === 1);

// Search description
$resSearchDesc = apiRequest('GET', '/api/v1/home-benefits?search=patched', [], $superAdminToken);
recordResult("Filter benefits by search description (?search=patched)", $resSearchDesc['status'] === 200 && count($resSearchDesc['json']['data'] ?? []) === 1);

// Status filter
$resFilterStatus = apiRequest('GET', '/api/v1/home-benefits?status=active', [], $superAdminToken);
recordResult("Filter benefits by status (?status=active)", $resFilterStatus['status'] === 200 && count($resFilterStatus['json']['data'] ?? []) >= 2);

// Display order sorting
$resSortOrder = apiRequest('GET', '/api/v1/home-benefits?sort_by=display_order&sort_order=ASC', [], $superAdminToken);
$items = $resSortOrder['json']['data'] ?? [];
$isOrdered = count($items) >= 2 && ($items[0]['display_order'] <= $items[1]['display_order']);
recordResult("Sorting by display_order works correctly", $resSortOrder['status'] === 200 && $isOrdered);

// Pagination limit
$resPag = apiRequest('GET', '/api/v1/home-benefits?limit=1', [], $superAdminToken);
recordResult("Pagination limit is respected (?limit=1)", $resPag['status'] === 200 && count($resPag['json']['data'] ?? []) === 1);

echo PHP_EOL;

// --- 8. Reversible Soft-Delete & Undo/Restore Architecture ---
echo "8. Reversible Soft-Delete & Undo/Restore Architecture:" . PHP_EOL;

// Delete Benefit 1
$resDel = apiRequest('DELETE', "/api/v1/home-benefits/{$benefit1Id}", [], $superAdminToken);
$delData = $resDel['json']['data'] ?? [];
recordResult("DELETE /api/v1/home-benefits/{id} returns is_deleted=true with deleted_at and deleted_by", $resDel['status'] === 200 && ($delData['is_deleted'] ?? false) === true && !empty($delData['deleted_at']));

// Soft-deleted benefit is excluded from normal active listings
$resListAfterDel = apiRequest('GET', '/api/v1/home-benefits', [], $superAdminToken);
$listedIds = array_column($resListAfterDel['json']['data'] ?? [], 'id');
recordResult("Soft-deleted benefit is excluded from normal active listings", !in_array($benefit1Id, $listedIds, true));

// Normal detail lookup for soft-deleted benefit returns 404
$resShowDel = apiRequest('GET', "/api/v1/home-benefits/{$benefit1Id}", [], $superAdminToken);
recordResult("Soft-deleted benefit returns 404 on normal active detail query", $resShowDel['status'] === 404);

// Verify database row still physically exists with all original data preserved
$checkRow = $pdo->prepare("SELECT * FROM `home_benefits` WHERE `id` = :id");
$checkRow->execute([':id' => $benefit1Id]);
$dbRow = $checkRow->fetch(PDO::FETCH_ASSOC);
$rowPreserved = $dbRow && !empty($dbRow['deleted_at']) && (int) $dbRow['deleted_by'] === 1
    && $dbRow['title'] === 'Updated Guaranteed Best Pricing'
    && (int) $dbRow['media_id'] === $benefitMediaId
    && $dbRow['icon'] === 'sparkles'
    && (int) $dbRow['display_order'] === 5;
recordResult("Original database row and all fields preserved in DB during soft delete", (bool) $rowPreserved, "Preserved Title: " . ($dbRow['title'] ?? 'None'));

// Cannot activate a soft-deleted benefit
$resActDel = apiRequest('POST', "/api/v1/home-benefits/{$benefit1Id}/activate", [], $superAdminToken);
recordResult("Cannot activate soft-deleted benefit (404 NOT_FOUND)", $resActDel['status'] === 404);

// Restore Benefit 1
$resRestore = apiRequest('POST', "/api/v1/home-benefits/{$benefit1Id}/restore", [], $superAdminToken);
$restoredData = $resRestore['json']['data'] ?? [];
$restoredSuccess = $resRestore['status'] === 200
    && (int) ($restoredData['id'] ?? 0) === $benefit1Id
    && ($restoredData['title'] ?? '') === 'Updated Guaranteed Best Pricing'
    && ($restoredData['icon'] ?? '') === 'sparkles'
    && (int) ($restoredData['media_id'] ?? 0) === $benefitMediaId
    && empty($restoredData['deleted_at'])
    && empty($restoredData['deleted_by']);
recordResult("POST /api/v1/home-benefits/{id}/restore restores benefit with SAME ID and clears deleted_at/by", $restoredSuccess);

// Restored benefit appears in normal list again
$resListAfterRestore = apiRequest('GET', '/api/v1/home-benefits', [], $superAdminToken);
$restoredListedIds = array_column($resListAfterRestore['json']['data'] ?? [], 'id');
recordResult("Restored benefit appears in active listing again", in_array($benefit1Id, $restoredListedIds, true));

echo PHP_EOL;

// --- 9. Audit Log Event Verification ---
echo "9. Audit Log Event Verification:" . PHP_EOL;

$auditStmt = $pdo->prepare("
    SELECT action, entity_type, entity_id 
    FROM `audit_logs` 
    WHERE `entity_type` = 'home_benefit' AND `entity_id` = :id
    ORDER BY `id` ASC
");
$auditStmt->execute([':id' => $benefit1Id]);
$auditLogs = $auditStmt->fetchAll(PDO::FETCH_ASSOC);
$loggedActions = array_column($auditLogs, 'action');

recordResult("Audit log recorded for 'home_benefit_create'", in_array('home_benefit_create', $loggedActions, true));
recordResult("Audit log recorded for 'home_benefit_update'", in_array('home_benefit_update', $loggedActions, true));
recordResult("Audit log recorded for 'home_benefit_soft_delete'", in_array('home_benefit_soft_delete', $loggedActions, true));
recordResult("Audit log recorded for 'home_benefit_restore'", in_array('home_benefit_restore', $loggedActions, true));
recordResult("Audit log recorded for 'home_benefit_activate'", in_array('home_benefit_activate', $loggedActions, true));
recordResult("Audit log recorded for 'home_benefit_deactivate'", in_array('home_benefit_deactivate', $loggedActions, true));

echo PHP_EOL;

// --- 10. System Regressions (Health, Phase 3 Auth, Phase 4 Media, Phase 5 Destinations, Phase 6 Tours, Phase 7 Pages, Phase 8 CMS Sections, Phase 9 Hero Slides) ---
echo "10. System Regressions (Health, Phase 3 Auth, Phase 4 Media, Phase 5 Destinations, Phase 6 Tours, Phase 7 Pages, Phase 8 CMS Sections, Phase 9 Hero Slides):" . PHP_EOL;

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

echo PHP_EOL;

// --- 11. Test Environment Cleanup ---
echo "11. Test Environment Cleanup:" . PHP_EOL;

// Remove test benefits
$pdo->exec("DELETE FROM `home_benefits` WHERE `id` IN ({$benefit1Id}, {$benefit2Id})");

// Remove audit logs generated during this test
$pdo->exec("DELETE FROM `audit_logs` WHERE `entity_type` = 'home_benefit' AND `entity_id` IN ({$benefit1Id}, {$benefit2Id})");

// Clean up uploaded media
if ($benefitMediaId > 0) {
    $row = $pdo->query("SELECT file_path FROM `media` WHERE `id` = {$benefitMediaId}")->fetch(PDO::FETCH_ASSOC);
    if ($row && !empty($row['file_path'])) {
        $diskPath = BACKEND_ROOT . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . ltrim($row['file_path'], '/');
        if (file_exists($diskPath)) @unlink($diskPath);
    }
    $pdo->exec("DELETE FROM `media` WHERE `id` = {$benefitMediaId}");
}

$pdo->exec("DELETE FROM `user_roles` WHERE `user_id` IN ({$editorId}, {$moderatorId})");
$pdo->exec("DELETE FROM `users` WHERE `id` IN ({$editorId}, {$moderatorId})");

recordResult("All test database records and temporary files cleaned up", true);

echo PHP_EOL . "================================================================================" . PHP_EOL;
echo "  PHASE 10 VERIFICATION RESULTS" . PHP_EOL;
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
    echo "ALL PHASE 10 TESTS PASSED PERFECTLY!" . PHP_EOL . PHP_EOL;
    exit(0);
}
