-- Migration: 012_add_deleted_by_columns.sql
-- Description: Add deleted_by tracking columns and foreign keys to tours and destinations tables
SET FOREIGN_KEY_CHECKS = 0;

-- Add deleted_by column to destinations table if not exists
SET @dbname = DATABASE();
SET @tablename = 'destinations';
SET @columnname = 'deleted_by';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT 1',
  'ALTER TABLE `destinations` ADD COLUMN `deleted_by` BIGINT UNSIGNED NULL AFTER `deleted_at`, ADD INDEX `idx_destinations_deleted_by` (`deleted_by`), ADD CONSTRAINT `fk_dest_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add deleted_by column to tours table if not exists
SET @tablename = 'tours';
SET @columnname = 'deleted_by';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT 1',
  'ALTER TABLE `tours` ADD COLUMN `deleted_by` BIGINT UNSIGNED NULL AFTER `deleted_at`, ADD INDEX `idx_tours_deleted_by` (`deleted_by`), ADD CONSTRAINT `fk_tours_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET FOREIGN_KEY_CHECKS = 1;
