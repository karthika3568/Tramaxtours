<?php

namespace App\Models;

use App\Utils\Database;
use PDO;

class TripRequest extends BaseModel
{
    public const ALLOWED_STATUSES = ['new', 'contacted', 'planning', 'quotation_sent', 'confirmed', 'closed', 'cancelled'];
    public const ALLOWED_CONTACT_METHODS = ['email', 'phone', 'whatsapp'];
    public const ALLOWED_TRANSPORTATION_MODES = ['private_car', 'coach', 'self_drive', 'not_sure'];
    public const ALLOWED_ACCOMMODATION_TYPES = ['budget', 'standard', 'luxury', 'not_sure'];
    public const ALLOWED_ARRIVAL_MODES = ['flight', 'train', 'not_sure', 'none'];
    public const ALLOWED_DOCUMENT_TYPES = ['passport', 'flight_ticket'];

    /**
     * Generate a unique reference ID in the form TRP-YYYY-NNNNNN.
     *
     * @return string
     */
    public static function generateReferenceId(): string
    {
        $prefix = 'TRP-' . date('Y') . '-';
        do {
            $suffix = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            $referenceId = $prefix . $suffix;
        } while (self::referenceExists($referenceId));

        return $referenceId;
    }

    /**
     * @param string $referenceId
     * @return bool
     */
    public static function referenceExists(string $referenceId): bool
    {
        return ((int) self::fetchColumn(
            'SELECT COUNT(*) FROM `trip_requests` WHERE `reference_id` = :ref',
            [':ref' => $referenceId]
        )) > 0;
    }

    /**
     * Guard against rapid duplicate submissions from the same email within a short window.
     *
     * @param string $email
     * @param int $windowSeconds
     * @return bool
     */
    public static function hasRecentDuplicate(string $email, int $windowSeconds = 120): bool
    {
        $sql = 'SELECT COUNT(*) FROM `trip_requests`
                WHERE `email` = :email AND `deleted_at` IS NULL
                AND `created_at` >= DATE_SUB(NOW(), INTERVAL :seconds SECOND)';

        return ((int) self::fetchColumn($sql, [':email' => $email, ':seconds' => $windowSeconds])) > 0;
    }

    /**
     * Basic same-IP throttle to deter abuse.
     *
     * @param string $ip
     * @param int $maxPerHour
     * @return bool
     */
    public static function exceedsIpRateLimit(string $ip, int $maxPerHour = 10): bool
    {
        if ($ip === '') {
            return false;
        }

        $sql = 'SELECT COUNT(*) FROM `trip_requests`
                WHERE `source_ip` = :ip
                AND `created_at` >= DATE_SUB(NOW(), INTERVAL 1 HOUR)';

        return ((int) self::fetchColumn($sql, [':ip' => $ip])) >= $maxPerHour;
    }

    /**
     * Filter a list of category slugs down to the ones that actually exist
     * and are active, so `preferred_categories` never stores garbage.
     *
     * @param array $slugs
     * @return array
     */
    public static function filterValidCategorySlugs(array $slugs): array
    {
        $slugs = array_values(array_unique(array_filter(array_map('trim', $slugs))));
        if (empty($slugs)) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($slugs), '?'));
        $sql = "SELECT `slug` FROM `tour_categories` WHERE `status` = 'active' AND `slug` IN ({$placeholders})";
        $stmt = self::db()->prepare($sql);
        $stmt->execute($slugs);

        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    /**
     * Create a trip request with its initial status-history row and optional
     * documents, all inside a single transaction.
     *
     * @param array $data
     * @param array $documents Each: ['document_type', 'original_name', 'stored_filename', 'mime_type', 'file_size']
     * @return array{id: int, reference_id: string}
     */
    public static function create(array $data, array $documents = []): array
    {
        $referenceId = self::generateReferenceId();

        Database::beginTransaction();

        try {
            $sql = 'INSERT INTO `trip_requests` (
                `reference_id`, `full_name`, `email`, `phone`, `whatsapp_number`, `preferred_contact_method`,
                `destination_id`, `tour_id`, `trip_start_date`, `trip_end_date`, `duration_days`, `trip_notes`,
                `adults_count`, `children_count`, `infants_count`,
                `preferred_categories`, `special_interests`,
                `transportation_mode`, `needs_airport_pickup`,
                `accommodation_type`, `accommodation_notes`,
                `arrival_mode`, `arrival_details`, `arrival_datetime`,
                `departure_mode`, `departure_details`, `departure_datetime`,
                `budget_amount`, `budget_currency`, `budget_notes`,
                `status`, `email_status`, `source_ip`, `user_agent`,
                `created_at`, `updated_at`
            ) VALUES (
                :reference_id, :full_name, :email, :phone, :whatsapp_number, :preferred_contact_method,
                :destination_id, :tour_id, :trip_start_date, :trip_end_date, :duration_days, :trip_notes,
                :adults_count, :children_count, :infants_count,
                :preferred_categories, :special_interests,
                :transportation_mode, :needs_airport_pickup,
                :accommodation_type, :accommodation_notes,
                :arrival_mode, :arrival_details, :arrival_datetime,
                :departure_mode, :departure_details, :departure_datetime,
                :budget_amount, :budget_currency, :budget_notes,
                :status, :email_status, :source_ip, :user_agent,
                NOW(), NOW()
            )';

            self::execute($sql, [
                ':reference_id' => $referenceId,
                ':full_name' => $data['full_name'],
                ':email' => $data['email'],
                ':phone' => $data['phone'],
                ':whatsapp_number' => $data['whatsapp_number'] ?? null,
                ':preferred_contact_method' => $data['preferred_contact_method'] ?? 'email',
                ':destination_id' => $data['destination_id'] ?? null,
                ':tour_id' => $data['tour_id'] ?? null,
                ':trip_start_date' => $data['trip_start_date'] ?? null,
                ':trip_end_date' => $data['trip_end_date'] ?? null,
                ':duration_days' => $data['duration_days'] ?? null,
                ':trip_notes' => $data['trip_notes'] ?? null,
                ':adults_count' => $data['adults_count'] ?? 1,
                ':children_count' => $data['children_count'] ?? 0,
                ':infants_count' => $data['infants_count'] ?? 0,
                ':preferred_categories' => $data['preferred_categories'] ?? null,
                ':special_interests' => $data['special_interests'] ?? null,
                ':transportation_mode' => $data['transportation_mode'] ?? 'not_sure',
                ':needs_airport_pickup' => !empty($data['needs_airport_pickup']) ? 1 : 0,
                ':accommodation_type' => $data['accommodation_type'] ?? 'not_sure',
                ':accommodation_notes' => $data['accommodation_notes'] ?? null,
                ':arrival_mode' => $data['arrival_mode'] ?? 'none',
                ':arrival_details' => $data['arrival_details'] ?? null,
                ':arrival_datetime' => $data['arrival_datetime'] ?? null,
                ':departure_mode' => $data['departure_mode'] ?? 'none',
                ':departure_details' => $data['departure_details'] ?? null,
                ':departure_datetime' => $data['departure_datetime'] ?? null,
                ':budget_amount' => $data['budget_amount'] ?? null,
                ':budget_currency' => $data['budget_currency'] ?? null,
                ':budget_notes' => $data['budget_notes'] ?? null,
                ':status' => 'new',
                ':email_status' => $data['email_status'] ?? 'not_configured',
                ':source_ip' => $data['source_ip'] ?? null,
                ':user_agent' => $data['user_agent'] ?? null,
            ]);

            $id = (int) self::lastInsertId();

            self::execute(
                'INSERT INTO `trip_request_status_history`
                    (`trip_request_id`, `previous_status`, `new_status`, `changed_by`, `note`, `created_at`)
                 VALUES (:id, NULL, :status, NULL, :note, NOW())',
                [':id' => $id, ':status' => 'new', ':note' => 'Trip request submitted.']
            );

            foreach ($documents as $doc) {
                self::execute(
                    'INSERT INTO `trip_request_documents`
                        (`trip_request_id`, `document_type`, `original_name`, `stored_filename`, `mime_type`, `file_size`, `created_at`)
                     VALUES (:id, :type, :original_name, :stored_filename, :mime_type, :file_size, NOW())',
                    [
                        ':id' => $id,
                        ':type' => $doc['document_type'],
                        ':original_name' => $doc['original_name'],
                        ':stored_filename' => $doc['stored_filename'],
                        ':mime_type' => $doc['mime_type'],
                        ':file_size' => $doc['file_size'],
                    ]
                );
            }

            Database::commit();
        } catch (\Throwable $e) {
            Database::rollBack();
            throw $e;
        }

        return ['id' => $id, 'reference_id' => $referenceId];
    }

    /**
     * Update the email_status column after an async-attempted send.
     *
     * @param int $id
     * @param string $status
     * @return void
     */
    public static function updateEmailStatus(int $id, string $status): void
    {
        self::execute(
            'UPDATE `trip_requests` SET `email_status` = :status WHERE `id` = :id',
            [':status' => $status, ':id' => $id]
        );
    }

    /**
     * @param int $id
     * @param bool $includeDeleted
     * @return array|null
     */
    public static function findById(int $id, bool $includeDeleted = false): ?array
    {
        $sql = 'SELECT tr.*, d.`name` AS destination_name, t.`title` AS tour_title, t.`slug` AS tour_slug
                FROM `trip_requests` tr
                LEFT JOIN `destinations` d ON tr.`destination_id` = d.`id`
                LEFT JOIN `tours` t ON tr.`tour_id` = t.`id`
                WHERE tr.`id` = :id';

        if (!$includeDeleted) {
            $sql .= ' AND tr.`deleted_at` IS NULL';
        }

        $row = self::fetchOne($sql, [':id' => $id]);
        return $row ? self::format($row) : null;
    }

    /**
     * @param string $referenceId
     * @return array|null
     */
    public static function findByReference(string $referenceId): ?array
    {
        $row = self::fetchOne(
            'SELECT tr.*, d.`name` AS destination_name, t.`title` AS tour_title, t.`slug` AS tour_slug
             FROM `trip_requests` tr
             LEFT JOIN `destinations` d ON tr.`destination_id` = d.`id`
             LEFT JOIN `tours` t ON tr.`tour_id` = t.`id`
             WHERE tr.`reference_id` = :ref AND tr.`deleted_at` IS NULL',
            [':ref' => $referenceId]
        );

        return $row ? self::format($row) : null;
    }

    /**
     * Paginate trip requests with admin filters.
     *
     * @param array $filters
     * @param int $page
     * @param int $limit
     * @return array
     */
    public static function paginate(array $filters = [], int $page = 1, int $limit = 20): array
    {
        $where = ['tr.`deleted_at` IS NULL'];
        $params = [];

        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $where[] = 'tr.`status` = :status';
            $params[':status'] = $filters['status'];
        }

        if (!empty($filters['destination_id'])) {
            $where[] = 'tr.`destination_id` = :destination_id';
            $params[':destination_id'] = (int) $filters['destination_id'];
        }

        if (!empty($filters['search'])) {
            $where[] = '(tr.`full_name` LIKE :search OR tr.`email` LIKE :search OR tr.`phone` LIKE :search OR tr.`reference_id` LIKE :search)';
            $params[':search'] = '%' . $filters['search'] . '%';
        }

        if (!empty($filters['date_from'])) {
            $where[] = 'tr.`created_at` >= :date_from';
            $params[':date_from'] = $filters['date_from'] . ' 00:00:00';
        }

        if (!empty($filters['date_to'])) {
            $where[] = 'tr.`created_at` <= :date_to';
            $params[':date_to'] = $filters['date_to'] . ' 23:59:59';
        }

        $whereSql = implode(' AND ', $where);

        $total = (int) self::fetchColumn("SELECT COUNT(*) FROM `trip_requests` tr WHERE {$whereSql}", $params);

        $sortBy = in_array($filters['sort_by'] ?? '', ['created_at', 'status', 'trip_start_date'], true)
            ? $filters['sort_by'] : 'created_at';
        $order = strtoupper($filters['order'] ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';

        $page = max(1, $page);
        $limit = max(1, min(100, $limit));
        $offset = ($page - 1) * $limit;

        $sql = "SELECT tr.*, d.`name` AS destination_name, t.`title` AS tour_title, t.`slug` AS tour_slug
                FROM `trip_requests` tr
                LEFT JOIN `destinations` d ON tr.`destination_id` = d.`id`
                LEFT JOIN `tours` t ON tr.`tour_id` = t.`id`
                WHERE {$whereSql}
                ORDER BY tr.`{$sortBy}` {$order}, tr.`id` DESC
                LIMIT {$limit} OFFSET {$offset}";

        $rows = self::fetchAll($sql, $params);

        return [
            'items' => array_map([self::class, 'format'], $rows),
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'total_pages' => (int) ceil($total / $limit),
            ],
        ];
    }

    /**
     * KPI counts for the admin dashboard, grouped by status.
     *
     * @return array
     */
    public static function kpiCounts(): array
    {
        $rows = self::fetchAll(
            'SELECT `status`, COUNT(*) AS total FROM `trip_requests` WHERE `deleted_at` IS NULL GROUP BY `status`'
        );

        $counts = array_fill_keys(self::ALLOWED_STATUSES, 0);
        foreach ($rows as $row) {
            $counts[$row['status']] = (int) $row['total'];
        }

        $counts['total'] = array_sum($counts);

        return $counts;
    }

    /**
     * Update status with a logged history entry.
     *
     * @param int $id
     * @param string $newStatus
     * @param int|null $changedBy
     * @param string|null $note
     * @return bool
     */
    public static function updateStatus(int $id, string $newStatus, ?int $changedBy = null, ?string $note = null): bool
    {
        $existing = self::findById($id);
        if (!$existing) {
            return false;
        }

        Database::beginTransaction();

        try {
            self::execute(
                'UPDATE `trip_requests` SET `status` = :status, `updated_at` = NOW() WHERE `id` = :id',
                [':status' => $newStatus, ':id' => $id]
            );

            self::execute(
                'INSERT INTO `trip_request_status_history`
                    (`trip_request_id`, `previous_status`, `new_status`, `changed_by`, `note`, `created_at`)
                 VALUES (:id, :previous, :new, :changed_by, :note, NOW())',
                [
                    ':id' => $id,
                    ':previous' => $existing['status'],
                    ':new' => $newStatus,
                    ':changed_by' => $changedBy,
                    ':note' => $note,
                ]
            );

            Database::commit();
        } catch (\Throwable $e) {
            Database::rollBack();
            throw $e;
        }

        return true;
    }

    /**
     * Append an admin note without changing status.
     *
     * @param int $id
     * @param string $note
     * @param int|null $changedBy
     * @return bool
     */
    public static function addNote(int $id, string $note, ?int $changedBy = null): bool
    {
        $existing = self::findById($id);
        if (!$existing) {
            return false;
        }

        self::execute(
            'UPDATE `trip_requests` SET `admin_notes` = :note, `updated_at` = NOW() WHERE `id` = :id',
            [':note' => $note, ':id' => $id]
        );

        self::execute(
            'INSERT INTO `trip_request_status_history`
                (`trip_request_id`, `previous_status`, `new_status`, `changed_by`, `note`, `created_at`)
             VALUES (:id, :prev_status, :new_status, :changed_by, :note, NOW())',
            [
                ':id' => $id,
                ':prev_status' => $existing['status'],
                ':new_status' => $existing['status'],
                ':changed_by' => $changedBy,
                ':note' => 'Note: ' . $note,
            ]
        );

        return true;
    }

    /**
     * @param int $id
     * @return array
     */
    public static function getStatusHistory(int $id): array
    {
        $sql = 'SELECT h.*, u.`name` AS changed_by_name
                FROM `trip_request_status_history` h
                LEFT JOIN `users` u ON h.`changed_by` = u.`id`
                WHERE h.`trip_request_id` = :id
                ORDER BY h.`created_at` ASC, h.`id` ASC';

        return self::fetchAll($sql, [':id' => $id]);
    }

    /**
     * @param int $id
     * @return array
     */
    public static function getDocuments(int $id): array
    {
        return self::fetchAll(
            'SELECT `id`, `document_type`, `original_name`, `mime_type`, `file_size`, `created_at`
             FROM `trip_request_documents` WHERE `trip_request_id` = :id ORDER BY `created_at` ASC',
            [':id' => $id]
        );
    }

    /**
     * Fetch one document row including its private stored_filename, for the
     * protected download endpoint only — never exposed via public API responses.
     *
     * @param int $documentId
     * @param int $tripRequestId
     * @return array|null
     */
    public static function findDocument(int $documentId, int $tripRequestId): ?array
    {
        return self::fetchOne(
            'SELECT * FROM `trip_request_documents` WHERE `id` = :doc_id AND `trip_request_id` = :tr_id',
            [':doc_id' => $documentId, ':tr_id' => $tripRequestId]
        );
    }

    /**
     * Soft-delete.
     *
     * @param int $id
     * @return bool
     */
    public static function delete(int $id): bool
    {
        return self::execute(
            'UPDATE `trip_requests` SET `deleted_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NULL',
            [':id' => $id]
        ) > 0;
    }

    private static function format(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'reference_id' => $row['reference_id'],
            'full_name' => $row['full_name'],
            'email' => $row['email'],
            'phone' => $row['phone'],
            'whatsapp_number' => $row['whatsapp_number'],
            'preferred_contact_method' => $row['preferred_contact_method'],
            'destination_id' => $row['destination_id'] ? (int) $row['destination_id'] : null,
            'destination_name' => $row['destination_name'] ?? null,
            'tour_id' => $row['tour_id'] ? (int) $row['tour_id'] : null,
            'tour_title' => $row['tour_title'] ?? null,
            'tour_slug' => $row['tour_slug'] ?? null,
            'trip_start_date' => $row['trip_start_date'],
            'trip_end_date' => $row['trip_end_date'],
            'duration_days' => $row['duration_days'] !== null ? (int) $row['duration_days'] : null,
            'trip_notes' => $row['trip_notes'],
            'adults_count' => (int) $row['adults_count'],
            'children_count' => (int) $row['children_count'],
            'infants_count' => (int) $row['infants_count'],
            'preferred_categories' => $row['preferred_categories'] ? explode(',', $row['preferred_categories']) : [],
            'special_interests' => $row['special_interests'],
            'transportation_mode' => $row['transportation_mode'],
            'needs_airport_pickup' => (bool) $row['needs_airport_pickup'],
            'accommodation_type' => $row['accommodation_type'],
            'accommodation_notes' => $row['accommodation_notes'],
            'arrival_mode' => $row['arrival_mode'],
            'arrival_details' => $row['arrival_details'],
            'arrival_datetime' => $row['arrival_datetime'],
            'departure_mode' => $row['departure_mode'],
            'departure_details' => $row['departure_details'],
            'departure_datetime' => $row['departure_datetime'],
            'budget_amount' => $row['budget_amount'] !== null ? (float) $row['budget_amount'] : null,
            'budget_currency' => $row['budget_currency'],
            'budget_notes' => $row['budget_notes'],
            'status' => $row['status'],
            'admin_notes' => $row['admin_notes'],
            'email_status' => $row['email_status'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
        ];
    }
}
