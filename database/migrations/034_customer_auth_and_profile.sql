-- Migration: 034_customer_auth_and_profile.sql
-- Description: Add avatar_url column to users table and ensure index on bookings.user_id

-- 1. Add avatar_url column to users table if not already present
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'avatar_url'
);

SET @sql_stmt = IF(@col_exists = 0,
    'ALTER TABLE `users` ADD COLUMN `avatar_url` VARCHAR(500) NULL AFTER `phone`',
    'SELECT "Column avatar_url already exists in users"'
);
PREPARE stmt FROM @sql_stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Ensure customer role exists with ID 5 or slug 'customer'
INSERT INTO `roles` (`id`, `name`, `slug`, `description`, `is_system`, `created_at`, `updated_at`)
VALUES (5, 'Customer', 'customer', 'Registered public customer for viewing personal bookings and review history', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    `name` = VALUES(`name`),
    `description` = VALUES(`description`),
    `updated_at` = NOW();

-- 3. Ensure index on bookings(user_id) for rapid customer lookup
SET @idx_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'bookings' 
      AND INDEX_NAME = 'idx_bookings_user_id'
);

SET @sql_stmt2 = IF(@idx_exists = 0,
    'ALTER TABLE `bookings` ADD INDEX `idx_bookings_user_id` (`user_id`)',
    'SELECT "Index idx_bookings_user_id already exists in bookings"'
);
PREPARE stmt2 FROM @sql_stmt2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- 4. Create password_resets table for reliable password recovery
CREATE TABLE IF NOT EXISTS `password_resets` (
    `email` VARCHAR(191) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`email`),
    INDEX `idx_pwd_reset_token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
