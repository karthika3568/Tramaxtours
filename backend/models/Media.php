<?php

namespace App\Models;

use App\Utils\Env;

class Media extends BaseModel
{
    /**
     * Create a new media record.
     *
     * @param array $data
     * @return int
     */
    public static function create(array $data): int
    {
        $sql = 'INSERT INTO `media` (`filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`)
                VALUES (:filename, :original_name, :file_path, :file_size, :mime_type, :alt_text, :caption, :uploaded_by, NOW(), NOW())';

        self::execute($sql, [
            ':filename' => $data['filename'],
            ':original_name' => $data['original_name'],
            ':file_path' => $data['file_path'],
            ':file_size' => (int) $data['file_size'],
            ':mime_type' => $data['mime_type'],
            ':alt_text' => $data['alt_text'] ?? null,
            ':caption' => $data['caption'] ?? null,
            ':uploaded_by' => $data['uploaded_by'] ?? null,
        ]);

        return (int) self::lastInsertId();
    }

    /**
     * Find media item by ID with uploader information.
     *
     * @param int $id
     * @return array|null
     */
    public static function findById(int $id): ?array
    {
        $sql = 'SELECT m.*, u.`name` AS uploader_name, u.`email` AS uploader_email
                FROM `media` m
                LEFT JOIN `users` u ON m.`uploaded_by` = u.`id`
                WHERE m.`id` = :id
                LIMIT 1';

        $row = self::fetchOne($sql, [':id' => $id]);
        return $row ? self::formatMediaResponse($row) : null;
    }

    /**
     * Paginate media items with optional search and filters.
     *
     * @param array $filters
     * @param int $page
     * @param int $limit
     * @return array
     */
    public static function paginate(array $filters = [], int $page = 1, int $limit = 20): array
    {
        $page = max(1, $page);
        $limit = min(100, max(1, $limit));
        $offset = ($page - 1) * $limit;

        $where = ['1=1'];
        $params = [];

        // Search in original_name, alt_text, caption, filename
        if (!empty($filters['search'])) {
            $where[] = '(m.`original_name` LIKE :search1 OR m.`alt_text` LIKE :search2 OR m.`caption` LIKE :search3 OR m.`filename` LIKE :search4)';
            $searchTerm = '%' . trim($filters['search']) . '%';
            $params[':search1'] = $searchTerm;
            $params[':search2'] = $searchTerm;
            $params[':search3'] = $searchTerm;
            $params[':search4'] = $searchTerm;
        }

        // Filter by MIME type
        if (!empty($filters['mime_type'])) {
            $where[] = 'm.`mime_type` = :mime_type';
            $params[':mime_type'] = trim($filters['mime_type']);
        }

        // Filter by general type (image, document, etc.)
        if (!empty($filters['type'])) {
            $type = strtolower(trim($filters['type']));
            if ($type === 'image') {
                $where[] = "m.`mime_type` LIKE 'image/%'";
            } elseif ($type === 'document' || $type === 'pdf') {
                $where[] = "m.`mime_type` = 'application/pdf'";
            }
        }

        // Filter by uploader
        if (!empty($filters['uploaded_by'])) {
            $where[] = 'm.`uploaded_by` = :uploaded_by';
            $params[':uploaded_by'] = (int) $filters['uploaded_by'];
        }

        // Filter by date range
        if (!empty($filters['date_from'])) {
            $where[] = 'm.`created_at` >= :date_from';
            $params[':date_from'] = $filters['date_from'] . ' 00:00:00';
        }
        if (!empty($filters['date_to'])) {
            $where[] = 'm.`created_at` <= :date_to';
            $params[':date_to'] = $filters['date_to'] . ' 23:59:59';
        }

        $whereSql = implode(' AND ', $where);

        // Count total matching records
        $countSql = "SELECT COUNT(*) FROM `media` m WHERE {$whereSql}";
        $total = (int) self::fetchColumn($countSql, $params);

        // Sorting
        $sortBy = in_array($filters['sort_by'] ?? '', ['id', 'created_at', 'file_size', 'original_name'], true)
            ? $filters['sort_by']
            : 'id';
        $order = strtolower($filters['order'] ?? '') === 'asc' ? 'ASC' : 'DESC';

        // Fetch paginated records
        $dataSql = "SELECT m.*, u.`name` AS uploader_name, u.`email` AS uploader_email
                    FROM `media` m
                    LEFT JOIN `users` u ON m.`uploaded_by` = u.`id`
                    WHERE {$whereSql}
                    ORDER BY m.`{$sortBy}` {$order}
                    LIMIT {$limit} OFFSET {$offset}";

        $rows = self::fetchAll($dataSql, $params);
        $items = array_map([self::class, 'formatMediaResponse'], $rows);

        $totalPages = $total > 0 ? (int) ceil($total / $limit) : 1;

        return [
            'items' => $items,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'total_pages' => $totalPages,
                'has_next' => $page < $totalPages,
                'has_prev' => $page > 1,
            ],
        ];
    }

    /**
     * Update media metadata (alt text, caption).
     *
     * @param int $id
     * @param string|null $altText
     * @param string|null $caption
     * @return bool
     */
    public static function updateMetadata(int $id, ?string $altText, ?string $caption): bool
    {
        $sql = 'UPDATE `media`
                SET `alt_text` = :alt_text, `caption` = :caption, `updated_at` = NOW()
                WHERE `id` = :id';

        return self::execute($sql, [
            ':id' => $id,
            ':alt_text' => $altText,
            ':caption' => $caption,
        ]) > 0;
    }

    /**
     * Delete media record from database.
     *
     * @param int $id
     * @return bool
     */
    public static function delete(int $id): bool
    {
        $sql = 'DELETE FROM `media` WHERE `id` = :id';
        return self::execute($sql, [':id' => $id]) > 0;
    }

    /**
     * Check active references to this media in other database tables.
     *
     * @param int $mediaId
     * @return array
     */
    public static function getUsageReferences(int $mediaId): array
    {
        $references = [];

        $checks = [
            'destinations_featured' => "SELECT COUNT(*) FROM `destinations` WHERE `featured_image_id` = :id",
            'destinations_intro' => "SELECT COUNT(*) FROM `destinations` WHERE `intro_media_id` = :id",
            'destinations_og' => "SELECT COUNT(*) FROM `destinations` WHERE `og_image_id` = :id",
            'destination_gallery' => "SELECT COUNT(*) FROM `destination_gallery` WHERE `media_id` = :id",
            'destination_sections' => "SELECT COUNT(*) FROM `destination_sections` WHERE `media_id` = :id",
            'tours_featured' => "SELECT COUNT(*) FROM `tours` WHERE `featured_image_id` = :id",
            'tours_og' => "SELECT COUNT(*) FROM `tours` WHERE `og_image_id` = :id",
            'tour_gallery' => "SELECT COUNT(*) FROM `tour_gallery` WHERE `media_id` = :id",
            'tour_places' => "SELECT COUNT(*) FROM `tour_places` WHERE `media_id` = :id",
            'home_hero_slides' => "SELECT COUNT(*) FROM `home_hero_slides` WHERE :id IN (`desktop_media_id`, `mobile_media_id`)",
            'home_benefits' => "SELECT COUNT(*) FROM `home_benefits` WHERE `media_id` = :id",
            'cms_sections' => "SELECT COUNT(*) FROM `cms_sections` WHERE `media_id` = :id",
            'pages' => "SELECT COUNT(*) FROM `pages` WHERE `hero_media_id` = :id",
            'review_media' => "SELECT COUNT(*) FROM `review_media` WHERE `media_id` = :id",
        ];

        foreach ($checks as $key => $sql) {
            $count = (int) self::fetchColumn($sql, [':id' => $mediaId]);
            if ($count > 0) {
                $references[$key] = $count;
            }
        }

        return $references;
    }

    /**
     * Format media record for API output with public URL and readable file size.
     *
     * @param array $media
     * @return array
     */
    public static function formatMediaResponse(array $media): array
    {
        $baseUrl = rtrim((string) Env::get('APP_URL', 'http://localhost:8000'), '/');
        $publicUrl = $baseUrl . '/' . ltrim($media['file_path'], '/');

        return [
            'id' => (int) $media['id'],
            'filename' => $media['filename'],
            'original_name' => $media['original_name'],
            'file_path' => $media['file_path'],
            'url' => $publicUrl,
            'file_size' => (int) $media['file_size'],
            'file_size_human' => self::formatBytes((int) $media['file_size']),
            'mime_type' => $media['mime_type'],
            'is_image' => str_starts_with($media['mime_type'], 'image/'),
            'alt_text' => $media['alt_text'] ?? null,
            'caption' => $media['caption'] ?? null,
            'uploaded_by' => $media['uploaded_by'] ? (int) $media['uploaded_by'] : null,
            'uploader' => !empty($media['uploader_name']) ? [
                'id' => (int) $media['uploaded_by'],
                'name' => $media['uploader_name'],
                'email' => $media['uploader_email'] ?? null,
            ] : null,
            'created_at' => $media['created_at'],
            'updated_at' => $media['updated_at'],
        ];
    }

    /**
     * Format bytes into human readable format (KB, MB, GB).
     *
     * @param int $bytes
     * @param int $precision
     * @return string
     */
    private static function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
