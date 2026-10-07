-- Migration 027: Add extended traveler & trip request fields to bookings for unified booking flow
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Add columns to bookings if they do not exist
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'first_name');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `first_name` VARCHAR(100) NULL AFTER `pricing_tier_id`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'middle_name');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `middle_name` VARCHAR(100) NULL AFTER `first_name`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'last_name');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `last_name` VARCHAR(100) NULL AFTER `middle_name`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'dial_code');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `dial_code` VARCHAR(20) NULL AFTER `last_name`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'country');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `country` VARCHAR(100) NULL AFTER `dial_code`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'destination_name');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `destination_name` VARCHAR(255) NULL AFTER `country`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'pickup_location');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `pickup_location` VARCHAR(255) NULL AFTER `destination_name`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'arrival_date');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `arrival_date` DATE NULL AFTER `pickup_location`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'departure_date');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `departure_date` DATE NULL AFTER `arrival_date`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'duration_days');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `duration_days` VARCHAR(100) NULL AFTER `departure_date`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'adults_count');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `adults_count` INT UNSIGNED NULL AFTER `duration_days`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'children_count');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `children_count` INT UNSIGNED NULL DEFAULT 0 AFTER `adults_count`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'infants_count');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `infants_count` INT UNSIGNED NULL DEFAULT 0 AFTER `children_count`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'tour_types');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `tour_types` TEXT NULL AFTER `infants_count`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'tour_guide_required');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `tour_guide_required` TINYINT(1) NULL DEFAULT 0 AFTER `tour_types`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'preferred_language');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `preferred_language` VARCHAR(100) NULL AFTER `tour_guide_required`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'vehicle_preference');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `vehicle_preference` VARCHAR(150) NULL AFTER `preferred_language`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'airport_pickup');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `airport_pickup` TINYINT(1) NULL DEFAULT 0 AFTER `vehicle_preference`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'airport_drop');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `airport_drop` TINYINT(1) NULL DEFAULT 0 AFTER `airport_pickup`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'hotel_category');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `hotel_category` VARCHAR(150) NULL AFTER `airport_drop`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'room_type');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `room_type` VARCHAR(100) NULL AFTER `hotel_category`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'rooms_count');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `rooms_count` INT UNSIGNED NULL DEFAULT 1 AFTER `room_type`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'arrival_flight_train_number');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `arrival_flight_train_number` VARCHAR(100) NULL AFTER `rooms_count`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'arrival_time');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `arrival_time` VARCHAR(50) NULL AFTER `arrival_flight_train_number`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'departure_flight_train_number');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `departure_flight_train_number` VARCHAR(100) NULL AFTER `arrival_time`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'departure_time');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `departure_time` VARCHAR(50) NULL AFTER `departure_flight_train_number`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'approximate_budget');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `approximate_budget` VARCHAR(100) NULL AFTER `departure_time`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'budget_currency');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `budget_currency` VARCHAR(10) NULL DEFAULT ''EUR'' AFTER `approximate_budget`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'passport_file_url');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `passport_file_url` VARCHAR(500) NULL AFTER `budget_currency`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'flight_ticket_url');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `flight_ticket_url` VARCHAR(500) NULL AFTER `passport_file_url`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'preferred_contact_methods');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `preferred_contact_methods` TEXT NULL AFTER `flight_ticket_url`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'special_requests');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `special_requests` TEXT NULL AFTER `preferred_contact_methods`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2. Add columns to booking_customer_details if they do not exist
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'booking_customer_details' AND COLUMN_NAME = 'middle_name');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `booking_customer_details` ADD COLUMN `middle_name` VARCHAR(100) NULL AFTER `first_name`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'booking_customer_details' AND COLUMN_NAME = 'dial_code');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `booking_customer_details` ADD COLUMN `dial_code` VARCHAR(20) NULL AFTER `last_name`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'booking_customer_details' AND COLUMN_NAME = 'country');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `booking_customer_details` ADD COLUMN `country` VARCHAR(100) NULL AFTER `dial_code`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS = 1;
