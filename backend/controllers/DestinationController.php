<?php

namespace App\Controllers;

use App\Models\Destination;
use App\Models\Media;
use App\Services\AuditService;
use App\Utils\Request;
use Throwable;

class DestinationController extends BaseController
{
    /**
     * List paginated destinations with optional search and filters.
     * GET /api/v1/destinations
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
            'status' => $params['status'] ?? null,
            'is_featured' => $params['is_featured'] ?? null,
            'sort_by' => $params['sort_by'] ?? 'display_order',
            'order' => $params['order'] ?? 'ASC',
        ];

        $result = Destination::paginate($filters, $page, $limit);

        $this->success(
            $result['items'],
            'Destinations retrieved successfully',
            200,
            ['pagination' => $result['pagination']]
        );
    }

    /**
     * Retrieve a single destination by ID or unique slug.
     * GET /api/v1/destinations/{id}
     *
     * @param string $idOrSlug
     * @return void
     */
    public function show(string $idOrSlug): void
    {
        $idOrSlug = trim($idOrSlug);
        if ($idOrSlug === '') {
            $this->error('Destination identifier cannot be empty.', 400, null, 'INVALID_IDENTIFIER');
        }

        if (is_numeric($idOrSlug)) {
            $destination = Destination::findById((int) $idOrSlug);
        } else {
            $destination = Destination::findBySlug($idOrSlug);
        }

        if (!$destination) {
            $this->error('Destination not found.', 404, null, 'DESTINATION_NOT_FOUND');
        }

        $this->success($destination, 'Destination details retrieved successfully');
    }

    /**
     * Create a new destination.
     * POST /api/v1/destinations
     *
     * @return void
     */
    public function store(): void
    {
        $body = Request::getBody();
        $errors = [];

        // 1. Validate name
        $name = trim($body['name'] ?? '');
        if ($name === '') {
            $errors['name'] = 'Destination name is required.';
        } elseif (strlen($name) > 150) {
            $errors['name'] = 'Destination name cannot exceed 150 characters.';
        }

        // 2. Validate / Generate slug
        $slug = isset($body['slug']) ? trim((string) $body['slug']) : '';
        if ($slug !== '') {
            if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug)) {
                $errors['slug'] = 'Slug may only contain lowercase letters, numbers, and hyphens without consecutive or trailing hyphens.';
            } elseif (strlen($slug) > 191) {
                $errors['slug'] = 'Slug cannot exceed 191 characters.';
            } elseif (Destination::slugExists($slug)) {
                $errors['slug'] = "The slug '{$slug}' is already in use by another destination.";
            }
        } else {
            // Generate unique slug from name if valid name provided
            if ($name !== '') {
                $slug = Destination::generateUniqueSlug($name);
            }
        }

        // 3. Validate status
        $status = $body['status'] ?? 'draft';
        if (!in_array($status, Destination::ALLOWED_STATUSES, true)) {
            $errors['status'] = 'Invalid status. Allowed values: ' . implode(', ', Destination::ALLOWED_STATUSES) . '.';
        }

        // 4. Validate Media foreign references if provided
        $mediaFields = ['featured_image_id', 'intro_media_id', 'og_image_id'];
        foreach ($mediaFields as $field) {
            if (!empty($body[$field])) {
                $mediaId = (int) $body[$field];
                if (!Media::findById($mediaId)) {
                    $errors[$field] = "Referenced media ID [{$mediaId}] for [{$field}] does not exist.";
                }
            }
        }

        // 5. Validate coordinates
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
            $destinationData = [
                'name' => $name,
                'slug' => $slug,
                'hero_title' => $body['hero_title'] ?? null,
                'hero_subtitle' => $body['hero_subtitle'] ?? null,
                'short_description' => $body['short_description'] ?? null,
                'intro_heading' => $body['intro_heading'] ?? null,
                'intro_label' => $body['intro_label'] ?? null,
                'intro_content' => $body['intro_content'] ?? null,
                'intro_media_id' => !empty($body['intro_media_id']) ? (int) $body['intro_media_id'] : null,
                'language' => $body['language'] ?? null,
                'currency' => $body['currency'] ?? null,
                'religion' => $body['religion'] ?? null,
                'timezone' => $body['timezone'] ?? null,
                'latitude' => isset($body['latitude']) && $body['latitude'] !== '' ? (float) $body['latitude'] : null,
                'longitude' => isset($body['longitude']) && $body['longitude'] !== '' ? (float) $body['longitude'] : null,
                'featured_image_id' => !empty($body['featured_image_id']) ? (int) $body['featured_image_id'] : null,
                'seo_title' => $body['seo_title'] ?? null,
                'seo_description' => $body['seo_description'] ?? null,
                'og_image_id' => !empty($body['og_image_id']) ? (int) $body['og_image_id'] : null,
                'is_featured' => !empty($body['is_featured']) ? 1 : 0,
                'display_order' => isset($body['display_order']) ? (int) $body['display_order'] : 0,
                'status' => $status,
            ];

            $destinationId = Destination::create($destinationData);
            $destination = Destination::findById($destinationId);

            $userId = Request::getUserId();

            // Record audit log
            AuditService::log(
                $userId,
                'destination_create',
                'destination',
                $destinationId,
                null,
                [
                    'name' => $name,
                    'slug' => $slug,
                    'status' => $status,
                ]
            );

            $this->success($destination, 'Destination created successfully', 201);
        } catch (Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'CREATE_DESTINATION_FAILED');
        }
    }

    /**
     * Update an existing destination.
     * PUT /api/v1/destinations/{id} or PATCH /api/v1/destinations/{id}
     *
     * @param string $id
     * @return void
     */
    public function update(string $id): void
    {
        $destinationId = (int) $id;
        if ($destinationId <= 0) {
            $this->error('Invalid destination ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $existing = Destination::findById($destinationId);
        if (!$existing) {
            $this->error('Destination not found.', 404, null, 'DESTINATION_NOT_FOUND');
        }

        $body = Request::getBody();
        $errors = [];

        // 1. Validate name if provided
        if (array_key_exists('name', $body)) {
            $name = trim((string) $body['name']);
            if ($name === '') {
                $errors['name'] = 'Destination name cannot be blank.';
            } elseif (strlen($name) > 150) {
                $errors['name'] = 'Destination name cannot exceed 150 characters.';
            }
        }

        // 2. Validate slug if provided
        if (array_key_exists('slug', $body)) {
            $slug = trim((string) $body['slug']);
            if ($slug === '') {
                $errors['slug'] = 'Slug cannot be blank.';
            } elseif (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug)) {
                $errors['slug'] = 'Slug may only contain lowercase letters, numbers, and hyphens without consecutive or trailing hyphens.';
            } elseif (strlen($slug) > 191) {
                $errors['slug'] = 'Slug cannot exceed 191 characters.';
            } elseif (Destination::slugExists($slug, $destinationId)) {
                $errors['slug'] = "The slug '{$slug}' is already in use by another destination.";
            }
        }

        // 3. Validate status if provided
        if (array_key_exists('status', $body)) {
            $status = (string) $body['status'];
            if (!in_array($status, Destination::ALLOWED_STATUSES, true)) {
                $errors['status'] = 'Invalid status. Allowed values: ' . implode(', ', Destination::ALLOWED_STATUSES) . '.';
            }
        }

        // 4. Validate Media foreign references if provided
        $mediaFields = ['featured_image_id', 'intro_media_id', 'og_image_id'];
        foreach ($mediaFields as $field) {
            if (array_key_exists($field, $body) && !empty($body[$field])) {
                $mediaId = (int) $body[$field];
                if (!Media::findById($mediaId)) {
                    $errors[$field] = "Referenced media ID [{$mediaId}] for [{$field}] does not exist.";
                }
            }
        }

        // 5. Validate coordinates if provided
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
            Destination::update($destinationId, $body);
            $updated = Destination::findById($destinationId);

            $userId = Request::getUserId();

            // Record audit log
            AuditService::log(
                $userId,
                'destination_update',
                'destination',
                $destinationId,
                [
                    'name' => $existing['name'],
                    'slug' => $existing['slug'],
                    'status' => $existing['status'],
                ],
                [
                    'name' => $updated['name'],
                    'slug' => $updated['slug'],
                    'status' => $updated['status'],
                ]
            );

            $this->success($updated, 'Destination updated successfully');
        } catch (Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'UPDATE_DESTINATION_FAILED');
        }
    }

    /**
     * Delete destination (with dependency checking).
     * DELETE /api/v1/destinations/{id}
     *
     * @param string $id
     * @return void
     */
    public function destroy(string $id): void
    {
        $destinationId = (int) $id;
        if ($destinationId <= 0) {
            $this->error('Invalid destination ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $destination = Destination::findById($destinationId);
        if (!$destination) {
            $this->error('Destination not found.', 404, null, 'DESTINATION_NOT_FOUND');
        }

        // Check active usage references (e.g. tours)
        $references = Destination::getUsageReferences($destinationId);
        $isForce = strtolower((string) Request::getQueryParams('force', 'false')) === 'true';

        if (!empty($references['tours']) && !$isForce) {
            $this->error(
                "Destination cannot be deleted because it has {$references['tours']} active tour package(s) associated with it.",
                409,
                [
                    'usage_references' => $references,
                    'hint' => 'Reassign or archive associated tour packages before deleting this destination, or pass ?force=true if intentionally overriding.',
                ],
                'DESTINATION_IN_USE'
            );
        }

        $userId = Request::getUserId();

        Destination::delete($destinationId, $userId, $isForce);

        // Record audit log
        AuditService::log(
            $userId,
            $isForce ? 'destination_delete' : 'destination_soft_delete',
            'destination',
            $destinationId,
            [
                'name' => $destination['name'],
                'slug' => $destination['slug'],
                'status' => $destination['status'],
                'is_force' => $isForce,
            ],
            $isForce ? null : ['deleted_at' => date('Y-m-d H:i:s'), 'deleted_by' => $userId]
        );

        $this->success([
            'id' => $destinationId,
            'is_deleted' => true,
            'deleted_at' => date('Y-m-d H:i:s'),
            'deleted_by' => $userId,
        ], $isForce ? 'Destination permanently deleted' : 'Destination soft-deleted successfully');
    }

    /**
     * Restore a soft-deleted destination.
     * POST /api/v1/destinations/{id}/restore
     *
     * @param string $id
     * @return void
     */
    public function restore(string $id): void
    {
        $destinationId = (int) $id;
        if ($destinationId <= 0) {
            $this->error('Invalid destination ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $destination = Destination::findById($destinationId, true);
        if (!$destination) {
            $this->error('Destination not found.', 404, null, 'DESTINATION_NOT_FOUND');
        }

        if (empty($destination['deleted_at'])) {
            $this->success($destination, 'Destination is already active');
        }

        try {
            Destination::restore($destinationId);
            $restored = Destination::findById($destinationId);
            if (!$restored) {
                $restored = Destination::findById($destinationId, true) ?? [];
            }

            $userId = Request::getUserId();

            // Record audit log
            AuditService::log(
                $userId,
                'destination_restore',
                'destination',
                $destinationId,
                [
                    'deleted_at' => $destination['deleted_at'],
                    'deleted_by' => $destination['deleted_by'] ?? null,
                ],
                [
                    'name' => $restored['name'] ?? '',
                    'slug' => $restored['slug'] ?? '',
                    'status' => $restored['status'] ?? '',
                    'deleted_at' => null,
                    'deleted_by' => null,
                ]
            );

            $this->success($restored, 'Destination restored successfully');
        } catch (\Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'RESTORE_DESTINATION_FAILED');
        }
    }

    /**
     * Publish a destination.
     * POST /api/v1/destinations/{id}/publish or PATCH /api/v1/destinations/{id}/publish
     *
     * @param string $id
     * @return void
     */
    public function publish(string $id): void
    {
        $destinationId = (int) $id;
        if ($destinationId <= 0) {
            $this->error('Invalid destination ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $destination = Destination::findById($destinationId);
        if (!$destination) {
            $this->error('Destination not found.', 404, null, 'DESTINATION_NOT_FOUND');
        }

        if ($destination['status'] === 'published') {
            $this->success($destination, 'Destination is already published');
        }

        Destination::setStatus($destinationId, 'published');
        $updated = Destination::findById($destinationId);

        $userId = Request::getUserId();

        // Record audit log
        AuditService::log(
            $userId,
            'destination_publish',
            'destination',
            $destinationId,
            ['status' => $destination['status']],
            ['status' => 'published']
        );

        $this->success($updated, 'Destination published successfully');
    }

    /**
     * Unpublish / revert destination to draft.
     * POST /api/v1/destinations/{id}/unpublish or PATCH /api/v1/destinations/{id}/unpublish
     *
     * @param string $id
     * @return void
     */
    public function unpublish(string $id): void
    {
        $destinationId = (int) $id;
        if ($destinationId <= 0) {
            $this->error('Invalid destination ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $destination = Destination::findById($destinationId);
        if (!$destination) {
            $this->error('Destination not found.', 404, null, 'DESTINATION_NOT_FOUND');
        }

        if ($destination['status'] === 'draft') {
            $this->success($destination, 'Destination is already in draft status');
        }

        Destination::setStatus($destinationId, 'draft');
        $updated = Destination::findById($destinationId);

        $userId = Request::getUserId();

        // Record audit log
        AuditService::log(
            $userId,
            'destination_unpublish',
            'destination',
            $destinationId,
            ['status' => $destination['status']],
            ['status' => 'draft']
        );

        $this->success($updated, 'Destination unpublished (reverted to draft) successfully');
    }
}
