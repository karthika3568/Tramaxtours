<?php

namespace App\Models;

use App\Utils\Database;
use PDO;

class FooterLink extends BaseModel
{
    public const ALLOWED_STATUSES = ['active', 'inactive'];

    /**
     * Create a new footer link.
     *
     * @param array $data
     * @return int
     */
    public static function create(array $data): int
    {
        $sql = 'INSERT INTO `footer_links` (
            `column_name`, `label`, `url`, `display_order`,
            `is_external`, `status`, `created_at`, `updated_at`
        ) VALUES (
            :column_name, :label, :url, :display_order,
            :is_external, :status, NOW(), NOW()
        )';

        self::execute($sql, [
            ':column_name' => $data['column_name'],
            ':label' => $data['label'],
            ':url' => $data['url'],
            ':display_order' => isset($data['display_order']) ? (int) $data['display_order'] : 0,
            ':is_external' => !empty($data['is_external']) ? 1 : 0,
            ':status' => in_array($data['status'] ?? '', self::ALLOWED_STATUSES, true) ? $data['status'] : 'active',
        ]);

        return (int) self::lastInsertId();
    }

    /**
     * Update an existing footer link.
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
            'column_name', 'label', 'url', 'display_order',
            'is_external', 'status'
        ];

        foreach ($allowedColumns as $col) {
            if (array_key_exists($col, $data)) {
                $fields[] = "`{$col}` = :{$col}";
                if ($col === 'display_order') {
                    $params[":{$col}"] = (int) $data[$col];
                } elseif ($col === 'is_external') {
                    $params[":{$col}"] = !empty($data[$col]) ? 1 : 0;
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
        $sql = 'UPDATE `footer_links` SET ' . implode(', ', $fields) . ' WHERE `id` = :id';

        return self::execute($sql, $params) > 0;
    }

    /**
     * Find a single footer link by primary ID.
     *
     * @param int $id
     * @param bool $includeDeleted
     * @return array|null
     */
    public static function findById(int $id, bool $includeDeleted = false): ?array
    {
        $sql = 'SELECT f.* FROM `footer_links` f WHERE f.`id` = :id';
        if (!$includeDeleted) {
            $sql .= ' AND f.`deleted_at` IS NULL';
        }
        $sql .= ' LIMIT 1';

        $link = self::fetchOne($sql, [':id' => $id]);
        if (!$link) {
            return null;
        }

        return self::formatLink($link);
    }

    /**
     * Retrieve paginated footer links list based on search/filters.
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
            $where[] = 'f.`deleted_at` IS NULL';
        }

        // Search in label, url, and column_name
        if (!empty($filters['search'])) {
            $where[] = '(f.`label` LIKE :search1 OR f.`url` LIKE :search2 OR f.`column_name` LIKE :search3)';
            $searchVal = '%' . $filters['search'] . '%';
            $params[':search1'] = $searchVal;
            $params[':search2'] = $searchVal;
            $params[':search3'] = $searchVal;
        }

        // Status filter
        if (!empty($filters['status']) && in_array($filters['status'], self::ALLOWED_STATUSES, true)) {
            $where[] = 'f.`status` = :status';
            $params[':status'] = $filters['status'];
        }

        // Column name filter
        if (!empty($filters['column_name'])) {
            $where[] = 'f.`column_name` = :column_name';
            $params[':column_name'] = $filters['column_name'];
        }

        $whereClause = !empty($where) ? ' WHERE ' . implode(' AND ', $where) : '';

        // Sorting
        $allowedSortColumns = ['id', 'column_name', 'label', 'url', 'display_order', 'status', 'created_at', 'updated_at'];
        $sortBy = in_array($filters['sort_by'] ?? '', $allowedSortColumns, true) ? $filters['sort_by'] : 'display_order';
        $sortOrder = strtoupper($filters['sort_order'] ?? 'ASC') === 'DESC' ? 'DESC' : 'ASC';

        // Pagination
        $page = max(1, (int) ($filters['page'] ?? 1));
        $limit = max(1, min(200, (int) ($filters['limit'] ?? 100)));
        $offset = ($page - 1) * $limit;

        $sql = "SELECT f.* FROM `footer_links` f
                {$whereClause}
                ORDER BY f.`column_name` ASC, f.`{$sortBy}` {$sortOrder}, f.`id` ASC
                LIMIT {$limit} OFFSET {$offset}";

        $rows = self::fetchAll($sql, $params);

        return array_map([self::class, 'formatLink'], $rows);
    }

    /**
     * Get total count of footer links matching filters.
     *
     * @param array $filters
     * @return int
     */
    public static function count(array $filters = []): int
    {
        $where = [];
        $params = [];

        if (empty($filters['include_deleted'])) {
            $where[] = 'f.`deleted_at` IS NULL';
        }

        if (!empty($filters['search'])) {
            $where[] = '(f.`label` LIKE :search1 OR f.`url` LIKE :search2 OR f.`column_name` LIKE :search3)';
            $searchVal = '%' . $filters['search'] . '%';
            $params[':search1'] = $searchVal;
            $params[':search2'] = $searchVal;
            $params[':search3'] = $searchVal;
        }

        if (!empty($filters['status']) && in_array($filters['status'], self::ALLOWED_STATUSES, true)) {
            $where[] = 'f.`status` = :status';
            $params[':status'] = $filters['status'];
        }

        if (!empty($filters['column_name'])) {
            $where[] = 'f.`column_name` = :column_name';
            $params[':column_name'] = $filters['column_name'];
        }

        $whereClause = !empty($where) ? ' WHERE ' . implode(' AND ', $where) : '';
        $sql = "SELECT COUNT(*) FROM `footer_links` f {$whereClause}";

        return (int) self::fetchColumn($sql, $params);
    }

    /**
     * Soft-delete or permanently delete a footer link.
     *
     * @param int $id
     * @param int|null $deletedBy
     * @param bool $force
     * @return bool
     */
    public static function softDelete(int $id, ?int $deletedBy = null, bool $force = false): bool
    {
        if ($force) {
            $sql = 'DELETE FROM `footer_links` WHERE `id` = :id';
            return self::execute($sql, [':id' => $id]) > 0;
        }

        $sql = 'UPDATE `footer_links` SET `deleted_at` = NOW(), `deleted_by` = :deleted_by, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NULL';
        return self::execute($sql, [':id' => $id, ':deleted_by' => $deletedBy]) > 0;
    }

    /**
     * Restore a soft-deleted footer link.
     *
     * @param int $id
     * @return bool
     */
    public static function restore(int $id): bool
    {
        $sql = 'UPDATE `footer_links` SET `deleted_at` = NULL, `deleted_by` = NULL, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NOT NULL';
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
     * Set status of a footer link.
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

        $sql = 'UPDATE `footer_links` SET `status` = :status, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NULL';
        return self::execute($sql, [':id' => $id, ':status' => $status]) > 0;
    }

    /**
     * Format footer link row for API output.
     *
     * @param array $row
     * @return array
     */
    public static function formatLink(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'column_name' => $row['column_name'],
            'label' => $row['label'],
            'url' => $row['url'],
            'display_order' => (int) ($row['display_order'] ?? 0),
            'is_external' => (bool) ($row['is_external'] ?? false),
            'status' => $row['status'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
            'deleted_at' => $row['deleted_at'] ?? null,
            'deleted_by' => !empty($row['deleted_by']) ? (int) $row['deleted_by'] : null,
        ];
    }
}
