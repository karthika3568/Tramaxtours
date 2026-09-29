<?php

namespace App\Models;

use App\Utils\Database;
use PDO;

class Destination extends BaseModel
{
    /**
     * Allowed status values.
     */
    public const ALLOWED_STATUSES = ['draft', 'published', 'archived'];

    /**
     * Convert an arbitrary text string into a URL-friendly, lowercase slug.
     *
     * @param string $text
     * @return string
     */
    public static function slugify(string $text): string
    {
        // Lowercase and trim
        $slug = strtolower(trim($text));

        // Replace non-alphanumeric characters with hyphens
        $slug = preg_replace('/[^a-z0-9]+/i', '-', $slug);

        // Trim leading and trailing hyphens
        $slug = trim((string) $slug, '-');

        return $slug ?: 'destination-' . bin2hex(random_bytes(3));
    }

    /**
     * Check whether a slug already exists in the destinations table.
     *
     * @param string $slug
     * @param int|null $excludeId
     * @return bool
     */
    public static function slugExists(string $slug, ?int $excludeId = null): bool
    {
        $sql = 'SELECT COUNT(*) FROM `destinations` WHERE `slug` = :slug';
        $params = [':slug' => $slug];

        if ($excludeId !== null) {
            $sql .= ' AND `id` != :exclude_id';
            $params[':exclude_id'] = $excludeId;
        }

        return ((int) self::fetchColumn($sql, $params)) > 0;
    }

    /**
     * Generate a unique slug by appending numeric suffixes if necessary.
     *
     * @param string $name
     * @param int|null $excludeId
     * @return string
     */
    public static function generateUniqueSlug(string $name, ?int $excludeId = null): string
    {
        $baseSlug = self::slugify($name);
        $slug = $baseSlug;
        $counter = 2;

        while (self::slugExists($slug, $excludeId)) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    /**
     * Create a new destination record.
     *
     * @param array $data
     * @return int
     */
    public static function create(array $data): int
    {
        $sql = 'INSERT INTO `destinations` (
            `name`, `slug`, `hero_title`, `hero_subtitle`, `short_description`,
            `intro_heading`, `intro_label`, `intro_content`, `intro_media_id`,
            `language`, `currency`, `religion`, `heritage`, `timezone`, `latitude`, `longitude`,
            `featured_image_id`, `seo_title`, `seo_description`, `og_image_id`,
            `is_featured`, `display_order`, `status`, `created_at`, `updated_at`
        ) VALUES (
            :name, :slug, :hero_title, :hero_subtitle, :short_description,
            :intro_heading, :intro_label, :intro_content, :intro_media_id,
            :language, :currency, :religion, :heritage, :timezone, :latitude, :longitude,
            :featured_image_id, :seo_title, :seo_description, :og_image_id,
            :is_featured, :display_order, :status, NOW(), NOW()
        )';

        self::execute($sql, [
            ':name' => $data['name'],
            ':slug' => $data['slug'],
            ':hero_title' => $data['hero_title'] ?? null,
            ':hero_subtitle' => $data['hero_subtitle'] ?? null,
            ':short_description' => $data['short_description'] ?? null,
            ':intro_heading' => $data['intro_heading'] ?? null,
            ':intro_label' => $data['intro_label'] ?? null,
            ':intro_content' => $data['intro_content'] ?? null,
            ':intro_media_id' => !empty($data['intro_media_id']) ? (int) $data['intro_media_id'] : null,
            ':language' => $data['language'] ?? null,
            ':currency' => $data['currency'] ?? null,
            ':religion' => $data['religion'] ?? null,
            ':heritage' => $data['heritage'] ?? null,
            ':timezone' => $data['timezone'] ?? null,
            ':latitude' => isset($data['latitude']) && $data['latitude'] !== '' && $data['latitude'] !== null ? (float) $data['latitude'] : null,
            ':longitude' => isset($data['longitude']) && $data['longitude'] !== '' && $data['longitude'] !== null ? (float) $data['longitude'] : null,
            ':featured_image_id' => !empty($data['featured_image_id']) ? (int) $data['featured_image_id'] : null,
            ':seo_title' => $data['seo_title'] ?? null,
            ':seo_description' => $data['seo_description'] ?? null,
            ':og_image_id' => !empty($data['og_image_id']) ? (int) $data['og_image_id'] : null,
            ':is_featured' => !empty($data['is_featured']) ? 1 : 0,
            ':display_order' => isset($data['display_order']) ? (int) $data['display_order'] : 0,
            ':status' => in_array($data['status'] ?? '', self::ALLOWED_STATUSES, true) ? $data['status'] : 'draft',
        ]);

        $destinationId = (int) self::lastInsertId();

        if (isset($data['gallery']) && is_array($data['gallery'])) {
            self::syncGallery($destinationId, $data['gallery']);
        }
        if (isset($data['sections']) && is_array($data['sections'])) {
            self::syncSections($destinationId, $data['sections']);
        }
        if (isset($data['faqs']) && is_array($data['faqs'])) {
            self::syncFaqs($destinationId, $data['faqs']);
        }

        return $destinationId;
    }

    /**
     * Synchronize gallery items for a destination.
     *
     * @param int $destinationId
     * @param array $gallery
     * @return void
     */
    public static function syncGallery(int $destinationId, array $gallery): void
    {
        self::execute('DELETE FROM `destination_gallery` WHERE `destination_id` = :id', [':id' => $destinationId]);

        if (empty($gallery)) {
            return;
        }

        $pdo = self::db();
        $stmt = $pdo->prepare('INSERT INTO `destination_gallery` (
            `destination_id`, `media_id`, `display_order`, `is_hero_slide`, `caption`, `created_at`
        ) VALUES (
            :destination_id, :media_id, :display_order, :is_hero_slide, :caption, NOW()
        )');

        $order = 0;
        foreach ($gallery as $item) {
            $mediaId = !empty($item['media_id']) ? (int) $item['media_id'] : (!empty($item['id']) ? (int) $item['id'] : 0);
            if ($mediaId <= 0) continue;

            $stmt->execute([
                ':destination_id' => $destinationId,
                ':media_id' => $mediaId,
                ':display_order' => isset($item['display_order']) ? (int) $item['display_order'] : $order++,
                ':is_hero_slide' => !empty($item['is_hero_slide']) ? 1 : 0,
                ':caption' => !empty($item['caption']) ? (string) $item['caption'] : null,
            ]);
        }
    }

    /**
     * Synchronize sections for a destination.
     *
     * @param int $destinationId
     * @param array $sections
     * @return void
     */
    public static function syncSections(int $destinationId, array $sections): void
    {
        self::execute('DELETE FROM `destination_sections` WHERE `destination_id` = :id', [':id' => $destinationId]);

        if (empty($sections)) {
            return;
        }

        $pdo = self::db();
        $stmt = $pdo->prepare('INSERT INTO `destination_sections` (
            `destination_id`, `section_type`, `title`, `subtitle`, `content`, `media_id`, `display_order`, `status`, `created_at`, `updated_at`
        ) VALUES (
            :destination_id, :section_type, :title, :subtitle, :content, :media_id, :display_order, :status, NOW(), NOW()
        )');

        $order = 0;
        foreach ($sections as $sec) {
            $title = trim((string) ($sec['title'] ?? ''));
            $content = (string) ($sec['content'] ?? '');
            if (empty($title) && empty($content)) continue;

            $mediaId = !empty($sec['media_id']) ? (int) $sec['media_id'] : null;
            $sectionType = !empty($sec['section_type']) ? (string) $sec['section_type'] : 'custom';
            $status = in_array($sec['status'] ?? '', ['active', 'inactive'], true) ? $sec['status'] : 'active';

            $stmt->execute([
                ':destination_id' => $destinationId,
                ':section_type' => $sectionType,
                ':title' => $title ?: 'Section',
                ':subtitle' => !empty($sec['subtitle']) ? (string) $sec['subtitle'] : null,
                ':content' => $content,
                ':media_id' => $mediaId,
                ':display_order' => isset($sec['display_order']) ? (int) $sec['display_order'] : $order++,
                ':status' => $status,
            ]);
        }
    }

    /**
     * Synchronize FAQs for a destination.
     *
     * @param int $destinationId
     * @param array $faqs
     * @return void
     */
    public static function syncFaqs(int $destinationId, array $faqs): void
    {
        self::execute('DELETE FROM `destination_faqs` WHERE `destination_id` = :id', [':id' => $destinationId]);

        if (empty($faqs)) {
            return;
        }

        $pdo = self::db();
        $stmt = $pdo->prepare('INSERT INTO `destination_faqs` (
            `destination_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`
        ) VALUES (
            :destination_id, :question, :answer, :display_order, :status, NOW(), NOW()
        )');

        $order = 0;
        foreach ($faqs as $faq) {
            $question = trim((string) ($faq['question'] ?? ''));
            $answer = trim((string) ($faq['answer'] ?? ''));
            if (empty($question)) continue;

            $status = in_array($faq['status'] ?? '', ['published', 'draft'], true) ? $faq['status'] : 'published';

            $stmt->execute([
                ':destination_id' => $destinationId,
                ':question' => $question,
                ':answer' => $answer,
                ':display_order' => isset($faq['display_order']) ? (int) $faq['display_order'] : $order++,
                ':status' => $status,
            ]);
        }
    }

    /**
     * Update an existing destination.
     *
     * @param int $id
     * @param array $data
     * @return bool
     */
    public static function update(int $id, array $data): bool
    {
        // Sync child modules if provided in payload
        if (array_key_exists('gallery', $data) && is_array($data['gallery'])) {
            self::syncGallery($id, $data['gallery']);
        }
        if (array_key_exists('sections', $data) && is_array($data['sections'])) {
            self::syncSections($id, $data['sections']);
        }
        if (array_key_exists('faqs', $data) && is_array($data['faqs'])) {
            self::syncFaqs($id, $data['faqs']);
        }

        $fields = [];
        $params = [':id' => $id];

        $allowedColumns = [
            'name', 'slug', 'hero_title', 'hero_subtitle', 'short_description',
            'intro_heading', 'intro_label', 'intro_content', 'intro_media_id',
            'language', 'currency', 'religion', 'heritage', 'timezone', 'latitude', 'longitude',
            'featured_image_id', 'seo_title', 'seo_description', 'og_image_id',
            'is_featured', 'display_order', 'status'
        ];

        foreach ($allowedColumns as $col) {
            if (array_key_exists($col, $data)) {
                $fields[] = "`{$col}` = :{$col}";
                
                if (in_array($col, ['intro_media_id', 'featured_image_id', 'og_image_id'], true)) {
                    $params[":{$col}"] = !empty($data[$col]) ? (int) $data[$col] : null;
                } elseif ($col === 'is_featured') {
                    $params[":{$col}"] = !empty($data[$col]) ? 1 : 0;
                } elseif ($col === 'display_order') {
                    $params[":{$col}"] = (int) $data[$col];
                } elseif (in_array($col, ['latitude', 'longitude'], true)) {
                    $params[":{$col}"] = isset($data[$col]) && $data[$col] !== '' && $data[$col] !== null ? (float) $data[$col] : null;
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

        $sql = "UPDATE `destinations` SET {$setSql} WHERE `id` = :id";
        return self::execute($sql, $params) > 0;
    }

    /**
     * Set status directly (e.g. published, draft, archived).
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

        $sql = 'UPDATE `destinations` SET `status` = :status, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NULL';
        return self::execute($sql, [':id' => $id, ':status' => $status]) > 0;
    }

    /**
     * Delete destination record (soft delete by default, or hard delete if forced).
     *
     * @param int $id
     * @param int|null $deletedBy
     * @param bool $force
     * @return bool
     */
    public static function delete(int $id, ?int $deletedBy = null, bool $force = false): bool
    {
        if ($force) {
            $sql = 'DELETE FROM `destinations` WHERE `id` = :id';
            return self::execute($sql, [':id' => $id]) > 0;
        }

        $sql = 'UPDATE `destinations` SET `deleted_at` = NOW(), `deleted_by` = :deleted_by, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NULL';
        return self::execute($sql, [':id' => $id, ':deleted_by' => $deletedBy]) > 0;
    }

    /**
     * Restore a soft-deleted destination.
     *
     * @param int $id
     * @return bool
     */
    public static function restore(int $id): bool
    {
        $sql = 'UPDATE `destinations` SET `deleted_at` = NULL, `deleted_by` = NULL, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NOT NULL';
        return self::execute($sql, [':id' => $id]) > 0;
    }

    /**
     * Check foreign key usage references to this destination across the database.
     *
     * @param int $destinationId
     * @return array
     */
    public static function getUsageReferences(int $destinationId): array
    {
        $references = [];

        // Check tours assigned to this destination
        $toursCount = (int) self::fetchColumn(
            'SELECT COUNT(*) FROM `tours` WHERE `destination_id` = :id AND `deleted_at` IS NULL',
            [':id' => $destinationId]
        );
        if ($toursCount > 0) {
            $references['tours'] = $toursCount;
        }

        // Check contact inquiries related to this destination
        $contactCount = (int) self::fetchColumn(
            'SELECT COUNT(*) FROM `contact_messages` WHERE `destination_id` = :id',
            [':id' => $destinationId]
        );
        if ($contactCount > 0) {
            $references['contact_messages'] = $contactCount;
        }

        return $references;
    }

    /**
     * Paginate destinations list with filtering and search.
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

        $where = ['d.`deleted_at` IS NULL'];
        $params = [];

        // Filter by search query (name, slug, hero_title, short_description, intro_heading)
        if (!empty($filters['search'])) {
            $where[] = '(d.`name` LIKE :search1 OR d.`slug` LIKE :search2 OR d.`hero_title` LIKE :search3 OR d.`short_description` LIKE :search4)';
            $searchTerm = '%' . trim($filters['search']) . '%';
            $params[':search1'] = $searchTerm;
            $params[':search2'] = $searchTerm;
            $params[':search3'] = $searchTerm;
            $params[':search4'] = $searchTerm;
        }

        // Filter by status
        if (!empty($filters['status']) && in_array($filters['status'], self::ALLOWED_STATUSES, true)) {
            $where[] = 'd.`status` = :status';
            $params[':status'] = $filters['status'];
        }

        // Filter by is_featured
        if (isset($filters['is_featured']) && $filters['is_featured'] !== '' && $filters['is_featured'] !== null) {
            $where[] = 'd.`is_featured` = :is_featured';
            $params[':is_featured'] = !empty($filters['is_featured']) ? 1 : 0;
        }

        $whereSql = implode(' AND ', $where);

        // Count total matching records
        $countSql = "SELECT COUNT(*) FROM `destinations` d WHERE {$whereSql}";
        $total = (int) self::fetchColumn($countSql, $params);

        // Sorting
        $allowedSortColumns = ['id', 'name', 'display_order', 'created_at', 'status', 'is_featured'];
        $sortBy = in_array($filters['sort_by'] ?? '', $allowedSortColumns, true) ? $filters['sort_by'] : 'display_order';
        $order = strtolower($filters['order'] ?? '') === 'desc' ? 'DESC' : 'ASC';

        // Additional secondary sort
        $orderBySql = "d.`{$sortBy}` {$order}, d.`id` ASC";

        // Query paginated records
        $dataSql = "SELECT d.*,
                           fi.`file_path` AS featured_image_path, fi.`original_name` AS featured_image_name, fi.`mime_type` AS featured_image_mime,
                           im.`file_path` AS intro_media_path, im.`original_name` AS intro_media_name, im.`mime_type` AS intro_media_mime,
                           (SELECT COUNT(*) FROM `tours` t WHERE t.`destination_id` = d.`id` AND t.`deleted_at` IS NULL) AS tours_count
                    FROM `destinations` d
                    LEFT JOIN `media` fi ON d.`featured_image_id` = fi.`id`
                    LEFT JOIN `media` im ON d.`intro_media_id` = im.`id`
                    WHERE {$whereSql}
                    ORDER BY {$orderBySql}
                    LIMIT {$limit} OFFSET {$offset}";

        $rows = self::fetchAll($dataSql, $params);
        $items = array_map([self::class, 'formatDestinationListItem'], $rows);

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
     * Find destination by primary ID.
     *
     * @param int $id
     * @param bool $includeDeleted
     * @return array|null
     */
    public static function findById(int $id, bool $includeDeleted = false): ?array
    {
        $sql = 'SELECT d.*,
                       fi.`file_path` AS featured_image_path, fi.`original_name` AS featured_image_name, fi.`mime_type` AS featured_image_mime,
                       im.`file_path` AS intro_media_path, im.`original_name` AS intro_media_name, im.`mime_type` AS intro_media_mime,
                       og.`file_path` AS og_image_path, og.`original_name` AS og_image_name, og.`mime_type` AS og_image_mime
                FROM `destinations` d
                LEFT JOIN `media` fi ON d.`featured_image_id` = fi.`id`
                LEFT JOIN `media` im ON d.`intro_media_id` = im.`id`
                LEFT JOIN `media` og ON d.`og_image_id` = og.`id`
                WHERE d.`id` = :id';

        if (!$includeDeleted) {
            $sql .= ' AND d.`deleted_at` IS NULL';
        }
        $sql .= ' LIMIT 1';

        $row = self::fetchOne($sql, [':id' => $id]);
        return $row ? self::formatDestinationDetails($row) : null;
    }

    /**
     * Find destination by unique slug.
     *
     * @param string $slug
     * @param bool $includeDeleted
     * @return array|null
     */
    public static function findBySlug(string $slug, bool $includeDeleted = false): ?array
    {
        $sql = 'SELECT d.*,
                       fi.`file_path` AS featured_image_path, fi.`original_name` AS featured_image_name, fi.`mime_type` AS featured_image_mime,
                       im.`file_path` AS intro_media_path, im.`original_name` AS intro_media_name, im.`mime_type` AS intro_media_mime,
                       og.`file_path` AS og_image_path, og.`original_name` AS og_image_name, og.`mime_type` AS og_image_mime
                FROM `destinations` d
                LEFT JOIN `media` fi ON d.`featured_image_id` = fi.`id`
                LEFT JOIN `media` im ON d.`intro_media_id` = im.`id`
                LEFT JOIN `media` og ON d.`og_image_id` = og.`id`
                WHERE d.`slug` = :slug';

        if (!$includeDeleted) {
            $sql .= ' AND d.`deleted_at` IS NULL';
        }
        $sql .= ' LIMIT 1';

        $row = self::fetchOne($sql, [':slug' => $slug]);
        return $row ? self::formatDestinationDetails($row) : null;
    }

    /**
     * Format a destination row for list output.
     *
     * @param array $row
     * @return array
     */
    public static function formatDestinationListItem(array $row): array
    {
        $featuredImage = null;
        if (!empty($row['featured_image_id'])) {
            $featuredImage = [
                'id' => (int) $row['featured_image_id'],
                'file_path' => $row['featured_image_path'] ?? null,
                'original_name' => $row['featured_image_name'] ?? null,
                'mime_type' => $row['featured_image_mime'] ?? null,
            ];
        }

        $introMedia = null;
        if (!empty($row['intro_media_id'])) {
            $introMedia = [
                'id' => (int) $row['intro_media_id'],
                'file_path' => $row['intro_media_path'] ?? null,
                'original_name' => $row['intro_media_name'] ?? null,
                'mime_type' => $row['intro_media_mime'] ?? null,
            ];
        }

        return [
            'id' => (int) $row['id'],
            'name' => $row['name'],
            'slug' => $row['slug'],
            'hero_title' => $row['hero_title'],
            'hero_subtitle' => $row['hero_subtitle'],
            'short_description' => $row['short_description'],
            'featured_image_id' => $row['featured_image_id'] ? (int) $row['featured_image_id'] : null,
            'featured_image' => $featuredImage,
            'intro_media_id' => $row['intro_media_id'] ? (int) $row['intro_media_id'] : null,
            'intro_media' => $introMedia,
            'language' => $row['language'],
            'currency' => $row['currency'],
            'religion' => $row['religion'],
            'heritage' => $row['heritage'] ?? null,
            'timezone' => $row['timezone'],
            'latitude' => $row['latitude'] !== null ? (float) $row['latitude'] : null,
            'longitude' => $row['longitude'] !== null ? (float) $row['longitude'] : null,
            'is_featured' => (bool) $row['is_featured'],
            'display_order' => (int) $row['display_order'],
            'status' => $row['status'],
            'tours_count' => isset($row['tours_count']) ? (int) $row['tours_count'] : 0,
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
        ];
    }

    /**
     * Format a full destination record with media, gallery, sections, and FAQs.
     *
     * @param array $row
     * @return array
     */
    public static function formatDestinationDetails(array $row): array
    {
        $destinationId = (int) $row['id'];

        // Load referenced media objects
        $featuredImage = $row['featured_image_id'] ? Media::findById((int) $row['featured_image_id']) : null;
        $introMedia = $row['intro_media_id'] ? Media::findById((int) $row['intro_media_id']) : null;
        $ogImage = $row['og_image_id'] ? Media::findById((int) $row['og_image_id']) : null;

        // Load Gallery items
        $gallerySql = 'SELECT dg.*, m.`file_path`, m.`original_name`, m.`mime_type`, m.`alt_text`
                       FROM `destination_gallery` dg
                       JOIN `media` m ON dg.`media_id` = m.`id`
                       WHERE dg.`destination_id` = :id
                       ORDER BY dg.`display_order` ASC, dg.`id` ASC';
        $galleryRows = self::fetchAll($gallerySql, [':id' => $destinationId]);

        $gallery = array_map(function ($g) {
            return [
                'id' => (int) $g['id'],
                'media_id' => (int) $g['media_id'],
                'file_path' => $g['file_path'],
                'original_name' => $g['original_name'],
                'mime_type' => $g['mime_type'],
                'alt_text' => $g['alt_text'],
                'caption' => $g['caption'],
                'is_hero_slide' => (bool) $g['is_hero_slide'],
                'display_order' => (int) $g['display_order'],
            ];
        }, $galleryRows);

        // Load Sections
        $sectionsSql = 'SELECT ds.*, m.`file_path` AS media_file_path, m.`original_name` AS media_name
                        FROM `destination_sections` ds
                        LEFT JOIN `media` m ON ds.`media_id` = m.`id`
                        WHERE ds.`destination_id` = :id
                        ORDER BY ds.`display_order` ASC, ds.`id` ASC';
        $sectionRows = self::fetchAll($sectionsSql, [':id' => $destinationId]);

        $sections = array_map(function ($s) {
            return [
                'id' => (int) $s['id'],
                'section_type' => $s['section_type'],
                'title' => $s['title'],
                'subtitle' => $s['subtitle'],
                'content' => $s['content'],
                'media_id' => $s['media_id'] ? (int) $s['media_id'] : null,
                'media' => $s['media_id'] ? [
                    'id' => (int) $s['media_id'],
                    'file_path' => $s['media_file_path'],
                    'original_name' => $s['media_name'],
                ] : null,
                'display_order' => (int) $s['display_order'],
                'status' => $s['status'],
            ];
        }, $sectionRows);

        // Load FAQs
        $faqsSql = 'SELECT * FROM `destination_faqs` WHERE `destination_id` = :id ORDER BY `display_order` ASC, `id` ASC';
        $faqRows = self::fetchAll($faqsSql, [':id' => $destinationId]);

        $faqs = array_map(function ($f) {
            return [
                'id' => (int) $f['id'],
                'question' => $f['question'],
                'answer' => $f['answer'],
                'display_order' => (int) $f['display_order'],
                'status' => $f['status'],
            ];
        }, $faqRows);

        // Count active tours referencing this destination
        $toursCount = (int) self::fetchColumn(
            'SELECT COUNT(*) FROM `tours` WHERE `destination_id` = :id AND `deleted_at` IS NULL',
            [':id' => $destinationId]
        );

        $usageReferences = self::getUsageReferences($destinationId);

        return [
            'id' => $destinationId,
            'name' => $row['name'],
            'slug' => $row['slug'],
            'hero_title' => $row['hero_title'],
            'hero_subtitle' => $row['hero_subtitle'],
            'short_description' => $row['short_description'],
            'intro_heading' => $row['intro_heading'],
            'intro_label' => $row['intro_label'],
            'intro_content' => $row['intro_content'],
            'intro_media_id' => $row['intro_media_id'] ? (int) $row['intro_media_id'] : null,
            'intro_media' => $introMedia,
            'language' => $row['language'],
            'currency' => $row['currency'],
            'religion' => $row['religion'],
            'heritage' => $row['heritage'] ?? null,
            'timezone' => $row['timezone'],
            'latitude' => $row['latitude'] !== null ? (float) $row['latitude'] : null,
            'longitude' => $row['longitude'] !== null ? (float) $row['longitude'] : null,
            'featured_image_id' => $row['featured_image_id'] ? (int) $row['featured_image_id'] : null,
            'featured_image' => $featuredImage,
            'seo_title' => $row['seo_title'],
            'seo_description' => $row['seo_description'],
            'og_image_id' => $row['og_image_id'] ? (int) $row['og_image_id'] : null,
            'og_image' => $ogImage,
            'is_featured' => (bool) $row['is_featured'],
            'display_order' => (int) $row['display_order'],
            'status' => $row['status'],
            'tours_count' => $toursCount,
            'usage_references' => $usageReferences,
            'is_in_use' => !empty($usageReferences),
            'gallery' => $gallery,
            'sections' => $sections,
            'faqs' => $faqs,
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
            'deleted_at' => $row['deleted_at'] ?? null,
            'deleted_by' => isset($row['deleted_by']) && $row['deleted_by'] !== null ? (int) $row['deleted_by'] : null,
        ];
    }
}
