-- Migration: 028_add_email_security_and_tokens_to_bookings.sql
-- Description: Adds access token hash, email dispatch status tracking, send counters, and rate limiting columns to bookings.
-- Safe, backward-compatible, and re-runnable.

SET @dbname = DATABASE();

-- 1. access_token_hash
SET @exist = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname 
      AND TABLE_NAME = 'bookings' 
      AND COLUMN_NAME = 'access_token_hash'
);
SET @sql = IF(@exist = 0, 
    'ALTER TABLE `bookings` ADD COLUMN `access_token_hash` VARCHAR(64) NULL DEFAULT NULL AFTER `user_id`', 
    'SELECT "Column access_token_hash already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. customer_email_status
SET @exist = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname 
      AND TABLE_NAME = 'bookings' 
      AND COLUMN_NAME = 'customer_email_status'
);
SET @sql = IF(@exist = 0, 
    'ALTER TABLE `bookings` ADD COLUMN `customer_email_status` VARCHAR(32) NOT NULL DEFAULT "pending" AFTER `payment_status`', 
    'SELECT "Column customer_email_status already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. customer_email_sent_at
SET @exist = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname 
      AND TABLE_NAME = 'bookings' 
      AND COLUMN_NAME = 'customer_email_sent_at'
);
SET @sql = IF(@exist = 0, 
    'ALTER TABLE `bookings` ADD COLUMN `customer_email_sent_at` DATETIME NULL DEFAULT NULL AFTER `customer_email_status`', 
    'SELECT "Column customer_email_sent_at already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. admin_email_status
SET @exist = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname 
      AND TABLE_NAME = 'bookings' 
      AND COLUMN_NAME = 'admin_email_status'
);
SET @sql = IF(@exist = 0, 
    'ALTER TABLE `bookings` ADD COLUMN `admin_email_status` VARCHAR(32) NOT NULL DEFAULT "pending" AFTER `customer_email_sent_at`', 
    'SELECT "Column admin_email_status already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. admin_email_sent_at
SET @exist = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname 
      AND TABLE_NAME = 'bookings' 
      AND COLUMN_NAME = 'admin_email_sent_at'
);
SET @sql = IF(@exist = 0, 
    'ALTER TABLE `bookings` ADD COLUMN `admin_email_sent_at` DATETIME NULL DEFAULT NULL AFTER `admin_email_status`', 
    'SELECT "Column admin_email_sent_at already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 6. email_send_count
SET @exist = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname 
      AND TABLE_NAME = 'bookings' 
      AND COLUMN_NAME = 'email_send_count'
);
SET @sql = IF(@exist = 0, 
    'ALTER TABLE `bookings` ADD COLUMN `email_send_count` INT UNSIGNED NOT NULL DEFAULT 0 AFTER `admin_email_sent_at`', 
    'SELECT "Column email_send_count already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 7. last_email_attempt_at
SET @exist = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname 
      AND TABLE_NAME = 'bookings' 
      AND COLUMN_NAME = 'last_email_attempt_at'
);
SET @sql = IF(@exist = 0, 
    'ALTER TABLE `bookings` ADD COLUMN `last_email_attempt_at` DATETIME NULL DEFAULT NULL AFTER `email_send_count`', 
    'SELECT "Column last_email_attempt_at already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 8. last_email_error
SET @exist = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname 
      AND TABLE_NAME = 'bookings' 
      AND COLUMN_NAME = 'last_email_error'
);
SET @sql = IF(@exist = 0, 
    'ALTER TABLE `bookings` ADD COLUMN `last_email_error` VARCHAR(255) NULL DEFAULT NULL AFTER `last_email_attempt_at`', 
    'SELECT "Column last_email_error already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
