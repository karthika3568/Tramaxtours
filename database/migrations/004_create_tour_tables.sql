-- Migration: 004_create_tour_tables.sql
-- Description: Create tour categories, tours, gallery, highlights, places, pricing, includes, excludes, why-choose, itineraries, faqs, and related tables
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `tour_categories` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(191) NOT NULL UNIQUE,
    `badge_color` VARCHAR(30) NULL DEFAULT '#0284c7',
    `icon` VARCHAR(100) NULL,
    `description` TEXT NULL,
    `display_order` INT NOT NULL DEFAULT 0,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_tour_cat_slug` (`slug`),
    INDEX `idx_tour_cat_status` (`status`),
    INDEX `idx_tour_cat_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tours` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `destination_id` BIGINT UNSIGNED NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(191) NOT NULL UNIQUE,
    `short_description` TEXT NULL,
    `overview` LONGTEXT NULL,
    `tour_type` VARCHAR(100) NULL,
    `duration_text` VARCHAR(100) NULL,
    `duration_hours` DECIMAL(5, 2) NULL,
    `duration_days` INT UNSIGNED NULL DEFAULT 1,
    `languages` VARCHAR(255) NULL,
    `featured_image_id` BIGINT UNSIGNED NULL,
    `base_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'EUR',
    `min_persons` INT UNSIGNED NOT NULL DEFAULT 1,
    `max_persons` INT UNSIGNED NULL,
    `map_title` VARCHAR(255) NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `map_zoom` TINYINT UNSIGNED DEFAULT 13,
    `seo_title` VARCHAR(255) NULL,
    `seo_description` TEXT NULL,
    `canonical_url` VARCHAR(500) NULL,
    `og_image_id` BIGINT UNSIGNED NULL,
    `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
    `display_order` INT NOT NULL DEFAULT 0,
    `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    INDEX `idx_tours_destination` (`destination_id`),
    INDEX `idx_tours_slug` (`slug`),
    INDEX `idx_tours_status` (`status`),
    INDEX `idx_tours_featured` (`is_featured`),
    INDEX `idx_tours_base_price` (`base_price`),
    INDEX `idx_tours_display_order` (`display_order`),
    INDEX `idx_tours_deleted_at` (`deleted_at`),
    CONSTRAINT `fk_tours_destination` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_tours_featured_image` FOREIGN KEY (`featured_image_id`) REFERENCES `media` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_tours_og_image` FOREIGN KEY (`og_image_id`) REFERENCES `media` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tour_category_map` (
    `tour_id` BIGINT UNSIGNED NOT NULL,
    `category_id` BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (`tour_id`, `category_id`),
    INDEX `idx_tcm_category` (`category_id`),
    CONSTRAINT `fk_tcm_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_tcm_category` FOREIGN KEY (`category_id`) REFERENCES `tour_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tour_gallery` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `tour_id` BIGINT UNSIGNED NOT NULL,
    `media_id` BIGINT UNSIGNED NOT NULL,
    `is_cover` TINYINT(1) NOT NULL DEFAULT 0,
    `display_order` INT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_tour_gallery_tour` (`tour_id`),
    INDEX `idx_tour_gallery_order` (`display_order`),
    INDEX `idx_tour_gallery_cover` (`is_cover`),
    CONSTRAINT `fk_tg_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_tg_media` FOREIGN KEY (`media_id`) REFERENCES `media` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tour_highlights` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `tour_id` BIGINT UNSIGNED NOT NULL,
    `highlight_text` VARCHAR(500) NOT NULL,
    `icon` VARCHAR(100) NULL,
    `display_order` INT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_th_tour` (`tour_id`),
    INDEX `idx_th_order` (`display_order`),
    CONSTRAINT `fk_th_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tour_places` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `tour_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `short_description` TEXT NULL,
    `media_id` BIGINT UNSIGNED NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `display_order` INT NOT NULL DEFAULT 0,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_tp_tour` (`tour_id`),
    INDEX `idx_tp_order` (`display_order`),
    INDEX `idx_tp_status` (`status`),
    CONSTRAINT `fk_tp_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_tp_media` FOREIGN KEY (`media_id`) REFERENCES `media` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tour_pricing_tiers` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `tour_id` BIGINT UNSIGNED NOT NULL,
    `min_persons` INT UNSIGNED NOT NULL,
    `max_persons` INT UNSIGNED NOT NULL,
    `service_option` VARCHAR(100) NOT NULL,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'EUR',
    `price` DECIMAL(10, 2) NOT NULL,
    `valid_from` DATE NULL,
    `valid_to` DATE NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_tpt_tour` (`tour_id`),
    INDEX `idx_tpt_persons` (`min_persons`, `max_persons`),
    INDEX `idx_tpt_status` (`status`),
    CONSTRAINT `fk_tpt_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tour_includes` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `tour_id` BIGINT UNSIGNED NOT NULL,
    `item_text` VARCHAR(500) NOT NULL,
    `display_order` INT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_ti_tour` (`tour_id`),
    INDEX `idx_ti_order` (`display_order`),
    CONSTRAINT `fk_ti_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tour_excludes` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `tour_id` BIGINT UNSIGNED NOT NULL,
    `item_text` VARCHAR(500) NOT NULL,
    `display_order` INT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_te_tour` (`tour_id`),
    INDEX `idx_te_order` (`display_order`),
    CONSTRAINT `fk_te_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tour_why_choose` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `tour_id` BIGINT UNSIGNED NOT NULL,
    `icon` VARCHAR(100) NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `display_order` INT NOT NULL DEFAULT 0,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_twc_tour` (`tour_id`),
    INDEX `idx_twc_order` (`display_order`),
    INDEX `idx_twc_status` (`status`),
    CONSTRAINT `fk_twc_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tour_itineraries` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `tour_id` BIGINT UNSIGNED NOT NULL,
    `time_period` VARCHAR(100) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `display_order` INT NOT NULL DEFAULT 0,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_titin_tour` (`tour_id`),
    INDEX `idx_titin_order` (`display_order`),
    INDEX `idx_titin_status` (`status`),
    CONSTRAINT `fk_titin_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tour_faqs` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `tour_id` BIGINT UNSIGNED NOT NULL,
    `question` VARCHAR(500) NOT NULL,
    `answer` TEXT NOT NULL,
    `display_order` INT NOT NULL DEFAULT 0,
    `status` ENUM('published', 'draft') NOT NULL DEFAULT 'published',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_tfaq_tour` (`tour_id`),
    INDEX `idx_tfaq_order` (`display_order`),
    INDEX `idx_tfaq_status` (`status`),
    CONSTRAINT `fk_tfaq_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tour_related` (
    `tour_id` BIGINT UNSIGNED NOT NULL,
    `related_tour_id` BIGINT UNSIGNED NOT NULL,
    `display_order` INT NOT NULL DEFAULT 0,
    PRIMARY KEY (`tour_id`, `related_tour_id`),
    INDEX `idx_tr_related` (`related_tour_id`),
    CONSTRAINT `fk_tr_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_tr_related` FOREIGN KEY (`related_tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
