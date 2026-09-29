-- Migration: 019_add_social_links_soft_delete_columns.sql
-- Description: Add soft delete support (deleted_at, deleted_by) to social_links table
SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE `social_links`
    ADD COLUMN `deleted_at` TIMESTAMP NULL DEFAULT NULL AFTER `status`,
    ADD COLUMN `deleted_by` BIGINT UNSIGNED NULL AFTER `deleted_at`,
    ADD INDEX `idx_sl_deleted_at` (`deleted_at`),
    ADD CONSTRAINT `fk_sl_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;
