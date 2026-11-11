<?php

namespace App\Models;

use App\Utils\Database;
use PDO;

class MedicalTrip extends BaseModel
{
    /**
     * Convert text into a URL-friendly lowercase slug.
     */
    public static function slugify(string $text): string
    {
        $slug = strtolower(trim($text));
        $slug = preg_replace('/[^a-z0-9]+/i', '-', $slug);
        $slug = trim((string) $slug, '-');
        return $slug ?: 'medical-trip-' . bin2hex(random_bytes(3));
    }

    /**
     * Check if slug exists.
     */
    public static function slugExists(string $slug, ?int $excludeId = null): bool
    {
        $sql = 'SELECT COUNT(*) FROM `medical_trips` WHERE `slug` = :slug';
        $params = [':slug' => $slug];
        if ($excludeId !== null) {
            $sql .= ' AND `id` != :exclude_id';
            $params[':exclude_id'] = $excludeId;
        }
        return ((int) self::fetchColumn($sql, $params)) > 0;
    }

    /**
     * Generate unique slug.
     */
    public static function generateUniqueSlug(string $title, ?int $excludeId = null): string
    {
        $base = self::slugify($title);
        $slug = $base;
        $counter = 2;
        while (self::slugExists($slug, $excludeId)) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }
        return $slug;
    }

    /**
     * Paginate medical trips with filters.
     */
    public static function paginate(array $filters = [], int $page = 1, int $limit = 20): array
    {
        $page = max(1, $page);
        $limit = max(1, min(100, $limit));
        $offset = ($page - 1) * $limit;

        $conditions = [];
        $params = [];

        if (!empty($filters['search'])) {
            $conditions[] = '(`title` LIKE :search OR `short_description` LIKE :search OR `category` LIKE :search)';
            $params[':search'] = '%' . trim($filters['search']) . '%';
        }

        if (isset($filters['is_published']) && $filters['is_published'] !== '' && $filters['is_published'] !== 'all') {
            $conditions[] = '`is_published` = :is_published';
            $params[':is_published'] = (int) $filters['is_published'];
        }

        if (isset($filters['is_active']) && $filters['is_active'] !== '' && $filters['is_active'] !== 'all') {
            $conditions[] = '`is_active` = :is_active';
            $params[':is_active'] = (int) $filters['is_active'];
        }

        if (!empty($filters['category']) && $filters['category'] !== 'all') {
            $conditions[] = '`category` = :category';
            $params[':category'] = $filters['category'];
        }

        $whereClause = !empty($conditions) ? 'WHERE ' . implode(' AND ', $conditions) : '';

        // Total count
        $countSql = "SELECT COUNT(*) FROM `medical_trips` {$whereClause}";
        $total = (int) self::fetchColumn($countSql, $params);
        $totalPages = (int) ceil($total / $limit) ?: 1;

        // Fetch items
        $orderClause = 'ORDER BY `created_at` DESC';
        if (!empty($filters['sort_by'])) {
            $col = in_array($filters['sort_by'], ['title', 'price', 'created_at']) ? $filters['sort_by'] : 'created_at';
            $dir = strtoupper($filters['order'] ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';
            $orderClause = "ORDER BY `{$col}` {$dir}";
        }

        $sql = "
            SELECT mt.*,
                   (SELECT COUNT(*) FROM `medical_assessments` WHERE `medical_trip_id` = mt.id) as assessments_count
            FROM `medical_trips` mt
            {$whereClause}
            {$orderClause}
            LIMIT {$limit} OFFSET {$offset}
        ";

        $items = self::fetchAll($sql, $params);

        // Decode JSON fields
        foreach ($items as &$item) {
            $item = self::decodeJsonFields($item);
        }

        return [
            'items' => $items,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'total_pages' => $totalPages,
            ]
        ];
    }

    /**
     * Find by ID with optional assessments and diseases.
     */
    public static function findById(int $id, bool $includeDetails = true): ?array
    {
        $sql = '
            SELECT mt.*,
                   (SELECT COUNT(*) FROM `medical_assessments` WHERE `medical_trip_id` = mt.id) as assessments_count
            FROM `medical_trips` mt
            WHERE mt.`id` = :id
            LIMIT 1
        ';
        $item = self::fetchOne($sql, [':id' => $id]);
        if (!$item) return null;

        $item = self::decodeJsonFields($item);

        if ($includeDetails) {
            $item['assessments'] = self::getAssessments($id);
            $item['diseases'] = [];
        }

        return $item;
    }

    /**
     * Find by slug (public view).
     */
    public static function findBySlug(string $slug, bool $onlyPublished = true): ?array
    {
        $sql = '
            SELECT mt.*,
                   (SELECT COUNT(*) FROM `medical_assessments` WHERE `medical_trip_id` = mt.id) as assessments_count
            FROM `medical_trips` mt
            WHERE mt.`slug` = :slug
        ';
        if ($onlyPublished) {
            $sql .= ' AND mt.`is_published` = 1 AND mt.`is_active` = 1';
        }
        $sql .= ' LIMIT 1';

        $item = self::fetchOne($sql, [':slug' => $slug]);
        if (!$item) return null;

        $item = self::decodeJsonFields($item);
        $item['assessments'] = self::getAssessments((int) $item['id'], $onlyPublished);
        $item['diseases'] = [];

        return $item;
    }

    /**
     * Create medical trip.
     */
    public static function create(array $data): int
    {
        $slug = !empty($data['slug']) ? self::slugify($data['slug']) : self::generateUniqueSlug($data['title']);
        if (self::slugExists($slug)) {
            $slug = self::generateUniqueSlug($slug);
        }

        $sql = '
            INSERT INTO `medical_trips` (
                `title`, `slug`, `category`, `short_description`, `description`,
                `duration`, `price`, `discount_price`, `currency`, `location`,
                `featured_image`, `banner_title`, `banner_subtitle`, `banner_description`, `banner_image`,
                `highlights`, `benefits`, `instructions`, `preparation_guidelines`,
                `included_services`, `excluded_services`, `cancellation_policy`,
                `is_active`, `is_published`
            ) VALUES (
                :title, :slug, :category, :short_description, :description,
                :duration, :price, :discount_price, :currency, :location,
                :featured_image, :banner_title, :banner_subtitle, :banner_description, :banner_image,
                :highlights, :benefits, :instructions, :preparation_guidelines,
                :included_services, :excluded_services, :cancellation_policy,
                :is_active, :is_published
            )
        ';

        $params = [
            ':title' => trim($data['title']),
            ':slug' => $slug,
            ':category' => $data['category'] ?? 'Comprehensive Health Check',
            ':short_description' => $data['short_description'] ?? null,
            ':description' => $data['description'] ?? null,
            ':duration' => $data['duration'] ?? '1 Day',
            ':price' => isset($data['price']) ? (float) $data['price'] : 0.00,
            ':discount_price' => !empty($data['discount_price']) ? (float) $data['discount_price'] : null,
            ':currency' => $data['currency'] ?? 'INR',
            ':location' => $data['location'] ?? 'Chennai, Tamil Nadu',
            ':featured_image' => $data['featured_image'] ?? null,
            ':banner_title' => $data['banner_title'] ?? $data['title'],
            ':banner_subtitle' => $data['banner_subtitle'] ?? null,
            ':banner_description' => $data['banner_description'] ?? ($data['short_description'] ?? null),
            ':banner_image' => $data['banner_image'] ?? ($data['featured_image'] ?? null),
            ':highlights' => is_array($data['highlights'] ?? null) ? json_encode($data['highlights']) : ($data['highlights'] ?? null),
            ':benefits' => is_array($data['benefits'] ?? null) ? json_encode($data['benefits']) : ($data['benefits'] ?? null),
            ':instructions' => $data['instructions'] ?? null,
            ':preparation_guidelines' => $data['preparation_guidelines'] ?? null,
            ':included_services' => is_array($data['included_services'] ?? null) ? json_encode($data['included_services']) : ($data['included_services'] ?? null),
            ':excluded_services' => is_array($data['excluded_services'] ?? null) ? json_encode($data['excluded_services']) : ($data['excluded_services'] ?? null),
            ':cancellation_policy' => $data['cancellation_policy'] ?? null,
            ':is_active' => isset($data['is_active']) ? (int) $data['is_active'] : 1,
            ':is_published' => isset($data['is_published']) ? (int) $data['is_published'] : 1,
        ];

        self::query($sql, $params);
        return (int) self::db()->lastInsertId();
    }

    /**
     * Update medical trip.
     */
    public static function update(int $id, array $data): bool
    {
        $fields = [];
        $params = [':id' => $id];

        $allowed = [
            'title', 'category', 'short_description', 'description',
            'duration', 'price', 'discount_price', 'currency', 'location',
            'featured_image', 'banner_title', 'banner_subtitle', 'banner_description', 'banner_image',
            'highlights', 'benefits', 'instructions', 'preparation_guidelines',
            'included_services', 'excluded_services', 'cancellation_policy',
            'is_active', 'is_published'
        ];

        if (!empty($data['slug'])) {
            $slug = self::slugify($data['slug']);
            if (self::slugExists($slug, $id)) {
                $slug = self::generateUniqueSlug($slug, $id);
            }
            $fields[] = '`slug` = :slug';
            $params[':slug'] = $slug;
        }

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $val = $data[$field];
                if (in_array($field, ['highlights', 'benefits', 'included_services', 'excluded_services'], true) && is_array($val)) {
                    $val = json_encode($val);
                } elseif (in_array($field, ['price', 'discount_price'], true)) {
                    if ($val === '' || $val === null) {
                        $val = ($field === 'price') ? 0.00 : null;
                    } else {
                        $val = (float) $val;
                    }
                } elseif (in_array($field, ['is_active', 'is_published'], true)) {
                    $val = ($val === true || $val === 1 || $val === '1' || $val === 'true') ? 1 : 0;
                }
                $fields[] = "`{$field}` = :{$field}";
                $params[":{$field}"] = $val;
            }
        }

        if (empty($fields)) return false;

        $sql = 'UPDATE `medical_trips` SET ' . implode(', ', $fields) . ' WHERE `id` = :id';
        self::query($sql, $params);
        return true;
    }

    /**
     * Delete medical trip.
     */
    public static function delete(int $id): bool
    {
        $stmt = self::query('DELETE FROM `medical_trips` WHERE `id` = :id', [':id' => $id]);
        return $stmt->rowCount() > 0;
    }

    /**
     * Toggle status.
     */
    public static function togglePublish(int $id, ?bool $status = null): bool
    {
        if ($status === null) {
            $sql = 'UPDATE `medical_trips` SET `is_published` = CASE WHEN `is_published` = 1 THEN 0 ELSE 1 END WHERE `id` = :id';
            self::query($sql, [':id' => $id]);
        } else {
            $sql = 'UPDATE `medical_trips` SET `is_published` = :val WHERE `id` = :id';
            self::query($sql, [':id' => $id, ':val' => $status ? 1 : 0]);
        }
        return true;
    }

    public static function toggleActive(int $id, ?bool $status = null): bool
    {
        if ($status === null) {
            $sql = 'UPDATE `medical_trips` SET `is_active` = CASE WHEN `is_active` = 1 THEN 0 ELSE 1 END WHERE `id` = :id';
            self::query($sql, [':id' => $id]);
        } else {
            $sql = 'UPDATE `medical_trips` SET `is_active` = :val WHERE `id` = :id';
            self::query($sql, [':id' => $id, ':val' => $status ? 1 : 0]);
        }
        return true;
    }

    /* --------------------------------------------------------------------------
     * Assessments & Tests Management
     * -------------------------------------------------------------------------- */

    public static function getAssessments(int $tripId, bool $onlyActive = false): array
    {
        $sql = 'SELECT * FROM `medical_assessments` WHERE `medical_trip_id` = :trip_id';
        if ($onlyActive) {
            $sql .= ' AND `is_active` = 1';
        }
        $sql .= ' ORDER BY `display_order` ASC, `id` ASC';

        $assessments = self::fetchAll($sql, [':trip_id' => $tripId]);

        foreach ($assessments as &$asmt) {
            $asmt['tests'] = self::getAssessmentTests((int) $asmt['id']);
        }

        return $assessments;
    }

    public static function addAssessment(int $tripId, array $data): int
    {
        $maxOrder = (int) self::fetchColumn('SELECT MAX(`display_order`) FROM `medical_assessments` WHERE `medical_trip_id` = :id', [':id' => $tripId]);
        $order = isset($data['display_order']) ? (int) $data['display_order'] : ($maxOrder + 1);

        $sql = '
            INSERT INTO `medical_assessments` (
                `medical_trip_id`, `title`, `subtitle`, `short_description`, `description`,
                `image`, `icon`, `covers`, `display_order`, `is_active`
            ) VALUES (
                :trip_id, :title, :subtitle, :short_description, :description,
                :image, :icon, :covers, :display_order, :is_active
            )
        ';

        self::query($sql, [
            ':trip_id' => $tripId,
            ':title' => trim($data['title']),
            ':subtitle' => $data['subtitle'] ?? null,
            ':short_description' => $data['short_description'] ?? null,
            ':description' => $data['description'] ?? null,
            ':image' => $data['image'] ?? null,
            ':icon' => $data['icon'] ?? 'Activity',
            ':covers' => $data['covers'] ?? null,
            ':display_order' => $order,
            ':is_active' => isset($data['is_active']) ? (int) $data['is_active'] : 1,
        ]);

        $assessmentId = (int) self::db()->lastInsertId();

        // If tests array passed, insert them
        if (!empty($data['tests']) && is_array($data['tests'])) {
            foreach ($data['tests'] as $idx => $test) {
                self::addTest($assessmentId, array_merge($test, ['display_order' => $idx + 1]));
            }
        }

        return $assessmentId;
    }

    public static function updateAssessment(int $assessmentId, array $data): bool
    {
        $fields = [];
        $params = [':id' => $assessmentId];

        $allowed = ['title', 'subtitle', 'short_description', 'description', 'image', 'icon', 'covers', 'display_order', 'is_active'];
        foreach ($allowed as $f) {
            if (array_key_exists($f, $data)) {
                $val = $data[$f];
                if ($f === 'is_active') {
                    $val = ($val === true || $val === 1 || $val === '1' || $val === 'true') ? 1 : 0;
                } elseif ($f === 'display_order') {
                    $val = (int) $val;
                }
                $fields[] = "`{$f}` = :{$f}";
                $params[":{$f}"] = $val;
            }
        }

        if (!empty($fields)) {
            $sql = 'UPDATE `medical_assessments` SET ' . implode(', ', $fields) . ' WHERE `id` = :id';
            self::query($sql, $params);
        }

        return true;
    }

    public static function deleteAssessment(int $assessmentId): bool
    {
        $stmt = self::query('DELETE FROM `medical_assessments` WHERE `id` = :id', [':id' => $assessmentId]);
        return $stmt->rowCount() > 0;
    }

    public static function reorderAssessments(array $orderedIds): bool
    {
        foreach ($orderedIds as $idx => $id) {
            self::query('UPDATE `medical_assessments` SET `display_order` = :order WHERE `id` = :id', [
                ':order' => $idx + 1,
                ':id' => (int) $id,
            ]);
        }
        return true;
    }

    public static function getAssessmentTests(int $assessmentId): array
    {
        $sql = 'SELECT * FROM `medical_assessment_tests` WHERE `assessment_id` = :aid ORDER BY `display_order` ASC, `id` ASC';
        return self::fetchAll($sql, [':aid' => $assessmentId]);
    }

    public static function addTest(int $assessmentId, array $data): int
    {
        $maxOrder = (int) self::fetchColumn('SELECT MAX(`display_order`) FROM `medical_assessment_tests` WHERE `assessment_id` = :aid', [':aid' => $assessmentId]);
        $order = isset($data['display_order']) ? (int) $data['display_order'] : ($maxOrder + 1);

        $sql = '
            INSERT INTO `medical_assessment_tests` (
                `assessment_id`, `test_name`, `description`, `evaluation_details`, `report_information`, `display_order`
            ) VALUES (
                :aid, :name, :desc, :eval, :report, :order
            )
        ';

        self::query($sql, [
            ':aid' => $assessmentId,
            ':name' => trim($data['test_name'] ?? $data['name'] ?? 'Test'),
            ':desc' => $data['description'] ?? null,
            ':eval' => $data['evaluation_details'] ?? ($data['evaluation'] ?? null),
            ':report' => $data['report_information'] ?? ($data['report'] ?? null),
            ':order' => $order,
        ]);

        return (int) self::db()->lastInsertId();
    }

    public static function updateTest(int $testId, array $data): bool
    {
        $fields = [];
        $params = [':id' => $testId];
        $map = [
            'test_name' => 'test_name',
            'name' => 'test_name',
            'description' => 'description',
            'evaluation_details' => 'evaluation_details',
            'evaluation' => 'evaluation_details',
            'report_information' => 'report_information',
            'report' => 'report_information',
            'display_order' => 'display_order'
        ];

        foreach ($map as $key => $col) {
            if (array_key_exists($key, $data) && !in_array("`{$col}` = :{$col}", $fields)) {
                $fields[] = "`{$col}` = :{$col}";
                $params[":{$col}"] = $data[$key];
            }
        }

        if (empty($fields)) return false;

        $sql = 'UPDATE `medical_assessment_tests` SET ' . implode(', ', $fields) . ' WHERE `id` = :id';
        self::query($sql, $params);
        return true;
    }

    public static function deleteTest(int $testId): bool
    {
        $stmt = self::query('DELETE FROM `medical_assessment_tests` WHERE `id` = :id', [':id' => $testId]);
        return $stmt->rowCount() > 0;
    }

    /* --------------------------------------------------------------------------
     * Diseases Screened Management (Deprecated / Removed)
     * -------------------------------------------------------------------------- */

    public static function getDiseases(int $tripId, bool $onlyActive = false): array
    {
        return [];
    }

    public static function addDisease(int $tripId, array $data): int
    {
        return 0;
    }

    public static function updateDisease(int $diseaseId, array $data): bool
    {
        return true;
    }

    public static function deleteDisease(int $diseaseId): bool
    {
        return true;
    }

    /* --------------------------------------------------------------------------
     * Medical Trip Booking Requests
     * -------------------------------------------------------------------------- */

    public static function createBooking(array $data): array
    {
        $tripId = (int) ($data['medical_trip_id'] ?? 1);
        $trip = self::findById($tripId, false);
        $tripTitle = $trip ? $trip['title'] : 'Medical Tourism Package';

        // Unique booking reference
        $ref = 'MED-' . date('Y') . '-' . strtoupper(bin2hex(random_bytes(3)));

        // 1. Insert into medical_trip_bookings
        $sql = '
            INSERT INTO `medical_trip_bookings` (
                `booking_reference`, `medical_trip_id`, `customer_name`, `email`,
                `phone`, `preferred_date`, `number_of_persons`, `message`, `status`
            ) VALUES (
                :ref, :trip_id, :name, :email,
                :phone, :date, :persons, :msg, :status
            )
        ';

        self::query($sql, [
            ':ref' => $ref,
            ':trip_id' => $tripId,
            ':name' => trim($data['customer_name'] ?? $data['name'] ?? ''),
            ':email' => trim($data['email'] ?? ''),
            ':phone' => trim($data['phone'] ?? ''),
            ':date' => $data['preferred_date'] ?? date('Y-m-d', strtotime('+3 days')),
            ':persons' => max(1, (int) ($data['number_of_persons'] ?? $data['travelers'] ?? 1)),
            ':msg' => $data['message'] ?? null,
            ':status' => 'new',
        ]);

        $bookingId = (int) self::db()->lastInsertId();

        // 2. Also record in contact_messages for seamless unified Trip Requests integration
        try {
            $msgSql = '
                INSERT INTO `contact_messages` (
                    `reference_id`, `type`, `name`, `email`, `phone`, `whatsapp_number`,
                    `subject`, `message`, `tour_title`, `is_medical_trip`, `medical_trip_id`,
                    `travel_date`, `travelers`, `status`, `created_at`
                ) VALUES (
                    :ref, "trip_request", :name, :email, :phone, :whatsapp,
                    :subject, :msg, :tour_title, 1, :trip_id,
                    :date, :travelers, "new", NOW()
                )
            ';
            self::query($msgSql, [
                ':ref' => $ref,
                ':name' => trim($data['customer_name'] ?? $data['name'] ?? ''),
                ':email' => trim($data['email'] ?? ''),
                ':phone' => trim($data['phone'] ?? ''),
                ':whatsapp' => trim($data['phone'] ?? ''),
                ':subject' => "Medical Trip Booking: {$tripTitle}",
                ':msg' => $data['message'] ?? "Medical Trip booking request for {$tripTitle}.",
                ':tour_title' => $tripTitle,
                ':trip_id' => $tripId,
                ':date' => $data['preferred_date'] ?? date('Y-m-d'),
                ':travelers' => max(1, (int) ($data['number_of_persons'] ?? 1)),
            ]);
        } catch (\Throwable $e) {
            // Silently continue if contact_messages insert hits constraint
        }

        return [
            'id' => $bookingId,
            'booking_reference' => $ref,
            'medical_trip_id' => $tripId,
            'package_title' => $tripTitle,
            'customer_name' => $data['customer_name'] ?? $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'preferred_date' => $data['preferred_date'],
            'number_of_persons' => $data['number_of_persons'] ?? 1,
            'status' => 'new',
            'created_at' => date('Y-m-d H:i:s'),
        ];
    }

    public static function getBookings(array $filters = [], int $page = 1, int $limit = 20): array
    {
        $page = max(1, $page);
        $limit = max(1, min(100, $limit));
        $offset = ($page - 1) * $limit;

        $conditions = [];
        $params = [];

        if (!empty($filters['search'])) {
            $conditions[] = '(`b`.`customer_name` LIKE :search OR `b`.`email` LIKE :search OR `b`.`phone` LIKE :search OR `b`.`booking_reference` LIKE :search)';
            $params[':search'] = '%' . trim($filters['search']) . '%';
        }

        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $conditions[] = '`b`.`status` = :status';
            $params[':status'] = $filters['status'];
        }

        if (!empty($filters['medical_trip_id']) && $filters['medical_trip_id'] !== 'all') {
            $conditions[] = '`b`.`medical_trip_id` = :trip_id';
            $params[':trip_id'] = (int) $filters['medical_trip_id'];
        }

        $whereClause = !empty($conditions) ? 'WHERE ' . implode(' AND ', $conditions) : '';

        $total = (int) self::fetchColumn("SELECT COUNT(*) FROM `medical_trip_bookings` b {$whereClause}", $params);
        $totalPages = (int) ceil($total / $limit) ?: 1;

        $sql = "
            SELECT b.*, mt.`title` as package_title, mt.`slug` as package_slug, mt.`price` as package_price
            FROM `medical_trip_bookings` b
            LEFT JOIN `medical_trips` mt ON mt.`id` = b.`medical_trip_id`
            {$whereClause}
            ORDER BY b.`created_at` DESC
            LIMIT {$limit} OFFSET {$offset}
        ";

        $items = self::fetchAll($sql, $params);

        return [
            'items' => $items,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'total_pages' => $totalPages,
            ]
        ];
    }

    public static function updateBookingStatus(int $bookingId, string $status): bool
    {
        $sql = 'UPDATE `medical_trip_bookings` SET `status` = :status WHERE `id` = :id';
        self::query($sql, [':status' => $status, ':id' => $bookingId]);

        // Also update matching contact_messages status by booking reference
        $ref = self::fetchColumn('SELECT `booking_reference` FROM `medical_trip_bookings` WHERE `id` = :id', [':id' => $bookingId]);
        if ($ref) {
            self::query('UPDATE `contact_messages` SET `status` = :status WHERE `reference_id` = :ref', [
                ':status' => $status,
                ':ref' => $ref,
            ]);
        }
        return true;
    }

    /**
     * Decode JSON string attributes safely.
     */
    private static function decodeJsonFields(array $item): array
    {
        $jsonKeys = ['highlights', 'benefits', 'included_services', 'excluded_services'];
        foreach ($jsonKeys as $key) {
            if (!empty($item[$key]) && is_string($item[$key])) {
                $decoded = json_decode($item[$key], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $item[$key] = $decoded;
                }
            }
        }
        return $item;
    }
}
