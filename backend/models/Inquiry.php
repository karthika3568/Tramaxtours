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
            `name`, `email`, `phone`, `subject`, `message`,
            `tour_id`, `destination_id`, `destination_name`, `tour_title`,
            `travel_date`, `travelers`, `status`, `admin_notes`,
            `created_at`, `updated_at`
        ) VALUES (
            :name, :email, :phone, :subject, :message,
            :tour_id, :destination_id, :destination_name, :tour_title,
            :travel_date, :travelers, :status, :admin_notes,
            NOW(), NOW()
        )';

        $status = in_array($data['status'] ?? '', self::ALLOWED_STATUSES, true) ? $data['status'] : 'new';
        $tourId = !empty($data['tour_id']) ? (int) $data['tour_id'] : null;
        $destId = !empty($data['destination_id']) ? (int) $data['destination_id'] : null;

        // If tour_id or destination_id is not given, look them up if slug/title is provided
        $tourTitle = !empty($data['tour_title']) ? trim((string)$data['tour_title']) : null;
        $destName = !empty($data['destination_name']) ? trim((string)$data['destination_name']) : null;

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

        self::execute($sql, [
            ':name' => trim((string)$data['name']),
            ':email' => trim((string)$data['email']),
            ':phone' => !empty($data['phone']) ? trim((string)$data['phone']) : null,
            ':subject' => !empty($data['subject']) ? trim((string)$data['subject']) : 'Website Travel Inquiry',
            ':message' => trim((string)($data['message'] ?? '')),
            ':tour_id' => $tourId,
            ':destination_id' => $destId,
            ':destination_name' => $destName,
            ':tour_title' => $tourTitle,
            ':travel_date' => !empty($data['travel_date']) ? trim((string)$data['travel_date']) : null,
            ':travelers' => !empty($data['travelers']) ? (int)$data['travelers'] : 1,
            ':status' => $status,
            ':admin_notes' => !empty($data['admin_notes']) ? trim((string)$data['admin_notes']) : null,
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
     * Update status and notes of an inquiry.
     *
     * @param int $id
     * @param string $status
     * @param string|null $adminNotes
     * @return bool
     */
    public static function updateStatus(int $id, string $status, ?string $adminNotes = null): bool
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
        $destination = $row['attached_destination_name'] ?: $row['destination_name'] ?: null;
        $tour = $row['attached_tour_title'] ?: $row['tour_title'] ?: null;

        return [
            'id' => (int) $row['id'],
            'name' => $row['name'],
            'email' => $row['email'],
            'phone' => $row['phone'],
            'subject' => $row['subject'],
            'message' => $row['message'],
            'tour_id' => $row['tour_id'] ? (int) $row['tour_id'] : null,
            'destination_id' => $row['destination_id'] ? (int) $row['destination_id'] : null,
            'destination_name' => $destination,
            'tour_title' => $tour,
            'travel_date' => $row['travel_date'],
            'travelers' => (int) ($row['travelers'] ?: 1),
            'status' => $row['status'],
            'admin_notes' => $row['admin_notes'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
        ];
    }
}
