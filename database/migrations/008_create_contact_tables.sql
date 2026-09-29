-- Migration: 008_create_contact_tables.sql
-- Description: Create contact messages and customer inquiries table
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `contact_messages` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(50) NULL,
    `subject` VARCHAR(255) NULL,
    `message` TEXT NOT NULL,
    `tour_id` BIGINT UNSIGNED NULL,
    `destination_id` BIGINT UNSIGNED NULL,
    `status` ENUM('new', 'read', 'replied', 'archived') NOT NULL DEFAULT 'new',
    `admin_notes` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_cm_status` (`status`),
    INDEX `idx_cm_email` (`email`),
    INDEX `idx_cm_tour` (`tour_id`),
    INDEX `idx_cm_dest` (`destination_id`),
    INDEX `idx_cm_created_at` (`created_at`),
    CONSTRAINT `fk_cm_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_cm_dest` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
