<?php

namespace App\Models;

class Testimonial extends BaseModel
{
    public const ALLOWED_STATUSES = ['active', 'inactive'];

    /**
     * Create a new testimonial.
     *
     * @param array $data
     * @return int
     */
    public static function create(array $data): int
    {
        $sql = 'INSERT INTO `testimonials` (
            `client_name`, `client_image_id`, `message`, `rating`, `location`,
            `display_order`, `status`, `created_at`, `updated_at`
        ) VALUES (
            :client_name, :client_image_id, :message, :rating, :location,
            :display_order, :status, NOW(), NOW()
        )';

        self::execute($sql, [
            ':client_name' => $data['client_name'],
            ':client_image_id' => !empty($data['client_image_id']) ? (int) $data['client_image_id'] : null,
            ':message' => $data['message'],
            ':rating' => self::clampRating($data['rating'] ?? 5),
            ':location' => $data['location'] ?? null,
            ':display_order' => isset($data['display_order']) ? (int) $data['display_order'] : 0,
            ':status' => in_array($data['status'] ?? '', self::ALLOWED_STATUSES, true) ? $data['status'] : 'active',
        ]);

        return (int) self::lastInsertId();
    }

    /**
     * Update an existing testimonial.
     *
     * @param int $id
     * @param array $data
     * @return bool
     */
    public static function update(int $id, array $data): bool
    {
        $fields = [];
        $params = [':id' => $id];

        $allowedColumns = ['client_name', 'client_image_id', 'message', 'rating', 'location', 'display_order', 'status'];

        foreach ($allowedColumns as $col) {
            if (array_key_exists($col, $data)) {
                $fields[] = "`{$col}` = :{$col}";

                if ($col === 'client_image_id') {
                    $params[":{$col}"] = !empty($data[$col]) ? (int) $data[$col] : null;
                } elseif ($col === 'rating') {
                    $params[":{$col}"] = self::clampRating($data[$col]);
                } elseif ($col === 'display_order') {
                    $params[":{$col}"] = (int) $data[$col];
                } else {
                    $params[":{$col}"] = $data[$col] !== null ? (string) $data[$col] : null;
                }
            }
        }

        if (empty($fields)) {
            return true;
        }

        $fields[] = '`updated_at` = NOW()';
        $setSql = implode(', ', $fields);

        return self::execute("UPDATE `testimonials` SET {$setSql} WHERE `id` = :id", $params) > 0;
    }

    /**
     * Find a testimonial by ID.
     *
     * @param int $id
     * @param bool $includeDeleted
     * @return array|null
     */
    public static function findById(int $id, bool $includeDeleted = false): ?array
    {
        $sql = 'SELECT t.*, m.`file_path` AS client_image_path, m.`original_name` AS client_image_name
                FROM `testimonials` t
                LEFT JOIN `media` m ON t.`client_image_id` = m.`id`
                WHERE t.`id` = :id';

        if (!$includeDeleted) {
            $sql .= ' AND t.`deleted_at` IS NULL';
        }

        $row = self::fetchOne($sql, [':id' => $id]);
        return $row ? self::format($row) : null;
    }

    /**
     * Paginate testimonials with optional filters.
     *
     * @param array $filters
     * @param int $page
     * @param int $limit
     * @return array
     */
    public static function paginate(array $filters = [], int $page = 1, int $limit = 20): array
    {
        $where = ['t.`deleted_at` IS NULL'];
        $params = [];

        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $where[] = 't.`status` = :status';
            $params[':status'] = $filters['status'];
        }

        if (!empty($filters['search'])) {
            $where[] = '(t.`client_name` LIKE :search OR t.`message` LIKE :search OR t.`location` LIKE :search)';
            $params[':search'] = '%' . $filters['search'] . '%';
        }

        $whereSql = implode(' AND ', $where);

        $total = (int) self::fetchColumn("SELECT COUNT(*) FROM `testimonials` t WHERE {$whereSql}", $params);

        $sortBy = in_array($filters['sort_by'] ?? '', ['display_order', 'created_at', 'rating'], true)
            ? $filters['sort_by'] : 'display_order';
        $order = strtoupper($filters['order'] ?? 'ASC') === 'DESC' ? 'DESC' : 'ASC';

        $page = max(1, $page);
        $limit = max(1, min(100, $limit));
        $offset = ($page - 1) * $limit;

        $sql = "SELECT t.*, m.`file_path` AS client_image_path, m.`original_name` AS client_image_name
                FROM `testimonials` t
                LEFT JOIN `media` m ON t.`client_image_id` = m.`id`
                WHERE {$whereSql}
                ORDER BY t.`{$sortBy}` {$order}, t.`id` ASC
                LIMIT {$limit} OFFSET {$offset}";

        $rows = self::fetchAll($sql, $params);

        return [
            'items' => array_map([self::class, 'format'], $rows),
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'total_pages' => (int) ceil($total / $limit),
            ],
        ];
    }

    /**
     * Soft-delete a testimonial.
     *
     * @param int $id
     * @param bool $force
     * @return bool
     */
    public static function delete(int $id, bool $force = false): bool
    {
        if ($force) {
            return self::execute('DELETE FROM `testimonials` WHERE `id` = :id', [':id' => $id]) > 0;
        }

        return self::execute(
            'UPDATE `testimonials` SET `deleted_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NULL',
            [':id' => $id]
        ) > 0;
    }

    /**
     * Restore a soft-deleted testimonial.
     *
     * @param int $id
     * @return bool
     */
    public static function restore(int $id): bool
    {
        return self::execute(
            'UPDATE `testimonials` SET `deleted_at` = NULL WHERE `id` = :id',
            [':id' => $id]
        ) > 0;
    }

    private static function clampRating($rating): int
    {
        $rating = (int) $rating;
        return max(1, min(5, $rating));
    }

    private static function format(array $row): array
    {
        $clientImage = null;
        if (!empty($row['client_image_id'])) {
            $clientImage = [
                'id' => (int) $row['client_image_id'],
                'file_path' => $row['client_image_path'] ?? null,
                'original_name' => $row['client_image_name'] ?? null,
            ];
        }

        return [
            'id' => (int) $row['id'],
            'client_name' => $row['client_name'],
            'client_image_id' => $row['client_image_id'] ? (int) $row['client_image_id'] : null,
            'client_image' => $clientImage,
            'message' => $row['message'],
            'rating' => (int) $row['rating'],
            'location' => $row['location'],
            'display_order' => (int) $row['display_order'],
            'status' => $row['status'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
            'deleted_at' => $row['deleted_at'] ?? null,
        ];
    }
}
