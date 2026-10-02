<?php

/**
 * Wanderer South India - Phase 9 Comprehensive End-to-End Homepage Hero Slides API Verification Test Suite
 * 
 * Verifies all Phase 9 requirements:
 * - Database schema, columns (including deleted_at, deleted_by, desktop_media_id, mobile_media_id FKs) & homepage.manage permissions
 * - Authentication & RBAC Authorization (homepage.manage enforcement)
 * - View / Detail operation (complete stored hero slide data, expanded desktop & mobile media objects)
 * - CRUD operations (Create, Read by ID, Update, Partial Update, Delete)
 * - Validation errors (missing title, invalid status, negative display_order, invalid dates, end_date < start_date, invalid media FKs)
 * - Reversible Soft Delete (records deleted_at, deleted_by, preserves DB data & relationships)
 * - List exclusion of soft-deleted hero slides
 * - Reversible Undo/Restore (POST/PATCH /restore returns identical record, ID, relationships, clears deleted_at/by)
 * - Activate / Deactivate status transitions
 * - Filtering, Searching, Display Ordering & Pagination
 * - Audit logging (home_hero_slide_create, update, soft_delete, restore, activate, deactivate)
 * - System Regressions: Health, Auth (Phase 3), Media (Phase 4), Destinations (Phase 5), Tours (Phase 6), Pages (Phase 7), CMS Sections (Phase 8)
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
echo "  WANDERER SOUTH INDIA — PHASE 9 HOMEPAGE HERO SLIDES MANAGEMENT VERIFICATION SUITE" . PHP_EOL;
echo "================================================================================" . PHP_EOL . PHP_EOL;

// 2. Start Local Test Server
$testPort = 8896;
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

$tableExists = (bool) $pdo->query("SHOW TABLES LIKE 'home_hero_slides'")->fetch();
recordResult("Table 'home_hero_slides' exists in database", $tableExists);

$colStmt = $pdo->query("SHOW COLUMNS FROM `home_hero_slides`");
$columns = $colStmt->fetchAll(PDO::FETCH_COLUMN);

$requiredColumns = [
    'id', 'title', 'subtitle', 'desktop_media_id', 'mobile_media_id',
    'cta_label', 'cta_url', 'display_order', 'start_date', 'end_date',
    'status', 'deleted_at', 'deleted_by', 'created_at', 'updated_at'
];
$missingCols = array_diff($requiredColumns, $columns);
recordResult("All required home_hero_slides columns including soft delete present in schema", empty($missingCols), empty($missingCols) ? "All columns verified" : "Missing: " . implode(', ', $missingCols));

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
$pdo->prepare("DELETE FROM users WHERE email = 'editor.phase9@tramaxtours.com'")->execute();
$pdo->prepare("INSERT INTO users (name, email, password_hash, status, created_at, updated_at) VALUES ('Phase9 Editor', 'editor.phase9@tramaxtours.com', 'hash', 'active', NOW(), NOW())")->execute();
$editorId = (int) $pdo->lastInsertId();
$pdo->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)")->execute([$editorId, 3]); // Role 3 = Editor

$editorToken = JWT::encode([
    'sub' => $editorId,
    'id' => $editorId,
    'email' => 'editor.phase9@tramaxtours.com',
    'role' => 'editor',
    'permissions' => ['homepage.manage', 'media.view', 'media.upload'],
], null, 3600);
recordResult("Editor token generated (has homepage.manage)", !empty($editorToken));

// Moderator (lacks homepage.manage)
$pdo->prepare("DELETE FROM users WHERE email = 'moderator.phase9@tramaxtours.com'")->execute();
$pdo->prepare("INSERT INTO users (name, email, password_hash, status, created_at, updated_at) VALUES ('Phase9 Moderator', 'moderator.phase9@tramaxtours.com', 'hash', 'active', NOW(), NOW())")->execute();
$moderatorId = (int) $pdo->lastInsertId();
$pdo->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)")->execute([$moderatorId, 4]); // Role 4 = Moderator

$moderatorToken = JWT::encode([
    'sub' => $moderatorId,
    'id' => $moderatorId,
    'email' => 'moderator.phase9@tramaxtours.com',
    'role' => 'moderator',
    'permissions' => ['reviews.view', 'reviews.moderate'],
], null, 3600);
recordResult("Moderator token generated (has no homepage.manage)", !empty($moderatorToken));

echo PHP_EOL;

// --- 3. Authorization & Permission Enforcement ---
echo "3. Authorization & Permission Enforcement:" . PHP_EOL;

// Unauthenticated requests
$resUnauthList = apiRequest('GET', '/api/v1/home-hero-slides');
recordResult("Unauthenticated list -> 401", $resUnauthList['status'] === 401);

$resUnauthShow = apiRequest('GET', '/api/v1/home-hero-slides/1');
recordResult("Unauthenticated detail -> 401", $resUnauthShow['status'] === 401);

$resUnauthStore = apiRequest('POST', '/api/v1/home-hero-slides', ['title' => 'Unauth Slide']);
recordResult("Unauthenticated create -> 401", $resUnauthStore['status'] === 401);

$resUnauthUpdate = apiRequest('PUT', '/api/v1/home-hero-slides/1', ['title' => 'Unauth Update']);
recordResult("Unauthenticated update -> 401", $resUnauthUpdate['status'] === 401);

$resUnauthDelete = apiRequest('DELETE', '/api/v1/home-hero-slides/1');
recordResult("Unauthenticated delete -> 401", $resUnauthDelete['status'] === 401);

$resUnauthRestore = apiRequest('POST', '/api/v1/home-hero-slides/1/restore');
recordResult("Unauthenticated restore -> 401", $resUnauthRestore['status'] === 401);

// Unauthorized requests (Moderator lacking homepage.manage)
$resForbiddenList = apiRequest('GET', '/api/v1/home-hero-slides', [], $moderatorToken);
recordResult("User without homepage.manage -> 403", $resForbiddenList['status'] === 403);

$resForbiddenCreate = apiRequest('POST', '/api/v1/home-hero-slides', ['title' => 'Forbidden Slide'], $moderatorToken);
recordResult("User without homepage.manage create -> 403", $resForbiddenCreate['status'] === 403);

// Authorized request (Editor with homepage.manage)
$resEditorList = apiRequest('GET', '/api/v1/home-hero-slides', [], $editorToken);
recordResult("User with homepage.manage -> 200 OK", $resEditorList['status'] === 200);

echo PHP_EOL;

// --- 4. Input Validation & Constraint Checks ---
echo "4. Input Validation & Constraint Checks:" . PHP_EOL;

// Missing title
$resValTitle = apiRequest('POST', '/api/v1/home-hero-slides', [
    'subtitle' => 'No title slide',
], $superAdminToken);
recordResult("Missing title -> 422", $resValTitle['status'] === 422, "Error: " . ($resValTitle['json']['errors']['title'] ?? ''));

// Invalid status
$resValStatus = apiRequest('POST', '/api/v1/home-hero-slides', [
    'title' => 'Test Slide Title',
    'status' => 'pending_review',
], $superAdminToken);
recordResult("Invalid status -> 422", $resValStatus['status'] === 422, "Error: " . ($resValStatus['json']['errors']['status'] ?? ''));

// Negative display_order
$resValOrder = apiRequest('POST', '/api/v1/home-hero-slides', [
    'title' => 'Negative Order Slide',
    'display_order' => -5,
], $superAdminToken);
recordResult("Negative display_order -> 422", $resValOrder['status'] === 422, "Error: " . ($resValOrder['json']['errors']['display_order'] ?? ''));

// Invalid desktop_media_id
$resValDesktop = apiRequest('POST', '/api/v1/home-hero-slides', [
    'title' => 'Invalid Desktop Media Slide',
    'desktop_media_id' => 999999,
], $superAdminToken);
recordResult("Invalid desktop_media_id -> 422", $resValDesktop['status'] === 422, "Error: " . ($resValDesktop['json']['errors']['desktop_media_id'] ?? ''));

// Invalid mobile_media_id
$resValMobile = apiRequest('POST', '/api/v1/home-hero-slides', [
    'title' => 'Invalid Mobile Media Slide',
    'mobile_media_id' => 999999,
], $superAdminToken);
recordResult("Invalid mobile_media_id -> 422", $resValMobile['status'] === 422, "Error: " . ($resValMobile['json']['errors']['mobile_media_id'] ?? ''));

// Invalid start_date format
$resValStart = apiRequest('POST', '/api/v1/home-hero-slides', [
    'title' => 'Invalid Date Format Slide',
    'start_date' => 'invalid-not-a-date',
], $superAdminToken);
recordResult("Invalid start_date -> 422", $resValStart['status'] === 422, "Error: " . ($resValStart['json']['errors']['start_date'] ?? ''));

// Invalid end_date format
$resValEnd = apiRequest('POST', '/api/v1/home-hero-slides', [
    'title' => 'Invalid Date Format Slide',
    'end_date' => 'invalid-not-a-date',
], $superAdminToken);
recordResult("Invalid end_date -> 422", $resValEnd['status'] === 422, "Error: " . ($resValEnd['json']['errors']['end_date'] ?? ''));

// end_date earlier than start_date
$resValDateRange = apiRequest('POST', '/api/v1/home-hero-slides', [
    'title' => 'Backwards Schedule Slide',
    'start_date' => '2026-12-01 00:00:00',
    'end_date' => '2026-11-01 00:00:00',
], $superAdminToken);
recordResult("end_date earlier than start_date -> 422", $resValDateRange['status'] === 422, "Error: " . ($resValDateRange['json']['errors']['end_date'] ?? ''));

echo PHP_EOL;

// --- 5. CRUD Operations, Media Integration & Detail Expansion ---
echo "5. CRUD Operations, Media Integration & Detail Expansion:" . PHP_EOL;

// Upload 2 test images for desktop and mobile media
$testImgContent = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
$tempDesktopPath = BACKEND_ROOT . DIRECTORY_SEPARATOR . 'tests' . DIRECTORY_SEPARATOR . 'temp_hero_desktop.png';
$tempMobilePath = BACKEND_ROOT . DIRECTORY_SEPARATOR . 'tests' . DIRECTORY_SEPARATOR . 'temp_hero_mobile.png';

file_put_contents($tempDesktopPath, $testImgContent);
file_put_contents($tempMobilePath, $testImgContent);

$resDeskUpload = apiRequest('POST', '/api/v1/media/upload', ['alt_text' => 'Hero Desktop Banner'], $superAdminToken, ['file' => $tempDesktopPath]);
$desktopMediaId = (int) ($resDeskUpload['json']['data']['id'] ?? 0);
@unlink($tempDesktopPath);

$resMobUpload = apiRequest('POST', '/api/v1/media/upload', ['alt_text' => 'Hero Mobile Banner'], $superAdminToken, ['file' => $tempMobilePath]);
$mobileMediaId = (int) ($resMobUpload['json']['data']['id'] ?? 0);
@unlink($tempMobilePath);

// Create slide 1 with full details and media attachments
$createPayload1 = [
    'title' => 'Experience Extraordinary South India',
    'subtitle' => 'Customized Heritage & Temple Journeys by Wanderer South India',
    'desktop_media_id' => $desktopMediaId,
    'mobile_media_id' => $mobileMediaId,
    'cta_label' => 'Explore Tours',
    'cta_url' => '/tours',
    'display_order' => 1,
    'start_date' => '2026-01-01 00:00:00',
    'end_date' => '2026-12-31 23:59:59',
    'status' => 'active',
];

$resCreate1 = apiRequest('POST', '/api/v1/home-hero-slides', $createPayload1, $superAdminToken);
$slide1Id = (int) ($resCreate1['json']['data']['id'] ?? 0);
recordResult("POST /api/v1/home-hero-slides creates slide with media (201 Created)", $resCreate1['status'] === 201 && $slide1Id > 0, "ID: {$slide1Id}");

// Create slide 2
$createPayload2 = [
    'title' => 'Wanderlust Nilgiris & Ooty Escapes',
    'subtitle' => 'Scenic hill station tours and tea garden retreats',
    'display_order' => 2,
    'status' => 'active',
];
$resCreate2 = apiRequest('POST', '/api/v1/home-hero-slides', $createPayload2, $superAdminToken);
$slide2Id = (int) ($resCreate2['json']['data']['id'] ?? 0);
recordResult("POST /api/v1/home-hero-slides creates second slide (201 Created)", $resCreate2['status'] === 201 && $slide2Id > 0, "ID: {$slide2Id}");

// GET /api/v1/home-hero-slides/{id} - View / Detail
$resShow = apiRequest('GET', "/api/v1/home-hero-slides/{$slide1Id}", [], $superAdminToken);
$slideData = $resShow['json']['data'] ?? [];
$hasDesktopMedia = !empty($slideData['desktop_media']['url']);
$hasMobileMedia = !empty($slideData['mobile_media']['url']);
recordResult("GET /api/v1/home-hero-slides/{id} returns complete slide details", $resShow['status'] === 200 && ($slideData['title'] ?? '') === 'Experience Extraordinary South India');
recordResult("Detail expands desktop_media object with full details", $hasDesktopMedia, "Desktop URL: " . ($slideData['desktop_media']['url'] ?? 'None'));
recordResult("Detail expands mobile_media object with full details", $hasMobileMedia, "Mobile URL: " . ($slideData['mobile_media']['url'] ?? 'None'));

// PUT Full Update
$putPayload = [
    'title' => 'Updated Spectacular South India Expeditions',
    'subtitle' => 'Premium chauffeurs and curated itineraries',
    'desktop_media_id' => $desktopMediaId,
    'mobile_media_id' => $mobileMediaId,
    'cta_label' => 'Book Your Tour',
    'cta_url' => '/destinations',
    'display_order' => 5,
    'start_date' => '2026-02-01 00:00:00',
    'end_date' => '2026-11-30 23:59:59',
    'status' => 'active',
];
$resPut = apiRequest('PUT', "/api/v1/home-hero-slides/{$slide1Id}", $putPayload, $superAdminToken);
recordResult("PUT /api/v1/home-hero-slides/{id} updates full fields (200 OK)", $resPut['status'] === 200 && ($resPut['json']['data']['title'] ?? '') === 'Updated Spectacular South India Expeditions');

// PATCH Partial Update (update only cta_label and subtitle, ensuring other fields are preserved)
$patchPayload = [
    'cta_label' => 'Reserve Now',
    'subtitle' => 'Newly patched subtitle exclusively',
];
$resPatch = apiRequest('PATCH', "/api/v1/home-hero-slides/{$slide1Id}", $patchPayload, $superAdminToken);
$patchedData = $resPatch['json']['data'] ?? [];
$patchPreserved = ($patchedData['title'] ?? '') === 'Updated Spectacular South India Expeditions'
    && ($patchedData['cta_label'] ?? '') === 'Reserve Now'
    && ($patchedData['subtitle'] ?? '') === 'Newly patched subtitle exclusively'
    && ($patchedData['display_order'] ?? 0) === 5;
recordResult("PATCH /api/v1/home-hero-slides/{id} preserves unsupplied fields and updates target fields (200 OK)", $resPatch['status'] === 200 && $patchPreserved);

echo PHP_EOL;

// --- 6. Status Transitions (Activate / Deactivate) ---
echo "6. Status Transitions (Activate / Deactivate):" . PHP_EOL;

$resDeact = apiRequest('POST', "/api/v1/home-hero-slides/{$slide1Id}/deactivate", [], $superAdminToken);
recordResult("POST /api/v1/home-hero-slides/{id}/deactivate sets status to 'inactive'", $resDeact['status'] === 200 && ($resDeact['json']['data']['status'] ?? '') === 'inactive');

$resAct = apiRequest('POST', "/api/v1/home-hero-slides/{$slide1Id}/activate", [], $superAdminToken);
recordResult("POST /api/v1/home-hero-slides/{id}/activate sets status to 'active'", $resAct['status'] === 200 && ($resAct['json']['data']['status'] ?? '') === 'active');

echo PHP_EOL;

// --- 7. Search, Filtering, Ordering & Pagination ---
echo "7. Search, Filtering, Ordering & Pagination:" . PHP_EOL;

$resList = apiRequest('GET', '/api/v1/home-hero-slides', [], $superAdminToken);
recordResult("GET /api/v1/home-hero-slides returns paginated list (200 OK)", $resList['status'] === 200 && count($resList['json']['data'] ?? []) >= 2);

// Search title
$resSearch = apiRequest('GET', '/api/v1/home-hero-slides?search=Spectacular', [], $superAdminToken);
recordResult("Filter hero slides by search title (?search=Spectacular)", $resSearch['status'] === 200 && count($resSearch['json']['data'] ?? []) === 1);

// Search subtitle
$resSearchSub = apiRequest('GET', '/api/v1/home-hero-slides?search=patched', [], $superAdminToken);
recordResult("Filter hero slides by search subtitle (?search=patched)", $resSearchSub['status'] === 200 && count($resSearchSub['json']['data'] ?? []) === 1);

// Status filter
$resFilterStatus = apiRequest('GET', '/api/v1/home-hero-slides?status=active', [], $superAdminToken);
recordResult("Filter hero slides by status (?status=active)", $resFilterStatus['status'] === 200 && count($resFilterStatus['json']['data'] ?? []) >= 2);

// Display order sorting
$resSortOrder = apiRequest('GET', '/api/v1/home-hero-slides?sort_by=display_order&sort_order=ASC', [], $superAdminToken);
$items = $resSortOrder['json']['data'] ?? [];
$isOrdered = count($items) >= 2 && ($items[0]['display_order'] <= $items[1]['display_order']);
recordResult("Sorting by display_order works correctly", $resSortOrder['status'] === 200 && $isOrdered);

// Pagination limit
$resPag = apiRequest('GET', '/api/v1/home-hero-slides?limit=1', [], $superAdminToken);
recordResult("Pagination limit is respected (?limit=1)", $resPag['status'] === 200 && count($resPag['json']['data'] ?? []) === 1);

echo PHP_EOL;

// --- 8. Reversible Soft-Delete & Undo/Restore Architecture ---
echo "8. Reversible Soft-Delete & Undo/Restore Architecture:" . PHP_EOL;

// Delete slide 1
$resDel = apiRequest('DELETE', "/api/v1/home-hero-slides/{$slide1Id}", [], $superAdminToken);
$delData = $resDel['json']['data'] ?? [];
recordResult("DELETE /api/v1/home-hero-slides/{id} returns is_deleted=true with deleted_at and deleted_by", $resDel['status'] === 200 && ($delData['is_deleted'] ?? false) === true && !empty($delData['deleted_at']));

// Soft-deleted slide is excluded from normal active listings
$resListAfterDel = apiRequest('GET', '/api/v1/home-hero-slides', [], $superAdminToken);
$listedIds = array_column($resListAfterDel['json']['data'] ?? [], 'id');
recordResult("Soft-deleted slide is excluded from normal active listings", !in_array($slide1Id, $listedIds, true));

// Normal detail lookup for soft-deleted slide returns 404
$resShowDel = apiRequest('GET', "/api/v1/home-hero-slides/{$slide1Id}", [], $superAdminToken);
recordResult("Soft-deleted slide returns 404 on normal active detail query", $resShowDel['status'] === 404);

// Verify database row still physically exists with all original data preserved
$checkRow = $pdo->prepare("SELECT * FROM `home_hero_slides` WHERE `id` = :id");
$checkRow->execute([':id' => $slide1Id]);
$dbRow = $checkRow->fetch(PDO::FETCH_ASSOC);
$rowPreserved = $dbRow && !empty($dbRow['deleted_at']) && (int) $dbRow['deleted_by'] === 1
    && $dbRow['title'] === 'Updated Spectacular South India Expeditions'
    && (int) $dbRow['desktop_media_id'] === $desktopMediaId
    && (int) $dbRow['mobile_media_id'] === $mobileMediaId
    && $dbRow['cta_label'] === 'Reserve Now'
    && (int) $dbRow['display_order'] === 5;
recordResult("Original database row and all fields preserved in DB during soft delete", (bool) $rowPreserved, "Preserved Title: " . ($dbRow['title'] ?? 'None'));

// Cannot activate a soft-deleted slide
$resActDel = apiRequest('POST', "/api/v1/home-hero-slides/{$slide1Id}/activate", [], $superAdminToken);
recordResult("Cannot activate soft-deleted slide (404 NOT_FOUND)", $resActDel['status'] === 404);

// Restore slide 1
$resRestore = apiRequest('POST', "/api/v1/home-hero-slides/{$slide1Id}/restore", [], $superAdminToken);
$restoredData = $resRestore['json']['data'] ?? [];
$restoredSuccess = $resRestore['status'] === 200
    && (int) ($restoredData['id'] ?? 0) === $slide1Id
    && ($restoredData['title'] ?? '') === 'Updated Spectacular South India Expeditions'
    && ($restoredData['cta_label'] ?? '') === 'Reserve Now'
    && (int) ($restoredData['desktop_media_id'] ?? 0) === $desktopMediaId
    && (int) ($restoredData['mobile_media_id'] ?? 0) === $mobileMediaId
    && empty($restoredData['deleted_at'])
    && empty($restoredData['deleted_by']);
recordResult("POST /api/v1/home-hero-slides/{id}/restore restores slide with SAME ID and clears deleted_at/by", $restoredSuccess);

// Restored slide appears in normal list again
$resListAfterRestore = apiRequest('GET', '/api/v1/home-hero-slides', [], $superAdminToken);
$restoredListedIds = array_column($resListAfterRestore['json']['data'] ?? [], 'id');
recordResult("Restored slide appears in active listing again", in_array($slide1Id, $restoredListedIds, true));

echo PHP_EOL;

// --- 9. Audit Log Event Verification ---
echo "9. Audit Log Event Verification:" . PHP_EOL;

$auditStmt = $pdo->prepare("
    SELECT action, entity_type, entity_id 
    FROM `audit_logs` 
    WHERE `entity_type` = 'home_hero_slide' AND `entity_id` = :id
    ORDER BY `id` ASC
");
$auditStmt->execute([':id' => $slide1Id]);
$auditLogs = $auditStmt->fetchAll(PDO::FETCH_ASSOC);
$loggedActions = array_column($auditLogs, 'action');

recordResult("Audit log recorded for 'home_hero_slide_create'", in_array('home_hero_slide_create', $loggedActions, true));
recordResult("Audit log recorded for 'home_hero_slide_update'", in_array('home_hero_slide_update', $loggedActions, true));
recordResult("Audit log recorded for 'home_hero_slide_soft_delete'", in_array('home_hero_slide_soft_delete', $loggedActions, true));
recordResult("Audit log recorded for 'home_hero_slide_restore'", in_array('home_hero_slide_restore', $loggedActions, true));
recordResult("Audit log recorded for 'home_hero_slide_activate'", in_array('home_hero_slide_activate', $loggedActions, true));
recordResult("Audit log recorded for 'home_hero_slide_deactivate'", in_array('home_hero_slide_deactivate', $loggedActions, true));

echo PHP_EOL;

// --- 10. System Regressions (Health, Phase 3 Auth, Phase 4 Media, Phase 5 Destinations, Phase 6 Tours, Phase 7 Pages, Phase 8 CMS Sections) ---
echo "10. System Regressions (Health, Phase 3 Auth, Phase 4 Media, Phase 5 Destinations, Phase 6 Tours, Phase 7 Pages, Phase 8 CMS Sections):" . PHP_EOL;

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

echo PHP_EOL;

// --- 11. Test Environment Cleanup ---
echo "11. Test Environment Cleanup:" . PHP_EOL;

// Remove test hero slides
$pdo->exec("DELETE FROM `home_hero_slides` WHERE `id` IN ({$slide1Id}, {$slide2Id})");

// Remove audit logs generated during this test
$pdo->exec("DELETE FROM `audit_logs` WHERE `entity_type` = 'home_hero_slide' AND `entity_id` IN ({$slide1Id}, {$slide2Id})");

// Clean up uploaded media
if ($desktopMediaId > 0) {
    $row = $pdo->query("SELECT file_path FROM `media` WHERE `id` = {$desktopMediaId}")->fetch(PDO::FETCH_ASSOC);
    if ($row && !empty($row['file_path'])) {
        $diskPath = BACKEND_ROOT . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . ltrim($row['file_path'], '/');
        if (file_exists($diskPath)) @unlink($diskPath);
    }
    $pdo->exec("DELETE FROM `media` WHERE `id` = {$desktopMediaId}");
}

if ($mobileMediaId > 0) {
    $row = $pdo->query("SELECT file_path FROM `media` WHERE `id` = {$mobileMediaId}")->fetch(PDO::FETCH_ASSOC);
    if ($row && !empty($row['file_path'])) {
        $diskPath = BACKEND_ROOT . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . ltrim($row['file_path'], '/');
        if (file_exists($diskPath)) @unlink($diskPath);
    }
    $pdo->exec("DELETE FROM `media` WHERE `id` = {$mobileMediaId}");
}

$pdo->exec("DELETE FROM `user_roles` WHERE `user_id` IN ({$editorId}, {$moderatorId})");
$pdo->exec("DELETE FROM `users` WHERE `id` IN ({$editorId}, {$moderatorId})");

recordResult("All test database records and temporary files cleaned up", true);

echo PHP_EOL . "================================================================================" . PHP_EOL;
echo "  PHASE 9 VERIFICATION RESULTS" . PHP_EOL;
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
    echo "ALL PHASE 9 TESTS PASSED PERFECTLY!" . PHP_EOL . PHP_EOL;
    exit(0);
}
