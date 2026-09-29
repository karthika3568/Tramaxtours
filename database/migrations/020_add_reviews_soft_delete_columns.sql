-- Migration: 020_add_reviews_soft_delete_columns.sql
-- Description: Add soft delete support (deleted_at, deleted_by) to reviews table
SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE `reviews`
    ADD COLUMN `deleted_at` TIMESTAMP NULL DEFAULT NULL AFTER `updated_at`,
    ADD COLUMN `deleted_by` BIGINT UNSIGNED NULL AFTER `deleted_at`,
    ADD INDEX `idx_reviews_deleted_at` (`deleted_at`),
    ADD CONSTRAINT `fk_reviews_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;
