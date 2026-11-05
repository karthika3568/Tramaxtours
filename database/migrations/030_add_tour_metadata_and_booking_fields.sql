-- Migration 030: Add metadata to tours and dynamic booking fields to bookings
-- Provides rollback instructions at the bottom.

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Add `metadata` to `tours` if it does not already exist
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tours' AND COLUMN_NAME = 'metadata');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `tours` ADD COLUMN `metadata` JSON NULL AFTER `overview`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2. Add `preferred_session` to `bookings` if it does not exist
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'preferred_session');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `preferred_session` VARCHAR(100) NULL AFTER `customer_notes`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3. Add `experience_level` to `bookings` if it does not exist
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'experience_level');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `experience_level` VARCHAR(100) NULL AFTER `preferred_session`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4. Add `additional_details` to `bookings` if it does not exist
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'additional_details');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `bookings` ADD COLUMN `additional_details` JSON NULL AFTER `experience_level`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 5. Add or update Tour Categories in `tour_categories`
INSERT INTO `tour_categories` (`name`, `slug`, `description`, `created_at`, `updated_at`)
VALUES 
  ('Palmleaf Horoscope Tour', 'palmleaf-horoscope', 'Ancient Nadi Astrology and Sacred Palm Leaf Reading in Vaitheeswaran Kovil and Tamil Nadu.', NOW(), NOW()),
  ('Surfing Tour', 'surfing-tour', 'Professional ocean surfing lessons, wave riding and beach sessions at Covelong Point and Mahabalipuram.', NOW(), NOW()),
  ('Medical Tourism', 'medical-tourism', 'Executive health checkups, comprehensive diagnostics and wellness health tourism.', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  `name` = VALUES(`name`),
  `description` = VALUES(`description`),
  `updated_at` = NOW();

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- ROLLBACK INSTRUCTIONS (Execute manually to revert Migration 030):
-- ALTER TABLE `tours` DROP COLUMN `metadata`;
-- ALTER TABLE `bookings` DROP COLUMN `preferred_session`;
-- ALTER TABLE `bookings` DROP COLUMN `experience_level`;
-- ALTER TABLE `bookings` DROP COLUMN `additional_details`;
-- DELETE FROM `tour_categories` WHERE `slug` IN ('palmleaf-horoscope', 'surfing-tour');
-- ============================================================================

