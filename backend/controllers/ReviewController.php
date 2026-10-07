<?php

namespace App\Controllers;

use App\Models\Media;
use App\Models\Review;
use App\Models\Tour;
use App\Models\User;
use App\Services\AuditService;
use App\Utils\Request;

class ReviewController extends BaseController
{
    /**
     * List reviews with search, filtering, whitelist sorting, and pagination.
     * GET /api/v1/reviews
     * Permission: reviews.view
     *
     * @return void
     */
    public function index(): void
    {
        $queryParams = Request::getQueryParams();

        $page = max(1, (int) ($queryParams['page'] ?? 1));
        $limit = max(1, min(200, (int) ($queryParams['limit'] ?? 50)));

        $filters = [
            'search' => trim((string) ($queryParams['search'] ?? '')),
            'tour_id' => isset($queryParams['tour_id']) && is_numeric($queryParams['tour_id']) ? (int) $queryParams['tour_id'] : null,
            'status' => trim((string) ($queryParams['status'] ?? '')),
            'rating' => isset($queryParams['rating']) && is_numeric($queryParams['rating']) ? (int) $queryParams['rating'] : null,
            'is_featured' => isset($queryParams['is_featured']) ? $queryParams['is_featured'] : null,
            'sort_by' => trim((string) ($queryParams['sort_by'] ?? ($queryParams['sort'] ?? 'created_at'))),
            'sort_order' => trim((string) ($queryParams['sort_order'] ?? ($queryParams['order'] ?? 'DESC'))),
            'page' => $page,
            'limit' => $limit,
        ];

        $reviews = Review::list($filters);
        $total = Review::count($filters);
        $totalPages = (int) ceil($total / $limit);

        $this->success(
            $reviews,
            'Reviews retrieved successfully',
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
     * Retrieve complete details for a single review by ID.
     * GET /api/v1/reviews/{id}
     * Permission: reviews.view
     *
     * @param string $id
     * @return void
     */
    public function show(string $id): void
    {
        $reviewId = (int) $id;
        if ($reviewId <= 0) {
            $this->error('Invalid review ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $review = Review::findById($reviewId);
        if (!$review) {
            $this->error('Review not found or has been deactivated.', 404, null, 'REVIEW_NOT_FOUND');
        }

        $this->success($review, 'Review details retrieved successfully');
    }

    /**
     * Create a new review.
     * POST /api/v1/reviews
     * Permission: reviews.moderate
     *
     * @return void
     */
    public function store(): void
    {
        $data = Request::getBody();
        $errors = [];

        // 1. Tour ID Validation (Optional for standalone testimonials)
        $tourId = null;
        if (isset($data['tour_id']) && is_numeric($data['tour_id']) && (int) $data['tour_id'] > 0) {
            $tId = (int) $data['tour_id'];
            $tour = Tour::findById($tId);
            if ($tour) {
                $tourId = $tId;
            }
        }
        if (!$tourId) {
            // Pick first active tour as default associated package
            $firstTour = Tour::fetchOne('SELECT `id` FROM `tours` WHERE `deleted_at` IS NULL ORDER BY `id` ASC LIMIT 1');
            $tourId = $firstTour ? (int) $firstTour['id'] : 1;
        }

        // 2. User ID Validation (Optional)
        $userId = null;
        if (isset($data['user_id']) && $data['user_id'] !== '' && $data['user_id'] !== null) {
            $userId = (int) $data['user_id'];
            $user = User::findById($userId);
            if (!$user) {
                $errors['user_id'] = "Referenced user ID [{$userId}] does not exist.";
            }
        }

        // 3. Customer Name
        $customerName = trim((string) ($data['customer_name'] ?? ''));
        if (empty($customerName)) {
            $errors['customer_name'] = 'Customer name is required.';
        } elseif (mb_strlen($customerName) > 150) {
            $errors['customer_name'] = 'Customer name cannot exceed 150 characters.';
        }

        // 4. Customer Email
        $customerEmail = trim((string) ($data['customer_email'] ?? ''));
        if (empty($customerEmail)) {
            $errors['customer_email'] = 'Customer email is required.';
        } elseif (!filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
            $errors['customer_email'] = 'A valid customer email address is required.';
        } elseif (mb_strlen($customerEmail) > 191) {
            $errors['customer_email'] = 'Customer email cannot exceed 191 characters.';
        }

        // 5. Customer Country (Optional)
        $customerCountry = isset($data['customer_country']) ? trim((string) $data['customer_country']) : null;
        if ($customerCountry !== null && mb_strlen($customerCountry) > 100) {
            $errors['customer_country'] = 'Customer country cannot exceed 100 characters.';
        }

        // 6. Rating (1..5)
        if (!isset($data['rating']) || !is_numeric($data['rating'])) {
            $errors['rating'] = 'Rating is required and must be an integer between 1 and 5.';
        } else {
            $rating = (int) $data['rating'];
            if ($rating < 1 || $rating > 5) {
                $errors['rating'] = 'Rating must be an integer between 1 and 5.';
            }
        }

        // 7. Title (Optional)
        $title = isset($data['title']) ? trim((string) $data['title']) : null;
        if ($title !== null && mb_strlen($title) > 255) {
            $errors['title'] = 'Title cannot exceed 255 characters.';
        }

        // 8. Content
        $content = trim((string) ($data['content'] ?? ''));
        if (empty($content)) {
            $errors['content'] = 'Review content is required.';
        }

        // 9. Status
        $status = trim((string) ($data['status'] ?? 'pending'));
        if (!in_array($status, Review::ALLOWED_STATUSES, true)) {
            $errors['status'] = 'Invalid status. Allowed values: ' . implode(', ', Review::ALLOWED_STATUSES) . '.';
        }

        // 10. Is Featured
        $isFeatured = !empty($data['is_featured']) ? 1 : 0;

        // 11. Media IDs
        $mediaIds = [];
        if (isset($data['media_ids'])) {
            if (!is_array($data['media_ids'])) {
                $errors['media_ids'] = 'media_ids must be an array of numeric media IDs.';
            } else {
                $mediaIds = array_values(array_unique(array_filter(array_map('intval', $data['media_ids']))));
                foreach ($mediaIds as $mId) {
                    if (!Media::findById($mId)) {
                        $errors['media_ids'] = "Referenced media ID [{$mId}] does not exist.";
                        break;
                    }
                }
            }
        }

        if (!empty($errors)) {
            $this->error('Review validation failed.', 422, $errors, 'VALIDATION_ERROR');
        }

        try {
            $authUserId = Request::getUserId();

            $reviewData = [
                'tour_id' => (int) $tourId,
                'user_id' => $userId,
                'customer_name' => $customerName,
                'customer_email' => $customerEmail,
                'customer_country' => $customerCountry,
                'rating' => (int) $data['rating'],
                'title' => $title,
                'content' => $content,
                'image' => !empty($data['image']) ? trim((string) $data['image']) : (!empty($data['image_url']) ? trim((string) $data['image_url']) : null),
                'status' => $status,
                'is_featured' => $isFeatured,
                'moderated_by' => $status !== 'pending' ? $authUserId : null,
                'moderated_at' => $status !== 'pending' ? date('Y-m-d H:i:s') : null,
            ];

            $reviewId = Review::create($reviewData, $mediaIds);
            $newReview = Review::findById($reviewId);

            // Record audit log
            AuditService::log(
                $authUserId,
                'review_create',
                'review',
                $reviewId,
                null,
                [
                    'tour_id' => $reviewData['tour_id'],
                    'customer_name' => $customerName,
                    'customer_email' => $customerEmail,
                    'rating' => $reviewData['rating'],
                    'status' => $status,
                    'is_featured' => $isFeatured,
                    'media_ids' => $mediaIds,
                ]
            );

            $this->success($newReview, 'Review created successfully', 201);
        } catch (\Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'REVIEW_CREATE_FAILED');
        }
    }

    /**
     * Update an existing review (PUT / PATCH).
     * PUT /api/v1/reviews/{id} or PATCH /api/v1/reviews/{id}
     * Permission: reviews.moderate
     *
     * @param string $id
     * @return void
     */
    public function update(string $id): void
    {
        $reviewId = (int) $id;
        if ($reviewId <= 0) {
            $this->error('Invalid review ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $existing = Review::findById($reviewId);
        if (!$existing) {
            $this->error('Review not found.', 404, null, 'REVIEW_NOT_FOUND');
        }

        $data = Request::getBody();
        $errors = [];
        $updatePayload = [];
        $mediaIdsToSync = null;

        // Tour ID
        if (array_key_exists('tour_id', $data)) {
            if (!is_numeric($data['tour_id']) || (int) $data['tour_id'] <= 0) {
                $errors['tour_id'] = 'Valid tour ID is required.';
            } else {
                $tourId = (int) $data['tour_id'];
                $tour = Tour::findById($tourId);
                if (!$tour) {
                    $errors['tour_id'] = "Referenced tour ID [{$tourId}] does not exist or has been deleted.";
                } else {
                    $updatePayload['tour_id'] = $tourId;
                }
            }
        }

        // User ID
        if (array_key_exists('user_id', $data)) {
            if ($data['user_id'] !== null && $data['user_id'] !== '') {
                $uId = (int) $data['user_id'];
                $user = User::findById($uId);
                if (!$user) {
                    $errors['user_id'] = "Referenced user ID [{$uId}] does not exist.";
                } else {
                    $updatePayload['user_id'] = $uId;
                }
            } else {
                $updatePayload['user_id'] = null;
            }
        }

        // Customer Name
        if (array_key_exists('customer_name', $data)) {
            $name = trim((string) $data['customer_name']);
            if (empty($name)) {
                $errors['customer_name'] = 'Customer name cannot be empty.';
            } elseif (mb_strlen($name) > 150) {
                $errors['customer_name'] = 'Customer name cannot exceed 150 characters.';
            } else {
                $updatePayload['customer_name'] = $name;
            }
        }

        // Customer Email
        if (array_key_exists('customer_email', $data)) {
            $email = trim((string) $data['customer_email']);
            if (empty($email)) {
                $errors['customer_email'] = 'Customer email cannot be empty.';
            } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $errors['customer_email'] = 'A valid customer email address is required.';
            } elseif (mb_strlen($email) > 191) {
                $errors['customer_email'] = 'Customer email cannot exceed 191 characters.';
            } else {
                $updatePayload['customer_email'] = $email;
            }
        }

        // Customer Country
        if (array_key_exists('customer_country', $data)) {
            $country = $data['customer_country'] !== null ? trim((string) $data['customer_country']) : null;
            if ($country !== null && mb_strlen($country) > 100) {
                $errors['customer_country'] = 'Customer country cannot exceed 100 characters.';
            } else {
                $updatePayload['customer_country'] = $country;
            }
        }

        // Rating
        if (array_key_exists('rating', $data)) {
            if (!is_numeric($data['rating'])) {
                $errors['rating'] = 'Rating must be an integer between 1 and 5.';
            } else {
                $rating = (int) $data['rating'];
                if ($rating < 1 || $rating > 5) {
                    $errors['rating'] = 'Rating must be an integer between 1 and 5.';
                } else {
                    $updatePayload['rating'] = $rating;
                }
            }
        }

        // Title
        if (array_key_exists('title', $data)) {
            $title = $data['title'] !== null ? trim((string) $data['title']) : null;
            if ($title !== null && mb_strlen($title) > 255) {
                $errors['title'] = 'Title cannot exceed 255 characters.';
            } else {
                $updatePayload['title'] = $title;
            }
        }

        // Content
        if (array_key_exists('content', $data)) {
            $content = trim((string) $data['content']);
            if (empty($content)) {
                $errors['content'] = 'Review content cannot be empty.';
            } else {
                $updatePayload['content'] = $content;
            }
        }

        // Image / Avatar
        if (array_key_exists('image', $data) || array_key_exists('image_url', $data)) {
            $img = array_key_exists('image', $data) ? $data['image'] : $data['image_url'];
            $updatePayload['image'] = $img !== null && $img !== '' ? trim((string) $img) : null;
        }

        // Status
        if (array_key_exists('status', $data)) {
            $status = trim((string) $data['status']);
            if (!in_array($status, Review::ALLOWED_STATUSES, true)) {
                $errors['status'] = 'Invalid status. Allowed values: ' . implode(', ', Review::ALLOWED_STATUSES) . '.';
            } else {
                $updatePayload['status'] = $status;
                if ($status !== 'pending' && $existing['status'] === 'pending') {
                    $authUserId = Request::getUserId();
                    $updatePayload['moderated_by'] = $authUserId;
                    $updatePayload['moderated_at'] = date('Y-m-d H:i:s');
                }
            }
        }

        // Is Featured
        if (array_key_exists('is_featured', $data)) {
            $updatePayload['is_featured'] = !empty($data['is_featured']) ? 1 : 0;
        }

        // Media IDs
        if (array_key_exists('media_ids', $data)) {
            if (!is_array($data['media_ids'])) {
                $errors['media_ids'] = 'media_ids must be an array of numeric media IDs.';
            } else {
                $mIds = array_values(array_unique(array_filter(array_map('intval', $data['media_ids']))));
                foreach ($mIds as $mId) {
                    if (!Media::findById($mId)) {
                        $errors['media_ids'] = "Referenced media ID [{$mId}] does not exist.";
                        break;
                    }
                }
                $mediaIdsToSync = $mIds;
            }
        }

        if (!empty($errors)) {
            $this->error('Review update validation failed.', 422, $errors, 'VALIDATION_ERROR');
        }

        if (empty($updatePayload) && $mediaIdsToSync === null) {
            $this->success($existing, 'No changes submitted for review update.');
        }

        try {
            Review::update($reviewId, $updatePayload, $mediaIdsToSync);
            $updated = Review::findById($reviewId);

            $userId = Request::getUserId();

            // Record audit log
            AuditService::log(
                $userId,
                'review_update',
                'review',
                $reviewId,
                [
                    'tour_id' => $existing['tour_id'],
                    'customer_name' => $existing['customer_name'],
                    'rating' => $existing['rating'],
                    'status' => $existing['status'],
                    'is_featured' => $existing['is_featured'],
                    'media_ids' => $existing['media_ids'] ?? [],
                ],
                array_merge($updatePayload, $mediaIdsToSync !== null ? ['media_ids' => $mediaIdsToSync] : [])
            );

            $this->success($updated, 'Review updated successfully');
        } catch (\Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'REVIEW_UPDATE_FAILED');
        }
    }

    /**
     * Reversible soft-delete for a review.
     * DELETE /api/v1/reviews/{id}
     * Permission: reviews.moderate
     *
     * @param string $id
     * @return void
     */
    public function destroy(string $id): void
    {
        $reviewId = (int) $id;
        if ($reviewId <= 0) {
            $this->error('Invalid review ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $review = Review::findById($reviewId);
        if (!$review) {
            $this->error('Review not found.', 404, null, 'REVIEW_NOT_FOUND');
        }

        $queryParams = Request::getQueryParams();
        $isForce = isset($queryParams['force']) && in_array(strtolower((string) $queryParams['force']), ['true', '1'], true);

        $userId = Request::getUserId();

        Review::softDelete($reviewId, $userId, $isForce);

        // Record audit log
        AuditService::log(
            $userId,
            $isForce ? 'review_delete' : 'review_soft_delete',
            'review',
            $reviewId,
            [
                'tour_id' => $review['tour_id'],
                'customer_name' => $review['customer_name'],
                'rating' => $review['rating'],
                'status' => $review['status'],
                'is_force' => $isForce,
            ],
            $isForce ? null : ['deleted_at' => date('Y-m-d H:i:s'), 'deleted_by' => $userId]
        );

        $this->success([
            'id' => $reviewId,
            'is_deleted' => true,
            'deleted_at' => date('Y-m-d H:i:s'),
            'deleted_by' => $userId,
        ], $isForce ? 'Review permanently deleted' : 'Review soft-deleted successfully');
    }

    /**
     * Restore a soft-deleted review.
     * POST /api/v1/reviews/{id}/restore or PATCH /api/v1/reviews/{id}/restore
     * Permission: reviews.moderate
     *
     * @param string $id
     * @return void
     */
    public function restore(string $id): void
    {
        $reviewId = (int) $id;
        if ($reviewId <= 0) {
            $this->error('Invalid review ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $review = Review::findById($reviewId, true);
        if (!$review) {
            $this->error('Review not found.', 404, null, 'REVIEW_NOT_FOUND');
        }

        if (empty($review['deleted_at'])) {
            $this->success($review, 'Review is already active');
        }

        try {
            Review::restore($reviewId);
            $restored = Review::findById($reviewId);
            if (!$restored) {
                $restored = Review::findById($reviewId, true) ?? [];
            }

            $userId = Request::getUserId();

            // Record audit log
            AuditService::log(
                $userId,
                'review_restore',
                'review',
                $reviewId,
                [
                    'deleted_at' => $review['deleted_at'],
                    'deleted_by' => $review['deleted_by'] ?? null,
                ],
                [
                    'tour_id' => $restored['tour_id'] ?? null,
                    'customer_name' => $restored['customer_name'] ?? '',
                    'status' => $restored['status'] ?? '',
                    'deleted_at' => null,
                    'deleted_by' => null,
                ]
            );

            $this->success($restored, 'Review restored successfully');
        } catch (\Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'REVIEW_RESTORE_FAILED');
        }
    }

    /**
     * Approve review.
     * POST /api/v1/reviews/{id}/approve or PATCH /api/v1/reviews/{id}/approve
     * Permission: reviews.moderate
     *
     * @param string $id
     * @return void
     */
    public function approve(string $id): void
    {
        $reviewId = (int) $id;
        if ($reviewId <= 0) {
            $this->error('Invalid review ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $review = Review::findById($reviewId);
        if (!$review) {
            $this->error('Review not found or is currently soft-deleted.', 404, null, 'REVIEW_NOT_FOUND');
        }

        $userId = Request::getUserId();

        Review::approve($reviewId, (int) $userId);
        $updated = Review::findById($reviewId);

        // Record audit log
        AuditService::log(
            $userId,
            'review_approve',
            'review',
            $reviewId,
            [
                'status' => $review['status'],
                'moderated_by' => $review['moderated_by'],
                'moderated_at' => $review['moderated_at'],
            ],
            [
                'status' => 'approved',
                'moderated_by' => $userId,
                'moderated_at' => $updated['moderated_at'] ?? date('Y-m-d H:i:s'),
            ]
        );

        $this->success($updated, 'Review approved successfully');
    }

    /**
     * Reject review.
     * POST /api/v1/reviews/{id}/reject or PATCH /api/v1/reviews/{id}/reject
     * Permission: reviews.moderate
     *
     * @param string $id
     * @return void
     */
    public function reject(string $id): void
    {
        $reviewId = (int) $id;
        if ($reviewId <= 0) {
            $this->error('Invalid review ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $review = Review::findById($reviewId);
        if (!$review) {
            $this->error('Review not found or is currently soft-deleted.', 404, null, 'REVIEW_NOT_FOUND');
        }

        $userId = Request::getUserId();

        Review::reject($reviewId, (int) $userId);
        $updated = Review::findById($reviewId);

        // Record audit log
        AuditService::log(
            $userId,
            'review_reject',
            'review',
            $reviewId,
            [
                'status' => $review['status'],
                'moderated_by' => $review['moderated_by'],
                'moderated_at' => $review['moderated_at'],
            ],
            [
                'status' => 'rejected',
                'moderated_by' => $userId,
                'moderated_at' => $updated['moderated_at'] ?? date('Y-m-d H:i:s'),
            ]
        );

        $this->success($updated, 'Review rejected successfully');
    }

    /**
     * Feature review.
     * POST /api/v1/reviews/{id}/feature or PATCH /api/v1/reviews/{id}/feature
     * Permission: reviews.moderate
     *
     * @param string $id
     * @return void
     */
    public function feature(string $id): void
    {
        $reviewId = (int) $id;
        if ($reviewId <= 0) {
            $this->error('Invalid review ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $review = Review::findById($reviewId);
        if (!$review) {
            $this->error('Review not found or is currently soft-deleted.', 404, null, 'REVIEW_NOT_FOUND');
        }

        if ($review['is_featured']) {
            $this->success($review, 'Review is already featured');
        }

        Review::feature($reviewId);
        $updated = Review::findById($reviewId);

        $userId = Request::getUserId();

        // Record audit log
        AuditService::log(
            $userId,
            'review_feature',
            'review',
            $reviewId,
            ['is_featured' => false],
            ['is_featured' => true]
        );

        $this->success($updated, 'Review featured successfully');
    }

    /**
     * Unfeature review.
     * POST /api/v1/reviews/{id}/unfeature or PATCH /api/v1/reviews/{id}/unfeature
     * Permission: reviews.moderate
     *
     * @param string $id
     * @return void
     */
    public function unfeature(string $id): void
    {
        $reviewId = (int) $id;
        if ($reviewId <= 0) {
            $this->error('Invalid review ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $review = Review::findById($reviewId);
        if (!$review) {
            $this->error('Review not found or is currently soft-deleted.', 404, null, 'REVIEW_NOT_FOUND');
        }

        if (!$review['is_featured']) {
            $this->success($review, 'Review is already not featured');
        }

        Review::unfeature($reviewId);
        $updated = Review::findById($reviewId);

        $userId = Request::getUserId();

        // Record audit log
        AuditService::log(
            $userId,
            'review_unfeature',
            'review',
            $reviewId,
            ['is_featured' => true],
            ['is_featured' => false]
        );

        $this->success($updated, 'Review unfeatured successfully');
    }
}
