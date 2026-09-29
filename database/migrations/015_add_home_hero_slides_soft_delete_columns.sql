-- Migration: 015_add_home_hero_slides_soft_delete_columns.sql
-- Description: Add soft delete support (deleted_at, deleted_by) to home_hero_slides table
SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE `home_hero_slides`
    ADD COLUMN `deleted_at` TIMESTAMP NULL DEFAULT NULL AFTER `status`,
    ADD COLUMN `deleted_by` BIGINT UNSIGNED NULL AFTER `deleted_at`,
    ADD INDEX `idx_hhs_deleted_at` (`deleted_at`),
    ADD CONSTRAINT `fk_hhs_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;
