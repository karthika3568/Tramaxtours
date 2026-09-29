<?php

namespace App\Controllers;

use App\Models\HomeHeroSlide;
use App\Models\Media;
use App\Services\AuditService;
use App\Utils\Request;
use DateTime;

class HomeHeroSlideController extends BaseController
{
    /**
     * List all active homepage hero slides with optional search, status filtering, and pagination.
     * GET /api/v1/home-hero-slides
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

        $slides = HomeHeroSlide::list($filters);
        $total = HomeHeroSlide::count($filters);
        $totalPages = (int) ceil($total / $limit);

        $this->success(
            $slides,
            'Hero slides retrieved successfully',
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
     * Retrieve complete details for a single hero slide by ID.
     * GET /api/v1/home-hero-slides/{id}
     *
     * @param string $id
     * @return void
     */
    public function show(string $id): void
    {
        $slideId = (int) $id;
        if ($slideId <= 0) {
            $this->error('Invalid hero slide ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $slide = HomeHeroSlide::findById($slideId);
        if (!$slide) {
            $this->error('Hero slide not found or has been deactivated.', 404, null, 'HERO_SLIDE_NOT_FOUND');
        }

        $this->success($slide, 'Hero slide details retrieved successfully');
    }

    /**
     * Create a new homepage hero slide.
     * POST /api/v1/home-hero-slides
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
            $errors['title'] = 'Slide title is required.';
        } elseif (mb_strlen($title) > 255) {
            $errors['title'] = 'Slide title cannot exceed 255 characters.';
        }

        // 2. Subtitle Validation
        $subtitle = isset($data['subtitle']) && $data['subtitle'] !== '' ? trim((string) $data['subtitle']) : null;
        if ($subtitle !== null && mb_strlen($subtitle) > 500) {
            $errors['subtitle'] = 'Subtitle cannot exceed 500 characters.';
        }

        // 3. Desktop Media Validation
        $desktopMediaId = !empty($data['desktop_media_id']) ? (int) $data['desktop_media_id'] : null;
        if ($desktopMediaId !== null) {
            $media = Media::findById($desktopMediaId);
            if (!$media) {
                $errors['desktop_media_id'] = "Referenced media ID [{$desktopMediaId}] for [desktop_media_id] does not exist.";
            }
        }

        // 4. Mobile Media Validation
        $mobileMediaId = !empty($data['mobile_media_id']) ? (int) $data['mobile_media_id'] : null;
        if ($mobileMediaId !== null) {
            $media = Media::findById($mobileMediaId);
            if (!$media) {
                $errors['mobile_media_id'] = "Referenced media ID [{$mobileMediaId}] for [mobile_media_id] does not exist.";
            }
        }

        // 5. CTA Label & URL
        $ctaLabel = isset($data['cta_label']) && $data['cta_label'] !== '' ? trim((string) $data['cta_label']) : null;
        if ($ctaLabel !== null && mb_strlen($ctaLabel) > 100) {
            $errors['cta_label'] = 'CTA label cannot exceed 100 characters.';
        }

        $ctaUrl = isset($data['cta_url']) && $data['cta_url'] !== '' ? trim((string) $data['cta_url']) : null;
        if ($ctaUrl !== null && mb_strlen($ctaUrl) > 255) {
            $errors['cta_url'] = 'CTA URL cannot exceed 255 characters.';
        }

        // 6. Display Order
        $displayOrder = isset($data['display_order']) ? (int) $data['display_order'] : 0;
        if ($displayOrder < 0) {
            $errors['display_order'] = 'Display order must be a non-negative integer.';
        }

        // 7. Scheduling Dates
        $startDate = null;
        if (!empty($data['start_date'])) {
            $parsedStart = $this->parseDateTime((string) $data['start_date']);
            if ($parsedStart === null) {
                $errors['start_date'] = 'Invalid start_date format. Expected a valid date/time string.';
            } else {
                $startDate = $parsedStart;
            }
        }

        $endDate = null;
        if (!empty($data['end_date'])) {
            $parsedEnd = $this->parseDateTime((string) $data['end_date']);
            if ($parsedEnd === null) {
                $errors['end_date'] = 'Invalid end_date format. Expected a valid date/time string.';
            } else {
                $endDate = $parsedEnd;
            }
        }

        if ($startDate !== null && $endDate !== null) {
            if ($endDate < $startDate) {
                $errors['end_date'] = 'End date cannot be earlier than start date.';
            }
        }

        // 8. Status
        $status = trim((string) ($data['status'] ?? 'active'));
        if (!in_array($status, HomeHeroSlide::ALLOWED_STATUSES, true)) {
            $errors['status'] = 'Invalid status. Allowed values: ' . implode(', ', HomeHeroSlide::ALLOWED_STATUSES) . '.';
        }

        if (!empty($errors)) {
            $this->error('Hero slide validation failed.', 422, $errors, 'VALIDATION_ERROR');
        }

        try {
            $slideData = [
                'title' => $title,
                'subtitle' => $subtitle,
                'desktop_media_id' => $desktopMediaId,
                'mobile_media_id' => $mobileMediaId,
                'cta_label' => $ctaLabel,
                'cta_url' => $ctaUrl,
                'display_order' => $displayOrder,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => $status,
            ];

            $slideId = HomeHeroSlide::create($slideData);
            $newSlide = HomeHeroSlide::findById($slideId);

            $userId = Request::getUserId();

            // Record audit log
            AuditService::log(
                $userId,
                'home_hero_slide_create',
                'home_hero_slide',
                $slideId,
                null,
                [
                    'title' => $title,
                    'status' => $status,
                    'display_order' => $displayOrder,
                    'desktop_media_id' => $desktopMediaId,
                    'mobile_media_id' => $mobileMediaId,
                ]
            );

            $this->success($newSlide, 'Hero slide created successfully', 201);
        } catch (\Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'HERO_SLIDE_CREATE_FAILED');
        }
    }

    /**
     * Update an existing homepage hero slide.
     * PUT /api/v1/home-hero-slides/{id} or PATCH /api/v1/home-hero-slides/{id}
     *
     * @param string $id
     * @return void
     */
    public function update(string $id): void
    {
        $slideId = (int) $id;
        if ($slideId <= 0) {
            $this->error('Invalid hero slide ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $existing = HomeHeroSlide::findById($slideId);
        if (!$existing) {
            $this->error('Hero slide not found.', 404, null, 'HERO_SLIDE_NOT_FOUND');
        }

        $data = Request::getBody();
        $errors = [];
        $updatePayload = [];

        // Title
        if (array_key_exists('title', $data)) {
            $title = trim((string) $data['title']);
            if (empty($title)) {
                $errors['title'] = 'Slide title cannot be empty.';
            } elseif (mb_strlen($title) > 255) {
                $errors['title'] = 'Slide title cannot exceed 255 characters.';
            } else {
                $updatePayload['title'] = $title;
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

        // Desktop Media ID
        if (array_key_exists('desktop_media_id', $data)) {
            $desktopMediaId = !empty($data['desktop_media_id']) ? (int) $data['desktop_media_id'] : null;
            if ($desktopMediaId !== null) {
                $media = Media::findById($desktopMediaId);
                if (!$media) {
                    $errors['desktop_media_id'] = "Referenced media ID [{$desktopMediaId}] for [desktop_media_id] does not exist.";
                } else {
                    $updatePayload['desktop_media_id'] = $desktopMediaId;
                }
            } else {
                $updatePayload['desktop_media_id'] = null;
            }
        }

        // Mobile Media ID
        if (array_key_exists('mobile_media_id', $data)) {
            $mobileMediaId = !empty($data['mobile_media_id']) ? (int) $data['mobile_media_id'] : null;
            if ($mobileMediaId !== null) {
                $media = Media::findById($mobileMediaId);
                if (!$media) {
                    $errors['mobile_media_id'] = "Referenced media ID [{$mobileMediaId}] for [mobile_media_id] does not exist.";
                } else {
                    $updatePayload['mobile_media_id'] = $mobileMediaId;
                }
            } else {
                $updatePayload['mobile_media_id'] = null;
            }
        }

        // CTA Label
        if (array_key_exists('cta_label', $data)) {
            $ctaLabel = $data['cta_label'] !== null ? trim((string) $data['cta_label']) : null;
            if ($ctaLabel !== null && mb_strlen($ctaLabel) > 100) {
                $errors['cta_label'] = 'CTA label cannot exceed 100 characters.';
            } else {
                $updatePayload['cta_label'] = $ctaLabel;
            }
        }

        // CTA URL
        if (array_key_exists('cta_url', $data)) {
            $ctaUrl = $data['cta_url'] !== null ? trim((string) $data['cta_url']) : null;
            if ($ctaUrl !== null && mb_strlen($ctaUrl) > 255) {
                $errors['cta_url'] = 'CTA URL cannot exceed 255 characters.';
            } else {
                $updatePayload['cta_url'] = $ctaUrl;
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

        // Dates & Scheduling
        $newStart = array_key_exists('start_date', $data) ? $data['start_date'] : $existing['start_date'];
        $newEnd = array_key_exists('end_date', $data) ? $data['end_date'] : $existing['end_date'];

        $parsedStart = null;
        if (!empty($newStart)) {
            $parsedStart = $this->parseDateTime((string) $newStart);
            if ($parsedStart === null) {
                $errors['start_date'] = 'Invalid start_date format. Expected a valid date/time string.';
            }
        }

        $parsedEnd = null;
        if (!empty($newEnd)) {
            $parsedEnd = $this->parseDateTime((string) $newEnd);
            if ($parsedEnd === null) {
                $errors['end_date'] = 'Invalid end_date format. Expected a valid date/time string.';
            }
        }

        if ($parsedStart !== null && $parsedEnd !== null) {
            if ($parsedEnd < $parsedStart) {
                $errors['end_date'] = 'End date cannot be earlier than start date.';
            }
        }

        if (array_key_exists('start_date', $data) && !isset($errors['start_date'])) {
            $updatePayload['start_date'] = $parsedStart;
        }
        if (array_key_exists('end_date', $data) && !isset($errors['end_date'])) {
            $updatePayload['end_date'] = $parsedEnd;
        }

        // Status
        if (array_key_exists('status', $data)) {
            $status = trim((string) $data['status']);
            if (!in_array($status, HomeHeroSlide::ALLOWED_STATUSES, true)) {
                $errors['status'] = 'Invalid status. Allowed values: ' . implode(', ', HomeHeroSlide::ALLOWED_STATUSES) . '.';
            } else {
                $updatePayload['status'] = $status;
            }
        }

        if (!empty($errors)) {
            $this->error('Hero slide update validation failed.', 422, $errors, 'VALIDATION_ERROR');
        }

        if (empty($updatePayload)) {
            $this->success($existing, 'No changes submitted for hero slide update.');
        }

        try {
            HomeHeroSlide::update($slideId, $updatePayload);
            $updated = HomeHeroSlide::findById($slideId);

            $userId = Request::getUserId();

            // Record audit log
            AuditService::log(
                $userId,
                'home_hero_slide_update',
                'home_hero_slide',
                $slideId,
                [
                    'title' => $existing['title'],
                    'status' => $existing['status'],
                    'display_order' => $existing['display_order'],
                ],
                $updatePayload
            );

            $this->success($updated, 'Hero slide updated successfully');
        } catch (\Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'HERO_SLIDE_UPDATE_FAILED');
        }
    }

    /**
     * Reversible soft-delete for a hero slide.
     * DELETE /api/v1/home-hero-slides/{id}
     *
     * @param string $id
     * @return void
     */
    public function destroy(string $id): void
    {
        $slideId = (int) $id;
        if ($slideId <= 0) {
            $this->error('Invalid hero slide ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $slide = HomeHeroSlide::findById($slideId);
        if (!$slide) {
            $this->error('Hero slide not found.', 404, null, 'HERO_SLIDE_NOT_FOUND');
        }

        $queryParams = Request::getQueryParams();
        $isForce = isset($queryParams['force']) && in_array(strtolower((string) $queryParams['force']), ['true', '1'], true);

        $userId = Request::getUserId();

        HomeHeroSlide::softDelete($slideId, $userId, $isForce);

        // Record audit log
        AuditService::log(
            $userId,
            $isForce ? 'home_hero_slide_delete' : 'home_hero_slide_soft_delete',
            'home_hero_slide',
            $slideId,
            [
                'title' => $slide['title'],
                'status' => $slide['status'],
                'is_force' => $isForce,
            ],
            $isForce ? null : ['deleted_at' => date('Y-m-d H:i:s'), 'deleted_by' => $userId]
        );

        $this->success([
            'id' => $slideId,
            'is_deleted' => true,
            'deleted_at' => date('Y-m-d H:i:s'),
            'deleted_by' => $userId,
        ], $isForce ? 'Hero slide permanently deleted' : 'Hero slide soft-deleted successfully');
    }

    /**
     * Restore a soft-deleted hero slide.
     * POST /api/v1/home-hero-slides/{id}/restore or PATCH /api/v1/home-hero-slides/{id}/restore
     *
     * @param string $id
     * @return void
     */
    public function restore(string $id): void
    {
        $slideId = (int) $id;
        if ($slideId <= 0) {
            $this->error('Invalid hero slide ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $slide = HomeHeroSlide::findById($slideId, true);
        if (!$slide) {
            $this->error('Hero slide not found.', 404, null, 'HERO_SLIDE_NOT_FOUND');
        }

        if (empty($slide['deleted_at'])) {
            $this->success($slide, 'Hero slide is already active');
        }

        try {
            HomeHeroSlide::restore($slideId);
            $restored = HomeHeroSlide::findById($slideId);
            if (!$restored) {
                $restored = HomeHeroSlide::findById($slideId, true) ?? [];
            }

            $userId = Request::getUserId();

            // Record audit log
            AuditService::log(
                $userId,
                'home_hero_slide_restore',
                'home_hero_slide',
                $slideId,
                [
                    'deleted_at' => $slide['deleted_at'],
                    'deleted_by' => $slide['deleted_by'] ?? null,
                ],
                [
                    'title' => $restored['title'] ?? '',
                    'status' => $restored['status'] ?? '',
                    'deleted_at' => null,
                    'deleted_by' => null,
                ]
            );

            $this->success($restored, 'Hero slide restored successfully');
        } catch (\Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'HERO_SLIDE_RESTORE_FAILED');
        }
    }

    /**
     * Activate a hero slide.
     * POST /api/v1/home-hero-slides/{id}/activate or PATCH /api/v1/home-hero-slides/{id}/activate
     *
     * @param string $id
     * @return void
     */
    public function activate(string $id): void
    {
        $slideId = (int) $id;
        if ($slideId <= 0) {
            $this->error('Invalid hero slide ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $slide = HomeHeroSlide::findById($slideId);
        if (!$slide) {
            $this->error('Hero slide not found or is currently soft-deleted.', 404, null, 'HERO_SLIDE_NOT_FOUND');
        }

        if ($slide['status'] === 'active') {
            $this->success($slide, 'Hero slide is already active');
        }

        HomeHeroSlide::activate($slideId);
        $updated = HomeHeroSlide::findById($slideId);

        $userId = Request::getUserId();

        // Record audit log
        AuditService::log(
            $userId,
            'home_hero_slide_activate',
            'home_hero_slide',
            $slideId,
            ['status' => 'inactive'],
            ['status' => 'active']
        );

        $this->success($updated, 'Hero slide activated successfully');
    }

    /**
     * Deactivate a hero slide.
     * POST /api/v1/home-hero-slides/{id}/deactivate or PATCH /api/v1/home-hero-slides/{id}/deactivate
     *
     * @param string $id
     * @return void
     */
    public function deactivate(string $id): void
    {
        $slideId = (int) $id;
        if ($slideId <= 0) {
            $this->error('Invalid hero slide ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $slide = HomeHeroSlide::findById($slideId);
        if (!$slide) {
            $this->error('Hero slide not found or is currently soft-deleted.', 404, null, 'HERO_SLIDE_NOT_FOUND');
        }

        if ($slide['status'] === 'inactive') {
            $this->success($slide, 'Hero slide is already inactive');
        }

        HomeHeroSlide::deactivate($slideId);
        $updated = HomeHeroSlide::findById($slideId);

        $userId = Request::getUserId();

        // Record audit log
        AuditService::log(
            $userId,
            'home_hero_slide_deactivate',
            'home_hero_slide',
            $slideId,
            ['status' => 'active'],
            ['status' => 'inactive']
        );

        $this->success($updated, 'Hero slide deactivated successfully');
    }

    /**
     * Parse arbitrary date/time string into standardized MySQL datetime format.
     *
     * @param string $dateStr
     * @return string|null
     */
    private function parseDateTime(string $dateStr): ?string
    {
        $formats = [
            'Y-m-d H:i:s',
            'Y-m-d\TH:i:s',
            'Y-m-d\TH:i',
            'Y-m-d H:i',
            'Y-m-d',
        ];

        foreach ($formats as $fmt) {
            $d = DateTime::createFromFormat($fmt, $dateStr);
            if ($d !== false) {
                return $d->format('Y-m-d H:i:s');
            }
        }

        // Try standard strtotime fallback
        $ts = strtotime($dateStr);
        if ($ts !== false) {
            return date('Y-m-d H:i:s', $ts);
        }

        return null;
    }
}
