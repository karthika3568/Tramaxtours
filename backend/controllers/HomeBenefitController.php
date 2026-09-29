<?php

namespace App\Controllers;

use App\Models\HomeBenefit;
use App\Models\Media;
use App\Services\AuditService;
use App\Utils\Request;

class HomeBenefitController extends BaseController
{
    /**
     * List all active homepage benefits with optional search, status filtering, and pagination.
     * GET /api/v1/home-benefits
     *
     * @return void
     */
    public function index(): void
    {
        $queryParams = Request::getQueryParams();

        $page = max(1, (int) ($queryParams['page'] ?? 1));
        $limit = max(1, min(100, (int) ($queryParams['limit'] ?? 20)));

        $filters = [
            'search' => trim((string) ($queryParams['search'] ?? '')),
            'status' => trim((string) ($queryParams['status'] ?? '')),
            'sort_by' => trim((string) ($queryParams['sort_by'] ?? 'display_order')),
            'sort_order' => trim((string) ($queryParams['sort_order'] ?? 'ASC')),
            'page' => $page,
            'limit' => $limit,
        ];

        $benefits = HomeBenefit::list($filters);
        $total = HomeBenefit::count($filters);
        $totalPages = (int) ceil($total / $limit);

        $this->success(
            $benefits,
            'Home benefits retrieved successfully',
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
     * Retrieve complete details for a single benefit by ID.
     * GET /api/v1/home-benefits/{id}
     *
     * @param string $id
     * @return void
     */
    public function show(string $id): void
    {
        $benefitId = (int) $id;
        if ($benefitId <= 0) {
            $this->error('Invalid benefit ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $benefit = HomeBenefit::findById($benefitId);
        if (!$benefit) {
            $this->error('Home benefit not found or has been deactivated.', 404, null, 'BENEFIT_NOT_FOUND');
        }

        $this->success($benefit, 'Home benefit details retrieved successfully');
    }

    /**
     * Create a new homepage benefit.
     * POST /api/v1/home-benefits
     *
     * @return void
     */
    public function store(): void
    {
        $data = Request::getBody();
        $errors = [];

        // 1. Title Validation
        $title = trim((string) ($data['title'] ?? ''));
        if (empty($title)) {
            $errors['title'] = 'Benefit title is required.';
        } elseif (mb_strlen($title) > 255) {
            $errors['title'] = 'Benefit title cannot exceed 255 characters.';
        }

        // 2. Description
        $description = isset($data['description']) ? trim((string) $data['description']) : '';

        // 3. Icon Validation
        $icon = isset($data['icon']) && $data['icon'] !== '' ? trim((string) $data['icon']) : null;
        if ($icon !== null && mb_strlen($icon) > 100) {
            $errors['icon'] = 'Icon name cannot exceed 100 characters.';
        }

        // 4. Media Validation
        $mediaId = !empty($data['media_id']) ? (int) $data['media_id'] : null;
        if ($mediaId !== null) {
            $media = Media::findById($mediaId);
            if (!$media) {
                $errors['media_id'] = "Referenced media ID [{$mediaId}] for [media_id] does not exist.";
            }
        }

        // 5. Display Order
        $displayOrder = isset($data['display_order']) ? (int) $data['display_order'] : 0;
        if ($displayOrder < 0) {
            $errors['display_order'] = 'Display order must be a non-negative integer.';
        }

        // 6. Status
        $status = trim((string) ($data['status'] ?? 'active'));
        if (!in_array($status, HomeBenefit::ALLOWED_STATUSES, true)) {
            $errors['status'] = 'Invalid status. Allowed values: ' . implode(', ', HomeBenefit::ALLOWED_STATUSES) . '.';
        }

        if (!empty($errors)) {
            $this->error('Home benefit validation failed.', 422, $errors, 'VALIDATION_ERROR');
        }

        try {
            $benefitData = [
                'title' => $title,
                'description' => $description,
                'icon' => $icon,
                'media_id' => $mediaId,
                'display_order' => $displayOrder,
                'status' => $status,
            ];

            $benefitId = HomeBenefit::create($benefitData);
            $newBenefit = HomeBenefit::findById($benefitId);

            $userId = Request::getUserId();

            // Record audit log
            AuditService::log(
                $userId,
                'home_benefit_create',
                'home_benefit',
                $benefitId,
                null,
                [
                    'title' => $title,
                    'status' => $status,
                    'display_order' => $displayOrder,
                    'media_id' => $mediaId,
                    'icon' => $icon,
                ]
            );

            $this->success($newBenefit, 'Home benefit created successfully', 201);
        } catch (\Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'BENEFIT_CREATE_FAILED');
        }
    }

    /**
     * Update an existing homepage benefit.
     * PUT /api/v1/home-benefits/{id} or PATCH /api/v1/home-benefits/{id}
     *
     * @param string $id
     * @return void
     */
    public function update(string $id): void
    {
        $benefitId = (int) $id;
        if ($benefitId <= 0) {
            $this->error('Invalid benefit ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $existing = HomeBenefit::findById($benefitId);
        if (!$existing) {
            $this->error('Home benefit not found.', 404, null, 'BENEFIT_NOT_FOUND');
        }

        $data = Request::getBody();
        $errors = [];
        $updatePayload = [];

        // Title
        if (array_key_exists('title', $data)) {
            $title = trim((string) $data['title']);
            if (empty($title)) {
                $errors['title'] = 'Benefit title cannot be empty.';
            } elseif (mb_strlen($title) > 255) {
                $errors['title'] = 'Benefit title cannot exceed 255 characters.';
            } else {
                $updatePayload['title'] = $title;
            }
        }

        // Description
        if (array_key_exists('description', $data)) {
            $updatePayload['description'] = (string) $data['description'];
        }

        // Icon
        if (array_key_exists('icon', $data)) {
            $icon = $data['icon'] !== null ? trim((string) $data['icon']) : null;
            if ($icon !== null && mb_strlen($icon) > 100) {
                $errors['icon'] = 'Icon name cannot exceed 100 characters.';
            } else {
                $updatePayload['icon'] = $icon;
            }
        }

        // Media ID
        if (array_key_exists('media_id', $data)) {
            $mediaId = !empty($data['media_id']) ? (int) $data['media_id'] : null;
            if ($mediaId !== null) {
                $media = Media::findById($mediaId);
                if (!$media) {
                    $errors['media_id'] = "Referenced media ID [{$mediaId}] for [media_id] does not exist.";
                } else {
                    $updatePayload['media_id'] = $mediaId;
                }
            } else {
                $updatePayload['media_id'] = null;
            }
        }

        // Display Order
        if (array_key_exists('display_order', $data)) {
            $displayOrder = (int) $data['display_order'];
            if ($displayOrder < 0) {
                $errors['display_order'] = 'Display order must be a non-negative integer.';
            } else {
                $updatePayload['display_order'] = $displayOrder;
            }
        }

        // Status
        if (array_key_exists('status', $data)) {
            $status = trim((string) $data['status']);
            if (!in_array($status, HomeBenefit::ALLOWED_STATUSES, true)) {
                $errors['status'] = 'Invalid status. Allowed values: ' . implode(', ', HomeBenefit::ALLOWED_STATUSES) . '.';
            } else {
                $updatePayload['status'] = $status;
            }
        }

        if (!empty($errors)) {
            $this->error('Home benefit update validation failed.', 422, $errors, 'VALIDATION_ERROR');
        }

        if (empty($updatePayload)) {
            $this->success($existing, 'No changes submitted for home benefit update.');
        }

        try {
            HomeBenefit::update($benefitId, $updatePayload);
            $updated = HomeBenefit::findById($benefitId);

            $userId = Request::getUserId();

            // Record audit log
            AuditService::log(
                $userId,
                'home_benefit_update',
                'home_benefit',
                $benefitId,
                [
                    'title' => $existing['title'],
                    'status' => $existing['status'],
                    'display_order' => $existing['display_order'],
                ],
                $updatePayload
            );

            $this->success($updated, 'Home benefit updated successfully');
        } catch (\Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'BENEFIT_UPDATE_FAILED');
        }
    }

    /**
     * Reversible soft-delete for a benefit.
     * DELETE /api/v1/home-benefits/{id}
     *
     * @param string $id
     * @return void
     */
    public function destroy(string $id): void
    {
        $benefitId = (int) $id;
        if ($benefitId <= 0) {
            $this->error('Invalid benefit ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $benefit = HomeBenefit::findById($benefitId);
        if (!$benefit) {
            $this->error('Home benefit not found.', 404, null, 'BENEFIT_NOT_FOUND');
        }

        $queryParams = Request::getQueryParams();
        $isForce = isset($queryParams['force']) && in_array(strtolower((string) $queryParams['force']), ['true', '1'], true);

        $userId = Request::getUserId();

        HomeBenefit::softDelete($benefitId, $userId, $isForce);

        // Record audit log
        AuditService::log(
            $userId,
            $isForce ? 'home_benefit_delete' : 'home_benefit_soft_delete',
            'home_benefit',
            $benefitId,
            [
                'title' => $benefit['title'],
                'status' => $benefit['status'],
                'is_force' => $isForce,
            ],
            $isForce ? null : ['deleted_at' => date('Y-m-d H:i:s'), 'deleted_by' => $userId]
        );

        $this->success([
            'id' => $benefitId,
            'is_deleted' => true,
            'deleted_at' => date('Y-m-d H:i:s'),
            'deleted_by' => $userId,
        ], $isForce ? 'Home benefit permanently deleted' : 'Home benefit soft-deleted successfully');
    }

    /**
     * Restore a soft-deleted benefit.
     * POST /api/v1/home-benefits/{id}/restore or PATCH /api/v1/home-benefits/{id}/restore
     *
     * @param string $id
     * @return void
     */
    public function restore(string $id): void
    {
        $benefitId = (int) $id;
        if ($benefitId <= 0) {
            $this->error('Invalid benefit ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $benefit = HomeBenefit::findById($benefitId, true);
        if (!$benefit) {
            $this->error('Home benefit not found.', 404, null, 'BENEFIT_NOT_FOUND');
        }

        if (empty($benefit['deleted_at'])) {
            $this->success($benefit, 'Home benefit is already active');
        }

        try {
            HomeBenefit::restore($benefitId);
            $restored = HomeBenefit::findById($benefitId);
            if (!$restored) {
                $restored = HomeBenefit::findById($benefitId, true) ?? [];
            }

            $userId = Request::getUserId();

            // Record audit log
            AuditService::log(
                $userId,
                'home_benefit_restore',
                'home_benefit',
                $benefitId,
                [
                    'deleted_at' => $benefit['deleted_at'],
                    'deleted_by' => $benefit['deleted_by'] ?? null,
                ],
                [
                    'title' => $restored['title'] ?? '',
                    'status' => $restored['status'] ?? '',
                    'deleted_at' => null,
                    'deleted_by' => null,
                ]
            );

            $this->success($restored, 'Home benefit restored successfully');
        } catch (\Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'BENEFIT_RESTORE_FAILED');
        }
    }

    /**
     * Activate a benefit.
     * POST /api/v1/home-benefits/{id}/activate or PATCH /api/v1/home-benefits/{id}/activate
     *
     * @param string $id
     * @return void
     */
    public function activate(string $id): void
    {
        $benefitId = (int) $id;
        if ($benefitId <= 0) {
            $this->error('Invalid benefit ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $benefit = HomeBenefit::findById($benefitId);
        if (!$benefit) {
            $this->error('Home benefit not found or is currently soft-deleted.', 404, null, 'BENEFIT_NOT_FOUND');
        }

        if ($benefit['status'] === 'active') {
            $this->success($benefit, 'Home benefit is already active');
        }

        HomeBenefit::activate($benefitId);
        $updated = HomeBenefit::findById($benefitId);

        $userId = Request::getUserId();

        // Record audit log
        AuditService::log(
            $userId,
            'home_benefit_activate',
            'home_benefit',
            $benefitId,
            ['status' => 'inactive'],
            ['status' => 'active']
        );

        $this->success($updated, 'Home benefit activated successfully');
    }

    /**
     * Deactivate a benefit.
     * POST /api/v1/home-benefits/{id}/deactivate or PATCH /api/v1/home-benefits/{id}/deactivate
     *
     * @param string $id
     * @return void
     */
    public function deactivate(string $id): void
    {
        $benefitId = (int) $id;
        if ($benefitId <= 0) {
            $this->error('Invalid benefit ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $benefit = HomeBenefit::findById($benefitId);
        if (!$benefit) {
            $this->error('Home benefit not found or is currently soft-deleted.', 404, null, 'BENEFIT_NOT_FOUND');
        }

        if ($benefit['status'] === 'inactive') {
            $this->success($benefit, 'Home benefit is already inactive');
        }

        HomeBenefit::deactivate($benefitId);
        $updated = HomeBenefit::findById($benefitId);

        $userId = Request::getUserId();

        // Record audit log
        AuditService::log(
            $userId,
            'home_benefit_deactivate',
            'home_benefit',
            $benefitId,
            ['status' => 'active'],
            ['status' => 'inactive']
        );

        $this->success($updated, 'Home benefit deactivated successfully');
    }
}
