<?php

namespace App\Models;

use App\Utils\Database;
use PDO;

class SiteSetting extends BaseModel
{
    public const ALLOWED_GROUPS = ['general', 'contact', 'footer', 'seo', 'payment'];

    public const SYSTEM_CRITICAL_KEYS = [
        'site_name',
        'default_currency',
        'currency_symbol',
        'timezone',
        'contact_email',
        'default_payment_method',
    ];

    /**
     * Create a new site setting.
     *
     * @param array $data
     * @return int
     */
    public static function create(array $data): int
    {
        $sql = 'INSERT INTO `site_settings` (
            `setting_key`, `setting_value`, `setting_group`,
            `created_at`, `updated_at`
        ) VALUES (
            :setting_key, :setting_value, :setting_group,
            NOW(), NOW()
        )';

        self::execute($sql, [
            ':setting_key' => $data['setting_key'],
            ':setting_value' => isset($data['setting_value']) ? (string) $data['setting_value'] : null,
            ':setting_group' => in_array($data['setting_group'] ?? '', self::ALLOWED_GROUPS, true) ? $data['setting_group'] : 'general',
        ]);

        return (int) self::lastInsertId();
    }

    /**
     * Update an existing site setting by ID.
     *
     * @param int $id
     * @param array $data
     * @return bool
     */
    public static function update(int $id, array $data): bool
    {
        $fields = [];
        $params = [':id' => $id];

        $allowedColumns = ['setting_key', 'setting_value', 'setting_group'];

        foreach ($allowedColumns as $col) {
            if (array_key_exists($col, $data)) {
                $fields[] = "`{$col}` = :{$col}";
                if ($col === 'setting_group') {
                    $params[":{$col}"] = in_array($data[$col], self::ALLOWED_GROUPS, true) ? $data[$col] : 'general';
                } elseif ($col === 'setting_value') {
                    $params[":{$col}"] = $data[$col] !== null ? (string) $data[$col] : null;
                } else {
                    $params[":{$col}"] = $data[$col];
                }
            }
        }

        if (empty($fields)) {
            return false;
        }

        $fields[] = '`updated_at` = NOW()';
        $sql = 'UPDATE `site_settings` SET ' . implode(', ', $fields) . ' WHERE `id` = :id';

        return self::execute($sql, $params) > 0;
    }

    /**
     * Find a single site setting by numeric primary ID.
     *
     * @param int $id
     * @param bool $includeDeleted
     * @return array|null
     */
    public static function findById(int $id, bool $includeDeleted = false): ?array
    {
        $sql = 'SELECT s.* FROM `site_settings` s WHERE s.`id` = :id';
        if (!$includeDeleted) {
            $sql .= ' AND s.`deleted_at` IS NULL';
        }
        $sql .= ' LIMIT 1';

        $setting = self::fetchOne($sql, [':id' => $id]);
        if (!$setting) {
            return null;
        }

        return self::formatSetting($setting);
    }

    /**
     * Find a single site setting by its unique setting_key.
     *
     * @param string $key
     * @param bool $includeDeleted
     * @return array|null
     */
    public static function findByKey(string $key, bool $includeDeleted = false): ?array
    {
        $sql = 'SELECT s.* FROM `site_settings` s WHERE s.`setting_key` = :setting_key';
        if (!$includeDeleted) {
            $sql .= ' AND s.`deleted_at` IS NULL';
        }
        $sql .= ' LIMIT 1';

        $setting = self::fetchOne($sql, [':setting_key' => $key]);
        if (!$setting) {
            return null;
        }

        return self::formatSetting($setting);
    }

    /**
     * List all settings with optional filtering, search, and pagination.
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

        // Filter by group
        if (!empty($filters['group']) && in_array($filters['group'], self::ALLOWED_GROUPS, true)) {
            $where[] = 's.`setting_group` = :group';
            $params[':group'] = $filters['group'];
        }

        // Search in setting_key and setting_value
        if (!empty($filters['search'])) {
            $where[] = '(s.`setting_key` LIKE :search1 OR s.`setting_value` LIKE :search2)';
            $searchVal = '%' . $filters['search'] . '%';
            $params[':search1'] = $searchVal;
            $params[':search2'] = $searchVal;
        }

        $whereClause = !empty($where) ? ' WHERE ' . implode(' AND ', $where) : '';

        // Sorting
        $allowedSortColumns = ['id', 'setting_key', 'setting_group', 'created_at', 'updated_at'];
        $sortBy = in_array($filters['sort_by'] ?? '', $allowedSortColumns, true) ? $filters['sort_by'] : 'id';
        $sortOrder = strtoupper($filters['sort_order'] ?? 'ASC') === 'DESC' ? 'DESC' : 'ASC';

        // Pagination
        $page = max(1, (int) ($filters['page'] ?? 1));
        $limit = max(1, min(200, (int) ($filters['limit'] ?? 100)));
        $offset = ($page - 1) * $limit;

        $sql = "SELECT s.* FROM `site_settings` s
                {$whereClause}
                ORDER BY s.`{$sortBy}` {$sortOrder}, s.`id` ASC
                LIMIT {$limit} OFFSET {$offset}";

        $rows = self::fetchAll($sql, $params);

        return array_map([self::class, 'formatSetting'], $rows);
    }

    /**
     * Get total count of settings matching filters.
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

        if (!empty($filters['group']) && in_array($filters['group'], self::ALLOWED_GROUPS, true)) {
            $where[] = 's.`setting_group` = :group';
            $params[':group'] = $filters['group'];
        }

        if (!empty($filters['search'])) {
            $where[] = '(s.`setting_key` LIKE :search1 OR s.`setting_value` LIKE :search2)';
            $searchVal = '%' . $filters['search'] . '%';
            $params[':search1'] = $searchVal;
            $params[':search2'] = $searchVal;
        }

        $whereClause = !empty($where) ? ' WHERE ' . implode(' AND ', $where) : '';
        $sql = "SELECT COUNT(*) FROM `site_settings` s {$whereClause}";

        return (int) self::fetchColumn($sql, $params);
    }

    /**
     * Get all active settings organized by their group.
     *
     * @param bool $includeDeleted
     * @return array
     */
    public static function getAllGrouped(bool $includeDeleted = false): array
    {
        $sql = 'SELECT s.* FROM `site_settings` s';
        if (!$includeDeleted) {
            $sql .= ' WHERE s.`deleted_at` IS NULL';
        }
        $sql .= ' ORDER BY s.`setting_group` ASC, s.`id` ASC';

        $rows = self::fetchAll($sql);
        $grouped = [];

        foreach (self::ALLOWED_GROUPS as $grp) {
            $grouped[$grp] = [];
        }

        foreach ($rows as $row) {
            $grp = $row['setting_group'];
            $grouped[$grp][$row['setting_key']] = $row['setting_value'];
        }

        return $grouped;
    }

    /**
     * Get settings belonging to a specific group.
     *
     * @param string $group
     * @param bool $includeDeleted
     * @return array
     */
    public static function getByGroup(string $group, bool $includeDeleted = false): array
    {
        $sql = 'SELECT s.* FROM `site_settings` s WHERE s.`setting_group` = :group';
        if (!$includeDeleted) {
            $sql .= ' AND s.`deleted_at` IS NULL';
        }
        $sql .= ' ORDER BY s.`id` ASC';

        $rows = self::fetchAll($sql, [':group' => $group]);
        return array_map([self::class, 'formatSetting'], $rows);
    }

    /**
     * Soft-delete or permanently delete a site setting.
     *
     * @param int $id
     * @param int|null $deletedBy
     * @param bool $force
     * @return bool
     */
    public static function softDelete(int $id, ?int $deletedBy = null, bool $force = false): bool
    {
        if ($force) {
            $sql = 'DELETE FROM `site_settings` WHERE `id` = :id';
            return self::execute($sql, [':id' => $id]) > 0;
        }

        $sql = 'UPDATE `site_settings` SET `deleted_at` = NOW(), `deleted_by` = :deleted_by, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NULL';
        return self::execute($sql, [':id' => $id, ':deleted_by' => $deletedBy]) > 0;
    }

    /**
     * Restore a soft-deleted site setting.
     *
     * @param int $id
     * @return bool
     */
    public static function restore(int $id): bool
    {
        $sql = 'UPDATE `site_settings` SET `deleted_at` = NULL, `deleted_by` = NULL, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NOT NULL';
        return self::execute($sql, [':id' => $id]) > 0;
    }

    /**
     * Check if a setting_key is already in use by another record.
     *
     * @param string $key
     * @param int|null $excludeId
     * @return bool
     */
    public static function isKeyTaken(string $key, ?int $excludeId = null): bool
    {
        $sql = 'SELECT COUNT(*) FROM `site_settings` WHERE `setting_key` = :setting_key';
        $params = [':setting_key' => $key];

        if ($excludeId !== null) {
            $sql .= ' AND `id` != :exclude_id';
            $params[':exclude_id'] = $excludeId;
        }

        return ((int) self::fetchColumn($sql, $params)) > 0;
    }

    /**
     * Check if a setting_key is system critical.
     *
     * @param string $key
     * @return bool
     */
    public static function isSystemCritical(string $key): bool
    {
        return in_array($key, self::SYSTEM_CRITICAL_KEYS, true);
    }

    /**
     * Format a setting row for API response.
     *
     * @param array $row
     * @return array
     */
    public static function formatSetting(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'setting_key' => $row['setting_key'],
            'setting_value' => $row['setting_value'],
            'setting_group' => $row['setting_group'],
            'is_system_critical' => self::isSystemCritical($row['setting_key']),
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
            'deleted_at' => $row['deleted_at'] ?? null,
            'deleted_by' => !empty($row['deleted_by']) ? (int) $row['deleted_by'] : null,
        ];
    }
}
