<?php

namespace App\Models;

class Role extends BaseModel
{
    /**
     * Retrieve all roles with member count and their assigned permissions.
     *
     * @return array
     */
    public static function getAll(): array
    {
        $sql = 'SELECT r.`id`, r.`name`, r.`slug`, r.`description`, r.`is_system`, r.`created_at`, r.`updated_at`,
                       (SELECT COUNT(*) FROM `user_roles` ur INNER JOIN `users` u ON ur.`user_id` = u.`id` WHERE ur.`role_id` = r.`id` AND u.`deleted_at` IS NULL) as `users_count`
                FROM `roles` r
                ORDER BY r.`id` ASC';

        $roles = self::fetchAll($sql);

        // Fetch permissions for each role
        foreach ($roles as &$role) {
            $role['id'] = (int) $role['id'];
            $role['is_system'] = (bool) $role['is_system'];
            $role['users_count'] = (int) $role['users_count'];
            $role['permissions'] = self::getPermissionsForRole($role['id']);
        }

        return $roles;
    }

    /**
     * Find a role by its ID.
     *
     * @param int $id
     * @return array|null
     */
    public static function findById(int $id): ?array
    {
        $sql = 'SELECT r.`id`, r.`name`, r.`slug`, r.`description`, r.`is_system`, r.`created_at`, r.`updated_at`,
                       (SELECT COUNT(*) FROM `user_roles` ur INNER JOIN `users` u ON ur.`user_id` = u.`id` WHERE ur.`role_id` = r.`id` AND u.`deleted_at` IS NULL) as `users_count`
                FROM `roles` r
                WHERE r.`id` = :id
                LIMIT 1';

        $role = self::fetchOne($sql, [':id' => $id]);

        if ($role) {
            $role['id'] = (int) $role['id'];
            $role['is_system'] = (bool) $role['is_system'];
            $role['users_count'] = (int) $role['users_count'];
            $role['permissions'] = self::getPermissionsForRole($role['id']);
        }

        return $role;
    }

    /**
     * Find a role by its slug.
     *
     * @param string $slug
     * @return array|null
     */
    public static function findBySlug(string $slug): ?array
    {
        $sql = 'SELECT r.`id`, r.`name`, r.`slug`, r.`description`, r.`is_system`, r.`created_at`, r.`updated_at`
                FROM `roles` r
                WHERE r.`slug` = :slug
                LIMIT 1';

        $role = self::fetchOne($sql, [':slug' => $slug]);

        if ($role) {
            $role['id'] = (int) $role['id'];
            $role['is_system'] = (bool) $role['is_system'];
            $role['permissions'] = self::getPermissionsForRole($role['id']);
        }

        return $role;
    }

    /**
     * Get all permission names assigned to a role.
     *
     * @param int $roleId
     * @return array
     */
    public static function getPermissionsForRole(int $roleId): array
    {
        $sql = 'SELECT p.`id`, p.`name`, p.`group_name`, p.`description`
                FROM `permissions` p
                INNER JOIN `role_permissions` rp ON p.`id` = rp.`permission_id`
                WHERE rp.`role_id` = :role_id
                ORDER BY p.`group_name` ASC, p.`name` ASC';

        $rows = self::fetchAll($sql, [':role_id' => $roleId]);
        return array_map(function ($p) {
            return [
                'id' => (int) $p['id'],
                'name' => $p['name'],
                'group_name' => $p['group_name'],
                'description' => $p['description'],
            ];
        }, $rows);
    }

    /**
     * Get all system permissions grouped by group_name.
     *
     * @return array
     */
    public static function getAllPermissionsGrouped(): array
    {
        $sql = 'SELECT `id`, `name`, `group_name`, `description`
                FROM `permissions`
                ORDER BY `group_name` ASC, `name` ASC';

        $all = self::fetchAll($sql);
        $grouped = [];

        foreach ($all as $perm) {
            $group = $perm['group_name'] ?? 'General';
            if (!isset($grouped[$group])) {
                $grouped[$group] = [];
            }
            $grouped[$group][] = [
                'id' => (int) $perm['id'],
                'name' => $perm['name'],
                'group_name' => $perm['group_name'],
                'description' => $perm['description'],
            ];
        }

        return $grouped;
    }

    /**
     * Get flat list of all system permissions.
     *
     * @return array
     */
    public static function getAllPermissions(): array
    {
        $sql = 'SELECT `id`, `name`, `group_name`, `description`
                FROM `permissions`
                ORDER BY `group_name` ASC, `name` ASC';

        $rows = self::fetchAll($sql);
        return array_map(function ($p) {
            return [
                'id' => (int) $p['id'],
                'name' => $p['name'],
                'group_name' => $p['group_name'],
                'description' => $p['description'],
            ];
        }, $rows);
    }
}
