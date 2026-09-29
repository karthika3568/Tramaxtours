<?php

namespace App\Controllers;

use App\Models\Role;
use App\Utils\Request;

class RoleController extends BaseController
{
    /**
     * List all system roles with their member counts and permissions.
     * GET /api/v1/roles
     * Permission: roles.view
     *
     * @return void
     */
    public function index(): void
    {
        $roles = Role::getAll();
        $this->success($roles, 'Roles retrieved successfully');
    }

    /**
     * Retrieve single role details by ID or slug.
     * GET /api/v1/roles/{id}
     * Permission: roles.view
     *
     * @param string|int $id
     * @return void
     */
    public function show(string|int $id): void
    {
        $role = is_numeric($id) ? Role::findById((int) $id) : Role::findBySlug((string) $id);

        if (!$role) {
            $this->error('Role not found', 404, null, 'ROLE_NOT_FOUND');
        }

        $this->success($role, 'Role details retrieved successfully');
    }

    /**
     * List all available system permissions grouped by group_name.
     * GET /api/v1/permissions
     * Permission: roles.view (or users.view)
     *
     * @return void
     */
    public function permissions(): void
    {
        $grouped = Role::getAllPermissionsGrouped();
        $flat = Role::getAllPermissions();

        $this->success([
            'grouped' => $grouped,
            'permissions' => $flat,
            'total' => count($flat),
        ], 'Permissions retrieved successfully');
    }
}
