<?php

namespace App\Controllers;

use App\Models\SocialLink;
use App\Services\AuditService;
use App\Utils\Request;

class SocialLinkController extends BaseController
{
    /**
     * List all active social links with optional search, status filtering, platform filtering, and pagination.
     * GET /api/v1/social-links
     * Permission: social.manage
     *
     * @return void
     */
    public function index(): void
    {
        $queryParams = Request::getQueryParams();

        $page = max(1, (int) ($queryParams['page'] ?? 1));
        $limit = max(1, min(200, (int) ($queryParams['limit'] ?? 100)));

        $filters = [
            'search' => trim((string) ($queryParams['search'] ?? '')),
            'status' => trim((string) ($queryParams['status'] ?? '')),
            'platform' => trim((string) ($queryParams['platform'] ?? '')),
            'sort_by' => trim((string) ($queryParams['sort_by'] ?? ($queryParams['sort'] ?? 'display_order'))),
            'sort_order' => trim((string) ($queryParams['sort_order'] ?? ($queryParams['order'] ?? 'ASC'))),
            'page' => $page,
            'limit' => $limit,
        ];

        $links = SocialLink::list($filters);
        $total = SocialLink::count($filters);
        $totalPages = (int) ceil($total / $limit);

        $this->success(
            $links,
            'Social links retrieved successfully',
            200,
            [
                'pagination' => [
                    'total' => $total,
                    'page' => $page,
                    'limit' => $limit,
                    'total_pages' => $totalPages,
                ]
            ]
        );
    }

    /**
     * Retrieve complete details for a single social link by ID.
     * GET /api/v1/social-links/{id}
     * Permission: social.manage
     *
     * @param string $id
     * @return void
     */
    public function show(string $id): void
    {
        $linkId = (int) $id;
        if ($linkId <= 0) {
            $this->error('Invalid social link ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $link = SocialLink::findById($linkId);
        if (!$link) {
            $this->error('Social link not found or has been deactivated.', 404, null, 'SOCIAL_LINK_NOT_FOUND');
        }

        $this->success($link, 'Social link details retrieved successfully');
    }

    /**
     * Create a new social link.
     * POST /api/v1/social-links
     * Permission: social.manage
     *
     * @return void
     */
    public function store(): void
    {
        $data = Request::getBody();
        $errors = [];

        // 1. Platform Validation
        $platform = trim((string) ($data['platform'] ?? ''));
        if (empty($platform)) {
            $errors['platform'] = 'Platform is required.';
        } elseif (mb_strlen($platform) > 50) {
            $errors['platform'] = 'Platform cannot exceed 50 characters.';
        }

        // 2. URL Validation
        $url = trim((string) ($data['url'] ?? ''));
        if (empty($url)) {
            $errors['url'] = 'Link URL is required.';
        } elseif (mb_strlen($url) > 255) {
            $errors['url'] = 'Link URL cannot exceed 255 characters.';
        } elseif (!filter_var($url, FILTER_VALIDATE_URL)) {
            $errors['url'] = 'Link URL must be a valid URL.';
        }

        // 3. Icon Validation
        $icon = isset($data['icon']) ? trim((string) $data['icon']) : null;
        if ($icon !== null && mb_strlen($icon) > 50) {
            $errors['icon'] = 'Icon name cannot exceed 50 characters.';
        }

        // 4. Display Order
        if (isset($data['display_order'])) {
            if (!is_numeric($data['display_order']) || (int) $data['display_order'] < 0) {
                $errors['display_order'] = 'Display order must be a non-negative integer.';
            }
            $displayOrder = (int) $data['display_order'];
        } else {
            $displayOrder = 0;
        }

        // 5. Status
        $status = trim((string) ($data['status'] ?? 'active'));
        if (!in_array($status, SocialLink::ALLOWED_STATUSES, true)) {
            $errors['status'] = 'Invalid status. Allowed values: ' . implode(', ', SocialLink::ALLOWED_STATUSES) . '.';
        }

        if (!empty($errors)) {
            $this->error('Social link validation failed.', 422, $errors, 'VALIDATION_ERROR');
        }

        try {
            $linkData = [
                'platform' => $platform,
                'url' => $url,
                'icon' => $icon,
                'display_order' => $displayOrder,
                'status' => $status,
            ];

            $linkId = SocialLink::create($linkData);
            $newLink = SocialLink::findById($linkId);

            $userId = Request::getUserId();

            // Record audit log
            AuditService::log(
                $userId,
                'social_link_create',
                'social_link',
                $linkId,
                null,
                [
                    'platform' => $platform,
                    'url' => $url,
                    'icon' => $icon,
                    'status' => $status,
                    'display_order' => $displayOrder,
                ]
            );

            $this->success($newLink, 'Social link created successfully', 201);
        } catch (\Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'SOCIAL_LINK_CREATE_FAILED');
        }
    }

    /**
     * Update an existing social link.
     * PUT /api/v1/social-links/{id} or PATCH /api/v1/social-links/{id}
     * Permission: social.manage
     *
     * @param string $id
     * @return void
     */
    public function update(string $id): void
    {
        $linkId = (int) $id;
        if ($linkId <= 0) {
            $this->error('Invalid social link ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $existing = SocialLink::findById($linkId);
        if (!$existing) {
            $this->error('Social link not found.', 404, null, 'SOCIAL_LINK_NOT_FOUND');
        }

        $data = Request::getBody();
        $errors = [];
        $updatePayload = [];

        // Platform
        if (array_key_exists('platform', $data)) {
            $platform = trim((string) $data['platform']);
            if (empty($platform)) {
                $errors['platform'] = 'Platform cannot be empty.';
            } elseif (mb_strlen($platform) > 50) {
                $errors['platform'] = 'Platform cannot exceed 50 characters.';
            } else {
                $updatePayload['platform'] = $platform;
            }
        }

        // URL
        if (array_key_exists('url', $data)) {
            $url = trim((string) $data['url']);
            if (empty($url)) {
                $errors['url'] = 'Link URL cannot be empty.';
            } elseif (mb_strlen($url) > 255) {
                $errors['url'] = 'Link URL cannot exceed 255 characters.';
            } elseif (!filter_var($url, FILTER_VALIDATE_URL)) {
                $errors['url'] = 'Link URL must be a valid URL.';
            } else {
                $updatePayload['url'] = $url;
            }
        }

        // Icon
        if (array_key_exists('icon', $data)) {
            $icon = $data['icon'] !== null ? trim((string) $data['icon']) : null;
            if ($icon !== null && mb_strlen($icon) > 50) {
                $errors['icon'] = 'Icon name cannot exceed 50 characters.';
            } else {
                $updatePayload['icon'] = $icon;
            }
        }

        // Display Order
        if (array_key_exists('display_order', $data)) {
            if (!is_numeric($data['display_order']) || (int) $data['display_order'] < 0) {
                $errors['display_order'] = 'Display order must be a non-negative integer.';
            } else {
                $updatePayload['display_order'] = (int) $data['display_order'];
            }
        }

        // Status
        if (array_key_exists('status', $data)) {
            $status = trim((string) $data['status']);
            if (!in_array($status, SocialLink::ALLOWED_STATUSES, true)) {
                $errors['status'] = 'Invalid status. Allowed values: ' . implode(', ', SocialLink::ALLOWED_STATUSES) . '.';
            } else {
                $updatePayload['status'] = $status;
            }
        }

        if (!empty($errors)) {
            $this->error('Social link update validation failed.', 422, $errors, 'VALIDATION_ERROR');
        }

        if (empty($updatePayload)) {
            $this->success($existing, 'No changes submitted for social link update.');
        }

        try {
            SocialLink::update($linkId, $updatePayload);
            $updated = SocialLink::findById($linkId);

            $userId = Request::getUserId();

            // Record audit log
            AuditService::log(
                $userId,
                'social_link_update',
                'social_link',
                $linkId,
                [
                    'platform' => $existing['platform'],
                    'url' => $existing['url'],
                    'icon' => $existing['icon'],
                    'status' => $existing['status'],
                    'display_order' => $existing['display_order'],
                ],
                $updatePayload
            );

            $this->success($updated, 'Social link updated successfully');
        } catch (\Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'SOCIAL_LINK_UPDATE_FAILED');
        }
    }

    /**
     * Reversible soft-delete for a social link.
     * DELETE /api/v1/social-links/{id}
     * Permission: social.manage
     *
     * @param string $id
     * @return void
     */
    public function destroy(string $id): void
    {
        $linkId = (int) $id;
        if ($linkId <= 0) {
            $this->error('Invalid social link ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $link = SocialLink::findById($linkId);
        if (!$link) {
            $this->error('Social link not found.', 404, null, 'SOCIAL_LINK_NOT_FOUND');
        }

        $queryParams = Request::getQueryParams();
        $isForce = isset($queryParams['force']) && in_array(strtolower((string) $queryParams['force']), ['true', '1'], true);

        $userId = Request::getUserId();

        SocialLink::softDelete($linkId, $userId, $isForce);

        // Record audit log
        AuditService::log(
            $userId,
            $isForce ? 'social_link_delete' : 'social_link_soft_delete',
            'social_link',
            $linkId,
            [
                'platform' => $link['platform'],
                'url' => $link['url'],
                'icon' => $link['icon'],
                'status' => $link['status'],
                'is_force' => $isForce,
            ],
            $isForce ? null : ['deleted_at' => date('Y-m-d H:i:s'), 'deleted_by' => $userId]
        );

        $this->success([
            'id' => $linkId,
            'is_deleted' => true,
            'deleted_at' => date('Y-m-d H:i:s'),
            'deleted_by' => $userId,
        ], $isForce ? 'Social link permanently deleted' : 'Social link soft-deleted successfully');
    }

    /**
     * Restore a soft-deleted social link.
     * POST /api/v1/social-links/{id}/restore or PATCH /api/v1/social-links/{id}/restore
     * Permission: social.manage
     *
     * @param string $id
     * @return void
     */
    public function restore(string $id): void
    {
        $linkId = (int) $id;
        if ($linkId <= 0) {
            $this->error('Invalid social link ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $link = SocialLink::findById($linkId, true);
        if (!$link) {
            $this->error('Social link not found.', 404, null, 'SOCIAL_LINK_NOT_FOUND');
        }

        if (empty($link['deleted_at'])) {
            $this->success($link, 'Social link is already active');
        }

        try {
            SocialLink::restore($linkId);
            $restored = SocialLink::findById($linkId);
            if (!$restored) {
                $restored = SocialLink::findById($linkId, true) ?? [];
            }

            $userId = Request::getUserId();

            // Record audit log
            AuditService::log(
                $userId,
                'social_link_restore',
                'social_link',
                $linkId,
                [
                    'deleted_at' => $link['deleted_at'],
                    'deleted_by' => $link['deleted_by'] ?? null,
                ],
                [
                    'platform' => $restored['platform'] ?? '',
                    'url' => $restored['url'] ?? '',
                    'status' => $restored['status'] ?? '',
                    'deleted_at' => null,
                    'deleted_by' => null,
                ]
            );

            $this->success($restored, 'Social link restored successfully');
        } catch (\Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'SOCIAL_LINK_RESTORE_FAILED');
        }
    }

    /**
     * Activate a social link.
     * POST /api/v1/social-links/{id}/activate or PATCH /api/v1/social-links/{id}/activate
     * Permission: social.manage
     *
     * @param string $id
     * @return void
     */
    public function activate(string $id): void
    {
        $linkId = (int) $id;
        if ($linkId <= 0) {
            $this->error('Invalid social link ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $link = SocialLink::findById($linkId);
        if (!$link) {
            $this->error('Social link not found or is currently soft-deleted.', 404, null, 'SOCIAL_LINK_NOT_FOUND');
        }

        if ($link['status'] === 'active') {
            $this->success($link, 'Social link is already active');
        }

        SocialLink::activate($linkId);
        $updated = SocialLink::findById($linkId);

        $userId = Request::getUserId();

        // Record audit log
        AuditService::log(
            $userId,
            'social_link_activate',
            'social_link',
            $linkId,
            ['status' => 'inactive'],
            ['status' => 'active']
        );

        $this->success($updated, 'Social link activated successfully');
    }

    /**
     * Deactivate a social link.
     * POST /api/v1/social-links/{id}/deactivate or PATCH /api/v1/social-links/{id}/deactivate
     * Permission: social.manage
     *
     * @param string $id
     * @return void
     */
    public function deactivate(string $id): void
    {
        $linkId = (int) $id;
        if ($linkId <= 0) {
            $this->error('Invalid social link ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $link = SocialLink::findById($linkId);
        if (!$link) {
            $this->error('Social link not found or is currently soft-deleted.', 404, null, 'SOCIAL_LINK_NOT_FOUND');
        }

        if ($link['status'] === 'inactive') {
            $this->success($link, 'Social link is already inactive');
        }

        SocialLink::deactivate($linkId);
        $updated = SocialLink::findById($linkId);

        $userId = Request::getUserId();

        // Record audit log
        AuditService::log(
            $userId,
            'social_link_deactivate',
            'social_link',
            $linkId,
            ['status' => 'active'],
            ['status' => 'inactive']
        );

        $this->success($updated, 'Social link deactivated successfully');
    }
}
