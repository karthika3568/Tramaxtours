<?php

namespace App\Controllers;

use App\Models\Media;
use App\Models\Page;
use App\Services\AuditService;
use App\Utils\Request;

class PageController extends BaseController
{
    /**
     * List all active pages with optional search, status filtering, and pagination.
     * GET /api/v1/pages
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
            'sort_by' => trim((string) ($queryParams['sort_by'] ?? 'created_at')),
            'sort_order' => trim((string) ($queryParams['sort_order'] ?? 'DESC')),
            'page' => $page,
            'limit' => $limit,
        ];

        $pages = Page::all($filters);
        $total = Page::count($filters);
        $totalPages = (int) ceil($total / $limit);

        $this->success(
            $pages,
            'Pages retrieved successfully',
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
     * Retrieve complete details for a single page by ID or slug.
     * GET /api/v1/pages/{id}
     *
     * @param string $id
     * @return void
     */
    public function show(string $id): void
    {
        $page = null;
        if (is_numeric($id)) {
            $page = Page::findById((int) $id);
        } else {
            $page = Page::findBySlug($id);
        }

        if (!$page) {
            $this->error('Page not found or has been deactivated.', 404, null, 'PAGE_NOT_FOUND');
        }

        $this->success($page, 'Page details retrieved successfully');
    }

    /**
     * Create a new page.
     * POST /api/v1/pages
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
            $errors['title'] = 'Page title is required.';
        } elseif (mb_strlen($title) > 255) {
            $errors['title'] = 'Page title cannot exceed 255 characters.';
        }

        // 2. Slug Handling & Validation
        $rawSlug = trim((string) ($data['slug'] ?? ''));
        if (!empty($rawSlug)) {
            if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $rawSlug)) {
                $errors['slug'] = 'Slug must contain only lowercase alphanumeric characters and hyphens.';
            } elseif (Page::isSlugTaken($rawSlug)) {
                $errors['slug'] = "The slug '{$rawSlug}' is already in use by another page.";
            }
            $slug = $rawSlug;
        } else {
            $slug = !empty($title) ? Page::generateUniqueSlug($title) : '';
        }

        // 3. Subtitle Validation
        $subtitle = isset($data['subtitle']) ? trim((string) $data['subtitle']) : null;
        if ($subtitle !== null && mb_strlen($subtitle) > 255) {
            $errors['subtitle'] = 'Subtitle cannot exceed 255 characters.';
        }

        // 4. Hero Media Validation
        $heroMediaId = !empty($data['hero_media_id']) ? (int) $data['hero_media_id'] : null;
        if ($heroMediaId !== null) {
            $media = Media::findById($heroMediaId);
            if (!$media) {
                $errors['hero_media_id'] = "Referenced media ID [{$heroMediaId}] for [hero_media_id] does not exist.";
            }
        }

        // 5. Status Validation
        $status = trim((string) ($data['status'] ?? 'published'));
        if (!in_array($status, Page::ALLOWED_STATUSES, true)) {
            $errors['status'] = 'Invalid status. Allowed values: ' . implode(', ', Page::ALLOWED_STATUSES) . '.';
        }

        // 6. Content & SEO
        $content = (string) ($data['content'] ?? '');
        $seoTitle = isset($data['seo_title']) ? trim((string) $data['seo_title']) : null;
        $seoDescription = isset($data['seo_description']) ? trim((string) $data['seo_description']) : null;

        if (!empty($errors)) {
            $this->error('Page validation failed.', 422, $errors, 'VALIDATION_ERROR');
        }

        try {
            $pageData = [
                'title' => $title,
                'slug' => $slug,
                'subtitle' => $subtitle,
                'hero_media_id' => $heroMediaId,
                'content' => $content,
                'seo_title' => $seoTitle,
                'seo_description' => $seoDescription,
                'status' => $status,
            ];

            $pageId = Page::create($pageData);
            $newPage = Page::findById($pageId);

            $userId = Request::getUserId();

            // Record audit log
            AuditService::log(
                $userId,
                'page_create',
                'page',
                $pageId,
                null,
                [
                    'title' => $title,
                    'slug' => $slug,
                    'status' => $status,
                ]
            );

            $this->success($newPage, 'Page created successfully', 201);
        } catch (\Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'PAGE_CREATE_FAILED');
        }
    }

    /**
     * Update an existing page.
     * PUT /api/v1/pages/{id} or PATCH /api/v1/pages/{id}
     *
     * @param string $id
     * @return void
     */
    public function update(string $id): void
    {
        $pageId = (int) $id;
        if ($pageId <= 0) {
            $this->error('Invalid page ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $existing = Page::findById($pageId);
        if (!$existing) {
            $this->error('Page not found.', 404, null, 'PAGE_NOT_FOUND');
        }

        $data = Request::getBody();
        $errors = [];
        $updatePayload = [];

        // Title
        if (array_key_exists('title', $data)) {
            $title = trim((string) $data['title']);
            if (empty($title)) {
                $errors['title'] = 'Page title cannot be empty.';
            } elseif (mb_strlen($title) > 255) {
                $errors['title'] = 'Page title cannot exceed 255 characters.';
            } else {
                $updatePayload['title'] = $title;
            }
        }

        // Slug
        if (array_key_exists('slug', $data)) {
            $rawSlug = trim((string) $data['slug']);
            if (empty($rawSlug)) {
                $updatePayload['slug'] = Page::generateUniqueSlug($updatePayload['title'] ?? $existing['title'], $pageId);
            } else {
                if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $rawSlug)) {
                    $errors['slug'] = 'Slug must contain only lowercase alphanumeric characters and hyphens.';
                } elseif (Page::isSlugTaken($rawSlug, $pageId)) {
                    $errors['slug'] = "The slug '{$rawSlug}' is already in use by another page.";
                } else {
                    $updatePayload['slug'] = $rawSlug;
                }
            }
        }

        // Subtitle
        if (array_key_exists('subtitle', $data)) {
            $subtitle = $data['subtitle'] !== null ? trim((string) $data['subtitle']) : null;
            if ($subtitle !== null && mb_strlen($subtitle) > 255) {
                $errors['subtitle'] = 'Subtitle cannot exceed 255 characters.';
            } else {
                $updatePayload['subtitle'] = $subtitle;
            }
        }

        // Hero Media ID
        if (array_key_exists('hero_media_id', $data)) {
            $mediaId = !empty($data['hero_media_id']) ? (int) $data['hero_media_id'] : null;
            if ($mediaId !== null) {
                $media = Media::findById($mediaId);
                if (!$media) {
                    $errors['hero_media_id'] = "Referenced media ID [{$mediaId}] for [hero_media_id] does not exist.";
                } else {
                    $updatePayload['hero_media_id'] = $mediaId;
                }
            } else {
                $updatePayload['hero_media_id'] = null;
            }
        }

        // Content
        if (array_key_exists('content', $data)) {
            $updatePayload['content'] = (string) $data['content'];
        }

        // SEO Title
        if (array_key_exists('seo_title', $data)) {
            $updatePayload['seo_title'] = $data['seo_title'] !== null ? trim((string) $data['seo_title']) : null;
        }

        // SEO Description
        if (array_key_exists('seo_description', $data)) {
            $updatePayload['seo_description'] = $data['seo_description'] !== null ? trim((string) $data['seo_description']) : null;
        }

        // Status
        if (array_key_exists('status', $data)) {
            $status = trim((string) $data['status']);
            if (!in_array($status, Page::ALLOWED_STATUSES, true)) {
                $errors['status'] = 'Invalid status. Allowed values: ' . implode(', ', Page::ALLOWED_STATUSES) . '.';
            } else {
                $updatePayload['status'] = $status;
            }
        }

        if (!empty($errors)) {
            $this->error('Page update validation failed.', 422, $errors, 'VALIDATION_ERROR');
        }

        if (empty($updatePayload)) {
            $this->success($existing, 'No changes submitted for page update.');
        }

        try {
            Page::update($pageId, $updatePayload);
            $updated = Page::findById($pageId);

            $userId = Request::getUserId();

            // Record audit log
            AuditService::log(
                $userId,
                'page_update',
                'page',
                $pageId,
                [
                    'title' => $existing['title'],
                    'slug' => $existing['slug'],
                    'status' => $existing['status'],
                ],
                $updatePayload
            );

            $this->success($updated, 'Page updated successfully');
        } catch (\Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'PAGE_UPDATE_FAILED');
        }
    }

    /**
     * Reversible soft-delete for a page.
     * DELETE /api/v1/pages/{id}
     *
     * @param string $id
     * @return void
     */
    public function destroy(string $id): void
    {
        $pageId = (int) $id;
        if ($pageId <= 0) {
            $this->error('Invalid page ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $page = Page::findById($pageId);
        if (!$page) {
            $this->error('Page not found.', 404, null, 'PAGE_NOT_FOUND');
        }

        $queryParams = Request::getQueryParams();
        $isForce = isset($queryParams['force']) && in_array(strtolower((string) $queryParams['force']), ['true', '1'], true);

        $userId = Request::getUserId();

        Page::delete($pageId, $userId, $isForce);

        // Record audit log
        AuditService::log(
            $userId,
            $isForce ? 'page_delete' : 'page_soft_delete',
            'page',
            $pageId,
            [
                'title' => $page['title'],
                'slug' => $page['slug'],
                'status' => $page['status'],
                'is_force' => $isForce,
            ],
            $isForce ? null : ['deleted_at' => date('Y-m-d H:i:s'), 'deleted_by' => $userId]
        );

        $this->success([
            'id' => $pageId,
            'is_deleted' => true,
            'deleted_at' => date('Y-m-d H:i:s'),
            'deleted_by' => $userId,
        ], $isForce ? 'Page permanently deleted' : 'Page soft-deleted successfully');
    }

    /**
     * Restore a soft-deleted page.
     * POST /api/v1/pages/{id}/restore or PATCH /api/v1/pages/{id}/restore
     *
     * @param string $id
     * @return void
     */
    public function restore(string $id): void
    {
        $pageId = (int) $id;
        if ($pageId <= 0) {
            $this->error('Invalid page ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $page = Page::findById($pageId, true);
        if (!$page) {
            $this->error('Page not found.', 404, null, 'PAGE_NOT_FOUND');
        }

        if (empty($page['deleted_at'])) {
            $this->success($page, 'Page is already active');
        }

        try {
            Page::restore($pageId);
            $restored = Page::findById($pageId);
            if (!$restored) {
                $restored = Page::findById($pageId, true) ?? [];
            }

            $userId = Request::getUserId();

            // Record audit log
            AuditService::log(
                $userId,
                'page_restore',
                'page',
                $pageId,
                [
                    'deleted_at' => $page['deleted_at'],
                    'deleted_by' => $page['deleted_by'] ?? null,
                ],
                [
                    'title' => $restored['title'] ?? '',
                    'slug' => $restored['slug'] ?? '',
                    'status' => $restored['status'] ?? '',
                    'deleted_at' => null,
                    'deleted_by' => null,
                ]
            );

            $this->success($restored, 'Page restored successfully');
        } catch (\Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'PAGE_RESTORE_FAILED');
        }
    }

    /**
     * Publish a page.
     * POST /api/v1/pages/{id}/publish or PATCH /api/v1/pages/{id}/publish
     *
     * @param string $id
     * @return void
     */
    public function publish(string $id): void
    {
        $pageId = (int) $id;
        if ($pageId <= 0) {
            $this->error('Invalid page ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $page = Page::findById($pageId);
        if (!$page) {
            $this->error('Page not found or is currently soft-deleted.', 404, null, 'PAGE_NOT_FOUND');
        }

        if ($page['status'] === 'published') {
            $this->success($page, 'Page is already published');
        }

        Page::setStatus($pageId, 'published');
        $updated = Page::findById($pageId);

        $userId = Request::getUserId();

        // Record audit log
        AuditService::log(
            $userId,
            'page_publish',
            'page',
            $pageId,
            ['status' => $page['status']],
            ['status' => 'published']
        );

        $this->success($updated, 'Page published successfully');
    }

    /**
     * Unpublish / revert page to draft.
     * POST /api/v1/pages/{id}/unpublish or PATCH /api/v1/pages/{id}/unpublish
     *
     * @param string $id
     * @return void
     */
    public function unpublish(string $id): void
    {
        $pageId = (int) $id;
        if ($pageId <= 0) {
            $this->error('Invalid page ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $page = Page::findById($pageId);
        if (!$page) {
            $this->error('Page not found or is currently soft-deleted.', 404, null, 'PAGE_NOT_FOUND');
        }

        if ($page['status'] === 'draft') {
            $this->success($page, 'Page is already in draft status');
        }

        Page::setStatus($pageId, 'draft');
        $updated = Page::findById($pageId);

        $userId = Request::getUserId();

        // Record audit log
        AuditService::log(
            $userId,
            'page_unpublish',
            'page',
            $pageId,
            ['status' => $page['status']],
            ['status' => 'draft']
        );

        $this->success($updated, 'Page unpublished (reverted to draft) successfully');
    }
}
