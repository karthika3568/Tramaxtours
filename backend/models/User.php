<?php

namespace App\Models;

class User extends BaseModel
{
    /**
     * Find a user by email address (excluding soft-deleted accounts).
     *
     * @param string $email
     * @return array|null
     */
    public static function findByEmail(string $email): ?array
    {
        $sql = 'SELECT `id`, `name`, `email`, `password_hash`, `phone`, `status`, `email_verified_at`, `last_login_at`, `created_at`, `updated_at`
                FROM `users`
                WHERE LOWER(TRIM(`email`)) = LOWER(TRIM(:email)) AND `deleted_at` IS NULL
                LIMIT 1';

        return self::fetchOne($sql, [':email' => trim($email)]);
    }

    /**
     * Find an active user by ID (excluding soft-deleted accounts).
     *
     * @param int $id
     * @return array|null
     */
    public static function findById(int $id): ?array
    {
        $sql = 'SELECT `id`, `name`, `email`, `phone`, `status`, `email_verified_at`, `last_login_at`, `created_at`, `updated_at`
                FROM `users`
                WHERE `id` = :id AND `deleted_at` IS NULL
                LIMIT 1';

        return self::fetchOne($sql, [':id' => $id]);
    }

    /**
     * Find a user with full role details and permissions by ID.
     *
     * @param int $id
     * @return array|null
     */
    public static function findWithRoles(int $id): ?array
    {
        $user = self::findById($id);
        if (!$user) {
            return null;
        }

        $roles = self::getUserRoles($id);
        $permissions = self::getUserPermissions($id);
        $bookingsSummary = self::getUserBookingsSummary($id, $user['email']);

        $formatted = self::formatUserResponse($user, $roles, $permissions, $bookingsSummary);
        $formatted['created_at'] = $user['created_at'];
        $formatted['updated_at'] = $user['updated_at'];

        return $formatted;
    }

    /**
     * Get booking history summary for a user / customer.
     *
     * @param int $userId
     * @param string $email
     * @return array
     */
    public static function getUserBookingsSummary(int $userId, string $email): array
    {
        $sql = 'SELECT b.`id` as booking_id, b.`order_number`, b.`tour_id`, t.`title` as tour_title, t.`slug` as tour_slug,
                       b.`tickets_count`, b.`booking_date`, b.`total_price`, b.`currency`, b.`booking_status`, b.`payment_status`, b.`created_at`
                FROM `bookings` b
                LEFT JOIN `tours` t ON b.`tour_id` = t.`id`
                LEFT JOIN `booking_customer_details` bcd ON b.`id` = bcd.`booking_id`
                WHERE (b.`user_id` = :user_id OR bcd.`email` = :email) AND b.`deleted_at` IS NULL
                GROUP BY b.`id`
                ORDER BY b.`created_at` DESC';

        $bookings = self::fetchAll($sql, [':user_id' => $userId, ':email' => $email]);
        
        $totalBookings = count($bookings);
        $totalTravelers = 0;
        foreach ($bookings as $b) {
            $totalTravelers += (int) ($b['tickets_count'] ?? 1);
        }

        return [
            'bookings_count' => $totalBookings,
            'total_travelers' => $totalTravelers,
            'booked_tours' => $bookings,
        ];
    }

    /**
     * Update user's last login timestamp.
     *
     * @param int $userId
     * @return void
     */
    public static function updateLastLogin(int $userId): void
    {
        $sql = 'UPDATE `users` SET `last_login_at` = NOW() WHERE `id` = :id';
        self::execute($sql, [':id' => $userId]);
    }

    /**
     * Get all roles assigned to a user.
     *
     * @param int $userId
     * @return array
     */
    public static function getUserRoles(int $userId): array
    {
        $sql = 'SELECT r.`id`, r.`name`, r.`slug`, r.`description`, r.`is_system`
                FROM `roles` r
                INNER JOIN `user_roles` ur ON r.`id` = ur.`role_id`
                WHERE ur.`user_id` = :user_id
                ORDER BY r.`id` ASC';

        return self::fetchAll($sql, [':user_id' => $userId]);
    }

    /**
     * Get all unique permission names assigned to a user across all their roles.
     *
     * @param int $userId
     * @return array
     */
    public static function getUserPermissions(int $userId): array
    {
        $sql = 'SELECT DISTINCT p.`name`, p.`group_name`
                FROM `permissions` p
                INNER JOIN `role_permissions` rp ON p.`id` = rp.`permission_id`
                INNER JOIN `user_roles` ur ON rp.`role_id` = ur.`role_id`
                WHERE ur.`user_id` = :user_id
                ORDER BY p.`group_name` ASC, p.`name` ASC';

        $rows = self::fetchAll($sql, [':user_id' => $userId]);
        return array_column($rows, 'name');
    }

    /**
     * Format sanitized user data suitable for API responses.
     *
     * @param array $user
     * @param array $roles
     * @param array $permissions
     * @return array
     */
    public static function formatUserResponse(array $user, array $roles = [], array $permissions = [], array $bookingsSummary = []): array
    {
        $primaryRole = !empty($roles) ? ($roles[0]['slug'] ?? 'customer') : 'customer';
        $roleSlugs = array_column($roles, 'slug');

        return [
            'id' => (int) $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'phone' => $user['phone'] ?? null,
            'status' => $user['status'],
            'email_verified_at' => $user['email_verified_at'] ?? null,
            'last_login_at' => $user['last_login_at'] ?? null,
            'created_at' => $user['created_at'] ?? null,
            'updated_at' => $user['updated_at'] ?? null,
            'role' => $primaryRole,
            'roles' => $roleSlugs,
            'role_details' => $roles,
            'permissions' => $permissions,
            'permissions_count' => count($permissions),
            'bookings_count' => $bookingsSummary['bookings_count'] ?? 0,
            'total_travelers' => $bookingsSummary['total_travelers'] ?? 0,
            'booked_tours' => $bookingsSummary['booked_tours'] ?? [],
        ];
    }

    /**
     * Paginate staff/users with filters and search.
     *
     * @param array $filters
     * @param int $page
     * @param int $perPage
     * @param string $sortBy
     * @param string $sortOrder
     * @return array
     */
    public static function paginate(
        array $filters = [],
        int $page = 1,
        int $perPage = 15,
        string $sortBy = 'created_at',
        string $sortOrder = 'DESC'
    ): array {
        $allowedSorts = ['id', 'name', 'email', 'status', 'created_at', 'updated_at', 'last_login_at'];
        $sortBy = in_array(strtolower($sortBy), $allowedSorts, true) ? strtolower($sortBy) : 'created_at';
        $sortOrder = strtoupper($sortOrder) === 'ASC' ? 'ASC' : 'DESC';

        $where = ['u.`deleted_at` IS NULL'];
        $params = [];

        // Filter: Status
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $where[] = 'u.`status` = :status';
            $params[':status'] = $filters['status'];
        }

        // Filter: Search (name, email, phone)
        if (!empty($filters['search'])) {
            $search = '%' . trim($filters['search']) . '%';
            $where[] = '(u.`name` LIKE :search_name OR u.`email` LIKE :search_email OR u.`phone` LIKE :search_phone OR r.`name` LIKE :search_role OR r.`slug` LIKE :search_slug)';
            $params[':search_name'] = $search;
            $params[':search_email'] = $search;
            $params[':search_phone'] = $search;
            $params[':search_role'] = $search;
            $params[':search_slug'] = $search;
        }

        // Filter: Role Slug
        if (!empty($filters['role']) && $filters['role'] !== 'all') {
            $where[] = 'r.`slug` = :role_slug';
            $params[':role_slug'] = $filters['role'];
        }

        $whereSql = implode(' AND ', $where);

        // Count Total
        $countSql = "SELECT COUNT(DISTINCT u.`id`)
                     FROM `users` u
                     LEFT JOIN `user_roles` ur ON u.`id` = ur.`user_id`
                     LEFT JOIN `roles` r ON ur.`role_id` = r.`id`
                     WHERE {$whereSql}";
        $total = (int) self::fetchColumn($countSql, $params);

        // Calculate Pagination
        $page = max(1, $page);
        $perPage = max(1, min(100, $perPage));
        $totalPages = max(1, (int) ceil($total / $perPage));
        $offset = ($page - 1) * $perPage;

        // Fetch User IDs for current page
        $dataSql = "SELECT u.`id`, u.`name`, u.`email`, u.`phone`, u.`status`, u.`email_verified_at`, u.`last_login_at`, u.`created_at`, u.`updated_at`
                    FROM `users` u
                    LEFT JOIN `user_roles` ur ON u.`id` = ur.`user_id`
                    LEFT JOIN `roles` r ON ur.`role_id` = r.`id`
                    WHERE {$whereSql}
                    GROUP BY u.`id`
                    ORDER BY u.`{$sortBy}` {$sortOrder}
                    LIMIT {$perPage} OFFSET {$offset}";

        $rows = self::fetchAll($dataSql, $params);

        // Attach roles, permissions, and booking summary for each user
        $users = [];
        foreach ($rows as $row) {
            $userId = (int) $row['id'];
            $email = (string) $row['email'];
            $roles = self::getUserRoles($userId);
            $permissions = self::getUserPermissions($userId);
            $bookingsSummary = self::getUserBookingsSummary($userId, $email);
            $users[] = self::formatUserResponse($row, $roles, $permissions, $bookingsSummary);
        }

        return [
            'data' => $users,
            'meta' => [
                'total' => $total,
                'page' => $page,
                'per_page' => $perPage,
                'total_pages' => $totalPages,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
            'stats' => self::getStats(),
        ];
    }

    /**
     * Get aggregate statistics for users & staff.
     *
     * @return array
     */
    public static function getStats(): array
    {
        $sql = "SELECT
                    COUNT(DISTINCT u.`id`) AS `total_staff`,
                    SUM(CASE WHEN u.`status` = 'active' THEN 1 ELSE 0 END) AS `active_staff`,
                    SUM(CASE WHEN u.`status` = 'inactive' THEN 1 ELSE 0 END) AS `inactive_staff`,
                    SUM(CASE WHEN u.`status` = 'suspended' THEN 1 ELSE 0 END) AS `suspended_staff`,
                    SUM(CASE WHEN r.`slug` = 'super_admin' AND u.`status` = 'active' THEN 1 ELSE 0 END) AS `super_admins`,
                    COUNT(DISTINCT ur.`user_id`) AS `staff_with_roles`
                FROM `users` u
                LEFT JOIN `user_roles` ur ON u.`id` = ur.`user_id`
                LEFT JOIN `roles` r ON ur.`role_id` = r.`id`
                WHERE u.`deleted_at` IS NULL";

        $res = self::fetchOne($sql);

        // Also calculate overall customer booking metrics
        $bookingStatsSql = "SELECT COUNT(*) as `total_bookings`, COALESCE(SUM(`tickets_count`), 0) as `total_travelers` FROM `bookings` WHERE `deleted_at` IS NULL";
        $bRes = self::fetchOne($bookingStatsSql);

        return [
            'total_staff' => (int) ($res['total_staff'] ?? 0),
            'active_staff' => (int) ($res['active_staff'] ?? 0),
            'inactive_staff' => (int) ($res['inactive_staff'] ?? 0),
            'suspended_staff' => (int) ($res['suspended_staff'] ?? 0),
            'super_admins' => (int) ($res['super_admins'] ?? 0),
            'staff_with_roles' => (int) ($res['staff_with_roles'] ?? 0),
            'total_bookings' => (int) ($bRes['total_bookings'] ?? 0),
            'total_travelers' => (int) ($bRes['total_travelers'] ?? 0),
        ];
    }

    /**
     * Create a new user with an assigned role.
     *
     * @param array $data
     * @return array
     */
    public static function create(array $data): array
    {
        $pdo = self::db();

        $name = trim($data['name']);
        $email = trim(strtolower($data['email']));
        $phone = !empty($data['phone']) ? trim($data['phone']) : null;
        $status = in_array($data['status'] ?? 'active', ['active', 'inactive', 'suspended'], true) ? $data['status'] : 'active';
        $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT);

        // 1. Insert user
        $stmt = $pdo->prepare('INSERT INTO `users` (`name`, `email`, `password_hash`, `phone`, `status`, `created_at`, `updated_at`)
                               VALUES (:name, :email, :password_hash, :phone, :status, NOW(), NOW())');
        $stmt->execute([
            ':name' => $name,
            ':email' => $email,
            ':password_hash' => $passwordHash,
            ':phone' => $phone,
            ':status' => $status,
        ]);

        $userId = (int) $pdo->lastInsertId();

        // 2. Assign role
        $roleId = (int) ($data['role_id'] ?? 0);
        if ($roleId <= 0 && !empty($data['role'])) {
            $roleObj = Role::findBySlug($data['role']);
            if ($roleObj) {
                $roleId = $roleObj['id'];
            }
        }

        if ($roleId > 0) {
            $pdo->prepare('INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES (?, ?)')
                ->execute([$userId, $roleId]);
        }

        return self::findWithRoles($userId);
    }

    /**
     * Update an existing user.
     *
     * @param int $id
     * @param array $data
     * @return array|null
     */
    public static function updateUser(int $id, array $data): ?array
    {
        $pdo = self::db();

        $updates = [];
        $params = [':id' => $id];

        if (isset($data['name'])) {
            $updates[] = '`name` = :name';
            $params[':name'] = trim($data['name']);
        }

        if (isset($data['email'])) {
            $updates[] = '`email` = :email';
            $params[':email'] = trim(strtolower($data['email']));
        }

        if (array_key_exists('phone', $data)) {
            $updates[] = '`phone` = :phone';
            $params[':phone'] = !empty($data['phone']) ? trim($data['phone']) : null;
        }

        if (isset($data['status']) && in_array($data['status'], ['active', 'inactive', 'suspended'], true)) {
            $updates[] = '`status` = :status';
            $params[':status'] = $data['status'];
        }

        if (!empty($data['password'])) {
            $updates[] = '`password_hash` = :password_hash';
            $params[':password_hash'] = password_hash($data['password'], PASSWORD_BCRYPT);
        }

        if (!empty($updates)) {
            $updates[] = '`updated_at` = NOW()';
            $sql = 'UPDATE `users` SET ' . implode(', ', $updates) . ' WHERE `id` = :id AND `deleted_at` IS NULL';
            self::execute($sql, $params);
        }

        // Handle role update if provided
        if (isset($data['role_id']) || isset($data['role'])) {
            $roleId = (int) ($data['role_id'] ?? 0);
            if ($roleId <= 0 && !empty($data['role'])) {
                $roleObj = Role::findBySlug($data['role']);
                if ($roleObj) {
                    $roleId = $roleObj['id'];
                }
            }

            if ($roleId > 0) {
                // Delete previous roles and assign new role
                $pdo->prepare('DELETE FROM `user_roles` WHERE `user_id` = ?')->execute([$id]);
                $pdo->prepare('INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES (?, ?)')->execute([$id, $roleId]);
            }
        }

        return self::findWithRoles($id);
    }

    /**
     * Update user account status.
     *
     * @param int $id
     * @param string $status
     * @return bool
     */
    public static function setStatus(int $id, string $status): bool
    {
        if (!in_array($status, ['active', 'inactive', 'suspended'], true)) {
            return false;
        }

        $sql = 'UPDATE `users` SET `status` = :status, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NULL';
        return self::execute($sql, [':id' => $id, ':status' => $status]) > 0;
    }

    /**
     * Soft-delete a user account.
     *
     * @param int $id
     * @return bool
     */
    public static function softDelete(int $id): bool
    {
        $sql = 'UPDATE `users` SET `deleted_at` = NOW(), `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NULL';
        return self::execute($sql, [':id' => $id]) > 0;
    }

    /**
     * Count active super admin users.
     *
     * @return int
     */
    public static function countActiveSuperAdmins(): int
    {
        $sql = "SELECT COUNT(DISTINCT u.`id`)
                FROM `users` u
                INNER JOIN `user_roles` ur ON u.`id` = ur.`user_id`
                INNER JOIN `roles` r ON ur.`role_id` = r.`id`
                WHERE r.`slug` = 'super_admin' AND u.`status` = 'active' AND u.`deleted_at` IS NULL";

        return (int) self::fetchColumn($sql);
    }

    /**
     * Check if a given user is the last remaining active super admin.
     *
     * @param int $userId
     * @return bool
     */
    public static function isLastSuperAdmin(int $userId): bool
    {
        // Check if user is super admin
        $roles = self::getUserRoles($userId);
        $isSuperAdmin = false;
        foreach ($roles as $r) {
            if ($r['slug'] === 'super_admin') {
                $isSuperAdmin = true;
                break;
            }
        }

        if (!$isSuperAdmin) {
            return false;
        }

        return self::countActiveSuperAdmins() <= 1;
    }

    /**
     * Synchronize super admin credentials from .env if configured.
     * Ensures changing ADMIN_EMAIL or ADMIN_PASSWORD in .env immediately updates MySQL database.
     *
     * @return void
     */
    public static function syncAdminFromEnv(): void
    {
        $adminEmail = trim((string) \App\Utils\Env::get('ADMIN_EMAIL', ''));
        $adminPassword = (string) \App\Utils\Env::get('ADMIN_PASSWORD', 'Admin@12345');
        $adminName = trim((string) \App\Utils\Env::get('ADMIN_NAME', 'Super Admin'));

        if ($adminPassword === '') {
            $adminPassword = 'Admin@12345';
        }

        try {
            $pdo = \App\Utils\Database::getConnection();

            // 1. Check or create super_admin role
            $roleStmt = $pdo->query("SELECT id FROM roles WHERE slug = 'super_admin' LIMIT 1");
            $superAdminRoleId = $roleStmt->fetchColumn();

            if (!$superAdminRoleId) {
                $pdo->exec("INSERT INTO roles (name, slug, description, is_system, created_at, updated_at) VALUES ('Super Admin', 'super_admin', 'Full system control and unrestricted administrative privileges', 1, NOW(), NOW())");
                $superAdminRoleId = (int) $pdo->lastInsertId();
            }

            // Target admin emails to ensure they exist and have valid credentials
            $adminEmails = ['admin@wanderersouthindia.com'];
            if ($adminEmail !== '' && !in_array(strtolower($adminEmail), array_map('strtolower', $adminEmails), true)) {
                $adminEmails[] = $adminEmail;
            }

            $newHash = password_hash($adminPassword, PASSWORD_BCRYPT);

            foreach ($adminEmails as $emailToSync) {
                $stmt = $pdo->prepare("SELECT id, email, password_hash, status FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM(?)) AND deleted_at IS NULL LIMIT 1");
                $stmt->execute([$emailToSync]);
                $user = $stmt->fetch(\PDO::FETCH_ASSOC);

                if ($user) {
                    $updates = [];
                    $params = [];

                    if (!password_verify($adminPassword, $user['password_hash'])) {
                        $updates[] = "`password_hash` = ?";
                        $params[] = $newHash;
                    }

                    if ($user['status'] !== 'active') {
                        $updates[] = "`status` = 'active'";
                    }

                    if (!empty($updates)) {
                        $params[] = $user['id'];
                        $sql = "UPDATE `users` SET " . implode(', ', $updates) . ", `updated_at` = NOW() WHERE `id` = ?";
                        $pdo->prepare($sql)->execute($params);
                    }

                    // Ensure super_admin role is assigned
                    $checkRole = $pdo->prepare("SELECT 1 FROM user_roles WHERE user_id = ? AND role_id = ?");
                    $checkRole->execute([$user['id'], $superAdminRoleId]);
                    if (!$checkRole->fetchColumn()) {
                        $pdo->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)")->execute([$user['id'], $superAdminRoleId]);
                    }
                } else {
                    $insertStmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, status, created_at, updated_at) VALUES (?, ?, ?, 'active', NOW(), NOW())");
                    $insertStmt->execute([$adminName, $emailToSync, $newHash]);
                    $newUserId = (int) $pdo->lastInsertId();

                    $pdo->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)")->execute([$newUserId, $superAdminRoleId]);
                }
            }
        } catch (\Throwable $e) {
            error_log("Admin sync error: " . $e->getMessage());
        }
    }
}
