-- Migration: 013_add_pages_soft_delete_columns.sql
-- Description: Add deleted_at and deleted_by columns to pages table for reversible soft deletion and restore support

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Add deleted_at and deleted_by columns and index to pages table
ALTER TABLE `pages`
    ADD COLUMN `deleted_at` TIMESTAMP NULL DEFAULT NULL AFTER `status`,
    ADD COLUMN `deleted_by` BIGINT UNSIGNED NULL AFTER `deleted_at`,
    ADD INDEX `idx_pages_deleted_at` (`deleted_at`),
    ADD CONSTRAINT `fk_pages_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;
