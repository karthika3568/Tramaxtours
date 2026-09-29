<?php

namespace App\Controllers;

use App\Models\Role;
use App\Models\User;
use App\Services\AuditService;
use App\Utils\Request;

class UserController extends BaseController
{
    /**
     * List all staff members / users with filtering, search, and pagination.
     * GET /api/v1/users
     * Permission: users.view
     *
     * @return void
     */
    public function index(): void
    {
        $queryParams = Request::getQueryParams();

        $filters = [
            'search' => $queryParams['search'] ?? null,
            'status' => $queryParams['status'] ?? null,
            'role' => $queryParams['role'] ?? null,
        ];

        $page = isset($queryParams['page']) ? (int) $queryParams['page'] : 1;
        $perPage = isset($queryParams['per_page']) ? (int) $queryParams['per_page'] : 15;
        $sortBy = $queryParams['sort_by'] ?? 'created_at';
        $sortOrder = $queryParams['sort_order'] ?? 'DESC';

        $result = User::paginate($filters, $page, $perPage, $sortBy, $sortOrder);

        $this->success($result, 'Users retrieved successfully');
    }

    /**
     * Retrieve aggregate staff statistics.
     * GET /api/v1/users/stats
     * Permission: users.view
     *
     * @return void
     */
    public function stats(): void
    {
        $stats = User::getStats();
        $this->success($stats, 'User statistics retrieved successfully');
    }

    /**
     * Retrieve single user details with roles and permissions.
     * GET /api/v1/users/{id}
     * Permission: users.view
     *
     * @param int|string $id
     * @return void
     */
    public function show(int|string $id): void
    {
        $userId = (int) $id;
        $user = User::findWithRoles($userId);

        if (!$user) {
            $this->error('User not found', 404, null, 'USER_NOT_FOUND');
        }

        $this->success($user, 'User details retrieved successfully');
    }

    /**
     * Create a new staff / user account.
     * POST /api/v1/users
     * Permission: users.create
     *
     * @return void
     */
    public function store(): void
    {
        $body = Request::getBody();
        $currentUser = Request::getAuthenticatedUser();

        $errors = [];

        // 1. Validation: Name
        $name = trim((string) ($body['name'] ?? ''));
        if ($name === '') {
            $errors['name'] = 'Full name is required.';
        } elseif (mb_strlen($name) > 150) {
            $errors['name'] = 'Full name cannot exceed 150 characters.';
        }

        // 2. Validation: Email
        $email = trim(strtolower((string) ($body['email'] ?? '')));
        if ($email === '') {
            $errors['email'] = 'Email address is required.';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Please provide a valid email address.';
        } else {
            $existing = User::findByEmail($email);
            if ($existing) {
                $errors['email'] = 'This email address is already registered.';
            }
        }

        // 3. Validation: Password
        $password = (string) ($body['password'] ?? '');
        if ($password === '') {
            $errors['password'] = 'Password is required for new accounts.';
        } elseif (mb_strlen($password) < 6) {
            $errors['password'] = 'Password must be at least 6 characters long.';
        }

        // 4. Validation: Role
        $roleId = isset($body['role_id']) ? (int) $body['role_id'] : 0;
        $roleSlug = trim((string) ($body['role'] ?? ''));

        if ($roleId > 0) {
            $roleObj = Role::findById($roleId);
            if (!$roleObj) {
                $errors['role_id'] = 'The selected role is invalid.';
            }
        } elseif ($roleSlug !== '') {
            $roleObj = Role::findBySlug($roleSlug);
            if (!$roleObj) {
                $errors['role'] = 'The selected role is invalid.';
            } else {
                $roleId = $roleObj['id'];
            }
        } else {
            $errors['role'] = 'Please assign a role to the user.';
        }

        // 5. Validation: Status
        $status = trim((string) ($body['status'] ?? 'active'));
        if (!in_array($status, ['active', 'inactive', 'suspended'], true)) {
            $status = 'active';
        }

        if (!empty($errors)) {
            $this->error('Validation failed. Please review the highlighted fields.', 422, $errors, 'VALIDATION_ERROR');
        }

        $createdUser = User::create([
            'name' => $name,
            'email' => $email,
            'password' => $password,
            'phone' => !empty($body['phone']) ? trim((string) $body['phone']) : null,
            'status' => $status,
            'role_id' => $roleId,
        ]);

        AuditService::log(
            $currentUser ? (int) $currentUser['id'] : null,
            'user_created',
            'users',
            $createdUser['id'],
            null,
            ['email' => $email, 'role' => $createdUser['role']]
        );

        $this->success($createdUser, 'Staff member created successfully', 201);
    }

    /**
     * Update an existing staff / user account.
     * PUT/PATCH /api/v1/users/{id}
     * Permission: users.edit
     *
     * @param int|string $id
     * @return void
     */
    public function update(int|string $id): void
    {
        $userId = (int) $id;
        $existing = User::findWithRoles($userId);

        if (!$existing) {
            $this->error('User not found', 404, null, 'USER_NOT_FOUND');
        }

        $body = Request::getBody();
        $currentUser = Request::getAuthenticatedUser();
        $currentUserId = $currentUser ? (int) $currentUser['id'] : 0;

        $errors = [];

        // 1. Validation: Name
        $name = isset($body['name']) ? trim((string) $body['name']) : $existing['name'];
        if ($name === '') {
            $errors['name'] = 'Full name cannot be empty.';
        } elseif (mb_strlen($name) > 150) {
            $errors['name'] = 'Full name cannot exceed 150 characters.';
        }

        // 2. Validation: Email
        $email = isset($body['email']) ? trim(strtolower((string) $body['email'])) : $existing['email'];
        if ($email === '') {
            $errors['email'] = 'Email address cannot be empty.';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Please provide a valid email address.';
        } elseif ($email !== $existing['email']) {
            $otherUser = User::findByEmail($email);
            if ($otherUser && (int) $otherUser['id'] !== $userId) {
                $errors['email'] = 'This email address is already in use by another account.';
            }
        }

        // 3. Validation: Optional Password Change
        $password = isset($body['password']) ? (string) $body['password'] : '';
        if ($password !== '' && mb_strlen($password) < 6) {
            $errors['password'] = 'New password must be at least 6 characters long.';
        }

        // 4. Validation: Status & Self / Super Admin Protection
        $status = isset($body['status']) ? trim((string) $body['status']) : $existing['status'];
        if (!in_array($status, ['active', 'inactive', 'suspended'], true)) {
            $status = $existing['status'];
        }

        if ($status !== 'active') {
            // Cannot deactivate yourself
            if ($currentUserId === $userId) {
                $errors['status'] = 'Security policy: You cannot deactivate or suspend your own account.';
            }
            // Cannot deactivate the last remaining active super admin
            elseif (User::isLastSuperAdmin($userId)) {
                $errors['status'] = 'Security policy: Cannot deactivate or suspend the last active Super Admin account.';
            }
        }

        // 5. Validation: Role & Last Super Admin Protection
        $roleId = isset($body['role_id']) ? (int) $body['role_id'] : 0;
        $roleSlug = isset($body['role']) ? trim((string) $body['role']) : '';

        $targetRoleId = null;
        if ($roleId > 0) {
            $roleObj = Role::findById($roleId);
            if (!$roleObj) {
                $errors['role_id'] = 'The selected role is invalid.';
            } else {
                $targetRoleId = $roleObj['id'];
                $roleSlug = $roleObj['slug'];
            }
        } elseif ($roleSlug !== '') {
            $roleObj = Role::findBySlug($roleSlug);
            if (!$roleObj) {
                $errors['role'] = 'The selected role is invalid.';
            } else {
                $targetRoleId = $roleObj['id'];
            }
        }

        // Check if role is changing from super_admin
        if ($targetRoleId !== null && $roleSlug !== 'super_admin' && in_array('super_admin', $existing['roles'], true)) {
            if (User::isLastSuperAdmin($userId)) {
                $errors['role'] = 'Security policy: Cannot demote the last remaining Super Admin. Promote another Super Admin first.';
            }
        }

        if (!empty($errors)) {
            $this->error('Validation failed. Please review the highlighted fields.', 422, $errors, 'VALIDATION_ERROR');
        }

        $updatePayload = [
            'name' => $name,
            'email' => $email,
            'status' => $status,
            'phone' => array_key_exists('phone', $body) ? (!empty($body['phone']) ? trim((string) $body['phone']) : null) : $existing['phone'],
        ];

        if ($password !== '') {
            $updatePayload['password'] = $password;
        }

        if ($targetRoleId !== null) {
            $updatePayload['role_id'] = $targetRoleId;
        }

        $updatedUser = User::updateUser($userId, $updatePayload);

        AuditService::log(
            $currentUser ? (int) $currentUser['id'] : null,
            'user_updated',
            'users',
            $userId,
            $existing,
            $updatedUser
        );

        $this->success($updatedUser, 'Staff member updated successfully');
    }

    /**
     * Activate a user account.
     * POST/PATCH /api/v1/users/{id}/activate
     * Permission: users.edit
     *
     * @param int|string $id
     * @return void
     */
    public function activate(int|string $id): void
    {
        $userId = (int) $id;
        $existing = User::findWithRoles($userId);

        if (!$existing) {
            $this->error('User not found', 404, null, 'USER_NOT_FOUND');
        }

        User::setStatus($userId, 'active');
        $updatedUser = User::findWithRoles($userId);

        $currentUser = Request::getAuthenticatedUser();
        AuditService::log(
            $currentUser ? (int) $currentUser['id'] : null,
            'user_activated',
            'users',
            $userId,
            ['status' => $existing['status']],
            ['status' => 'active']
        );

        $this->success($updatedUser, 'User account activated successfully');
    }

    /**
     * Deactivate a user account.
     * POST/PATCH /api/v1/users/{id}/deactivate
     * Permission: users.edit
     *
     * @param int|string $id
     * @return void
     */
    public function deactivate(int|string $id): void
    {
        $userId = (int) $id;
        $existing = User::findWithRoles($userId);

        if (!$existing) {
            $this->error('User not found', 404, null, 'USER_NOT_FOUND');
        }

        $currentUser = Request::getAuthenticatedUser();
        $currentUserId = $currentUser ? (int) $currentUser['id'] : 0;

        // Security check: cannot deactivate self
        if ($currentUserId === $userId) {
            $this->error('Security policy: You cannot deactivate your own account.', 400, null, 'SELF_DEACTIVATION_PROHIBITED');
        }

        // Security check: cannot deactivate last super admin
        if (User::isLastSuperAdmin($userId)) {
            $this->error('Security policy: Cannot deactivate the last remaining Super Admin account.', 400, null, 'LAST_SUPERADMIN_PROTECTED');
        }

        User::setStatus($userId, 'inactive');
        $updatedUser = User::findWithRoles($userId);

        AuditService::log(
            $currentUser ? (int) $currentUser['id'] : null,
            'user_deactivated',
            'users',
            $userId,
            ['status' => $existing['status']],
            ['status' => 'inactive']
        );

        $this->success($updatedUser, 'User account disabled successfully');
    }

    /**
     * Soft-delete a user account.
     * DELETE /api/v1/users/{id}
     * Permission: users.delete
     *
     * @param int|string $id
     * @return void
     */
    public function destroy(int|string $id): void
    {
        $userId = (int) $id;
        $existing = User::findWithRoles($userId);

        if (!$existing) {
            $this->error('User not found', 404, null, 'USER_NOT_FOUND');
        }

        $currentUser = Request::getAuthenticatedUser();
        $currentUserId = $currentUser ? (int) $currentUser['id'] : 0;

        // Security check: cannot delete self
        if ($currentUserId === $userId) {
            $this->error('Security policy: You cannot delete your own account.', 400, null, 'SELF_DELETION_PROHIBITED');
        }

        // Security check: cannot delete last super admin
        if (User::isLastSuperAdmin($userId)) {
            $this->error('Security policy: Cannot delete the last remaining Super Admin account.', 400, null, 'LAST_SUPERADMIN_PROTECTED');
        }

        User::softDelete($userId);

        AuditService::log(
            $currentUser ? (int) $currentUser['id'] : null,
            'user_deleted',
            'users',
            $userId,
            $existing,
            ['deleted_at' => date('Y-m-d H:i:s')]
        );

        $this->success(null, 'User account deleted successfully');
    }
}
