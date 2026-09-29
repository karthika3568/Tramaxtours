<?php

namespace App\Models;

use App\Utils\Database;
use PDO;

class SocialLink extends BaseModel
{
    public const ALLOWED_STATUSES = ['active', 'inactive'];

    /**
     * Create a new social link.
     *
     * @param array $data
     * @return int
     */
    public static function create(array $data): int
    {
        $sql = 'INSERT INTO `social_links` (
            `platform`, `url`, `icon`, `display_order`,
            `status`, `created_at`, `updated_at`
        ) VALUES (
            :platform, :url, :icon, :display_order,
            :status, NOW(), NOW()
        )';

        self::execute($sql, [
            ':platform' => $data['platform'],
            ':url' => $data['url'],
            ':icon' => !empty($data['icon']) ? $data['icon'] : null,
            ':display_order' => isset($data['display_order']) ? (int) $data['display_order'] : 0,
            ':status' => in_array($data['status'] ?? '', self::ALLOWED_STATUSES, true) ? $data['status'] : 'active',
        ]);

        return (int) self::lastInsertId();
    }

    /**
     * Update an existing social link.
     *
     * @param int $id
     * @param array $data
     * @return bool
     */
    public static function update(int $id, array $data): bool
    {
        $fields = [];
        $params = [':id' => $id];

        $allowedColumns = [
            'platform', 'url', 'icon', 'display_order', 'status'
        ];

        foreach ($allowedColumns as $col) {
            if (array_key_exists($col, $data)) {
                $fields[] = "`{$col}` = :{$col}";
                if ($col === 'display_order') {
                    $params[":{$col}"] = (int) $data[$col];
                } elseif ($col === 'icon') {
                    $params[":{$col}"] = !empty($data[$col]) ? $data[$col] : null;
                } elseif ($col === 'status') {
                    $params[":{$col}"] = in_array($data[$col], self::ALLOWED_STATUSES, true) ? $data[$col] : 'active';
                } else {
                    $params[":{$col}"] = $data[$col];
                }
            }
        }

        if (empty($fields)) {
            return false;
        }

        $fields[] = '`updated_at` = NOW()';
        $sql = 'UPDATE `social_links` SET ' . implode(', ', $fields) . ' WHERE `id` = :id';

        return self::execute($sql, $params) > 0;
    }

    /**
     * Find a single social link by primary ID.
     *
     * @param int $id
     * @param bool $includeDeleted
     * @return array|null
     */
    public static function findById(int $id, bool $includeDeleted = false): ?array
    {
        $sql = 'SELECT s.* FROM `social_links` s WHERE s.`id` = :id';
        if (!$includeDeleted) {
            $sql .= ' AND s.`deleted_at` IS NULL';
        }
        $sql .= ' LIMIT 1';

        $link = self::fetchOne($sql, [':id' => $id]);
        if (!$link) {
            return null;
        }

        return self::formatLink($link);
    }

    /**
     * Retrieve paginated social links list based on search/filters.
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
            $where[] = 's.`deleted_at` IS NULL';
        }

        // Search in platform, url, and icon
        if (!empty($filters['search'])) {
            $where[] = '(s.`platform` LIKE :search1 OR s.`url` LIKE :search2 OR s.`icon` LIKE :search3)';
            $searchVal = '%' . $filters['search'] . '%';
            $params[':search1'] = $searchVal;
            $params[':search2'] = $searchVal;
            $params[':search3'] = $searchVal;
        }

        // Status filter
        if (!empty($filters['status']) && in_array($filters['status'], self::ALLOWED_STATUSES, true)) {
            $where[] = 's.`status` = :status';
            $params[':status'] = $filters['status'];
        }

        // Platform filter
        if (!empty($filters['platform'])) {
            $where[] = 's.`platform` = :platform';
            $params[':platform'] = $filters['platform'];
        }

        $whereClause = !empty($where) ? ' WHERE ' . implode(' AND ', $where) : '';

        // Sorting
        $allowedSortColumns = ['id', 'platform', 'url', 'icon', 'display_order', 'status', 'created_at', 'updated_at'];
        $sortBy = in_array($filters['sort_by'] ?? '', $allowedSortColumns, true) ? $filters['sort_by'] : 'display_order';
        $sortOrder = strtoupper($filters['sort_order'] ?? 'ASC') === 'DESC' ? 'DESC' : 'ASC';

        // Pagination
        $page = max(1, (int) ($filters['page'] ?? 1));
        $limit = max(1, min(200, (int) ($filters['limit'] ?? 100)));
        $offset = ($page - 1) * $limit;

        $sql = "SELECT s.* FROM `social_links` s
                {$whereClause}
                ORDER BY s.`{$sortBy}` {$sortOrder}, s.`id` ASC
                LIMIT {$limit} OFFSET {$offset}";

        $rows = self::fetchAll($sql, $params);

        return array_map([self::class, 'formatLink'], $rows);
    }

    /**
     * Get total count of social links matching filters.
     *
     * @param array $filters
     * @return int
     */
    public static function count(array $filters = []): int
    {
        $where = [];
        $params = [];

        if (empty($filters['include_deleted'])) {
            $where[] = 's.`deleted_at` IS NULL';
        }

        if (!empty($filters['search'])) {
            $where[] = '(s.`platform` LIKE :search1 OR s.`url` LIKE :search2 OR s.`icon` LIKE :search3)';
            $searchVal = '%' . $filters['search'] . '%';
            $params[':search1'] = $searchVal;
            $params[':search2'] = $searchVal;
            $params[':search3'] = $searchVal;
        }

        if (!empty($filters['status']) && in_array($filters['status'], self::ALLOWED_STATUSES, true)) {
            $where[] = 's.`status` = :status';
            $params[':status'] = $filters['status'];
        }

        if (!empty($filters['platform'])) {
            $where[] = 's.`platform` = :platform';
            $params[':platform'] = $filters['platform'];
        }

        $whereClause = !empty($where) ? ' WHERE ' . implode(' AND ', $where) : '';
        $sql = "SELECT COUNT(*) FROM `social_links` s {$whereClause}";

        return (int) self::fetchColumn($sql, $params);
    }

    /**
     * Soft-delete or permanently delete a social link.
     *
     * @param int $id
     * @param int|null $deletedBy
     * @param bool $force
     * @return bool
     */
    public static function softDelete(int $id, ?int $deletedBy = null, bool $force = false): bool
    {
        if ($force) {
            $sql = 'DELETE FROM `social_links` WHERE `id` = :id';
            return self::execute($sql, [':id' => $id]) > 0;
        }

        $sql = 'UPDATE `social_links` SET `deleted_at` = NOW(), `deleted_by` = :deleted_by, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NULL';
        return self::execute($sql, [':id' => $id, ':deleted_by' => $deletedBy]) > 0;
    }

    /**
     * Restore a soft-deleted social link.
     *
     * @param int $id
     * @return bool
     */
    public static function restore(int $id): bool
    {
        $sql = 'UPDATE `social_links` SET `deleted_at` = NULL, `deleted_by` = NULL, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NOT NULL';
        return self::execute($sql, [':id' => $id]) > 0;
    }

    /**
     * Set status to active.
     *
     * @param int $id
     * @return bool
     */
    public static function activate(int $id): bool
    {
        return self::setStatus($id, 'active');
    }

    /**
     * Set status to inactive.
     *
     * @param int $id
     * @return bool
     */
    public static function deactivate(int $id): bool
    {
        return self::setStatus($id, 'inactive');
    }

    /**
     * Set status of a social link.
     *
     * @param int $id
     * @param string $status
     * @return bool
     */
    public static function setStatus(int $id, string $status): bool
    {
        if (!in_array($status, self::ALLOWED_STATUSES, true)) {
            return false;
        }

        $sql = 'UPDATE `social_links` SET `status` = :status, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NULL';
        return self::execute($sql, [':id' => $id, ':status' => $status]) > 0;
    }

    /**
     * Format social link row for API output.
     *
     * @param array $row
     * @return array
     */
    public static function formatLink(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'platform' => $row['platform'],
            'url' => $row['url'],
            'icon' => $row['icon'] ?? null,
            'display_order' => (int) ($row['display_order'] ?? 0),
            'status' => $row['status'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
            'deleted_at' => $row['deleted_at'] ?? null,
            'deleted_by' => !empty($row['deleted_by']) ? (int) $row['deleted_by'] : null,
        ];
    }
}
