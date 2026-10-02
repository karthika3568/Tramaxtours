-- Migration: 025_create_testimonials_table.sql
-- Description: Dedicated admin-authored testimonials, distinct from the
-- customer-submitted, tour-scoped `reviews` table (whose tour_id is NOT NULL
-- and which represents a different workflow — customer feedback on a
-- specific booked tour, moderated after submission). Testimonials here are
-- generic brand endorsements an admin creates directly: client name, an
-- optional client photo (via the existing media library), a message,
-- a star rating, and a free-text location — with no tour required.
CREATE TABLE IF NOT EXISTS `testimonials` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `client_name` VARCHAR(150) NOT NULL,
    `client_image_id` BIGINT UNSIGNED NULL,
    `message` TEXT NOT NULL,
    `rating` TINYINT UNSIGNED NOT NULL DEFAULT 5,
    `location` VARCHAR(150) NULL,
    `display_order` INT NOT NULL DEFAULT 0,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT `chk_testimonials_rating` CHECK (`rating` BETWEEN 1 AND 5),
    INDEX `idx_testimonials_status` (`status`),
    INDEX `idx_testimonials_order` (`display_order`),
    INDEX `idx_testimonials_deleted_at` (`deleted_at`),
    CONSTRAINT `fk_testimonials_client_image` FOREIGN KEY (`client_image_id`) REFERENCES `media` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
