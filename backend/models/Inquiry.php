<?php

namespace App\Models;

use App\Utils\Database;
use PDO;

class Inquiry extends BaseModel
{
    public const ALLOWED_STATUSES = ['new', 'contacted', 'converted', 'closed', 'read', 'replied', 'archived'];

    /**
     * Create a new inquiry / contact message.
     *
     * @param array $data
     * @return int
     */
    public static function create(array $data): int
    {
        $sql = 'INSERT INTO `contact_messages` (
            `name`, `email`, `phone`, `whatsapp_number`, `country`, `subject`, `message`,
            `tour_id`, `destination_id`, `destination_name`, `pickup_location`, `tour_title`,
            `travel_date`, `arrival_date`, `departure_date`, `duration_days`,
            `travelers`, `adults_count`, `children_count`, `infants_count`,
            `vehicle_preference`, `airport_pickup`, `airport_drop`,
            `hotel_category`, `rooms_count`, `room_type`, `tour_types`,
            `tour_guide_required`, `preferred_language`,
            `arrival_flight_train_number`, `arrival_time`,
            `departure_flight_train_number`, `departure_time`,
            `approximate_budget`, `budget_currency`,
            `passport_file_url`, `flight_ticket_url`, `preferred_contact_methods`,
            `status`, `admin_notes`, `quotation_amount`,
            `created_at`, `updated_at`
        ) VALUES (
            :name, :email, :phone, :whatsapp_number, :country, :subject, :message,
            :tour_id, :destination_id, :destination_name, :pickup_location, :tour_title,
            :travel_date, :arrival_date, :departure_date, :duration_days,
            :travelers, :adults_count, :children_count, :infants_count,
            :vehicle_preference, :airport_pickup, :airport_drop,
            :hotel_category, :rooms_count, :room_type, :tour_types,
            :tour_guide_required, :preferred_language,
            :arrival_flight_train_number, :arrival_time,
            :departure_flight_train_number, :departure_time,
            :approximate_budget, :budget_currency,
            :passport_file_url, :flight_ticket_url, :preferred_contact_methods,
            :status, :admin_notes, :quotation_amount,
            NOW(), NOW()
        )';

        $status = in_array($data['status'] ?? '', self::ALLOWED_STATUSES, true) ? $data['status'] : 'new';
        $tourId = !empty($data['tour_id']) ? (int) $data['tour_id'] : null;
        $destId = !empty($data['destination_id']) ? (int) $data['destination_id'] : null;

        $tourTitle = !empty($data['tour_title']) ? trim((string)$data['tour_title']) : (!empty($data['tour']) ? trim((string)$data['tour']) : null);
        $destName = !empty($data['destination_name']) ? trim((string)$data['destination_name']) : (!empty($data['destination']) ? trim((string)$data['destination']) : null);

        if (!$tourId && !empty($data['tour_slug'])) {
            $tStmt = self::db()->prepare('SELECT id, title FROM tours WHERE slug = :slug LIMIT 1');
            $tStmt->execute([':slug' => $data['tour_slug']]);
            if ($t = $tStmt->fetch(PDO::FETCH_ASSOC)) {
                $tourId = (int) $t['id'];
                if (!$tourTitle) $tourTitle = $t['title'];
            }
        }

        if (!$destId && !empty($data['destination_slug'])) {
            $dStmt = self::db()->prepare('SELECT id, name FROM destinations WHERE slug = :slug LIMIT 1');
            $dStmt->execute([':slug' => $data['destination_slug']]);
            if ($d = $dStmt->fetch(PDO::FETCH_ASSOC)) {
                $destId = (int) $d['id'];
                if (!$destName) $destName = $d['name'];
            }
        }

        $adults = isset($data['adults_count']) ? (int)$data['adults_count'] : (isset($data['adults']) ? (int)$data['adults'] : 2);
        $children = isset($data['children_count']) ? (int)$data['children_count'] : (isset($data['children']) ? (int)$data['children'] : 0);
        $infants = isset($data['infants_count']) ? (int)$data['infants_count'] : (isset($data['infants']) ? (int)$data['infants'] : 0);
        $totalTravelers = !empty($data['travelers']) ? (int)$data['travelers'] : ($adults + $children + $infants);

        $tourTypes = !empty($data['tour_types']) ? (is_array($data['tour_types']) ? json_encode($data['tour_types']) : trim((string)$data['tour_types'])) : null;
        $contactMethods = !empty($data['preferred_contact_methods']) ? (is_array($data['preferred_contact_methods']) ? json_encode($data['preferred_contact_methods']) : trim((string)$data['preferred_contact_methods'])) : null;

        self::execute($sql, [
            ':name' => trim((string)$data['name']),
            ':email' => !empty($data['email']) ? trim((string)$data['email']) : 'guest@wonderersouthindia.in',
            ':phone' => !empty($data['phone']) ? trim((string)$data['phone']) : (!empty($data['whatsapp_number']) ? trim((string)$data['whatsapp_number']) : null),
            ':whatsapp_number' => !empty($data['whatsapp_number']) ? trim((string)$data['whatsapp_number']) : (!empty($data['phone']) ? trim((string)$data['phone']) : null),
            ':country' => !empty($data['country']) ? trim((string)$data['country']) : (!empty($data['nationality']) ? trim((string)$data['nationality']) : null),
            ':subject' => !empty($data['subject']) ? trim((string)$data['subject']) : 'Custom Vacation Itinerary & Quotation Request',
            ':message' => trim((string)($data['message'] ?? $data['special_requests'] ?? '')),
            ':tour_id' => $tourId,
            ':destination_id' => $destId,
            ':destination_name' => $destName,
            ':pickup_location' => !empty($data['pickup_location']) ? trim((string)$data['pickup_location']) : null,
            ':tour_title' => $tourTitle,
            ':travel_date' => !empty($data['travel_date']) ? trim((string)$data['travel_date']) : (!empty($data['arrival_date']) ? trim((string)$data['arrival_date']) : null),
            ':arrival_date' => !empty($data['arrival_date']) ? trim((string)$data['arrival_date']) : null,
            ':departure_date' => !empty($data['departure_date']) ? trim((string)$data['departure_date']) : null,
            ':duration_days' => !empty($data['duration_days']) ? trim((string)$data['duration_days']) : (!empty($data['number_of_days']) ? trim((string)$data['number_of_days']) : null),
            ':travelers' => max(1, $totalTravelers),
            ':adults_count' => $adults,
            ':children_count' => $children,
            ':infants_count' => $infants,
            ':vehicle_preference' => !empty($data['vehicle_preference']) ? trim((string)$data['vehicle_preference']) : null,
            ':airport_pickup' => !empty($data['airport_pickup']) ? 1 : 0,
            ':airport_drop' => !empty($data['airport_drop']) ? 1 : 0,
            ':hotel_category' => !empty($data['hotel_category']) ? trim((string)$data['hotel_category']) : null,
            ':rooms_count' => !empty($data['rooms_count']) ? (int)$data['rooms_count'] : 1,
            ':room_type' => !empty($data['room_type']) ? trim((string)$data['room_type']) : null,
            ':tour_types' => $tourTypes,
            ':tour_guide_required' => !empty($data['tour_guide_required']) ? 1 : 0,
            ':preferred_language' => !empty($data['preferred_language']) ? trim((string)$data['preferred_language']) : 'English',
            ':arrival_flight_train_number' => !empty($data['arrival_flight_train_number']) ? trim((string)$data['arrival_flight_train_number']) : null,
            ':arrival_time' => !empty($data['arrival_time']) ? trim((string)$data['arrival_time']) : null,
            ':departure_flight_train_number' => !empty($data['departure_flight_train_number']) ? trim((string)$data['departure_flight_train_number']) : null,
            ':departure_time' => !empty($data['departure_time']) ? trim((string)$data['departure_time']) : null,
            ':approximate_budget' => !empty($data['approximate_budget']) ? trim((string)$data['approximate_budget']) : null,
            ':budget_currency' => !empty($data['budget_currency']) ? trim((string)$data['budget_currency']) : 'INR',
            ':passport_file_url' => !empty($data['passport_file_url']) ? trim((string)$data['passport_file_url']) : null,
            ':flight_ticket_url' => !empty($data['flight_ticket_url']) ? trim((string)$data['flight_ticket_url']) : null,
            ':preferred_contact_methods' => $contactMethods,
            ':status' => $status,
            ':admin_notes' => !empty($data['admin_notes']) ? trim((string)$data['admin_notes']) : null,
            ':quotation_amount' => !empty($data['quotation_amount']) ? (float)$data['quotation_amount'] : null,
        ]);

        return (int) self::lastInsertId();
    }

    /**
     * Find inquiry by ID with joined tour and destination details.
     *
     * @param int $id
     * @return array|null
     */
    public static function find(int $id): ?array
    {
        $sql = 'SELECT cm.*,
                       t.title AS attached_tour_title, t.slug AS attached_tour_slug,
                       d.name AS attached_destination_name, d.slug AS attached_destination_slug
                FROM `contact_messages` cm
                LEFT JOIN `tours` t ON cm.tour_id = t.id
                LEFT JOIN `destinations` d ON cm.destination_id = d.id
                WHERE cm.id = :id
                LIMIT 1';

        $stmt = self::query($sql, [':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return self::formatRow($row);
    }

    /**
     * Paginated list of inquiries with filtering and search.
     *
     * @param int $page
     * @param int $limit
     * @param array $filters
     * @return array
     */
    public static function paginate(int $page = 1, int $limit = 20, array $filters = []): array
    {
        $page = max(1, $page);
        $limit = max(1, min(100, $limit));
        $offset = ($page - 1) * $limit;

        $where = ['1=1'];
        $params = [];

        if (!empty($filters['status'])) {
            $where[] = 'cm.status = :status';
            $params[':status'] = $filters['status'];
        }

        if (!empty($filters['destination_id'])) {
            $where[] = 'cm.destination_id = :dest_id';
            $params[':dest_id'] = (int) $filters['destination_id'];
        }

        if (!empty($filters['tour_id'])) {
            $where[] = 'cm.tour_id = :tour_id';
            $params[':tour_id'] = (int) $filters['tour_id'];
        }

        if (!empty($filters['search'])) {
            $term = '%' . trim($filters['search']) . '%';
            $where[] = '(cm.name LIKE :s1 OR cm.email LIKE :s2 OR cm.phone LIKE :s3 OR cm.message LIKE :s4 OR cm.subject LIKE :s5 OR cm.destination_name LIKE :s6 OR cm.tour_title LIKE :s7)';
            $params[':s1'] = $term;
            $params[':s2'] = $term;
            $params[':s3'] = $term;
            $params[':s4'] = $term;
            $params[':s5'] = $term;
            $params[':s6'] = $term;
            $params[':s7'] = $term;
        }

        if (!empty($filters['date_from'])) {
            $where[] = 'cm.created_at >= :date_from';
            $params[':date_from'] = $filters['date_from'] . ' 00:00:00';
        }

        if (!empty($filters['date_to'])) {
            $where[] = 'cm.created_at <= :date_to';
            $params[':date_to'] = $filters['date_to'] . ' 23:59:59';
        }

        $whereClause = implode(' AND ', $where);

        // Count query
        $countSql = "SELECT COUNT(*) FROM `contact_messages` cm WHERE {$whereClause}";
        $countStmt = self::query($countSql, $params);
        $total = (int) $countStmt->fetchColumn();

        // Data query
        $sql = "SELECT cm.*,
                       t.title AS attached_tour_title, t.slug AS attached_tour_slug,
                       d.name AS attached_destination_name, d.slug AS attached_destination_slug
                FROM `contact_messages` cm
                LEFT JOIN `tours` t ON cm.tour_id = t.id
                LEFT JOIN `destinations` d ON cm.destination_id = d.id
                WHERE {$whereClause}
                ORDER BY cm.id DESC
                LIMIT {$limit} OFFSET {$offset}";

        $stmt = self::query($sql, $params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $items = array_map([self::class, 'formatRow'], $rows);

        return [
            'data' => $items,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($total / $limit) ?: 1,
            ],
        ];
    }

    /**
     * Update status, admin notes, and quotation amount of an inquiry.
     *
     * @param int $id
     * @param string $status
     * @param string|null $adminNotes
     * @param float|null $quotationAmount
     * @return bool
     */
    public static function updateStatus(int $id, string $status, ?string $adminNotes = null, ?float $quotationAmount = null): bool
    {
        if (!in_array($status, self::ALLOWED_STATUSES, true)) {
            $status = 'new';
        }

        $sql = 'UPDATE `contact_messages` SET `status` = :status';
        $params = [':id' => $id, ':status' => $status];

        if ($adminNotes !== null) {
            $sql .= ', `admin_notes` = :notes';
            $params[':notes'] = $adminNotes;
        }

        if ($quotationAmount !== null) {
            $sql .= ', `quotation_amount` = :quote';
            $params[':quote'] = $quotationAmount;
        }

        $sql .= ', `updated_at` = NOW() WHERE `id` = :id';

        $stmt = self::execute($sql, $params);
        return $stmt->rowCount() > 0;
    }

    /**
     * Delete an inquiry.
     *
     * @param int $id
     * @return bool
     */
    public static function delete(int $id): bool
    {
        $stmt = self::execute('DELETE FROM `contact_messages` WHERE `id` = :id', [':id' => $id]);
        return $stmt->rowCount() > 0;
    }

    /**
     * Aggregate inquiry statistics.
     *
     * @return array
     */
    public static function stats(): array
    {
        $pdo = self::db();
        $total = (int) $pdo->query('SELECT COUNT(*) FROM contact_messages')->fetchColumn();
        $new = (int) $pdo->query("SELECT COUNT(*) FROM contact_messages WHERE status = 'new'")->fetchColumn();
        $contacted = (int) $pdo->query("SELECT COUNT(*) FROM contact_messages WHERE status IN ('contacted', 'read', 'replied')")->fetchColumn();
        $converted = (int) $pdo->query("SELECT COUNT(*) FROM contact_messages WHERE status = 'converted'")->fetchColumn();
        $closed = (int) $pdo->query("SELECT COUNT(*) FROM contact_messages WHERE status IN ('closed', 'archived')")->fetchColumn();

        return [
            'total' => $total,
            'new' => $new,
            'contacted' => $contacted,
            'converted' => $converted,
            'closed' => $closed,
        ];
    }

    /**
     * Format row with clean fields for API response.
     *
     * @param array $row
     * @return array
     */
    private static function formatRow(array $row): array
    {
        $destination = $row['attached_destination_name'] ?: ($row['destination_name'] ?? null);
        $tour = $row['attached_tour_title'] ?: ($row['tour_title'] ?? null);

        $tourTypes = [];
        if (!empty($row['tour_types'])) {
            $decoded = json_decode($row['tour_types'], true);
            $tourTypes = is_array($decoded) ? $decoded : explode(',', (string)$row['tour_types']);
        }

        $contactMethods = [];
        if (!empty($row['preferred_contact_methods'])) {
            $decoded = json_decode($row['preferred_contact_methods'], true);
            $contactMethods = is_array($decoded) ? $decoded : explode(',', (string)$row['preferred_contact_methods']);
        }

        return [
            'id' => (int) $row['id'],
            'name' => $row['name'],
            'email' => $row['email'],
            'phone' => $row['phone'],
            'whatsapp_number' => $row['whatsapp_number'] ?? $row['phone'] ?? null,
            'country' => $row['country'] ?? null,
            'subject' => $row['subject'],
            'message' => $row['message'],
            'tour_id' => !empty($row['tour_id']) ? (int) $row['tour_id'] : null,
            'destination_id' => !empty($row['destination_id']) ? (int) $row['destination_id'] : null,
            'destination_name' => $destination,
            'pickup_location' => $row['pickup_location'] ?? null,
            'tour_title' => $tour,
            'travel_date' => $row['travel_date'] ?? $row['arrival_date'] ?? null,
            'arrival_date' => $row['arrival_date'] ?? null,
            'departure_date' => $row['departure_date'] ?? null,
            'duration_days' => $row['duration_days'] ?? null,
            'travelers' => (int) ($row['travelers'] ?: 1),
            'adults_count' => isset($row['adults_count']) ? (int)$row['adults_count'] : 1,
            'children_count' => isset($row['children_count']) ? (int)$row['children_count'] : 0,
            'infants_count' => isset($row['infants_count']) ? (int)$row['infants_count'] : 0,
            'vehicle_preference' => $row['vehicle_preference'] ?? null,
            'airport_pickup' => !empty($row['airport_pickup']),
            'airport_drop' => !empty($row['airport_drop']),
            'hotel_category' => $row['hotel_category'] ?? null,
            'rooms_count' => isset($row['rooms_count']) ? (int)$row['rooms_count'] : 1,
            'room_type' => $row['room_type'] ?? null,
            'tour_types' => $tourTypes,
            'tour_guide_required' => !empty($row['tour_guide_required']),
            'preferred_language' => $row['preferred_language'] ?? 'English',
            'arrival_flight_train_number' => $row['arrival_flight_train_number'] ?? null,
            'arrival_time' => $row['arrival_time'] ?? null,
            'departure_flight_train_number' => $row['departure_flight_train_number'] ?? null,
            'departure_time' => $row['departure_time'] ?? null,
            'approximate_budget' => $row['approximate_budget'] ?? null,
            'budget_currency' => $row['budget_currency'] ?? 'INR',
            'passport_file_url' => $row['passport_file_url'] ?? null,
            'flight_ticket_url' => $row['flight_ticket_url'] ?? null,
            'preferred_contact_methods' => $contactMethods,
            'status' => $row['status'],
            'admin_notes' => $row['admin_notes'] ?? null,
            'quotation_amount' => !empty($row['quotation_amount']) ? (float)$row['quotation_amount'] : null,
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
        ];
    }
}
