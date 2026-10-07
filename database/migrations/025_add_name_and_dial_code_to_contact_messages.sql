-- Migration: 025_add_name_and_dial_code_to_contact_messages.sql
-- Description: Add first_name, middle_name, last_name, dial_code to contact_messages for granular customer names
SET FOREIGN_KEY_CHECKS = 0;

-- Safe check and add columns
SET @dbname = DATABASE();
SET @tablename = 'contact_messages';

-- first_name
SET @colname = 'first_name';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @colname
  ) > 0,
  'SELECT 1',
  'ALTER TABLE `contact_messages` ADD COLUMN `first_name` VARCHAR(100) NULL AFTER `type`'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- middle_name
SET @colname = 'middle_name';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @colname
  ) > 0,
  'SELECT 1',
  'ALTER TABLE `contact_messages` ADD COLUMN `middle_name` VARCHAR(100) NULL AFTER `first_name`'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- last_name
SET @colname = 'last_name';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @colname
  ) > 0,
  'SELECT 1',
  'ALTER TABLE `contact_messages` ADD COLUMN `last_name` VARCHAR(100) NULL AFTER `middle_name`'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- dial_code
SET @colname = 'dial_code';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @colname
  ) > 0,
  'SELECT 1',
  'ALTER TABLE `contact_messages` ADD COLUMN `dial_code` VARCHAR(20) NULL AFTER `phone`'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS = 1;
