<?php

namespace App\Middleware;

use App\Models\User;
use App\Utils\JWT;
use App\Utils\Request;
use App\Utils\Response;
use Throwable;

class AuthMiddleware
{
    /**
     * Handle incoming request token authentication.
     *
     * @return void
     */
    public function handle(): void
    {
        $authHeader = Request::getHeader('Authorization');

        if (!$authHeader || !preg_match('/^Bearer\s+(.*?)$/i', trim($authHeader), $matches)) {
            Response::error(
                'Authentication required. Please provide a valid Bearer token.',
                401,
                null,
                'UNAUTHORIZED'
            );
        }

        $token = $matches[1];

        try {
            $payload = JWT::decode($token);
        } catch (Throwable $e) {
            $errorCode = ($e->getCode() === 401 && str_contains(strtolower($e->getMessage()), 'expired')) 
                ? 'TOKEN_EXPIRED' 
                : 'INVALID_TOKEN';

            Response::error(
                $e->getMessage(),
                401,
                null,
                $errorCode
            );
        }

        $userId = $payload['sub'] ?? $payload['user_id'] ?? null;
        if (!$userId) {
            Response::error('Invalid token payload: missing user identifier.', 401, null, 'INVALID_TOKEN');
        }

        // Fetch user from MySQL to verify active state & current roles/permissions
        $user = User::findById((int) $userId);
        if (!$user) {
            Response::error('The account associated with this token no longer exists.', 401, null, 'USER_NOT_FOUND');
        }

        if ($user['status'] !== 'active') {
            Response::error('Your account is inactive or has been suspended. Please contact support.', 403, null, 'ACCOUNT_INACTIVE');
        }

        // Load active roles & permissions from database
        $roles = User::getUserRoles((int) $user['id']);
        $permissions = User::getUserPermissions((int) $user['id']);

        $userContext = User::formatUserResponse($user, $roles, $permissions);

        // Attach authenticated user context to Request
        Request::setAuthenticatedUser($userContext);
    }

    /**
     * Get the currently authenticated user context.
     *
     * @return array|null
     */
    public static function user(): ?array
    {
        return Request::getAuthenticatedUser();
    }
}
