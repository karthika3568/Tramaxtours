<?php

namespace App\Controllers;

use App\Models\Media;
use App\Models\Testimonial;
use App\Services\AuditService;
use App\Utils\Request;
use Throwable;

class TestimonialController extends BaseController
{
    /**
     * List testimonials with optional filters.
     * GET /api/v1/testimonials
     * Public (no auth) like /destinations and /tours — the frontend service
     * layer defaults to status=active for public callers and the admin UI
     * passes status=all/inactive explicitly, matching the same convention
     * used by destinationService.js / tourService.js.
     *
     * @return void
     */
    public function index(): void
    {
        $params = Request::getQueryParams();

        $page = isset($params['page']) ? (int) $params['page'] : 1;
        $limit = isset($params['limit']) ? (int) $params['limit'] : (isset($params['per_page']) ? (int) $params['per_page'] : 20);

        $filters = [
            'status' => $params['status'] ?? null,
            'search' => $params['search'] ?? null,
            'sort_by' => $params['sort_by'] ?? 'display_order',
            'order' => $params['order'] ?? 'ASC',
        ];

        $result = Testimonial::paginate($filters, $page, $limit);

        $this->success(
            $result['items'],
            'Testimonials retrieved successfully',
            200,
            ['pagination' => $result['pagination']]
        );
    }

    /**
     * Get a single testimonial.
     * GET /api/v1/testimonials/{id}
     *
     * @param string $id
     * @return void
     */
    public function show(string $id): void
    {
        $testimonial = Testimonial::findById((int) $id);

        if (!$testimonial) {
            $this->error('Testimonial not found.', 404, null, 'TESTIMONIAL_NOT_FOUND');
        }

        $this->success($testimonial, 'Testimonial retrieved successfully');
    }

    /**
     * Create a testimonial.
     * POST /api/v1/testimonials
     * Permission: testimonials.manage
     *
     * @return void
     */
    public function store(): void
    {
        $body = Request::getBody();
        $errors = [];

        $clientName = trim((string) ($body['client_name'] ?? ''));
        if ($clientName === '') {
            $errors['client_name'] = 'Client name is required.';
        } elseif (mb_strlen($clientName) > 150) {
            $errors['client_name'] = 'Client name cannot exceed 150 characters.';
        }

        $message = trim((string) ($body['message'] ?? ''));
        if ($message === '') {
            $errors['message'] = 'Testimonial message is required.';
        }

        if (isset($body['rating']) && (!is_numeric($body['rating']) || $body['rating'] < 1 || $body['rating'] > 5)) {
            $errors['rating'] = 'Rating must be a number between 1 and 5.';
        }

        if (!empty($body['client_image_id']) && !Media::findById((int) $body['client_image_id'])) {
            $errors['client_image_id'] = "Referenced media ID [{$body['client_image_id']}] does not exist.";
        }

        if (isset($body['status']) && !in_array($body['status'], Testimonial::ALLOWED_STATUSES, true)) {
            $errors['status'] = 'Invalid status. Allowed values: ' . implode(', ', Testimonial::ALLOWED_STATUSES) . '.';
        }

        if (!empty($errors)) {
            $this->error('Validation failed. Please correct the errors in the request.', 422, $errors, 'VALIDATION_ERROR');
        }

        try {
            $data = [
                'client_name' => $clientName,
                'client_image_id' => $body['client_image_id'] ?? null,
                'message' => $message,
                'rating' => $body['rating'] ?? 5,
                'location' => $body['location'] ?? null,
                'display_order' => $body['display_order'] ?? 0,
                'status' => $body['status'] ?? 'active',
            ];

            $id = Testimonial::create($data);
            $testimonial = Testimonial::findById($id);

            $userId = Request::getUserId();
            AuditService::log($userId, 'testimonial_create', 'testimonial', $id, null, $data);

            $this->success($testimonial, 'Testimonial created successfully', 201);
        } catch (Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'CREATE_TESTIMONIAL_FAILED');
        }
    }

    /**
     * Update a testimonial.
     * PUT/PATCH /api/v1/testimonials/{id}
     * Permission: testimonials.manage
     *
     * @param string $id
     * @return void
     */
    public function update(string $id): void
    {
        $testimonialId = (int) $id;
        $existing = Testimonial::findById($testimonialId);

        if (!$existing) {
            $this->error('Testimonial not found.', 404, null, 'TESTIMONIAL_NOT_FOUND');
        }

        $body = Request::getBody();
        $errors = [];

        if (array_key_exists('client_name', $body) && trim((string) $body['client_name']) === '') {
            $errors['client_name'] = 'Client name cannot be blank.';
        }

        if (array_key_exists('message', $body) && trim((string) $body['message']) === '') {
            $errors['message'] = 'Testimonial message cannot be blank.';
        }

        if (array_key_exists('rating', $body) && (!is_numeric($body['rating']) || $body['rating'] < 1 || $body['rating'] > 5)) {
            $errors['rating'] = 'Rating must be a number between 1 and 5.';
        }

        if (array_key_exists('status', $body) && !in_array($body['status'], Testimonial::ALLOWED_STATUSES, true)) {
            $errors['status'] = 'Invalid status. Allowed values: ' . implode(', ', Testimonial::ALLOWED_STATUSES) . '.';
        }

        if (!empty($body['client_image_id']) && !Media::findById((int) $body['client_image_id'])) {
            $errors['client_image_id'] = "Referenced media ID [{$body['client_image_id']}] does not exist.";
        }

        if (!empty($errors)) {
            $this->error('Validation failed. Please correct the errors in the request.', 422, $errors, 'VALIDATION_ERROR');
        }

        try {
            Testimonial::update($testimonialId, $body);
            $updated = Testimonial::findById($testimonialId);

            $userId = Request::getUserId();
            AuditService::log($userId, 'testimonial_update', 'testimonial', $testimonialId, $existing, $updated);

            $this->success($updated, 'Testimonial updated successfully');
        } catch (Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'UPDATE_TESTIMONIAL_FAILED');
        }
    }

    /**
     * Delete (soft-delete) a testimonial.
     * DELETE /api/v1/testimonials/{id}
     * Permission: testimonials.manage
     *
     * @param string $id
     * @return void
     */
    public function destroy(string $id): void
    {
        $testimonialId = (int) $id;
        $testimonial = Testimonial::findById($testimonialId);

        if (!$testimonial) {
            $this->error('Testimonial not found.', 404, null, 'TESTIMONIAL_NOT_FOUND');
        }

        $isForce = strtolower((string) Request::getQueryParams('force', 'false')) === 'true';
        Testimonial::delete($testimonialId, $isForce);

        $userId = Request::getUserId();
        AuditService::log(
            $userId,
            $isForce ? 'testimonial_delete' : 'testimonial_soft_delete',
            'testimonial',
            $testimonialId,
            $testimonial,
            null
        );

        $this->success(null, 'Testimonial deleted successfully');
    }
}
