<?php

namespace App\Controllers;

use App\Models\User;
use App\Services\AuditService;
use App\Utils\Env;
use App\Utils\JWT;
use App\Utils\Request;
use App\Utils\Response;

class AuthController extends BaseController
{
    /**
     * Authenticate user credentials and issue JWT bearer token.
     * POST /api/v1/auth/login
     *
     * @return void
     */
    public function login(): void
    {
        // Synchronize admin credentials from .env if defined
        User::syncAdminFromEnv();

        $body = Request::getBody();

        $email = trim($body['email'] ?? '');
        $password = (string) ($body['password'] ?? '');

        $errors = [];
        if ($email === '') {
            $errors['email'] = 'Email address is required.';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Please provide a valid email address.';
        }

        if ($password === '') {
            $errors['password'] = 'Password is required.';
        }

        if (!empty($errors)) {
            $this->error('Validation failed. Missing or invalid credentials.', 422, $errors, 'VALIDATION_ERROR');
        }

        // Fetch user by email
        $user = User::findByEmail($email);

        // Verify user existence and password hash (Timing-attack safe)
        if (!$user || !password_verify($password, $user['password_hash'])) {
            AuditService::log(
                null,
                'login_failed',
                'auth',
                null,
                null,
                ['attempted_email' => $email]
            );

            $this->error('Invalid email or password.', 401, null, 'INVALID_CREDENTIALS');
        }

        // Verify account status
        if ($user['status'] !== 'active') {
            AuditService::log(
                (int) $user['id'],
                'login_blocked',
                'auth',
                (int) $user['id'],
                null,
                ['status' => $user['status']]
            );

            $this->error(
                "Your account is currently {$user['status']}. Please contact support.",
                403,
                null,
                'ACCOUNT_NOT_ACTIVE'
            );
        }

        // Update last login timestamp
        User::updateLastLogin((int) $user['id']);

        // Load roles and permissions
        $roles = User::getUserRoles((int) $user['id']);
        $permissions = User::getUserPermissions((int) $user['id']);
        $formattedUser = User::formatUserResponse($user, $roles, $permissions);

        // Generate JWT Token
        $expiresIn = (int) Env::get('JWT_EXPIRATION', 86400);
        $tokenPayload = [
            'sub' => (int) $user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'role' => $formattedUser['role'],
        ];

        $token = JWT::encode($tokenPayload, null, $expiresIn);

        // Audit Log successful login
        AuditService::log(
            (int) $user['id'],
            'login',
            'user',
            (int) $user['id'],
            null,
            ['email' => $user['email'], 'role' => $formattedUser['role']]
        );

        $this->success([
            'token' => $token,
            'token_type' => 'Bearer',
            'expires_in' => $expiresIn,
            'user' => $formattedUser,
        ], 'Authentication successful');
    }

    /**
     * Retrieve currently authenticated user's profile and permissions.
     * GET /api/v1/auth/me
     *
     * @return void
     */
    public function me(): void
    {
        $user = Request::getAuthenticatedUser();

        $this->success([
            'user' => $user,
        ], 'Authenticated user profile retrieved successfully');
    }

    /**
     * Log out current user session.
     * POST /api/v1/auth/logout
     *
     * @return void
     */
    public function logout(): void
    {
        $user = Request::getAuthenticatedUser();
        $userId = $user['id'] ?? null;

        if ($userId) {
            AuditService::log(
                (int) $userId,
                'logout',
                'user',
                (int) $userId,
                null,
                ['email' => $user['email'] ?? null]
            );
        }

        $this->success(null, 'Successfully logged out');
    }

    /**
     * Protected test endpoint for token authentication verification.
     * GET /api/v1/auth/test
     *
     * @return void
     */
    public function testAuth(): void
    {
        $user = Request::getAuthenticatedUser();

        $this->success([
            'authenticated' => true,
            'user_id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
        ], 'Authenticated route test passed successfully');
    }

    /**
     * Protected test endpoint for role-based authorization verification.
     * GET /api/v1/auth/test/admin
     *
     * @return void
     */
    public function testAdmin(): void
    {
        $user = Request::getAuthenticatedUser();

        $this->success([
            'authorized' => true,
            'user_id' => $user['id'],
            'name' => $user['name'],
            'roles' => $user['roles'],
            'role_details' => $user['role_details'],
        ], 'Admin role authorization test passed successfully');
    }

    /**
     * Protected test endpoint for permission-based authorization verification.
     * GET /api/v1/auth/test/permission
     *
     * @return void
     */
    public function testPermission(): void
    {
        $user = Request::getAuthenticatedUser();

        $this->success([
            'authorized' => true,
            'user_id' => $user['id'],
            'name' => $user['name'],
            'permission_tested' => 'users.view',
            'has_permission' => in_array('users.view', $user['permissions'], true) || in_array('super_admin', $user['roles'], true),
        ], 'Permission-based authorization test passed successfully');
    }
}
