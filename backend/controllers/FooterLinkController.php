<?php

namespace App\Controllers;

use App\Models\FooterLink;
use App\Services\AuditService;
use App\Utils\Request;

class FooterLinkController extends BaseController
{
    /**
     * List all active footer links with optional search, status filtering, column filtering, and pagination.
     * GET /api/v1/footer-links
     * Permission: footer.manage
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
            'column_name' => trim((string) ($queryParams['column_name'] ?? '')),
            'sort_by' => trim((string) ($queryParams['sort_by'] ?? 'display_order')),
            'sort_order' => trim((string) ($queryParams['sort_order'] ?? 'ASC')),
            'page' => $page,
            'limit' => $limit,
        ];

        $links = FooterLink::list($filters);
        $total = FooterLink::count($filters);
        $totalPages = (int) ceil($total / $limit);

        $this->success(
            $links,
            'Footer links retrieved successfully',
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
     * Retrieve complete details for a single footer link by ID.
     * GET /api/v1/footer-links/{id}
     * Permission: footer.manage
     *
     * @param string $id
     * @return void
     */
    public function show(string $id): void
    {
        $linkId = (int) $id;
        if ($linkId <= 0) {
            $this->error('Invalid footer link ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $link = FooterLink::findById($linkId);
        if (!$link) {
            $this->error('Footer link not found or has been deactivated.', 404, null, 'FOOTER_LINK_NOT_FOUND');
        }

        $this->success($link, 'Footer link details retrieved successfully');
    }

    /**
     * Create a new footer link.
     * POST /api/v1/footer-links
     * Permission: footer.manage
     *
     * @return void
     */
    public function store(): void
    {
        $data = Request::getBody();
        $errors = [];

        // 1. Column Name Validation
        $columnName = trim((string) ($data['column_name'] ?? ''));
        if (empty($columnName)) {
            $errors['column_name'] = 'Footer column name is required.';
        } elseif (mb_strlen($columnName) > 50) {
            $errors['column_name'] = 'Column name cannot exceed 50 characters.';
        }

        // 2. Label Validation
        $label = trim((string) ($data['label'] ?? ''));
        if (empty($label)) {
            $errors['label'] = 'Link label is required.';
        } elseif (mb_strlen($label) > 100) {
            $errors['label'] = 'Link label cannot exceed 100 characters.';
        }

        // 3. URL Validation
        $url = trim((string) ($data['url'] ?? ''));
        if (empty($url)) {
            $errors['url'] = 'Link URL is required.';
        } elseif (mb_strlen($url) > 255) {
            $errors['url'] = 'Link URL cannot exceed 255 characters.';
        }

        // 4. Display Order
        $displayOrder = isset($data['display_order']) ? (int) $data['display_order'] : 0;
        if ($displayOrder < 0) {
            $errors['display_order'] = 'Display order must be a non-negative integer.';
        }

        // 5. Is External
        $isExternal = !empty($data['is_external']) ? 1 : 0;

        // 6. Status
        $status = trim((string) ($data['status'] ?? 'active'));
        if (!in_array($status, FooterLink::ALLOWED_STATUSES, true)) {
            $errors['status'] = 'Invalid status. Allowed values: ' . implode(', ', FooterLink::ALLOWED_STATUSES) . '.';
        }

        if (!empty($errors)) {
            $this->error('Footer link validation failed.', 422, $errors, 'VALIDATION_ERROR');
        }

        try {
            $linkData = [
                'column_name' => $columnName,
                'label' => $label,
                'url' => $url,
                'display_order' => $displayOrder,
                'is_external' => $isExternal,
                'status' => $status,
            ];

            $linkId = FooterLink::create($linkData);
            $newLink = FooterLink::findById($linkId);

            $userId = Request::getUserId();

            // Record audit log
            AuditService::log(
                $userId,
                'footer_link_create',
                'footer_link',
                $linkId,
                null,
                [
                    'column_name' => $columnName,
                    'label' => $label,
                    'url' => $url,
                    'status' => $status,
                    'display_order' => $displayOrder,
                ]
            );

            $this->success($newLink, 'Footer link created successfully', 201);
        } catch (\Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'FOOTER_LINK_CREATE_FAILED');
        }
    }

    /**
     * Update an existing footer link.
     * PUT /api/v1/footer-links/{id} or PATCH /api/v1/footer-links/{id}
     * Permission: footer.manage
     *
     * @param string $id
     * @return void
     */
    public function update(string $id): void
    {
        $linkId = (int) $id;
        if ($linkId <= 0) {
            $this->error('Invalid footer link ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $existing = FooterLink::findById($linkId);
        if (!$existing) {
            $this->error('Footer link not found.', 404, null, 'FOOTER_LINK_NOT_FOUND');
        }

        $data = Request::getBody();
        $errors = [];
        $updatePayload = [];

        // Column Name
        if (array_key_exists('column_name', $data)) {
            $colName = trim((string) $data['column_name']);
            if (empty($colName)) {
                $errors['column_name'] = 'Column name cannot be empty.';
            } elseif (mb_strlen($colName) > 50) {
                $errors['column_name'] = 'Column name cannot exceed 50 characters.';
            } else {
                $updatePayload['column_name'] = $colName;
            }
        }

        // Label
        if (array_key_exists('label', $data)) {
            $label = trim((string) $data['label']);
            if (empty($label)) {
                $errors['label'] = 'Link label cannot be empty.';
            } elseif (mb_strlen($label) > 100) {
                $errors['label'] = 'Link label cannot exceed 100 characters.';
            } else {
                $updatePayload['label'] = $label;
            }
        }

        // URL
        if (array_key_exists('url', $data)) {
            $url = trim((string) $data['url']);
            if (empty($url)) {
                $errors['url'] = 'Link URL cannot be empty.';
            } elseif (mb_strlen($url) > 255) {
                $errors['url'] = 'Link URL cannot exceed 255 characters.';
            } else {
                $updatePayload['url'] = $url;
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

        // Is External
        if (array_key_exists('is_external', $data)) {
            $updatePayload['is_external'] = !empty($data['is_external']) ? 1 : 0;
        }

        // Status
        if (array_key_exists('status', $data)) {
            $status = trim((string) $data['status']);
            if (!in_array($status, FooterLink::ALLOWED_STATUSES, true)) {
                $errors['status'] = 'Invalid status. Allowed values: ' . implode(', ', FooterLink::ALLOWED_STATUSES) . '.';
            } else {
                $updatePayload['status'] = $status;
            }
        }

        if (!empty($errors)) {
            $this->error('Footer link update validation failed.', 422, $errors, 'VALIDATION_ERROR');
        }

        if (empty($updatePayload)) {
            $this->success($existing, 'No changes submitted for footer link update.');
        }

        try {
            FooterLink::update($linkId, $updatePayload);
            $updated = FooterLink::findById($linkId);

            $userId = Request::getUserId();

            // Record audit log
            AuditService::log(
                $userId,
                'footer_link_update',
                'footer_link',
                $linkId,
                [
                    'column_name' => $existing['column_name'],
                    'label' => $existing['label'],
                    'url' => $existing['url'],
                    'status' => $existing['status'],
                    'display_order' => $existing['display_order'],
                ],
                $updatePayload
            );

            $this->success($updated, 'Footer link updated successfully');
        } catch (\Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'FOOTER_LINK_UPDATE_FAILED');
        }
    }

    /**
     * Reversible soft-delete for a footer link.
     * DELETE /api/v1/footer-links/{id}
     * Permission: footer.manage
     *
     * @param string $id
     * @return void
     */
    public function destroy(string $id): void
    {
        $linkId = (int) $id;
        if ($linkId <= 0) {
            $this->error('Invalid footer link ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $link = FooterLink::findById($linkId);
        if (!$link) {
            $this->error('Footer link not found.', 404, null, 'FOOTER_LINK_NOT_FOUND');
        }

        $queryParams = Request::getQueryParams();
        $isForce = isset($queryParams['force']) && in_array(strtolower((string) $queryParams['force']), ['true', '1'], true);

        $userId = Request::getUserId();

        FooterLink::softDelete($linkId, $userId, $isForce);

        // Record audit log
        AuditService::log(
            $userId,
            $isForce ? 'footer_link_delete' : 'footer_link_soft_delete',
            'footer_link',
            $linkId,
            [
                'column_name' => $link['column_name'],
                'label' => $link['label'],
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
        ], $isForce ? 'Footer link permanently deleted' : 'Footer link soft-deleted successfully');
    }

    /**
     * Restore a soft-deleted footer link.
     * POST /api/v1/footer-links/{id}/restore or PATCH /api/v1/footer-links/{id}/restore
     * Permission: footer.manage
     *
     * @param string $id
     * @return void
     */
    public function restore(string $id): void
    {
        $linkId = (int) $id;
        if ($linkId <= 0) {
            $this->error('Invalid footer link ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $link = FooterLink::findById($linkId, true);
        if (!$link) {
            $this->error('Footer link not found.', 404, null, 'FOOTER_LINK_NOT_FOUND');
        }

        if (empty($link['deleted_at'])) {
            $this->success($link, 'Footer link is already active');
        }

        try {
            FooterLink::restore($linkId);
            $restored = FooterLink::findById($linkId);
            if (!$restored) {
                $restored = FooterLink::findById($linkId, true) ?? [];
            }

            $userId = Request::getUserId();

            // Record audit log
            AuditService::log(
                $userId,
                'footer_link_restore',
                'footer_link',
                $linkId,
                [
                    'deleted_at' => $link['deleted_at'],
                    'deleted_by' => $link['deleted_by'] ?? null,
                ],
                [
                    'column_name' => $restored['column_name'] ?? '',
                    'label' => $restored['label'] ?? '',
                    'status' => $restored['status'] ?? '',
                    'deleted_at' => null,
                    'deleted_by' => null,
                ]
            );

            $this->success($restored, 'Footer link restored successfully');
        } catch (\Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'FOOTER_LINK_RESTORE_FAILED');
        }
    }

    /**
     * Activate a footer link.
     * POST /api/v1/footer-links/{id}/activate or PATCH /api/v1/footer-links/{id}/activate
     * Permission: footer.manage
     *
     * @param string $id
     * @return void
     */
    public function activate(string $id): void
    {
        $linkId = (int) $id;
        if ($linkId <= 0) {
            $this->error('Invalid footer link ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $link = FooterLink::findById($linkId);
        if (!$link) {
            $this->error('Footer link not found or is currently soft-deleted.', 404, null, 'FOOTER_LINK_NOT_FOUND');
        }

        if ($link['status'] === 'active') {
            $this->success($link, 'Footer link is already active');
        }

        FooterLink::activate($linkId);
        $updated = FooterLink::findById($linkId);

        $userId = Request::getUserId();

        // Record audit log
        AuditService::log(
            $userId,
            'footer_link_activate',
            'footer_link',
            $linkId,
            ['status' => 'inactive'],
            ['status' => 'active']
        );

        $this->success($updated, 'Footer link activated successfully');
    }

    /**
     * Deactivate a footer link.
     * POST /api/v1/footer-links/{id}/deactivate or PATCH /api/v1/footer-links/{id}/deactivate
     * Permission: footer.manage
     *
     * @param string $id
     * @return void
     */
    public function deactivate(string $id): void
    {
        $linkId = (int) $id;
        if ($linkId <= 0) {
            $this->error('Invalid footer link ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $link = FooterLink::findById($linkId);
        if (!$link) {
            $this->error('Footer link not found or is currently soft-deleted.', 404, null, 'FOOTER_LINK_NOT_FOUND');
        }

        if ($link['status'] === 'inactive') {
            $this->success($link, 'Footer link is already inactive');
        }

        FooterLink::deactivate($linkId);
        $updated = FooterLink::findById($linkId);

        $userId = Request::getUserId();

        // Record audit log
        AuditService::log(
            $userId,
            'footer_link_deactivate',
            'footer_link',
            $linkId,
            ['status' => 'active'],
            ['status' => 'inactive']
        );

        $this->success($updated, 'Footer link deactivated successfully');
    }
}
