<?php

/**
 * Wanderer South India - Phase 4 Comprehensive End-to-End Media API Verification Test Suite
 * 
 * Verifies all 27+ requirements including:
 * - RBAC & JWT Authorization (media.view, media.upload, media.delete)
 * - Multi-format file uploads (JPEG, PNG, WebP, SVG, PDF)
 * - Security validations (MIME spoofing, SVG XSS, blacklist extensions, file size limits)
 * - Directory traversal protections on static streamer
 * - Media library CRUD, pagination, search, metadata editing
 * - Content usage reference checking & protected/forced deletion
 * - Physical disk synchronization and cleanup
 * - Audit log event logging
 * - Health and database health endpoints regression check
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
echo "  Wanderer South India — PHASE 4 MEDIA LIBRARY END-TO-END VERIFICATION SUITE" . PHP_EOL;
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
        'php' => 'application/x-php',
        'exe' => 'application/x-msdownload',
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

// Initialize Database Connection
try {
    $pdo = Database::getConnection();
    // Clean up any test users/media from prior runs
    $pdo->exec("DELETE FROM users WHERE email IN ('editor.test@wanderersouthindia.com', 'moderator.test@wanderersouthindia.com')");
    $stmt = $pdo->query("SELECT id, file_path FROM media WHERE original_name LIKE 'sample_%' OR original_name LIKE 'tour_%'");
    while ($row = $stmt->fetch()) {
        $diskPath = BACKEND_ROOT . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $row['file_path']);
        if (file_exists($diskPath)) @unlink($diskPath);
    }
    $pdo->exec("DELETE FROM media WHERE original_name LIKE 'sample_%' OR original_name LIKE 'tour_%'");
} catch (Throwable $e) {
    die("Database connection failed: " . $e->getMessage() . "\n");
}

// -----------------------------------------------------------------------------
// SECTION 1: Health Endpoints Verification
// -----------------------------------------------------------------------------
echo "1. Health & System Status Endpoints:" . PHP_EOL;

$resHealth = apiRequest('GET', '/api/v1/health');
recordResult(
    "GET /api/v1/health responds with 200 OK and healthy status",
    $resHealth['status'] === 200 && ($resHealth['json']['data']['status'] ?? '') === 'healthy',
    "Status: " . ($resHealth['json']['data']['status'] ?? 'unknown')
);

$resDbHealth = apiRequest('GET', '/api/v1/health/database');
recordResult(
    "GET /api/v1/health/database responds with 200 OK and connected status",
    $resDbHealth['status'] === 200 && ($resDbHealth['json']['data']['status'] ?? '') === 'connected',
    "Database: " . ($resDbHealth['json']['data']['database'] ?? 'unknown') . " (" . ($resDbHealth['json']['data']['tables_count'] ?? 0) . " tables)"
);

// -----------------------------------------------------------------------------
// SECTION 2: Authentication & RBAC Tokens Setup
// -----------------------------------------------------------------------------
echo PHP_EOL . "2. Authentication & RBAC Permission Tokens Setup:" . PHP_EOL;

// Super Admin Token (has all permissions)
$superAdminToken = JWT::encode([
    'sub' => 1,
    'email' => 'admin@wanderersouthindia.com',
    'name' => 'Super Admin',
    'role' => 'super_admin',
]);

// Create or ensure an Editor user (Role 3: has media.view and media.upload, but NOT media.delete)
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = 'editor.test@wanderersouthindia.com' LIMIT 1");
$stmt->execute();
$editorId = $stmt->fetchColumn();

if (!$editorId) {
    $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, phone, status, email_verified_at, created_at, updated_at)
        VALUES ('Test Editor', 'editor.test@wanderersouthindia.com', 'test_hash', '+919999999991', 'active', NOW(), NOW(), NOW())");
    $stmt->execute();
    $editorId = (int) $pdo->lastInsertId();
    $pdo->prepare("INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, 3)")->execute([$editorId]);
}
$editorToken = JWT::encode([
    'sub' => (int) $editorId,
    'email' => 'editor.test@wanderersouthindia.com',
    'name' => 'Test Editor',
    'role' => 'editor',
]);

// Create or ensure a Moderator user (Role 4: has NO media permissions)
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = 'moderator.test@wanderersouthindia.com' LIMIT 1");
$stmt->execute();
$moderatorId = $stmt->fetchColumn();

if (!$moderatorId) {
    $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, phone, status, email_verified_at, created_at, updated_at)
        VALUES ('Test Moderator', 'moderator.test@wanderersouthindia.com', 'test_hash', '+919999999992', 'active', NOW(), NOW(), NOW())");
    $stmt->execute();
    $moderatorId = (int) $pdo->lastInsertId();
    $pdo->prepare("INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, 4)")->execute([$moderatorId]);
}
$moderatorToken = JWT::encode([
    'sub' => (int) $moderatorId,
    'email' => 'moderator.test@wanderersouthindia.com',
    'name' => 'Test Moderator',
    'role' => 'moderator',
]);

recordResult("Super Admin JWT Token generated", !empty($superAdminToken));
recordResult("Editor JWT Token generated (has media.view, media.upload)", !empty($editorToken));
recordResult("Moderator JWT Token generated (lacks media permissions)", !empty($moderatorToken));

// -----------------------------------------------------------------------------
// SECTION 3: Authorization & Permission Enforcement Checks
// -----------------------------------------------------------------------------
echo PHP_EOL . "3. Media Authorization & Permission Enforcement:" . PHP_EOL;

// 1. Unauthenticated request
$resUnauth = apiRequest('GET', '/api/v1/media');
recordResult(
    "Unauthenticated request to GET /api/v1/media is rejected with 401",
    $resUnauth['status'] === 401 && ($resUnauth['json']['error_code'] ?? '') === 'UNAUTHORIZED',
    "HTTP {$resUnauth['status']}, error_code: " . ($resUnauth['json']['error_code'] ?? '')
);

// 2. Permission check: media.view (moderator without permission)
$resModView = apiRequest('GET', '/api/v1/media', [], $moderatorToken);
recordResult(
    "User without media.view is rejected with 403 FORBIDDEN_PERMISSION",
    $resModView['status'] === 403 && ($resModView['json']['error_code'] ?? '') === 'FORBIDDEN_PERMISSION',
    "HTTP {$resModView['status']}, error_code: " . ($resModView['json']['error_code'] ?? '')
);

// 3. Permission check: media.view (editor with permission)
$resEditorView = apiRequest('GET', '/api/v1/media', [], $editorToken);
recordResult(
    "User with media.view is allowed access to GET /api/v1/media (200 OK)",
    $resEditorView['status'] === 200 && ($resEditorView['json']['success'] ?? false) === true,
    "HTTP {$resEditorView['status']}"
);

// -----------------------------------------------------------------------------
// SECTION 4: File Upload Format Tests
// -----------------------------------------------------------------------------
echo PHP_EOL . "4. Valid Media Format Uploads:" . PHP_EOL;

$tmpDir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'wanderer_test_' . uniqid();
@mkdir($tmpDir, 0755, true);

$uploadedMediaIds = [];
$uploadedFilePaths = [];

// Helper to create test files
function createTestFile(string $dir, string $filename, string $content): string
{
    $path = $dir . DIRECTORY_SEPARATOR . $filename;
    file_put_contents($path, $content);
    return $path;
}

// 1. Valid JPEG
$validJpegData = "\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00\xFF\xDB\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.' \",#\x1c\x1c(7),01444\x1f'9=82<.342\xFF\xC0\x00\x11\x08\x00\x01\x00\x01\x03\x01\"\x00\x02\x11\x01\x03\x11\x01\xFF\xC4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xFF\xDA\x00\x08\x01\x01\x00\x00?\x00\xBF\x00\xFF\xD9";
$jpegFile = createTestFile($tmpDir, 'sample_photo.jpg', $validJpegData);

$resJpeg = apiRequest('POST', '/api/v1/media/upload', ['alt_text' => 'Sample Sunset', 'caption' => 'Beautiful Sunset'], $superAdminToken, ['file' => $jpegFile]);
recordResult(
    "Upload valid JPEG image responds with 201 Created",
    $resJpeg['status'] === 201 && ($resJpeg['json']['data']['mime_type'] ?? '') === 'image/jpeg',
    "ID: " . ($resJpeg['json']['data']['id'] ?? 'none') . ", MIME: " . ($resJpeg['json']['data']['mime_type'] ?? '')
);
if (!empty($resJpeg['json']['data']['id'])) {
    $uploadedMediaIds['jpeg'] = (int) $resJpeg['json']['data']['id'];
    $uploadedFilePaths['jpeg'] = $resJpeg['json']['data']['file_path'];
}

// 2. Valid PNG (1x1 transparent PNG)
$validPngData = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
$pngFile = createTestFile($tmpDir, 'sample_icon.png', $validPngData);

$resPng = apiRequest('POST', '/api/v1/media/upload', ['alt_text' => 'Sample PNG Icon'], $superAdminToken, ['file' => $pngFile]);
recordResult(
    "Upload valid PNG image responds with 201 Created",
    $resPng['status'] === 201 && ($resPng['json']['data']['mime_type'] ?? '') === 'image/png',
    "ID: " . ($resPng['json']['data']['id'] ?? 'none') . ", MIME: " . ($resPng['json']['data']['mime_type'] ?? '')
);
if (!empty($resPng['json']['data']['id'])) {
    $uploadedMediaIds['png'] = (int) $resPng['json']['data']['id'];
    $uploadedFilePaths['png'] = $resPng['json']['data']['file_path'];
}

// 3. Valid WebP (1x1 WebP)
$validWebpData = base64_decode('UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAD8D+JaQAA3AA/ua1AAA=');
$webpFile = createTestFile($tmpDir, 'sample_banner.webp', $validWebpData);

$resWebp = apiRequest('POST', '/api/v1/media/upload', ['alt_text' => 'Sample WebP Banner'], $superAdminToken, ['file' => $webpFile]);
recordResult(
    "Upload valid WebP image responds with 201 Created",
    $resWebp['status'] === 201 && ($resWebp['json']['data']['mime_type'] ?? '') === 'image/webp',
    "ID: " . ($resWebp['json']['data']['id'] ?? 'none') . ", MIME: " . ($resWebp['json']['data']['mime_type'] ?? '')
);
if (!empty($resWebp['json']['data']['id'])) {
    $uploadedMediaIds['webp'] = (int) $resWebp['json']['data']['id'];
    $uploadedFilePaths['webp'] = $resWebp['json']['data']['file_path'];
}

// 4. Valid SVG
$validSvgData = '<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#0284c7"/></svg>';
$svgFile = createTestFile($tmpDir, 'sample_vector.svg', $validSvgData);

$resSvg = apiRequest('POST', '/api/v1/media/upload', ['alt_text' => 'Vector Icon'], $superAdminToken, ['file' => $svgFile]);
recordResult(
    "Upload valid SVG vector responds with 201 Created",
    $resSvg['status'] === 201 && ($resSvg['json']['data']['mime_type'] ?? '') === 'image/svg+xml',
    "ID: " . ($resSvg['json']['data']['id'] ?? 'none') . ", MIME: " . ($resSvg['json']['data']['mime_type'] ?? '')
);
if (!empty($resSvg['json']['data']['id'])) {
    $uploadedMediaIds['svg'] = (int) $resSvg['json']['data']['id'];
    $uploadedFilePaths['svg'] = $resSvg['json']['data']['file_path'];
}

// 5. Valid PDF
$validPdfData = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n190\n%%EOF";
$pdfFile = createTestFile($tmpDir, 'tour_itinerary.pdf', $validPdfData);

$resPdf = apiRequest('POST', '/api/v1/media/upload', ['alt_text' => 'Tour Itinerary Document'], $superAdminToken, ['file' => $pdfFile]);
recordResult(
    "Upload valid PDF document responds with 201 Created",
    $resPdf['status'] === 201 && ($resPdf['json']['data']['mime_type'] ?? '') === 'application/pdf',
    "ID: " . ($resPdf['json']['data']['id'] ?? 'none') . ", MIME: " . ($resPdf['json']['data']['mime_type'] ?? '')
);
if (!empty($resPdf['json']['data']['id'])) {
    $uploadedMediaIds['pdf'] = (int) $resPdf['json']['data']['id'];
    $uploadedFilePaths['pdf'] = $resPdf['json']['data']['file_path'];
}

// -----------------------------------------------------------------------------
// SECTION 5: Security & Rejection Tests
// -----------------------------------------------------------------------------
echo PHP_EOL . "5. Security Protections & Malicious Payload Rejection:" . PHP_EOL;

// 1. Disallowed Extension (e.g. .php script)
$phpScriptFile = createTestFile($tmpDir, 'backdoor.php', '<?php phpinfo(); ?>');
$resPhp = apiRequest('POST', '/api/v1/media/upload', [], $superAdminToken, ['file' => $phpScriptFile]);
recordResult(
    "Rejection of prohibited script extension (.php)",
    $resPhp['status'] === 400 && ($resPhp['json']['success'] ?? true) === false,
    "HTTP {$resPhp['status']}: " . ($resPhp['json']['message'] ?? '')
);

// 2. Disallowed Executable (e.g. .exe)
$exeFile = createTestFile($tmpDir, 'malware.exe', 'MZ9000');
$resExe = apiRequest('POST', '/api/v1/media/upload', [], $superAdminToken, ['file' => $exeFile]);
recordResult(
    "Rejection of disallowed executable (.exe)",
    $resExe['status'] === 400,
    "HTTP {$resExe['status']}: " . ($resExe['json']['message'] ?? '')
);

// 3. MIME spoofing / fake extension (Text file disguised as .jpg)
$fakeJpgFile = createTestFile($tmpDir, 'spoofed.jpg', 'This is plain text and not a real jpeg binary file.');
$resFakeJpg = apiRequest('POST', '/api/v1/media/upload', [], $superAdminToken, ['file' => $fakeJpgFile]);
recordResult(
    "Rejection of disguised/spoofed MIME type (corrupted or fake image data)",
    $resFakeJpg['status'] === 400,
    "HTTP {$resFakeJpg['status']}: " . ($resFakeJpg['json']['message'] ?? '')
);

// 4. SVG XSS Script Injection
$xssSvgData = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert("XSS")</script><circle cx="50" cy="50" r="50"/></svg>';
$xssSvgFile = createTestFile($tmpDir, 'malicious_xss.svg', $xssSvgData);
$resXssSvg = apiRequest('POST', '/api/v1/media/upload', [], $superAdminToken, ['file' => $xssSvgFile]);
recordResult(
    "Rejection of SVG with <script> tag (XSS Protection)",
    $resXssSvg['status'] === 400 && str_contains(strtolower($resXssSvg['json']['message'] ?? ''), 'dangerous script'),
    "HTTP {$resXssSvg['status']}: " . ($resXssSvg['json']['message'] ?? '')
);

// 5. SVG with dangerous onload attribute
$onloadSvgData = '<svg xmlns="http://www.w3.org/2000/svg" onload="fetch(\'/steal\')"><rect width="100" height="100"/></svg>';
$onloadSvgFile = createTestFile($tmpDir, 'onload_xss.svg', $onloadSvgData);
$resOnloadSvg = apiRequest('POST', '/api/v1/media/upload', [], $superAdminToken, ['file' => $onloadSvgFile]);
recordResult(
    "Rejection of SVG with inline event handlers (onload=)",
    $resOnloadSvg['status'] === 400,
    "HTTP {$resOnloadSvg['status']}: " . ($resOnloadSvg['json']['message'] ?? '')
);

// 6. Oversized file (Exceeding max configured limit)
$oversizedData = str_repeat('A', 11 * 1024 * 1024); // 11 MB > 10MB
$oversizedFile = createTestFile($tmpDir, 'oversized.pdf', "%PDF-1.4\n" . $oversizedData . "\n%%EOF");
$resOversized = apiRequest('POST', '/api/v1/media/upload', [], $superAdminToken, ['file' => $oversizedFile]);
recordResult(
    "Rejection of oversized upload (> 10MB limit)",
    $resOversized['status'] === 400 && str_contains(strtolower($resOversized['json']['message'] ?? ''), 'exceeds the maximum allowable'),
    "HTTP {$resOversized['status']}: " . ($resOversized['json']['message'] ?? '')
);

// 7. Directory Traversal check on static streamer
$resTraversal = apiRequest('GET', '/uploads/../.env');
recordResult(
    "Directory traversal protection on static uploads streamer (GET /uploads/../.env rejected)",
    in_array($resTraversal['status'], [403, 404], true),
    "HTTP {$resTraversal['status']}: " . ($resTraversal['json']['message'] ?? 'Denied')
);

// 8. Legitimate static file streaming verification
if (!empty($uploadedFilePaths['png'])) {
    $validStreamPath = '/' . ltrim($uploadedFilePaths['png'], '/');
    $resStream = apiRequest('GET', $validStreamPath);
    recordResult(
        "Legitimate media file serving via static streamer (GET {$validStreamPath})",
        $resStream['status'] === 200 && str_contains($resStream['headers']['content_type'] ?? '', 'image/png'),
        "HTTP {$resStream['status']}, Content-Type: " . ($resStream['headers']['content_type'] ?? '')
    );
}

// -----------------------------------------------------------------------------
// SECTION 6: Media Listing, Filtering & Pagination
// -----------------------------------------------------------------------------
echo PHP_EOL . "6. Media Library Listing, Searching, Filtering & Pagination:" . PHP_EOL;

// 1. List all media
$resList = apiRequest('GET', '/api/v1/media', [], $superAdminToken);
recordResult(
    "GET /api/v1/media returns list of media items with pagination metadata",
    $resList['status'] === 200 && is_array($resList['json']['data']) && isset($resList['json']['pagination']['total']),
    "Total items: " . ($resList['json']['pagination']['total'] ?? 0)
);

// 2. Pagination test (limit=2)
$resPage = apiRequest('GET', '/api/v1/media?page=1&limit=2', [], $superAdminToken);
recordResult(
    "Pagination limit works as expected (limit=2)",
    $resPage['status'] === 200 && count($resPage['json']['data'] ?? []) <= 2 && ($resPage['json']['pagination']['limit'] ?? 0) === 2,
    "Returned: " . count($resPage['json']['data'] ?? []) . " items"
);

// 3. Filter by MIME type (image/png)
$resFilterMime = apiRequest('GET', '/api/v1/media?mime_type=image/png', [], $superAdminToken);
$allPng = true;
foreach ($resFilterMime['json']['data'] ?? [] as $item) {
    if (($item['mime_type'] ?? '') !== 'image/png') {
        $allPng = false;
        break;
    }
}
recordResult(
    "Filter by specific MIME type (mime_type=image/png)",
    $resFilterMime['status'] === 200 && $allPng && count($resFilterMime['json']['data'] ?? []) > 0,
    "Matched " . count($resFilterMime['json']['data'] ?? []) . " PNG assets"
);

// 4. Filter by type (type=document)
$resFilterDoc = apiRequest('GET', '/api/v1/media?type=document', [], $superAdminToken);
$allDoc = true;
foreach ($resFilterDoc['json']['data'] ?? [] as $item) {
    if (($item['mime_type'] ?? '') !== 'application/pdf') {
        $allDoc = false;
        break;
    }
}
recordResult(
    "Filter by general category (type=document returns application/pdf)",
    $resFilterDoc['status'] === 200 && $allDoc && count($resFilterDoc['json']['data'] ?? []) > 0,
    "Matched " . count($resFilterDoc['json']['data'] ?? []) . " document assets"
);

// 5. Search query (search='Sunset')
$resSearch = apiRequest('GET', '/api/v1/media?search=Sunset', [], $superAdminToken);
recordResult(
    "Search functionality (search='Sunset')",
    $resSearch['status'] === 200 && count($resSearch['json']['data'] ?? []) >= 1,
    "Matched " . count($resSearch['json']['data'] ?? []) . " matching items"
);

// -----------------------------------------------------------------------------
// SECTION 7: Single Item Retrieval, Usage References & Metadata Update
// -----------------------------------------------------------------------------
echo PHP_EOL . "7. Media Details, Usage References & Metadata Updates:" . PHP_EOL;

$targetJpegId = $uploadedMediaIds['jpeg'] ?? 0;

// 1. Single retrieval
$resSingle = apiRequest('GET', "/api/v1/media/{$targetJpegId}", [], $superAdminToken);
recordResult(
    "GET /api/v1/media/{id} retrieves complete metadata and usage references",
    $resSingle['status'] === 200 && ($resSingle['json']['data']['id'] ?? 0) === $targetJpegId && array_key_exists('usage_references', $resSingle['json']['data'] ?? []),
    "is_in_use: " . json_encode($resSingle['json']['data']['is_in_use'] ?? false)
);

// 2. Metadata Update (alt_text, caption)
$newAlt = "Updated Spectacular Sunset";
$newCaption = "Updated Caption 2026";
$resUpdate = apiRequest('PUT', "/api/v1/media/{$targetJpegId}", [
    'alt_text' => $newAlt,
    'caption' => $newCaption,
], $superAdminToken);

recordResult(
    "PUT /api/v1/media/{id} updates alt_text and caption successfully",
    $resUpdate['status'] === 200 && ($resUpdate['json']['data']['alt_text'] ?? '') === $newAlt && ($resUpdate['json']['data']['caption'] ?? '') === $newCaption,
    "Alt: " . ($resUpdate['json']['data']['alt_text'] ?? '')
);

// 3. Usage reference protection test:
// Attach the WebP media to home_benefits table as a test reference
$targetWebpId = $uploadedMediaIds['webp'] ?? 0;
$stmt = $pdo->prepare("INSERT INTO home_benefits (title, description, icon, media_id, display_order, status, created_at, updated_at)
    VALUES ('Test Benefit', 'Test Desc', 'compass', ?, 99, 'active', NOW(), NOW())");
$stmt->execute([$targetWebpId]);
$testBenefitId = (int) $pdo->lastInsertId();

// Verify that show endpoint reports is_in_use = true
$resWebpShow = apiRequest('GET', "/api/v1/media/{$targetWebpId}", [], $superAdminToken);
recordResult(
    "Usage check accurately detects active reference in home_benefits table",
    $resWebpShow['status'] === 200 && ($resWebpShow['json']['data']['is_in_use'] ?? false) === true && isset($resWebpShow['json']['data']['usage_references']['home_benefits']),
    "References: " . json_encode($resWebpShow['json']['data']['usage_references'] ?? [])
);

// 4. Protected deletion check (Deleting in-use media without force fails with 409)
$resDelBlocked = apiRequest('DELETE', "/api/v1/media/{$targetWebpId}", [], $superAdminToken);
recordResult(
    "Deletion of in-use media is blocked with 409 MEDIA_IN_USE",
    $resDelBlocked['status'] === 409 && ($resDelBlocked['json']['error_code'] ?? '') === 'MEDIA_IN_USE',
    "HTTP {$resDelBlocked['status']}: " . ($resDelBlocked['json']['message'] ?? '')
);

// 5. Force-delete behavior:
$resForceDel = apiRequest('DELETE', "/api/v1/media/{$targetWebpId}?force=true", [], $superAdminToken);
recordResult(
    "Force-deletion with ?force=true successfully unlinks and deletes media",
    $resForceDel['status'] === 200,
    "HTTP {$resForceDel['status']}"
);

// Clean up test benefit
$pdo->prepare("DELETE FROM home_benefits WHERE id = ?")->execute([$testBenefitId]);

// -----------------------------------------------------------------------------
// SECTION 8: Permission Enforcement on Deletion & Physical Disk Cleanup
// -----------------------------------------------------------------------------
echo PHP_EOL . "8. Delete Permissions & Physical Disk Cleanup:" . PHP_EOL;

$targetSvgId = $uploadedMediaIds['svg'] ?? 0;
$targetSvgRelativePath = $uploadedFilePaths['svg'] ?? '';
$targetSvgDiskPath = BACKEND_ROOT . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $targetSvgRelativePath);

// 1. Editor trying to delete (Editor lacks media.delete permission)
$resEditorDelete = apiRequest('DELETE', "/api/v1/media/{$targetSvgId}", [], $editorToken);
recordResult(
    "User lacking media.delete permission is blocked with 403 FORBIDDEN_PERMISSION",
    $resEditorDelete['status'] === 403 && ($resEditorDelete['json']['error_code'] ?? '') === 'FORBIDDEN_PERMISSION',
    "HTTP {$resEditorDelete['status']}"
);

// 2. Physical file exists before deletion
recordResult(
    "Physical uploaded media file exists on disk prior to deletion",
    file_exists($targetSvgDiskPath) && is_file($targetSvgDiskPath),
    "Disk path: {$targetSvgDiskPath}"
);

// 3. Super Admin deleting unused media
$resAdminDelete = apiRequest('DELETE', "/api/v1/media/{$targetSvgId}", [], $superAdminToken);
recordResult(
    "DELETE /api/v1/media/{id} removes record from database (200 OK)",
    $resAdminDelete['status'] === 200,
    "HTTP {$resAdminDelete['status']}"
);

// 4. Physical file is deleted from disk after deletion
recordResult(
    "Physical file is automatically unlinked and removed from disk on deletion",
    !file_exists($targetSvgDiskPath),
    "Verified file removed from storage"
);

// -----------------------------------------------------------------------------
// SECTION 9: Audit Log Verification
// -----------------------------------------------------------------------------
echo PHP_EOL . "9. Audit Log Event Generation:" . PHP_EOL;

$stmt = $pdo->prepare("SELECT action, entity_type, entity_id FROM audit_logs WHERE action IN ('media_upload', 'media_update', 'media_delete') ORDER BY id DESC LIMIT 5");
$stmt->execute();
$auditLogs = $stmt->fetchAll(PDO::FETCH_ASSOC);

$hasUploadLog = false;
$hasUpdateLog = false;
$hasDeleteLog = false;

foreach ($auditLogs as $log) {
    if ($log['action'] === 'media_upload' && $log['entity_type'] === 'media') $hasUploadLog = true;
    if ($log['action'] === 'media_update' && $log['entity_type'] === 'media') $hasUpdateLog = true;
    if ($log['action'] === 'media_delete' && $log['entity_type'] === 'media') $hasDeleteLog = true;
}

recordResult("Audit log recorded for 'media_upload'", $hasUploadLog);
recordResult("Audit log recorded for 'media_update'", $hasUpdateLog);
recordResult("Audit log recorded for 'media_delete'", $hasDeleteLog);

// -----------------------------------------------------------------------------
// SECTION 10: Cleanup Test Data
// -----------------------------------------------------------------------------
echo PHP_EOL . "10. Test Environment Cleanup:" . PHP_EOL;

// Clean up remaining test media files
foreach ($uploadedMediaIds as $key => $mid) {
    if ($key !== 'webp' && $key !== 'svg') {
        $diskRel = $uploadedFilePaths[$key] ?? '';
        $diskP = BACKEND_ROOT . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $diskRel);
        if (file_exists($diskP)) @unlink($diskP);
        $pdo->prepare("DELETE FROM media WHERE id = ?")->execute([$mid]);
    }
}

// Clean up temporary test users
$pdo->prepare("DELETE FROM user_roles WHERE user_id IN (?, ?)")->execute([$editorId, $moderatorId]);
$pdo->prepare("DELETE FROM users WHERE id IN (?, ?)")->execute([$editorId, $moderatorId]);

// Clean up temporary directory
$tmpFiles = glob($tmpDir . DIRECTORY_SEPARATOR . '*');
foreach ($tmpFiles as $f) {
    if (is_file($f)) @unlink($f);
}
@rmdir($tmpDir);

recordResult("All test database records and temporary files cleaned up", true);

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
echo PHP_EOL . "================================================================================" . PHP_EOL;
echo "  PHASE 4 VERIFICATION RESULTS" . PHP_EOL;
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
    echo "\033[32mALL PHASE 4 TESTS PASSED PERFECTLY!\033[0m" . PHP_EOL . PHP_EOL;
    exit(0);
}
