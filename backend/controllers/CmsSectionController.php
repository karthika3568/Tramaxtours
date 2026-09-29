<?php

namespace App\Controllers;

use App\Models\CmsSection;
use App\Models\Media;
use App\Services\AuditService;
use App\Utils\Request;

class CmsSectionController extends BaseController
{
    /**
     * List all active CMS sections with optional search, status filtering, and pagination.
     * GET /api/v1/cms-sections
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

        $sections = CmsSection::list($filters);
        $total = CmsSection::count($filters);
        $totalPages = (int) ceil($total / $limit);

        $this->success(
            $sections,
            'CMS sections retrieved successfully',
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
     * Retrieve complete details for a single CMS section by ID or section_key.
     * GET /api/v1/cms-sections/{id}
     *
     * @param string $id
     * @return void
     */
    public function show(string $id): void
    {
        $section = null;
        if (is_numeric($id)) {
            $section = CmsSection::findById((int) $id);
        } else {
            $section = CmsSection::findBySectionKey($id);
        }

        if (!$section) {
            $this->error('CMS section not found or has been deactivated.', 404, null, 'CMS_SECTION_NOT_FOUND');
        }

        $this->success($section, 'CMS section details retrieved successfully');
    }

    /**
     * Create a new CMS section.
     * POST /api/v1/cms-sections
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
            $errors['title'] = 'Section title is required.';
        } elseif (mb_strlen($title) > 255) {
            $errors['title'] = 'Section title cannot exceed 255 characters.';
        }

        // 2. Section Key Handling & Validation
        $rawKey = trim((string) ($data['section_key'] ?? ''));
        if (!empty($rawKey)) {
            if (mb_strlen($rawKey) > 100) {
                $errors['section_key'] = 'Section key cannot exceed 100 characters.';
            } elseif (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $rawKey)) {
                $errors['section_key'] = 'Section key must contain only lowercase alphanumeric characters and hyphens.';
            } elseif (CmsSection::isSectionKeyTaken($rawKey)) {
                $errors['section_key'] = "The section key '{$rawKey}' is already in use by another section.";
            }
            $sectionKey = $rawKey;
        } else {
            $sectionKey = !empty($title) ? CmsSection::generateUniqueSectionKey($title) : '';
        }

        // 3. Subtitle Validation
        $subtitle = isset($data['subtitle']) ? trim((string) $data['subtitle']) : null;
        if ($subtitle !== null && mb_strlen($subtitle) > 500) {
            $errors['subtitle'] = 'Subtitle cannot exceed 500 characters.';
        }

        // 4. Media Validation
        $mediaId = !empty($data['media_id']) ? (int) $data['media_id'] : null;
        if ($mediaId !== null) {
            $media = Media::findById($mediaId);
            if (!$media) {
                $errors['media_id'] = "Referenced media ID [{$mediaId}] for [media_id] does not exist.";
            }
        }

        // 5. Display Order Validation
        $displayOrder = isset($data['display_order']) ? (int) $data['display_order'] : 0;
        if ($displayOrder < 0) {
            $errors['display_order'] = 'Display order must be a non-negative integer.';
        }

        // 6. Status Validation
        $status = trim((string) ($data['status'] ?? 'active'));
        if (!in_array($status, CmsSection::ALLOWED_STATUSES, true)) {
            $errors['status'] = 'Invalid status. Allowed values: ' . implode(', ', CmsSection::ALLOWED_STATUSES) . '.';
        }

        // 7. Content
        $content = isset($data['content']) ? (string) $data['content'] : null;

        if (!empty($errors)) {
            $this->error('CMS section validation failed.', 422, $errors, 'VALIDATION_ERROR');
        }

        try {
            $sectionData = [
                'section_key' => $sectionKey,
                'title' => $title,
                'subtitle' => $subtitle,
                'content' => $content,
                'media_id' => $mediaId,
                'display_order' => $displayOrder,
                'status' => $status,
            ];

            $sectionId = CmsSection::create($sectionData);
            $newSection = CmsSection::findById($sectionId);

            $userId = Request::getUserId();

            // Record audit log
            AuditService::log(
                $userId,
                'cms_section_create',
                'cms_section',
                $sectionId,
                null,
                [
                    'section_key' => $sectionKey,
                    'title' => $title,
                    'status' => $status,
                    'display_order' => $displayOrder,
                ]
            );

            $this->success($newSection, 'CMS section created successfully', 201);
        } catch (\Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'CMS_SECTION_CREATE_FAILED');
        }
    }

    /**
     * Update an existing CMS section.
     * PUT /api/v1/cms-sections/{id} or PATCH /api/v1/cms-sections/{id}
     *
     * @param string $id
     * @return void
     */
    public function update(string $id): void
    {
        $sectionId = (int) $id;
        if ($sectionId <= 0) {
            $this->error('Invalid CMS section ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $existing = CmsSection::findById($sectionId);
        if (!$existing) {
            $this->error('CMS section not found.', 404, null, 'CMS_SECTION_NOT_FOUND');
        }

        $data = Request::getBody();
        $errors = [];
        $updatePayload = [];

        // Title
        if (array_key_exists('title', $data)) {
            $title = trim((string) $data['title']);
            if (empty($title)) {
                $errors['title'] = 'Section title cannot be empty.';
            } elseif (mb_strlen($title) > 255) {
                $errors['title'] = 'Section title cannot exceed 255 characters.';
            } else {
                $updatePayload['title'] = $title;
            }
        }

        // Section Key
        if (array_key_exists('section_key', $data)) {
            $rawKey = trim((string) $data['section_key']);
            if (empty($rawKey)) {
                $updatePayload['section_key'] = CmsSection::generateUniqueSectionKey($updatePayload['title'] ?? $existing['title'], $sectionId);
            } else {
                if (mb_strlen($rawKey) > 100) {
                    $errors['section_key'] = 'Section key cannot exceed 100 characters.';
                } elseif (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $rawKey)) {
                    $errors['section_key'] = 'Section key must contain only lowercase alphanumeric characters and hyphens.';
                } elseif (CmsSection::isSectionKeyTaken($rawKey, $sectionId)) {
                    $errors['section_key'] = "The section key '{$rawKey}' is already in use by another section.";
                } else {
                    $updatePayload['section_key'] = $rawKey;
                }
            }
        }

        // Subtitle
        if (array_key_exists('subtitle', $data)) {
            $subtitle = $data['subtitle'] !== null ? trim((string) $data['subtitle']) : null;
            if ($subtitle !== null && mb_strlen($subtitle) > 500) {
                $errors['subtitle'] = 'Subtitle cannot exceed 500 characters.';
            } else {
                $updatePayload['subtitle'] = $subtitle;
            }
        }

        // Content
        if (array_key_exists('content', $data)) {
            $updatePayload['content'] = $data['content'] !== null ? (string) $data['content'] : null;
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
            if (!in_array($status, CmsSection::ALLOWED_STATUSES, true)) {
                $errors['status'] = 'Invalid status. Allowed values: ' . implode(', ', CmsSection::ALLOWED_STATUSES) . '.';
            } else {
                $updatePayload['status'] = $status;
            }
        }

        if (!empty($errors)) {
            $this->error('CMS section update validation failed.', 422, $errors, 'VALIDATION_ERROR');
        }

        if (empty($updatePayload)) {
            $this->success($existing, 'No changes submitted for CMS section update.');
        }

        try {
            CmsSection::update($sectionId, $updatePayload);
            $updated = CmsSection::findById($sectionId);

            $userId = Request::getUserId();

            // Record audit log
            AuditService::log(
                $userId,
                'cms_section_update',
                'cms_section',
                $sectionId,
                [
                    'title' => $existing['title'],
                    'section_key' => $existing['section_key'],
                    'status' => $existing['status'],
                    'display_order' => $existing['display_order'],
                ],
                $updatePayload
            );

            $this->success($updated, 'CMS section updated successfully');
        } catch (\Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'CMS_SECTION_UPDATE_FAILED');
        }
    }

    /**
     * Reversible soft-delete for a CMS section.
     * DELETE /api/v1/cms-sections/{id}
     *
     * @param string $id
     * @return void
     */
    public function destroy(string $id): void
    {
        $sectionId = (int) $id;
        if ($sectionId <= 0) {
            $this->error('Invalid CMS section ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $section = CmsSection::findById($sectionId);
        if (!$section) {
            $this->error('CMS section not found.', 404, null, 'CMS_SECTION_NOT_FOUND');
        }

        $queryParams = Request::getQueryParams();
        $isForce = isset($queryParams['force']) && in_array(strtolower((string) $queryParams['force']), ['true', '1'], true);

        $userId = Request::getUserId();

        CmsSection::softDelete($sectionId, $userId, $isForce);

        // Record audit log
        AuditService::log(
            $userId,
            $isForce ? 'cms_section_delete' : 'cms_section_soft_delete',
            'cms_section',
            $sectionId,
            [
                'section_key' => $section['section_key'],
                'title' => $section['title'],
                'status' => $section['status'],
                'is_force' => $isForce,
            ],
            $isForce ? null : ['deleted_at' => date('Y-m-d H:i:s'), 'deleted_by' => $userId]
        );

        $this->success([
            'id' => $sectionId,
            'is_deleted' => true,
            'deleted_at' => date('Y-m-d H:i:s'),
            'deleted_by' => $userId,
        ], $isForce ? 'CMS section permanently deleted' : 'CMS section soft-deleted successfully');
    }

    /**
     * Restore a soft-deleted CMS section.
     * POST /api/v1/cms-sections/{id}/restore or PATCH /api/v1/cms-sections/{id}/restore
     *
     * @param string $id
     * @return void
     */
    public function restore(string $id): void
    {
        $sectionId = (int) $id;
        if ($sectionId <= 0) {
            $this->error('Invalid CMS section ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $section = CmsSection::findById($sectionId, true);
        if (!$section) {
            $this->error('CMS section not found.', 404, null, 'CMS_SECTION_NOT_FOUND');
        }

        if (empty($section['deleted_at'])) {
            $this->success($section, 'CMS section is already active');
        }

        try {
            CmsSection::restore($sectionId);
            $restored = CmsSection::findById($sectionId);
            if (!$restored) {
                $restored = CmsSection::findById($sectionId, true) ?? [];
            }

            $userId = Request::getUserId();

            // Record audit log
            AuditService::log(
                $userId,
                'cms_section_restore',
                'cms_section',
                $sectionId,
                [
                    'deleted_at' => $section['deleted_at'],
                    'deleted_by' => $section['deleted_by'] ?? null,
                ],
                [
                    'title' => $restored['title'] ?? '',
                    'section_key' => $restored['section_key'] ?? '',
                    'status' => $restored['status'] ?? '',
                    'deleted_at' => null,
                    'deleted_by' => null,
                ]
            );

            $this->success($restored, 'CMS section restored successfully');
        } catch (\Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'CMS_SECTION_RESTORE_FAILED');
        }
    }

    /**
     * Activate a CMS section.
     * POST /api/v1/cms-sections/{id}/activate or PATCH /api/v1/cms-sections/{id}/activate
     *
     * @param string $id
     * @return void
     */
    public function activate(string $id): void
    {
        $sectionId = (int) $id;
        if ($sectionId <= 0) {
            $this->error('Invalid CMS section ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $section = CmsSection::findById($sectionId);
        if (!$section) {
            $this->error('CMS section not found or is currently soft-deleted.', 404, null, 'CMS_SECTION_NOT_FOUND');
        }

        if ($section['status'] === 'active') {
            $this->success($section, 'CMS section is already active');
        }

        CmsSection::activate($sectionId);
        $updated = CmsSection::findById($sectionId);

        $userId = Request::getUserId();

        // Record audit log
        AuditService::log(
            $userId,
            'cms_section_activate',
            'cms_section',
            $sectionId,
            ['status' => $section['status']],
            ['status' => 'active']
        );

        $this->success($updated, 'CMS section activated successfully');
    }

    /**
     * Deactivate a CMS section.
     * POST /api/v1/cms-sections/{id}/deactivate or PATCH /api/v1/cms-sections/{id}/deactivate
     *
     * @param string $id
     * @return void
     */
    public function deactivate(string $id): void
    {
        $sectionId = (int) $id;
        if ($sectionId <= 0) {
            $this->error('Invalid CMS section ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $section = CmsSection::findById($sectionId);
        if (!$section) {
            $this->error('CMS section not found or is currently soft-deleted.', 404, null, 'CMS_SECTION_NOT_FOUND');
        }

        if ($section['status'] === 'inactive') {
            $this->success($section, 'CMS section is already inactive');
        }

        CmsSection::deactivate($sectionId);
        $updated = CmsSection::findById($sectionId);

        $userId = Request::getUserId();

        // Record audit log
        AuditService::log(
            $userId,
            'cms_section_deactivate',
            'cms_section',
            $sectionId,
            ['status' => $section['status']],
            ['status' => 'inactive']
        );

        $this->success($updated, 'CMS section deactivated successfully');
    }
}
