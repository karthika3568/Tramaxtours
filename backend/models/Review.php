<?php

namespace App\Models;

use App\Utils\Database;
use PDO;

class Review extends BaseModel
{
    public const ALLOWED_STATUSES = ['pending', 'approved', 'rejected'];

    /**
     * Create a new review record.
     *
     * @param array $data
     * @param array $mediaIds
     * @return int
     */
    public static function create(array $data, array $mediaIds = []): int
    {
        $sql = 'INSERT INTO `reviews` (
            `tour_id`, `user_id`, `customer_name`, `customer_email`, `customer_country`,
            `rating`, `title`, `content`, `status`, `is_featured`,
            `moderated_by`, `moderated_at`, `created_at`, `updated_at`
        ) VALUES (
            :tour_id, :user_id, :customer_name, :customer_email, :customer_country,
            :rating, :title, :content, :status, :is_featured,
            :moderated_by, :moderated_at, NOW(), NOW()
        )';

        $status = in_array($data['status'] ?? '', self::ALLOWED_STATUSES, true) ? $data['status'] : 'pending';
        $moderatedBy = !empty($data['moderated_by']) ? (int) $data['moderated_by'] : null;
        $moderatedAt = !empty($data['moderated_at']) ? $data['moderated_at'] : ($status !== 'pending' && $moderatedBy ? date('Y-m-d H:i:s') : null);

        self::execute($sql, [
            ':tour_id' => (int) $data['tour_id'],
            ':user_id' => !empty($data['user_id']) ? (int) $data['user_id'] : null,
            ':customer_name' => $data['customer_name'],
            ':customer_email' => $data['customer_email'],
            ':customer_country' => !empty($data['customer_country']) ? $data['customer_country'] : null,
            ':rating' => (int) $data['rating'],
            ':title' => !empty($data['title']) ? $data['title'] : null,
            ':content' => $data['content'],
            ':status' => $status,
            ':is_featured' => !empty($data['is_featured']) ? 1 : 0,
            ':moderated_by' => $moderatedBy,
            ':moderated_at' => $moderatedAt,
        ]);

        $reviewId = (int) self::lastInsertId();

        if (!empty($mediaIds)) {
            self::syncMedia($reviewId, $mediaIds);
        }

        return $reviewId;
    }

    /**
     * Update an existing review record.
     *
     * @param int $id
     * @param array $data
     * @param array|null $mediaIds
     * @return bool
     */
    public static function update(int $id, array $data, ?array $mediaIds = null): bool
    {
        $fields = [];
        $params = [':id' => $id];

        $allowedColumns = [
            'tour_id', 'user_id', 'customer_name', 'customer_email', 'customer_country',
            'rating', 'title', 'content', 'status', 'is_featured',
            'moderated_by', 'moderated_at'
        ];

        foreach ($allowedColumns as $col) {
            if (array_key_exists($col, $data)) {
                $fields[] = "`{$col}` = :{$col}";
                if (in_array($col, ['tour_id', 'user_id', 'rating', 'moderated_by'], true)) {
                    $params[":{$col}"] = $data[$col] !== null && $data[$col] !== '' ? (int) $data[$col] : null;
                } elseif ($col === 'is_featured') {
                    $params[":{$col}"] = !empty($data[$col]) ? 1 : 0;
                } elseif ($col === 'status') {
                    $params[":{$col}"] = in_array($data[$col], self::ALLOWED_STATUSES, true) ? $data[$col] : 'pending';
                } else {
                    $params[":{$col}"] = $data[$col] !== null && $data[$col] !== '' ? (string) $data[$col] : null;
                }
            }
        }

        if (!empty($fields)) {
            $fields[] = '`updated_at` = NOW()';
            $sql = 'UPDATE `reviews` SET ' . implode(', ', $fields) . ' WHERE `id` = :id';
            self::execute($sql, $params);
        }

        if ($mediaIds !== null) {
            self::syncMedia($id, $mediaIds);
        }

        return true;
    }

    /**
     * Synchronize media associations for a review.
     *
     * @param int $reviewId
     * @param array $mediaIds
     * @return void
     */
    public static function syncMedia(int $reviewId, array $mediaIds): void
    {
        self::execute('DELETE FROM `review_media` WHERE `review_id` = :id', [':id' => $reviewId]);

        if (empty($mediaIds)) {
            return;
        }

        $uniqueMediaIds = array_values(array_unique(array_filter(array_map('intval', $mediaIds))));
        if (empty($uniqueMediaIds)) {
            return;
        }

        $pdo = self::db();
        $stmt = $pdo->prepare('INSERT IGNORE INTO `review_media` (`review_id`, `media_id`, `created_at`) VALUES (:review_id, :media_id, NOW())');

        foreach ($uniqueMediaIds as $mediaId) {
            $stmt->execute([
                ':review_id' => $reviewId,
                ':media_id' => $mediaId,
            ]);
        }
    }

    /**
     * Find a single review by primary ID.
     *
     * @param int $id
     * @param bool $includeDeleted
     * @return array|null
     */
    public static function findById(int $id, bool $includeDeleted = false): ?array
    {
        $sql = 'SELECT r.*, t.`title` AS tour_title, t.`slug` AS tour_slug
                FROM `reviews` r
                LEFT JOIN `tours` t ON r.`tour_id` = t.`id`
                WHERE r.`id` = :id';

        if (!$includeDeleted) {
            $sql .= ' AND r.`deleted_at` IS NULL';
        }
        $sql .= ' LIMIT 1';

        $row = self::fetchOne($sql, [':id' => $id]);
        if (!$row) {
            return null;
        }

        return self::formatReviewFull($row);
    }

    /**
     * Retrieve paginated reviews list based on search/filters.
     *
     * @param array $filters
     * @return array
     */
    public static function list(array $filters = []): array
    {
        $where = [];
        $params = [];

        // Active vs deleted
        if (empty($filters['include_deleted'])) {
            $where[] = 'r.`deleted_at` IS NULL';
        }

        // Tour filter
        if (!empty($filters['tour_id'])) {
            $where[] = 'r.`tour_id` = :tour_id';
            $params[':tour_id'] = (int) $filters['tour_id'];
        }

        // Status filter
        if (!empty($filters['status']) && in_array($filters['status'], self::ALLOWED_STATUSES, true)) {
            $where[] = 'r.`status` = :status';
            $params[':status'] = $filters['status'];
        }

        // Rating filter
        if (isset($filters['rating']) && is_numeric($filters['rating'])) {
            $where[] = 'r.`rating` = :rating';
            $params[':rating'] = (int) $filters['rating'];
        }

        // Is Featured filter
        if (isset($filters['is_featured']) && $filters['is_featured'] !== '') {
            $where[] = 'r.`is_featured` = :is_featured';
            $params[':is_featured'] = !empty($filters['is_featured']) ? 1 : 0;
        }

        // Search in customer_name, customer_email, title, content, tour title
        if (!empty($filters['search'])) {
            $where[] = '(r.`customer_name` LIKE :search1 OR r.`customer_email` LIKE :search2 OR r.`title` LIKE :search3 OR r.`content` LIKE :search4 OR t.`title` LIKE :search5)';
            $searchVal = '%' . $filters['search'] . '%';
            $params[':search1'] = $searchVal;
            $params[':search2'] = $searchVal;
            $params[':search3'] = $searchVal;
            $params[':search4'] = $searchVal;
            $params[':search5'] = $searchVal;
        }

        $whereClause = !empty($where) ? ' WHERE ' . implode(' AND ', $where) : '';

        // Sorting
        $allowedSortColumns = ['id', 'rating', 'created_at', 'status', 'is_featured', 'tour_id'];
        $sortBy = in_array($filters['sort_by'] ?? '', $allowedSortColumns, true) ? $filters['sort_by'] : 'created_at';
        $sortOrder = strtoupper($filters['sort_order'] ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';

        // Pagination
        $page = max(1, (int) ($filters['page'] ?? 1));
        $limit = max(1, min(200, (int) ($filters['limit'] ?? 50)));
        $offset = ($page - 1) * $limit;

        $sql = "SELECT r.*, t.`title` AS tour_title, t.`slug` AS tour_slug
                FROM `reviews` r
                LEFT JOIN `tours` t ON r.`tour_id` = t.`id`
                {$whereClause}
                ORDER BY r.`{$sortBy}` {$sortOrder}, r.`id` DESC
                LIMIT {$limit} OFFSET {$offset}";

        $rows = self::fetchAll($sql, $params);

        return array_map([self::class, 'formatReviewFull'], $rows);
    }

    /**
     * Count total reviews matching filters.
     *
     * @param array $filters
     * @return int
     */
    public static function count(array $filters = []): int
    {
        $where = [];
        $params = [];

        if (empty($filters['include_deleted'])) {
            $where[] = 'r.`deleted_at` IS NULL';
        }

        if (!empty($filters['tour_id'])) {
            $where[] = 'r.`tour_id` = :tour_id';
            $params[':tour_id'] = (int) $filters['tour_id'];
        }

        if (!empty($filters['status']) && in_array($filters['status'], self::ALLOWED_STATUSES, true)) {
            $where[] = 'r.`status` = :status';
            $params[':status'] = $filters['status'];
        }

        if (isset($filters['rating']) && is_numeric($filters['rating'])) {
            $where[] = 'r.`rating` = :rating';
            $params[':rating'] = (int) $filters['rating'];
        }

        if (isset($filters['is_featured']) && $filters['is_featured'] !== '') {
            $where[] = 'r.`is_featured` = :is_featured';
            $params[':is_featured'] = !empty($filters['is_featured']) ? 1 : 0;
        }

        if (!empty($filters['search'])) {
            $where[] = '(r.`customer_name` LIKE :search1 OR r.`customer_email` LIKE :search2 OR r.`title` LIKE :search3 OR r.`content` LIKE :search4 OR t.`title` LIKE :search5)';
            $searchVal = '%' . $filters['search'] . '%';
            $params[':search1'] = $searchVal;
            $params[':search2'] = $searchVal;
            $params[':search3'] = $searchVal;
            $params[':search4'] = $searchVal;
            $params[':search5'] = $searchVal;
        }

        $whereClause = !empty($where) ? ' WHERE ' . implode(' AND ', $where) : '';
        $sql = "SELECT COUNT(*) FROM `reviews` r LEFT JOIN `tours` t ON r.`tour_id` = t.`id` {$whereClause}";

        return (int) self::fetchColumn($sql, $params);
    }

    /**
     * Approve review.
     *
     * @param int $id
     * @param int $moderatedBy
     * @return bool
     */
    public static function approve(int $id, int $moderatedBy): bool
    {
        $sql = 'UPDATE `reviews` SET `status` = \'approved\', `moderated_by` = :moderated_by, `moderated_at` = NOW(), `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NULL';
        return self::execute($sql, [':id' => $id, ':moderated_by' => $moderatedBy]) > 0;
    }

    /**
     * Reject review.
     *
     * @param int $id
     * @param int $moderatedBy
     * @return bool
     */
    public static function reject(int $id, int $moderatedBy): bool
    {
        $sql = 'UPDATE `reviews` SET `status` = \'rejected\', `moderated_by` = :moderated_by, `moderated_at` = NOW(), `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NULL';
        return self::execute($sql, [':id' => $id, ':moderated_by' => $moderatedBy]) > 0;
    }

    /**
     * Feature review.
     *
     * @param int $id
     * @return bool
     */
    public static function feature(int $id): bool
    {
        $sql = 'UPDATE `reviews` SET `is_featured` = 1, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NULL';
        return self::execute($sql, [':id' => $id]) > 0;
    }

    /**
     * Unfeature review.
     *
     * @param int $id
     * @return bool
     */
    public static function unfeature(int $id): bool
    {
        $sql = 'UPDATE `reviews` SET `is_featured` = 0, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NULL';
        return self::execute($sql, [':id' => $id]) > 0;
    }

    /**
     * Soft-delete or permanently delete a review.
     *
     * @param int $id
     * @param int|null $deletedBy
     * @param bool $force
     * @return bool
     */
    public static function softDelete(int $id, ?int $deletedBy = null, bool $force = false): bool
    {
        if ($force) {
            $sql = 'DELETE FROM `reviews` WHERE `id` = :id';
            return self::execute($sql, [':id' => $id]) > 0;
        }

        $sql = 'UPDATE `reviews` SET `deleted_at` = NOW(), `deleted_by` = :deleted_by, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NULL';
        return self::execute($sql, [':id' => $id, ':deleted_by' => $deletedBy]) > 0;
    }

    /**
     * Restore a soft-deleted review.
     *
     * @param int $id
     * @return bool
     */
    public static function restore(int $id): bool
    {
        $sql = 'UPDATE `reviews` SET `deleted_at` = NULL, `deleted_by` = NULL, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NOT NULL';
        return self::execute($sql, [':id' => $id]) > 0;
    }

    /**
     * Fetch all media items attached to a review.
     *
     * @param int $reviewId
     * @return array
     */
    public static function getReviewMedia(int $reviewId): array
    {
        $sql = 'SELECT m.*
                FROM `review_media` rm
                JOIN `media` m ON rm.`media_id` = m.`id`
                WHERE rm.`review_id` = :id
                ORDER BY rm.`id` ASC';

        $rows = self::fetchAll($sql, [':id' => $reviewId]);
        return array_map([Media::class, 'formatMediaResponse'], $rows);
    }

    /**
     * Format review row into full response payload.
     *
     * @param array $row
     * @return array
     */
    public static function formatReviewFull(array $row): array
    {
        $reviewId = (int) $row['id'];
        $media = self::getReviewMedia($reviewId);

        $tour = null;
        if (!empty($row['tour_id'])) {
            $tour = [
                'id' => (int) $row['tour_id'],
                'title' => $row['tour_title'] ?? null,
                'slug' => $row['tour_slug'] ?? null,
            ];
        }

        return [
            'id' => $reviewId,
            'tour_id' => (int) $row['tour_id'],
            'tour' => $tour,
            'user_id' => !empty($row['user_id']) ? (int) $row['user_id'] : null,
            'customer_name' => $row['customer_name'],
            'customer_email' => $row['customer_email'],
            'customer_country' => $row['customer_country'] ?? null,
            'rating' => (int) $row['rating'],
            'title' => $row['title'] ?? null,
            'content' => $row['content'],
            'status' => $row['status'],
            'is_featured' => (bool) ($row['is_featured'] ?? false),
            'moderated_by' => !empty($row['moderated_by']) ? (int) $row['moderated_by'] : null,
            'moderated_at' => $row['moderated_at'] ?? null,
            'media' => $media,
            'media_ids' => array_column($media, 'id'),
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
            'deleted_at' => $row['deleted_at'] ?? null,
            'deleted_by' => !empty($row['deleted_by']) ? (int) $row['deleted_by'] : null,
        ];
    }
}
