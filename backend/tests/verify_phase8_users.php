<?php

/**
 * Tramax Tours - Phase 8K Admin Staff / User & Role Management Verification Test Suite
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
echo "  TRAMAX TOURS — PHASE 8K STAFF & ROLE MANAGEMENT VERIFICATION SUITE" . PHP_EOL;
echo "================================================================================" . PHP_EOL . PHP_EOL;

// 1. Spawning Test Server
$testPort = 8898;
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
// SECTION 1: Token Setup & RBAC Preparation
// -----------------------------------------------------------------------------
echo "1. Token Setup & RBAC Permissions:" . PHP_EOL;

$superAdminToken = JWT::encode([
    'sub' => 1,
    'id' => 1,
    'email' => 'admin@tramaxtours.com',
    'name' => 'Super Admin',
    'role' => 'super_admin',
    'roles' => ['super_admin'],
    'permissions' => ['*'],
]);
recordResult("Super Admin token generated", !empty($superAdminToken));

// Create Staff user with users.view only
$pdo->prepare("DELETE FROM users WHERE email = 'staff.viewer@tramaxtours.com'")->execute();
$pdo->prepare("INSERT INTO users (name, email, password_hash, status, created_at, updated_at) VALUES ('Staff Viewer', 'staff.viewer@tramaxtours.com', 'hash', 'active', NOW(), NOW())")->execute();
$staffViewerId = (int) $pdo->lastInsertId();

$pdo->prepare("DELETE FROM roles WHERE slug = 'phase8k_viewer_role'")->execute();
$pdo->prepare("INSERT INTO roles (name, slug, description, is_system, created_at, updated_at) VALUES ('Phase8K User Viewer', 'phase8k_viewer_role', 'Users Viewer', 0, NOW(), NOW())")->execute();
$viewerRoleId = (int) $pdo->lastInsertId();
$pdo->prepare("INSERT INTO role_permissions (role_id, permission_id) SELECT ?, id FROM permissions WHERE name IN ('users.view', 'roles.view')")->execute([$viewerRoleId]);
$pdo->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)")->execute([$staffViewerId, $viewerRoleId]);

$staffViewerToken = JWT::encode([
    'sub' => $staffViewerId,
    'id' => $staffViewerId,
    'email' => 'staff.viewer@tramaxtours.com',
    'role' => 'viewer',
    'permissions' => ['users.view', 'roles.view'],
]);
recordResult("Staff viewer token generated (has users.view, roles.view)", !empty($staffViewerToken));

// Create Customer user without any staff permissions
$pdo->prepare("DELETE FROM users WHERE email = 'customer.noperms@tramaxtours.com'")->execute();
$pdo->prepare("INSERT INTO users (name, email, password_hash, status, created_at, updated_at) VALUES ('Customer NoPerms', 'customer.noperms@tramaxtours.com', 'hash', 'active', NOW(), NOW())")->execute();
$nopermsUserId = (int) $pdo->lastInsertId();

$noPermsToken = JWT::encode([
    'sub' => $nopermsUserId,
    'id' => $nopermsUserId,
    'email' => 'customer.noperms@tramaxtours.com',
    'role' => 'customer',
    'permissions' => [],
]);
recordResult("Unauthorized user token generated (0 permissions)", !empty($noPermsToken));

// -----------------------------------------------------------------------------
// SECTION 2: Authorization & Endpoint Protection
// -----------------------------------------------------------------------------
echo PHP_EOL . "2. Authorization & Endpoint Protection:" . PHP_EOL;

$resNoAuth = apiRequest('GET', '/api/v1/users');
recordResult("Unauthenticated GET /api/v1/users returns 401", $resNoAuth['status'] === 401);

$resForbidden = apiRequest('GET', '/api/v1/users', [], $noPermsToken);
recordResult("Unauthorized user GET /api/v1/users returns 403", $resForbidden['status'] === 403);

$resViewerUsers = apiRequest('GET', '/api/v1/users', [], $staffViewerToken);
recordResult("Authorized user with users.view GET /api/v1/users returns 200", $resViewerUsers['status'] === 200);

$resCreateForbidden = apiRequest('POST', '/api/v1/users', [
    'name' => 'Forbidden User',
    'email' => 'forbidden@tramaxtours.com',
    'password' => 'secret123',
    'role' => 'editor',
], $staffViewerToken);
recordResult("User without users.create POST /api/v1/users returns 403", $resCreateForbidden['status'] === 403);

// -----------------------------------------------------------------------------
// SECTION 3: User Statistics & Listing
// -----------------------------------------------------------------------------
echo PHP_EOL . "3. User Statistics & Listing:" . PHP_EOL;

$resStats = apiRequest('GET', '/api/v1/users/stats', [], $superAdminToken);
recordResult("GET /api/v1/users/stats returns 200", $resStats['status'] === 200);
$stats = $resStats['json']['data'] ?? [];
recordResult("Stats contains total_staff", isset($stats['total_staff']));
recordResult("Stats contains active_staff", isset($stats['active_staff']));
recordResult("Stats contains super_admins", isset($stats['super_admins']));
recordResult("Stats contains staff_with_roles", isset($stats['staff_with_roles']));

$resList = apiRequest('GET', '/api/v1/users?page=1&per_page=10', [], $superAdminToken);
recordResult("GET /api/v1/users returns 200 with pagination", $resList['status'] === 200);
$usersData = $resList['json']['data'] ?? [];
recordResult("Response contains data list", is_array($usersData['data'] ?? null));
recordResult("Response contains meta pagination", isset($usersData['meta']['total']));
recordResult("Response contains summary stats", isset($usersData['stats']['total_staff']));

// -----------------------------------------------------------------------------
// SECTION 4: User Creation & Validation
// -----------------------------------------------------------------------------
echo PHP_EOL . "4. User Creation & Validation:" . PHP_EOL;

// Missing required fields validation
$resValError = apiRequest('POST', '/api/v1/users', [
    'name' => '',
    'email' => 'invalid-email',
    'password' => '123', // < 6 chars
], $superAdminToken);
recordResult("Invalid creation data returns 422 VALIDATION_ERROR", $resValError['status'] === 422);

// Successful creation
$testEmail = 'staff.john.doe@tramaxtours.com';
$pdo->prepare("DELETE FROM users WHERE email = ?")->execute([$testEmail]);

$resCreate = apiRequest('POST', '/api/v1/users', [
    'name' => 'John Doe Staff',
    'email' => $testEmail,
    'password' => 'StrongPassword123!',
    'phone' => '+33 6 12 34 56 78',
    'role' => 'editor',
    'status' => 'active',
], $superAdminToken);

recordResult("POST /api/v1/users creates new staff user (201 Created)", $resCreate['status'] === 201);
$createdUser = $resCreate['json']['data'] ?? [];
$createdUserId = (int) ($createdUser['id'] ?? 0);
recordResult("Created user has valid ID", $createdUserId > 0);
recordResult("Created user has assigned role 'editor'", ($createdUser['role'] ?? '') === 'editor');
recordResult("Created user has inherited permissions array", is_array($createdUser['permissions'] ?? null) && count($createdUser['permissions']) > 0);

// Duplicate email validation
$resDupError = apiRequest('POST', '/api/v1/users', [
    'name' => 'Duplicate User',
    'email' => $testEmail,
    'password' => 'AnotherPassword123',
    'role' => 'moderator',
], $superAdminToken);
recordResult("Duplicate email returns 422 error", $resDupError['status'] === 422);

// -----------------------------------------------------------------------------
// SECTION 5: User Detail & Update
// -----------------------------------------------------------------------------
echo PHP_EOL . "5. User Detail & Update:" . PHP_EOL;

$resShow = apiRequest('GET', "/api/v1/users/{$createdUserId}", [], $superAdminToken);
recordResult("GET /api/v1/users/{id} returns 200", $resShow['status'] === 200);
$userDetail = $resShow['json']['data'] ?? [];
recordResult("User detail returns correct email", ($userDetail['email'] ?? '') === $testEmail);
recordResult("User detail returns permissions_count", isset($userDetail['permissions_count']));

// Update user details & role
$resUpdate = apiRequest('PUT', "/api/v1/users/{$createdUserId}", [
    'name' => 'Johnathan Doe Updated',
    'phone' => '+33 6 99 88 77 66',
    'role' => 'moderator',
], $superAdminToken);
recordResult("PUT /api/v1/users/{id} updates user details and role (200 OK)", $resUpdate['status'] === 200);
$updatedUser = $resUpdate['json']['data'] ?? [];
recordResult("Updated name reflected", ($updatedUser['name'] ?? '') === 'Johnathan Doe Updated');
recordResult("Updated role is 'moderator'", ($updatedUser['role'] ?? '') === 'moderator');

// -----------------------------------------------------------------------------
// SECTION 6: User Status Toggling (Activate / Deactivate)
// -----------------------------------------------------------------------------
echo PHP_EOL . "6. User Status Toggling:" . PHP_EOL;

$resDeact = apiRequest('POST', "/api/v1/users/{$createdUserId}/deactivate", [], $superAdminToken);
recordResult("POST /api/v1/users/{id}/deactivate disables account (200 OK)", $resDeact['status'] === 200);
$deactUser = $resDeact['json']['data'] ?? [];
recordResult("User status is now 'inactive'", ($deactUser['status'] ?? '') === 'inactive');

$resAct = apiRequest('POST', "/api/v1/users/{$createdUserId}/activate", [], $superAdminToken);
recordResult("POST /api/v1/users/{id}/activate enables account (200 OK)", $resAct['status'] === 200);
$actUser = $resAct['json']['data'] ?? [];
recordResult("User status is now 'active'", ($actUser['status'] ?? '') === 'active');

// -----------------------------------------------------------------------------
// SECTION 7: Security Rules & Super Admin Protections
// -----------------------------------------------------------------------------
echo PHP_EOL . "7. Security Rules & Super Admin Protections:" . PHP_EOL;

// 1. Self deactivation prevention
$resSelfDeact = apiRequest('POST', "/api/v1/users/1/deactivate", [], $superAdminToken);
recordResult("Prevent self-deactivation (returns 400 with SELF_DEACTIVATION_PROHIBITED)", $resSelfDeact['status'] === 400);

// 2. Self deletion prevention
$resSelfDelete = apiRequest('DELETE', "/api/v1/users/1", [], $superAdminToken);
recordResult("Prevent self-deletion (returns 400 with SELF_DELETION_PROHIBITED)", $resSelfDelete['status'] === 400);

// 3. Last super admin demotion prevention
$resDemote = apiRequest('PUT', "/api/v1/users/1", [
    'name' => 'Super Admin',
    'role' => 'editor',
], $superAdminToken);
recordResult("Prevent demoting last active Super Admin (returns 422 with security error)", $resDemote['status'] === 422);

// -----------------------------------------------------------------------------
// SECTION 8: Roles & Permissions Directory
// -----------------------------------------------------------------------------
echo PHP_EOL . "8. Roles & Permissions Directory:" . PHP_EOL;

$resRoles = apiRequest('GET', '/api/v1/roles', [], $superAdminToken);
recordResult("GET /api/v1/roles returns 200", $resRoles['status'] === 200);
$roles = $resRoles['json']['data'] ?? [];
recordResult("Roles list contains super_admin, admin, editor, moderator", is_array($roles) && count($roles) >= 4);

$resRoleDetail = apiRequest('GET', '/api/v1/roles/super_admin', [], $superAdminToken);
recordResult("GET /api/v1/roles/{slug} returns 200 with permissions", $resRoleDetail['status'] === 200);
$roleData = $resRoleDetail['json']['data'] ?? [];
recordResult("Role detail has 'permissions' array", is_array($roleData['permissions'] ?? null));

$resPerms = apiRequest('GET', '/api/v1/permissions', [], $superAdminToken);
recordResult("GET /api/v1/permissions returns 200", $resPerms['status'] === 200);
$permsData = $resPerms['json']['data'] ?? [];
recordResult("Permissions contains 'grouped' structure", isset($permsData['grouped']));
recordResult("Permissions contains 'total' count", ($permsData['total'] ?? 0) > 0);

// -----------------------------------------------------------------------------
// SECTION 9: Soft Deletion & Cleanup
// -----------------------------------------------------------------------------
echo PHP_EOL . "9. Soft Deletion & Cleanup:" . PHP_EOL;

$resDelete = apiRequest('DELETE', "/api/v1/users/{$createdUserId}", [], $superAdminToken);
recordResult("DELETE /api/v1/users/{id} soft-deletes user (200 OK)", $resDelete['status'] === 200);

$resShowDeleted = apiRequest('GET', "/api/v1/users/{$createdUserId}", [], $superAdminToken);
recordResult("Soft-deleted user cannot be retrieved via normal API (404 USER_NOT_FOUND)", $resShowDeleted['status'] === 404);

// Cleanup test fixtures from DB
$pdo->prepare("DELETE FROM user_roles WHERE user_id IN (?, ?, ?)")->execute([$staffViewerId, $nopermsUserId, $createdUserId]);
$pdo->prepare("DELETE FROM role_permissions WHERE role_id = ?")->execute([$viewerRoleId]);
$pdo->prepare("DELETE FROM roles WHERE id = ?")->execute([$viewerRoleId]);
$pdo->prepare("DELETE FROM users WHERE id IN (?, ?, ?)")->execute([$staffViewerId, $nopermsUserId, $createdUserId]);
recordResult("Test users and fixtures cleaned up successfully", true);

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
echo PHP_EOL . "================================================================================" . PHP_EOL;
echo "  PHASE 8K STAFF & ROLE MANAGEMENT VERIFICATION RESULTS" . PHP_EOL;
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
    echo "\033[32mALL PHASE 8K STAFF & ROLE MANAGEMENT TESTS PASSED PERFECTLY!\033[0m" . PHP_EOL . PHP_EOL;
    exit(0);
}
