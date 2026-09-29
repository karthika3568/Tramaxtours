<?php

namespace App\Models;

use App\Utils\Database;
use PDO;

class HomeHeroSlide extends BaseModel
{
    public const ALLOWED_STATUSES = ['active', 'inactive'];

    /**
     * Create a new homepage hero slide.
     *
     * @param array $data
     * @return int
     */
    public static function create(array $data): int
    {
        $sql = 'INSERT INTO `home_hero_slides` (
            `title`, `subtitle`, `desktop_media_id`, `mobile_media_id`,
            `cta_label`, `cta_url`, `display_order`, `start_date`, `end_date`,
            `status`, `created_at`, `updated_at`
        ) VALUES (
            :title, :subtitle, :desktop_media_id, :mobile_media_id,
            :cta_label, :cta_url, :display_order, :start_date, :end_date,
            :status, NOW(), NOW()
        )';

        self::execute($sql, [
            ':title' => $data['title'],
            ':subtitle' => $data['subtitle'] ?? null,
            ':desktop_media_id' => !empty($data['desktop_media_id']) ? (int) $data['desktop_media_id'] : null,
            ':mobile_media_id' => !empty($data['mobile_media_id']) ? (int) $data['mobile_media_id'] : null,
            ':cta_label' => $data['cta_label'] ?? null,
            ':cta_url' => $data['cta_url'] ?? null,
            ':display_order' => isset($data['display_order']) ? (int) $data['display_order'] : 0,
            ':start_date' => !empty($data['start_date']) ? $data['start_date'] : null,
            ':end_date' => !empty($data['end_date']) ? $data['end_date'] : null,
            ':status' => in_array($data['status'] ?? '', self::ALLOWED_STATUSES, true) ? $data['status'] : 'active',
        ]);

        return (int) self::lastInsertId();
    }

    /**
     * Update an existing homepage hero slide.
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
            'title', 'subtitle', 'desktop_media_id', 'mobile_media_id',
            'cta_label', 'cta_url', 'display_order', 'start_date', 'end_date', 'status'
        ];

        foreach ($allowedColumns as $col) {
            if (array_key_exists($col, $data)) {
                $fields[] = "`{$col}` = :{$col}";
                if ($col === 'desktop_media_id' || $col === 'mobile_media_id') {
                    $params[":{$col}"] = !empty($data[$col]) ? (int) $data[$col] : null;
                } elseif ($col === 'display_order') {
                    $params[":{$col}"] = (int) $data[$col];
                } elseif ($col === 'status') {
                    $params[":{$col}"] = in_array($data[$col], self::ALLOWED_STATUSES, true) ? $data[$col] : 'active';
                } elseif ($col === 'start_date' || $col === 'end_date') {
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
        $sql = 'UPDATE `home_hero_slides` SET ' . implode(', ', $fields) . ' WHERE `id` = :id';

        return self::execute($sql, $params) > 0;
    }

    /**
     * Find a single hero slide by primary ID.
     *
     * @param int $id
     * @param bool $includeDeleted
     * @return array|null
     */
    public static function findById(int $id, bool $includeDeleted = false): ?array
    {
        $sql = 'SELECT s.* FROM `home_hero_slides` s WHERE s.`id` = :id';
        if (!$includeDeleted) {
            $sql .= ' AND s.`deleted_at` IS NULL';
        }
        $sql .= ' LIMIT 1';

        $slide = self::fetchOne($sql, [':id' => $id]);
        if (!$slide) {
            return null;
        }

        return self::formatDetail($slide);
    }

    /**
     * Retrieve paginated hero slides list based on search/filters.
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

        // Search in title and subtitle
        if (!empty($filters['search'])) {
            $where[] = '(s.`title` LIKE :search1 OR s.`subtitle` LIKE :search2 OR s.`cta_label` LIKE :search3)';
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

        $whereClause = !empty($where) ? ' WHERE ' . implode(' AND ', $where) : '';

        // Sorting
        $allowedSortColumns = ['id', 'title', 'display_order', 'status', 'start_date', 'end_date', 'created_at', 'updated_at'];
        $sortBy = in_array($filters['sort_by'] ?? '', $allowedSortColumns, true) ? $filters['sort_by'] : 'display_order';
        $sortOrder = strtoupper($filters['sort_order'] ?? 'ASC') === 'DESC' ? 'DESC' : 'ASC';

        // Pagination
        $page = max(1, (int) ($filters['page'] ?? 1));
        $limit = max(1, min(100, (int) ($filters['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;

        $sql = "SELECT s.*,
                       dm.`filename` AS desktop_media_filename,
                       dm.`original_name` AS desktop_media_original_name,
                       dm.`file_path` AS desktop_media_file_path,
                       dm.`mime_type` AS desktop_media_mime_type,
                       dm.`alt_text` AS desktop_media_alt_text,
                       mm.`filename` AS mobile_media_filename,
                       mm.`original_name` AS mobile_media_original_name,
                       mm.`file_path` AS mobile_media_file_path,
                       mm.`mime_type` AS mobile_media_mime_type,
                       mm.`alt_text` AS mobile_media_alt_text
                FROM `home_hero_slides` s
                LEFT JOIN `media` dm ON s.`desktop_media_id` = dm.`id`
                LEFT JOIN `media` mm ON s.`mobile_media_id` = mm.`id`
                {$whereClause}
                ORDER BY s.`{$sortBy}` {$sortOrder}, s.`id` ASC
                LIMIT {$limit} OFFSET {$offset}";

        $rows = self::fetchAll($sql, $params);

        return array_map(function ($row) {
            return self::formatSummary($row);
        }, $rows);
    }

    /**
     * Get total count of hero slides matching filters.
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
            $where[] = '(s.`title` LIKE :search1 OR s.`subtitle` LIKE :search2 OR s.`cta_label` LIKE :search3)';
            $searchVal = '%' . $filters['search'] . '%';
            $params[':search1'] = $searchVal;
            $params[':search2'] = $searchVal;
            $params[':search3'] = $searchVal;
        }

        if (!empty($filters['status']) && in_array($filters['status'], self::ALLOWED_STATUSES, true)) {
            $where[] = 's.`status` = :status';
            $params[':status'] = $filters['status'];
        }

        $whereClause = !empty($where) ? ' WHERE ' . implode(' AND ', $where) : '';
        $sql = "SELECT COUNT(*) FROM `home_hero_slides` s {$whereClause}";

        return (int) self::fetchColumn($sql, $params);
    }

    /**
     * Soft-delete or permanently delete a hero slide.
     *
     * @param int $id
     * @param int|null $deletedBy
     * @param bool $force
     * @return bool
     */
    public static function softDelete(int $id, ?int $deletedBy = null, bool $force = false): bool
    {
        if ($force) {
            $sql = 'DELETE FROM `home_hero_slides` WHERE `id` = :id';
            return self::execute($sql, [':id' => $id]) > 0;
        }

        $sql = 'UPDATE `home_hero_slides` SET `deleted_at` = NOW(), `deleted_by` = :deleted_by, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NULL';
        return self::execute($sql, [':id' => $id, ':deleted_by' => $deletedBy]) > 0;
    }

    /**
     * Restore a soft-deleted hero slide.
     *
     * @param int $id
     * @return bool
     */
    public static function restore(int $id): bool
    {
        $sql = 'UPDATE `home_hero_slides` SET `deleted_at` = NULL, `deleted_by` = NULL, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NOT NULL';
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
     * Set status of a slide.
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

        $sql = 'UPDATE `home_hero_slides` SET `status` = :status, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NULL';
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
        $desktopMedia = null;
        if (!empty($row['desktop_media_id'])) {
            $desktopMedia = [
                'id' => (int) $row['desktop_media_id'],
                'filename' => $row['desktop_media_filename'] ?? null,
                'original_name' => $row['desktop_media_original_name'] ?? null,
                'file_path' => $row['desktop_media_file_path'] ?? null,
                'url' => !empty($row['desktop_media_file_path']) ? '/' . ltrim($row['desktop_media_file_path'], '/') : null,
                'mime_type' => $row['desktop_media_mime_type'] ?? null,
                'alt_text' => $row['desktop_media_alt_text'] ?? null,
            ];
        }

        $mobileMedia = null;
        if (!empty($row['mobile_media_id'])) {
            $mobileMedia = [
                'id' => (int) $row['mobile_media_id'],
                'filename' => $row['mobile_media_filename'] ?? null,
                'original_name' => $row['mobile_media_original_name'] ?? null,
                'file_path' => $row['mobile_media_file_path'] ?? null,
                'url' => !empty($row['mobile_media_file_path']) ? '/' . ltrim($row['mobile_media_file_path'], '/') : null,
                'mime_type' => $row['mobile_media_mime_type'] ?? null,
                'alt_text' => $row['mobile_media_alt_text'] ?? null,
            ];
        }

        return [
            'id' => (int) $row['id'],
            'title' => $row['title'],
            'subtitle' => $row['subtitle'] ?? null,
            'desktop_media_id' => !empty($row['desktop_media_id']) ? (int) $row['desktop_media_id'] : null,
            'desktop_media' => $desktopMedia,
            'mobile_media_id' => !empty($row['mobile_media_id']) ? (int) $row['mobile_media_id'] : null,
            'mobile_media' => $mobileMedia,
            'cta_label' => $row['cta_label'] ?? null,
            'cta_url' => $row['cta_url'] ?? null,
            'display_order' => (int) ($row['display_order'] ?? 0),
            'start_date' => $row['start_date'] ?? null,
            'end_date' => $row['end_date'] ?? null,
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
     * @param array $slide
     * @return array
     */
    public static function formatDetail(array $slide): array
    {
        $desktopMedia = null;
        if (!empty($slide['desktop_media_id'])) {
            $desktopMedia = Media::findById((int) $slide['desktop_media_id']);
        }

        $mobileMedia = null;
        if (!empty($slide['mobile_media_id'])) {
            $mobileMedia = Media::findById((int) $slide['mobile_media_id']);
        }

        return [
            'id' => (int) $slide['id'],
            'title' => $slide['title'],
            'subtitle' => $slide['subtitle'] ?? null,
            'desktop_media_id' => !empty($slide['desktop_media_id']) ? (int) $slide['desktop_media_id'] : null,
            'desktop_media' => $desktopMedia,
            'mobile_media_id' => !empty($slide['mobile_media_id']) ? (int) $slide['mobile_media_id'] : null,
            'mobile_media' => $mobileMedia,
            'cta_label' => $slide['cta_label'] ?? null,
            'cta_url' => $slide['cta_url'] ?? null,
            'display_order' => (int) ($slide['display_order'] ?? 0),
            'start_date' => $slide['start_date'] ?? null,
            'end_date' => $slide['end_date'] ?? null,
            'status' => $slide['status'],
            'created_at' => $slide['created_at'],
            'updated_at' => $slide['updated_at'],
            'deleted_at' => $slide['deleted_at'] ?? null,
            'deleted_by' => !empty($slide['deleted_by']) ? (int) $slide['deleted_by'] : null,
        ];
    }
}
