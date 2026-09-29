-- Migration: 003_create_destination_tables.sql
-- Description: Create destinations, destination gallery, sections, and FAQs tables
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `destinations` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `slug` VARCHAR(191) NOT NULL UNIQUE,
    `hero_title` VARCHAR(255) NULL,
    `hero_subtitle` VARCHAR(255) NULL,
    `short_description` TEXT NULL,
    `intro_heading` VARCHAR(255) NULL,
    `intro_label` VARCHAR(100) NULL,
    `intro_content` LONGTEXT NULL,
    `intro_media_id` BIGINT UNSIGNED NULL,
    `language` VARCHAR(100) NULL,
    `currency` VARCHAR(50) NULL,
    `religion` VARCHAR(100) NULL,
    `timezone` VARCHAR(50) NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `featured_image_id` BIGINT UNSIGNED NULL,
    `seo_title` VARCHAR(255) NULL,
    `seo_description` TEXT NULL,
    `og_image_id` BIGINT UNSIGNED NULL,
    `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
    `display_order` INT NOT NULL DEFAULT 0,
    `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    INDEX `idx_destinations_slug` (`slug`),
    INDEX `idx_destinations_status` (`status`),
    INDEX `idx_destinations_featured` (`is_featured`),
    INDEX `idx_destinations_display_order` (`display_order`),
    INDEX `idx_destinations_deleted_at` (`deleted_at`),
    CONSTRAINT `fk_dest_intro_media` FOREIGN KEY (`intro_media_id`) REFERENCES `media` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_dest_featured_image` FOREIGN KEY (`featured_image_id`) REFERENCES `media` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_dest_og_image` FOREIGN KEY (`og_image_id`) REFERENCES `media` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `destination_gallery` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `destination_id` BIGINT UNSIGNED NOT NULL,
    `media_id` BIGINT UNSIGNED NOT NULL,
    `display_order` INT NOT NULL DEFAULT 0,
    `is_hero_slide` TINYINT(1) NOT NULL DEFAULT 0,
    `caption` VARCHAR(255) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_dest_gallery_dest` (`destination_id`),
    INDEX `idx_dest_gallery_order` (`display_order`),
    INDEX `idx_dest_gallery_hero` (`is_hero_slide`),
    CONSTRAINT `fk_dest_gallery_dest` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_dest_gallery_media` FOREIGN KEY (`media_id`) REFERENCES `media` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `destination_sections` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `destination_id` BIGINT UNSIGNED NOT NULL,
    `section_type` VARCHAR(50) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `subtitle` VARCHAR(255) NULL,
    `content` LONGTEXT NOT NULL,
    `media_id` BIGINT UNSIGNED NULL,
    `display_order` INT NOT NULL DEFAULT 0,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_dest_sections_dest` (`destination_id`),
    INDEX `idx_dest_sections_type` (`section_type`),
    INDEX `idx_dest_sections_order` (`display_order`),
    INDEX `idx_dest_sections_status` (`status`),
    CONSTRAINT `fk_dest_sections_dest` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_dest_sections_media` FOREIGN KEY (`media_id`) REFERENCES `media` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `destination_faqs` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `destination_id` BIGINT UNSIGNED NOT NULL,
    `question` VARCHAR(500) NOT NULL,
    `answer` TEXT NOT NULL,
    `display_order` INT NOT NULL DEFAULT 0,
    `status` ENUM('published', 'draft') NOT NULL DEFAULT 'published',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_dest_faqs_dest` (`destination_id`),
    INDEX `idx_dest_faqs_order` (`display_order`),
    INDEX `idx_dest_faqs_status` (`status`),
    CONSTRAINT `fk_dest_faqs_dest` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
