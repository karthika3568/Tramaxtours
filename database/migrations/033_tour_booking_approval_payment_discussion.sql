-- Migration 033: Tour Booking Admin Approval, Payment Discussion & Ticket Confirmation
SET FOREIGN_KEY_CHECKS = 0;
SET @dbname = DATABASE();

-- 1. Modify booking_status to VARCHAR(50) to allow all lifecycle statuses
ALTER TABLE `bookings` MODIFY COLUMN `booking_status` VARCHAR(50) NOT NULL DEFAULT 'pending';

-- 2. Add ticket_number to bookings
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'ticket_number');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `ticket_number` VARCHAR(64) NULL DEFAULT NULL AFTER `order_number`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3. Add ticket_pdf_path to bookings
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'ticket_pdf_path');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `ticket_pdf_path` VARCHAR(255) NULL DEFAULT NULL AFTER `ticket_number`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4. Add agreed_price to bookings
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'agreed_price');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `agreed_price` DECIMAL(10, 2) NULL DEFAULT NULL AFTER `total_price`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 5. Add payment_discussion_notes to bookings
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'payment_discussion_notes');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `payment_discussion_notes` TEXT NULL DEFAULT NULL AFTER `balance_amount`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 6. Add confirmed_at to bookings
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'confirmed_at');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `confirmed_at` DATETIME NULL DEFAULT NULL AFTER `approved_at`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 7. Add confirmed_by to bookings
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'confirmed_by');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `confirmed_by` BIGINT UNSIGNED NULL DEFAULT NULL AFTER `confirmed_at`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 8. Add sms tracking columns to bookings
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'sms_status');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `sms_status` VARCHAR(50) NULL DEFAULT "pending" AFTER `customer_email_status`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'sms_sent_at');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `sms_sent_at` DATETIME NULL DEFAULT NULL AFTER `sms_status`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'last_sms_error');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `last_sms_error` TEXT NULL DEFAULT NULL AFTER `sms_sent_at`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 9. Add index on ticket_number
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'bookings' AND INDEX_NAME = 'idx_bookings_ticket_number');
SET @sql = IF(@idx_exists = 0, 'ALTER TABLE `bookings` ADD UNIQUE INDEX `idx_bookings_ticket_number` (`ticket_number`)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS = 1;
