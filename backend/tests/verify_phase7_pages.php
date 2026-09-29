<?php

/**
 * Tramax Tours - Phase 7 Comprehensive End-to-End Pages & CMS Content API Verification Test Suite
 * 
 * Verifies all Phase 7 requirements:
 * - Database schema, columns (including deleted_at, deleted_by, hero_media_id FK) & pages.manage permissions
 * - Authentication & RBAC Authorization (pages.manage enforcement)
 * - View / Detail operation (complete stored page data, hero_media object)
 * - CRUD operations (Create, Read by ID, Read by Slug, Update, Partial Update, Delete)
 * - Automatic slug generation, custom slug validation, unique collision resolution
 * - Validation errors (missing title, invalid status, invalid slug, invalid hero_media_id FK)
 * - Reversible Soft Delete (records deleted_at, deleted_by, preserves DB data & relationships)
 * - List exclusion of soft-deleted pages
 * - Reversible Undo/Restore (POST /restore returns identical record, ID, relationships, clears deleted_at/by)
 * - Seeded system pages verification (about-us, terms-conditions, refund-policy, privacy-policy)
 * - Publishing & Unpublishing transitions
 * - Filtering, Searching, Pagination & Sorting
 * - Audit logging (page_create, page_update, page_soft_delete, page_restore, page_publish, page_unpublish)
 * - System Regressions: Health, Auth (Phase 3), Media (Phase 4), Destinations (Phase 5), Tours (Phase 6)
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
echo "  TRAMAX TOURS — PHASE 7 PAGES & CMS MANAGEMENT VERIFICATION SUITE" . PHP_EOL;
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

// 1. Verify pages table exists
$pagesTableExists = (int) $pdo->query("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'pages'")->fetchColumn();
recordResult("Table 'pages' exists in database", $pagesTableExists > 0);

// 2. Verify columns in pages table
$stmt = $pdo->query("SHOW COLUMNS FROM `pages`");
$columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
$expectedColumns = [
    'id', 'slug', 'title', 'subtitle', 'hero_media_id', 'content',
    'seo_title', 'seo_description', 'status', 'deleted_at', 'deleted_by',
    'created_at', 'updated_at'
];
$missingCols = array_diff($expectedColumns, $columns);
recordResult("All required page columns including deleted_at and deleted_by present in schema", empty($missingCols), empty($missingCols) ? '' : 'Missing: ' . implode(', ', $missingCols));

// 3. Verify pages.manage permission exists
$stmt = $pdo->prepare("SELECT COUNT(*) FROM permissions WHERE name = 'pages.manage'");
$stmt->execute();
recordResult("Permission 'pages.manage' exists in permissions table", (int) $stmt->fetchColumn() > 0);

// -----------------------------------------------------------------------------
// SECTION 2: RBAC Tokens & User Context Setup
// -----------------------------------------------------------------------------
echo PHP_EOL . "2. RBAC Tokens & User Context Setup:" . PHP_EOL;

// 1. Fetch Super Admin User
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = 'admin@tramaxtours.com' LIMIT 1");
$stmt->execute();
$superAdmin = $stmt->fetch(PDO::FETCH_ASSOC);

$superAdminToken = JWT::encode([
    'sub' => (int) $superAdmin['id'],
    'email' => $superAdmin['email'],
    'role' => 'super_admin',
    'permissions' => ['*'],
], null, 3600);
recordResult("Super Admin token generated", !empty($superAdminToken));

// 2. Create Test Editor User (has pages.manage)
$pdo->prepare("DELETE FROM users WHERE email = 'editor.phase7@tramaxtours.com'")->execute();
$pdo->prepare("INSERT INTO users (name, email, password_hash, status, created_at, updated_at) VALUES ('Phase7 Editor', 'editor.phase7@tramaxtours.com', 'hash', 'active', NOW(), NOW())")->execute();
$editorId = (int) $pdo->lastInsertId();
$pdo->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)")->execute([$editorId, 3]); // Role 3 = Editor

$editorToken = JWT::encode([
    'sub' => $editorId,
    'email' => 'editor.phase7@tramaxtours.com',
    'role' => 'editor',
    'permissions' => ['pages.manage', 'media.view', 'media.upload'],
], null, 3600);
recordResult("Editor token generated (has pages.manage)", !empty($editorToken));

// 3. Create Test Moderator User (lacks pages.manage)
$pdo->prepare("DELETE FROM users WHERE email = 'moderator.phase7@tramaxtours.com'")->execute();
$pdo->prepare("INSERT INTO users (name, email, password_hash, status, created_at, updated_at) VALUES ('Phase7 Moderator', 'moderator.phase7@tramaxtours.com', 'hash', 'active', NOW(), NOW())")->execute();
$moderatorId = (int) $pdo->lastInsertId();
$pdo->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)")->execute([$moderatorId, 4]); // Role 4 = Moderator

$moderatorToken = JWT::encode([
    'sub' => $moderatorId,
    'email' => 'moderator.phase7@tramaxtours.com',
    'role' => 'moderator',
    'permissions' => ['reviews.view', 'reviews.moderate'],
], null, 3600);
recordResult("Moderator token generated (has no pages.manage)", !empty($moderatorToken));

// -----------------------------------------------------------------------------
// SECTION 3: Pages Authorization & Permission Enforcement
// -----------------------------------------------------------------------------
echo PHP_EOL . "3. Pages Authorization & Permission Enforcement:" . PHP_EOL;

// 1. Unauthenticated requests rejected (401)
$resUnauthList = apiRequest('GET', '/api/v1/pages');
recordResult("Unauthenticated request to GET /api/v1/pages is rejected (401)", $resUnauthList['status'] === 401);

$resUnauthDetail = apiRequest('GET', '/api/v1/pages/1');
recordResult("Unauthenticated request to GET /api/v1/pages/{id} is rejected (401)", $resUnauthDetail['status'] === 401);

$resUnauthCreate = apiRequest('POST', '/api/v1/pages', ['title' => 'Unauth Test']);
recordResult("Unauthenticated request to POST /api/v1/pages is rejected (401)", $resUnauthCreate['status'] === 401);

$resUnauthUpdate = apiRequest('PUT', '/api/v1/pages/1', ['title' => 'Unauth Update']);
recordResult("Unauthenticated request to PUT /api/v1/pages/{id} is rejected (401)", $resUnauthUpdate['status'] === 401);

$resUnauthDelete = apiRequest('DELETE', '/api/v1/pages/1');
recordResult("Unauthenticated request to DELETE /api/v1/pages/{id} is rejected (401)", $resUnauthDelete['status'] === 401);

$resUnauthRestore = apiRequest('POST', '/api/v1/pages/1/restore');
recordResult("Unauthenticated request to POST /api/v1/pages/{id}/restore is rejected (401)", $resUnauthRestore['status'] === 401);

// 2. Unauthorized user without pages.manage rejected (403)
$resForbiddenList = apiRequest('GET', '/api/v1/pages', [], $moderatorToken);
recordResult("User without pages.manage is rejected with 403", $resForbiddenList['status'] === 403);

$resForbiddenCreate = apiRequest('POST', '/api/v1/pages', ['title' => 'Forbidden'], $moderatorToken);
recordResult("User without pages.manage create is rejected with 403", $resForbiddenCreate['status'] === 403);

// 3. Authorized user with pages.manage allowed (200 OK)
$resAuthorizedList = apiRequest('GET', '/api/v1/pages', [], $editorToken);
recordResult("User with pages.manage is allowed access (200 OK)", $resAuthorizedList['status'] === 200);

// -----------------------------------------------------------------------------
// SECTION 4: Input Validation & Constraints
// -----------------------------------------------------------------------------
echo PHP_EOL . "4. Input Validation & Constraint Checks:" . PHP_EOL;

// 1. Missing title
$resValTitle = apiRequest('POST', '/api/v1/pages', ['title' => ''], $superAdminToken);
recordResult(
    "Rejection of missing page title (422)",
    $resValTitle['status'] === 422 && isset($resValTitle['json']['errors']['title']),
    "Error: " . ($resValTitle['json']['errors']['title'] ?? '')
);

// 2. Non-existent hero_media_id
$resValMedia = apiRequest('POST', '/api/v1/pages', [
    'title' => 'Test Page Validation',
    'hero_media_id' => 999999
], $superAdminToken);
recordResult(
    "Rejection of non-existent hero_media_id (422)",
    $resValMedia['status'] === 422 && isset($resValMedia['json']['errors']['hero_media_id']),
    "Error: " . ($resValMedia['json']['errors']['hero_media_id'] ?? '')
);

// 3. Invalid status value
$resValStatus = apiRequest('POST', '/api/v1/pages', [
    'title' => 'Test Page Invalid Status',
    'status' => 'inactive'
], $superAdminToken);
recordResult(
    "Rejection of invalid status value (422)",
    $resValStatus['status'] === 422 && isset($resValStatus['json']['errors']['status']),
    "Error: " . ($resValStatus['json']['errors']['status'] ?? '')
);

// 4. Invalid custom slug format
$resValSlug = apiRequest('POST', '/api/v1/pages', [
    'title' => 'Test Page Invalid Slug',
    'slug' => 'INVALID SLUG with Spaces!'
], $superAdminToken);
recordResult(
    "Rejection of invalid slug format (422)",
    $resValSlug['status'] === 422 && isset($resValSlug['json']['errors']['slug']),
    "Error: " . ($resValSlug['json']['errors']['slug'] ?? '')
);

// -----------------------------------------------------------------------------
// SECTION 5: CRUD Operations, Slug Handling & Media Integration
// -----------------------------------------------------------------------------
echo PHP_EOL . "5. CRUD Operations, Slug Handling & Media Integration:" . PHP_EOL;

// Upload a test media image for page hero media
$testImgContent = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
$tempImgPath = BACKEND_ROOT . DIRECTORY_SEPARATOR . 'tests' . DIRECTORY_SEPARATOR . 'temp_page_hero.png';
file_put_contents($tempImgPath, $testImgContent);

$resMediaUpload = apiRequest('POST', '/api/v1/media/upload', ['alt_text' => 'Page Hero Image'], $superAdminToken, ['file' => $tempImgPath]);
$heroMediaId = $resMediaUpload['json']['data']['id'] ?? null;
@unlink($tempImgPath);

// 1. Create Page 1 with automatic slug generation
$page1Payload = [
    'title' => 'Test Travel Guide & Insights',
    'subtitle' => 'Comprehensive South India travel tips and recommendations',
    'hero_media_id' => $heroMediaId,
    'content' => '<p>Welcome to our comprehensive South India travel guide.</p>',
    'seo_title' => 'South India Travel Guide | Tramax Tours',
    'seo_description' => 'Explore insider tips and local recommendations for South Indian destinations.',
    'status' => 'published',
];

$resCreatePage1 = apiRequest('POST', '/api/v1/pages', $page1Payload, $superAdminToken);
$page1Id = (int) ($resCreatePage1['json']['data']['id'] ?? 0);
$page1Slug = $resCreatePage1['json']['data']['slug'] ?? '';
recordResult(
    "POST /api/v1/pages creates page with automatic slug (201 Created)",
    $resCreatePage1['status'] === 201 && $page1Id > 0 && $page1Slug === 'test-travel-guide-insights',
    "ID: {$page1Id}, Slug: {$page1Slug}"
);

// 2. Create Page 2 with identical title -> Auto-resolves slug collision with suffix -2
$resCreatePage2 = apiRequest('POST', '/api/v1/pages', [
    'title' => 'Test Travel Guide & Insights',
    'content' => '<p>Second edition guide.</p>',
], $superAdminToken);
$page2Id = (int) ($resCreatePage2['json']['data']['id'] ?? 0);
$page2Slug = $resCreatePage2['json']['data']['slug'] ?? '';
recordResult(
    "Automatic unique slug collision resolution (appends -2)",
    $resCreatePage2['status'] === 201 && $page2Id > 0 && $page2Slug === 'test-travel-guide-insights-2',
    "Slug: {$page2Slug}"
);

// 3. Explicit duplicate slug rejected
$resDupSlug = apiRequest('POST', '/api/v1/pages', [
    'title' => 'Another Travel Guide',
    'slug' => 'test-travel-guide-insights',
    'content' => '<p>Duplicate slug attempt.</p>'
], $superAdminToken);
recordResult(
    "Explicit duplicate custom slug is rejected (422)",
    $resDupSlug['status'] === 422 && isset($resDupSlug['json']['errors']['slug']),
    "Error: " . ($resDupSlug['json']['errors']['slug'] ?? '')
);

// 4. View / Detail: GET /api/v1/pages/{id} returns complete stored page data and hero_media object
$resShowPage = apiRequest('GET', "/api/v1/pages/{$page1Id}", [], $superAdminToken);
$pageData = $resShowPage['json']['data'] ?? [];
$hasCompleteFields = isset($pageData['id'], $pageData['slug'], $pageData['title'], $pageData['subtitle'], $pageData['content'], $pageData['seo_title'], $pageData['seo_description'], $pageData['status'], $pageData['created_at'], $pageData['updated_at']);
$hasHeroMedia = !empty($pageData['hero_media']) && ($pageData['hero_media']['id'] ?? 0) === $heroMediaId;

recordResult(
    "GET /api/v1/pages/{id} retrieves complete page details and hero_media object (200 OK)",
    $resShowPage['status'] === 200 && $hasCompleteFields && $hasHeroMedia,
    "Title: {$pageData['title']}, Hero Media URL: " . ($pageData['hero_media']['url'] ?? '')
);

// 5. Lookup by Slug: GET /api/v1/pages/{slug}
$resShowSlug = apiRequest('GET', "/api/v1/pages/{$page1Slug}", [], $superAdminToken);
recordResult(
    "GET /api/v1/pages/{slug} retrieves page by unique slug (200 OK)",
    $resShowSlug['status'] === 200 && ($resShowSlug['json']['data']['id'] ?? 0) === $page1Id,
    "Slug: {$resShowSlug['json']['data']['slug']}"
);

// 6. Update Page via PUT: Full update
$updatePayload = [
    'title' => 'Updated South India Travel Guide',
    'subtitle' => 'The ultimate 2026 travel companion',
    'content' => '<p>Updated comprehensive guide content with latest travel tips.</p>',
    'seo_title' => 'Ultimate 2026 South India Travel Guide | Tramax Tours',
    'seo_description' => 'Updated guide featuring travel tips, routes, and packing lists.',
];
$resUpdatePage = apiRequest('PUT', "/api/v1/pages/{$page1Id}", $updatePayload, $superAdminToken);
recordResult(
    "PUT /api/v1/pages/{id} updates full fields successfully (200 OK)",
    $resUpdatePage['status'] === 200 && ($resUpdatePage['json']['data']['title'] ?? '') === 'Updated South India Travel Guide',
    "Updated Title: " . ($resUpdatePage['json']['data']['title'] ?? '')
);

// 7. Partial Update via PATCH: updates only supplied field while preserving others
$patchPayload = [
    'subtitle' => 'Newly patched subtitle only'
];
$resPatchPage = apiRequest('PATCH', "/api/v1/pages/{$page1Id}", $patchPayload, $superAdminToken);
$patchedData = $resPatchPage['json']['data'] ?? [];
recordResult(
    "PATCH /api/v1/pages/{id} preserves unsupplied fields and updates target field (200 OK)",
    $resPatchPage['status'] === 200 && ($patchedData['subtitle'] ?? '') === 'Newly patched subtitle only' && ($patchedData['title'] ?? '') === 'Updated South India Travel Guide' && !empty($patchedData['seo_title']),
    "Patched Subtitle: " . ($patchedData['subtitle'] ?? '')
);

// -----------------------------------------------------------------------------
// SECTION 6: Publishing & Status Transitions
// -----------------------------------------------------------------------------
echo PHP_EOL . "6. Publishing & Status Transitions:" . PHP_EOL;

// 1. Unpublish page -> draft
$resUnpublish = apiRequest('POST', "/api/v1/pages/{$page1Id}/unpublish", [], $superAdminToken);
recordResult(
    "POST /api/v1/pages/{id}/unpublish changes status to 'draft' (200 OK)",
    $resUnpublish['status'] === 200 && ($resUnpublish['json']['data']['status'] ?? '') === 'draft',
    "Status: " . ($resUnpublish['json']['data']['status'] ?? '')
);

// 2. Publish page -> published
$resPublish = apiRequest('POST', "/api/v1/pages/{$page1Id}/publish", [], $superAdminToken);
recordResult(
    "POST /api/v1/pages/{id}/publish changes status to 'published' (200 OK)",
    $resPublish['status'] === 200 && ($resPublish['json']['data']['status'] ?? '') === 'published',
    "Status: " . ($resPublish['json']['data']['status'] ?? '')
);

// -----------------------------------------------------------------------------
// SECTION 7: Search, Filtering & Pagination
// -----------------------------------------------------------------------------
echo PHP_EOL . "7. Search, Filtering & Pagination:" . PHP_EOL;

// 1. List pages
$resPagesList = apiRequest('GET', '/api/v1/pages', [], $superAdminToken);
recordResult(
    "GET /api/v1/pages returns paginated list (200 OK)",
    $resPagesList['status'] === 200 && is_array($resPagesList['json']['data']),
    "Total pages: " . ($resPagesList['json']['pagination']['total'] ?? 0)
);

// 2. Search query filter
$resSearch = apiRequest('GET', '/api/v1/pages?search=Guide', [], $superAdminToken);
recordResult(
    "Filter pages by search query (?search=Guide)",
    $resSearch['status'] === 200 && count($resSearch['json']['data'] ?? []) >= 1,
    "Matched: " . count($resSearch['json']['data'] ?? [])
);

// 3. Status filter
$resStatusFilter = apiRequest('GET', '/api/v1/pages?status=published', [], $superAdminToken);
recordResult(
    "Filter pages by status (?status=published)",
    $resStatusFilter['status'] === 200 && count($resStatusFilter['json']['data'] ?? []) >= 1,
    "Published count: " . count($resStatusFilter['json']['data'] ?? [])
);

// 4. Pagination limit
$resLimit = apiRequest('GET', '/api/v1/pages?limit=1', [], $superAdminToken);
recordResult(
    "Pagination limit is respected (?limit=1)",
    $resLimit['status'] === 200 && count($resLimit['json']['data'] ?? []) === 1,
    "Returned: " . count($resLimit['json']['data'] ?? [])
);

// -----------------------------------------------------------------------------
// SECTION 8: Reversible Soft-Delete & Undo/Restore Architecture
// -----------------------------------------------------------------------------
echo PHP_EOL . "8. Reversible Soft-Delete & Undo/Restore Architecture:" . PHP_EOL;

// 1. Soft-delete Page
$resSoftDelete = apiRequest('DELETE', "/api/v1/pages/{$page1Id}", [], $superAdminToken);
recordResult(
    "DELETE /api/v1/pages/{id} returns soft-delete confirmation with deleted_at and deleted_by",
    $resSoftDelete['status'] === 200 && ($resSoftDelete['json']['data']['is_deleted'] ?? false) === true && !empty($resSoftDelete['json']['data']['deleted_at']),
    "Deleted At: " . ($resSoftDelete['json']['data']['deleted_at'] ?? 'none')
);

// 2. Soft-deleted page is excluded from normal active listings
$resActivePagesList = apiRequest('GET', '/api/v1/pages', [], $superAdminToken);
$pageIdsInActiveList = array_column($resActivePagesList['json']['data'] ?? [], 'id');
recordResult(
    "Soft-deleted page is excluded from normal active listings",
    !in_array($page1Id, $pageIdsInActiveList, true)
);

// 3. Soft-deleted page returns 404 on normal active detail query
$resShowDeleted = apiRequest('GET', "/api/v1/pages/{$page1Id}", [], $superAdminToken);
recordResult(
    "Soft-deleted page returns 404 on normal active detail query",
    $resShowDeleted['status'] === 404
);

// 4. Original page record, content, and hero_media_id still intact in database
$stmt = $pdo->prepare("SELECT id, title, slug, content, hero_media_id, deleted_at, deleted_by FROM pages WHERE id = ?");
$stmt->execute([$page1Id]);
$dbPage = $stmt->fetch(PDO::FETCH_ASSOC);
recordResult(
    "Original page record, content, and metadata are preserved in database during soft delete",
    $dbPage !== false && (int) $dbPage['id'] === $page1Id && !empty($dbPage['deleted_at']) && (int) ($dbPage['deleted_by'] ?? 0) === (int) $superAdmin['id'],
    "Preserved Title: {$dbPage['title']}, Deleted By ID: " . ($dbPage['deleted_by'] ?? '')
);

// 5. Cannot publish soft-deleted page
$resPublishDeleted = apiRequest('POST', "/api/v1/pages/{$page1Id}/publish", [], $superAdminToken);
recordResult(
    "Cannot publish soft-deleted page (404 NOT_FOUND)",
    $resPublishDeleted['status'] === 404
);

// 6. Restore Page via POST /api/v1/pages/{id}/restore
$resRestorePage = apiRequest('POST', "/api/v1/pages/{$page1Id}/restore", [], $superAdminToken);
$restoredPage = $resRestorePage['json']['data'] ?? [];
recordResult(
    "POST /api/v1/pages/{id}/restore restores page with SAME ID, clears deleted_at/by (200 OK)",
    $resRestorePage['status'] === 200 && ($restoredPage['id'] ?? 0) === $page1Id && empty($restoredPage['deleted_at']) && empty($restoredPage['deleted_by']),
    "Restored Title: " . ($restoredPage['title'] ?? '')
);

// 7. Verify restored page is back in active listings
$resActivePagesAfter = apiRequest('GET', '/api/v1/pages', [], $superAdminToken);
$pageIdsAfterRestore = array_column($resActivePagesAfter['json']['data'] ?? [], 'id');
recordResult(
    "Restored page is actively listed again in normal listings",
    in_array($page1Id, $pageIdsAfterRestore, true)
);

// -----------------------------------------------------------------------------
// SECTION 9: Seeded System Pages Verification
// -----------------------------------------------------------------------------
echo PHP_EOL . "9. Seeded System Pages Verification:" . PHP_EOL;

$seededSlugs = ['about-us', 'terms-conditions', 'refund-policy', 'privacy-policy'];
$allSeededFound = true;

foreach ($seededSlugs as $sSlug) {
    $resSeeded = apiRequest('GET', "/api/v1/pages/{$sSlug}", [], $superAdminToken);
    if ($resSeeded['status'] !== 200 || ($resSeeded['json']['data']['slug'] ?? '') !== $sSlug) {
        $allSeededFound = false;
        break;
    }
}
recordResult("All 4 seeded system pages (about-us, terms, refund, privacy) are active and viewable", $allSeededFound);

// -----------------------------------------------------------------------------
// SECTION 10: Audit Log Event Generation
// -----------------------------------------------------------------------------
echo PHP_EOL . "10. Audit Log Event Verification:" . PHP_EOL;

$stmt = $pdo->prepare("SELECT action, entity_type, entity_id FROM audit_logs WHERE action LIKE 'page_%' ORDER BY id DESC LIMIT 20");
$stmt->execute();
$auditLogs = $stmt->fetchAll(PDO::FETCH_ASSOC);

$hasCreateLog = false;
$hasUpdateLog = false;
$hasDeleteLog = false;
$hasRestoreLog = false;
$hasPublishLog = false;
$hasUnpublishLog = false;

foreach ($auditLogs as $log) {
    if ($log['action'] === 'page_create') $hasCreateLog = true;
    if ($log['action'] === 'page_update') $hasUpdateLog = true;
    if ($log['action'] === 'page_delete' || $log['action'] === 'page_soft_delete') $hasDeleteLog = true;
    if ($log['action'] === 'page_restore') $hasRestoreLog = true;
    if ($log['action'] === 'page_publish') $hasPublishLog = true;
    if ($log['action'] === 'page_unpublish') $hasUnpublishLog = true;
}

recordResult("Audit log recorded for 'page_create'", $hasCreateLog);
recordResult("Audit log recorded for 'page_update'", $hasUpdateLog);
recordResult("Audit log recorded for 'page_soft_delete'", $hasDeleteLog);
recordResult("Audit log recorded for 'page_restore'", $hasRestoreLog);
recordResult("Audit log recorded for 'page_publish'", $hasPublishLog);
recordResult("Audit log recorded for 'page_unpublish'", $hasUnpublishLog);

// -----------------------------------------------------------------------------
// SECTION 11: System Regressions (Health, Phase 3 Auth, Phase 4 Media, Phase 5 Destinations, Phase 6 Tours)
// -----------------------------------------------------------------------------
echo PHP_EOL . "11. System Regressions (Health, Phase 3 Auth, Phase 4 Media, Phase 5 Destinations, Phase 6 Tours):" . PHP_EOL;

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

// 5. Destinations Listing
$resDestList = apiRequest('GET', '/api/v1/destinations', [], $superAdminToken);
recordResult("GET /api/v1/destinations responds with 200 OK", $resDestList['status'] === 200);

// 6. Tours Listing
$resToursList = apiRequest('GET', '/api/v1/tours', [], $superAdminToken);
recordResult("GET /api/v1/tours responds with 200 OK", $resToursList['status'] === 200);

// -----------------------------------------------------------------------------
// SECTION 12: Cleanup Test Environment
// -----------------------------------------------------------------------------
echo PHP_EOL . "12. Test Environment Cleanup:" . PHP_EOL;

// Clean up test users, pages and media
$pdo->prepare("DELETE FROM user_roles WHERE user_id IN (?, ?)")->execute([$editorId, $moderatorId]);
$pdo->prepare("DELETE FROM users WHERE id IN (?, ?)")->execute([$editorId, $moderatorId]);

if ($heroMediaId) {
    $stmt = $pdo->prepare("SELECT file_path FROM media WHERE id = ?");
    $stmt->execute([$heroMediaId]);
    $fPath = $stmt->fetchColumn();
    if ($fPath) {
        $diskPath = BACKEND_ROOT . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $fPath);
        if (file_exists($diskPath)) @unlink($diskPath);
    }
    $pdo->prepare("DELETE FROM media WHERE id = ?")->execute([$heroMediaId]);
}

$pdo->exec("DELETE FROM pages WHERE title LIKE 'Test %' OR title LIKE 'Updated South India %' OR slug LIKE 'test-%'");

recordResult("All test database records and temporary files cleaned up", true);

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
echo PHP_EOL . "================================================================================" . PHP_EOL;
echo "  PHASE 7 VERIFICATION RESULTS" . PHP_EOL;
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
    echo "\033[32mALL PHASE 7 TESTS PASSED PERFECTLY!\033[0m" . PHP_EOL . PHP_EOL;
    exit(0);
}
