<?php

namespace App\Models;

use App\Utils\Database;
use PDO;

class Tour extends BaseModel
{
    /**
     * Allowed status values.
     */
    public const ALLOWED_STATUSES = ['draft', 'published', 'archived'];

    /**
     * Convert text into a URL-friendly lowercase slug.
     *
     * @param string $text
     * @return string
     */
    public static function slugify(string $text): string
    {
        $slug = strtolower(trim($text));
        $slug = preg_replace('/[^a-z0-9]+/i', '-', $slug);
        $slug = trim((string) $slug, '-');

        return $slug ?: 'tour-' . bin2hex(random_bytes(3));
    }

    /**
     * Check if a slug already exists in tours.
     *
     * @param string $slug
     * @param int|null $excludeId
     * @return bool
     */
    public static function slugExists(string $slug, ?int $excludeId = null): bool
    {
        $sql = 'SELECT COUNT(*) FROM `tours` WHERE `slug` = :slug';
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
     * @param string $title
     * @param int|null $excludeId
     * @return string
     */
    public static function generateUniqueSlug(string $title, ?int $excludeId = null): string
    {
        $baseSlug = self::slugify($title);
        $slug = $baseSlug;
        $counter = 2;

        while (self::slugExists($slug, $excludeId)) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    /**
     * Create a new tour.
     *
     * @param array $data
     * @param array $categoryIds
     * @return int
     */
    public static function create(array $data, array $categoryIds = []): int
    {
        $sql = 'INSERT INTO `tours` (
            `destination_id`, `title`, `slug`, `short_description`, `overview`,
            `tour_type`, `duration_text`, `duration_hours`, `duration_days`,
            `languages`, `featured_image_id`, `base_price`, `currency`,
            `min_persons`, `max_persons`, `available_seats`, `total_seats`,
            `booking_deadline_days`, `travel_days`, `map_title`, `latitude`, `longitude`,
            `map_zoom`, `seo_title`, `seo_description`, `canonical_url`,
            `og_image_id`, `is_featured`, `display_order`, `status`,
            `created_at`, `updated_at`
        ) VALUES (
            :destination_id, :title, :slug, :short_description, :overview,
            :tour_type, :duration_text, :duration_hours, :duration_days,
            :languages, :featured_image_id, :base_price, :currency,
            :min_persons, :max_persons, :available_seats, :total_seats,
            :booking_deadline_days, :travel_days, :map_title, :latitude, :longitude,
            :map_zoom, :seo_title, :seo_description, :canonical_url,
            :og_image_id, :is_featured, :display_order, :status,
            NOW(), NOW()
        )';

        self::execute($sql, [
            ':destination_id' => (int) $data['destination_id'],
            ':title' => $data['title'],
            ':slug' => $data['slug'],
            ':short_description' => $data['short_description'] ?? null,
            ':overview' => $data['overview'] ?? null,
            ':tour_type' => $data['tour_type'] ?? null,
            ':duration_text' => $data['duration_text'] ?? null,
            ':duration_hours' => isset($data['duration_hours']) && $data['duration_hours'] !== '' && $data['duration_hours'] !== null ? (float) $data['duration_hours'] : null,
            ':duration_days' => isset($data['duration_days']) ? max(1, (int) $data['duration_days']) : 1,
            ':languages' => $data['languages'] ?? null,
            ':featured_image_id' => !empty($data['featured_image_id']) ? (int) $data['featured_image_id'] : null,
            ':base_price' => isset($data['base_price']) ? (float) $data['base_price'] : 0.00,
            ':currency' => !empty($data['currency']) ? trim((string) $data['currency']) : 'EUR',
            ':min_persons' => isset($data['min_persons']) ? max(1, (int) $data['min_persons']) : 1,
            ':max_persons' => !empty($data['max_persons']) ? (int) $data['max_persons'] : null,
            ':available_seats' => isset($data['available_seats']) ? (int) $data['available_seats'] : 20,
            ':total_seats' => isset($data['total_seats']) ? (int) $data['total_seats'] : 20,
            ':booking_deadline_days' => isset($data['booking_deadline_days']) ? (int) $data['booking_deadline_days'] : 1,
            ':travel_days' => !empty($data['travel_days']) ? trim((string) $data['travel_days']) : 'Daily',
            ':map_title' => $data['map_title'] ?? null,
            ':latitude' => isset($data['latitude']) && $data['latitude'] !== '' && $data['latitude'] !== null ? (float) $data['latitude'] : null,
            ':longitude' => isset($data['longitude']) && $data['longitude'] !== '' && $data['longitude'] !== null ? (float) $data['longitude'] : null,
            ':map_zoom' => isset($data['map_zoom']) ? (int) $data['map_zoom'] : 13,
            ':seo_title' => $data['seo_title'] ?? null,
            ':seo_description' => $data['seo_description'] ?? null,
            ':canonical_url' => $data['canonical_url'] ?? null,
            ':og_image_id' => !empty($data['og_image_id']) ? (int) $data['og_image_id'] : null,
            ':is_featured' => !empty($data['is_featured']) ? 1 : 0,
            ':display_order' => isset($data['display_order']) ? (int) $data['display_order'] : 0,
            ':status' => in_array($data['status'] ?? '', self::ALLOWED_STATUSES, true) ? $data['status'] : 'draft',
        ]);

        $tourId = (int) self::lastInsertId();

        if (!empty($categoryIds)) {
            self::syncCategories($tourId, $categoryIds);
        }

        if (isset($data['gallery']) && is_array($data['gallery'])) {
            self::syncGallery($tourId, $data['gallery']);
        }
        if (isset($data['highlights']) && is_array($data['highlights'])) {
            self::syncHighlights($tourId, $data['highlights']);
        }
        if (isset($data['itineraries']) && is_array($data['itineraries'])) {
            self::syncItineraries($tourId, $data['itineraries']);
        }
        if (isset($data['pricing_tiers']) && is_array($data['pricing_tiers'])) {
            self::syncPricingTiers($tourId, $data['pricing_tiers']);
        }
        if (isset($data['places']) && is_array($data['places'])) {
            self::syncPlaces($tourId, $data['places']);
        }
        if (isset($data['includes']) && is_array($data['includes'])) {
            self::syncIncludes($tourId, $data['includes']);
        }
        if (isset($data['excludes']) && is_array($data['excludes'])) {
            self::syncExcludes($tourId, $data['excludes']);
        }
        if (isset($data['why_choose']) && is_array($data['why_choose'])) {
            self::syncWhyChoose($tourId, $data['why_choose']);
        }
        if (isset($data['faqs']) && is_array($data['faqs'])) {
            self::syncFaqs($tourId, $data['faqs']);
        }

        return $tourId;
    }

    /**
     * Synchronize gallery for a tour.
     */
    public static function syncGallery(int $tourId, array $gallery): void
    {
        self::execute('DELETE FROM `tour_gallery` WHERE `tour_id` = :id', [':id' => $tourId]);
        if (empty($gallery)) return;

        $pdo = self::db();
        $stmt = $pdo->prepare('INSERT INTO `tour_gallery` (`tour_id`, `media_id`, `is_cover`, `display_order`, `created_at`) VALUES (:tour_id, :media_id, :is_cover, :display_order, NOW())');
        $order = 0;
        foreach ($gallery as $item) {
            $mediaId = !empty($item['media_id']) ? (int) $item['media_id'] : (!empty($item['id']) ? (int) $item['id'] : 0);
            if ($mediaId <= 0) continue;
            $stmt->execute([
                ':tour_id' => $tourId,
                ':media_id' => $mediaId,
                ':is_cover' => !empty($item['is_cover']) ? 1 : 0,
                ':display_order' => isset($item['display_order']) ? (int) $item['display_order'] : $order++,
            ]);
        }
    }

    /**
     * Synchronize highlights for a tour.
     */
    public static function syncHighlights(int $tourId, array $highlights): void
    {
        self::execute('DELETE FROM `tour_highlights` WHERE `tour_id` = :id', [':id' => $tourId]);
        if (empty($highlights)) return;

        $pdo = self::db();
        $stmt = $pdo->prepare('INSERT INTO `tour_highlights` (`tour_id`, `highlight_text`, `icon`, `display_order`, `created_at`, `updated_at`) VALUES (:tour_id, :highlight_text, :icon, :display_order, NOW(), NOW())');
        $order = 0;
        foreach ($highlights as $hl) {
            $text = trim((string) (is_array($hl) ? ($hl['highlight_text'] ?? $hl['text'] ?? '') : $hl));
            if (empty($text)) continue;
            $stmt->execute([
                ':tour_id' => $tourId,
                ':highlight_text' => $text,
                ':icon' => !empty($hl['icon']) ? (string) $hl['icon'] : null,
                ':display_order' => isset($hl['display_order']) ? (int) $hl['display_order'] : $order++,
            ]);
        }
    }

    /**
     * Synchronize itineraries for a tour.
     */
    public static function syncItineraries(int $tourId, array $itineraries): void
    {
        self::execute('DELETE FROM `tour_itineraries` WHERE `tour_id` = :id', [':id' => $tourId]);
        if (empty($itineraries)) return;

        $pdo = self::db();
        $stmt = $pdo->prepare('INSERT INTO `tour_itineraries` (`tour_id`, `time_period`, `title`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES (:tour_id, :time_period, :title, :description, :display_order, :status, NOW(), NOW())');
        $order = 0;
        foreach ($itineraries as $it) {
            $title = trim((string) ($it['title'] ?? ''));
            $desc = trim((string) ($it['description'] ?? ''));
            if (empty($title) && empty($desc)) continue;

            $status = in_array($it['status'] ?? '', ['active', 'inactive'], true) ? $it['status'] : 'active';
            $stmt->execute([
                ':tour_id' => $tourId,
                ':time_period' => !empty($it['time_period']) ? (string) $it['time_period'] : null,
                ':title' => $title ?: 'Itinerary Stop',
                ':description' => $desc,
                ':display_order' => isset($it['display_order']) ? (int) $it['display_order'] : $order++,
                ':status' => $status,
            ]);
        }
    }

    /**
     * Synchronize pricing tiers for a tour.
     */
    public static function syncPricingTiers(int $tourId, array $pricingTiers): void
    {
        self::execute('DELETE FROM `tour_pricing_tiers` WHERE `tour_id` = :id', [':id' => $tourId]);
        if (empty($pricingTiers)) return;

        $pdo = self::db();
        $stmt = $pdo->prepare('INSERT INTO `tour_pricing_tiers` (`tour_id`, `min_persons`, `max_persons`, `service_option`, `currency`, `price`, `valid_from`, `valid_to`, `status`, `created_at`, `updated_at`) VALUES (:tour_id, :min_persons, :max_persons, :service_option, :currency, :price, :valid_from, :valid_to, :status, NOW(), NOW())');
        foreach ($pricingTiers as $pt) {
            if (!isset($pt['price']) || !is_numeric($pt['price'])) continue;

            $min = isset($pt['min_persons']) ? max(1, (int) $pt['min_persons']) : 1;
            $max = isset($pt['max_persons']) ? max($min, (int) $pt['max_persons']) : $min;
            $service = !empty($pt['service_option']) ? trim((string) $pt['service_option']) : 'Standard Package';
            $currency = !empty($pt['currency']) ? trim((string) $pt['currency']) : 'EUR';
            $status = in_array($pt['status'] ?? '', ['active', 'inactive'], true) ? $pt['status'] : 'active';

            $stmt->execute([
                ':tour_id' => $tourId,
                ':min_persons' => $min,
                ':max_persons' => $max,
                ':service_option' => $service,
                ':currency' => $currency,
                ':price' => (float) $pt['price'],
                ':valid_from' => !empty($pt['valid_from']) ? $pt['valid_from'] : null,
                ':valid_to' => !empty($pt['valid_to']) ? $pt['valid_to'] : null,
                ':status' => $status,
            ]);
        }
    }

    /**
     * Synchronize places for a tour.
     */
    public static function syncPlaces(int $tourId, array $places): void
    {
        self::execute('DELETE FROM `tour_places` WHERE `tour_id` = :id', [':id' => $tourId]);
        if (empty($places)) return;

        $pdo = self::db();
        $stmt = $pdo->prepare('INSERT INTO `tour_places` (`tour_id`, `name`, `short_description`, `media_id`, `latitude`, `longitude`, `display_order`, `status`, `created_at`, `updated_at`) VALUES (:tour_id, :name, :short_description, :media_id, :latitude, :longitude, :display_order, :status, NOW(), NOW())');
        $order = 0;
        foreach ($places as $pl) {
            $name = trim((string) ($pl['name'] ?? ''));
            if (empty($name)) continue;

            $mediaId = !empty($pl['media_id']) ? (int) $pl['media_id'] : null;
            $lat = isset($pl['latitude']) && $pl['latitude'] !== '' && $pl['latitude'] !== null ? (float) $pl['latitude'] : null;
            $lng = isset($pl['longitude']) && $pl['longitude'] !== '' && $pl['longitude'] !== null ? (float) $pl['longitude'] : null;
            $status = in_array($pl['status'] ?? '', ['active', 'inactive'], true) ? $pl['status'] : 'active';

            $stmt->execute([
                ':tour_id' => $tourId,
                ':name' => $name,
                ':short_description' => !empty($pl['short_description']) ? (string) $pl['short_description'] : null,
                ':media_id' => $mediaId,
                ':latitude' => $lat,
                ':longitude' => $lng,
                ':display_order' => isset($pl['display_order']) ? (int) $pl['display_order'] : $order++,
                ':status' => $status,
            ]);
        }
    }

    /**
     * Synchronize includes for a tour.
     */
    public static function syncIncludes(int $tourId, array $includes): void
    {
        self::execute('DELETE FROM `tour_includes` WHERE `tour_id` = :id', [':id' => $tourId]);
        if (empty($includes)) return;

        $pdo = self::db();
        $stmt = $pdo->prepare('INSERT INTO `tour_includes` (`tour_id`, `item_text`, `display_order`, `created_at`, `updated_at`) VALUES (:tour_id, :item_text, :display_order, NOW(), NOW())');
        $order = 0;
        foreach ($includes as $inc) {
            $text = trim((string) (is_array($inc) ? ($inc['item_text'] ?? '') : $inc));
            if (empty($text)) continue;
            $stmt->execute([
                ':tour_id' => $tourId,
                ':item_text' => $text,
                ':display_order' => isset($inc['display_order']) ? (int) $inc['display_order'] : $order++,
            ]);
        }
    }

    /**
     * Synchronize excludes for a tour.
     */
    public static function syncExcludes(int $tourId, array $excludes): void
    {
        self::execute('DELETE FROM `tour_excludes` WHERE `tour_id` = :id', [':id' => $tourId]);
        if (empty($excludes)) return;

        $pdo = self::db();
        $stmt = $pdo->prepare('INSERT INTO `tour_excludes` (`tour_id`, `item_text`, `display_order`, `created_at`, `updated_at`) VALUES (:tour_id, :item_text, :display_order, NOW(), NOW())');
        $order = 0;
        foreach ($excludes as $exc) {
            $text = trim((string) (is_array($exc) ? ($exc['item_text'] ?? '') : $exc));
            if (empty($text)) continue;
            $stmt->execute([
                ':tour_id' => $tourId,
                ':item_text' => $text,
                ':display_order' => isset($exc['display_order']) ? (int) $exc['display_order'] : $order++,
            ]);
        }
    }

    /**
     * Synchronize why choose points for a tour.
     */
    public static function syncWhyChoose(int $tourId, array $whyChoose): void
    {
        self::execute('DELETE FROM `tour_why_choose` WHERE `tour_id` = :id', [':id' => $tourId]);
        if (empty($whyChoose)) return;

        $pdo = self::db();
        $stmt = $pdo->prepare('INSERT INTO `tour_why_choose` (`tour_id`, `icon`, `title`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES (:tour_id, :icon, :title, :description, :display_order, :status, NOW(), NOW())');
        $order = 0;
        foreach ($whyChoose as $wc) {
            $title = trim((string) ($wc['title'] ?? ''));
            if (empty($title)) continue;
            $status = in_array($wc['status'] ?? '', ['active', 'inactive'], true) ? $wc['status'] : 'active';
            $stmt->execute([
                ':tour_id' => $tourId,
                ':icon' => !empty($wc['icon']) ? (string) $wc['icon'] : null,
                ':title' => $title,
                ':description' => !empty($wc['description']) ? (string) $wc['description'] : null,
                ':display_order' => isset($wc['display_order']) ? (int) $wc['display_order'] : $order++,
                ':status' => $status,
            ]);
        }
    }

    /**
     * Synchronize FAQs for a tour.
     */
    public static function syncFaqs(int $tourId, array $faqs): void
    {
        self::execute('DELETE FROM `tour_faqs` WHERE `tour_id` = :id', [':id' => $tourId]);
        if (empty($faqs)) return;

        $pdo = self::db();
        $stmt = $pdo->prepare('INSERT INTO `tour_faqs` (`tour_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`) VALUES (:tour_id, :question, :answer, :display_order, :status, NOW(), NOW())');
        $order = 0;
        foreach ($faqs as $faq) {
            $question = trim((string) ($faq['question'] ?? ''));
            $answer = trim((string) ($faq['answer'] ?? ''));
            if (empty($question)) continue;
            $status = in_array($faq['status'] ?? '', ['published', 'draft'], true) ? $faq['status'] : 'published';
            $stmt->execute([
                ':tour_id' => $tourId,
                ':question' => $question,
                ':answer' => $answer,
                ':display_order' => isset($faq['display_order']) ? (int) $faq['display_order'] : $order++,
                ':status' => $status,
            ]);

        }
    }

    /**
     * Find tour by primary ID.
     *
     * @param int $id
     * @param bool $includeDeleted
     * @return array|null
     */
    public static function findById(int $id, bool $includeDeleted = false): ?array
    {
        $sql = 'SELECT t.*,
                       d.`name` AS destination_name, d.`slug` AS destination_slug,
                       fi.`file_path` AS featured_image_path, fi.`original_name` AS featured_image_name, fi.`mime_type` AS featured_image_mime,
                       og.`file_path` AS og_image_path, og.`original_name` AS og_image_name, og.`mime_type` AS og_image_mime
                FROM `tours` t
                JOIN `destinations` d ON t.`destination_id` = d.`id`
                LEFT JOIN `media` fi ON t.`featured_image_id` = fi.`id`
                LEFT JOIN `media` og ON t.`og_image_id` = og.`id`
                WHERE t.`id` = :id';

        if (!$includeDeleted) {
            $sql .= ' AND t.`deleted_at` IS NULL';
        }
        $sql .= ' LIMIT 1';

        $row = self::fetchOne($sql, [':id' => $id]);
        return $row ? self::formatTourDetails($row) : null;
    }

    /**
     * Find tour by unique slug.
     *
     * @param string $slug
     * @param bool $includeDeleted
     * @return array|null
     */
    public static function findBySlug(string $slug, bool $includeDeleted = false): ?array
    {
        $sql = 'SELECT t.*,
                       d.`name` AS destination_name, d.`slug` AS destination_slug,
                       fi.`file_path` AS featured_image_path, fi.`original_name` AS featured_image_name, fi.`mime_type` AS featured_image_mime,
                       og.`file_path` AS og_image_path, og.`original_name` AS og_image_name, og.`mime_type` AS og_image_mime
                FROM `tours` t
                JOIN `destinations` d ON t.`destination_id` = d.`id`
                LEFT JOIN `media` fi ON t.`featured_image_id` = fi.`id`
                LEFT JOIN `media` og ON t.`og_image_id` = og.`id`
                WHERE t.`slug` = :slug';

        if (!$includeDeleted) {
            $sql .= ' AND t.`deleted_at` IS NULL';
        }
        $sql .= ' LIMIT 1';

        $row = self::fetchOne($sql, [':slug' => $slug]);
        return $row ? self::formatTourDetails($row) : null;
    }

    /**
     * Update tour record.
     *
     * @param int $id
     * @param array $data
     * @param array|null $categoryIds
     * @return bool
     */
    public static function update(int $id, array $data, ?array $categoryIds = null): bool
    {
        if (array_key_exists('gallery', $data) && is_array($data['gallery'])) {
            self::syncGallery($id, $data['gallery']);
        }
        if (array_key_exists('highlights', $data) && is_array($data['highlights'])) {
            self::syncHighlights($id, $data['highlights']);
        }
        if (array_key_exists('itineraries', $data) && is_array($data['itineraries'])) {
            self::syncItineraries($id, $data['itineraries']);
        }
        if (array_key_exists('pricing_tiers', $data) && is_array($data['pricing_tiers'])) {
            self::syncPricingTiers($id, $data['pricing_tiers']);
        }
        if (array_key_exists('places', $data) && is_array($data['places'])) {
            self::syncPlaces($id, $data['places']);
        }
        if (array_key_exists('includes', $data) && is_array($data['includes'])) {
            self::syncIncludes($id, $data['includes']);
        }
        if (array_key_exists('excludes', $data) && is_array($data['excludes'])) {
            self::syncExcludes($id, $data['excludes']);
        }
        if (array_key_exists('why_choose', $data) && is_array($data['why_choose'])) {
            self::syncWhyChoose($id, $data['why_choose']);
        }
        if (array_key_exists('faqs', $data) && is_array($data['faqs'])) {
            self::syncFaqs($id, $data['faqs']);
        }

        $fields = [];
        $params = [':id' => $id];

        $allowedColumns = [
            'destination_id', 'title', 'slug', 'short_description', 'overview',
            'tour_type', 'duration_text', 'duration_hours', 'duration_days',
            'languages', 'featured_image_id', 'base_price', 'currency',
            'min_persons', 'max_persons', 'available_seats', 'total_seats',
            'booking_deadline_days', 'travel_days', 'map_title', 'latitude', 'longitude',
            'map_zoom', 'seo_title', 'seo_description', 'canonical_url',
            'og_image_id', 'is_featured', 'display_order', 'status'
        ];

        foreach ($allowedColumns as $col) {
            if (array_key_exists($col, $data)) {
                $fields[] = "`{$col}` = :{$col}";

                if (in_array($col, ['destination_id', 'featured_image_id', 'og_image_id', 'min_persons', 'max_persons', 'available_seats', 'total_seats', 'booking_deadline_days', 'duration_days', 'map_zoom', 'display_order'], true)) {
                    $params[":{$col}"] = $data[$col] !== null && $data[$col] !== '' ? (int) $data[$col] : null;
                } elseif (in_array($col, ['base_price', 'duration_hours', 'latitude', 'longitude'], true)) {
                    $params[":{$col}"] = $data[$col] !== null && $data[$col] !== '' ? (float) $data[$col] : null;
                } elseif ($col === 'is_featured') {
                    $params[":{$col}"] = !empty($data[$col]) ? 1 : 0;
                } else {
                    $params[":{$col}"] = $data[$col] !== null ? (string) $data[$col] : null;
                }
            }
        }

        if (!empty($fields)) {
            $fields[] = '`updated_at` = NOW()';
            $setSql = implode(', ', $fields);
            $sql = "UPDATE `tours` SET {$setSql} WHERE `id` = :id";
            self::execute($sql, $params);
        }

        if ($categoryIds !== null) {
            self::syncCategories($id, $categoryIds);
        }

        return true;
    }

    /**
     * Set tour status.
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

        $sql = 'UPDATE `tours` SET `status` = :status, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NULL';
        return self::execute($sql, [':id' => $id, ':status' => $status]) > 0;
    }

    /**
     * Delete tour (soft delete by default, hard delete if forced).
     *
     * @param int $id
     * @param int|null $deletedBy
     * @param bool $force
     * @return bool
     */
    public static function delete(int $id, ?int $deletedBy = null, bool $force = false): bool
    {
        if ($force) {
            $sql = 'DELETE FROM `tours` WHERE `id` = :id';
            return self::execute($sql, [':id' => $id]) > 0;
        }

        $sql = 'UPDATE `tours` SET `deleted_at` = NOW(), `deleted_by` = :deleted_by, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NULL';
        return self::execute($sql, [':id' => $id, ':deleted_by' => $deletedBy]) > 0;
    }

    /**
     * Restore a soft-deleted tour.
     *
     * @param int $id
     * @return bool
     */
    public static function restore(int $id): bool
    {
        $sql = 'UPDATE `tours` SET `deleted_at` = NULL, `deleted_by` = NULL, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NOT NULL';
        return self::execute($sql, [':id' => $id]) > 0;
    }

    /**
     * Check foreign key usage references to this tour across other modules (e.g., active bookings).
     *
     * @param int $tourId
     * @return array
     */
    public static function getUsageReferences(int $tourId): array
    {
        $references = [];

        // Check active bookings
        $bookingsCount = (int) self::fetchColumn(
            'SELECT COUNT(*) FROM `bookings` WHERE `tour_id` = :id AND `deleted_at` IS NULL',
            [':id' => $tourId]
        );
        if ($bookingsCount > 0) {
            $references['bookings'] = $bookingsCount;
        }

        return $references;
    }

    /**
     * Synchronize categories assigned to this tour in tour_category_map.
     *
     * @param int $tourId
     * @param array $categoryIds
     * @return void
     */
    public static function syncCategories(int $tourId, array $categoryIds): void
    {
        self::execute('DELETE FROM `tour_category_map` WHERE `tour_id` = :id', [':id' => $tourId]);

        if (empty($categoryIds)) {
            return;
        }

        $pdo = self::db();
        $stmt = $pdo->prepare('INSERT IGNORE INTO `tour_category_map` (`tour_id`, `category_id`) VALUES (:tour_id, :category_id)');

        foreach ($categoryIds as $catId) {
            $stmt->execute([
                ':tour_id' => $tourId,
                ':category_id' => (int) $catId,
            ]);
        }
    }

    /**
     * Paginate tours with search, filtering, and sorting.
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

        $where = ['t.`deleted_at` IS NULL'];
        $params = [];

        // Filter by search query (title, slug, short_description, languages)
        if (!empty($filters['search'])) {
            $where[] = '(t.`title` LIKE :search1 OR t.`slug` LIKE :search2 OR t.`short_description` LIKE :search3 OR d.`name` LIKE :search4)';
            $searchTerm = '%' . trim($filters['search']) . '%';
            $params[':search1'] = $searchTerm;
            $params[':search2'] = $searchTerm;
            $params[':search3'] = $searchTerm;
            $params[':search4'] = $searchTerm;
        }

        // Filter by destination
        if (!empty($filters['destination_id'])) {
            $where[] = 't.`destination_id` = :destination_id';
            $params[':destination_id'] = (int) $filters['destination_id'];
        }

        // Filter by status
        if (!empty($filters['status']) && in_array($filters['status'], self::ALLOWED_STATUSES, true)) {
            $where[] = 't.`status` = :status';
            $params[':status'] = $filters['status'];
        }

        // Filter by is_featured
        if (isset($filters['is_featured']) && $filters['is_featured'] !== '' && $filters['is_featured'] !== null) {
            $where[] = 't.`is_featured` = :is_featured';
            $params[':is_featured'] = !empty($filters['is_featured']) ? 1 : 0;
        }

        // Filter by tour_type
        if (!empty($filters['tour_type'])) {
            $where[] = 't.`tour_type` = :tour_type';
            $params[':tour_type'] = trim($filters['tour_type']);
        }

        // Filter by price range
        if (isset($filters['min_price']) && is_numeric($filters['min_price'])) {
            $where[] = 't.`base_price` >= :min_price';
            $params[':min_price'] = (float) $filters['min_price'];
        }
        if (isset($filters['max_price']) && is_numeric($filters['max_price'])) {
            $where[] = 't.`base_price` <= :max_price';
            $params[':max_price'] = (float) $filters['max_price'];
        }

        // Filter by duration_days
        if (isset($filters['duration_days']) && is_numeric($filters['duration_days'])) {
            $where[] = 't.`duration_days` = :duration_days';
            $params[':duration_days'] = (int) $filters['duration_days'];
        }

        // Filter by category
        if (!empty($filters['category_id'])) {
            $where[] = 'EXISTS (SELECT 1 FROM `tour_category_map` tcm WHERE tcm.`tour_id` = t.`id` AND tcm.`category_id` = :category_id)';
            $params[':category_id'] = (int) $filters['category_id'];
        }

        $whereSql = implode(' AND ', $where);

        // Count total matching records
        $countSql = "SELECT COUNT(*)
                     FROM `tours` t
                     JOIN `destinations` d ON t.`destination_id` = d.`id`
                     WHERE {$whereSql}";
        $total = (int) self::fetchColumn($countSql, $params);

        // Sorting
        $allowedSortColumns = ['id', 'title', 'base_price', 'duration_days', 'display_order', 'created_at', 'status', 'is_featured'];
        $sortBy = in_array($filters['sort_by'] ?? '', $allowedSortColumns, true) ? $filters['sort_by'] : 'display_order';
        $order = strtolower($filters['order'] ?? '') === 'desc' ? 'DESC' : 'ASC';

        $orderBySql = "t.`{$sortBy}` {$order}, t.`id` ASC";

        // Query paginated records
        $dataSql = "SELECT t.*,
                           d.`name` AS destination_name, d.`slug` AS destination_slug,
                           fi.`file_path` AS featured_image_path, fi.`original_name` AS featured_image_name, fi.`mime_type` AS featured_image_mime,
                           (SELECT COUNT(*) FROM `reviews` r WHERE r.`tour_id` = t.`id` AND r.`status` = 'approved') AS reviews_count,
                           (SELECT AVG(r.`rating`) FROM `reviews` r WHERE r.`tour_id` = t.`id` AND r.`status` = 'approved') AS average_rating
                    FROM `tours` t
                    JOIN `destinations` d ON t.`destination_id` = d.`id`
                    LEFT JOIN `media` fi ON t.`featured_image_id` = fi.`id`
                    WHERE {$whereSql}
                    ORDER BY {$orderBySql}
                    LIMIT {$limit} OFFSET {$offset}";

        $rows = self::fetchAll($dataSql, $params);
        $items = array_map([self::class, 'formatTourListItem'], $rows);

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
     * Format tour row for list summary output.
     *
     * @param array $row
     * @return array
     */
    public static function formatTourListItem(array $row): array
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

        // Categories
        $categories = [];
        if (!empty($row['id'])) {
            $catSql = 'SELECT tc.`id`, tc.`name`, tc.`slug`, tc.`badge_color`, tc.`icon`
                       FROM `tour_category_map` tcm
                       JOIN `tour_categories` tc ON tcm.`category_id` = tc.`id`
                       WHERE tcm.`tour_id` = :id
                       ORDER BY tc.`display_order` ASC, tc.`id` ASC';
            $categories = self::fetchAll($catSql, [':id' => (int) $row['id']]);
        }

        return [
            'id' => (int) $row['id'],
            'title' => $row['title'],
            'slug' => $row['slug'],
            'short_description' => $row['short_description'],
            'destination_id' => (int) $row['destination_id'],
            'destination' => [
                'id' => (int) $row['destination_id'],
                'name' => $row['destination_name'] ?? null,
                'slug' => $row['destination_slug'] ?? null,
            ],
            'tour_type' => $row['tour_type'],
            'duration_text' => $row['duration_text'],
            'duration_days' => (int) $row['duration_days'],
            'duration_hours' => $row['duration_hours'] !== null ? (float) $row['duration_hours'] : null,
            'base_price' => (float) $row['base_price'],
            'currency' => $row['currency'],
            'min_persons' => (int) $row['min_persons'],
            'max_persons' => $row['max_persons'] !== null ? (int) $row['max_persons'] : null,
            'featured_image_id' => $row['featured_image_id'] ? (int) $row['featured_image_id'] : null,
            'featured_image' => $featuredImage,
            'is_featured' => (bool) $row['is_featured'],
            'display_order' => (int) $row['display_order'],
            'status' => $row['status'],
            'categories' => $categories,
            'reviews_count' => isset($row['reviews_count']) ? (int) $row['reviews_count'] : 0,
            'average_rating' => isset($row['average_rating']) && $row['average_rating'] !== null ? round((float) $row['average_rating'], 1) : null,
            'available_seats' => isset($row['available_seats']) ? (int) $row['available_seats'] : null,
            'total_seats' => isset($row['total_seats']) ? (int) $row['total_seats'] : null,
            'travel_days' => $row['travel_days'] ?? null,
            'uses_date_availability' => TourAvailability::tourUsesDateAvailability((int) $row['id']),
            'availability_dates' => TourAvailability::listUpcomingForTour((int) $row['id']),
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
        ];
    }

    /**
     * Format full tour details with categories, media, gallery, itineraries, highlights, faqs, places, pricing tiers, includes, and excludes.
     *
     * @param array $row
     * @return array
     */
    public static function formatTourDetails(array $row): array
    {
        $tourId = (int) $row['id'];

        // Destination Details
        $destination = [
            'id' => (int) $row['destination_id'],
            'name' => $row['destination_name'] ?? null,
            'slug' => $row['destination_slug'] ?? null,
        ];

        // Media objects
        $featuredImage = $row['featured_image_id'] ? Media::findById((int) $row['featured_image_id']) : null;
        $ogImage = !empty($row['og_image_id']) ? Media::findById((int) $row['og_image_id']) : null;

        // Categories
        $catSql = 'SELECT tc.`id`, tc.`name`, tc.`slug`, tc.`badge_color`, tc.`icon`
                   FROM `tour_category_map` tcm
                   JOIN `tour_categories` tc ON tcm.`category_id` = tc.`id`
                   WHERE tcm.`tour_id` = :id
                   ORDER BY tc.`display_order` ASC, tc.`id` ASC';
        $categories = self::fetchAll($catSql, [':id' => $tourId]);

        // Gallery
        $gallerySql = 'SELECT tg.`id`, tg.`media_id`, tg.`is_cover`, tg.`display_order`,
                              m.`file_path`, m.`original_name`, m.`mime_type`, m.`alt_text`, m.`caption`
                       FROM `tour_gallery` tg
                       JOIN `media` m ON tg.`media_id` = m.`id`
                       WHERE tg.`tour_id` = :id
                       ORDER BY tg.`display_order` ASC, tg.`id` ASC';
        $gallery = self::fetchAll($gallerySql, [':id' => $tourId]);

        // Highlights
        $highlightsSql = 'SELECT `id`, `highlight_text`, `icon`, `display_order`
                          FROM `tour_highlights`
                          WHERE `tour_id` = :id
                          ORDER BY `display_order` ASC, `id` ASC';
        $highlights = self::fetchAll($highlightsSql, [':id' => $tourId]);

        // Itineraries
        $itinerariesSql = 'SELECT `id`, `time_period`, `title`, `description`, `display_order`, `status`
                           FROM `tour_itineraries`
                           WHERE `tour_id` = :id
                           ORDER BY `display_order` ASC, `id` ASC';
        $itineraries = self::fetchAll($itinerariesSql, [':id' => $tourId]);

        // Pricing Tiers
        $pricingSql = 'SELECT `id`, `min_persons`, `max_persons`, `service_option`, `currency`, `price`, `valid_from`, `valid_to`, `status`
                       FROM `tour_pricing_tiers`
                       WHERE `tour_id` = :id
                       ORDER BY `min_persons` ASC, `id` ASC';
        $pricingTiers = self::fetchAll($pricingSql, [':id' => $tourId]);

        // Places / Sights
        $placesSql = 'SELECT tp.`id`, tp.`name`, tp.`short_description`, tp.`media_id`, tp.`latitude`, tp.`longitude`, tp.`display_order`, tp.`status`,
                             m.`file_path` AS media_file_path, m.`original_name` AS media_name
                      FROM `tour_places` tp
                      LEFT JOIN `media` m ON tp.`media_id` = m.`id`
                      WHERE tp.`tour_id` = :id
                      ORDER BY tp.`display_order` ASC, tp.`id` ASC';
        $places = self::fetchAll($placesSql, [':id' => $tourId]);

        // Includes
        $includesSql = 'SELECT `id`, `item_text`, `display_order` FROM `tour_includes` WHERE `tour_id` = :id ORDER BY `display_order` ASC, `id` ASC';
        $includes = self::fetchAll($includesSql, [':id' => $tourId]);

        // Excludes
        $excludesSql = 'SELECT `id`, `item_text`, `display_order` FROM `tour_excludes` WHERE `tour_id` = :id ORDER BY `display_order` ASC, `id` ASC';
        $excludes = self::fetchAll($excludesSql, [':id' => $tourId]);

        // Why Choose
        $whyChooseSql = 'SELECT `id`, `icon`, `title`, `description`, `display_order`, `status` FROM `tour_why_choose` WHERE `tour_id` = :id ORDER BY `display_order` ASC, `id` ASC';
        $whyChoose = self::fetchAll($whyChooseSql, [':id' => $tourId]);

        // FAQs
        $faqsSql = 'SELECT `id`, `question`, `answer`, `display_order`, `status` FROM `tour_faqs` WHERE `tour_id` = :id ORDER BY `display_order` ASC, `id` ASC';
        $faqs = self::fetchAll($faqsSql, [':id' => $tourId]);

        // Usage references check
        $usageReferences = self::getUsageReferences($tourId);

        return [
            'id' => $tourId,
            'title' => $row['title'],
            'slug' => $row['slug'],
            'short_description' => $row['short_description'],
            'overview' => $row['overview'],
            'destination_id' => (int) $row['destination_id'],
            'destination' => $destination,
            'tour_type' => $row['tour_type'],
            'duration_text' => $row['duration_text'],
            'duration_hours' => $row['duration_hours'] !== null ? (float) $row['duration_hours'] : null,
            'duration_days' => (int) $row['duration_days'],
            'languages' => $row['languages'],
            'featured_image_id' => $row['featured_image_id'] ? (int) $row['featured_image_id'] : null,
            'featured_image' => $featuredImage,
            'base_price' => (float) $row['base_price'],
            'currency' => $row['currency'],
            'min_persons' => (int) $row['min_persons'],
            'max_persons' => $row['max_persons'] !== null ? (int) $row['max_persons'] : null,
            'map_title' => $row['map_title'],
            'latitude' => $row['latitude'] !== null ? (float) $row['latitude'] : null,
            'longitude' => $row['longitude'] !== null ? (float) $row['longitude'] : null,
            'map_zoom' => (int) $row['map_zoom'],
            'seo_title' => $row['seo_title'],
            'seo_description' => $row['seo_description'],
            'canonical_url' => $row['canonical_url'],
            'og_image_id' => $row['og_image_id'] ? (int) $row['og_image_id'] : null,
            'og_image' => $ogImage,
            'is_featured' => (bool) $row['is_featured'],
            'display_order' => (int) $row['display_order'],
            'status' => $row['status'],
            'categories' => $categories,
            'gallery' => $gallery,
            'highlights' => $highlights,
            'itineraries' => $itineraries,
            'pricing_tiers' => $pricingTiers,
            'places' => $places,
            'includes' => $includes,
            'excludes' => $excludes,
            'why_choose' => $whyChoose,
            'faqs' => $faqs,
            'available_seats' => isset($row['available_seats']) ? (int) $row['available_seats'] : null,
            'total_seats' => isset($row['total_seats']) ? (int) $row['total_seats'] : null,
            'booking_deadline_days' => isset($row['booking_deadline_days']) ? (int) $row['booking_deadline_days'] : null,
            'travel_days' => $row['travel_days'] ?? null,
            'uses_date_availability' => TourAvailability::tourUsesDateAvailability($tourId),
            'availability_dates' => TourAvailability::listForTour($tourId),
            'usage_references' => $usageReferences,
            'is_in_use' => !empty($usageReferences),
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
            'deleted_at' => $row['deleted_at'] ?? null,
            'deleted_by' => isset($row['deleted_by']) && $row['deleted_by'] !== null ? (int) $row['deleted_by'] : null,
        ];
    }
}
