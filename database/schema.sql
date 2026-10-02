-- ==============================================================================
-- Wanderer South India - Production MySQL Database Schema
-- Target Database: tramaxtours
-- MySQL Engine: InnoDB
-- Default Charset: utf8mb4
-- Default Collation: utf8mb4_unicode_ci
-- Phase: Phase 1 Database Architecture
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 0. MIGRATIONS TRACKING TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `migrations` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `migration` VARCHAR(255) NOT NULL UNIQUE,
    `batch` INT NOT NULL,
    `executed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 1. AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(191) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50) NULL,
    `status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
    `email_verified_at` TIMESTAMP NULL DEFAULT NULL,
    `last_login_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    INDEX `idx_users_status` (`status`),
    INDEX `idx_users_email` (`email`),
    INDEX `idx_users_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `roles` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL UNIQUE,
    `slug` VARCHAR(50) NOT NULL UNIQUE,
    `description` VARCHAR(255) NULL,
    `is_system` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_roles_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `permissions` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `group_name` VARCHAR(50) NOT NULL,
    `description` VARCHAR(255) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_permissions_group` (`group_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `role_permissions` (
    `role_id` INT UNSIGNED NOT NULL,
    `permission_id` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`role_id`, `permission_id`),
    CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_rp_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_roles` (
    `user_id` BIGINT UNSIGNED NOT NULL,
    `role_id` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`user_id`, `role_id`),
    CONSTRAINT `fk_ur_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_ur_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. CENTRALIZED MEDIA LIBRARY
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `media` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `filename` VARCHAR(255) NOT NULL,
    `original_name` VARCHAR(255) NOT NULL,
    `file_path` VARCHAR(500) NOT NULL,
    `file_size` INT UNSIGNED NOT NULL,
    `mime_type` VARCHAR(100) NOT NULL,
    `alt_text` VARCHAR(255) NULL,
    `caption` VARCHAR(255) NULL,
    `uploaded_by` BIGINT UNSIGNED NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_media_mime` (`mime_type`),
    INDEX `idx_media_uploaded_by` (`uploaded_by`),
    CONSTRAINT `fk_media_uploader` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. DESTINATIONS MANAGEMENT
-- ------------------------------------------------------------------------------
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
    `section_type` VARCHAR(50) NOT NULL, -- 'best_time_to_visit', 'sightseeing', 'cultural_heritage', 'seasonal_activities', 'wildlife', 'custom'
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

-- ------------------------------------------------------------------------------
-- 4. TOUR CATEGORIES & TOURS MANAGEMENT
-- ------------------------------------------------------------------------------
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
    `tour_type` VARCHAR(100) NULL, -- 'Private Day Tour', 'Group Tour', etc.
    `duration_text` VARCHAR(100) NULL, -- '1 Day (8-10 Hours)'
    `duration_hours` DECIMAL(5, 2) NULL,
    `duration_days` INT UNSIGNED NULL DEFAULT 1,
    `languages` VARCHAR(255) NULL, -- 'English, Tamil'
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
    `service_option` VARCHAR(100) NOT NULL, -- e.g. 'Transportation Only', 'Transportation + Guide'
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
    `time_period` VARCHAR(100) NOT NULL, -- 'Morning', 'Late Morning', 'Afternoon', 'Evening', 'Night'
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

-- ------------------------------------------------------------------------------
-- 5. CMS & HOME PAGE CONTENT MANAGEMENT
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `home_hero_slides` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `subtitle` VARCHAR(500) NULL,
    `desktop_media_id` BIGINT UNSIGNED NULL,
    `mobile_media_id` BIGINT UNSIGNED NULL,
    `cta_label` VARCHAR(100) NULL,
    `cta_url` VARCHAR(255) NULL,
    `display_order` INT NOT NULL DEFAULT 0,
    `start_date` DATETIME NULL,
    `end_date` DATETIME NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_hhs_order` (`display_order`),
    INDEX `idx_hhs_status` (`status`),
    INDEX `idx_hhs_schedule` (`start_date`, `end_date`),
    CONSTRAINT `fk_hhs_desktop_media` FOREIGN KEY (`desktop_media_id`) REFERENCES `media` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_hhs_mobile_media` FOREIGN KEY (`mobile_media_id`) REFERENCES `media` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `home_benefits` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `icon` VARCHAR(100) NULL,
    `media_id` BIGINT UNSIGNED NULL,
    `display_order` INT NOT NULL DEFAULT 0,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_hb_order` (`display_order`),
    INDEX `idx_hb_status` (`status`),
    CONSTRAINT `fk_hb_media` FOREIGN KEY (`media_id`) REFERENCES `media` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cms_sections` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `section_key` VARCHAR(100) NOT NULL UNIQUE, -- e.g. 'home_top_destinations', 'home_popular_tours', 'about_intro'
    `title` VARCHAR(255) NOT NULL,
    `subtitle` VARCHAR(500) NULL,
    `content` LONGTEXT NULL,
    `media_id` BIGINT UNSIGNED NULL,
    `display_order` INT NOT NULL DEFAULT 0,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_cms_sections_key` (`section_key`),
    INDEX `idx_cms_sections_status` (`status`),
    CONSTRAINT `fk_cms_sections_media` FOREIGN KEY (`media_id`) REFERENCES `media` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. BOOKING & ORDER LIFECYCLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bookings` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `order_number` VARCHAR(64) NOT NULL UNIQUE,
    `user_id` BIGINT UNSIGNED NULL,
    `tour_id` BIGINT UNSIGNED NOT NULL,
    `pricing_tier_id` BIGINT UNSIGNED NULL,
    `booking_date` DATE NOT NULL,
    `tickets_count` INT UNSIGNED NOT NULL DEFAULT 1,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `tax_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `discount_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `total_price` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'EUR',
    `booking_status` ENUM('pending', 'confirmed', 'completed', 'cancelled', 'rejected') NOT NULL DEFAULT 'pending',
    `payment_method` VARCHAR(50) NOT NULL DEFAULT 'pay_on_arrival',
    `payment_status` ENUM('pending', 'paid', 'not_required', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    `customer_notes` TEXT NULL,
    `admin_notes` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    INDEX `idx_bookings_order_num` (`order_number`),
    INDEX `idx_bookings_user` (`user_id`),
    INDEX `idx_bookings_tour` (`tour_id`),
    INDEX `idx_bookings_date` (`booking_date`),
    INDEX `idx_bookings_status` (`booking_status`),
    INDEX `idx_bookings_payment_status` (`payment_status`),
    INDEX `idx_bookings_created_at` (`created_at`),
    INDEX `idx_bookings_deleted_at` (`deleted_at`),
    CONSTRAINT `fk_bookings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_bookings_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_bookings_tier` FOREIGN KEY (`pricing_tier_id`) REFERENCES `tour_pricing_tiers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `booking_customer_details` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `booking_id` BIGINT UNSIGNED NOT NULL UNIQUE,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(50) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_bcd_email` (`email`),
    INDEX `idx_bcd_phone` (`phone`),
    CONSTRAINT `fk_bcd_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `booking_billing_addresses` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `booking_id` BIGINT UNSIGNED NOT NULL UNIQUE,
    `address_line1` VARCHAR(255) NOT NULL,
    `address_line2` VARCHAR(255) NULL,
    `city` VARCHAR(100) NOT NULL,
    `state` VARCHAR(100) NULL,
    `postal_code` VARCHAR(30) NOT NULL,
    `country` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_bba_country` (`country`),
    INDEX `idx_bba_city` (`city`),
    CONSTRAINT `fk_bba_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `booking_status_history` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `booking_id` BIGINT UNSIGNED NOT NULL,
    `previous_status` VARCHAR(50) NULL,
    `new_status` VARCHAR(50) NOT NULL,
    `changed_by` BIGINT UNSIGNED NULL,
    `notes` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_bsh_booking` (`booking_id`),
    INDEX `idx_bsh_changed_by` (`changed_by`),
    CONSTRAINT `fk_bsh_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_bsh_user` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `payments` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `booking_id` BIGINT UNSIGNED NOT NULL,
    `transaction_reference` VARCHAR(100) NULL UNIQUE,
    `payment_method` VARCHAR(50) NOT NULL DEFAULT 'pay_on_arrival',
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'EUR',
    `status` ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    `payment_data` TEXT NULL,
    `paid_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_payments_booking` (`booking_id`),
    INDEX `idx_payments_status` (`status`),
    INDEX `idx_payments_method` (`payment_method`),
    INDEX `idx_payments_reference` (`transaction_reference`),
    CONSTRAINT `fk_payments_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. REVIEWS & RATINGS MODERATION
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reviews` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `tour_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NULL,
    `customer_name` VARCHAR(150) NOT NULL,
    `customer_email` VARCHAR(191) NOT NULL,
    `customer_country` VARCHAR(100) NULL,
    `rating` TINYINT UNSIGNED NOT NULL, -- 1 to 5
    `title` VARCHAR(255) NULL,
    `content` TEXT NOT NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
    `moderated_by` BIGINT UNSIGNED NULL,
    `moderated_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_reviews_tour` (`tour_id`),
    INDEX `idx_reviews_user` (`user_id`),
    INDEX `idx_reviews_status` (`status`),
    INDEX `idx_reviews_rating` (`rating`),
    INDEX `idx_reviews_featured` (`is_featured`),
    INDEX `idx_reviews_created_at` (`created_at`),
    CONSTRAINT `fk_reviews_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_reviews_moderator` FOREIGN KEY (`moderated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `review_media` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `review_id` BIGINT UNSIGNED NOT NULL,
    `media_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_rm_review` (`review_id`),
    CONSTRAINT `fk_rm_review` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_rm_media` FOREIGN KEY (`media_id`) REFERENCES `media` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. CONTACT MESSAGES & INQUIRIES
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 9. SITE SETTINGS, PAGES, FOOTER & SOCIAL LINKS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `site_settings` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `setting_key` VARCHAR(100) NOT NULL UNIQUE,
    `setting_value` LONGTEXT NULL,
    `setting_group` VARCHAR(50) NOT NULL DEFAULT 'general',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_settings_key` (`setting_key`),
    INDEX `idx_settings_group` (`setting_group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pages` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `slug` VARCHAR(191) NOT NULL UNIQUE,
    `title` VARCHAR(255) NOT NULL,
    `subtitle` VARCHAR(255) NULL,
    `hero_media_id` BIGINT UNSIGNED NULL,
    `content` LONGTEXT NOT NULL,
    `seo_title` VARCHAR(255) NULL,
    `seo_description` TEXT NULL,
    `status` ENUM('published', 'draft') NOT NULL DEFAULT 'published',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_pages_slug` (`slug`),
    INDEX `idx_pages_status` (`status`),
    CONSTRAINT `fk_pages_hero_media` FOREIGN KEY (`hero_media_id`) REFERENCES `media` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `footer_links` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `column_name` VARCHAR(50) NOT NULL, -- e.g. 'useful_links', 'policy_pages', 'destinations'
    `label` VARCHAR(100) NOT NULL,
    `url` VARCHAR(255) NOT NULL,
    `display_order` INT NOT NULL DEFAULT 0,
    `is_external` TINYINT(1) NOT NULL DEFAULT 0,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_fl_column` (`column_name`),
    INDEX `idx_fl_order` (`display_order`),
    INDEX `idx_fl_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `social_links` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `platform` VARCHAR(50) NOT NULL, -- 'facebook', 'instagram', 'youtube', 'x', 'tripadvisor', etc.
    `url` VARCHAR(255) NOT NULL,
    `icon` VARCHAR(50) NULL,
    `display_order` INT NOT NULL DEFAULT 0,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_sl_platform` (`platform`),
    INDEX `idx_sl_order` (`display_order`),
    INDEX `idx_sl_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 10. SECURITY & AUDIT LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NULL,
    `action` VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'login', 'status_change', 'publish', 'unpublish'
    `entity_type` VARCHAR(100) NOT NULL, -- 'tour', 'destination', 'booking', 'user', 'setting', 'review', etc.
    `entity_id` BIGINT UNSIGNED NULL,
    `old_values` JSON NULL,
    `new_values` JSON NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` VARCHAR(255) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_audit_user` (`user_id`),
    INDEX `idx_audit_action` (`action`),
    INDEX `idx_audit_entity` (`entity_type`, `entity_id`),
    INDEX `idx_audit_created_at` (`created_at`),
    CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
