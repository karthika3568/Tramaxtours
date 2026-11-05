-- 029_create_medical_trips_schema.sql
-- Complete Dynamic Medical Trip Management System Schema

CREATE TABLE IF NOT EXISTS `medical_trips` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `category` VARCHAR(100) DEFAULT 'Comprehensive Health Check',
  `short_description` TEXT,
  `description` LONGTEXT,
  `duration` VARCHAR(100) DEFAULT '1 Day',
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `discount_price` DECIMAL(10,2) NULL,
  `currency` VARCHAR(10) DEFAULT 'INR',
  `location` VARCHAR(255) DEFAULT 'Chennai, Tamil Nadu',
  `featured_image` VARCHAR(255) NULL,
  `banner_title` VARCHAR(255) NULL,
  `banner_subtitle` VARCHAR(255) NULL,
  `banner_description` TEXT NULL,
  `banner_image` VARCHAR(255) NULL,
  `highlights` LONGTEXT NULL,
  `benefits` LONGTEXT NULL,
  `instructions` LONGTEXT NULL,
  `preparation_guidelines` LONGTEXT NULL,
  `included_services` LONGTEXT NULL,
  `excluded_services` LONGTEXT NULL,
  `cancellation_policy` LONGTEXT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `is_published` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_slug` (`slug`),
  INDEX `idx_published_active` (`is_published`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `medical_assessments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `medical_trip_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `subtitle` VARCHAR(255) NULL,
  `short_description` TEXT NULL,
  `description` LONGTEXT NULL,
  `image` VARCHAR(255) NULL,
  `icon` VARCHAR(100) NULL,
  `covers` TEXT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`medical_trip_id`) REFERENCES `medical_trips` (`id`) ON DELETE CASCADE,
  INDEX `idx_trip_order` (`medical_trip_id`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `medical_assessment_tests` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `assessment_id` INT UNSIGNED NOT NULL,
  `test_name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `evaluation_details` TEXT NULL,
  `report_information` TEXT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`assessment_id`) REFERENCES `medical_assessments` (`id`) ON DELETE CASCADE,
  INDEX `idx_assessment_order` (`assessment_id`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `medical_trip_diseases` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `medical_trip_id` INT UNSIGNED NOT NULL,
  `condition_name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NULL,
  `description` TEXT NULL,
  `icon` VARCHAR(100) NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`medical_trip_id`) REFERENCES `medical_trips` (`id`) ON DELETE CASCADE,
  INDEX `idx_trip_disease_order` (`medical_trip_id`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `medical_trip_bookings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `booking_reference` VARCHAR(64) NOT NULL UNIQUE,
  `medical_trip_id` INT UNSIGNED NOT NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `preferred_date` DATE NOT NULL,
  `number_of_persons` INT UNSIGNED NOT NULL DEFAULT 1,
  `message` TEXT NULL,
  `status` ENUM('new','contacted','planning','quoted','confirmed','closed','cancelled') DEFAULT 'new',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`medical_trip_id`) REFERENCES `medical_trips` (`id`) ON DELETE CASCADE,
  INDEX `idx_medical_trip_id` (`medical_trip_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

