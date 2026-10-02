-- Migration: 027_create_trip_requests_tables.sql
-- Description: "Request My Trip" system. A public visitor submits a detailed
-- trip-planning enquiry (contact, trip, travelers, preferences, transport,
-- accommodation, optional flight/train, budget, optional private documents)
-- which is stored, emailed, and given a WhatsApp click-to-chat link, then
-- managed by admins through a status workflow with full history logging.
-- `contact_messages` (simple, fieldless) and `reviews` (tour-scoped customer
-- feedback) were both inspected and are not a fit for this richer, admin-
-- workflow-driven enquiry — hence a dedicated table set.
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `trip_requests` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `reference_id` VARCHAR(20) NOT NULL,

    -- Contact
    `full_name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(50) NOT NULL,
    `whatsapp_number` VARCHAR(50) NULL,
    `preferred_contact_method` ENUM('email', 'phone', 'whatsapp') NOT NULL DEFAULT 'email',

    -- Trip
    `destination_id` BIGINT UNSIGNED NULL,
    `tour_id` BIGINT UNSIGNED NULL,
    `trip_start_date` DATE NULL,
    `trip_end_date` DATE NULL,
    `duration_days` SMALLINT UNSIGNED NULL,
    `trip_notes` TEXT NULL,

    -- Travelers
    `adults_count` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    `children_count` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `infants_count` SMALLINT UNSIGNED NOT NULL DEFAULT 0,

    -- Tour preferences
    `preferred_categories` VARCHAR(255) NULL COMMENT 'Comma-separated tour_categories.slug values',
    `special_interests` TEXT NULL,

    -- Transportation
    `transportation_mode` ENUM('private_car', 'coach', 'self_drive', 'not_sure') NOT NULL DEFAULT 'not_sure',
    `needs_airport_pickup` TINYINT(1) NOT NULL DEFAULT 0,

    -- Accommodation
    `accommodation_type` ENUM('budget', 'standard', 'luxury', 'not_sure') NOT NULL DEFAULT 'not_sure',
    `accommodation_notes` TEXT NULL,

    -- Flight / Train (optional)
    `arrival_mode` ENUM('flight', 'train', 'not_sure', 'none') NOT NULL DEFAULT 'none',
    `arrival_details` VARCHAR(255) NULL,
    `arrival_datetime` DATETIME NULL,
    `departure_mode` ENUM('flight', 'train', 'not_sure', 'none') NOT NULL DEFAULT 'none',
    `departure_details` VARCHAR(255) NULL,
    `departure_datetime` DATETIME NULL,

    -- Budget (stored exactly as entered, no currency conversion)
    `budget_amount` DECIMAL(12, 2) NULL,
    `budget_currency` VARCHAR(10) NULL,
    `budget_notes` TEXT NULL,

    -- Workflow
    `status` ENUM('new', 'contacted', 'planning', 'quotation_sent', 'confirmed', 'closed', 'cancelled') NOT NULL DEFAULT 'new',
    `admin_notes` TEXT NULL,
    `email_status` ENUM('sent', 'failed', 'not_configured') NOT NULL DEFAULT 'not_configured',
    `source_ip` VARCHAR(45) NULL,
    `user_agent` VARCHAR(255) NULL,

    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,

    UNIQUE KEY `uq_tr_reference` (`reference_id`),
    INDEX `idx_tr_status` (`status`),
    INDEX `idx_tr_created_at` (`created_at`),
    INDEX `idx_tr_email` (`email`),
    INDEX `idx_tr_destination` (`destination_id`),
    INDEX `idx_tr_deleted_at` (`deleted_at`),
    CONSTRAINT `fk_triprequests_destination` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_triprequests_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `trip_request_status_history` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `trip_request_id` BIGINT UNSIGNED NOT NULL,
    `previous_status` VARCHAR(50) NULL,
    `new_status` VARCHAR(50) NOT NULL,
    `changed_by` BIGINT UNSIGNED NULL,
    `note` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_trsh_trip_request` (`trip_request_id`),
    INDEX `idx_trsh_changed_by` (`changed_by`),
    CONSTRAINT `fk_trsh_trip_request` FOREIGN KEY (`trip_request_id`) REFERENCES `trip_requests` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_trsh_user` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `trip_request_documents` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `trip_request_id` BIGINT UNSIGNED NOT NULL,
    `document_type` ENUM('passport', 'flight_ticket') NOT NULL,
    `original_name` VARCHAR(255) NOT NULL,
    `stored_filename` VARCHAR(255) NOT NULL COMMENT 'Randomized filename on disk, never guessable',
    `mime_type` VARCHAR(100) NOT NULL,
    `file_size` INT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_trd_trip_request` (`trip_request_id`),
    CONSTRAINT `fk_trd_trip_request` FOREIGN KEY (`trip_request_id`) REFERENCES `trip_requests` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
