<?php

namespace App\Middleware;

use App\Services\AuditService;
use App\Utils\Request;
use App\Utils\Response;

class RoleMiddleware
{
    /**
     * Allowed roles for the route.
     */
    private array $allowedRoles;

    /**
     * @param string|array $roles
     */
    public function __construct(string|array $roles = [])
    {
        $this->allowedRoles = is_array($roles) ? $roles : [$roles];
    }

    /**
     * Handle role authorization check.
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

        // Check if user has at least one of the allowed roles
        $hasRole = false;
        foreach ($this->allowedRoles as $role) {
            if (in_array(strtolower($role), array_map('strtolower', $userRoles), true)) {
                $hasRole = true;
                break;
            }
        }

        if (!$hasRole) {
            AuditService::log(
                (int) $user['id'],
                'unauthorized_access',
                'auth',
                (int) $user['id'],
                null,
                [
                    'required_roles' => $this->allowedRoles,
                    'user_roles' => $userRoles,
                    'path' => Request::getPath(),
                ]
            );

            Response::error(
                'Forbidden. You do not possess the required role permissions to access this resource.',
                403,
                [
                    'required_roles' => $this->allowedRoles,
                ],
                'FORBIDDEN_ROLE'
            );
        }
    }
}
