<?php

namespace App\Models;

use App\Utils\Database;
use PDO;

class Page extends BaseModel
{
    public const ALLOWED_STATUSES = ['published', 'draft'];
    public const SEEDED_SYSTEM_SLUGS = ['about-us', 'terms-conditions', 'refund-policy', 'privacy-policy'];

    /**
     * Create a new page.
     *
     * @param array $data
     * @return int
     */
    public static function create(array $data): int
    {
        $sql = 'INSERT INTO `pages` (
            `title`, `slug`, `subtitle`, `hero_media_id`, `content`,
            `seo_title`, `seo_description`, `status`, `created_at`, `updated_at`
        ) VALUES (
            :title, :slug, :subtitle, :hero_media_id, :content,
            :seo_title, :seo_description, :status, NOW(), NOW()
        )';

        self::execute($sql, [
            ':title' => $data['title'],
            ':slug' => $data['slug'],
            ':subtitle' => $data['subtitle'] ?? null,
            ':hero_media_id' => !empty($data['hero_media_id']) ? (int) $data['hero_media_id'] : null,
            ':content' => $data['content'] ?? '',
            ':seo_title' => $data['seo_title'] ?? null,
            ':seo_description' => $data['seo_description'] ?? null,
            ':status' => in_array($data['status'] ?? '', self::ALLOWED_STATUSES, true) ? $data['status'] : 'published',
        ]);

        return (int) self::lastInsertId();
    }

    /**
     * Update an existing page.
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
            'title', 'slug', 'subtitle', 'hero_media_id', 'content',
            'seo_title', 'seo_description', 'status'
        ];

        foreach ($allowedColumns as $col) {
            if (array_key_exists($col, $data)) {
                $fields[] = "`{$col}` = :{$col}";
                if ($col === 'hero_media_id') {
                    $params[":{$col}"] = !empty($data[$col]) ? (int) $data[$col] : null;
                } elseif ($col === 'status') {
                    $params[":{$col}"] = in_array($data[$col], self::ALLOWED_STATUSES, true) ? $data[$col] : 'published';
                } else {
                    $params[":{$col}"] = $data[$col];
                }
            }
        }

        if (empty($fields)) {
            return false;
        }

        $fields[] = '`updated_at` = NOW()';
        $sql = 'UPDATE `pages` SET ' . implode(', ', $fields) . ' WHERE `id` = :id';

        return self::execute($sql, $params) > 0;
    }

    /**
     * Find a single page by primary ID.
     *
     * @param int $id
     * @param bool $includeDeleted
     * @return array|null
     */
    public static function findById(int $id, bool $includeDeleted = false): ?array
    {
        $sql = 'SELECT p.* FROM `pages` p WHERE p.`id` = :id';
        if (!$includeDeleted) {
            $sql .= ' AND p.`deleted_at` IS NULL';
        }
        $sql .= ' LIMIT 1';

        $page = self::fetchOne($sql, [':id' => $id]);
        if (!$page) {
            return null;
        }

        return self::formatDetail($page);
    }

    /**
     * Find a single page by slug.
     *
     * @param string $slug
     * @param bool $includeDeleted
     * @return array|null
     */
    public static function findBySlug(string $slug, bool $includeDeleted = false): ?array
    {
        $sql = 'SELECT p.* FROM `pages` p WHERE p.`slug` = :slug';
        if (!$includeDeleted) {
            $sql .= ' AND p.`deleted_at` IS NULL';
        }
        $sql .= ' LIMIT 1';

        $page = self::fetchOne($sql, [':slug' => $slug]);
        if (!$page) {
            return null;
        }

        return self::formatDetail($page);
    }

    /**
     * Retrieve paginated pages list based on search/filters.
     *
     * @param array $filters
     * @return array
     */
    public static function all(array $filters = []): array
    {
        $where = [];
        $params = [];

        // Active vs deleted
        if (empty($filters['include_deleted'])) {
            $where[] = 'p.`deleted_at` IS NULL';
        }

        // Search in title, subtitle, slug, content
        if (!empty($filters['search'])) {
            $where[] = '(p.`title` LIKE :search1 OR p.`subtitle` LIKE :search2 OR p.`slug` LIKE :search3 OR p.`content` LIKE :search4)';
            $searchVal = '%' . $filters['search'] . '%';
            $params[':search1'] = $searchVal;
            $params[':search2'] = $searchVal;
            $params[':search3'] = $searchVal;
            $params[':search4'] = $searchVal;
        }

        // Status filter
        if (!empty($filters['status']) && in_array($filters['status'], self::ALLOWED_STATUSES, true)) {
            $where[] = 'p.`status` = :status';
            $params[':status'] = $filters['status'];
        }

        $whereClause = !empty($where) ? ' WHERE ' . implode(' AND ', $where) : '';

        // Sorting
        $allowedSortColumns = ['id', 'title', 'slug', 'status', 'created_at', 'updated_at'];
        $sortBy = in_array($filters['sort_by'] ?? '', $allowedSortColumns, true) ? $filters['sort_by'] : 'created_at';
        $sortOrder = strtoupper($filters['sort_order'] ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';

        // Pagination
        $page = max(1, (int) ($filters['page'] ?? 1));
        $limit = max(1, min(100, (int) ($filters['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;

        $sql = "SELECT p.*,
                       m.`filename` AS hero_media_filename,
                       m.`original_name` AS hero_media_original_name,
                       m.`file_path` AS hero_media_file_path,
                       m.`mime_type` AS hero_media_mime_type,
                       m.`alt_text` AS hero_media_alt_text
                FROM `pages` p
                LEFT JOIN `media` m ON p.`hero_media_id` = m.`id`
                {$whereClause}
                ORDER BY p.`{$sortBy}` {$sortOrder}
                LIMIT {$limit} OFFSET {$offset}";

        $rows = self::fetchAll($sql, $params);

        return array_map(function ($row) {
            return self::formatSummary($row);
        }, $rows);
    }

    /**
     * Get total count of pages matching filters.
     *
     * @param array $filters
     * @return int
     */
    public static function count(array $filters = []): int
    {
        $where = [];
        $params = [];

        if (empty($filters['include_deleted'])) {
            $where[] = 'p.`deleted_at` IS NULL';
        }

        if (!empty($filters['search'])) {
            $where[] = '(p.`title` LIKE :search1 OR p.`subtitle` LIKE :search2 OR p.`slug` LIKE :search3 OR p.`content` LIKE :search4)';
            $searchVal = '%' . $filters['search'] . '%';
            $params[':search1'] = $searchVal;
            $params[':search2'] = $searchVal;
            $params[':search3'] = $searchVal;
            $params[':search4'] = $searchVal;
        }

        if (!empty($filters['status']) && in_array($filters['status'], self::ALLOWED_STATUSES, true)) {
            $where[] = 'p.`status` = :status';
            $params[':status'] = $filters['status'];
        }

        $whereClause = !empty($where) ? ' WHERE ' . implode(' AND ', $where) : '';
        $sql = "SELECT COUNT(*) FROM `pages` p {$whereClause}";

        return (int) self::fetchColumn($sql, $params);
    }

    /**
     * Soft-delete or permanently delete a page.
     *
     * @param int $id
     * @param int|null $deletedBy
     * @param bool $force
     * @return bool
     */
    public static function delete(int $id, ?int $deletedBy = null, bool $force = false): bool
    {
        if ($force) {
            $sql = 'DELETE FROM `pages` WHERE `id` = :id';
            return self::execute($sql, [':id' => $id]) > 0;
        }

        $sql = 'UPDATE `pages` SET `deleted_at` = NOW(), `deleted_by` = :deleted_by, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NULL';
        return self::execute($sql, [':id' => $id, ':deleted_by' => $deletedBy]) > 0;
    }

    /**
     * Restore a soft-deleted page.
     *
     * @param int $id
     * @return bool
     */
    public static function restore(int $id): bool
    {
        $sql = 'UPDATE `pages` SET `deleted_at` = NULL, `deleted_by` = NULL, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NOT NULL';
        return self::execute($sql, [':id' => $id]) > 0;
    }

    /**
     * Set the status of a page.
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

        $sql = 'UPDATE `pages` SET `status` = :status, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NULL';
        return self::execute($sql, [':id' => $id, ':status' => $status]) > 0;
    }

    /**
     * Check if a slug already exists in pages table.
     *
     * @param string $slug
     * @param int|null $excludeId
     * @return bool
     */
    public static function isSlugTaken(string $slug, ?int $excludeId = null): bool
    {
        $sql = 'SELECT COUNT(*) FROM `pages` WHERE `slug` = :slug';
        $params = [':slug' => $slug];

        if ($excludeId !== null) {
            $sql .= ' AND `id` != :exclude_id';
            $params[':exclude_id'] = $excludeId;
        }

        return ((int) self::fetchColumn($sql, $params)) > 0;
    }

    /**
     * Generate a unique URL-safe slug from a page title.
     *
     * @param string $title
     * @param int|null $excludeId
     * @return string
     */
    public static function generateUniqueSlug(string $title, ?int $excludeId = null): string
    {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title), '-'));
        if (empty($slug)) {
            $slug = 'page-' . time();
        }

        $baseSlug = $slug;
        $counter = 1;

        while (self::isSlugTaken($slug, $excludeId)) {
            $counter++;
            $slug = "{$baseSlug}-{$counter}";
        }

        return $slug;
    }

    /**
     * Format summary representation for list endpoints.
     *
     * @param array $row
     * @return array
     */
    public static function formatSummary(array $row): array
    {
        $heroMedia = null;
        if (!empty($row['hero_media_id'])) {
            $heroMedia = [
                'id' => (int) $row['hero_media_id'],
                'filename' => $row['hero_media_filename'] ?? null,
                'original_name' => $row['hero_media_original_name'] ?? null,
                'file_path' => $row['hero_media_file_path'] ?? null,
                'url' => !empty($row['hero_media_file_path']) ? '/' . ltrim($row['hero_media_file_path'], '/') : null,
                'mime_type' => $row['hero_media_mime_type'] ?? null,
                'alt_text' => $row['hero_media_alt_text'] ?? null,
            ];
        }

        return [
            'id' => (int) $row['id'],
            'slug' => $row['slug'],
            'title' => $row['title'],
            'subtitle' => $row['subtitle'] ?? null,
            'hero_media_id' => !empty($row['hero_media_id']) ? (int) $row['hero_media_id'] : null,
            'hero_media' => $heroMedia,
            'seo_title' => $row['seo_title'] ?? null,
            'seo_description' => $row['seo_description'] ?? null,
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
     * @param array $page
     * @return array
     */
    public static function formatDetail(array $page): array
    {
        $heroMedia = null;
        if (!empty($page['hero_media_id'])) {
            $heroMedia = Media::findById((int) $page['hero_media_id']);
        }

        return [
            'id' => (int) $page['id'],
            'slug' => $page['slug'],
            'title' => $page['title'],
            'subtitle' => $page['subtitle'] ?? null,
            'hero_media_id' => !empty($page['hero_media_id']) ? (int) $page['hero_media_id'] : null,
            'hero_media' => $heroMedia,
            'content' => $page['content'],
            'seo_title' => $page['seo_title'] ?? null,
            'seo_description' => $page['seo_description'] ?? null,
            'status' => $page['status'],
            'created_at' => $page['created_at'],
            'updated_at' => $page['updated_at'],
            'deleted_at' => $page['deleted_at'] ?? null,
            'deleted_by' => !empty($page['deleted_by']) ? (int) $page['deleted_by'] : null,
        ];
    }
}
