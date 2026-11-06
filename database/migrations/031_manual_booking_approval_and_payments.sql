-- Migration 031: Manual Booking Approval, Manual Payment Tracking & Contact History Logs
SET FOREIGN_KEY_CHECKS = 0;
SET @dbname = DATABASE();

-- 1. Add advance_amount to bookings
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'advance_amount');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `advance_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER `total_price`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2. Add balance_amount to bookings
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'balance_amount');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `balance_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER `advance_amount`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3. Add approved_at to bookings
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'approved_at');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `approved_at` DATETIME NULL DEFAULT NULL AFTER `balance_amount`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4. Add approved_by to bookings
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'approved_by');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `approved_by` BIGINT UNSIGNED NULL DEFAULT NULL AFTER `approved_at`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 5. Add payment_date to payments
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'payments' AND COLUMN_NAME = 'payment_date');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `payments` ADD COLUMN `payment_date` DATE NULL DEFAULT NULL AFTER `amount`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 6. Add notes to payments
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'payments' AND COLUMN_NAME = 'notes');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `payments` ADD COLUMN `notes` TEXT NULL DEFAULT NULL AFTER `payment_data`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 7. Add recorded_by to payments
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'payments' AND COLUMN_NAME = 'recorded_by');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `payments` ADD COLUMN `recorded_by` BIGINT UNSIGNED NULL DEFAULT NULL AFTER `notes`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 8. Create booking_contact_logs table
CREATE TABLE IF NOT EXISTS `booking_contact_logs` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `booking_id` BIGINT UNSIGNED NOT NULL,
    `contact_type` ENUM('phone', 'whatsapp', 'email', 'other') NOT NULL DEFAULT 'phone',
    `notes` TEXT NOT NULL,
    `contacted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `recorded_by` BIGINT UNSIGNED NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_bcl_booking` (`booking_id`),
    INDEX `idx_bcl_recorded_by` (`recorded_by`),
    INDEX `idx_bcl_contacted_at` (`contacted_at`),
    CONSTRAINT `fk_bcl_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_bcl_user` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Initialize balance_amount for existing bookings where balance_amount is 0 and payment_status != 'paid'
UPDATE `bookings` 
SET `balance_amount` = `total_price` 
WHERE `balance_amount` = 0.00 AND `payment_status` != 'paid';

SET FOREIGN_KEY_CHECKS = 1;
