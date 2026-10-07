<?php

namespace App\Middleware;

use App\Services\AuditService;
use App\Utils\Request;
use App\Utils\Response;

class PermissionMiddleware
{
    /**
     * Required permission(s) for the route.
     */
    private array $requiredPermissions;

    /**
     * @param string|array $permissions
     */
    public function __construct(string|array $permissions = [])
    {
        $this->requiredPermissions = is_array($permissions) ? $permissions : [$permissions];
    }

    /**
     * Handle permission authorization check.
     *
     * @return void
     */
    public function handle(): void
    {
        $user = Request::getAuthenticatedUser();

        // Ensure user is authenticated first
        if ($user === null) {
            (new AuthMiddleware())->handle();
            $user = Request::getAuthenticatedUser();
        }

        $userRoles = $user['roles'] ?? [];
        $userPermissions = $user['permissions'] ?? [];

        // Super Admin has unrestricted authority across all permissions
        if (in_array('super_admin', $userRoles, true)) {
            return;
        }

        // Check if user has all required permissions
        $missingPermissions = [];
        foreach ($this->requiredPermissions as $permission) {
            if (!in_array($permission, $userPermissions, true)) {
                // Check allowable permission aliases for backward/cross compatibility
                if ($permission === 'trip_requests.view' && (in_array('contact.view', $userPermissions, true) || in_array('bookings.view', $userPermissions, true))) {
                    continue;
                }
                if ($permission === 'trip_requests.manage' && (in_array('contact.manage', $userPermissions, true) || in_array('bookings.edit_status', $userPermissions, true))) {
                    continue;
                }
                $missingPermissions[] = $permission;
            }
        }

        if (!empty($missingPermissions)) {
            AuditService::log(
                (int) $user['id'],
                'unauthorized_access',
                'auth',
                (int) $user['id'],
                null,
                [
                    'required_permissions' => $this->requiredPermissions,
                    'missing_permissions' => $missingPermissions,
                    'path' => Request::getPath(),
                ]
            );

            Response::error(
                'Forbidden. You do not possess the required permissions to perform this action.',
                403,
                [
                    'missing_permissions' => $missingPermissions,
                ],
                'FORBIDDEN_PERMISSION'
            );
        }
    }
}
