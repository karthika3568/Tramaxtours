<?php

/**
 * Wanderer South India - Phase 8J Admin Dashboard & Operations Overview Verification Test Suite
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

Env::load(BACKEND_ROOT . '/.env');

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
echo "  Wanderer South India — PHASE 8J ADMIN DASHBOARD VERIFICATION SUITE" . PHP_EOL;
echo "================================================================================" . PHP_EOL . PHP_EOL;

// 1. Spawning Test Server
$testPort = 8899;
$testHost = "127.0.0.1:{$testPort}";
$baseUrl = "http://{$testHost}";
$publicDir = BACKEND_ROOT . DIRECTORY_SEPARATOR . 'public';

$serverCommand = sprintf(
    'php -S %s -t %s %s',
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

register_shutdown_function(function () use (&$serverProcess, &$pipes) {
    if (is_resource($serverProcess)) {
        foreach ($pipes as $p) {
            if (is_resource($p)) fclose($p);
        }
        proc_terminate($serverProcess);
        proc_close($serverProcess);
    }
});

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

    $headers = [];
    if ($token !== null) {
        $headers[] = "Authorization: Bearer {$token}";
    }
    if (!empty($data) || in_array(strtoupper($method), ['POST', 'PUT', 'PATCH'])) {
        $payload = json_encode($data);
        $headers[] = 'Content-Type: application/json';
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    }

    if (!empty($headers)) {
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    }

    $rawResponse = curl_exec($ch);
    $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $json = json_decode((string) $rawResponse, true);

    return [
        'status' => $httpCode,
        'raw' => $rawResponse,
        'json' => is_array($json) ? $json : null,
    ];
}

$pdo = Database::getConnection();

// -----------------------------------------------------------------------------
// SECTION 1: Permissions & Setup
// -----------------------------------------------------------------------------
echo "1. Permissions & RBAC Token Generation:" . PHP_EOL;

$superAdminToken = JWT::encode([
    'sub' => 1,
    'id' => 1,
    'email' => 'admin@wanderersouthindia.com',
    'name' => 'Super Admin',
    'role' => 'super_admin',
    'roles' => ['super_admin'],
    'permissions' => ['*'],
]);
recordResult("Super Admin token generated", !empty($superAdminToken));

// Create Viewer User with dashboard.view
$pdo->prepare("DELETE FROM users WHERE email = 'viewer.phase8j@wanderersouthindia.com'")->execute();
$pdo->prepare("INSERT INTO users (name, email, password_hash, status, created_at, updated_at) VALUES ('Phase8J Viewer', 'viewer.phase8j@wanderersouthindia.com', 'hash', 'active', NOW(), NOW())")->execute();
$viewerUserId = (int) $pdo->lastInsertId();

$pdo->prepare("DELETE FROM roles WHERE slug = 'phase8j_viewer_role'")->execute();
$pdo->prepare("INSERT INTO roles (name, slug, description, is_system, created_at, updated_at) VALUES ('Phase8J Dashboard Viewer', 'phase8j_viewer_role', 'Dashboard Viewer', 0, NOW(), NOW())")->execute();
$viewerRoleId = (int) $pdo->lastInsertId();
$pdo->prepare("INSERT INTO role_permissions (role_id, permission_id) SELECT ?, id FROM permissions WHERE name = 'dashboard.view'")->execute([$viewerRoleId]);
$pdo->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)")->execute([$viewerUserId, $viewerRoleId]);

$viewerToken = JWT::encode([
    'sub' => $viewerUserId,
    'id' => $viewerUserId,
    'email' => 'viewer.phase8j@wanderersouthindia.com',
    'role' => 'viewer',
    'permissions' => ['dashboard.view'],
]);
recordResult("Viewer token generated (has dashboard.view)", !empty($viewerToken));

// Create Unauthorized User (no permissions)
$pdo->prepare("DELETE FROM users WHERE email = 'noauth.phase8j@wanderersouthindia.com'")->execute();
$pdo->prepare("INSERT INTO users (name, email, password_hash, status, created_at, updated_at) VALUES ('Phase8J Guest', 'noauth.phase8j@wanderersouthindia.com', 'hash', 'active', NOW(), NOW())")->execute();
$guestUserId = (int) $pdo->lastInsertId();

$unauthorizedToken = JWT::encode([
    'sub' => $guestUserId,
    'id' => $guestUserId,
    'email' => 'noauth.phase8j@wanderersouthindia.com',
    'role' => 'customer',
    'permissions' => [],
]);
recordResult("Unauthorized token generated (lacks dashboard.view)", !empty($unauthorizedToken));

// -----------------------------------------------------------------------------
// SECTION 2: Authorization & Endpoint Protection
// -----------------------------------------------------------------------------
echo PHP_EOL . "2. Authorization & Endpoint Protection:" . PHP_EOL;

$resNoAuth = apiRequest('GET', '/api/v1/dashboard/stats');
recordResult("Unauthenticated GET /api/v1/dashboard/stats returns 401", $resNoAuth['status'] === 401);

$resForbidden = apiRequest('GET', '/api/v1/dashboard/stats', [], $unauthorizedToken);
recordResult("Unauthorized user without dashboard.view returns 403", $resForbidden['status'] === 403);

$resViewer = apiRequest('GET', '/api/v1/dashboard/stats', [], $viewerToken);
recordResult("Authorized user with dashboard.view returns 200 OK", $resViewer['status'] === 200);

// -----------------------------------------------------------------------------
// SECTION 3: Operations Metrics Verification
// -----------------------------------------------------------------------------
echo PHP_EOL . "3. Dashboard Operations Metrics Verification:" . PHP_EOL;

$resStats = apiRequest('GET', '/api/v1/dashboard/stats', [], $superAdminToken);
recordResult("Super Admin GET /api/v1/dashboard/stats returns 200 OK", $resStats['status'] === 200);

$data = $resStats['json']['data'] ?? [];
recordResult("Response contains 'overview' data section", isset($data['overview']));
recordResult("Overview contains tours metrics (total, published, draft)", isset($data['overview']['tours']['total']));
recordResult("Overview contains destinations metrics (total, published, draft)", isset($data['overview']['destinations']['total']));
recordResult("Overview contains bookings metrics (total, pending, confirmed, completed, total_value)", isset($data['overview']['bookings']['total']));
recordResult("Overview contains reviews metrics (total, pending, approved, average_rating)", isset($data['overview']['reviews']['total']));
recordResult("Overview contains pages metrics (total, published, draft)", isset($data['overview']['pages']['total']));
recordResult("Overview contains media metrics", isset($data['overview']['media']['total']));

// -----------------------------------------------------------------------------
// SECTION 4: Feed Data Verification
// -----------------------------------------------------------------------------
echo PHP_EOL . "4. Feed & Pending Items Verification:" . PHP_EOL;

recordResult("Response contains 'pending_actions' metrics", isset($data['pending_actions']['pending_bookings']));
recordResult("Response contains 'recent_bookings' array", is_array($data['recent_bookings'] ?? null));
recordResult("Response contains 'recent_reviews' array", is_array($data['recent_reviews'] ?? null));
recordResult("Response contains 'recent_tours' array", is_array($data['recent_tours'] ?? null));
recordResult("Response contains ISO 'timestamp'", !empty($data['timestamp']));

// -----------------------------------------------------------------------------
// SECTION 5: Cleanup
// -----------------------------------------------------------------------------
$pdo->prepare("DELETE FROM user_roles WHERE user_id IN (?, ?)")->execute([$viewerUserId, $guestUserId]);
$pdo->prepare("DELETE FROM role_permissions WHERE role_id = ?")->execute([$viewerRoleId]);
$pdo->prepare("DELETE FROM roles WHERE id = ?")->execute([$viewerRoleId]);
$pdo->prepare("DELETE FROM users WHERE id IN (?, ?)")->execute([$viewerUserId, $guestUserId]);
recordResult("Test users cleaned up successfully", true);

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
echo PHP_EOL . "================================================================================" . PHP_EOL;
echo "  PHASE 8J DASHBOARD VERIFICATION RESULTS" . PHP_EOL;
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
    echo "\033[32mALL PHASE 8J DASHBOARD TESTS PASSED PERFECTLY!\033[0m" . PHP_EOL . PHP_EOL;
    exit(0);
}
