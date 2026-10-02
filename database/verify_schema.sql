-- ==============================================================================
-- Wanderer South India - Phase 1 Schema & Seed Verification Script
-- Target Database: wanderersouthindia
-- ==============================================================================

USE `wanderersouthindia`;

-- 1. Verify Storage Engine & Collation of All Tables
SELECT 
    TABLE_NAME, 
    ENGINE, 
    TABLE_COLLATION, 
    TABLE_ROWS 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'wanderersouthindia' 
ORDER BY TABLE_NAME;

-- 2. Count Total Tables (Expected: 28 application tables + 1 migrations table = 29 tables)
SELECT 
    COUNT(*) AS total_tables,
    SUM(CASE WHEN ENGINE = 'InnoDB' THEN 1 ELSE 0 END) AS innodb_tables,
    SUM(CASE WHEN TABLE_COLLATION = 'utf8mb4_unicode_ci' THEN 1 ELSE 0 END) AS utf8mb4_tables
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'wanderersouthindia';

-- 3. Verify Foreign Keys Count & Mappings
SELECT 
    CONSTRAINT_NAME, 
    TABLE_NAME, 
    COLUMN_NAME, 
    REFERENCED_TABLE_NAME, 
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'wanderersouthindia' 
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, CONSTRAINT_NAME;

SELECT 
    COUNT(*) AS total_foreign_keys
FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'wanderersouthindia' 
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- 4. Verify Unique Constraints
SELECT 
    TABLE_NAME, 
    INDEX_NAME, 
    NON_UNIQUE, 
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS indexed_columns
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'wanderersouthindia' AND NON_UNIQUE = 0
GROUP BY TABLE_NAME, INDEX_NAME, NON_UNIQUE
ORDER BY TABLE_NAME, INDEX_NAME;

-- 5. Verify Seed Data Record Counts
SELECT 'roles' AS entity, COUNT(*) AS record_count FROM `roles`
UNION ALL
SELECT 'permissions' AS entity, COUNT(*) AS record_count FROM `permissions`
UNION ALL
SELECT 'role_permissions' AS entity, COUNT(*) AS record_count FROM `role_permissions`
UNION ALL
SELECT 'users (super admin)' AS entity, COUNT(*) AS record_count FROM `users`
UNION ALL
SELECT 'user_roles' AS entity, COUNT(*) AS record_count FROM `user_roles`
UNION ALL
SELECT 'tour_categories' AS entity, COUNT(*) AS record_count FROM `tour_categories`
UNION ALL
SELECT 'site_settings' AS entity, COUNT(*) AS record_count FROM `site_settings`
UNION ALL
SELECT 'pages' AS entity, COUNT(*) AS record_count FROM `pages`
UNION ALL
SELECT 'footer_links' AS entity, COUNT(*) AS record_count FROM `footer_links`
UNION ALL
SELECT 'social_links' AS entity, COUNT(*) AS record_count FROM `social_links`
UNION ALL
SELECT 'home_benefits' AS entity, COUNT(*) AS record_count FROM `home_benefits`
UNION ALL
SELECT 'migrations' AS entity, COUNT(*) AS record_count FROM `migrations`;

-- 6. Verify Super Admin User & Role Association
SELECT 
    u.id, 
    u.name, 
    u.email, 
    u.status, 
    r.name AS role_name, 
    r.slug AS role_slug,
    COUNT(rp.permission_id) AS total_permissions
FROM `users` u
JOIN `user_roles` ur ON u.id = ur.user_id
JOIN `roles` r ON ur.role_id = r.id
JOIN `role_permissions` rp ON r.id = rp.role_id
WHERE u.email = 'admin@wanderersouthindia.com'
GROUP BY u.id, u.name, u.email, u.status, r.name, r.slug;
