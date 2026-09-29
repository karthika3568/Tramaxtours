<?php

namespace App\Models;

use App\Utils\Database;
use PDO;

class HomeBenefit extends BaseModel
{
    public const ALLOWED_STATUSES = ['active', 'inactive'];

    /**
     * Create a new homepage benefit.
     *
     * @param array $data
     * @return int
     */
    public static function create(array $data): int
    {
        $sql = 'INSERT INTO `home_benefits` (
            `title`, `description`, `icon`, `media_id`,
            `display_order`, `status`, `created_at`, `updated_at`
        ) VALUES (
            :title, :description, :icon, :media_id,
            :display_order, :status, NOW(), NOW()
        )';

        self::execute($sql, [
            ':title' => $data['title'],
            ':description' => $data['description'] ?? '',
            ':icon' => !empty($data['icon']) ? $data['icon'] : null,
            ':media_id' => !empty($data['media_id']) ? (int) $data['media_id'] : null,
            ':display_order' => isset($data['display_order']) ? (int) $data['display_order'] : 0,
            ':status' => in_array($data['status'] ?? '', self::ALLOWED_STATUSES, true) ? $data['status'] : 'active',
        ]);

        return (int) self::lastInsertId();
    }

    /**
     * Update an existing homepage benefit.
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
            'title', 'description', 'icon', 'media_id',
            'display_order', 'status'
        ];

        foreach ($allowedColumns as $col) {
            if (array_key_exists($col, $data)) {
                $fields[] = "`{$col}` = :{$col}";
                if ($col === 'media_id') {
                    $params[":{$col}"] = !empty($data[$col]) ? (int) $data[$col] : null;
                } elseif ($col === 'display_order') {
                    $params[":{$col}"] = (int) $data[$col];
                } elseif ($col === 'status') {
                    $params[":{$col}"] = in_array($data[$col], self::ALLOWED_STATUSES, true) ? $data[$col] : 'active';
                } elseif ($col === 'icon') {
                    $params[":{$col}"] = !empty($data[$col]) ? $data[$col] : null;
                } else {
                    $params[":{$col}"] = $data[$col];
                }
            }
        }

        if (empty($fields)) {
            return false;
        }

        $fields[] = '`updated_at` = NOW()';
        $sql = 'UPDATE `home_benefits` SET ' . implode(', ', $fields) . ' WHERE `id` = :id';

        return self::execute($sql, $params) > 0;
    }

    /**
     * Find a single benefit by primary ID.
     *
     * @param int $id
     * @param bool $includeDeleted
     * @return array|null
     */
    public static function findById(int $id, bool $includeDeleted = false): ?array
    {
        $sql = 'SELECT b.* FROM `home_benefits` b WHERE b.`id` = :id';
        if (!$includeDeleted) {
            $sql .= ' AND b.`deleted_at` IS NULL';
        }
        $sql .= ' LIMIT 1';

        $benefit = self::fetchOne($sql, [':id' => $id]);
        if (!$benefit) {
            return null;
        }

        return self::formatDetail($benefit);
    }

    /**
     * Retrieve paginated benefits list based on search/filters.
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
            $where[] = 'b.`deleted_at` IS NULL';
        }

        // Search in title, description, and icon
        if (!empty($filters['search'])) {
            $where[] = '(b.`title` LIKE :search1 OR b.`description` LIKE :search2 OR b.`icon` LIKE :search3)';
            $searchVal = '%' . $filters['search'] . '%';
            $params[':search1'] = $searchVal;
            $params[':search2'] = $searchVal;
            $params[':search3'] = $searchVal;
        }

        // Status filter
        if (!empty($filters['status']) && in_array($filters['status'], self::ALLOWED_STATUSES, true)) {
            $where[] = 'b.`status` = :status';
            $params[':status'] = $filters['status'];
        }

        $whereClause = !empty($where) ? ' WHERE ' . implode(' AND ', $where) : '';

        // Sorting
        $allowedSortColumns = ['id', 'title', 'display_order', 'status', 'created_at', 'updated_at'];
        $sortBy = in_array($filters['sort_by'] ?? '', $allowedSortColumns, true) ? $filters['sort_by'] : 'display_order';
        $sortOrder = strtoupper($filters['sort_order'] ?? 'ASC') === 'DESC' ? 'DESC' : 'ASC';

        // Pagination
        $page = max(1, (int) ($filters['page'] ?? 1));
        $limit = max(1, min(100, (int) ($filters['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;

        $sql = "SELECT b.*,
                       m.`filename` AS media_filename,
                       m.`original_name` AS media_original_name,
                       m.`file_path` AS media_file_path,
                       m.`mime_type` AS media_mime_type,
                       m.`alt_text` AS media_alt_text
                FROM `home_benefits` b
                LEFT JOIN `media` m ON b.`media_id` = m.`id`
                {$whereClause}
                ORDER BY b.`{$sortBy}` {$sortOrder}, b.`id` ASC
                LIMIT {$limit} OFFSET {$offset}";

        $rows = self::fetchAll($sql, $params);

        return array_map(function ($row) {
            return self::formatSummary($row);
        }, $rows);
    }

    /**
     * Get total count of benefits matching filters.
     *
     * @param array $filters
     * @return int
     */
    public static function count(array $filters = []): int
    {
        $where = [];
        $params = [];

        if (empty($filters['include_deleted'])) {
            $where[] = 'b.`deleted_at` IS NULL';
        }

        if (!empty($filters['search'])) {
            $where[] = '(b.`title` LIKE :search1 OR b.`description` LIKE :search2 OR b.`icon` LIKE :search3)';
            $searchVal = '%' . $filters['search'] . '%';
            $params[':search1'] = $searchVal;
            $params[':search2'] = $searchVal;
            $params[':search3'] = $searchVal;
        }

        if (!empty($filters['status']) && in_array($filters['status'], self::ALLOWED_STATUSES, true)) {
            $where[] = 'b.`status` = :status';
            $params[':status'] = $filters['status'];
        }

        $whereClause = !empty($where) ? ' WHERE ' . implode(' AND ', $where) : '';
        $sql = "SELECT COUNT(*) FROM `home_benefits` b {$whereClause}";

        return (int) self::fetchColumn($sql, $params);
    }

    /**
     * Soft-delete or permanently delete a benefit.
     *
     * @param int $id
     * @param int|null $deletedBy
     * @param bool $force
     * @return bool
     */
    public static function softDelete(int $id, ?int $deletedBy = null, bool $force = false): bool
    {
        if ($force) {
            $sql = 'DELETE FROM `home_benefits` WHERE `id` = :id';
            return self::execute($sql, [':id' => $id]) > 0;
        }

        $sql = 'UPDATE `home_benefits` SET `deleted_at` = NOW(), `deleted_by` = :deleted_by, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NULL';
        return self::execute($sql, [':id' => $id, ':deleted_by' => $deletedBy]) > 0;
    }

    /**
     * Restore a soft-deleted benefit.
     *
     * @param int $id
     * @return bool
     */
    public static function restore(int $id): bool
    {
        $sql = 'UPDATE `home_benefits` SET `deleted_at` = NULL, `deleted_by` = NULL, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NOT NULL';
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
     * Set status of a benefit.
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

        $sql = 'UPDATE `home_benefits` SET `status` = :status, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NULL';
        return self::execute($sql, [':id' => $id, ':status' => $status]) > 0;
    }

    /**
     * Format summary representation for list endpoints.
     *
     * @param array $row
     * @return array
     */
    public static function formatSummary(array $row): array
    {
        $media = null;
        if (!empty($row['media_id'])) {
            $media = [
                'id' => (int) $row['media_id'],
                'filename' => $row['media_filename'] ?? null,
                'original_name' => $row['media_original_name'] ?? null,
                'file_path' => $row['media_file_path'] ?? null,
                'url' => !empty($row['media_file_path']) ? '/' . ltrim($row['media_file_path'], '/') : null,
                'mime_type' => $row['media_mime_type'] ?? null,
                'alt_text' => $row['media_alt_text'] ?? null,
            ];
        }

        return [
            'id' => (int) $row['id'],
            'title' => $row['title'],
            'description' => $row['description'],
            'icon' => $row['icon'] ?? null,
            'media_id' => !empty($row['media_id']) ? (int) $row['media_id'] : null,
            'media' => $media,
            'display_order' => (int) ($row['display_order'] ?? 0),
            'status' => $row['status'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
            'deleted_at' => $row['deleted_at'] ?? null,
            'deleted_by' => !empty($row['deleted_by']) ? (int) $row['deleted_by'] : null,
        ];
    }

    /**
     * Format complete detail representation for view/detail endpoint.
     *
     * @param array $benefit
     * @return array
     */
    public static function formatDetail(array $benefit): array
    {
        $media = null;
        if (!empty($benefit['media_id'])) {
            $media = Media::findById((int) $benefit['media_id']);
        }

        return [
            'id' => (int) $benefit['id'],
            'title' => $benefit['title'],
            'description' => $benefit['description'],
            'icon' => $benefit['icon'] ?? null,
            'media_id' => !empty($benefit['media_id']) ? (int) $benefit['media_id'] : null,
            'media' => $media,
            'display_order' => (int) ($benefit['display_order'] ?? 0),
            'status' => $benefit['status'],
            'created_at' => $benefit['created_at'],
            'updated_at' => $benefit['updated_at'],
            'deleted_at' => $benefit['deleted_at'] ?? null,
            'deleted_by' => !empty($benefit['deleted_by']) ? (int) $benefit['deleted_by'] : null,
        ];
    }
}
