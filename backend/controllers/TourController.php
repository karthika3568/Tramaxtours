<?php

namespace App\Controllers;

use App\Models\Destination;
use App\Models\Media;
use App\Models\Tour;
use App\Services\AuditService;
use App\Utils\Request;
use Throwable;

class TourController extends BaseController
{
    /**
     * List paginated tours with search and filtering.
     * GET /api/v1/tours
     *
     * @return void
     */
    public function index(): void
    {
        $params = Request::getQueryParams();

        $page = isset($params['page']) ? (int) $params['page'] : 1;
        $limit = isset($params['limit']) ? (int) $params['limit'] : (isset($params['per_page']) ? (int) $params['per_page'] : 20);

        $filters = [
            'search' => $params['search'] ?? null,
            'destination_id' => $params['destination_id'] ?? null,
            'category_id' => $params['category_id'] ?? null,
            'status' => $params['status'] ?? null,
            'is_featured' => $params['is_featured'] ?? null,
            'tour_type' => $params['tour_type'] ?? null,
            'min_price' => $params['min_price'] ?? null,
            'max_price' => $params['max_price'] ?? null,
            'duration_days' => $params['duration_days'] ?? null,
            'sort_by' => $params['sort_by'] ?? 'display_order',
            'order' => $params['order'] ?? 'ASC',
        ];

        $result = Tour::paginate($filters, $page, $limit);

        $this->success(
            $result['items'],
            'Tours retrieved successfully',
            200,
            ['pagination' => $result['pagination']]
        );
    }

    /**
     * Retrieve a single tour by ID or unique slug.
     * GET /api/v1/tours/{id}
     *
     * @param string $id
     * @return void
     */
    public function show(string $id): void
    {
        $idOrSlug = trim($id);
        if ($idOrSlug === '') {
            $this->error('Tour identifier cannot be empty.', 400, null, 'INVALID_IDENTIFIER');
        }

        if (is_numeric($idOrSlug)) {
            $tour = Tour::findById((int) $idOrSlug);
        } else {
            $tour = Tour::findBySlug($idOrSlug);
        }

        if (!$tour) {
            $this->error('Tour not found.', 404, null, 'TOUR_NOT_FOUND');
        }

        $this->success($tour, 'Tour details retrieved successfully');
    }

    /**
     * Create a new tour.
     * POST /api/v1/tours
     *
     * @return void
     */
    public function store(): void
    {
        $body = Request::getBody();
        $errors = [];

        // 1. Validate title
        $title = trim($body['title'] ?? '');
        if ($title === '') {
            $errors['title'] = 'Tour title is required.';
        } elseif (strlen($title) > 255) {
            $errors['title'] = 'Tour title cannot exceed 255 characters.';
        }

        // 2. Validate destination_id
        $destId = isset($body['destination_id']) ? (int) $body['destination_id'] : 0;
        if ($destId <= 0) {
            $errors['destination_id'] = 'Valid destination_id is required.';
        } else {
            $dest = Destination::findById($destId);
            if (!$dest) {
                $errors['destination_id'] = "Referenced destination ID [{$destId}] does not exist.";
            }
        }

        // 3. Validate / Generate slug
        $slug = isset($body['slug']) ? trim((string) $body['slug']) : '';
        if ($slug !== '') {
            if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug)) {
                $errors['slug'] = 'Slug may only contain lowercase letters, numbers, and hyphens without consecutive or trailing hyphens.';
            } elseif (strlen($slug) > 191) {
                $errors['slug'] = 'Slug cannot exceed 191 characters.';
            } elseif (Tour::slugExists($slug)) {
                $errors['slug'] = "The slug '{$slug}' is already in use by another tour.";
            }
        } else {
            if ($title !== '') {
                $slug = Tour::generateUniqueSlug($title);
            }
        }

        // 4. Validate status
        $status = $body['status'] ?? 'draft';
        if (!in_array($status, Tour::ALLOWED_STATUSES, true)) {
            $errors['status'] = 'Invalid status. Allowed values: ' . implode(', ', Tour::ALLOWED_STATUSES) . '.';
        }

        // 5. Validate pricing & duration
        if (isset($body['base_price']) && (!is_numeric($body['base_price']) || (float) $body['base_price'] < 0)) {
            $errors['base_price'] = 'Base price must be a non-negative numeric value.';
        }
        if (isset($body['duration_days']) && (!is_numeric($body['duration_days']) || (int) $body['duration_days'] < 1)) {
            $errors['duration_days'] = 'Duration days must be an integer of at least 1.';
        }
        if (isset($body['min_persons']) && (!is_numeric($body['min_persons']) || (int) $body['min_persons'] < 1)) {
            $errors['min_persons'] = 'Minimum persons must be at least 1.';
        }
        if (isset($body['max_persons']) && (!is_numeric($body['max_persons']) || (int) $body['max_persons'] < 1)) {
            $errors['max_persons'] = 'Maximum persons must be at least 1.';
        }

        // 6. Validate Media references
        $mediaFields = ['featured_image_id', 'og_image_id'];
        foreach ($mediaFields as $field) {
            if (!empty($body[$field])) {
                $mediaId = (int) $body[$field];
                if (!Media::findById($mediaId)) {
                    $errors[$field] = "Referenced media ID [{$mediaId}] for [{$field}] does not exist.";
                }
            }
        }

        // 7. Validate coordinates
        if (isset($body['latitude']) && $body['latitude'] !== '' && $body['latitude'] !== null) {
            $lat = (float) $body['latitude'];
            if ($lat < -90.0 || $lat > 90.0) {
                $errors['latitude'] = 'Latitude must be between -90.0 and 90.0 degrees.';
            }
        }
        if (isset($body['longitude']) && $body['longitude'] !== '' && $body['longitude'] !== null) {
            $lng = (float) $body['longitude'];
            if ($lng < -180.0 || $lng > 180.0) {
                $errors['longitude'] = 'Longitude must be between -180.0 and 180.0 degrees.';
            }
        }

        if (!empty($errors)) {
            $this->error('Validation failed. Please correct the errors in the request.', 422, $errors, 'VALIDATION_ERROR');
        }

        try {
            $categoryIds = isset($body['category_ids']) && is_array($body['category_ids']) ? array_map('intval', $body['category_ids']) : [];

            $tourData = [
                'destination_id' => $destId,
                'title' => $title,
                'slug' => $slug,
                'short_description' => $body['short_description'] ?? null,
                'overview' => $body['overview'] ?? null,
                'tour_type' => $body['tour_type'] ?? null,
                'duration_text' => $body['duration_text'] ?? null,
                'duration_hours' => isset($body['duration_hours']) && $body['duration_hours'] !== '' ? (float) $body['duration_hours'] : null,
                'duration_days' => isset($body['duration_days']) ? max(1, (int) $body['duration_days']) : 1,
                'languages' => $body['languages'] ?? null,
                'featured_image_id' => !empty($body['featured_image_id']) ? (int) $body['featured_image_id'] : null,
                'base_price' => isset($body['base_price']) ? (float) $body['base_price'] : 0.00,
                'currency' => !empty($body['currency']) ? trim((string) $body['currency']) : 'EUR',
                'min_persons' => isset($body['min_persons']) ? max(1, (int) $body['min_persons']) : 1,
                'max_persons' => !empty($body['max_persons']) ? (int) $body['max_persons'] : null,
                'map_title' => $body['map_title'] ?? null,
                'latitude' => isset($body['latitude']) && $body['latitude'] !== '' ? (float) $body['latitude'] : null,
                'longitude' => isset($body['longitude']) && $body['longitude'] !== '' ? (float) $body['longitude'] : null,
                'map_zoom' => isset($body['map_zoom']) ? (int) $body['map_zoom'] : 13,
                'seo_title' => $body['seo_title'] ?? null,
                'seo_description' => $body['seo_description'] ?? null,
                'canonical_url' => $body['canonical_url'] ?? null,
                'og_image_id' => !empty($body['og_image_id']) ? (int) $body['og_image_id'] : null,
                'is_featured' => !empty($body['is_featured']) ? 1 : 0,
                'display_order' => isset($body['display_order']) ? (int) $body['display_order'] : 0,
                'status' => $status,
            ];

            $tourId = Tour::create($tourData, $categoryIds);
            $tour = Tour::findById($tourId);

            $userId = Request::getUserId();

            // Record audit log
            AuditService::log(
                $userId,
                'tour_create',
                'tour',
                $tourId,
                null,
                [
                    'title' => $title,
                    'slug' => $slug,
                    'destination_id' => $destId,
                    'status' => $status,
                    'base_price' => $tourData['base_price'],
                ]
            );

            $this->success($tour, 'Tour created successfully', 201);
        } catch (Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'CREATE_TOUR_FAILED');
        }
    }

    /**
     * Update an existing tour.
     * PUT /api/v1/tours/{id} or PATCH /api/v1/tours/{id}
     *
     * @param string $id
     * @return void
     */
    public function update(string $id): void
    {
        $tourId = (int) $id;
        if ($tourId <= 0) {
            $this->error('Invalid tour ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $existing = Tour::findById($tourId);
        if (!$existing) {
            $this->error('Tour not found.', 404, null, 'TOUR_NOT_FOUND');
        }

        $body = Request::getBody();
        $errors = [];

        // 1. Validate title if provided
        if (array_key_exists('title', $body)) {
            $title = trim((string) $body['title']);
            if ($title === '') {
                $errors['title'] = 'Tour title cannot be blank.';
            } elseif (strlen($title) > 255) {
                $errors['title'] = 'Tour title cannot exceed 255 characters.';
            }
        }

        // 2. Validate destination_id if provided
        if (array_key_exists('destination_id', $body)) {
            $destId = (int) $body['destination_id'];
            if ($destId <= 0 || !Destination::findById($destId)) {
                $errors['destination_id'] = "Referenced destination ID [{$destId}] does not exist.";
            }
        }

        // 3. Validate slug if provided
        if (array_key_exists('slug', $body)) {
            $slug = trim((string) $body['slug']);
            if ($slug === '') {
                $errors['slug'] = 'Slug cannot be blank.';
            } elseif (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug)) {
                $errors['slug'] = 'Slug may only contain lowercase letters, numbers, and hyphens without consecutive or trailing hyphens.';
            } elseif (strlen($slug) > 191) {
                $errors['slug'] = 'Slug cannot exceed 191 characters.';
            } elseif (Tour::slugExists($slug, $tourId)) {
                $errors['slug'] = "The slug '{$slug}' is already in use by another tour.";
            }
        }

        // 4. Validate status if provided
        if (array_key_exists('status', $body)) {
            $status = (string) $body['status'];
            if (!in_array($status, Tour::ALLOWED_STATUSES, true)) {
                $errors['status'] = 'Invalid status. Allowed values: ' . implode(', ', Tour::ALLOWED_STATUSES) . '.';
            }
        }

        // 5. Validate pricing & numeric fields if provided
        if (array_key_exists('base_price', $body) && (!is_numeric($body['base_price']) || (float) $body['base_price'] < 0)) {
            $errors['base_price'] = 'Base price must be a non-negative numeric value.';
        }
        if (array_key_exists('duration_days', $body) && (!is_numeric($body['duration_days']) || (int) $body['duration_days'] < 1)) {
            $errors['duration_days'] = 'Duration days must be at least 1.';
        }

        // 6. Validate Media references if provided
        $mediaFields = ['featured_image_id', 'og_image_id'];
        foreach ($mediaFields as $field) {
            if (array_key_exists($field, $body) && !empty($body[$field])) {
                $mediaId = (int) $body[$field];
                if (!Media::findById($mediaId)) {
                    $errors[$field] = "Referenced media ID [{$mediaId}] for [{$field}] does not exist.";
                }
            }
        }

        // 7. Validate coordinates if provided
        if (array_key_exists('latitude', $body) && $body['latitude'] !== '' && $body['latitude'] !== null) {
            $lat = (float) $body['latitude'];
            if ($lat < -90.0 || $lat > 90.0) {
                $errors['latitude'] = 'Latitude must be between -90.0 and 90.0 degrees.';
            }
        }
        if (array_key_exists('longitude', $body) && $body['longitude'] !== '' && $body['longitude'] !== null) {
            $lng = (float) $body['longitude'];
            if ($lng < -180.0 || $lng > 180.0) {
                $errors['longitude'] = 'Longitude must be between -180.0 and 180.0 degrees.';
            }
        }

        if (!empty($errors)) {
            $this->error('Validation failed. Please correct the errors in the request.', 422, $errors, 'VALIDATION_ERROR');
        }

        try {
            $categoryIds = array_key_exists('category_ids', $body) && is_array($body['category_ids'])
                ? array_map('intval', $body['category_ids'])
                : null;

            Tour::update($tourId, $body, $categoryIds);
            $updated = Tour::findById($tourId);

            $userId = Request::getUserId();

            // Record audit log
            AuditService::log(
                $userId,
                'tour_update',
                'tour',
                $tourId,
                [
                    'title' => $existing['title'],
                    'slug' => $existing['slug'],
                    'status' => $existing['status'],
                    'base_price' => $existing['base_price'],
                ],
                [
                    'title' => $updated['title'],
                    'slug' => $updated['slug'],
                    'status' => $updated['status'],
                    'base_price' => $updated['base_price'],
                ]
            );

            $this->success($updated, 'Tour updated successfully');
        } catch (Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'UPDATE_TOUR_FAILED');
        }
    }

    /**
     * Delete a tour (with booking dependency checking).
     * DELETE /api/v1/tours/{id}
     *
     * @param string $id
     * @return void
     */
    public function destroy(string $id): void
    {
        $tourId = (int) $id;
        if ($tourId <= 0) {
            $this->error('Invalid tour ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $tour = Tour::findById($tourId);
        if (!$tour) {
            $this->error('Tour not found.', 404, null, 'TOUR_NOT_FOUND');
        }

        // Check active bookings referencing this tour
        $references = Tour::getUsageReferences($tourId);
        $isForce = strtolower((string) Request::getQueryParams('force', 'false')) === 'true';

        if (!empty($references['bookings']) && !$isForce) {
            $this->error(
                "Tour cannot be deleted because it has {$references['bookings']} active customer booking(s) associated with it.",
                409,
                [
                    'usage_references' => $references,
                    'hint' => 'Manage or archive associated customer bookings before deleting this tour, or pass ?force=true if intentionally overriding.',
                ],
                'TOUR_IN_USE'
            );
        }

        $userId = Request::getUserId();

        Tour::delete($tourId, $userId, $isForce);

        // Record audit log
        AuditService::log(
            $userId,
            $isForce ? 'tour_delete' : 'tour_soft_delete',
            'tour',
            $tourId,
            [
                'title' => $tour['title'],
                'slug' => $tour['slug'],
                'status' => $tour['status'],
                'is_force' => $isForce,
            ],
            $isForce ? null : ['deleted_at' => date('Y-m-d H:i:s'), 'deleted_by' => $userId]
        );

        $this->success([
            'id' => $tourId,
            'is_deleted' => true,
            'deleted_at' => date('Y-m-d H:i:s'),
            'deleted_by' => $userId,
        ], $isForce ? 'Tour permanently deleted' : 'Tour soft-deleted successfully');
    }

    /**
     * Restore a soft-deleted tour.
     * POST /api/v1/tours/{id}/restore
     *
     * @param string $id
     * @return void
     */
    public function restore(string $id): void
    {
        $tourId = (int) $id;
        if ($tourId <= 0) {
            $this->error('Invalid tour ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $tour = Tour::findById($tourId, true);
        if (!$tour) {
            $this->error('Tour not found.', 404, null, 'TOUR_NOT_FOUND');
        }

        if (empty($tour['deleted_at'])) {
            $this->success($tour, 'Tour is already active');
        }

        try {
            Tour::restore($tourId);
            $restored = Tour::findById($tourId);
            if (!$restored) {
                $restored = Tour::findById($tourId, true) ?? [];
            }

            $userId = Request::getUserId();

            // Record audit log
            AuditService::log(
                $userId,
                'tour_restore',
                'tour',
                $tourId,
                [
                    'deleted_at' => $tour['deleted_at'],
                    'deleted_by' => $tour['deleted_by'] ?? null,
                ],
                [
                    'title' => $restored['title'] ?? '',
                    'slug' => $restored['slug'] ?? '',
                    'status' => $restored['status'] ?? '',
                    'deleted_at' => null,
                    'deleted_by' => null,
                ]
            );

            $this->success($restored, 'Tour restored successfully');
        } catch (\Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'RESTORE_TOUR_FAILED');
        }
    }

    /**
     * Publish a tour.
     * POST /api/v1/tours/{id}/publish or PATCH /api/v1/tours/{id}/publish
     *
     * @param string $id
     * @return void
     */
    public function publish(string $id): void
    {
        $tourId = (int) $id;
        if ($tourId <= 0) {
            $this->error('Invalid tour ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $tour = Tour::findById($tourId);
        if (!$tour) {
            $this->error('Tour not found.', 404, null, 'TOUR_NOT_FOUND');
        }

        if ($tour['status'] === 'published') {
            $this->success($tour, 'Tour is already published');
        }

        Tour::setStatus($tourId, 'published');
        $updated = Tour::findById($tourId);

        $userId = Request::getUserId();

        // Record audit log
        AuditService::log(
            $userId,
            'tour_publish',
            'tour',
            $tourId,
            ['status' => $tour['status']],
            ['status' => 'published']
        );

        $this->success($updated, 'Tour published successfully');
    }

    /**
     * Unpublish / revert tour to draft.
     * POST /api/v1/tours/{id}/unpublish or PATCH /api/v1/tours/{id}/unpublish
     *
     * @param string $id
     * @return void
     */
    public function unpublish(string $id): void
    {
        $tourId = (int) $id;
        if ($tourId <= 0) {
            $this->error('Invalid tour ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $tour = Tour::findById($tourId);
        if (!$tour) {
            $this->error('Tour not found.', 404, null, 'TOUR_NOT_FOUND');
        }

        if ($tour['status'] === 'draft') {
            $this->success($tour, 'Tour is already in draft status');
        }

        Tour::setStatus($tourId, 'draft');
        $updated = Tour::findById($tourId);

        $userId = Request::getUserId();

        // Record audit log
        AuditService::log(
            $userId,
            'tour_unpublish',
            'tour',
            $tourId,
            ['status' => $tour['status']],
            ['status' => 'draft']
        );

        $this->success($updated, 'Tour unpublished (reverted to draft) successfully');
    }

    /**
     * List all tour categories.
     * GET /api/v1/tour-categories
     *
     * @return void
     */
    public function categories(): void
    {
        try {
            $pdo = \App\Utils\Database::getConnection();
            $stmt = $pdo->query('SELECT id, name, slug, description, badge_color, icon, display_order FROM tour_categories ORDER BY display_order ASC, id ASC');
            $categories = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            $this->success($categories, 'Tour categories fetched successfully');
        } catch (\Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'FETCH_CATEGORIES_FAILED');
        }
    }
}

