-- Migration: 017_add_site_settings_soft_delete_columns.sql
-- Description: Add soft delete support (deleted_at, deleted_by) to site_settings table
SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE `site_settings`
    ADD COLUMN `deleted_at` TIMESTAMP NULL DEFAULT NULL AFTER `setting_group`,
    ADD COLUMN `deleted_by` BIGINT UNSIGNED NULL AFTER `deleted_at`,
    ADD INDEX `idx_settings_deleted_at` (`deleted_at`),
    ADD CONSTRAINT `fk_settings_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;
