-- Migration 036: Medical Packages Enhancements & Addons Table

-- 1. Add missing metadata columns to medical_trips if not present
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'medical_trips' AND COLUMN_NAME = 'market_price');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `medical_trips` ADD COLUMN `market_price` DECIMAL(10,2) NULL AFTER `price`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'medical_trips' AND COLUMN_NAME = 'discount');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `medical_trips` ADD COLUMN `discount` VARCHAR(20) NULL AFTER `market_price`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'medical_trips' AND COLUMN_NAME = 'test_count');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `medical_trips` ADD COLUMN `test_count` VARCHAR(100) NULL AFTER `discount`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'medical_trips' AND COLUMN_NAME = 'price_on_request');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `medical_trips` ADD COLUMN `price_on_request` TINYINT(1) DEFAULT 0 AFTER `discount_price`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'medical_trips' AND COLUMN_NAME = 'display_order');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `medical_trips` ADD COLUMN `display_order` INT DEFAULT 0 AFTER `is_published`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2. Create medical_addons table for Add-on Medical Tests
CREATE TABLE IF NOT EXISTS `medical_addons` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `addon_name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 1499.00,
  `image_path` VARCHAR(255) NULL,
  `status` ENUM('active','inactive') DEFAULT 'active',
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_addon_status` (`status`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
