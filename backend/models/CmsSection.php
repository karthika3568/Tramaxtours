<?php

namespace App\Models;

use App\Utils\Database;
use PDO;

class CmsSection extends BaseModel
{
    public const ALLOWED_STATUSES = ['active', 'inactive'];

    /**
     * Create a new CMS section.
     *
     * @param array $data
     * @return int
     */
    public static function create(array $data): int
    {
        $sql = 'INSERT INTO `cms_sections` (
            `section_key`, `title`, `subtitle`, `content`, `media_id`,
            `display_order`, `status`, `created_at`, `updated_at`
        ) VALUES (
            :section_key, :title, :subtitle, :content, :media_id,
            :display_order, :status, NOW(), NOW()
        )';

        self::execute($sql, [
            ':section_key' => $data['section_key'],
            ':title' => $data['title'],
            ':subtitle' => $data['subtitle'] ?? null,
            ':content' => $data['content'] ?? null,
            ':media_id' => !empty($data['media_id']) ? (int) $data['media_id'] : null,
            ':display_order' => isset($data['display_order']) ? (int) $data['display_order'] : 0,
            ':status' => in_array($data['status'] ?? '', self::ALLOWED_STATUSES, true) ? $data['status'] : 'active',
        ]);

        return (int) self::lastInsertId();
    }

    /**
     * Update an existing CMS section.
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
            'section_key', 'title', 'subtitle', 'content', 'media_id',
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
                } else {
                    $params[":{$col}"] = $data[$col];
                }
            }
        }

        if (empty($fields)) {
            return false;
        }

        $fields[] = '`updated_at` = NOW()';
        $sql = 'UPDATE `cms_sections` SET ' . implode(', ', $fields) . ' WHERE `id` = :id';

        return self::execute($sql, $params) > 0;
    }

    /**
     * Find a single CMS section by primary ID.
     *
     * @param int $id
     * @param bool $includeDeleted
     * @return array|null
     */
    public static function findById(int $id, bool $includeDeleted = false): ?array
    {
        $sql = 'SELECT s.* FROM `cms_sections` s WHERE s.`id` = :id';
        if (!$includeDeleted) {
            $sql .= ' AND s.`deleted_at` IS NULL';
        }
        $sql .= ' LIMIT 1';

        $section = self::fetchOne($sql, [':id' => $id]);
        if (!$section) {
            return null;
        }

        return self::formatDetail($section);
    }

    /**
     * Find a single CMS section by section_key.
     *
     * @param string $sectionKey
     * @param bool $includeDeleted
     * @return array|null
     */
    public static function findBySectionKey(string $sectionKey, bool $includeDeleted = false): ?array
    {
        $sql = 'SELECT s.* FROM `cms_sections` s WHERE s.`section_key` = :section_key';
        if (!$includeDeleted) {
            $sql .= ' AND s.`deleted_at` IS NULL';
        }
        $sql .= ' LIMIT 1';

        $section = self::fetchOne($sql, [':section_key' => $sectionKey]);
        if (!$section) {
            return null;
        }

        return self::formatDetail($section);
    }

    /**
     * Retrieve paginated CMS sections list based on search/filters.
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

        // Search in title, subtitle, section_key, content
        if (!empty($filters['search'])) {
            $where[] = '(s.`title` LIKE :search1 OR s.`subtitle` LIKE :search2 OR s.`section_key` LIKE :search3 OR s.`content` LIKE :search4)';
            $searchVal = '%' . $filters['search'] . '%';
            $params[':search1'] = $searchVal;
            $params[':search2'] = $searchVal;
            $params[':search3'] = $searchVal;
            $params[':search4'] = $searchVal;
        }

        // Status filter
        if (!empty($filters['status']) && in_array($filters['status'], self::ALLOWED_STATUSES, true)) {
            $where[] = 's.`status` = :status';
            $params[':status'] = $filters['status'];
        }

        $whereClause = !empty($where) ? ' WHERE ' . implode(' AND ', $where) : '';

        // Sorting
        $allowedSortColumns = ['id', 'section_key', 'title', 'display_order', 'status', 'created_at', 'updated_at'];
        $sortBy = in_array($filters['sort_by'] ?? '', $allowedSortColumns, true) ? $filters['sort_by'] : 'display_order';
        $sortOrder = strtoupper($filters['sort_order'] ?? 'ASC') === 'DESC' ? 'DESC' : 'ASC';

        // Pagination
        $page = max(1, (int) ($filters['page'] ?? 1));
        $limit = max(1, min(100, (int) ($filters['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;

        $sql = "SELECT s.*,
                       m.`filename` AS media_filename,
                       m.`original_name` AS media_original_name,
                       m.`file_path` AS media_file_path,
                       m.`mime_type` AS media_mime_type,
                       m.`alt_text` AS media_alt_text
                FROM `cms_sections` s
                LEFT JOIN `media` m ON s.`media_id` = m.`id`
                {$whereClause}
                ORDER BY s.`{$sortBy}` {$sortOrder}, s.`id` ASC
                LIMIT {$limit} OFFSET {$offset}";

        $rows = self::fetchAll($sql, $params);

        return array_map(function ($row) {
            return self::formatSummary($row);
        }, $rows);
    }

    /**
     * Get total count of CMS sections matching filters.
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
            $where[] = '(s.`title` LIKE :search1 OR s.`subtitle` LIKE :search2 OR s.`section_key` LIKE :search3 OR s.`content` LIKE :search4)';
            $searchVal = '%' . $filters['search'] . '%';
            $params[':search1'] = $searchVal;
            $params[':search2'] = $searchVal;
            $params[':search3'] = $searchVal;
            $params[':search4'] = $searchVal;
        }

        if (!empty($filters['status']) && in_array($filters['status'], self::ALLOWED_STATUSES, true)) {
            $where[] = 's.`status` = :status';
            $params[':status'] = $filters['status'];
        }

        $whereClause = !empty($where) ? ' WHERE ' . implode(' AND ', $where) : '';
        $sql = "SELECT COUNT(*) FROM `cms_sections` s {$whereClause}";

        return (int) self::fetchColumn($sql, $params);
    }

    /**
     * Soft-delete or permanently delete a CMS section.
     *
     * @param int $id
     * @param int|null $deletedBy
     * @param bool $force
     * @return bool
     */
    public static function softDelete(int $id, ?int $deletedBy = null, bool $force = false): bool
    {
        if ($force) {
            $sql = 'DELETE FROM `cms_sections` WHERE `id` = :id';
            return self::execute($sql, [':id' => $id]) > 0;
        }

        $sql = 'UPDATE `cms_sections` SET `deleted_at` = NOW(), `deleted_by` = :deleted_by, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NULL';
        return self::execute($sql, [':id' => $id, ':deleted_by' => $deletedBy]) > 0;
    }

    /**
     * Restore a soft-deleted CMS section.
     *
     * @param int $id
     * @return bool
     */
    public static function restore(int $id): bool
    {
        $sql = 'UPDATE `cms_sections` SET `deleted_at` = NULL, `deleted_by` = NULL, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NOT NULL';
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
     * Set status of a section.
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

        $sql = 'UPDATE `cms_sections` SET `status` = :status, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NULL';
        return self::execute($sql, [':id' => $id, ':status' => $status]) > 0;
    }

    /**
     * Check if a section_key already exists in cms_sections.
     *
     * @param string $sectionKey
     * @param int|null $excludeId
     * @return bool
     */
    public static function isSectionKeyTaken(string $sectionKey, ?int $excludeId = null): bool
    {
        $sql = 'SELECT COUNT(*) FROM `cms_sections` WHERE `section_key` = :section_key';
        $params = [':section_key' => $sectionKey];

        if ($excludeId !== null) {
            $sql .= ' AND `id` != :exclude_id';
            $params[':exclude_id'] = $excludeId;
        }

        return ((int) self::fetchColumn($sql, $params)) > 0;
    }

    /**
     * Generate a unique URL/CMS-safe section_key from a title.
     *
     * @param string $title
     * @param int|null $excludeId
     * @return string
     */
    public static function generateUniqueSectionKey(string $title, ?int $excludeId = null): string
    {
        $key = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title), '-'));
        if (empty($key)) {
            $key = 'section-' . time();
        }

        $baseKey = $key;
        $counter = 1;

        while (self::isSectionKeyTaken($key, $excludeId)) {
            $counter++;
            $key = "{$baseKey}-{$counter}";
        }

        return $key;
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
            'section_key' => $row['section_key'],
            'title' => $row['title'],
            'subtitle' => $row['subtitle'] ?? null,
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
     * @param array $section
     * @return array
     */
    public static function formatDetail(array $section): array
    {
        $media = null;
        if (!empty($section['media_id'])) {
            $media = Media::findById((int) $section['media_id']);
        }

        return [
            'id' => (int) $section['id'],
            'section_key' => $section['section_key'],
            'title' => $section['title'],
            'subtitle' => $section['subtitle'] ?? null,
            'content' => $section['content'] ?? null,
            'media_id' => !empty($section['media_id']) ? (int) $section['media_id'] : null,
            'media' => $media,
            'display_order' => (int) ($section['display_order'] ?? 0),
            'status' => $section['status'],
            'created_at' => $section['created_at'],
            'updated_at' => $section['updated_at'],
            'deleted_at' => $section['deleted_at'] ?? null,
            'deleted_by' => !empty($section['deleted_by']) ? (int) $section['deleted_by'] : null,
        ];
    }
}
