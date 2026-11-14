-- ==============================================================================
-- Wanderer South India - Complete Clean Database Schema & Data Dump
-- Generated: 2026-11-14 07:29:09
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- -----------------------------------------------------
-- Table structure for `audit_logs`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` bigint unsigned DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_user` (`user_id`),
  KEY `idx_audit_action` (`action`),
  KEY `idx_audit_entity` (`entity_type`,`entity_id`),
  KEY `idx_audit_created_at` (`created_at`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2875 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table structure for `booking_billing_addresses`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `booking_billing_addresses`;
CREATE TABLE `booking_billing_addresses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` bigint unsigned NOT NULL,
  `address_line1` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address_line2` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_id` (`booking_id`),
  KEY `idx_bba_country` (`country`),
  KEY `idx_bba_city` (`city`),
  CONSTRAINT `fk_bba_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `booking_billing_addresses`
INSERT INTO `booking_billing_addresses` (`id`, `booking_id`, `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country`, `created_at`, `updated_at`) VALUES ('1', '34', '14 Avenue des Champs-Elysees', NULL, 'Paris', 'Ile-de-France', '75008', 'France', '2026-09-25 16:29:53', '2026-09-25 16:29:53');
INSERT INTO `booking_billing_addresses` (`id`, `booking_id`, `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country`, `created_at`, `updated_at`) VALUES ('13', '60', 'India', NULL, 'Chennai', 'Tamil Nadu', '600001', 'India', '2026-09-28 13:35:44', '2026-09-28 13:35:44');
INSERT INTO `booking_billing_addresses` (`id`, `booking_id`, `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country`, `created_at`, `updated_at`) VALUES ('14', '61', 'Hotel Pickup in South India', NULL, 'Chennai', 'Tamil Nadu', '600001', 'India', '2026-09-30 16:31:56', '2026-09-30 16:31:56');
INSERT INTO `booking_billing_addresses` (`id`, `booking_id`, `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country`, `created_at`, `updated_at`) VALUES ('15', '63', '123 Beach Road', NULL, 'Chennai', 'Tamil Nadu', '600001', 'India', '2026-11-06 11:32:09', '2026-11-06 11:32:09');
INSERT INTO `booking_billing_addresses` (`id`, `booking_id`, `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country`, `created_at`, `updated_at`) VALUES ('16', '64', '123 Beach Road', NULL, 'Chennai', 'Tamil Nadu', '600001', 'India', '2026-11-06 11:32:36', '2026-11-06 11:32:36');
INSERT INTO `booking_billing_addresses` (`id`, `booking_id`, `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country`, `created_at`, `updated_at`) VALUES ('17', '65', '123 Beach Road', NULL, 'Chennai', 'Tamil Nadu', '600001', 'India', '2026-11-06 11:32:40', '2026-11-06 11:32:40');
INSERT INTO `booking_billing_addresses` (`id`, `booking_id`, `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country`, `created_at`, `updated_at`) VALUES ('18', '66', '123 Beach Road', NULL, 'Chennai', 'Tamil Nadu', '600001', 'India', '2026-11-06 11:33:06', '2026-11-06 11:33:06');
INSERT INTO `booking_billing_addresses` (`id`, `booking_id`, `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country`, `created_at`, `updated_at`) VALUES ('19', '67', '123 Beach Road', NULL, 'Chennai', 'Tamil Nadu', '600001', 'India', '2026-11-06 11:33:06', '2026-11-06 11:33:06');
INSERT INTO `booking_billing_addresses` (`id`, `booking_id`, `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country`, `created_at`, `updated_at`) VALUES ('20', '68', '123 Beach Road', NULL, 'Chennai', 'Tamil Nadu', '600001', 'India', '2026-11-06 12:33:11', '2026-11-06 12:33:11');
INSERT INTO `booking_billing_addresses` (`id`, `booking_id`, `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country`, `created_at`, `updated_at`) VALUES ('21', '69', '123 Beach Road', NULL, 'Chennai', 'Tamil Nadu', '600001', 'India', '2026-11-06 12:33:12', '2026-11-06 12:33:12');
INSERT INTO `booking_billing_addresses` (`id`, `booking_id`, `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country`, `created_at`, `updated_at`) VALUES ('22', '70', 'airport', NULL, 'Chennai', 'Tamil Nadu', '600001', 'India', '2026-11-11 10:39:44', '2026-11-11 10:39:44');
INSERT INTO `booking_billing_addresses` (`id`, `booking_id`, `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country`, `created_at`, `updated_at`) VALUES ('23', '71', 'chennai airport', NULL, 'Chennai', 'Tamil Nadu', '600001', 'India', '2026-11-13 13:19:22', '2026-11-13 13:19:22');
INSERT INTO `booking_billing_addresses` (`id`, `booking_id`, `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country`, `created_at`, `updated_at`) VALUES ('24', '72', 'Covelong Point', NULL, 'Chennai', 'Tamil Nadu', '600001', 'India', '2026-11-13 19:34:38', '2026-11-13 19:34:38');
INSERT INTO `booking_billing_addresses` (`id`, `booking_id`, `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country`, `created_at`, `updated_at`) VALUES ('25', '73', 'Covelong Point', NULL, 'Chennai', 'Tamil Nadu', '600001', 'India', '2026-11-13 19:39:29', '2026-11-13 19:39:29');

-- -----------------------------------------------------
-- Table structure for `booking_contact_logs`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `booking_contact_logs`;
CREATE TABLE `booking_contact_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` bigint unsigned NOT NULL,
  `contact_type` enum('phone','whatsapp','email','other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'phone',
  `notes` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `contacted_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `recorded_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bcl_booking` (`booking_id`),
  KEY `idx_bcl_recorded_by` (`recorded_by`),
  KEY `idx_bcl_contacted_at` (`contacted_at`),
  CONSTRAINT `fk_bcl_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_bcl_user` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `booking_contact_logs`
INSERT INTO `booking_contact_logs` (`id`, `booking_id`, `contact_type`, `notes`, `contacted_at`, `recorded_by`, `created_at`) VALUES ('1', '63', 'whatsapp', 'Contacted traveler via WhatsApp. Customer agreed to pay 3,000 INR advance via UPI and 7,000 INR cash on arrival.', '2026-11-06 06:02:09', '1', '2026-11-06 11:32:09');
INSERT INTO `booking_contact_logs` (`id`, `booking_id`, `contact_type`, `notes`, `contacted_at`, `recorded_by`, `created_at`) VALUES ('2', '64', 'whatsapp', 'Contacted traveler via WhatsApp. Customer agreed to pay 3,000 INR advance via UPI and 7,000 INR cash on arrival.', '2026-11-06 06:02:36', '1', '2026-11-06 11:32:36');
INSERT INTO `booking_contact_logs` (`id`, `booking_id`, `contact_type`, `notes`, `contacted_at`, `recorded_by`, `created_at`) VALUES ('3', '66', 'whatsapp', 'Contacted traveler via WhatsApp. Customer agreed to pay 3,000 INR advance via UPI and 7,000 INR cash on arrival.', '2026-11-06 06:03:06', '1', '2026-11-06 11:33:06');
INSERT INTO `booking_contact_logs` (`id`, `booking_id`, `contact_type`, `notes`, `contacted_at`, `recorded_by`, `created_at`) VALUES ('4', '68', 'whatsapp', 'Contacted traveler via WhatsApp. Customer agreed to pay 3,000 INR advance via UPI and 7,000 INR cash on arrival.', '2026-11-06 07:03:11', '1', '2026-11-06 12:33:11');
INSERT INTO `booking_contact_logs` (`id`, `booking_id`, `contact_type`, `notes`, `contacted_at`, `recorded_by`, `created_at`) VALUES ('5', '72', 'phone', 'Spoke with customer regarding travel dates and pickup from Chennai Airport.', '2026-11-13 14:04:38', NULL, '2026-11-13 19:34:38');
INSERT INTO `booking_contact_logs` (`id`, `booking_id`, `contact_type`, `notes`, `contacted_at`, `recorded_by`, `created_at`) VALUES ('6', '73', 'phone', 'Spoke with customer regarding travel dates and pickup from Chennai Airport.', '2026-11-13 14:09:29', NULL, '2026-11-13 19:39:29');

-- -----------------------------------------------------
-- Table structure for `booking_customer_details`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `booking_customer_details`;
CREATE TABLE `booking_customer_details` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` bigint unsigned NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `middle_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dial_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_id` (`booking_id`),
  KEY `idx_bcd_email` (`email`),
  KEY `idx_bcd_phone` (`phone`),
  CONSTRAINT `fk_bcd_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `booking_customer_details`
INSERT INTO `booking_customer_details` (`id`, `booking_id`, `first_name`, `middle_name`, `last_name`, `dial_code`, `country`, `email`, `phone`, `created_at`, `updated_at`) VALUES ('1', '34', 'Karthika', NULL, 'Govind', NULL, NULL, 'karthika@example.com', '+33612345678', '2026-09-25 16:29:53', '2026-09-25 16:29:53');
INSERT INTO `booking_customer_details` (`id`, `booking_id`, `first_name`, `middle_name`, `last_name`, `dial_code`, `country`, `email`, `phone`, `created_at`, `updated_at`) VALUES ('13', '60', 'Super', NULL, 'Admin', NULL, NULL, 'admin@tramaxtours.com', '+919840000000', '2026-09-28 13:35:44', '2026-09-28 13:35:44');
INSERT INTO `booking_customer_details` (`id`, `booking_id`, `first_name`, `middle_name`, `last_name`, `dial_code`, `country`, `email`, `phone`, `created_at`, `updated_at`) VALUES ('14', '61', 'Super', NULL, 'Admin', NULL, NULL, 'admin@tramaxtours.com', '+919840000000', '2026-09-30 16:31:56', '2026-09-30 16:31:56');
INSERT INTO `booking_customer_details` (`id`, `booking_id`, `first_name`, `middle_name`, `last_name`, `dial_code`, `country`, `email`, `phone`, `created_at`, `updated_at`) VALUES ('15', '63', 'John', NULL, 'Doe', '+91', 'India', 'test.traveler.1793944929@example.com', '+919876543210', '2026-11-06 11:32:09', '2026-11-06 11:32:09');
INSERT INTO `booking_customer_details` (`id`, `booking_id`, `first_name`, `middle_name`, `last_name`, `dial_code`, `country`, `email`, `phone`, `created_at`, `updated_at`) VALUES ('16', '64', 'John', NULL, 'Doe', '+91', 'India', 'test.traveler.1793944956@example.com', '+919876543210', '2026-11-06 11:32:36', '2026-11-06 11:32:36');
INSERT INTO `booking_customer_details` (`id`, `booking_id`, `first_name`, `middle_name`, `last_name`, `dial_code`, `country`, `email`, `phone`, `created_at`, `updated_at`) VALUES ('17', '65', 'John', NULL, 'Doe', '+91', 'India', 'reject.test.1793944960@example.com', '+919876543210', '2026-11-06 11:32:40', '2026-11-06 11:32:40');
INSERT INTO `booking_customer_details` (`id`, `booking_id`, `first_name`, `middle_name`, `last_name`, `dial_code`, `country`, `email`, `phone`, `created_at`, `updated_at`) VALUES ('18', '66', 'John', NULL, 'Doe', '+91', 'India', 'test.traveler.1793944986@example.com', '+919876543210', '2026-11-06 11:33:06', '2026-11-06 11:33:06');
INSERT INTO `booking_customer_details` (`id`, `booking_id`, `first_name`, `middle_name`, `last_name`, `dial_code`, `country`, `email`, `phone`, `created_at`, `updated_at`) VALUES ('19', '67', 'John', NULL, 'Doe', '+91', 'India', 'reject.test.1793944986@example.com', '+919876543210', '2026-11-06 11:33:06', '2026-11-06 11:33:06');
INSERT INTO `booking_customer_details` (`id`, `booking_id`, `first_name`, `middle_name`, `last_name`, `dial_code`, `country`, `email`, `phone`, `created_at`, `updated_at`) VALUES ('20', '68', 'John', NULL, 'Doe', '+91', 'India', 'test.traveler.1793948591@example.com', '+919876543210', '2026-11-06 12:33:11', '2026-11-06 12:33:11');
INSERT INTO `booking_customer_details` (`id`, `booking_id`, `first_name`, `middle_name`, `last_name`, `dial_code`, `country`, `email`, `phone`, `created_at`, `updated_at`) VALUES ('21', '69', 'John', NULL, 'Doe', '+91', 'India', 'reject.test.1793948592@example.com', '+919876543210', '2026-11-06 12:33:12', '2026-11-06 12:33:12');
INSERT INTO `booking_customer_details` (`id`, `booking_id`, `first_name`, `middle_name`, `last_name`, `dial_code`, `country`, `email`, `phone`, `created_at`, `updated_at`) VALUES ('22', '70', 'karthika', NULL, 'ganesan', '+91', 'India', 'ganesankarthika2005@gmail.com', '6374036592', '2026-11-11 10:39:44', '2026-11-11 10:39:44');
INSERT INTO `booking_customer_details` (`id`, `booking_id`, `first_name`, `middle_name`, `last_name`, `dial_code`, `country`, `email`, `phone`, `created_at`, `updated_at`) VALUES ('23', '71', 'karthika', NULL, 'ganesan', '+91', 'India', 'mkarthika3568@gmail.com', '9715336007', '2026-11-13 13:19:22', '2026-11-13 13:19:22');
INSERT INTO `booking_customer_details` (`id`, `booking_id`, `first_name`, `middle_name`, `last_name`, `dial_code`, `country`, `email`, `phone`, `created_at`, `updated_at`) VALUES ('24', '72', 'Karthika', NULL, 'Ganesan', '+91', 'India', 'ganesankarthika2005@gmail.com', '+919840291110', '2026-11-13 19:34:38', '2026-11-13 19:34:38');
INSERT INTO `booking_customer_details` (`id`, `booking_id`, `first_name`, `middle_name`, `last_name`, `dial_code`, `country`, `email`, `phone`, `created_at`, `updated_at`) VALUES ('25', '73', 'Karthika', NULL, 'Ganesan', '+91', 'India', 'ganesankarthika2005@gmail.com', '+919840291110', '2026-11-13 19:39:29', '2026-11-13 19:39:29');

-- -----------------------------------------------------
-- Table structure for `booking_status_history`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `booking_status_history`;
CREATE TABLE `booking_status_history` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` bigint unsigned NOT NULL,
  `previous_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `changed_by` bigint unsigned DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bsh_booking` (`booking_id`),
  KEY `idx_bsh_changed_by` (`changed_by`),
  CONSTRAINT `fk_bsh_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_bsh_user` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `booking_status_history`
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('1', '34', NULL, 'pending', NULL, 'Booking placed successfully', '2026-09-25 16:29:53');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('2', '34', 'pending', 'confirmed', '1', 'Confirmed via call', '2026-09-25 16:29:53');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('3', '34', 'confirmed', 'completed', '1', 'Tour finished', '2026-09-25 16:29:53');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('4', '34', 'completed', 'cancelled', '1', 'Client requested cancellation', '2026-09-25 16:29:53');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('49', '60', NULL, 'pending', NULL, 'Booking placed successfully', '2026-09-28 13:35:44');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('50', '61', NULL, 'pending', NULL, 'Booking placed successfully', '2026-09-30 16:31:56');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('51', '61', 'pending', 'cancelled', '1', 'Change of travel plans', '2026-09-30 16:32:16');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('52', '60', 'pending', 'cancelled', '1', 'Change of travel plans', '2026-09-30 16:32:27');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('53', '63', NULL, 'pending', NULL, 'Booking placed successfully', '2026-11-06 11:32:09');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('54', '63', 'pending', 'pending', '1', 'Full payment of INR 10000 received and settled via cash (Ref: CASH-REC-3A6274)', '2026-11-06 11:32:09');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('55', '63', 'pending', 'confirmed', '1', 'Payment verified in full. Booking confirmed.', '2026-11-06 11:32:09');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('56', '64', NULL, 'pending', NULL, 'Booking placed successfully', '2026-11-06 11:32:36');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('57', '64', 'pending', 'pending', '1', 'Full payment of INR 10000 received and settled via cash (Ref: CASH-REC-D5230A)', '2026-11-06 11:32:36');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('58', '64', 'pending', 'confirmed', '1', 'Payment verified in full. Booking confirmed.', '2026-11-06 11:32:36');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('59', '65', NULL, 'pending', NULL, 'Booking placed successfully', '2026-11-06 11:32:40');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('60', '65', 'pending', 'rejected', '1', 'Traveler cancelled request', '2026-11-06 11:32:40');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('61', '66', NULL, 'pending', NULL, 'Booking placed successfully', '2026-11-06 11:33:06');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('62', '66', 'pending', 'pending', '1', 'Full payment of INR 10000 received and settled via cash (Ref: CASH-REC-6C2296)', '2026-11-06 11:33:06');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('63', '66', 'pending', 'confirmed', '1', 'Payment verified in full. Booking confirmed.', '2026-11-06 11:33:06');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('64', '67', NULL, 'pending', NULL, 'Booking placed successfully', '2026-11-06 11:33:06');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('65', '67', 'pending', 'rejected', '1', 'Traveler cancelled request', '2026-11-06 11:33:06');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('66', '68', NULL, 'pending', NULL, 'Booking placed successfully', '2026-11-06 12:33:11');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('67', '68', 'pending', 'pending', '1', 'Full payment of INR 10000 received and settled via cash (Ref: CASH-REC-30BFD0)', '2026-11-06 12:33:11');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('68', '68', 'pending', 'confirmed', '1', 'Payment verified in full. Booking confirmed.', '2026-11-06 12:33:11');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('69', '69', NULL, 'pending', NULL, 'Booking placed successfully', '2026-11-06 12:33:12');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('70', '69', 'pending', 'rejected', '1', 'Traveler cancelled request', '2026-11-06 12:33:12');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('71', '70', NULL, 'pending', NULL, 'Booking placed successfully', '2026-11-11 10:39:44');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('72', '71', NULL, 'pending', NULL, 'Booking placed successfully', '2026-11-13 13:19:22');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('73', '72', NULL, 'pending', NULL, 'Booking placed successfully', '2026-11-13 19:34:38');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('74', '72', 'pending', 'contacted', '1', 'Customer contacted via phone', '2026-11-13 19:34:38');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('75', '72', 'contacted', 'payment_discussion', '1', 'Payment terms discussed & recorded: Agreed Price INR 9500, Advance: 3000, Balance: 6500, Method: upi', '2026-11-13 19:34:38');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('76', '72', 'payment_discussion', 'confirmed', '1', 'Final confirmation completed with customer. Advance confirmed.', '2026-11-13 19:34:38');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('77', '73', NULL, 'pending', NULL, 'Booking placed successfully', '2026-11-13 19:39:29');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('78', '73', 'pending', 'contacted', '1', 'Customer contacted via phone', '2026-11-13 19:39:29');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('79', '73', 'contacted', 'payment_discussion', '1', 'Payment terms discussed & recorded: Agreed Price INR 9500, Advance: 3000, Balance: 6500, Method: upi', '2026-11-13 19:39:29');
INSERT INTO `booking_status_history` (`id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`) VALUES ('80', '73', 'payment_discussion', 'confirmed', '1', 'Final confirmation completed with customer. Advance confirmed.', '2026-11-13 19:39:29');

-- -----------------------------------------------------
-- Table structure for `bookings`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookings`;
CREATE TABLE `bookings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_number` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ticket_number` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ticket_pdf_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `access_token_hash` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tour_id` bigint unsigned NOT NULL,
  `pricing_tier_id` bigint unsigned DEFAULT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `middle_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dial_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `destination_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pickup_location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `arrival_date` date DEFAULT NULL,
  `departure_date` date DEFAULT NULL,
  `duration_days` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adults_count` int unsigned DEFAULT NULL,
  `children_count` int unsigned DEFAULT '0',
  `infants_count` int unsigned DEFAULT '0',
  `tour_types` text COLLATE utf8mb4_unicode_ci,
  `tour_guide_required` tinyint(1) DEFAULT '0',
  `preferred_language` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vehicle_preference` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `airport_pickup` tinyint(1) DEFAULT '0',
  `airport_drop` tinyint(1) DEFAULT '0',
  `hotel_category` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `room_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rooms_count` int unsigned DEFAULT '1',
  `arrival_flight_train_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `arrival_time` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `departure_flight_train_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `departure_time` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approximate_budget` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `budget_currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'EUR',
  `passport_file_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `flight_ticket_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `preferred_contact_methods` text COLLATE utf8mb4_unicode_ci,
  `special_requests` text COLLATE utf8mb4_unicode_ci,
  `booking_date` date NOT NULL,
  `tickets_count` int unsigned NOT NULL DEFAULT '1',
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `tax_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `discount_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_price` decimal(10,2) NOT NULL,
  `agreed_price` decimal(10,2) DEFAULT NULL,
  `advance_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `balance_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `payment_discussion_notes` text COLLATE utf8mb4_unicode_ci,
  `approved_at` datetime DEFAULT NULL,
  `confirmed_at` datetime DEFAULT NULL,
  `confirmed_by` bigint unsigned DEFAULT NULL,
  `approved_by` bigint unsigned DEFAULT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EUR',
  `booking_status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pay_on_arrival',
  `payment_status` enum('pending','paid','not_required','failed','refunded') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `customer_email_status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `sms_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `sms_sent_at` datetime DEFAULT NULL,
  `last_sms_error` text COLLATE utf8mb4_unicode_ci,
  `customer_email_sent_at` datetime DEFAULT NULL,
  `admin_email_status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `admin_email_sent_at` datetime DEFAULT NULL,
  `email_send_count` int unsigned NOT NULL DEFAULT '0',
  `last_email_attempt_at` datetime DEFAULT NULL,
  `last_email_error` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_notes` text COLLATE utf8mb4_unicode_ci,
  `preferred_session` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `experience_level` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `additional_details` json DEFAULT NULL,
  `admin_notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  UNIQUE KEY `idx_bookings_ticket_number` (`ticket_number`),
  KEY `idx_bookings_order_num` (`order_number`),
  KEY `idx_bookings_user` (`user_id`),
  KEY `idx_bookings_tour` (`tour_id`),
  KEY `idx_bookings_date` (`booking_date`),
  KEY `idx_bookings_status` (`booking_status`),
  KEY `idx_bookings_payment_status` (`payment_status`),
  KEY `idx_bookings_created_at` (`created_at`),
  KEY `idx_bookings_deleted_at` (`deleted_at`),
  KEY `fk_bookings_tier` (`pricing_tier_id`),
  KEY `idx_bookings_user_id` (`user_id`),
  CONSTRAINT `fk_bookings_tier` FOREIGN KEY (`pricing_tier_id`) REFERENCES `tour_pricing_tiers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_bookings_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_bookings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `bookings`
INSERT INTO `bookings` (`id`, `order_number`, `ticket_number`, `ticket_pdf_path`, `user_id`, `access_token_hash`, `tour_id`, `pricing_tier_id`, `first_name`, `middle_name`, `last_name`, `dial_code`, `country`, `destination_name`, `pickup_location`, `arrival_date`, `departure_date`, `duration_days`, `adults_count`, `children_count`, `infants_count`, `tour_types`, `tour_guide_required`, `preferred_language`, `vehicle_preference`, `airport_pickup`, `airport_drop`, `hotel_category`, `room_type`, `rooms_count`, `arrival_flight_train_number`, `arrival_time`, `departure_flight_train_number`, `departure_time`, `approximate_budget`, `budget_currency`, `passport_file_url`, `flight_ticket_url`, `preferred_contact_methods`, `special_requests`, `booking_date`, `tickets_count`, `unit_price`, `subtotal`, `tax_amount`, `discount_amount`, `total_price`, `agreed_price`, `advance_amount`, `balance_amount`, `payment_discussion_notes`, `approved_at`, `confirmed_at`, `confirmed_by`, `approved_by`, `currency`, `booking_status`, `payment_method`, `payment_status`, `customer_email_status`, `sms_status`, `sms_sent_at`, `last_sms_error`, `customer_email_sent_at`, `admin_email_status`, `admin_email_sent_at`, `email_send_count`, `last_email_attempt_at`, `last_email_error`, `customer_notes`, `preferred_session`, `experience_level`, `additional_details`, `admin_notes`, `created_at`, `updated_at`, `deleted_at`) VALUES ('34', 'TT-20260925-8D74', NULL, NULL, NULL, NULL, '98', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0', '0', NULL, '0', NULL, NULL, '0', '0', NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, 'EUR', NULL, NULL, NULL, NULL, '2026-10-02', '2', '250.00', '500.00', '0.00', '0.00', '500.00', NULL, '0.00', '500.00', NULL, NULL, NULL, NULL, NULL, 'EUR', 'cancelled', 'pay_on_arrival', 'pending', 'pending', 'pending', NULL, NULL, NULL, 'pending', NULL, '0', NULL, NULL, 'Vegetarian dietary requirement requested', NULL, NULL, NULL, NULL, '2026-09-25 16:29:53', '2026-11-06 10:40:13', NULL);
INSERT INTO `bookings` (`id`, `order_number`, `ticket_number`, `ticket_pdf_path`, `user_id`, `access_token_hash`, `tour_id`, `pricing_tier_id`, `first_name`, `middle_name`, `last_name`, `dial_code`, `country`, `destination_name`, `pickup_location`, `arrival_date`, `departure_date`, `duration_days`, `adults_count`, `children_count`, `infants_count`, `tour_types`, `tour_guide_required`, `preferred_language`, `vehicle_preference`, `airport_pickup`, `airport_drop`, `hotel_category`, `room_type`, `rooms_count`, `arrival_flight_train_number`, `arrival_time`, `departure_flight_train_number`, `departure_time`, `approximate_budget`, `budget_currency`, `passport_file_url`, `flight_ticket_url`, `preferred_contact_methods`, `special_requests`, `booking_date`, `tickets_count`, `unit_price`, `subtotal`, `tax_amount`, `discount_amount`, `total_price`, `agreed_price`, `advance_amount`, `balance_amount`, `payment_discussion_notes`, `approved_at`, `confirmed_at`, `confirmed_by`, `approved_by`, `currency`, `booking_status`, `payment_method`, `payment_status`, `customer_email_status`, `sms_status`, `sms_sent_at`, `last_sms_error`, `customer_email_sent_at`, `admin_email_status`, `admin_email_sent_at`, `email_send_count`, `last_email_attempt_at`, `last_email_error`, `customer_notes`, `preferred_session`, `experience_level`, `additional_details`, `admin_notes`, `created_at`, `updated_at`, `deleted_at`) VALUES ('60', 'TT-20260928-EA89', NULL, NULL, NULL, NULL, '152', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0', '0', NULL, '0', NULL, NULL, '0', '0', NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, 'EUR', NULL, NULL, NULL, NULL, '2026-09-29', '2', '65.00', '130.00', '0.00', '0.00', '130.00', NULL, '0.00', '130.00', NULL, NULL, NULL, NULL, NULL, 'USD', 'cancelled', 'pay_on_arrival', 'pending', 'pending', 'pending', NULL, NULL, NULL, 'pending', NULL, '0', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-28 13:35:44', '2026-11-06 10:40:13', NULL);
INSERT INTO `bookings` (`id`, `order_number`, `ticket_number`, `ticket_pdf_path`, `user_id`, `access_token_hash`, `tour_id`, `pricing_tier_id`, `first_name`, `middle_name`, `last_name`, `dial_code`, `country`, `destination_name`, `pickup_location`, `arrival_date`, `departure_date`, `duration_days`, `adults_count`, `children_count`, `infants_count`, `tour_types`, `tour_guide_required`, `preferred_language`, `vehicle_preference`, `airport_pickup`, `airport_drop`, `hotel_category`, `room_type`, `rooms_count`, `arrival_flight_train_number`, `arrival_time`, `departure_flight_train_number`, `departure_time`, `approximate_budget`, `budget_currency`, `passport_file_url`, `flight_ticket_url`, `preferred_contact_methods`, `special_requests`, `booking_date`, `tickets_count`, `unit_price`, `subtotal`, `tax_amount`, `discount_amount`, `total_price`, `agreed_price`, `advance_amount`, `balance_amount`, `payment_discussion_notes`, `approved_at`, `confirmed_at`, `confirmed_by`, `approved_by`, `currency`, `booking_status`, `payment_method`, `payment_status`, `customer_email_status`, `sms_status`, `sms_sent_at`, `last_sms_error`, `customer_email_sent_at`, `admin_email_status`, `admin_email_sent_at`, `email_send_count`, `last_email_attempt_at`, `last_email_error`, `customer_notes`, `preferred_session`, `experience_level`, `additional_details`, `admin_notes`, `created_at`, `updated_at`, `deleted_at`) VALUES ('61', 'TT-20260930-7FEC', NULL, NULL, NULL, NULL, '152', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0', '0', NULL, '0', NULL, NULL, '0', '0', NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, 'EUR', NULL, NULL, NULL, NULL, '2026-10-01', '2', '65.00', '130.00', '0.00', '0.00', '130.00', NULL, '0.00', '130.00', NULL, NULL, NULL, NULL, NULL, 'USD', 'cancelled', 'pay_on_arrival', 'pending', 'pending', 'pending', NULL, NULL, NULL, 'pending', NULL, '0', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-30 16:31:56', '2026-11-06 10:40:13', NULL);
INSERT INTO `bookings` (`id`, `order_number`, `ticket_number`, `ticket_pdf_path`, `user_id`, `access_token_hash`, `tour_id`, `pricing_tier_id`, `first_name`, `middle_name`, `last_name`, `dial_code`, `country`, `destination_name`, `pickup_location`, `arrival_date`, `departure_date`, `duration_days`, `adults_count`, `children_count`, `infants_count`, `tour_types`, `tour_guide_required`, `preferred_language`, `vehicle_preference`, `airport_pickup`, `airport_drop`, `hotel_category`, `room_type`, `rooms_count`, `arrival_flight_train_number`, `arrival_time`, `departure_flight_train_number`, `departure_time`, `approximate_budget`, `budget_currency`, `passport_file_url`, `flight_ticket_url`, `preferred_contact_methods`, `special_requests`, `booking_date`, `tickets_count`, `unit_price`, `subtotal`, `tax_amount`, `discount_amount`, `total_price`, `agreed_price`, `advance_amount`, `balance_amount`, `payment_discussion_notes`, `approved_at`, `confirmed_at`, `confirmed_by`, `approved_by`, `currency`, `booking_status`, `payment_method`, `payment_status`, `customer_email_status`, `sms_status`, `sms_sent_at`, `last_sms_error`, `customer_email_sent_at`, `admin_email_status`, `admin_email_sent_at`, `email_send_count`, `last_email_attempt_at`, `last_email_error`, `customer_notes`, `preferred_session`, `experience_level`, `additional_details`, `admin_notes`, `created_at`, `updated_at`, `deleted_at`) VALUES ('63', 'WSI-20261106-5C3B', NULL, NULL, NULL, '449fd9e687adfdab13ac8440700893fd9679905ef864fc54b13f2dfbea374ecd', '138', NULL, 'John', NULL, 'Doe', '+91', 'India', NULL, NULL, '2026-11-13', NULL, NULL, '2', '0', '0', NULL, '0', NULL, NULL, '0', '0', NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, 'INR', NULL, NULL, NULL, 'Vegetarian meals', '2026-11-13', '2', '5000.00', '10000.00', '0.00', '0.00', '10000.00', NULL, '10000.00', '0.00', NULL, '2026-11-06 11:32:09', NULL, NULL, '1', 'INR', 'confirmed', 'cash', 'paid', 'pending', 'pending', NULL, NULL, NULL, 'pending', NULL, '0', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-06 11:32:09', '2026-11-06 11:32:09', NULL);
INSERT INTO `bookings` (`id`, `order_number`, `ticket_number`, `ticket_pdf_path`, `user_id`, `access_token_hash`, `tour_id`, `pricing_tier_id`, `first_name`, `middle_name`, `last_name`, `dial_code`, `country`, `destination_name`, `pickup_location`, `arrival_date`, `departure_date`, `duration_days`, `adults_count`, `children_count`, `infants_count`, `tour_types`, `tour_guide_required`, `preferred_language`, `vehicle_preference`, `airport_pickup`, `airport_drop`, `hotel_category`, `room_type`, `rooms_count`, `arrival_flight_train_number`, `arrival_time`, `departure_flight_train_number`, `departure_time`, `approximate_budget`, `budget_currency`, `passport_file_url`, `flight_ticket_url`, `preferred_contact_methods`, `special_requests`, `booking_date`, `tickets_count`, `unit_price`, `subtotal`, `tax_amount`, `discount_amount`, `total_price`, `agreed_price`, `advance_amount`, `balance_amount`, `payment_discussion_notes`, `approved_at`, `confirmed_at`, `confirmed_by`, `approved_by`, `currency`, `booking_status`, `payment_method`, `payment_status`, `customer_email_status`, `sms_status`, `sms_sent_at`, `last_sms_error`, `customer_email_sent_at`, `admin_email_status`, `admin_email_sent_at`, `email_send_count`, `last_email_attempt_at`, `last_email_error`, `customer_notes`, `preferred_session`, `experience_level`, `additional_details`, `admin_notes`, `created_at`, `updated_at`, `deleted_at`) VALUES ('64', 'WSI-20261106-777E', NULL, NULL, NULL, '1cbf87edac939c32a7c770ec40bced646a86156dee670a767003bf6e08b9c7b2', '138', NULL, 'John', NULL, 'Doe', '+91', 'India', NULL, NULL, '2026-11-13', NULL, NULL, '2', '0', '0', NULL, '0', NULL, NULL, '0', '0', NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, 'INR', NULL, NULL, NULL, 'Vegetarian meals', '2026-11-13', '2', '5000.00', '10000.00', '0.00', '0.00', '10000.00', NULL, '10000.00', '0.00', NULL, '2026-11-06 11:32:36', NULL, NULL, '1', 'INR', 'confirmed', 'cash', 'paid', 'pending', 'pending', NULL, NULL, NULL, 'pending', NULL, '0', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-06 11:32:36', '2026-11-06 11:32:40', NULL);
INSERT INTO `bookings` (`id`, `order_number`, `ticket_number`, `ticket_pdf_path`, `user_id`, `access_token_hash`, `tour_id`, `pricing_tier_id`, `first_name`, `middle_name`, `last_name`, `dial_code`, `country`, `destination_name`, `pickup_location`, `arrival_date`, `departure_date`, `duration_days`, `adults_count`, `children_count`, `infants_count`, `tour_types`, `tour_guide_required`, `preferred_language`, `vehicle_preference`, `airport_pickup`, `airport_drop`, `hotel_category`, `room_type`, `rooms_count`, `arrival_flight_train_number`, `arrival_time`, `departure_flight_train_number`, `departure_time`, `approximate_budget`, `budget_currency`, `passport_file_url`, `flight_ticket_url`, `preferred_contact_methods`, `special_requests`, `booking_date`, `tickets_count`, `unit_price`, `subtotal`, `tax_amount`, `discount_amount`, `total_price`, `agreed_price`, `advance_amount`, `balance_amount`, `payment_discussion_notes`, `approved_at`, `confirmed_at`, `confirmed_by`, `approved_by`, `currency`, `booking_status`, `payment_method`, `payment_status`, `customer_email_status`, `sms_status`, `sms_sent_at`, `last_sms_error`, `customer_email_sent_at`, `admin_email_status`, `admin_email_sent_at`, `email_send_count`, `last_email_attempt_at`, `last_email_error`, `customer_notes`, `preferred_session`, `experience_level`, `additional_details`, `admin_notes`, `created_at`, `updated_at`, `deleted_at`) VALUES ('65', 'WSI-20261106-7DC3', NULL, NULL, NULL, 'cff8aa350d01ca0faf0f7a2d01fd8b5f23e75aed3bc1c062cb145a7d9653b086', '138', NULL, 'John', NULL, 'Doe', '+91', 'India', NULL, NULL, '2026-11-13', NULL, NULL, '2', '0', '0', NULL, '0', NULL, NULL, '0', '0', NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, 'INR', NULL, NULL, NULL, 'Vegetarian meals', '2026-11-13', '2', '5000.00', '10000.00', '0.00', '0.00', '10000.00', NULL, '0.00', '10000.00', NULL, NULL, NULL, NULL, NULL, 'INR', 'rejected', 'upi', 'pending', 'pending', 'pending', NULL, NULL, NULL, 'pending', NULL, '0', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-06 11:32:40', '2026-11-06 11:32:40', NULL);
INSERT INTO `bookings` (`id`, `order_number`, `ticket_number`, `ticket_pdf_path`, `user_id`, `access_token_hash`, `tour_id`, `pricing_tier_id`, `first_name`, `middle_name`, `last_name`, `dial_code`, `country`, `destination_name`, `pickup_location`, `arrival_date`, `departure_date`, `duration_days`, `adults_count`, `children_count`, `infants_count`, `tour_types`, `tour_guide_required`, `preferred_language`, `vehicle_preference`, `airport_pickup`, `airport_drop`, `hotel_category`, `room_type`, `rooms_count`, `arrival_flight_train_number`, `arrival_time`, `departure_flight_train_number`, `departure_time`, `approximate_budget`, `budget_currency`, `passport_file_url`, `flight_ticket_url`, `preferred_contact_methods`, `special_requests`, `booking_date`, `tickets_count`, `unit_price`, `subtotal`, `tax_amount`, `discount_amount`, `total_price`, `agreed_price`, `advance_amount`, `balance_amount`, `payment_discussion_notes`, `approved_at`, `confirmed_at`, `confirmed_by`, `approved_by`, `currency`, `booking_status`, `payment_method`, `payment_status`, `customer_email_status`, `sms_status`, `sms_sent_at`, `last_sms_error`, `customer_email_sent_at`, `admin_email_status`, `admin_email_sent_at`, `email_send_count`, `last_email_attempt_at`, `last_email_error`, `customer_notes`, `preferred_session`, `experience_level`, `additional_details`, `admin_notes`, `created_at`, `updated_at`, `deleted_at`) VALUES ('66', 'WSI-20261106-2855', NULL, NULL, NULL, '7da8f857748feeb79e93ba974b2fba549e31c569521112907e98c6494d64db50', '138', NULL, 'John', NULL, 'Doe', '+91', 'India', NULL, NULL, '2026-11-13', NULL, NULL, '2', '0', '0', NULL, '0', NULL, NULL, '0', '0', NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, 'INR', NULL, NULL, NULL, 'Vegetarian meals', '2026-11-13', '2', '5000.00', '10000.00', '0.00', '0.00', '10000.00', NULL, '10000.00', '0.00', NULL, '2026-11-06 11:33:06', NULL, NULL, '1', 'INR', 'confirmed', 'cash', 'paid', 'pending', 'pending', NULL, NULL, NULL, 'pending', NULL, '0', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-06 11:33:06', '2026-11-06 11:33:06', NULL);
INSERT INTO `bookings` (`id`, `order_number`, `ticket_number`, `ticket_pdf_path`, `user_id`, `access_token_hash`, `tour_id`, `pricing_tier_id`, `first_name`, `middle_name`, `last_name`, `dial_code`, `country`, `destination_name`, `pickup_location`, `arrival_date`, `departure_date`, `duration_days`, `adults_count`, `children_count`, `infants_count`, `tour_types`, `tour_guide_required`, `preferred_language`, `vehicle_preference`, `airport_pickup`, `airport_drop`, `hotel_category`, `room_type`, `rooms_count`, `arrival_flight_train_number`, `arrival_time`, `departure_flight_train_number`, `departure_time`, `approximate_budget`, `budget_currency`, `passport_file_url`, `flight_ticket_url`, `preferred_contact_methods`, `special_requests`, `booking_date`, `tickets_count`, `unit_price`, `subtotal`, `tax_amount`, `discount_amount`, `total_price`, `agreed_price`, `advance_amount`, `balance_amount`, `payment_discussion_notes`, `approved_at`, `confirmed_at`, `confirmed_by`, `approved_by`, `currency`, `booking_status`, `payment_method`, `payment_status`, `customer_email_status`, `sms_status`, `sms_sent_at`, `last_sms_error`, `customer_email_sent_at`, `admin_email_status`, `admin_email_sent_at`, `email_send_count`, `last_email_attempt_at`, `last_email_error`, `customer_notes`, `preferred_session`, `experience_level`, `additional_details`, `admin_notes`, `created_at`, `updated_at`, `deleted_at`) VALUES ('67', 'WSI-20261106-6DE1', NULL, NULL, NULL, 'e335cd52dc48ba2d42228f465f5d2dc1e295f544ab7ec4c5fe0b2d32be57c02c', '138', NULL, 'John', NULL, 'Doe', '+91', 'India', NULL, NULL, '2026-11-13', NULL, NULL, '2', '0', '0', NULL, '0', NULL, NULL, '0', '0', NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, 'INR', NULL, NULL, NULL, 'Vegetarian meals', '2026-11-13', '2', '5000.00', '10000.00', '0.00', '0.00', '10000.00', NULL, '0.00', '10000.00', NULL, NULL, NULL, NULL, NULL, 'INR', 'rejected', 'upi', 'pending', 'pending', 'pending', NULL, NULL, NULL, 'pending', NULL, '0', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-06 11:33:06', '2026-11-06 11:33:06', NULL);
INSERT INTO `bookings` (`id`, `order_number`, `ticket_number`, `ticket_pdf_path`, `user_id`, `access_token_hash`, `tour_id`, `pricing_tier_id`, `first_name`, `middle_name`, `last_name`, `dial_code`, `country`, `destination_name`, `pickup_location`, `arrival_date`, `departure_date`, `duration_days`, `adults_count`, `children_count`, `infants_count`, `tour_types`, `tour_guide_required`, `preferred_language`, `vehicle_preference`, `airport_pickup`, `airport_drop`, `hotel_category`, `room_type`, `rooms_count`, `arrival_flight_train_number`, `arrival_time`, `departure_flight_train_number`, `departure_time`, `approximate_budget`, `budget_currency`, `passport_file_url`, `flight_ticket_url`, `preferred_contact_methods`, `special_requests`, `booking_date`, `tickets_count`, `unit_price`, `subtotal`, `tax_amount`, `discount_amount`, `total_price`, `agreed_price`, `advance_amount`, `balance_amount`, `payment_discussion_notes`, `approved_at`, `confirmed_at`, `confirmed_by`, `approved_by`, `currency`, `booking_status`, `payment_method`, `payment_status`, `customer_email_status`, `sms_status`, `sms_sent_at`, `last_sms_error`, `customer_email_sent_at`, `admin_email_status`, `admin_email_sent_at`, `email_send_count`, `last_email_attempt_at`, `last_email_error`, `customer_notes`, `preferred_session`, `experience_level`, `additional_details`, `admin_notes`, `created_at`, `updated_at`, `deleted_at`) VALUES ('68', 'WSI-20261106-8B54', NULL, NULL, NULL, '7f10ea7157efac1f80a089ae1b90d4f0d9bc774feb6c271d9e6dd0d714e03872', '138', NULL, 'John', NULL, 'Doe', '+91', 'India', NULL, NULL, '2026-11-13', NULL, NULL, '2', '0', '0', NULL, '0', NULL, NULL, '0', '0', NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, 'INR', NULL, NULL, NULL, 'Vegetarian meals', '2026-11-13', '2', '5000.00', '10000.00', '0.00', '0.00', '10000.00', NULL, '10000.00', '0.00', NULL, '2026-11-06 12:33:11', NULL, NULL, '1', 'INR', 'confirmed', 'cash', 'paid', 'pending', 'pending', NULL, NULL, NULL, 'pending', NULL, '0', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-06 12:33:11', '2026-11-06 12:33:12', NULL);
INSERT INTO `bookings` (`id`, `order_number`, `ticket_number`, `ticket_pdf_path`, `user_id`, `access_token_hash`, `tour_id`, `pricing_tier_id`, `first_name`, `middle_name`, `last_name`, `dial_code`, `country`, `destination_name`, `pickup_location`, `arrival_date`, `departure_date`, `duration_days`, `adults_count`, `children_count`, `infants_count`, `tour_types`, `tour_guide_required`, `preferred_language`, `vehicle_preference`, `airport_pickup`, `airport_drop`, `hotel_category`, `room_type`, `rooms_count`, `arrival_flight_train_number`, `arrival_time`, `departure_flight_train_number`, `departure_time`, `approximate_budget`, `budget_currency`, `passport_file_url`, `flight_ticket_url`, `preferred_contact_methods`, `special_requests`, `booking_date`, `tickets_count`, `unit_price`, `subtotal`, `tax_amount`, `discount_amount`, `total_price`, `agreed_price`, `advance_amount`, `balance_amount`, `payment_discussion_notes`, `approved_at`, `confirmed_at`, `confirmed_by`, `approved_by`, `currency`, `booking_status`, `payment_method`, `payment_status`, `customer_email_status`, `sms_status`, `sms_sent_at`, `last_sms_error`, `customer_email_sent_at`, `admin_email_status`, `admin_email_sent_at`, `email_send_count`, `last_email_attempt_at`, `last_email_error`, `customer_notes`, `preferred_session`, `experience_level`, `additional_details`, `admin_notes`, `created_at`, `updated_at`, `deleted_at`) VALUES ('69', 'WSI-20261106-32F4', NULL, NULL, NULL, '58b2d8f8e716eb3d09539208d2f1f64a0b2679a1fa649d1411c557018f28d725', '138', NULL, 'John', NULL, 'Doe', '+91', 'India', NULL, NULL, '2026-11-13', NULL, NULL, '2', '0', '0', NULL, '0', NULL, NULL, '0', '0', NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, 'INR', NULL, NULL, NULL, 'Vegetarian meals', '2026-11-13', '2', '5000.00', '10000.00', '0.00', '0.00', '10000.00', NULL, '0.00', '10000.00', NULL, NULL, NULL, NULL, NULL, 'INR', 'rejected', 'upi', 'pending', 'pending', 'pending', NULL, NULL, NULL, 'pending', NULL, '0', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-06 12:33:12', '2026-11-06 12:33:12', NULL);
INSERT INTO `bookings` (`id`, `order_number`, `ticket_number`, `ticket_pdf_path`, `user_id`, `access_token_hash`, `tour_id`, `pricing_tier_id`, `first_name`, `middle_name`, `last_name`, `dial_code`, `country`, `destination_name`, `pickup_location`, `arrival_date`, `departure_date`, `duration_days`, `adults_count`, `children_count`, `infants_count`, `tour_types`, `tour_guide_required`, `preferred_language`, `vehicle_preference`, `airport_pickup`, `airport_drop`, `hotel_category`, `room_type`, `rooms_count`, `arrival_flight_train_number`, `arrival_time`, `departure_flight_train_number`, `departure_time`, `approximate_budget`, `budget_currency`, `passport_file_url`, `flight_ticket_url`, `preferred_contact_methods`, `special_requests`, `booking_date`, `tickets_count`, `unit_price`, `subtotal`, `tax_amount`, `discount_amount`, `total_price`, `agreed_price`, `advance_amount`, `balance_amount`, `payment_discussion_notes`, `approved_at`, `confirmed_at`, `confirmed_by`, `approved_by`, `currency`, `booking_status`, `payment_method`, `payment_status`, `customer_email_status`, `sms_status`, `sms_sent_at`, `last_sms_error`, `customer_email_sent_at`, `admin_email_status`, `admin_email_sent_at`, `email_send_count`, `last_email_attempt_at`, `last_email_error`, `customer_notes`, `preferred_session`, `experience_level`, `additional_details`, `admin_notes`, `created_at`, `updated_at`, `deleted_at`) VALUES ('70', 'WSI-20261111-84CF', NULL, NULL, NULL, 'a26301fdd2ab4e5804d7c127ad16136594c54e21580bb57cd0c7bca8b4006ebe', '152', NULL, 'karthika', NULL, 'ganesan', '+91', 'India', 'Tamil Nadu', 'airport', '2026-11-12', NULL, '1 Day (12 Hours)', '2', '0', '0', '[\"Sightseeing\"]', '1', 'English', 'Tempo Traveller (12/14/17 Seater)', '1', '1', 'Budget / Homestay', 'Double Room', '1', NULL, NULL, NULL, NULL, NULL, 'USD', NULL, NULL, '[\"Email\"]', NULL, '2026-11-12', '2', '65.00', '130.00', '0.00', '0.00', '130.00', NULL, '0.00', '130.00', NULL, NULL, NULL, NULL, NULL, 'USD', 'pending', 'pay_on_arrival', 'pending', 'sent', 'pending', NULL, NULL, '2026-11-11 10:39:54', 'sent', '2026-11-11 10:39:54', '1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-11 10:39:44', '2026-11-11 10:39:54', NULL);
INSERT INTO `bookings` (`id`, `order_number`, `ticket_number`, `ticket_pdf_path`, `user_id`, `access_token_hash`, `tour_id`, `pricing_tier_id`, `first_name`, `middle_name`, `last_name`, `dial_code`, `country`, `destination_name`, `pickup_location`, `arrival_date`, `departure_date`, `duration_days`, `adults_count`, `children_count`, `infants_count`, `tour_types`, `tour_guide_required`, `preferred_language`, `vehicle_preference`, `airport_pickup`, `airport_drop`, `hotel_category`, `room_type`, `rooms_count`, `arrival_flight_train_number`, `arrival_time`, `departure_flight_train_number`, `departure_time`, `approximate_budget`, `budget_currency`, `passport_file_url`, `flight_ticket_url`, `preferred_contact_methods`, `special_requests`, `booking_date`, `tickets_count`, `unit_price`, `subtotal`, `tax_amount`, `discount_amount`, `total_price`, `agreed_price`, `advance_amount`, `balance_amount`, `payment_discussion_notes`, `approved_at`, `confirmed_at`, `confirmed_by`, `approved_by`, `currency`, `booking_status`, `payment_method`, `payment_status`, `customer_email_status`, `sms_status`, `sms_sent_at`, `last_sms_error`, `customer_email_sent_at`, `admin_email_status`, `admin_email_sent_at`, `email_send_count`, `last_email_attempt_at`, `last_email_error`, `customer_notes`, `preferred_session`, `experience_level`, `additional_details`, `admin_notes`, `created_at`, `updated_at`, `deleted_at`) VALUES ('71', 'WSI-20261113-8C4A', NULL, NULL, NULL, '8716df6186f0fc697d61db9e7f1a63dc12b1405f8c76d6df086bbdfef5045716', '138', NULL, 'karthika', NULL, 'ganesan', '+91', 'India', 'Goa', 'chennai airport', '2026-11-14', NULL, '5 Days', '2', '0', '0', NULL, '0', NULL, NULL, '0', '0', NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, 'USD', NULL, NULL, NULL, NULL, '2026-11-14', '2', '749.00', '1498.00', '0.00', '0.00', '1498.00', NULL, '0.00', '1498.00', NULL, NULL, NULL, NULL, NULL, 'USD', 'pending', 'pay_on_arrival', 'pending', 'sent', 'pending', NULL, NULL, '2026-11-13 13:19:32', 'sent', '2026-11-13 13:19:32', '1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-13 13:19:22', '2026-11-13 13:19:32', NULL);
INSERT INTO `bookings` (`id`, `order_number`, `ticket_number`, `ticket_pdf_path`, `user_id`, `access_token_hash`, `tour_id`, `pricing_tier_id`, `first_name`, `middle_name`, `last_name`, `dial_code`, `country`, `destination_name`, `pickup_location`, `arrival_date`, `departure_date`, `duration_days`, `adults_count`, `children_count`, `infants_count`, `tour_types`, `tour_guide_required`, `preferred_language`, `vehicle_preference`, `airport_pickup`, `airport_drop`, `hotel_category`, `room_type`, `rooms_count`, `arrival_flight_train_number`, `arrival_time`, `departure_flight_train_number`, `departure_time`, `approximate_budget`, `budget_currency`, `passport_file_url`, `flight_ticket_url`, `preferred_contact_methods`, `special_requests`, `booking_date`, `tickets_count`, `unit_price`, `subtotal`, `tax_amount`, `discount_amount`, `total_price`, `agreed_price`, `advance_amount`, `balance_amount`, `payment_discussion_notes`, `approved_at`, `confirmed_at`, `confirmed_by`, `approved_by`, `currency`, `booking_status`, `payment_method`, `payment_status`, `customer_email_status`, `sms_status`, `sms_sent_at`, `last_sms_error`, `customer_email_sent_at`, `admin_email_status`, `admin_email_sent_at`, `email_send_count`, `last_email_attempt_at`, `last_email_error`, `customer_notes`, `preferred_session`, `experience_level`, `additional_details`, `admin_notes`, `created_at`, `updated_at`, `deleted_at`) VALUES ('72', 'WSI-20261113-8D53', 'TKT-20261113-F58F', 'E:\\TramaxTours\\backend/storage/receipts/WSI-20261113-8D53.pdf', NULL, 'bd738585090b677107d4679d49ac141f679bcfce101add6cb57e713613bbb200', '138', NULL, 'Karthika', NULL, 'Ganesan', '+91', 'India', NULL, NULL, '2026-11-20', NULL, NULL, '2', '0', '0', NULL, '0', NULL, NULL, '0', '0', NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, 'INR', NULL, NULL, NULL, NULL, '2026-11-20', '2', '5000.00', '10000.00', '0.00', '0.00', '9500.00', '9500.00', '3000.00', '6500.00', 'Agreed on discounted ₹9,500 package rate. Customer will send ₹3,000 via GPay advance and balance ₹6,500 at arrival.', '2026-11-13 19:34:38', '2026-11-13 19:34:38', '1', '1', 'INR', 'confirmed', 'upi', 'pending', 'pending', 'pending', NULL, NULL, NULL, 'pending', NULL, '0', NULL, NULL, 'Looking forward to our holiday in Tamil Nadu', NULL, NULL, NULL, NULL, '2026-11-13 19:34:38', '2026-11-13 19:34:41', NULL);
INSERT INTO `bookings` (`id`, `order_number`, `ticket_number`, `ticket_pdf_path`, `user_id`, `access_token_hash`, `tour_id`, `pricing_tier_id`, `first_name`, `middle_name`, `last_name`, `dial_code`, `country`, `destination_name`, `pickup_location`, `arrival_date`, `departure_date`, `duration_days`, `adults_count`, `children_count`, `infants_count`, `tour_types`, `tour_guide_required`, `preferred_language`, `vehicle_preference`, `airport_pickup`, `airport_drop`, `hotel_category`, `room_type`, `rooms_count`, `arrival_flight_train_number`, `arrival_time`, `departure_flight_train_number`, `departure_time`, `approximate_budget`, `budget_currency`, `passport_file_url`, `flight_ticket_url`, `preferred_contact_methods`, `special_requests`, `booking_date`, `tickets_count`, `unit_price`, `subtotal`, `tax_amount`, `discount_amount`, `total_price`, `agreed_price`, `advance_amount`, `balance_amount`, `payment_discussion_notes`, `approved_at`, `confirmed_at`, `confirmed_by`, `approved_by`, `currency`, `booking_status`, `payment_method`, `payment_status`, `customer_email_status`, `sms_status`, `sms_sent_at`, `last_sms_error`, `customer_email_sent_at`, `admin_email_status`, `admin_email_sent_at`, `email_send_count`, `last_email_attempt_at`, `last_email_error`, `customer_notes`, `preferred_session`, `experience_level`, `additional_details`, `admin_notes`, `created_at`, `updated_at`, `deleted_at`) VALUES ('73', 'WSI-20261113-F7EB', 'TKT-20261113-7B3E', 'E:\\TramaxTours\\backend/storage/receipts/WSI-20261113-F7EB.pdf', NULL, 'c870fecd5752607ff172a9f25316670f83f7113c705df8b596c16cc47c8e0a84', '138', NULL, 'Karthika', NULL, 'Ganesan', '+91', 'India', NULL, NULL, '2026-11-20', NULL, NULL, '2', '0', '0', NULL, '0', NULL, NULL, '0', '0', NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, 'INR', NULL, NULL, NULL, NULL, '2026-11-20', '2', '5000.00', '10000.00', '0.00', '0.00', '9500.00', '9500.00', '3000.00', '6500.00', 'Agreed on discounted ₹9,500 package rate. Customer will send ₹3,000 via GPay advance and balance ₹6,500 at arrival.', '2026-11-13 19:39:29', '2026-11-13 19:39:29', '1', '1', 'INR', 'confirmed', 'upi', 'pending', 'pending', 'pending', NULL, NULL, NULL, 'pending', NULL, '0', NULL, NULL, 'Looking forward to our holiday in Tamil Nadu', NULL, NULL, NULL, NULL, '2026-11-13 19:39:29', '2026-11-13 19:39:30', NULL);

-- -----------------------------------------------------
-- Table structure for `cms_sections`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `cms_sections`;
CREATE TABLE `cms_sections` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `section_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtitle` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci,
  `media_id` bigint unsigned DEFAULT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `section_key` (`section_key`),
  KEY `idx_cms_sections_key` (`section_key`),
  KEY `idx_cms_sections_status` (`status`),
  KEY `fk_cms_sections_media` (`media_id`),
  KEY `idx_cms_sections_deleted_at` (`deleted_at`),
  KEY `fk_cms_sections_deleted_by` (`deleted_by`),
  CONSTRAINT `fk_cms_sections_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_cms_sections_media` FOREIGN KEY (`media_id`) REFERENCES `media` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `cms_sections`
INSERT INTO `cms_sections` (`id`, `section_key`, `title`, `subtitle`, `content`, `media_id`, `display_order`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('22', 'home_places_to_explore', 'Places To Explore — Diverse, Spell-Binding India', 'India’s languages, religions, dance, music, architecture, food, and customs differ wonderfully across every state. A spell-binding country where people of unlike communities live together in oneness.', 'India contains majestic peaks dusted with glistening snow, sun-drenched beaches, ancient hand-carved temples, and sprawling cities rich with history. The southern part of the country, surrounded by the Arabian Sea and the Bay of Bengal, is listed among the most picturesque destinations on Earth.', '317', '1', 'inactive', NULL, NULL, '2026-09-28 11:03:10', '2026-11-06 12:55:56');
INSERT INTO `cms_sections` (`id`, `section_key`, `title`, `subtitle`, `content`, `media_id`, `display_order`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('23', 'home_things_to_do', 'Things To Do — Handcrafted Travel Experiences', 'Whether planning a family vacation, religious and cultural pilgrimage, wildlife safari, or romantic getaway, India offers an astonishing variety of activities.', 'Browse through our curated attraction categories — from Escorted City Tours and Classical Art & Dance Shows, to National Park Wildlife Safaris, Spice Plantation Walks, and Beachside Dining across South India.', '450', '2', 'inactive', NULL, NULL, '2026-09-28 11:03:10', '2026-11-06 12:56:22');
INSERT INTO `cms_sections` (`id`, `section_key`, `title`, `subtitle`, `content`, `media_id`, `display_order`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('24', 'home_why_travel_with_us', 'Why Travel With Wonderer South India', 'We believe that planning the details of your trip should be as enjoyable and effortless as the journey itself.', 'With 24/7 dedicated support, certified local tour guides, tailored private itineraries, and guaranteed transparent pricing, we deliver world-class travel across South India.', '261', '3', 'inactive', NULL, NULL, '2026-09-28 11:03:10', '2026-11-06 12:56:10');

-- -----------------------------------------------------
-- Table structure for `contact_messages`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `contact_messages`;
CREATE TABLE `contact_messages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `reference_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('trip_request','general_inquiry') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'trip_request',
  `access_token` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `whatsapp_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `tour_id` bigint unsigned DEFAULT NULL,
  `destination_id` bigint unsigned DEFAULT NULL,
  `travel_date` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `arrival_date` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `departure_date` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration_days` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `travelers` int unsigned DEFAULT '1',
  `adults_count` int unsigned DEFAULT '2',
  `children_count` int unsigned DEFAULT '0',
  `infants_count` int unsigned DEFAULT '0',
  `vehicle_preference` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `airport_pickup` tinyint(1) DEFAULT '0',
  `airport_drop` tinyint(1) DEFAULT '0',
  `hotel_category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rooms_count` int unsigned DEFAULT '1',
  `room_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tour_types` text COLLATE utf8mb4_unicode_ci,
  `destination_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pickup_location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tour_title` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_medical_trip` tinyint(1) DEFAULT '0',
  `medical_trip_id` int unsigned DEFAULT NULL,
  `status` enum('new','contacted','planning','quotation_sent','confirmed','closed','cancelled','read','replied','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'new',
  `admin_notes` text COLLATE utf8mb4_unicode_ci,
  `quotation_amount` decimal(12,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tour_guide_required` tinyint(1) DEFAULT '0',
  `preferred_language` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'English',
  `arrival_flight_train_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `arrival_time` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `departure_flight_train_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `departure_time` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approximate_budget` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `budget_currency` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'INR',
  `passport_file_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `flight_ticket_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `preferred_contact_methods` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_cm_status` (`status`),
  KEY `idx_cm_email` (`email`),
  KEY `idx_cm_tour` (`tour_id`),
  KEY `idx_cm_dest` (`destination_id`),
  KEY `idx_cm_created_at` (`created_at`),
  CONSTRAINT `fk_cm_dest` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_cm_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `contact_messages`
INSERT INTO `contact_messages` (`id`, `reference_id`, `type`, `access_token`, `name`, `email`, `country`, `phone`, `whatsapp_number`, `subject`, `message`, `tour_id`, `destination_id`, `travel_date`, `arrival_date`, `departure_date`, `duration_days`, `travelers`, `adults_count`, `children_count`, `infants_count`, `vehicle_preference`, `airport_pickup`, `airport_drop`, `hotel_category`, `rooms_count`, `room_type`, `tour_types`, `destination_name`, `pickup_location`, `tour_title`, `is_medical_trip`, `medical_trip_id`, `status`, `admin_notes`, `quotation_amount`, `created_at`, `updated_at`, `tour_guide_required`, `preferred_language`, `arrival_flight_train_number`, `arrival_time`, `departure_flight_train_number`, `departure_time`, `approximate_budget`, `budget_currency`, `passport_file_url`, `flight_ticket_url`, `preferred_contact_methods`) VALUES ('2', 'TRP-2026-000002', 'trip_request', '2da3464ed1d0bf5060f5720876292295', 'Alexander Becker', 'a.becker@berlin-travel.de', NULL, '+49 170 1234567', NULL, 'Kerala Backwaters & Munnar Honeymoon', 'We would like a luxury 7-day private package with 1 night houseboat stay in Alleppey and 2 nights in Munnar with English chauffeur.', NULL, NULL, '2026-11-01', NULL, NULL, NULL, '2', '2', '0', '0', NULL, '0', '0', NULL, '1', NULL, NULL, 'Kerala', NULL, NULL, '0', NULL, 'contacted', NULL, NULL, '2026-09-29 13:58:27', '2026-10-30 17:36:15', '0', 'English', NULL, NULL, NULL, NULL, NULL, 'INR', NULL, NULL, NULL);
INSERT INTO `contact_messages` (`id`, `reference_id`, `type`, `access_token`, `name`, `email`, `country`, `phone`, `whatsapp_number`, `subject`, `message`, `tour_id`, `destination_id`, `travel_date`, `arrival_date`, `departure_date`, `duration_days`, `travelers`, `adults_count`, `children_count`, `infants_count`, `vehicle_preference`, `airport_pickup`, `airport_drop`, `hotel_category`, `rooms_count`, `room_type`, `tour_types`, `destination_name`, `pickup_location`, `tour_title`, `is_medical_trip`, `medical_trip_id`, `status`, `admin_notes`, `quotation_amount`, `created_at`, `updated_at`, `tour_guide_required`, `preferred_language`, `arrival_flight_train_number`, `arrival_time`, `departure_flight_train_number`, `departure_time`, `approximate_budget`, `budget_currency`, `passport_file_url`, `flight_ticket_url`, `preferred_contact_methods`) VALUES ('3', 'TRP-2026-000003', 'trip_request', '1a35086af3bc59c67c768661208aca7b', 'Priya Sharma', 'priya@test.com', NULL, '+91 98401 22334', NULL, 'Website Travel Inquiry', 'I want to book a customized Kerala tour for 3 people in December.', NULL, NULL, '2026-12-10', NULL, NULL, NULL, '3', '2', '0', '0', NULL, '0', '0', NULL, '1', NULL, NULL, 'Kerala', NULL, NULL, '0', NULL, 'new', NULL, NULL, '2026-09-29 14:04:13', '2026-10-30 17:36:15', '0', 'English', NULL, NULL, NULL, NULL, NULL, 'INR', NULL, NULL, NULL);
INSERT INTO `contact_messages` (`id`, `reference_id`, `type`, `access_token`, `name`, `email`, `country`, `phone`, `whatsapp_number`, `subject`, `message`, `tour_id`, `destination_id`, `travel_date`, `arrival_date`, `departure_date`, `duration_days`, `travelers`, `adults_count`, `children_count`, `infants_count`, `vehicle_preference`, `airport_pickup`, `airport_drop`, `hotel_category`, `rooms_count`, `room_type`, `tour_types`, `destination_name`, `pickup_location`, `tour_title`, `is_medical_trip`, `medical_trip_id`, `status`, `admin_notes`, `quotation_amount`, `created_at`, `updated_at`, `tour_guide_required`, `preferred_language`, `arrival_flight_train_number`, `arrival_time`, `departure_flight_train_number`, `departure_time`, `approximate_budget`, `budget_currency`, `passport_file_url`, `flight_ticket_url`, `preferred_contact_methods`) VALUES ('4', 'TRP-2026-000004', 'trip_request', 'fd67b9cafef985e67f07c29320468bee', 'Priya Sharma', 'priya@test.com', NULL, '+91 98401 22334', NULL, 'Website Travel Inquiry', 'I want to book a customized Kerala tour for 3 people in December.', NULL, NULL, '2026-12-10', NULL, NULL, NULL, '3', '2', '0', '0', NULL, '0', '0', NULL, '1', NULL, NULL, 'Kerala', NULL, NULL, '0', NULL, 'new', NULL, NULL, '2026-09-29 14:04:47', '2026-10-30 17:36:15', '0', 'English', NULL, NULL, NULL, NULL, NULL, 'INR', NULL, NULL, NULL);
INSERT INTO `contact_messages` (`id`, `reference_id`, `type`, `access_token`, `name`, `email`, `country`, `phone`, `whatsapp_number`, `subject`, `message`, `tour_id`, `destination_id`, `travel_date`, `arrival_date`, `departure_date`, `duration_days`, `travelers`, `adults_count`, `children_count`, `infants_count`, `vehicle_preference`, `airport_pickup`, `airport_drop`, `hotel_category`, `rooms_count`, `room_type`, `tour_types`, `destination_name`, `pickup_location`, `tour_title`, `is_medical_trip`, `medical_trip_id`, `status`, `admin_notes`, `quotation_amount`, `created_at`, `updated_at`, `tour_guide_required`, `preferred_language`, `arrival_flight_train_number`, `arrival_time`, `departure_flight_train_number`, `departure_time`, `approximate_budget`, `budget_currency`, `passport_file_url`, `flight_ticket_url`, `preferred_contact_methods`) VALUES ('5', 'TRP-2026-000005', 'trip_request', 'e5f0786e11f70364e5f61e5464dcf99f', 'Ramesh Kumar', 'ramesh.kumar@example.com', 'India', '+91 98401 23456', '+91 98401 23456', 'Custom South India Tour Itinerary Request', 'Please include a private luxury houseboat cruise in Alleppey.', NULL, NULL, '2026-10-15', '2026-10-15', '2026-10-20', '6 Days / 5 Nights', '1', '3', '1', '0', 'Innova Crysta', '1', '1', '4 Star', '2', 'Double', '[\"Sightseeing\",\"Hill Station & Tea Gardens\",\"Beach Holiday & Backwaters\"]', 'Munnar, Alleppey & Thekkady', 'Cochin International Airport', NULL, '0', NULL, 'new', NULL, NULL, '2026-09-30 11:00:43', '2026-10-30 17:36:15', '0', 'English', NULL, NULL, NULL, NULL, NULL, 'INR', NULL, NULL, NULL);
INSERT INTO `contact_messages` (`id`, `reference_id`, `type`, `access_token`, `name`, `email`, `country`, `phone`, `whatsapp_number`, `subject`, `message`, `tour_id`, `destination_id`, `travel_date`, `arrival_date`, `departure_date`, `duration_days`, `travelers`, `adults_count`, `children_count`, `infants_count`, `vehicle_preference`, `airport_pickup`, `airport_drop`, `hotel_category`, `rooms_count`, `room_type`, `tour_types`, `destination_name`, `pickup_location`, `tour_title`, `is_medical_trip`, `medical_trip_id`, `status`, `admin_notes`, `quotation_amount`, `created_at`, `updated_at`, `tour_guide_required`, `preferred_language`, `arrival_flight_train_number`, `arrival_time`, `departure_flight_train_number`, `departure_time`, `approximate_budget`, `budget_currency`, `passport_file_url`, `flight_ticket_url`, `preferred_contact_methods`) VALUES ('6', 'TRP-2026-000006', 'trip_request', '649584a73f08b966cafb7603a173a482', 'Sundar Pichai', 'sundar@google.com', 'United States', '+91 98409 88888', '+91 98409 88888', 'Custom South India Tour Itinerary Request', 'Need traditional VIP darshan assistance in Madurai Meenakshi Temple.', NULL, NULL, '2026-11-10', '2026-11-10', '2026-11-16', '7 Days / 6 Nights', '1', '4', '2', '1', 'Innova Crysta (Luxury 6/7 Seater)', '1', '1', '5 Star', '2', 'Family Suite', '[\"Sightseeing\",\"Cultural Tour\",\"Pilgrimage\",\"Beach Holiday\"]', 'Madurai, Rameshwaram, Kanyakumari', 'Madurai Airport', NULL, '0', NULL, 'new', NULL, NULL, '2026-09-30 16:03:44', '2026-10-30 17:36:15', '1', 'Tamil', '6E 7123', '10:30', 'AI 451', '18:45', '1,50,000', 'INR', 'passport_copy_sundar.pdf', 'indigo_ticket_7123.pdf', '[\"WhatsApp\",\"Phone Call\"]');
INSERT INTO `contact_messages` (`id`, `reference_id`, `type`, `access_token`, `name`, `email`, `country`, `phone`, `whatsapp_number`, `subject`, `message`, `tour_id`, `destination_id`, `travel_date`, `arrival_date`, `departure_date`, `duration_days`, `travelers`, `adults_count`, `children_count`, `infants_count`, `vehicle_preference`, `airport_pickup`, `airport_drop`, `hotel_category`, `rooms_count`, `room_type`, `tour_types`, `destination_name`, `pickup_location`, `tour_title`, `is_medical_trip`, `medical_trip_id`, `status`, `admin_notes`, `quotation_amount`, `created_at`, `updated_at`, `tour_guide_required`, `preferred_language`, `arrival_flight_train_number`, `arrival_time`, `departure_flight_train_number`, `departure_time`, `approximate_budget`, `budget_currency`, `passport_file_url`, `flight_ticket_url`, `preferred_contact_methods`) VALUES ('8', 'TRP-2026-000008', 'trip_request', 'e7adcfd963fcd54971d8de659ae92213', 'Jean-Luc Moreau', 'jeanluc.travel@example.com', NULL, '+33 6 12 34 56 78', '+33 6 12 34 56 78', 'Trip: Kerala Backwaters & Munnar Hills', 'Custom itinerary & quotation requested via Wonderer South India planner.', NULL, NULL, '2026-11-15', NULL, NULL, '8', '1', '2', '1', '0', NULL, '1', '0', '4 Star Deluxe Heritage', '1', 'Family Suite', NULL, 'Kerala Backwaters & Munnar Hills', NULL, NULL, '0', NULL, 'new', 'Standard quote prepared including 5-star houseboat and private French-speaking naturalist.', '215000.00', '2026-09-30 16:21:28', '2026-10-30 17:36:15', '1', 'French & English', 'AF-194 (Air France)', '14:30', 'AF-195 (Air France)', '18:45', '220000', 'INR', NULL, NULL, 'WhatsApp, Phone Call');
INSERT INTO `contact_messages` (`id`, `reference_id`, `type`, `access_token`, `name`, `email`, `country`, `phone`, `whatsapp_number`, `subject`, `message`, `tour_id`, `destination_id`, `travel_date`, `arrival_date`, `departure_date`, `duration_days`, `travelers`, `adults_count`, `children_count`, `infants_count`, `vehicle_preference`, `airport_pickup`, `airport_drop`, `hotel_category`, `rooms_count`, `room_type`, `tour_types`, `destination_name`, `pickup_location`, `tour_title`, `is_medical_trip`, `medical_trip_id`, `status`, `admin_notes`, `quotation_amount`, `created_at`, `updated_at`, `tour_guide_required`, `preferred_language`, `arrival_flight_train_number`, `arrival_time`, `departure_flight_train_number`, `departure_time`, `approximate_budget`, `budget_currency`, `passport_file_url`, `flight_ticket_url`, `preferred_contact_methods`) VALUES ('11', 'TRP-2026-000011', 'trip_request', 'a2658c27f66d5b9177709dede1fe58df', 'Elena Rostova', 'elena.rostova@example.com', 'Germany', '+49 151 2345678', '+49 151 2345678', 'Trip: Kerala & Tamil Nadu', 'Interested in Ayurveda wellness, tea gardens of Munnar, and backwaters of Alleppey.', NULL, NULL, '2026-11-10', '2026-11-10', '2026-11-18', '9 Days / 8 Nights', '1', '2', '1', '0', 'Innova Crysta', '1', '1', '4 Star', '1', 'Family', '[\"Cultural Tour\",\"Beach Holiday\"]', 'Kerala & Tamil Nadu', 'Cochin International Airport (COK)', NULL, '0', NULL, 'new', NULL, NULL, '2026-10-01 19:13:46', '2026-10-30 17:36:15', '1', 'German', NULL, NULL, NULL, NULL, '2500', 'EUR', NULL, NULL, '[\"WhatsApp\",\"Email\"]');
INSERT INTO `contact_messages` (`id`, `reference_id`, `type`, `access_token`, `name`, `email`, `country`, `phone`, `whatsapp_number`, `subject`, `message`, `tour_id`, `destination_id`, `travel_date`, `arrival_date`, `departure_date`, `duration_days`, `travelers`, `adults_count`, `children_count`, `infants_count`, `vehicle_preference`, `airport_pickup`, `airport_drop`, `hotel_category`, `rooms_count`, `room_type`, `tour_types`, `destination_name`, `pickup_location`, `tour_title`, `is_medical_trip`, `medical_trip_id`, `status`, `admin_notes`, `quotation_amount`, `created_at`, `updated_at`, `tour_guide_required`, `preferred_language`, `arrival_flight_train_number`, `arrival_time`, `departure_flight_train_number`, `departure_time`, `approximate_budget`, `budget_currency`, `passport_file_url`, `flight_ticket_url`, `preferred_contact_methods`) VALUES ('12', 'TRP-2026-000012', 'trip_request', 'c570cf87cd3c03055aa7c138bd0f3446', 'Dr. Rajesh Sharma', 'rajesh.sharma@example.com', 'India', '+91 9876543210', '+91 9876543210', 'Trip: Kerala Backwaters & Munnar', 'Please arrange a private houseboat in Alleppey and spice plantation tour in Munnar.', NULL, NULL, '2026-11-15', '2026-11-15', '2026-11-22', '7', '1', '2', '1', '0', NULL, '1', '1', '4 Star', '1', 'Double', NULL, 'Kerala Backwaters & Munnar', 'Kochi Airport (COK)', NULL, '0', NULL, 'new', NULL, NULL, '2026-10-01 19:46:44', '2026-10-30 17:36:15', '0', 'English', NULL, NULL, NULL, NULL, NULL, 'INR', NULL, NULL, NULL);
INSERT INTO `contact_messages` (`id`, `reference_id`, `type`, `access_token`, `name`, `email`, `country`, `phone`, `whatsapp_number`, `subject`, `message`, `tour_id`, `destination_id`, `travel_date`, `arrival_date`, `departure_date`, `duration_days`, `travelers`, `adults_count`, `children_count`, `infants_count`, `vehicle_preference`, `airport_pickup`, `airport_drop`, `hotel_category`, `rooms_count`, `room_type`, `tour_types`, `destination_name`, `pickup_location`, `tour_title`, `is_medical_trip`, `medical_trip_id`, `status`, `admin_notes`, `quotation_amount`, `created_at`, `updated_at`, `tour_guide_required`, `preferred_language`, `arrival_flight_train_number`, `arrival_time`, `departure_flight_train_number`, `departure_time`, `approximate_budget`, `budget_currency`, `passport_file_url`, `flight_ticket_url`, `preferred_contact_methods`) VALUES ('13', 'TRP-2026-000013', 'trip_request', '8d76d944e3cea2e55c61b6dfe99ae37b', 'Dr. Rajesh Sharma', 'rajesh.sharma@example.com', 'India', '+91 9876543210', '+91 9876543210', 'Trip: Kerala Backwaters & Munnar', 'Please arrange a private houseboat in Alleppey and spice plantation tour in Munnar.', NULL, NULL, '2026-11-15', '2026-11-15', '2026-11-22', '7', '1', '2', '1', '0', NULL, '1', '1', '4 Star', '1', 'Double', NULL, 'Kerala Backwaters & Munnar', 'Kochi Airport (COK)', NULL, '0', NULL, 'new', NULL, NULL, '2026-10-01 19:48:08', '2026-10-30 17:36:15', '0', 'English', NULL, NULL, NULL, NULL, NULL, 'INR', NULL, NULL, NULL);
INSERT INTO `contact_messages` (`id`, `reference_id`, `type`, `access_token`, `name`, `email`, `country`, `phone`, `whatsapp_number`, `subject`, `message`, `tour_id`, `destination_id`, `travel_date`, `arrival_date`, `departure_date`, `duration_days`, `travelers`, `adults_count`, `children_count`, `infants_count`, `vehicle_preference`, `airport_pickup`, `airport_drop`, `hotel_category`, `rooms_count`, `room_type`, `tour_types`, `destination_name`, `pickup_location`, `tour_title`, `is_medical_trip`, `medical_trip_id`, `status`, `admin_notes`, `quotation_amount`, `created_at`, `updated_at`, `tour_guide_required`, `preferred_language`, `arrival_flight_train_number`, `arrival_time`, `departure_flight_train_number`, `departure_time`, `approximate_budget`, `budget_currency`, `passport_file_url`, `flight_ticket_url`, `preferred_contact_methods`) VALUES ('14', 'TRP-2026-000014', 'trip_request', '56f820c289bc6b90e092720e3d4fa6f3', 'Eleanor Vance', 'eleanor.vance@example.com', 'United Kingdom', '+44 7911 123456', '+44 7911 123456', 'Trip: Tamil Nadu & Kerala Heritage', 'Need experienced driver and English speaking temple guides in Madurai and Thanjavur.', NULL, NULL, '2026-12-01', '2026-12-01', '2026-12-10', '9', '1', '2', '0', '0', NULL, '1', '1', '5 Star', '1', 'Double', NULL, 'Tamil Nadu & Kerala Heritage', 'Chennai International Airport (MAA)', NULL, '0', NULL, 'new', NULL, NULL, '2026-10-01 20:09:46', '2026-10-30 17:36:15', '0', 'English', NULL, NULL, NULL, NULL, NULL, 'GBP', NULL, NULL, NULL);
INSERT INTO `contact_messages` (`id`, `reference_id`, `type`, `access_token`, `name`, `email`, `country`, `phone`, `whatsapp_number`, `subject`, `message`, `tour_id`, `destination_id`, `travel_date`, `arrival_date`, `departure_date`, `duration_days`, `travelers`, `adults_count`, `children_count`, `infants_count`, `vehicle_preference`, `airport_pickup`, `airport_drop`, `hotel_category`, `rooms_count`, `room_type`, `tour_types`, `destination_name`, `pickup_location`, `tour_title`, `is_medical_trip`, `medical_trip_id`, `status`, `admin_notes`, `quotation_amount`, `created_at`, `updated_at`, `tour_guide_required`, `preferred_language`, `arrival_flight_train_number`, `arrival_time`, `departure_flight_train_number`, `departure_time`, `approximate_budget`, `budget_currency`, `passport_file_url`, `flight_ticket_url`, `preferred_contact_methods`) VALUES ('15', 'MED-TEST-002', 'trip_request', NULL, 'Lord Robert Grantham', 'robert@downton.co.uk', NULL, '+44 7933 111222', '+44 7933 111222', 'Medical Trip Booking: APEX Comprehensive Health Check', 'Cardiac DEXA and full body MRI check requested.', NULL, NULL, '2026-12-05', NULL, NULL, NULL, '1', '2', '0', '0', NULL, '0', '0', NULL, '1', NULL, NULL, NULL, NULL, 'APEX Comprehensive Health Check', '1', '1', 'new', NULL, NULL, '2026-10-30 17:39:27', '2026-10-30 17:39:27', '0', 'English', NULL, NULL, NULL, NULL, NULL, 'INR', NULL, NULL, NULL);
INSERT INTO `contact_messages` (`id`, `reference_id`, `type`, `access_token`, `name`, `email`, `country`, `phone`, `whatsapp_number`, `subject`, `message`, `tour_id`, `destination_id`, `travel_date`, `arrival_date`, `departure_date`, `duration_days`, `travelers`, `adults_count`, `children_count`, `infants_count`, `vehicle_preference`, `airport_pickup`, `airport_drop`, `hotel_category`, `rooms_count`, `room_type`, `tour_types`, `destination_name`, `pickup_location`, `tour_title`, `is_medical_trip`, `medical_trip_id`, `status`, `admin_notes`, `quotation_amount`, `created_at`, `updated_at`, `tour_guide_required`, `preferred_language`, `arrival_flight_train_number`, `arrival_time`, `departure_flight_train_number`, `departure_time`, `approximate_budget`, `budget_currency`, `passport_file_url`, `flight_ticket_url`, `preferred_contact_methods`) VALUES ('16', 'MED-2026-58FA0E', 'trip_request', NULL, 'Dr. Evelyn Brand', 'brand@interstellar-astro.org', NULL, '+1 202 555 0199', '+1 202 555 0199', 'Medical Trip Booking: APEX Comprehensive Health Check', 'Comprehensive MRI and cardiovascular fitness assessment for 2.', NULL, NULL, '2026-11-28', NULL, NULL, NULL, '2', '2', '0', '0', NULL, '0', '0', NULL, '1', NULL, NULL, NULL, NULL, 'APEX Comprehensive Health Check', '1', '1', 'new', NULL, NULL, '2026-10-30 17:40:22', '2026-10-30 17:40:22', '0', 'English', NULL, NULL, NULL, NULL, NULL, 'INR', NULL, NULL, NULL);
INSERT INTO `contact_messages` (`id`, `reference_id`, `type`, `access_token`, `name`, `email`, `country`, `phone`, `whatsapp_number`, `subject`, `message`, `tour_id`, `destination_id`, `travel_date`, `arrival_date`, `departure_date`, `duration_days`, `travelers`, `adults_count`, `children_count`, `infants_count`, `vehicle_preference`, `airport_pickup`, `airport_drop`, `hotel_category`, `rooms_count`, `room_type`, `tour_types`, `destination_name`, `pickup_location`, `tour_title`, `is_medical_trip`, `medical_trip_id`, `status`, `admin_notes`, `quotation_amount`, `created_at`, `updated_at`, `tour_guide_required`, `preferred_language`, `arrival_flight_train_number`, `arrival_time`, `departure_flight_train_number`, `departure_time`, `approximate_budget`, `budget_currency`, `passport_file_url`, `flight_ticket_url`, `preferred_contact_methods`) VALUES ('17', 'MED-2026-9E3744', 'trip_request', NULL, 'karthika', 'ganesankarthika2005@gmail.com', NULL, '6374036592', '6374036592', 'Medical Trip Booking: APEX Comprehensive Health Check', '', NULL, NULL, '2026-11-07', NULL, NULL, NULL, '1', '2', '0', '0', NULL, '0', '0', NULL, '1', NULL, NULL, NULL, NULL, 'APEX Comprehensive Health Check', '1', '1', 'new', NULL, NULL, '2026-11-06 10:42:34', '2026-11-06 10:42:34', '0', 'English', NULL, NULL, NULL, NULL, NULL, 'INR', NULL, NULL, NULL);
INSERT INTO `contact_messages` (`id`, `reference_id`, `type`, `access_token`, `name`, `email`, `country`, `phone`, `whatsapp_number`, `subject`, `message`, `tour_id`, `destination_id`, `travel_date`, `arrival_date`, `departure_date`, `duration_days`, `travelers`, `adults_count`, `children_count`, `infants_count`, `vehicle_preference`, `airport_pickup`, `airport_drop`, `hotel_category`, `rooms_count`, `room_type`, `tour_types`, `destination_name`, `pickup_location`, `tour_title`, `is_medical_trip`, `medical_trip_id`, `status`, `admin_notes`, `quotation_amount`, `created_at`, `updated_at`, `tour_guide_required`, `preferred_language`, `arrival_flight_train_number`, `arrival_time`, `departure_flight_train_number`, `departure_time`, `approximate_budget`, `budget_currency`, `passport_file_url`, `flight_ticket_url`, `preferred_contact_methods`) VALUES ('18', 'PLH-2026-9D7696', 'trip_request', NULL, '', 'alex.weber@example.com', 'Germany', '+49 170 1234567', '+49 170 1234567', 'Palm Leaf Horoscope Request:  (PLH-2026-9D7696)', 'Looking for complete life chapter reading and spiritual guidance.', NULL, NULL, '2026-11-20', NULL, NULL, NULL, '1', '2', '0', '0', NULL, '0', '0', NULL, '1', NULL, NULL, NULL, NULL, 'Palm Leaf Horoscope (Find Your Destiny)', '0', NULL, 'new', NULL, NULL, '2026-11-06 15:35:40', '2026-11-06 15:35:40', '0', 'English', NULL, NULL, NULL, NULL, NULL, 'INR', NULL, NULL, NULL);
INSERT INTO `contact_messages` (`id`, `reference_id`, `type`, `access_token`, `name`, `email`, `country`, `phone`, `whatsapp_number`, `subject`, `message`, `tour_id`, `destination_id`, `travel_date`, `arrival_date`, `departure_date`, `duration_days`, `travelers`, `adults_count`, `children_count`, `infants_count`, `vehicle_preference`, `airport_pickup`, `airport_drop`, `hotel_category`, `rooms_count`, `room_type`, `tour_types`, `destination_name`, `pickup_location`, `tour_title`, `is_medical_trip`, `medical_trip_id`, `status`, `admin_notes`, `quotation_amount`, `created_at`, `updated_at`, `tour_guide_required`, `preferred_language`, `arrival_flight_train_number`, `arrival_time`, `departure_flight_train_number`, `departure_time`, `approximate_budget`, `budget_currency`, `passport_file_url`, `flight_ticket_url`, `preferred_contact_methods`) VALUES ('19', 'MED-2026-719ABE', 'trip_request', NULL, 'mkarthika', 'mkarthika3568@gmail.com', NULL, '6374036582', '6374036582', 'Medical Trip Booking: APEX Comprehensive Health Check', '', NULL, NULL, '2026-11-14', NULL, NULL, NULL, '1', '2', '0', '0', NULL, '0', '0', NULL, '1', NULL, NULL, NULL, NULL, 'APEX Comprehensive Health Check', '1', '1', 'new', NULL, NULL, '2026-11-13 13:17:42', '2026-11-13 13:17:42', '0', 'English', NULL, NULL, NULL, NULL, NULL, 'INR', NULL, NULL, NULL);

-- -----------------------------------------------------
-- Table structure for `destination_faqs`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `destination_faqs`;
CREATE TABLE `destination_faqs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `destination_id` bigint unsigned NOT NULL,
  `question` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  `status` enum('published','draft') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_dest_faqs_dest` (`destination_id`),
  KEY `idx_dest_faqs_order` (`display_order`),
  KEY `idx_dest_faqs_status` (`status`),
  CONSTRAINT `fk_dest_faqs_dest` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `destination_faqs`
INSERT INTO `destination_faqs` (`id`, `destination_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('1', '123', 'Best Time to Visit Chennai & Tamil Nadu', 'Tamil Nadu can be explored throughout the year, but the most pleasant season is from October to March, when the climate is ideal for temple visits, heritage walks, hill stations, and coastal sightseeing.', '1', 'published', '2026-09-28 20:53:23', '2026-09-28 20:53:23');
INSERT INTO `destination_faqs` (`id`, `destination_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('2', '123', 'Comfortable Private Sightseeing', 'Discover Tamil Nadu in comfort with private, air-conditioned transportation and a dedicated chauffeur guide, allowing flexible itineraries across cities, temples, hill stations, and coastal destinations at your own pace.', '2', 'published', '2026-09-28 20:53:23', '2026-09-28 20:53:23');
INSERT INTO `destination_faqs` (`id`, `destination_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('3', '123', 'Cultural & Heritage Experiences', 'Experience the soul of South India through ancient temples, UNESCO heritage sites, classical arts, traditional villages, spiritual centers, and vibrant local festivals that reflect Tamil Nadu’s timeless identity.', '3', 'published', '2026-09-28 20:53:23', '2026-09-28 20:53:23');
INSERT INTO `destination_faqs` (`id`, `destination_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('4', '123', 'Flexible Tour Across All Seasons', 'Tamil Nadu tours are available year-round, with itineraries customized to suit seasonal conditions, festival calendars, and traveler preferences—perfect for families, pilgrims, culture lovers, and explorers alike.', '4', 'published', '2026-09-28 20:53:23', '2026-09-28 20:53:23');
INSERT INTO `destination_faqs` (`id`, `destination_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('5', '122', 'Best Time to Visit Kerala', 'The ideal season to explore Kerala is between September and March for cool pleasant backwater cruises, and June to August for authentic monsoon Ayurvedic wellness therapies.', '1', 'published', '2026-09-28 20:53:23', '2026-09-28 20:53:23');
INSERT INTO `destination_faqs` (`id`, `destination_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('6', '122', 'Private Houseboat & Chauffeur Safaris', 'Sail along serene backwaters in luxury air-conditioned houseboats with private chef and dedicated guide, complemented by private transfers across tea estates and coastal sanctuaries.', '2', 'published', '2026-09-28 20:53:23', '2026-09-28 20:53:23');
INSERT INTO `destination_faqs` (`id`, `destination_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('7', '122', 'Spice Trails & Wildlife Safaris', 'Walk through fragrant cardamom, pepper, and vanilla plantations in Thekkady, and cruise Lake Periyar to view wild elephants, exotic birds, and tropical flora in their natural habitat.', '3', 'published', '2026-09-28 20:53:23', '2026-09-28 20:53:23');
INSERT INTO `destination_faqs` (`id`, `destination_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('8', '122', 'Holistic Ayurveda & Classical Arts', 'Experience time-honored Ayurvedic rejuvenation treatments, witness dramatic Kathakali dance performances, and discover Kalaripayattu martial art demonstrations.', '4', 'published', '2026-09-28 20:53:23', '2026-09-28 20:53:23');
INSERT INTO `destination_faqs` (`id`, `destination_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('9', '121', 'Best Time to Visit Karnataka', 'October to April provides cool, sunny weather perfect for exploring the rock-cut monuments of Hampi, Mysore Palace festivities, and wildlife safaris.', '1', 'published', '2026-09-28 20:53:23', '2026-09-28 20:53:23');
INSERT INTO `destination_faqs` (`id`, `destination_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('10', '121', 'Royal Heritage & Architectural Wonders', 'Marvel at the illuminated Mysore Palace, explore the boulder-strewn ruins of the UNESCO Vijayanagara Empire in Hampi, and study the intricate Hoysala temple carvings.', '2', 'published', '2026-09-28 20:53:23', '2026-09-28 20:53:23');
INSERT INTO `destination_faqs` (`id`, `destination_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('11', '121', 'Coffee Plantations & Nature Escapes', 'Immerse yourself in lush coffee and spice estates in Coorg and Chikmagalur, staying in luxury plantation bungalows with private nature walks.', '3', 'published', '2026-09-28 20:53:23', '2026-09-28 20:53:23');
INSERT INTO `destination_faqs` (`id`, `destination_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('12', '121', 'Wildlife Safaris & Nature Sanctuaries', 'Embark on private guided Jeep safaris in Kabini and Bandipur Tiger Reserve to encounter wild Bengal tigers, leopards, and herds of Asian elephants.', '4', 'published', '2026-09-28 20:53:23', '2026-09-28 20:53:23');
INSERT INTO `destination_faqs` (`id`, `destination_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('13', '120', 'Best Time to Visit Goa', 'November to March is the peak season with sunny skies, warm tropical waters, and vibrant seaside cafe culture.', '1', 'published', '2026-09-28 20:53:23', '2026-09-28 20:53:23');
INSERT INTO `destination_faqs` (`id`, `destination_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('14', '120', 'Old Goa & UNESCO Baroque Churches', 'Visit the Basilica of Bom Jesus and Se Cathedral, showcasing magnificent 16th-century Portuguese architecture and sacred art.', '2', 'published', '2026-09-28 20:53:23', '2026-09-28 20:53:23');
INSERT INTO `destination_faqs` (`id`, `destination_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('15', '120', 'Spice Plantations & Mandovi River Cruises', 'Take an aromatic walking tour through organic spice plantations followed by private sunset cruises along the Mandovi River.', '3', 'published', '2026-09-28 20:53:23', '2026-09-28 20:53:23');
INSERT INTO `destination_faqs` (`id`, `destination_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('16', '120', 'Private Chauffeur Coastal Explorations', 'Travel in sanitized luxury private vehicles to explore hidden beaches in South Goa, historic forts like Fort Aguada and Chapora, and traditional Latin Quarter villas.', '4', 'published', '2026-09-28 20:53:23', '2026-09-28 20:53:23');

-- -----------------------------------------------------
-- Table structure for `destination_gallery`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `destination_gallery`;
CREATE TABLE `destination_gallery` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `destination_id` bigint unsigned NOT NULL,
  `media_id` bigint unsigned NOT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  `is_hero_slide` tinyint(1) NOT NULL DEFAULT '0',
  `caption` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_dest_gallery_dest` (`destination_id`),
  KEY `idx_dest_gallery_order` (`display_order`),
  KEY `idx_dest_gallery_hero` (`is_hero_slide`),
  KEY `fk_dest_gallery_media` (`media_id`),
  CONSTRAINT `fk_dest_gallery_dest` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_dest_gallery_media` FOREIGN KEY (`media_id`) REFERENCES `media` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table structure for `destination_sections`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `destination_sections`;
CREATE TABLE `destination_sections` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `destination_id` bigint unsigned NOT NULL,
  `section_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtitle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `media_id` bigint unsigned DEFAULT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_dest_sections_dest` (`destination_id`),
  KEY `idx_dest_sections_type` (`section_type`),
  KEY `idx_dest_sections_order` (`display_order`),
  KEY `idx_dest_sections_status` (`status`),
  KEY `fk_dest_sections_media` (`media_id`),
  CONSTRAINT `fk_dest_sections_dest` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_dest_sections_media` FOREIGN KEY (`media_id`) REFERENCES `media` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `destination_sections`
INSERT INTO `destination_sections` (`id`, `destination_id`, `section_type`, `title`, `subtitle`, `content`, `media_id`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('1', '123', 'seasonal_activities', 'Best Time to Visit Tamil Nadu', NULL, 'Tamil Nadu can be explored throughout the year, but the most pleasant season is from October to March, when the climate is ideal for temple visits, heritage walks, hill stations, and coastal sightseeing.', '408', '1', 'active', '2026-09-29 13:37:58', '2026-09-29 15:40:56');
INSERT INTO `destination_sections` (`id`, `destination_id`, `section_type`, `title`, `subtitle`, `content`, `media_id`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('2', '123', 'seasonal_activities', 'Comfortable Private Sightseeing', NULL, 'Explore Tamil Nadu comfortably with private, chauffeur-driven vehicles designed for flexible sightseeing across temples, heritage landmarks, cities, hill stations, and coastal destinations.', '428', '2', 'active', '2026-09-29 13:37:58', '2026-09-29 15:40:56');
INSERT INTO `destination_sections` (`id`, `destination_id`, `section_type`, `title`, `subtitle`, `content`, `media_id`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('3', '123', 'seasonal_activities', 'Cultural & Heritage Experiences', NULL, 'Experience Tamil Nadu through its magnificent temples, UNESCO heritage landmarks, classical Tamil culture, Bharatanatyam, Carnatic music, traditional cuisine, silk weaving, and historic architecture.', '433', '3', 'active', '2026-09-29 13:37:58', '2026-09-29 15:40:56');
INSERT INTO `destination_sections` (`id`, `destination_id`, `section_type`, `title`, `subtitle`, `content`, `media_id`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('4', '123', 'seasonal_activities', 'Flexible Tours Across All Seasons', NULL, 'Tamil Nadu offers flexible travel experiences throughout the year, allowing travelers to combine cultural heritage, temple visits, beaches, hill stations, wildlife, and local experiences according to the season.', '418', '4', 'active', '2026-09-29 13:37:58', '2026-09-29 15:40:56');
INSERT INTO `destination_sections` (`id`, `destination_id`, `section_type`, `title`, `subtitle`, `content`, `media_id`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('5', '122', 'seasonal_activities', 'Best Time to Visit Kerala', NULL, 'The ideal season to explore Kerala is between September and March for cool, pleasant backwater cruises and sightseeing, while June to August offers the best climate for traditional Ayurvedic wellness therapies and lush monsoon landscapes.', '369', '1', 'active', '2026-09-29 13:37:58', '2026-09-29 13:37:58');
INSERT INTO `destination_sections` (`id`, `destination_id`, `section_type`, `title`, `subtitle`, `content`, `media_id`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('6', '122', 'seasonal_activities', 'Comfortable Private Sightseeing', NULL, 'Travel effortlessly across Kerala in private, air-conditioned chauffeur-driven vehicles with dedicated local driver-guides, providing seamless transfers between Kochi, Munnar, Thekkady, Alleppey, and Kovalam.', '377', '2', 'active', '2026-09-29 13:37:58', '2026-09-29 15:40:56');
INSERT INTO `destination_sections` (`id`, `destination_id`, `section_type`, `title`, `subtitle`, `content`, `media_id`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('7', '122', 'seasonal_activities', 'Backwaters & Nature Experiences', NULL, 'Cruise along tranquil palm-fringed backwaters aboard authentic luxury houseboats in Alleppey and Kumarakom, walk through fragrant tea and spice plantations in Munnar, and explore Periyar Lake wildlife sanctuaries.', '382', '3', 'active', '2026-09-29 13:37:58', '2026-09-29 15:40:56');
INSERT INTO `destination_sections` (`id`, `destination_id`, `section_type`, `title`, `subtitle`, `content`, `media_id`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('8', '122', 'seasonal_activities', 'Cultural & Heritage Experiences', NULL, 'Immerse yourself in Kerala’s rich living heritage with live Kathakali dance dramas, Kalaripayattu martial arts, historic colonial architecture in Fort Kochi, and vibrant temple festivals.', '370', '4', 'active', '2026-09-29 13:37:58', '2026-09-29 15:40:56');
INSERT INTO `destination_sections` (`id`, `destination_id`, `section_type`, `title`, `subtitle`, `content`, `media_id`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('9', '122', 'seasonal_activities', 'Flexible Tours Across All Seasons', NULL, 'Kerala tours are customizable for every season, offering relaxing backwater retreats, high-altitude hill station escapes, tropical beach getaways, and holistic Ayurvedic rejuvenation all year round.', '392', '5', 'active', '2026-09-29 13:37:58', '2026-09-29 15:40:56');
INSERT INTO `destination_sections` (`id`, `destination_id`, `section_type`, `title`, `subtitle`, `content`, `media_id`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('10', '121', 'seasonal_activities', 'Best Time to Visit Karnataka', NULL, 'October to April provides the most pleasant and dry weather for exploring the UNESCO ruins of Hampi, the regal palaces of Mysore, wildlife safaris, and the cool coffee hills of Coorg.', '348', '1', 'active', '2026-09-29 13:37:58', '2026-09-29 13:37:58');
INSERT INTO `destination_sections` (`id`, `destination_id`, `section_type`, `title`, `subtitle`, `content`, `media_id`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('11', '121', 'seasonal_activities', 'Comfortable Private Sightseeing', NULL, 'Discover Karnataka with private sanitized chauffeur-driven vehicles, ensuring comfortable travel across historic temple circuits, royal heritage cities, wildlife reserves, and scenic Western Ghats destinations.', '355', '2', 'active', '2026-09-29 13:37:58', '2026-09-29 15:40:56');
INSERT INTO `destination_sections` (`id`, `destination_id`, `section_type`, `title`, `subtitle`, `content`, `media_id`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('12', '121', 'seasonal_activities', 'Heritage & Historical Experiences', NULL, 'Marvel at the illuminated grandeur of Mysore Palace, walk through the ancient boulder-strewn monuments of the Vijayanagara Empire in Hampi, and admire the stone carvings of Belur and Halebidu.', '333', '3', 'active', '2026-09-29 13:37:58', '2026-09-29 15:40:56');
INSERT INTO `destination_sections` (`id`, `destination_id`, `section_type`, `title`, `subtitle`, `content`, `media_id`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('13', '121', 'seasonal_activities', 'Nature & Wildlife Experiences', NULL, 'Embark on thrilling Jeep safaris in Nagarhole and Bandipur National Parks to spot wild tigers and Asian elephants, and stay in serene coffee estate homestays amidst the misty hills of Coorg and Chikmagalur.', '338', '4', 'active', '2026-09-29 13:37:58', '2026-09-29 15:40:56');
INSERT INTO `destination_sections` (`id`, `destination_id`, `section_type`, `title`, `subtitle`, `content`, `media_id`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('14', '121', 'seasonal_activities', 'Flexible Tours Across All Seasons', NULL, 'Karnataka offers varied travel experiences in every season, from winter heritage tours and wildlife expeditions to lush monsoon waterfall journeys and year-round coffee plantation retreats.', '360', '5', 'active', '2026-09-29 13:37:58', '2026-09-29 15:40:56');
INSERT INTO `destination_sections` (`id`, `destination_id`, `section_type`, `title`, `subtitle`, `content`, `media_id`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('15', '120', 'seasonal_activities', 'Best Time to Visit Goa', NULL, 'November to March is the peak season with sunny tropical skies, warm waters, and vibrant beach shacks, while June to September offers lush green landscapes and tranquil romantic monsoon getaways.', '279', '1', 'active', '2026-09-29 13:37:58', '2026-09-29 13:37:58');
INSERT INTO `destination_sections` (`id`, `destination_id`, `section_type`, `title`, `subtitle`, `content`, `media_id`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('16', '120', 'seasonal_activities', 'Comfortable Private Sightseeing', NULL, 'Explore North and South Goa in comfort with private air-conditioned vehicles, tailored for hassle-free sightseeing across historic forts, pristine beaches, spice plantations, and Portuguese quarters.', '284', '2', 'active', '2026-09-29 13:37:58', '2026-09-29 15:40:56');
INSERT INTO `destination_sections` (`id`, `destination_id`, `section_type`, `title`, `subtitle`, `content`, `media_id`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('17', '120', 'seasonal_activities', 'Beaches & Coastal Experiences', NULL, 'Relax on sun-kissed golden sand beaches from lively Baga and Calangute to serene South Goa havens like Palolem and Morjim, enjoy thrilling watersports, and take sunset cruises along the Mandovi River.', '273', '3', 'active', '2026-09-29 13:37:58', '2026-09-29 15:40:56');
INSERT INTO `destination_sections` (`id`, `destination_id`, `section_type`, `title`, `subtitle`, `content`, `media_id`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('18', '120', 'seasonal_activities', 'Cultural & Heritage Experiences', NULL, 'Discover Goa’s rich Indo-Portuguese heritage with visits to the UNESCO Baroque churches of Old Goa including Basilica of Bom Jesus and Se Cathedral, historic Fort Aguada, and the colorful Latin Quarter of Fontainhas.', '295', '4', 'active', '2026-09-29 13:37:58', '2026-09-29 15:40:56');
INSERT INTO `destination_sections` (`id`, `destination_id`, `section_type`, `title`, `subtitle`, `content`, `media_id`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('19', '120', 'seasonal_activities', 'Flexible Tours Across All Seasons', NULL, 'Goa offers versatile travel opportunities throughout the year, from vibrant winter beach holidays and heritage sightseeing to peaceful off-season wellness retreats and spice plantation excursions.', '282', '5', 'active', '2026-09-29 13:37:58', '2026-11-14 09:17:37');

-- -----------------------------------------------------
-- Table structure for `destinations`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `destinations`;
CREATE TABLE `destinations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hero_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_subtitle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `short_description` text COLLATE utf8mb4_unicode_ci,
  `intro_heading` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `intro_label` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `intro_content` longtext COLLATE utf8mb4_unicode_ci,
  `intro_media_id` bigint unsigned DEFAULT NULL,
  `language` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `currency` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `religion` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `heritage` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timezone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `featured_image_id` bigint unsigned DEFAULT NULL,
  `seo_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seo_description` text COLLATE utf8mb4_unicode_ci,
  `og_image_id` bigint unsigned DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `display_order` int NOT NULL DEFAULT '0',
  `status` enum('draft','published','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_destinations_slug` (`slug`),
  KEY `idx_destinations_status` (`status`),
  KEY `idx_destinations_featured` (`is_featured`),
  KEY `idx_destinations_display_order` (`display_order`),
  KEY `idx_destinations_deleted_at` (`deleted_at`),
  KEY `fk_dest_intro_media` (`intro_media_id`),
  KEY `fk_dest_featured_image` (`featured_image_id`),
  KEY `fk_dest_og_image` (`og_image_id`),
  KEY `idx_destinations_deleted_by` (`deleted_by`),
  CONSTRAINT `fk_dest_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_dest_featured_image` FOREIGN KEY (`featured_image_id`) REFERENCES `media` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_dest_intro_media` FOREIGN KEY (`intro_media_id`) REFERENCES `media` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_dest_og_image` FOREIGN KEY (`og_image_id`) REFERENCES `media` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=140 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `destinations`
INSERT INTO `destinations` (`id`, `name`, `slug`, `hero_title`, `hero_subtitle`, `short_description`, `intro_heading`, `intro_label`, `intro_content`, `intro_media_id`, `language`, `currency`, `religion`, `heritage`, `timezone`, `latitude`, `longitude`, `featured_image_id`, `seo_title`, `seo_description`, `og_image_id`, `is_featured`, `display_order`, `status`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES ('120', 'Goa', 'goa', 'Goa', 'Discover Goa with our tours.', 'Discover Goa with our tours. Sun-kissed beaches, UNESCO Portuguese cathedrals, spice plantations, and serene river cruises.', 'Golden Beaches, Baroque Cathedrals & Vibrant Coastlines', 'Sun, Sand, Spice & Portuguese Heritage', 'Goa is India’s most celebrated coastal haven, blessed with sun-drenched Arabian Sea beaches, UNESCO World Heritage Baroque churches of Old Goa, spice plantations, and historic Portuguese mansions.\n\nOffering a unique fusion of Indian hospitality and European charm, Goa provides unforgettable beachside relaxation, heritage walks, river cruises, and flavorful coastal dining.', '283', 'English / Konkani', 'Indian Rupee (INR)', 'Christianity / Hinduism', 'Portuguese & Coastal Heritage', 'GMT +5:30', NULL, NULL, '316', NULL, NULL, NULL, '1', '4', 'published', '2026-09-26 11:43:02', '2026-09-29 15:40:56', NULL, NULL);
INSERT INTO `destinations` (`id`, `name`, `slug`, `hero_title`, `hero_subtitle`, `short_description`, `intro_heading`, `intro_label`, `intro_content`, `intro_media_id`, `language`, `currency`, `religion`, `heritage`, `timezone`, `latitude`, `longitude`, `featured_image_id`, `seo_title`, `seo_description`, `og_image_id`, `is_featured`, `display_order`, `status`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES ('121', 'Karnataka', 'karnataka', 'Karnataka', 'Discover Karnataka with our tours.', 'Discover Karnataka with our tours. Regal palaces of Mysore, UNESCO ruins of Hampi, lush coffee estates in Coorg, and rich wildlife sanctuaries.', 'Royal Palaces, Ancient Hampi & Coffee Mist Hills', 'One State, Many Worlds', 'Karnataka is a mesmerizing land of royal opulence and UNESCO architectural treasures. Home to the legendary Vijayanagara Empire capital of Hampi, the stone-carved temples of Belur and Halebidu, the regal Mysore Palace, and aromatic coffee hills of Coorg and Chikmagalur.\n\nKarnataka seamlessly bridges historic grandeur with lush wildlife national parks and vibrant cultural life. Experience royal heritage, wildlife safaris in Bandipur and Nagarhole, and breathtaking waterfalls cascading down the Western Ghats.', '349', 'English / Kannada', 'Indian Rupee (INR)', 'Hinduism / Christianity / Islam / Jainism', 'Hampi / Mysore / Historic Heritage', 'GMT +5:30', NULL, NULL, '318', NULL, NULL, NULL, '1', '3', 'published', '2026-09-26 11:43:02', '2026-09-29 15:40:56', NULL, NULL);
INSERT INTO `destinations` (`id`, `name`, `slug`, `hero_title`, `hero_subtitle`, `short_description`, `intro_heading`, `intro_label`, `intro_content`, `intro_media_id`, `language`, `currency`, `religion`, `heritage`, `timezone`, `latitude`, `longitude`, `featured_image_id`, `seo_title`, `seo_description`, `og_image_id`, `is_featured`, `display_order`, `status`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES ('122', 'Kerala', 'kerala', 'Kerala', 'Discover Kerala with our tours.', 'Discover Kerala with our tours. Tranquil emerald backwaters, tea plantation hills in Munnar, Ayurvedic wellness, and tropical beaches.', 'Enchanting Palm Groves, Spice Hills & Serene Waters', 'God’s Own Country — Nature, Backwaters & Wellness', 'Kerala is a tropical paradise acclaimed worldwide for its tranquil emerald backwaters, misty Western Ghat hill stations, pristine Arabian Sea coastlines, and ancient Ayurvedic healing traditions.\n\nFlourishing through centuries of spice trade with Arab, Roman, and European mariners, Kerala offers an exquisite tapestry of Kathakali dance, temple festivals, tea plantations, and backwater houseboats. From the rolling hills of Munnar to the palm-fringed canals of Alleppey and the vibrant spice markets of Fort Kochi, Kerala offers a serene rejuvenation of mind, body, and soul.', '376', 'English / Malayalam', 'Indian Rupee (INR)', 'Hinduism / Christianity / Islam', 'Backwaters / Western Ghats / Cultural Heritage', 'GMT +5:30', NULL, NULL, '319', NULL, NULL, NULL, '1', '2', 'published', '2026-09-26 11:43:02', '2026-09-29 15:40:56', NULL, NULL);
INSERT INTO `destinations` (`id`, `name`, `slug`, `hero_title`, `hero_subtitle`, `short_description`, `intro_heading`, `intro_label`, `intro_content`, `intro_media_id`, `language`, `currency`, `religion`, `heritage`, `timezone`, `latitude`, `longitude`, `featured_image_id`, `seo_title`, `seo_description`, `og_image_id`, `is_featured`, `display_order`, `status`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES ('123', 'Tamil Nadu', 'tamil-nadu', 'Tamil Nadu', 'Discover Tamil Nadu with our tours.', 'Discover Tamil Nadu with our tours. Explore ancient Dravidian temples, UNESCO heritage monuments, hill stations, and vibrant cultural arts.', 'History of the Land of Temples & Timeless Culture', 'Tamil Nadu is ancient, Tamil Nadu is eternal', 'Tamil Nadu is one of the world’s oldest living civilizations, with a history that stretches back over 5,000 years. Renowned for its classical heritage, the region flourished under powerful dynasties such as the Cholas, Cheras, Pandyas, Pallavas, and Vijayanagara rulers, who shaped South India through monumental architecture, literature, trade, and spiritual traditions.\n\nThe state is celebrated as the Land of Temples, home to magnificent Dravidian marvels like Brihadeeswarar Temple, Meenakshi Amman Temple, Shore Temple, and Ekambareswarar Temple. Beyond architecture, Tamil Nadu is the birthplace of Tamil language, one of the oldest classical languages in the world, and a vibrant center for Bharatanatyam, Carnatic music, silk weaving, bronze sculptures, and spiritual philosophy. Today, Tamil Nadu seamlessly blends ancient traditions with modern life, offering travelers a deeply enriching cultural journey.', '282', 'English / Tamil', 'Indian Rupee (INR)', 'Hinduism / Christianity / Islam', 'UNESCO World Heritage Sites', 'GMT +5:30', NULL, NULL, '427', NULL, NULL, NULL, '1', '1', 'published', '2026-09-26 11:43:02', '2026-11-14 09:17:38', NULL, NULL);

-- -----------------------------------------------------
-- Table structure for `footer_links`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `footer_links`;
CREATE TABLE `footer_links` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `column_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  `is_external` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_fl_column` (`column_name`),
  KEY `idx_fl_order` (`display_order`),
  KEY `idx_fl_status` (`status`),
  KEY `idx_fl_deleted_at` (`deleted_at`),
  KEY `fk_fl_deleted_by` (`deleted_by`),
  CONSTRAINT `fk_fl_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `footer_links`
INSERT INTO `footer_links` (`id`, `column_name`, `label`, `url`, `display_order`, `is_external`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('1', 'useful_links', 'Home', '/', '1', '0', 'active', NULL, NULL, '2026-09-24 16:24:48', '2026-09-24 16:24:48');
INSERT INTO `footer_links` (`id`, `column_name`, `label`, `url`, `display_order`, `is_external`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('2', 'useful_links', 'Tours', '/tours', '2', '0', 'active', NULL, NULL, '2026-09-24 16:24:48', '2026-09-24 16:24:48');
INSERT INTO `footer_links` (`id`, `column_name`, `label`, `url`, `display_order`, `is_external`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('3', 'useful_links', 'Destinations', '/destinations', '3', '0', 'active', NULL, NULL, '2026-09-24 16:24:48', '2026-09-24 16:24:48');
INSERT INTO `footer_links` (`id`, `column_name`, `label`, `url`, `display_order`, `is_external`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('4', 'useful_links', 'About Us', '/about-us', '4', '0', 'active', NULL, NULL, '2026-09-24 16:24:48', '2026-09-24 16:24:48');
INSERT INTO `footer_links` (`id`, `column_name`, `label`, `url`, `display_order`, `is_external`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('5', 'useful_links', 'Contact Us', '/contact', '5', '0', 'active', NULL, NULL, '2026-09-24 16:24:48', '2026-09-24 16:24:48');
INSERT INTO `footer_links` (`id`, `column_name`, `label`, `url`, `display_order`, `is_external`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('6', 'policy_pages', 'Terms & Conditions', '/terms-conditions', '1', '0', 'active', NULL, NULL, '2026-09-24 16:24:48', '2026-09-24 16:24:48');
INSERT INTO `footer_links` (`id`, `column_name`, `label`, `url`, `display_order`, `is_external`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('7', 'policy_pages', 'Refund Policy', '/refund-policy', '2', '0', 'active', NULL, NULL, '2026-09-24 16:24:48', '2026-09-24 16:24:48');
INSERT INTO `footer_links` (`id`, `column_name`, `label`, `url`, `display_order`, `is_external`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('8', 'policy_pages', 'Privacy Policy', '/privacy-policy', '3', '0', 'active', NULL, NULL, '2026-09-24 16:24:48', '2026-09-24 16:24:48');

-- -----------------------------------------------------
-- Table structure for `home_benefits`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `home_benefits`;
CREATE TABLE `home_benefits` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `media_id` bigint unsigned DEFAULT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_hb_order` (`display_order`),
  KEY `idx_hb_status` (`status`),
  KEY `fk_hb_media` (`media_id`),
  KEY `idx_hb_deleted_at` (`deleted_at`),
  KEY `fk_hb_deleted_by` (`deleted_by`),
  CONSTRAINT `fk_hb_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_hb_media` FOREIGN KEY (`media_id`) REFERENCES `media` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `home_benefits`
INSERT INTO `home_benefits` (`id`, `title`, `description`, `icon`, `media_id`, `display_order`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('1', 'Discover the possibilities', 'With nearly half a million attractions, hotels & more, you’re sure to find joy.', 'globe', NULL, '1', 'active', NULL, NULL, '2026-09-24 16:24:48', '2026-11-03 12:38:23');
INSERT INTO `home_benefits` (`id`, `title`, `description`, `icon`, `media_id`, `display_order`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('2', 'Enjoy deals & delights', 'Quality activities. Great prices. Plus, earn credits to save more.', 'tag', NULL, '2', 'active', NULL, NULL, '2026-09-24 16:24:48', '2026-11-03 12:38:23');
INSERT INTO `home_benefits` (`id`, `title`, `description`, `icon`, `media_id`, `display_order`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('3', 'Exploring made easy', 'Book last minute, skip lines & get free cancellation for easier exploring.', 'umbrella', NULL, '3', 'active', NULL, NULL, '2026-09-24 16:24:48', '2026-11-03 12:38:23');
INSERT INTO `home_benefits` (`id`, `title`, `description`, `icon`, `media_id`, `display_order`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('4', 'Travel you can trust', 'Read reviews & get reliable customer support. We\'re with you at every step.', 'award', NULL, '4', 'active', NULL, NULL, '2026-09-24 16:24:48', '2026-11-03 12:38:23');

-- -----------------------------------------------------
-- Table structure for `home_hero_slides`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `home_hero_slides`;
CREATE TABLE `home_hero_slides` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtitle` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `desktop_media_id` bigint unsigned DEFAULT NULL,
  `mobile_media_id` bigint unsigned DEFAULT NULL,
  `cta_label` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cta_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_hhs_order` (`display_order`),
  KEY `idx_hhs_status` (`status`),
  KEY `idx_hhs_schedule` (`start_date`,`end_date`),
  KEY `fk_hhs_desktop_media` (`desktop_media_id`),
  KEY `fk_hhs_mobile_media` (`mobile_media_id`),
  KEY `idx_hhs_deleted_at` (`deleted_at`),
  KEY `fk_hhs_deleted_by` (`deleted_by`),
  CONSTRAINT `fk_hhs_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_hhs_desktop_media` FOREIGN KEY (`desktop_media_id`) REFERENCES `media` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_hhs_mobile_media` FOREIGN KEY (`mobile_media_id`) REFERENCES `media` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `home_hero_slides`
INSERT INTO `home_hero_slides` (`id`, `title`, `subtitle`, `desktop_media_id`, `mobile_media_id`, `cta_label`, `cta_url`, `display_order`, `start_date`, `end_date`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('37', 'Dream. Travel. Discover.', NULL, '485', '485', 'Explore Tours', '/tours', '2', NULL, NULL, 'inactive', '2026-09-29 15:42:41', '1', '2026-09-28 11:29:36', '2026-09-29 15:42:41');
INSERT INTO `home_hero_slides` (`id`, `title`, `subtitle`, `desktop_media_id`, `mobile_media_id`, `cta_label`, `cta_url`, `display_order`, `start_date`, `end_date`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('38', 'Kerala Emerald Backwaters & Wellness', 'Cruise tranquil palm-fringed backwaters, misty tea plantations, and rejuvenate with Ayurveda.', '266', '266', 'Explore Tours', '/tours', '2', NULL, NULL, 'active', NULL, NULL, '2026-09-28 11:29:36', '2026-11-03 12:38:23');
INSERT INTO `home_hero_slides` (`id`, `title`, `subtitle`, `desktop_media_id`, `mobile_media_id`, `cta_label`, `cta_url`, `display_order`, `start_date`, `end_date`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('39', 'Karnataka Royal Palaces & UNESCO Hampi', 'Discover the golden grandeur of Mysore Palace, ancient ruins of Hampi, and lush coffee hills.', '265', '265', 'Explore Tours', '/tours', '3', NULL, NULL, 'active', NULL, NULL, '2026-09-28 11:29:36', '2026-11-03 12:38:23');
INSERT INTO `home_hero_slides` (`id`, `title`, `subtitle`, `desktop_media_id`, `mobile_media_id`, `cta_label`, `cta_url`, `display_order`, `start_date`, `end_date`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('40', 'Goa Golden Beaches & Coastal Splendor', 'Relax on sun-kissed coastlines, historic Portuguese heritage sites, and vibrant culture.', '264', '264', 'Explore Tours', '/tours', '4', NULL, NULL, 'active', '2026-11-03 12:38:23', '458', '2026-09-28 11:29:36', '2026-11-03 12:38:23');
INSERT INTO `home_hero_slides` (`id`, `title`, `subtitle`, `desktop_media_id`, `mobile_media_id`, `cta_label`, `cta_url`, `display_order`, `start_date`, `end_date`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('41', 'Tamil Nadu Living Heritage & Grand Temples', 'Explore magnificent Dravidian temples, UNESCO monuments, and timeless classical arts.', '270', '270', 'Explore Tours', '/tours', '1', NULL, NULL, 'active', NULL, NULL, '2026-09-28 11:29:36', '2026-11-03 12:38:23');
INSERT INTO `home_hero_slides` (`id`, `title`, `subtitle`, `desktop_media_id`, `mobile_media_id`, `cta_label`, `cta_url`, `display_order`, `start_date`, `end_date`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('42', 'Taj Mahal & Iconic Wonders', NULL, '269', '269', 'Explore Tours', '/tours', '8', NULL, NULL, 'inactive', '2026-09-29 15:42:41', '1', '2026-09-28 11:29:36', '2026-09-29 15:42:41');
INSERT INTO `home_hero_slides` (`id`, `title`, `subtitle`, `desktop_media_id`, `mobile_media_id`, `cta_label`, `cta_url`, `display_order`, `start_date`, `end_date`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('43', 'Rajasthan Royal Forts & Desert Safaris', NULL, '268', '268', 'Explore Tours', '/tours', '7', NULL, NULL, 'inactive', '2026-09-29 15:42:41', '1', '2026-09-28 11:29:36', '2026-09-29 15:42:41');
INSERT INTO `home_hero_slides` (`id`, `title`, `subtitle`, `desktop_media_id`, `mobile_media_id`, `cta_label`, `cta_url`, `display_order`, `start_date`, `end_date`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('44', 'Delhi Historic Heart & Cultural Monuments', NULL, '263', '263', 'Explore Tours', '/tours', '8', NULL, NULL, 'inactive', '2026-09-29 15:42:41', '1', '2026-09-28 11:29:36', '2026-09-29 15:42:41');
INSERT INTO `home_hero_slides` (`id`, `title`, `subtitle`, `desktop_media_id`, `mobile_media_id`, `cta_label`, `cta_url`, `display_order`, `start_date`, `end_date`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('45', 'Munnar Misty Tea Plantations', NULL, '381', '381', 'Explore Tours', '/tours', '9', NULL, NULL, 'inactive', '2026-09-29 15:42:41', '1', '2026-09-28 11:29:36', '2026-09-29 15:42:41');
INSERT INTO `home_hero_slides` (`id`, `title`, `subtitle`, `desktop_media_id`, `mobile_media_id`, `cta_label`, `cta_url`, `display_order`, `start_date`, `end_date`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('48', 'New Spectacular Journey', 'Experience breathtaking vistas and curated private safaris with Wonderer South India.', NULL, NULL, 'Explore Tour Packages', '/tours', '5', NULL, NULL, 'inactive', '2026-09-29 15:42:41', '1', '2026-09-29 12:04:13', '2026-09-30 10:16:16');
INSERT INTO `home_hero_slides` (`id`, `title`, `subtitle`, `desktop_media_id`, `mobile_media_id`, `cta_label`, `cta_url`, `display_order`, `start_date`, `end_date`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('49', 'New Spectacular Journey', 'Experience breathtaking vistas and curated private safaris with Wonderer South India.', NULL, NULL, 'Explore Tour Packages', '/tours', '5', NULL, NULL, 'inactive', '2026-09-29 15:42:41', '1', '2026-09-29 12:08:10', '2026-09-30 10:16:16');
INSERT INTO `home_hero_slides` (`id`, `title`, `subtitle`, `desktop_media_id`, `mobile_media_id`, `cta_label`, `cta_url`, `display_order`, `start_date`, `end_date`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('50', 'New Spectacular Journey', 'Experience breathtaking vistas and curated private safaris with Wonderer South India.', '423', NULL, 'Explore Tour Packages', '/tours', '5', NULL, NULL, 'inactive', '2026-09-29 15:42:41', '1', '2026-09-29 12:08:10', '2026-09-30 10:16:16');
INSERT INTO `home_hero_slides` (`id`, `title`, `subtitle`, `desktop_media_id`, `mobile_media_id`, `cta_label`, `cta_url`, `display_order`, `start_date`, `end_date`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('51', 'New Spectacular Journey', 'Experience breathtaking vistas and curated private safaris with Wonderer South India.', '340', NULL, 'Explore Tour Packages', '/tours', '7', NULL, NULL, 'inactive', '2026-09-29 15:42:41', '1', '2026-09-29 12:08:10', '2026-09-30 10:16:16');
INSERT INTO `home_hero_slides` (`id`, `title`, `subtitle`, `desktop_media_id`, `mobile_media_id`, `cta_label`, `cta_url`, `display_order`, `start_date`, `end_date`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('52', 'New Spectacular Journey', 'Experience breathtaking vistas and curated private safaris with Wonderer South India.', NULL, NULL, 'Explore Tour Packages', '/tours', '7', NULL, NULL, 'inactive', '2026-09-29 15:42:41', '1', '2026-09-29 12:22:10', '2026-09-30 10:16:16');
INSERT INTO `home_hero_slides` (`id`, `title`, `subtitle`, `desktop_media_id`, `mobile_media_id`, `cta_label`, `cta_url`, `display_order`, `start_date`, `end_date`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('53', 'New Spectacular Journey', 'Experience breathtaking vistas and curated private safaris with Wonderer South India.', '427', NULL, 'Explore Tour Packages', '/tours', '7', NULL, NULL, 'inactive', '2026-09-29 15:42:41', '1', '2026-09-29 12:22:10', '2026-11-14 09:17:38');
INSERT INTO `home_hero_slides` (`id`, `title`, `subtitle`, `desktop_media_id`, `mobile_media_id`, `cta_label`, `cta_url`, `display_order`, `start_date`, `end_date`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('54', 'New Spectacular Journey', 'Experience breathtaking vistas and curated private safaris with Wonderer South India.', '376', NULL, 'Explore Tour Packages', '/tours', '6', NULL, NULL, 'inactive', '2026-09-29 15:42:41', '1', '2026-09-29 12:22:10', '2026-09-30 10:16:16');
INSERT INTO `home_hero_slides` (`id`, `title`, `subtitle`, `desktop_media_id`, `mobile_media_id`, `cta_label`, `cta_url`, `display_order`, `start_date`, `end_date`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('55', 'New Spectacular Journey', 'Experience breathtaking vistas and curated private safaris with Wonderer South India.', NULL, NULL, 'Explore Tour Packages', '/tours', '7', NULL, NULL, 'inactive', '2026-09-29 15:42:41', '1', '2026-09-29 12:37:08', '2026-09-30 10:16:16');
INSERT INTO `home_hero_slides` (`id`, `title`, `subtitle`, `desktop_media_id`, `mobile_media_id`, `cta_label`, `cta_url`, `display_order`, `start_date`, `end_date`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('56', 'New Spectacular Journey', 'Experience breathtaking vistas and curated private safaris with Wonderer South India.', NULL, NULL, 'Explore Tour Packages', '/tours', '7', NULL, NULL, 'inactive', '2026-09-29 15:42:41', '1', '2026-09-29 12:37:15', '2026-09-30 10:16:16');
INSERT INTO `home_hero_slides` (`id`, `title`, `subtitle`, `desktop_media_id`, `mobile_media_id`, `cta_label`, `cta_url`, `display_order`, `start_date`, `end_date`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('57', 'TamilNadu', NULL, '427', '427', 'Explore Tours', '/tours', '4', NULL, NULL, 'active', NULL, NULL, '2026-09-29 15:52:22', '2026-11-14 09:17:38');
INSERT INTO `home_hero_slides` (`id`, `title`, `subtitle`, `desktop_media_id`, `mobile_media_id`, `cta_label`, `cta_url`, `display_order`, `start_date`, `end_date`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('58', 'kerala', NULL, '283', '283', 'Explore Tours', '/tours', '5', NULL, NULL, 'active', NULL, NULL, '2026-09-29 16:06:14', '2026-11-03 12:38:23');
INSERT INTO `home_hero_slides` (`id`, `title`, `subtitle`, `desktop_media_id`, `mobile_media_id`, `cta_label`, `cta_url`, `display_order`, `start_date`, `end_date`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('59', 'Hero Slide 6', NULL, '432', NULL, NULL, NULL, '6', NULL, NULL, 'active', NULL, NULL, '2026-11-06 15:41:55', '2026-11-14 09:17:38');

-- -----------------------------------------------------
-- Table structure for `media`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `media`;
CREATE TABLE `media` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` int unsigned NOT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alt_text` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `caption` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uploaded_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_media_mime` (`mime_type`),
  KEY `idx_media_uploaded_by` (`uploaded_by`),
  CONSTRAINT `fk_media_uploader` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=528 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `media`
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('261', 'demo_aboutus.jpg', 'AboutUs.jpg', 'uploads/media/demo_aboutus.jpg', '1384881', 'image/jpeg', 'AboutUs', 'AboutUs', NULL, '2026-09-28 11:02:26', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('262', 'demo_blackwave.jpg', 'blackwave.jpg', 'uploads/media/demo_blackwave.jpg', '600261', 'image/jpeg', 'blackwave', 'blackwave', NULL, '2026-09-28 11:02:26', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('263', 'demo_carousel_delhi.jpg', 'Delhi.jpg', 'uploads/media/demo_carousel_delhi.jpg', '100878', 'image/jpeg', 'Delhi', 'Delhi', NULL, '2026-09-28 11:02:26', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('264', 'demo_carousel_goa.jpg', 'Goa.jpg', 'uploads/media/demo_carousel_goa.jpg', '419713', 'image/jpeg', 'Goa', 'Goa', NULL, '2026-09-28 11:02:26', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('265', 'demo_carousel_karnataka.jpg', 'Karnataka.jpg', 'uploads/media/demo_carousel_karnataka.jpg', '281788', 'image/jpeg', 'Karnataka', 'Karnataka', NULL, '2026-09-28 11:02:26', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('266', 'demo_carousel_kerala.jpg', 'Kerala.jpg', 'uploads/media/demo_carousel_kerala.jpg', '84784', 'image/jpeg', 'Kerala', 'Kerala', NULL, '2026-09-28 11:02:26', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('267', 'demo_carousel_pondicherry.jpg', 'Pondicherry.jpg', 'uploads/media/demo_carousel_pondicherry.jpg', '193518', 'image/jpeg', 'Pondicherry', 'Pondicherry', NULL, '2026-09-28 11:02:26', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('268', 'demo_carousel_rajasthan.jpg', 'Rajasthan.jpg', 'uploads/media/demo_carousel_rajasthan.jpg', '466425', 'image/jpeg', 'Rajasthan', 'Rajasthan', NULL, '2026-09-28 11:02:26', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('269', 'demo_carousel_tajmahal.jpg', 'TajMahal.jpg', 'uploads/media/demo_carousel_tajmahal.jpg', '225777', 'image/jpeg', 'TajMahal', 'TajMahal', NULL, '2026-09-28 11:02:26', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('270', 'demo_carousel_tamilnadu.jpg', 'TamilNadu.jpg', 'uploads/media/demo_carousel_tamilnadu.jpg', '160437', 'image/jpeg', 'TamilNadu', 'TamilNadu', NULL, '2026-09-28 11:02:26', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('273', 'demo_goa_beaches_view_1.jpg', 'View_1.jpg', 'uploads/media/demo_goa_beaches_view_1.jpg', '90437', 'image/jpeg', 'View_1', 'View_1', NULL, '2026-09-28 11:02:26', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('275', 'demo_goa_beaches_view_3.jpg', 'View_3.jpg', 'uploads/media/demo_goa_beaches_view_3.jpg', '62758', 'image/jpeg', 'View_3', 'View_3', NULL, '2026-09-28 11:02:26', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('276', 'demo_goa_beaches_view_4.jpg', 'View_4.jpg', 'uploads/media/demo_goa_beaches_view_4.jpg', '88182', 'image/jpeg', 'View_4', 'View_4', NULL, '2026-09-28 11:02:26', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('277', 'demo_goa_beaches.jpg', 'Beaches.jpg', 'uploads/media/demo_goa_beaches.jpg', '153635', 'image/jpeg', 'Beaches', 'Beaches', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('279', 'demo_goa_beach_2.jpg', 'Beach_2.jpg', 'uploads/media/demo_goa_beach_2.jpg', '60824', 'image/jpeg', 'Beach_2', 'Beach_2', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('282', 'demo_goa_culture.jpg', 'Culture.jpg', 'uploads/media/demo_goa_culture.jpg', '326736', 'image/jpeg', 'Culture', 'Culture', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('283', 'demo_goa_home.jpg', 'Home.jpg', 'uploads/media/demo_goa_home.jpg', '114437', 'image/jpeg', 'Home', 'Home', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('284', 'demo_goa_margoa_view_1.jpg', 'View_1.jpg', 'uploads/media/demo_goa_margoa_view_1.jpg', '509004', 'image/jpeg', 'View_1', 'View_1', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('285', 'demo_goa_margoa_view_2.jpg', 'View_2.jpg', 'uploads/media/demo_goa_margoa_view_2.jpg', '101569', 'image/jpeg', 'View_2', 'View_2', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('286', 'demo_goa_margoa_view_3.jpg', 'View_3.jpg', 'uploads/media/demo_goa_margoa_view_3.jpg', '42732', 'image/jpeg', 'View_3', 'View_3', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('287', 'demo_goa_margoa_view_4.jpg', 'View_4.jpg', 'uploads/media/demo_goa_margoa_view_4.jpg', '59790', 'image/jpeg', 'View_4', 'View_4', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('288', 'demo_goa_margoa.jpg', 'Margoa.jpg', 'uploads/media/demo_goa_margoa.jpg', '236835', 'image/jpeg', 'Margoa', 'Margoa', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('289', 'demo_goa_nationalparks_view_1.jpg', 'View_1.jpg', 'uploads/media/demo_goa_nationalparks_view_1.jpg', '792895', 'image/jpeg', 'View_1', 'View_1', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('290', 'demo_goa_nationalparks_view_2.jpg', 'View_2.jpg', 'uploads/media/demo_goa_nationalparks_view_2.jpg', '348449', 'image/jpeg', 'View_2', 'View_2', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('291', 'demo_goa_nationalparks_view_3.jpg', 'View_3.jpg', 'uploads/media/demo_goa_nationalparks_view_3.jpg', '100796', 'image/jpeg', 'View_3', 'View_3', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('292', 'demo_goa_nationalparks_view_4.jpg', 'View_4.jpg', 'uploads/media/demo_goa_nationalparks_view_4.jpg', '115774', 'image/jpeg', 'View_4', 'View_4', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('294', 'demo_goa_nationalparks.jpg', 'NationalParks.jpg', 'uploads/media/demo_goa_nationalparks.jpg', '355421', 'image/jpeg', 'NationalParks', 'NationalParks', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('295', 'demo_goa_oldgoa_view_1.jpg', 'View_1.jpg', 'uploads/media/demo_goa_oldgoa_view_1.jpg', '839177', 'image/jpeg', 'View_1', 'View_1', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('296', 'demo_goa_oldgoa_view_2.jpg', 'View_2.jpg', 'uploads/media/demo_goa_oldgoa_view_2.jpg', '118558', 'image/jpeg', 'View_2', 'View_2', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('297', 'demo_goa_oldgoa_view_3.jpg', 'View_3.jpg', 'uploads/media/demo_goa_oldgoa_view_3.jpg', '79366', 'image/jpeg', 'View_3', 'View_3', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('298', 'demo_goa_oldgoa_view_4.jpg', 'View_4.jpg', 'uploads/media/demo_goa_oldgoa_view_4.jpg', '82768', 'image/jpeg', 'View_4', 'View_4', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('299', 'demo_goa_oldgoa_view_5.jpg', 'View_5.jpg', 'uploads/media/demo_goa_oldgoa_view_5.jpg', '51428', 'image/jpeg', 'View_5', 'View_5', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('300', 'demo_goa_oldgoa.jpg', 'OldGoa.jpg', 'uploads/media/demo_goa_oldgoa.jpg', '98435', 'image/jpeg', 'OldGoa', 'OldGoa', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('301', 'demo_goa_sanctuaries_view_1.jpg', 'View_1.jpg', 'uploads/media/demo_goa_sanctuaries_view_1.jpg', '279863', 'image/jpeg', 'View_1', 'View_1', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('302', 'demo_goa_sanctuaries_view_2.jpg', 'View_2.jpg', 'uploads/media/demo_goa_sanctuaries_view_2.jpg', '125843', 'image/jpeg', 'View_2', 'View_2', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('303', 'demo_goa_sanctuaries_view_3.jpg', 'View_3.jpg', 'uploads/media/demo_goa_sanctuaries_view_3.jpg', '66314', 'image/jpeg', 'View_3', 'View_3', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('304', 'demo_goa_sanctuaries_view_4.jpg', 'View_4.jpg', 'uploads/media/demo_goa_sanctuaries_view_4.jpg', '68974', 'image/jpeg', 'View_4', 'View_4', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('306', 'demo_goa_sanctuaries.jpg', 'Sanctuaries.jpg', 'uploads/media/demo_goa_sanctuaries.jpg', '514932', 'image/jpeg', 'Sanctuaries', 'Sanctuaries', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('307', 'demo_goa_waterfalls_view_1.jpg', 'View_1.jpg', 'uploads/media/demo_goa_waterfalls_view_1.jpg', '307912', 'image/jpeg', 'View_1', 'View_1', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('308', 'demo_goa_waterfalls_view_2.jpg', 'View_2.jpg', 'uploads/media/demo_goa_waterfalls_view_2.jpg', '418626', 'image/jpeg', 'View_2', 'View_2', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('309', 'demo_goa_waterfalls_view_3.jpg', 'View_3.jpg', 'uploads/media/demo_goa_waterfalls_view_3.jpg', '66259', 'image/jpeg', 'View_3', 'View_3', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('310', 'demo_goa_waterfalls_view_4.jpg', 'View_4.jpg', 'uploads/media/demo_goa_waterfalls_view_4.jpg', '74448', 'image/jpeg', 'View_4', 'View_4', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('311', 'demo_goa_waterfalls_view_5.jpg', 'View_5.jpg', 'uploads/media/demo_goa_waterfalls_view_5.jpg', '88851', 'image/jpeg', 'View_5', 'View_5', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('312', 'demo_goa_waterfalls_view_6.jpg', 'View_6.jpg', 'uploads/media/demo_goa_waterfalls_view_6.jpg', '87787', 'image/jpeg', 'View_6', 'View_6', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('313', 'demo_goa_waterfalls.jpg', 'WaterFalls.jpg', 'uploads/media/demo_goa_waterfalls.jpg', '216799', 'image/jpeg', 'WaterFalls', 'WaterFalls', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('314', 'demo_home_center.jpg', 'Center.jpg', 'uploads/media/demo_home_center.jpg', '183620', 'image/jpeg', 'Center', 'Center', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('315', 'demo_home_delhi.jpg', 'Delhi.jpg', 'uploads/media/demo_home_delhi.jpg', '407342', 'image/jpeg', 'Delhi', 'Delhi', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('316', 'demo_home_goa.jpg', 'Goa.jpg', 'uploads/media/demo_home_goa.jpg', '286473', 'image/jpeg', 'Goa', 'Goa', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('317', 'demo_home_indiamap.png', 'IndiaMap.PNG', 'uploads/media/demo_home_indiamap.png', '912427', 'image/png', 'IndiaMap', 'IndiaMap', NULL, '2026-09-28 11:02:27', '2026-11-14 09:17:38');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('318', 'demo_home_karnataka.jpg', 'Karnataka.jpg', 'uploads/media/demo_home_karnataka.jpg', '291832', 'image/jpeg', 'Karnataka', 'Karnataka', NULL, '2026-09-28 11:02:28', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('319', 'demo_home_kerala.jpg', 'Kerala.jpg', 'uploads/media/demo_home_kerala.jpg', '204675', 'image/jpeg', 'Kerala', 'Kerala', NULL, '2026-09-28 11:02:28', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('322', 'demo_home_rajasthan.jpg', 'Rajasthan.jpg', 'uploads/media/demo_home_rajasthan.jpg', '128104', 'image/jpeg', 'Rajasthan', 'Rajasthan', NULL, '2026-09-28 11:02:28', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('323', 'demo_home_tajmahal.jpg', 'TajMahal.jpg', 'uploads/media/demo_home_tajmahal.jpg', '372804', 'image/jpeg', 'TajMahal', 'TajMahal', NULL, '2026-09-28 11:02:28', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('325', 'demo_home.jpeg', 'Home.jpeg', 'uploads/media/demo_home.jpeg', '187889', 'image/jpeg', 'Home', 'Home', NULL, '2026-09-28 11:02:28', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('326', 'demo_home.jpg', 'Home.jpg', 'uploads/media/demo_home.jpg', '4368254', 'image/jpeg', 'Home', 'Home', NULL, '2026-09-28 11:02:28', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('333', 'demo_karnataka_bangalore_view_1.jpg', 'View_1.jpg', 'uploads/media/demo_karnataka_bangalore_view_1.jpg', '128124', 'image/jpeg', 'View_1', 'View_1', NULL, '2026-09-28 11:02:28', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('334', 'demo_karnataka_bangalore_view_2.jpg', 'View_2.jpg', 'uploads/media/demo_karnataka_bangalore_view_2.jpg', '404116', 'image/jpeg', 'View_2', 'View_2', NULL, '2026-09-28 11:02:28', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('337', 'demo_karnataka_bangalore.jpg', 'Bangalore.jpg', 'uploads/media/demo_karnataka_bangalore.jpg', '145489', 'image/jpeg', 'Bangalore', 'Bangalore', NULL, '2026-09-28 11:02:28', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('338', 'demo_karnataka_coorg_view_1.jpg', 'View_1.jpg', 'uploads/media/demo_karnataka_coorg_view_1.jpg', '676762', 'image/jpeg', 'View_1', 'View_1', NULL, '2026-09-28 11:02:28', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('339', 'demo_karnataka_coorg_view_2.jpg', 'View_2.jpg', 'uploads/media/demo_karnataka_coorg_view_2.jpg', '310942', 'image/jpeg', 'View_2', 'View_2', NULL, '2026-09-28 11:02:28', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('340', 'demo_karnataka_coorg_view_3.jpg', 'View_3.jpg', 'uploads/media/demo_karnataka_coorg_view_3.jpg', '91554', 'image/jpeg', 'View_3', 'View_3', NULL, '2026-09-28 11:02:28', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('342', 'demo_karnataka_coorg.jpg', 'Coorg.jpg', 'uploads/media/demo_karnataka_coorg.jpg', '122848', 'image/jpeg', 'Coorg', 'Coorg', NULL, '2026-09-28 11:02:28', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('344', 'demo_karnataka_hampi_view_1.jpg', 'View_1.jpg', 'uploads/media/demo_karnataka_hampi_view_1.jpg', '108941', 'image/jpeg', 'View_1', 'View_1', NULL, '2026-09-28 11:02:28', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('345', 'demo_karnataka_hampi_view_2.jpg', 'View_2.jpg', 'uploads/media/demo_karnataka_hampi_view_2.jpg', '63332', 'image/jpeg', 'View_2', 'View_2', NULL, '2026-09-28 11:02:28', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('348', 'demo_karnataka_hampi.jpg', 'Hampi.jpg', 'uploads/media/demo_karnataka_hampi.jpg', '318269', 'image/jpeg', 'Hampi', 'Hampi', NULL, '2026-09-28 11:02:28', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('349', 'demo_karnataka_home.jpg', 'Home.jpg', 'uploads/media/demo_karnataka_home.jpg', '244928', 'image/jpeg', 'Home', 'Home', NULL, '2026-09-28 11:02:28', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('350', 'demo_karnataka_mangalore_view_1.jpg', 'View_1.jpg', 'uploads/media/demo_karnataka_mangalore_view_1.jpg', '139951', 'image/jpeg', 'View_1', 'View_1', NULL, '2026-09-28 11:02:28', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('351', 'demo_karnataka_mangalore_view_2.jpg', 'View_2.jpg', 'uploads/media/demo_karnataka_mangalore_view_2.jpg', '323641', 'image/jpeg', 'View_2', 'View_2', NULL, '2026-09-28 11:02:28', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('354', 'demo_karnataka_mangalore.jpg', 'Mangalore.jpg', 'uploads/media/demo_karnataka_mangalore.jpg', '313733', 'image/jpeg', 'Mangalore', 'Mangalore', NULL, '2026-09-28 11:02:28', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('355', 'demo_karnataka_mysore_view_1.jpg', 'View_1.jpg', 'uploads/media/demo_karnataka_mysore_view_1.jpg', '165618', 'image/jpeg', 'View_1', 'View_1', NULL, '2026-09-28 11:02:28', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('356', 'demo_karnataka_mysore_view_2.jpg', 'View_2.jpg', 'uploads/media/demo_karnataka_mysore_view_2.jpg', '179551', 'image/jpeg', 'View_2', 'View_2', NULL, '2026-09-28 11:02:28', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('359', 'demo_karnataka_mysore.jpg', 'Mysore.jpg', 'uploads/media/demo_karnataka_mysore.jpg', '534164', 'image/jpeg', 'Mysore', 'Mysore', NULL, '2026-09-28 11:02:29', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('360', 'demo_karnataka_nationalparks_view_1.jpg', 'View_1.jpg', 'uploads/media/demo_karnataka_nationalparks_view_1.jpg', '193510', 'image/jpeg', 'View_1', 'View_1', NULL, '2026-09-28 11:02:29', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('361', 'demo_karnataka_nationalparks_view_2.jpg', 'View_2.jpg', 'uploads/media/demo_karnataka_nationalparks_view_2.jpg', '351429', 'image/jpeg', 'View_2', 'View_2', NULL, '2026-09-28 11:02:29', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('364', 'demo_karnataka_nationalparks.jpg', 'NationalParks.jpg', 'uploads/media/demo_karnataka_nationalparks.jpg', '357846', 'image/jpeg', 'NationalParks', 'NationalParks', NULL, '2026-09-28 11:02:29', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('365', 'demo_kerala_alappuzha_view_1.jpg', 'View_1.jpg', 'uploads/media/demo_kerala_alappuzha_view_1.jpg', '139295', 'image/jpeg', 'View_1', 'View_1', NULL, '2026-09-28 11:02:29', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('366', 'demo_kerala_alappuzha_view_2.jpg', 'View_2.jpg', 'uploads/media/demo_kerala_alappuzha_view_2.jpg', '106467', 'image/jpeg', 'View_2', 'View_2', NULL, '2026-09-28 11:02:29', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('369', 'demo_kerala_alappuzha.jpg', 'Alappuzha.jpg', 'uploads/media/demo_kerala_alappuzha.jpg', '158083', 'image/jpeg', 'Alappuzha', 'Alappuzha', NULL, '2026-09-28 11:02:29', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('370', 'demo_kerala_cochin_view_1.jpg', 'View_1.jpg', 'uploads/media/demo_kerala_cochin_view_1.jpg', '121910', 'image/jpeg', 'View_1', 'View_1', NULL, '2026-09-28 11:02:29', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('371', 'demo_kerala_cochin_view_2.jpg', 'View_2.jpg', 'uploads/media/demo_kerala_cochin_view_2.jpg', '270857', 'image/jpeg', 'View_2', 'View_2', NULL, '2026-09-28 11:02:29', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('374', 'demo_kerala_cochin.jpg', 'Cochin.jpg', 'uploads/media/demo_kerala_cochin.jpg', '106866', 'image/jpeg', 'Cochin', 'Cochin', NULL, '2026-09-28 11:02:29', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('376', 'demo_kerala_home.jpg', 'Home.jpg', 'uploads/media/demo_kerala_home.jpg', '291361', 'image/jpeg', 'Home', 'Home', NULL, '2026-09-28 11:02:29', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('377', 'demo_kerala_munnar_view_1.jpg', 'View_1.jpg', 'uploads/media/demo_kerala_munnar_view_1.jpg', '105493', 'image/jpeg', 'View_1', 'View_1', NULL, '2026-09-28 11:02:29', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('378', 'demo_kerala_munnar_view_2.jpg', 'View_2.jpg', 'uploads/media/demo_kerala_munnar_view_2.jpg', '244240', 'image/jpeg', 'View_2', 'View_2', NULL, '2026-09-28 11:02:29', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('381', 'demo_kerala_munnar.jpg', 'Munnar.jpg', 'uploads/media/demo_kerala_munnar.jpg', '379101', 'image/jpeg', 'Munnar', 'Munnar', NULL, '2026-09-28 11:02:29', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('382', 'demo_kerala_nationalparks_view_1.jpg', 'View_1.jpg', 'uploads/media/demo_kerala_nationalparks_view_1.jpg', '509718', 'image/jpeg', 'View_1', 'View_1', NULL, '2026-09-28 11:02:29', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('383', 'demo_kerala_nationalparks_view_2.jpg', 'View_2.jpg', 'uploads/media/demo_kerala_nationalparks_view_2.jpg', '1089353', 'image/jpeg', 'View_2', 'View_2', NULL, '2026-09-28 11:02:29', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('386', 'demo_kerala_nationalparks.jpg', 'NationalParks.jpg', 'uploads/media/demo_kerala_nationalparks.jpg', '546127', 'image/jpeg', 'NationalParks', 'NationalParks', NULL, '2026-09-28 11:02:29', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('387', 'demo_kerala_trivandrum_view_1.jpg', 'View_1.jpg', 'uploads/media/demo_kerala_trivandrum_view_1.jpg', '688753', 'image/jpeg', 'View_1', 'View_1', NULL, '2026-09-28 11:02:29', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('388', 'demo_kerala_trivandrum_view_2.jpg', 'View_2.jpg', 'uploads/media/demo_kerala_trivandrum_view_2.jpg', '153944', 'image/jpeg', 'View_2', 'View_2', NULL, '2026-09-28 11:02:29', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('391', 'demo_kerala_trivandrum.jpg', 'Trivandrum.jpg', 'uploads/media/demo_kerala_trivandrum.jpg', '106306', 'image/jpeg', 'Trivandrum', 'Trivandrum', NULL, '2026-09-28 11:02:29', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('392', 'demo_kerala_varkala_view_1.jpg', 'View_1.jpg', 'uploads/media/demo_kerala_varkala_view_1.jpg', '51947', 'image/jpeg', 'View_1', 'View_1', NULL, '2026-09-28 11:02:29', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('393', 'demo_kerala_varkala_view_2.jpg', 'View_2.jpg', 'uploads/media/demo_kerala_varkala_view_2.jpg', '760106', 'image/jpeg', 'View_2', 'View_2', NULL, '2026-09-28 11:02:29', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('396', 'demo_kerala_varkala.jpg', 'Varkala.jpg', 'uploads/media/demo_kerala_varkala.jpg', '521996', 'image/jpeg', 'Varkala', 'Varkala', NULL, '2026-09-28 11:02:29', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('400', 'demo_logo.jpg', 'Logo.jpg', 'uploads/media/demo_logo.jpg', '5636', 'image/jpeg', 'Logo', 'Logo', NULL, '2026-09-28 11:02:30', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('401', 'demo_logo.png', 'Logo.png', 'uploads/media/demo_logo.png', '36915', 'image/png', 'Logo', 'Logo', NULL, '2026-09-28 11:02:30', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('402', 'demo_services_food.jpg', 'Food.jpg', 'uploads/media/demo_services_food.jpg', '432447', 'image/jpeg', 'Food', 'Food', NULL, '2026-09-28 11:02:30', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('404', 'demo_services_hotel.jpg', 'Hotel.jpg', 'uploads/media/demo_services_hotel.jpg', '159225', 'image/jpeg', 'Hotel', 'Hotel', NULL, '2026-09-28 11:02:30', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('405', 'demo_services_photographic.jpg', 'Photographic.jpg', 'uploads/media/demo_services_photographic.jpg', '137037', 'image/jpeg', 'Photographic', 'Photographic', NULL, '2026-09-28 11:02:30', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('406', 'demo_services_ticketbooking.jpg', 'TicketBooking.jpg', 'uploads/media/demo_services_ticketbooking.jpg', '124983', 'image/jpeg', 'TicketBooking', 'TicketBooking', NULL, '2026-09-28 11:02:30', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('408', 'demo_tamilnadu_chennai_view_1.jpg', 'View_1.jpg', 'uploads/media/demo_tamilnadu_chennai_view_1.jpg', '202707', 'image/jpeg', 'View_1', 'View_1', NULL, '2026-09-28 11:02:30', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('409', 'demo_tamilnadu_chennai_view_2.jpg', 'View_2.jpg', 'uploads/media/demo_tamilnadu_chennai_view_2.jpg', '125075', 'image/jpeg', 'View_2', 'View_2', NULL, '2026-09-28 11:02:30', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('412', 'demo_tamilnadu_chennai.jpg', 'Chennai.jpg', 'uploads/media/demo_tamilnadu_chennai.jpg', '368374', 'image/jpeg', 'Chennai', 'Chennai', NULL, '2026-09-28 11:02:30', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('414', 'demo_tamilnadu_home.jpg', 'Home.jpg', 'uploads/media/demo_tamilnadu_home.jpg', '527008', 'image/jpeg', 'Home', 'Home', NULL, '2026-09-28 11:02:30', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('415', 'demo_tamilnadu_kanchipuram_view_1.jpg', 'View_1.jpg', 'uploads/media/demo_tamilnadu_kanchipuram_view_1.jpg', '112780', 'image/jpeg', 'View_1', 'View_1', NULL, '2026-09-28 11:02:30', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('416', 'demo_tamilnadu_kanchipuram_view_2.jpg', 'View_2.jpg', 'uploads/media/demo_tamilnadu_kanchipuram_view_2.jpg', '166254', 'image/jpeg', 'View_2', 'View_2', NULL, '2026-09-28 11:02:30', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('417', 'demo_tamilnadu_kanchipuram.jpg', 'Kanchipuram.jpg', 'uploads/media/demo_tamilnadu_kanchipuram.jpg', '567836', 'image/jpeg', 'Kanchipuram', 'Kanchipuram', NULL, '2026-09-28 11:02:30', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('418', 'demo_tamilnadu_madurai_view_1.jpg', 'View_1.jpg', 'uploads/media/demo_tamilnadu_madurai_view_1.jpg', '373099', 'image/jpeg', 'View_1', 'View_1', NULL, '2026-09-28 11:02:30', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('419', 'demo_tamilnadu_madurai_view_2.jpg', 'View_2.jpg', 'uploads/media/demo_tamilnadu_madurai_view_2.jpg', '498315', 'image/jpeg', 'View_2', 'View_2', NULL, '2026-09-28 11:02:30', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('422', 'demo_tamilnadu_madurai.jpg', 'Madurai.jpg', 'uploads/media/demo_tamilnadu_madurai.jpg', '202435', 'image/jpeg', 'Madurai', 'Madurai', NULL, '2026-09-28 11:02:30', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('423', 'demo_tamilnadu_mahabalipuram_view_1.jpg', 'View_1.jpg', 'uploads/media/demo_tamilnadu_mahabalipuram_view_1.jpg', '213273', 'image/jpeg', 'View_1', 'View_1', NULL, '2026-09-28 11:02:30', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('424', 'demo_tamilnadu_mahabalipuram_view_2.jpg', 'View_2.jpg', 'uploads/media/demo_tamilnadu_mahabalipuram_view_2.jpg', '190490', 'image/jpeg', 'View_2', 'View_2', NULL, '2026-09-28 11:02:30', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('427', 'demo_tamilnadu_mahabalipuram.jpg', 'Mahabalipuram.jpg', 'uploads/media/demo_tamilnadu_mahabalipuram.jpg', '324742', 'image/jpeg', 'Mahabalipuram', 'Mahabalipuram', NULL, '2026-09-28 11:02:30', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('428', 'demo_tamilnadu_pondicherry_view_1.jpg', 'View_1.jpg', 'uploads/media/demo_tamilnadu_pondicherry_view_1.jpg', '213893', 'image/jpeg', 'View_1', 'View_1', NULL, '2026-09-28 11:02:30', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('429', 'demo_tamilnadu_pondicherry_view_2.jpg', 'View_2.jpg', 'uploads/media/demo_tamilnadu_pondicherry_view_2.jpg', '148205', 'image/jpeg', 'View_2', 'View_2', NULL, '2026-09-28 11:02:30', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('432', 'demo_tamilnadu_pondicherry.jpg', 'Pondicherry.jpg', 'uploads/media/demo_tamilnadu_pondicherry.jpg', '206223', 'image/jpeg', 'Pondicherry', 'Pondicherry', NULL, '2026-09-28 11:02:30', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('433', 'demo_tamilnadu_thanjavur_view_1.jpg', 'View_1.jpg', 'uploads/media/demo_tamilnadu_thanjavur_view_1.jpg', '773119', 'image/jpeg', 'View_1', 'View_1', NULL, '2026-09-28 11:02:30', '2026-11-14 09:17:39');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('434', 'demo_tamilnadu_thanjavur_view_2.jpg', 'View_2.jpg', 'uploads/media/demo_tamilnadu_thanjavur_view_2.jpg', '169002', 'image/jpeg', 'View_2', 'View_2', NULL, '2026-09-28 11:02:30', '2026-11-14 09:17:40');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('437', 'demo_tamilnadu_thanjavur.jpg', 'Thanjavur.jpg', 'uploads/media/demo_tamilnadu_thanjavur.jpg', '231745', 'image/jpeg', 'Thanjavur', 'Thanjavur', NULL, '2026-09-28 11:02:30', '2026-11-14 09:17:40');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('438', 'demo_tamilnadu_thiruvannamalai_view_1.jpg', 'View_1.jpg', 'uploads/media/demo_tamilnadu_thiruvannamalai_view_1.jpg', '469184', 'image/jpeg', 'View_1', 'View_1', NULL, '2026-09-28 11:02:30', '2026-11-14 09:17:40');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('439', 'demo_tamilnadu_thiruvannamalai_view_2.jpg', 'View_2.jpg', 'uploads/media/demo_tamilnadu_thiruvannamalai_view_2.jpg', '379992', 'image/jpeg', 'View_2', 'View_2', NULL, '2026-09-28 11:02:30', '2026-11-14 09:17:40');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('442', 'demo_tamilnadu_thiruvannamalai.jpg', 'Thiruvannamalai.jpg', 'uploads/media/demo_tamilnadu_thiruvannamalai.jpg', '363916', 'image/jpeg', 'Thiruvannamalai', 'Thiruvannamalai', NULL, '2026-09-28 11:02:31', '2026-11-14 09:17:40');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('443', 'demo_tamilnadu_trichy_view_1.jpg', 'View_1.jpg', 'uploads/media/demo_tamilnadu_trichy_view_1.jpg', '105797', 'image/jpeg', 'View_1', 'View_1', NULL, '2026-09-28 11:02:31', '2026-11-14 09:17:40');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('447', 'demo_tamilnadu_trichy.jpg', 'Trichy.jpg', 'uploads/media/demo_tamilnadu_trichy.jpg', '166897', 'image/jpeg', 'Trichy', 'Trichy', NULL, '2026-09-28 11:02:31', '2026-11-14 09:17:40');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('449', 'demo_thingstodo_bgimg.jpg', 'bgimg.jpg', 'uploads/media/demo_thingstodo_bgimg.jpg', '123944', 'image/jpeg', 'bgimg', 'bgimg', NULL, '2026-09-28 11:02:31', '2026-11-14 09:17:40');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('450', 'demo_thingstodo_citytour.jpg', 'CityTour.jpg', 'uploads/media/demo_thingstodo_citytour.jpg', '198052', 'image/jpeg', 'CityTour', 'CityTour', NULL, '2026-09-28 11:02:31', '2026-11-14 09:17:40');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('451', 'demo_thingstodo_drinks.jpg', 'Drinks.jpg', 'uploads/media/demo_thingstodo_drinks.jpg', '134027', 'image/jpeg', 'Drinks', 'Drinks', NULL, '2026-09-28 11:02:31', '2026-11-14 09:17:40');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('457', 'demo_thingstodo_goa_wildlife.jpg', 'WildLife.jpg', 'uploads/media/demo_thingstodo_goa_wildlife.jpg', '333593', 'image/jpeg', 'WildLife', 'WildLife', NULL, '2026-09-28 11:02:31', '2026-11-14 09:17:40');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('485', 'demo_landingpage.jpg', 'LandingPage.jpg', 'uploads/media/demo_landingpage.jpg', '407878', 'image/jpeg', 'Wander South India', 'Landing Page Banner', NULL, '2026-09-28 11:29:36', '2026-11-14 09:17:40');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('501', 'palmleaf_sage_astrology.jpg', 'Sacred Palm Leaf Sage & Nadi Astrology Horoscope', 'uploads/media/palmleaf_sage_astrology.jpg', '560887', 'image/jpeg', 'Ancient Sage Reading Sacred Palm Leaf Horoscope with Golden Zodiac Wheel', 'Sacred Agastya Maharishi Nadi Astrology Journey at Vaitheeswaran Kovil', NULL, '2026-11-05 15:21:34', '2026-11-14 09:17:40');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('502', 'palmleaf_manuscripts_bundle.jpg', 'Authentic Inscribed Palm Leaf Manuscripts (Olai Chuvadi) Bundle', 'uploads/media/palmleaf_manuscripts_bundle.jpg', '891211', 'image/jpeg', 'Ancient Palm Leaf Manuscripts Bound with Sacred Thread and Brass Diya', 'Centuries-old palm leaf bundles containing life destiny chapters', NULL, '2026-11-05 15:21:34', '2026-11-14 09:17:40');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('503', 'palmleaf_nadi_reader_temple.jpg', 'Revered Nadi Astrologer Deciphering Destiny Leaf in Temple Hall', 'uploads/media/palmleaf_nadi_reader_temple.jpg', '919170', 'image/jpeg', 'Traditional South Indian Nadi Reader in Saffron Robes Examining Palm Leaf', 'Personalized reading session deciphering past, present, and future karmic paths', NULL, '2026-11-05 15:21:34', '2026-11-14 09:17:40');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('504', 'surfing_tour_banner.jpg', 'Covelong Point Ocean Surfing Expedition Banner', 'uploads/media/surfing_tour_banner.jpg', '181067', 'image/jpeg', 'Surfing Tour at Covelong Point & Mahabalipuram Coastal Waves', 'Ride South India waves with certified ISA surf coaches', NULL, '2026-11-05 15:21:34', '2026-11-14 09:17:40');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('505', 'surfing_action_waves.jpg', 'Surfer Carving Green Ocean Wave', 'uploads/media/surfing_action_waves.jpg', '279213', 'image/jpeg', 'Surfing Action in Bay of Bengal Swell', 'Intermediate and advanced coaching on reef and point breaks', NULL, '2026-11-05 15:21:34', '2026-11-14 09:17:40');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('506', 'surfing_beach_coaching.jpg', 'Beachside Surf Safety and Pop-up Technique Training', 'uploads/media/surfing_beach_coaching.jpg', '132435', 'image/jpeg', 'Beginner Surf Coaching on Sand', 'Safety, paddling techniques, and surfboard orientation', NULL, '2026-11-05 15:21:34', '2026-11-14 09:17:40');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('508', 'palmleaf_vaitheeswaran_kovil_dawn.jpg', 'Vaitheeswaran Kovil Dravidian Temple Gopuram and Sacred Pond at Dawn', 'uploads/media/palmleaf_vaitheeswaran_kovil_dawn.jpg', '886850', 'image/jpeg', 'Majestic Vaitheeswaran Kovil Temple Reflecting in Siddhamirtham Tank', 'Divine healing center and Navagraha pilgrimage site in Tamil Nadu', NULL, '2026-11-12 09:29:22', '2026-11-14 09:17:40');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('510', 'medical_blood_pro.jpg', 'medical_blood_pro.jpg', 'uploads/media/medical_blood_pro.jpg', '286575', 'image/jpeg', 'Medical Blood Pro', NULL, NULL, '2026-11-14 09:19:42', '2026-11-14 09:19:42');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('512', 'medical_dexa_scan.jpg', 'medical_dexa_scan.jpg', 'uploads/media/medical_dexa_scan.jpg', '260758', 'image/jpeg', 'Medical Dexa Scan', NULL, NULL, '2026-11-14 09:19:42', '2026-11-14 09:19:42');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('514', 'medical_full_body_mri.jpg', 'medical_full_body_mri.jpg', 'uploads/media/medical_full_body_mri.jpg', '284003', 'image/jpeg', 'Medical Full Body Mri', NULL, NULL, '2026-11-14 09:19:42', '2026-11-14 09:19:42');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('516', 'medical_package_banner.jpg', 'medical_package_banner.jpg', 'uploads/media/medical_package_banner.jpg', '260677', 'image/jpeg', 'Medical Package Banner', NULL, NULL, '2026-11-14 09:19:42', '2026-11-14 09:19:42');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('517', 'medical_rmr_metabolic.jpg', 'medical_rmr_metabolic.jpg', 'uploads/media/medical_rmr_metabolic.jpg', '277094', 'image/jpeg', 'Medical Rmr Metabolic', NULL, NULL, '2026-11-14 09:19:42', '2026-11-14 09:19:42');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('519', 'medical_strength_pro.jpg', 'medical_strength_pro.jpg', 'uploads/media/medical_strength_pro.jpg', '301976', 'image/jpeg', 'Medical Strength Pro', NULL, NULL, '2026-11-14 09:19:42', '2026-11-14 09:19:42');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('521', 'medical_vo2_max.jpg', 'medical_vo2_max.jpg', 'uploads/media/medical_vo2_max.jpg', '289990', 'image/jpeg', 'Medical Vo2 Max', NULL, NULL, '2026-11-14 09:19:42', '2026-11-14 09:19:42');
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`) VALUES ('525', 'tramax_logo.png', 'tramax_logo.png', 'uploads/media/tramax_logo.png', '640378', 'image/png', 'Tramax Logo', NULL, NULL, '2026-11-14 09:19:42', '2026-11-14 09:19:42');

-- -----------------------------------------------------
-- Table structure for `medical_assessment_tests`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `medical_assessment_tests`;
CREATE TABLE `medical_assessment_tests` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `assessment_id` int unsigned NOT NULL,
  `test_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `evaluation_details` text COLLATE utf8mb4_unicode_ci,
  `report_information` text COLLATE utf8mb4_unicode_ci,
  `display_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_assessment_order` (`assessment_id`,`display_order`),
  CONSTRAINT `medical_assessment_tests_ibfk_1` FOREIGN KEY (`assessment_id`) REFERENCES `medical_assessments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `medical_assessment_tests`
INSERT INTO `medical_assessment_tests` (`id`, `assessment_id`, `test_name`, `description`, `evaluation_details`, `report_information`, `display_order`, `created_at`, `updated_at`) VALUES ('1', '1', 'Whole Body Neuro & Spinal MRI', 'High-field axial and sagittal imaging of cerebral tissue, ventricular system, and spinal column.', 'Evaluates brain microvascular changes, silent infarctions, disc herniations, and spinal canal stenosis.', 'Multi-slice DICOM imaging archive and Radiologist diagnostic report.', '1', '2026-10-30 14:54:28', '2026-10-30 14:54:28');
INSERT INTO `medical_assessment_tests` (`id`, `assessment_id`, `test_name`, `description`, `evaluation_details`, `report_information`, `display_order`, `created_at`, `updated_at`) VALUES ('2', '1', 'Abdominal & Pelvic Organ MR Screening', 'Contrast-free organ parenchymal sequence evaluating abdominal viscus.', 'Detects organomegaly, focal lesions, renal cysts, and occult retroperitoneal pathology.', 'Cross-sectional volumetric assessment and organ health summary.', '2', '2026-10-30 14:54:28', '2026-10-30 14:54:28');
INSERT INTO `medical_assessment_tests` (`id`, `assessment_id`, `test_name`, `description`, `evaluation_details`, `report_information`, `display_order`, `created_at`, `updated_at`) VALUES ('3', '2', 'Bone Mineral Density (BMD) T-Score & Z-Score', 'Dual-energy radiologic assessment of axial skeleton bone matrix mineralization.', 'Screening for osteopenia, osteoporosis, and age-adjusted fracture risk prediction.', 'Full BMD T-score chart, WHO diagnostic categorization, and 10-year fracture risk index.', '1', '2026-10-30 14:54:28', '2026-10-30 14:54:28');
INSERT INTO `medical_assessment_tests` (`id`, `assessment_id`, `test_name`, `description`, `evaluation_details`, `report_information`, `display_order`, `created_at`, `updated_at`) VALUES ('4', '2', 'Segmental Body Composition & Visceral Fat Profiling', 'Total body dual-energy scan differentiating android vs gynoid fat distribution and lean muscle mass.', 'Assesses visceral adipose tissue associated with cardiovascular risk and sarcopenia.', 'Total fat percentage, visceral fat volume (cm³), and regional muscle mass balance.', '2', '2026-10-30 14:54:28', '2026-10-30 14:54:28');
INSERT INTO `medical_assessment_tests` (`id`, `assessment_id`, `test_name`, `description`, `evaluation_details`, `report_information`, `display_order`, `created_at`, `updated_at`) VALUES ('5', '3', 'Advanced Cardiovascular & Lipid Subfractions', 'Lipid fractionation including ApoB, Lp(a), hs-CRP, Total Cholesterol, HDL, LDL, and Triglycerides.', 'Evaluates vascular endothelial inflammation, atherogenic particle concentration, and long-term coronary risk.', 'Complete lipid panel with atherogenic index and cardiovascular risk score.', '1', '2026-10-30 14:54:28', '2026-10-30 14:54:28');
INSERT INTO `medical_assessment_tests` (`id`, `assessment_id`, `test_name`, `description`, `evaluation_details`, `report_information`, `display_order`, `created_at`, `updated_at`) VALUES ('6', '3', 'Comprehensive Metabolic & Organ Profile', 'Hepatic enzymes (ALT, AST, ALP, GGT), renal markers (Creatinine, eGFR, BUN), fasting glucose, and HbA1c.', 'Detects insulin resistance, early non-alcoholic fatty liver changes, and renal filtration efficiency.', 'Organ functional profiling with comparative reference ranges.', '2', '2026-10-30 14:54:28', '2026-10-30 14:54:28');
INSERT INTO `medical_assessment_tests` (`id`, `assessment_id`, `test_name`, `description`, `evaluation_details`, `report_information`, `display_order`, `created_at`, `updated_at`) VALUES ('7', '4', 'Breath-by-Breath Spiroergometry CPET', 'Gas exchange analysis with continuous 12-lead ECG monitoring under incremental physical workload.', 'Identifies true physiological aerobic capacity and rules out exercise-induced ischemia or arrhythmias.', 'VO₂ Max percentile classification, ventilatory thresholds, and cardio-respiratory fitness score.', '1', '2026-10-30 14:54:28', '2026-10-30 14:54:28');
INSERT INTO `medical_assessment_tests` (`id`, `assessment_id`, `test_name`, `description`, `evaluation_details`, `report_information`, `display_order`, `created_at`, `updated_at`) VALUES ('8', '5', 'Isometric Peak Force & Bilateral Symmetry Analysis', 'Multi-joint load cell dynamometry evaluating muscular power and agonist/antagonist force ratios.', 'Detects hidden musculoskeletal imbalances that lead to joint degradation, lower back pain, or sports injury.', 'Segmental strength distribution graph and corrective exercise recommendations.', '1', '2026-10-30 14:54:28', '2026-10-30 14:54:28');
INSERT INTO `medical_assessment_tests` (`id`, `assessment_id`, `test_name`, `description`, `evaluation_details`, `report_information`, `display_order`, `created_at`, `updated_at`) VALUES ('9', '6', 'Indirect Calorimetry Breath Analysis', 'Measurement of resting oxygen uptake with dilution canopy or calibrated mask under steady-state baseline rest.', 'Calculates exact individual resting calorie requirements to identify metabolic slowing or hypermetabolism.', 'Measured RMR vs predicted Harris-Benedict value and personalized caloric intake blueprint.', '1', '2026-10-30 14:54:28', '2026-10-30 14:54:28');

-- -----------------------------------------------------
-- Table structure for `medical_assessments`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `medical_assessments`;
CREATE TABLE `medical_assessments` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `medical_trip_id` int unsigned NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtitle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `short_description` text COLLATE utf8mb4_unicode_ci,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icon` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `covers` text COLLATE utf8mb4_unicode_ci,
  `display_order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_trip_order` (`medical_trip_id`,`display_order`),
  CONSTRAINT `medical_assessments_ibfk_1` FOREIGN KEY (`medical_trip_id`) REFERENCES `medical_trips` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `medical_assessments`
INSERT INTO `medical_assessments` (`id`, `medical_trip_id`, `title`, `subtitle`, `short_description`, `description`, `image`, `icon`, `covers`, `display_order`, `is_active`, `created_at`, `updated_at`) VALUES ('1', '1', 'Full Body MRI', 'Structural Assessment', 'Provides detailed images of your organs, tissues, bones and joints to detect structural abnormalities and early signs of disease.', 'High-resolution magnetic resonance imaging across brain, spine, thorax, abdomen, and pelvis utilizing cutting-edge non-invasive 3-Tesla MRI technology without radiation exposure.', '/uploads/media/medical_full_body_mri.jpg', 'Scan', 'Brain parenchyma, cervical/lumbar spine, liver, kidneys, pancreas, spleen, pelvic organs, major arterial vasculature, and musculoskeletal junctions.', '1', '1', '2026-10-30 14:54:28', '2026-11-05 13:34:02');
INSERT INTO `medical_assessments` (`id`, `medical_trip_id`, `title`, `subtitle`, `short_description`, `description`, `image`, `icon`, `covers`, `display_order`, `is_active`, `created_at`, `updated_at`) VALUES ('2', '1', 'DEXA Scan', 'Body Composition & Bone Density', 'Measures bone mineral density and body composition to assess bone health, muscle mass and fat distribution.', 'Dual-energy X-ray absorptiometry providing the clinical gold standard in bone mineral densitometry and segmental body fat quantification.', '/uploads/media/medical_dexa_scan.jpg', 'Bone', 'Lumbar spine (L1-L4), bilateral femoral neck, total body fat percentage, visceral adipose tissue (VAT), and appendicular lean mass.', '2', '1', '2026-10-30 14:54:28', '2026-11-05 12:42:02');
INSERT INTO `medical_assessments` (`id`, `medical_trip_id`, `title`, `subtitle`, `short_description`, `description`, `image`, `icon`, `covers`, `display_order`, `is_active`, `created_at`, `updated_at`) VALUES ('3', '1', 'Blood Pro', '120+ Blood Biomarkers', 'Comprehensive blood analysis of 120+ biomarkers to assess your overall health, organ function, metabolic health and more.', 'Exhaustive venous blood panel evaluating glycemic control, advanced lipid sub-fractions, liver and kidney function, thyroid endocrinology, hematology, and micronutrient status.', '/uploads/media/medical_blood_pro.jpg', 'Droplet', 'Complete Blood Count (CBC), Complete Metabolic Panel, High-Sensitivity CRP, Apolipoprotein B, HbA1c, Liver Function Panel, Kidney Function Panel, Thyroid Panel (TSH, FT3, FT4), Vitamin D & B12, and Electrolytes.', '3', '1', '2026-10-30 14:54:28', '2026-11-05 13:34:02');
INSERT INTO `medical_assessments` (`id`, `medical_trip_id`, `title`, `subtitle`, `short_description`, `description`, `image`, `icon`, `covers`, `display_order`, `is_active`, `created_at`, `updated_at`) VALUES ('4', '1', 'VO₂ Max Test', 'Aerobic Performance', 'Measures your maximum oxygen uptake to evaluate cardiovascular fitness and endurance capacity.', 'Cardiopulmonary exercise testing (CPET) measuring breath-by-breath oxygen consumption (VO₂) and carbon dioxide exhalation (VCO₂) during a graded treadmill protocol.', '/uploads/media/medical_vo2_max.jpg', 'Activity', 'Peak oxygen consumption (ml/kg/min), ventilatory anaerobic threshold (VT1 & VT2), maximum heart rate, and aerobic endurance capacity.', '4', '1', '2026-10-30 14:54:28', '2026-11-05 13:34:02');
INSERT INTO `medical_assessments` (`id`, `medical_trip_id`, `title`, `subtitle`, `short_description`, `description`, `image`, `icon`, `covers`, `display_order`, `is_active`, `created_at`, `updated_at`) VALUES ('5', '1', 'Strength Pro Assessment', 'Musculoskeletal Strength', 'Evaluates your muscular strength, balance, flexibility and functional movement for better performance and injury prevention.', 'Computerized dynamometry and functional movement analysis measuring isometric muscle strength, bilateral symmetry, postural stability, and joint range of motion.', '/uploads/media/medical_strength_pro.jpg', 'Dumbbell', 'Upper and lower body peak torque, limb asymmetry indices, core endurance, and functional mobility screens.', '5', '1', '2026-10-30 14:54:28', '2026-11-05 12:42:02');
INSERT INTO `medical_assessments` (`id`, `medical_trip_id`, `title`, `subtitle`, `short_description`, `description`, `image`, `icon`, `covers`, `display_order`, `is_active`, `created_at`, `updated_at`) VALUES ('6', '1', 'Resting Metabolic Rate (RMR)', 'Metabolic Function', 'Measures the number of calories your body burns at rest to help plan your nutrition, fitness and weight management goals.', 'Indirect calorimetry measurement under thermal neutral resting conditions determining baseline resting energy expenditure (REE) and substrate oxidation ratios.', '/uploads/media/medical_rmr_metabolic.jpg', 'Flame', 'Daily basal caloric expenditure (kcal/day), respiratory quotient (RQ), and carbohydrate vs fat metabolic fuel utilization.', '6', '1', '2026-10-30 14:54:28', '2026-11-05 12:42:02');

-- -----------------------------------------------------
-- Table structure for `medical_trip_bookings`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `medical_trip_bookings`;
CREATE TABLE `medical_trip_bookings` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `booking_reference` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `medical_trip_id` int unsigned NOT NULL,
  `customer_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `preferred_date` date NOT NULL,
  `number_of_persons` int unsigned NOT NULL DEFAULT '1',
  `message` text COLLATE utf8mb4_unicode_ci,
  `status` enum('new','contacted','planning','quoted','confirmed','closed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'new',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_reference` (`booking_reference`),
  KEY `idx_medical_trip_id` (`medical_trip_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `medical_trip_bookings_ibfk_1` FOREIGN KEY (`medical_trip_id`) REFERENCES `medical_trips` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `medical_trip_bookings`
INSERT INTO `medical_trip_bookings` (`id`, `booking_reference`, `medical_trip_id`, `customer_name`, `email`, `phone`, `preferred_date`, `number_of_persons`, `message`, `status`, `created_at`, `updated_at`) VALUES ('1', 'MED-2026-15FF2A', '1', 'Dr. John Watson', 'watson@bakerstreet.co.uk', '+44 7911 123456', '2026-11-20', '2', 'Interested in full body MRI scan and VO2 max test.', 'new', '2026-10-30 17:22:42', '2026-10-30 17:22:42');
INSERT INTO `medical_trip_bookings` (`id`, `booking_reference`, `medical_trip_id`, `customer_name`, `email`, `phone`, `preferred_date`, `number_of_persons`, `message`, `status`, `created_at`, `updated_at`) VALUES ('2', 'MED-2026-E10180', '1', 'Lady Mary Crawley', 'mary.crawley@downton.co.uk', '+44 7922 888999', '2026-11-25', '2', 'Looking for full executive medical screening package.', 'new', '2026-10-30 17:36:54', '2026-10-30 17:36:54');
INSERT INTO `medical_trip_bookings` (`id`, `booking_reference`, `medical_trip_id`, `customer_name`, `email`, `phone`, `preferred_date`, `number_of_persons`, `message`, `status`, `created_at`, `updated_at`) VALUES ('3', 'MED-2026-0AAA11', '1', 'Lord Robert Grantham', 'robert@downton.co.uk', '+44 7933 111222', '2026-12-05', '1', 'Cardiac DEXA and full body MRI check requested.', 'new', '2026-10-30 17:38:21', '2026-10-30 17:38:21');
INSERT INTO `medical_trip_bookings` (`id`, `booking_reference`, `medical_trip_id`, `customer_name`, `email`, `phone`, `preferred_date`, `number_of_persons`, `message`, `status`, `created_at`, `updated_at`) VALUES ('4', 'MED-2026-58FA0E', '1', 'Dr. Evelyn Brand', 'brand@interstellar-astro.org', '+1 202 555 0199', '2026-11-28', '2', 'Comprehensive MRI and cardiovascular fitness assessment for 2.', 'new', '2026-10-30 17:40:22', '2026-10-30 17:40:22');
INSERT INTO `medical_trip_bookings` (`id`, `booking_reference`, `medical_trip_id`, `customer_name`, `email`, `phone`, `preferred_date`, `number_of_persons`, `message`, `status`, `created_at`, `updated_at`) VALUES ('5', 'MED-2026-9E3744', '1', 'karthika', 'ganesankarthika2005@gmail.com', '6374036592', '2026-11-07', '1', '', 'new', '2026-11-06 10:42:34', '2026-11-06 10:42:34');
INSERT INTO `medical_trip_bookings` (`id`, `booking_reference`, `medical_trip_id`, `customer_name`, `email`, `phone`, `preferred_date`, `number_of_persons`, `message`, `status`, `created_at`, `updated_at`) VALUES ('6', 'MED-2026-719ABE', '1', 'mkarthika', 'mkarthika3568@gmail.com', '6374036582', '2026-11-14', '1', '', 'new', '2026-11-13 13:17:42', '2026-11-13 13:17:42');

-- -----------------------------------------------------
-- Table structure for `medical_trips`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `medical_trips`;
CREATE TABLE `medical_trips` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Comprehensive Health Check',
  `short_description` text COLLATE utf8mb4_unicode_ci,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `duration` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '1 Day',
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `discount_price` decimal(10,2) DEFAULT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'INR',
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'Chennai, Tamil Nadu',
  `featured_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `banner_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `banner_subtitle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `banner_description` text COLLATE utf8mb4_unicode_ci,
  `banner_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `highlights` longtext COLLATE utf8mb4_unicode_ci,
  `benefits` longtext COLLATE utf8mb4_unicode_ci,
  `instructions` longtext COLLATE utf8mb4_unicode_ci,
  `preparation_guidelines` longtext COLLATE utf8mb4_unicode_ci,
  `included_services` longtext COLLATE utf8mb4_unicode_ci,
  `excluded_services` longtext COLLATE utf8mb4_unicode_ci,
  `cancellation_policy` longtext COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `is_published` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_slug` (`slug`),
  KEY `idx_published_active` (`is_published`,`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `medical_trips`
INSERT INTO `medical_trips` (`id`, `title`, `slug`, `category`, `short_description`, `description`, `duration`, `price`, `discount_price`, `currency`, `location`, `featured_image`, `banner_title`, `banner_subtitle`, `banner_description`, `banner_image`, `highlights`, `benefits`, `instructions`, `preparation_guidelines`, `included_services`, `excluded_services`, `cancellation_policy`, `is_active`, `is_published`, `created_at`, `updated_at`) VALUES ('1', 'APEX Comprehensive Health Check', 'apex-comprehensive-health-check', 'Executive Health Check', 'The APEX Comprehensive Health Check is a premium medical tourism package designed to give you a complete picture of your health. With advanced diagnostics and expert care, you can travel with confidence and focus on what matters most - your well-being.', 'Experience world-class healthcare combined with the serenity of South India. The APEX Comprehensive Health Check offers unparalleled health screening using cutting-edge medical technologies, including 3T Full Body MRI, DEXA bone densitometry, comprehensive metabolic profiling, and advanced cardiopulmonary exercise testing. Accompanied by experienced medical specialists, you receive detailed, actionable health insights in a seamless 1-day executive setting.', '1 Day', '20000.00', NULL, 'INR', 'Chennai, Tamil Nadu', '/uploads/media/medical_package_banner.jpg', 'APEX Comprehensive Health Check', 'A Complete Health Assessment for a Healthier Tomorrow.', 'The APEX Comprehensive Health Check is a premium medical tourism package designed to give you a complete picture of your health. With advanced diagnostics and expert care, you can travel with confidence and focus on what matters most - your well-being.', '/uploads/media/medical_package_banner.jpg', '[\"Complete 3T Full Body MRI Structural Scan\",\"Gold Standard DEXA Bone Density & Visceral Fat Profiling\",\"120+ Biomarkers Comprehensive Blood Profile\",\"Clinical VO\\u2082 Max Aerobic Capacity Testing\",\"Functional Musculoskeletal & Strength Evaluation\",\"Precision Resting Metabolic Rate (RMR) Analysis\",\"One-on-One Consultant Physician Consultation\",\"Dedicated Medical Tourism Concierge & Transfers\"]', '[\"Early risk detection of silent cardiovascular and metabolic disorders\",\"Complete body composition profiling for fitness and longevity\",\"Personalized lifestyle, nutrition, and preventive medical guidance\",\"Same-day consolidated digital health records and physician debrief\"]', 'Fasting for 10-12 hours prior to blood tests is mandatory. Wear comfortable sportswear for the VO₂ Max and Strength assessments. Avoid caffeine and strenuous physical exercise for 24 hours prior to metabolic and RMR testing.', 'Please carry your past medical records, prescription medications, and valid identification. Arrive at the wellness diagnostic facility by 7:30 AM on your scheduled date.', '[\"All 6 Specialized Medical Assessments & Imaging\",\"Comprehensive Laboratory Diagnostics (120+ Biomarkers)\",\"Detailed Physician Consultation & Multidisciplinary Review\",\"Personalized Health Risk & Preventive Action Plan\",\"Executive Lounge Access, Light Breakfast & Lunch\",\"Private Hotel to Diagnostic Center Transfers\"]', '[\"Flights and visa processing fees\",\"Follow-up surgical or tertiary treatments if required\",\"Personal medication prescriptions post-checkup\"]', 'Free cancellation or rescheduling up to 48 hours prior to the scheduled examination appointment. 50% cancellation fee within 24 to 48 hours. Non-refundable for same-day no-shows.', '1', '1', '2026-10-30 14:54:28', '2026-11-11 11:13:11');

-- -----------------------------------------------------
-- Table structure for `migrations`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  `executed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `migration` (`migration`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `migrations`
INSERT INTO `migrations` (`id`, `migration`, `batch`, `executed_at`) VALUES ('1', '001_create_rbac_tables', '1', '2026-09-24 16:24:48');
INSERT INTO `migrations` (`id`, `migration`, `batch`, `executed_at`) VALUES ('2', '002_create_media_table', '1', '2026-09-24 16:24:48');
INSERT INTO `migrations` (`id`, `migration`, `batch`, `executed_at`) VALUES ('3', '003_create_destination_tables', '1', '2026-09-24 16:24:48');
INSERT INTO `migrations` (`id`, `migration`, `batch`, `executed_at`) VALUES ('4', '004_create_tour_tables', '1', '2026-09-24 16:24:48');
INSERT INTO `migrations` (`id`, `migration`, `batch`, `executed_at`) VALUES ('5', '005_create_cms_home_tables', '1', '2026-09-24 16:24:48');
INSERT INTO `migrations` (`id`, `migration`, `batch`, `executed_at`) VALUES ('6', '006_create_booking_tables', '1', '2026-09-24 16:24:48');
INSERT INTO `migrations` (`id`, `migration`, `batch`, `executed_at`) VALUES ('7', '007_create_review_tables', '1', '2026-09-24 16:24:48');
INSERT INTO `migrations` (`id`, `migration`, `batch`, `executed_at`) VALUES ('8', '008_create_contact_tables', '1', '2026-09-24 16:24:48');
INSERT INTO `migrations` (`id`, `migration`, `batch`, `executed_at`) VALUES ('9', '009_create_settings_pages_tables', '1', '2026-09-24 16:24:48');
INSERT INTO `migrations` (`id`, `migration`, `batch`, `executed_at`) VALUES ('10', '010_create_audit_logs_table', '1', '2026-09-24 16:24:48');
INSERT INTO `migrations` (`id`, `migration`, `batch`, `executed_at`) VALUES ('11', '011_seed_initial_data', '1', '2026-09-24 16:24:48');
INSERT INTO `migrations` (`id`, `migration`, `batch`, `executed_at`) VALUES ('12', '013_add_pages_soft_delete_columns', '2', '2026-09-25 12:05:37');
INSERT INTO `migrations` (`id`, `migration`, `batch`, `executed_at`) VALUES ('13', '014_add_cms_sections_soft_delete_columns', '2', '2026-09-25 12:23:04');
INSERT INTO `migrations` (`id`, `migration`, `batch`, `executed_at`) VALUES ('14', '015_add_home_hero_slides_soft_delete_columns', '2', '2026-09-25 12:30:58');
INSERT INTO `migrations` (`id`, `migration`, `batch`, `executed_at`) VALUES ('15', '016_add_home_benefits_soft_delete_columns', '3', '2026-09-25 12:46:20');
INSERT INTO `migrations` (`id`, `migration`, `batch`, `executed_at`) VALUES ('16', '017_add_site_settings_soft_delete_columns', '4', '2026-09-25 12:55:15');
INSERT INTO `migrations` (`id`, `migration`, `batch`, `executed_at`) VALUES ('17', '018_add_footer_links_soft_delete_columns', '5', '2026-09-25 13:00:49');
INSERT INTO `migrations` (`id`, `migration`, `batch`, `executed_at`) VALUES ('18', '019_add_social_links_soft_delete_columns', '5', '2026-09-25 13:08:35');
INSERT INTO `migrations` (`id`, `migration`, `batch`, `executed_at`) VALUES ('19', '020_add_reviews_soft_delete_columns', '5', '2026-09-25 13:22:20');

-- -----------------------------------------------------
-- Table structure for `pages`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `pages`;
CREATE TABLE `pages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtitle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_media_id` bigint unsigned DEFAULT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `seo_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seo_description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('published','draft') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_pages_slug` (`slug`),
  KEY `idx_pages_status` (`status`),
  KEY `fk_pages_hero_media` (`hero_media_id`),
  KEY `idx_pages_deleted_at` (`deleted_at`),
  KEY `fk_pages_deleted_by` (`deleted_by`),
  CONSTRAINT `fk_pages_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pages_hero_media` FOREIGN KEY (`hero_media_id`) REFERENCES `media` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `pages`
INSERT INTO `pages` (`id`, `slug`, `title`, `subtitle`, `hero_media_id`, `content`, `seo_title`, `seo_description`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('1', 'about-us', 'About Wonderer South India', 'Your Trusted Travel Partner for Authentic South Indian Experiences', NULL, '<h2>Welcome to Wonderer South India</h2><p>Wonderer South India is dedicated to providing high-quality, reliable, and personalized travel experiences across South India for international and discerning travelers. With years of local expertise, private luxury vehicle fleets, and expert guides, we turn vacations into unforgettable journeys.</p><h3>Our Mission</h3><p>To deliver authentic, safe, comfortable, and seamless travel memories with transparent pricing and exceptional hospitality.</p>', 'About Us | Wonderer South India', 'Learn about Wonderer South India, our commitment to hospitality, private travel expertise, and memorable South Indian experiences.', 'published', NULL, NULL, '2026-09-24 16:24:48', '2026-09-30 10:16:16');
INSERT INTO `pages` (`id`, `slug`, `title`, `subtitle`, `hero_media_id`, `content`, `seo_title`, `seo_description`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('2', 'terms-conditions', 'Terms & Conditions', 'Official service agreement, booking policies, guest responsibilities, and legal guidelines for Tramax Tours.', NULL, '<div class=\"terms-container-v2\">\n  <div class=\"terms-intro-box\">\n    <p class=\"terms-lead\">Welcome to <strong>Wonderer South India</strong>.</p>\n    <p>By accessing or using our website and services, you agree to comply with and be bound by the following Terms & Conditions. Please read them carefully before using our services.</p>\n  </div>\n\n  <section id=\"acceptance\" class=\"terms-section-card\">\n    <div class=\"terms-sec-header\">\n      <span class=\"terms-sec-num\">01</span>\n      <h3 class=\"terms-sec-title\">Acceptance of Terms</h3>\n    </div>\n    <div class=\"terms-sec-body\">\n      <p>By visiting this website, submitting an enquiry, or booking any service with Wonderer South India, you acknowledge that you have read, understood, and agreed to these Terms & Conditions. If you do not agree, please do not use our website or services.</p>\n    </div>\n  </section>\n\n  <section id=\"services\" class=\"terms-section-card\">\n    <div class=\"terms-sec-header\">\n      <span class=\"terms-sec-num\">02</span>\n      <h3 class=\"terms-sec-title\">Services Offered</h3>\n    </div>\n    <div class=\"terms-sec-body\">\n      <p>Wonderer South India provides travel-related services including but not limited to:</p>\n      <ul class=\"terms-list\">\n        <li><strong>Tour packages:</strong> Curated multi-day journeys, day tours, and private heritage circuits.</li>\n        <li><strong>Hotel bookings:</strong> Verified luxury resorts, heritage stays, and boutique hotels.</li>\n        <li><strong>Transportation arrangements:</strong> Private AC chauffeur-driven sedans, SUVs, and luxury coaches.</li>\n        <li><strong>Ticket booking:</strong> Flight, train, bus, and entry monument passes.</li>\n        <li><strong>Travel guides:</strong> Certified multilingual tourist guides and local cultural experts.</li>\n        <li><strong>Passport & Visa assistance:</strong> Comprehensive document guidance and facilitation.</li>\n        <li><strong>Photography services:</strong> Professional vacation photography and video documentation.</li>\n      </ul>\n      <p class=\"terms-note\"><em>Note: All services are subject to real-time availability and confirmation.</em></p>\n    </div>\n  </section>\n\n  <section id=\"booking-payments\" class=\"terms-section-card\">\n    <div class=\"terms-sec-header\">\n      <span class=\"terms-sec-num\">03</span>\n      <h3 class=\"terms-sec-title\">Booking & Payments</h3>\n    </div>\n    <div class=\"terms-sec-body\">\n      <ul class=\"terms-list\">\n        <li>All bookings are confirmed only after receipt of the required advance payment.</li>\n        <li>Payment terms may vary depending on the service or package selected.</li>\n        <li>Prices mentioned on the website are subject to change without prior notice based on seasonal tariffs.</li>\n        <li>Any additional charges (taxes, entry fees, personal expenses, toll/parking, etc.) are not included unless explicitly mentioned in your confirmed itinerary.</li>\n      </ul>\n    </div>\n  </section>\n\n  <section id=\"cancellations-refunds\" class=\"terms-section-card\">\n    <div class=\"terms-sec-header\">\n      <span class=\"terms-sec-num\">04</span>\n      <h3 class=\"terms-sec-title\">Cancellations & Refunds</h3>\n    </div>\n    <div class=\"terms-sec-body\">\n      <ul class=\"terms-list\">\n        <li>Cancellation requests must be made in writing via official email or our verified contact form.</li>\n        <li>Refund eligibility depends strictly on the cancellation policies of partner hotels, transport providers, airlines, and third-party vendors.</li>\n        <li>Wonderer South India shall not be responsible for delays in refunds caused by third-party service providers or banking gateways.</li>\n        <li>No refunds will be provided for unused services or last-minute cancellations during peak travel seasons.</li>\n      </ul>\n    </div>\n  </section>\n\n  <section id=\"changes-modifications\" class=\"terms-section-card\">\n    <div class=\"terms-sec-header\">\n      <span class=\"terms-sec-num\">05</span>\n      <h3 class=\"terms-sec-title\">Changes & Modifications</h3>\n    </div>\n    <div class=\"terms-sec-body\">\n      <p>Wonderer South India reserves the right to modify itineraries, services, or pricing due to unavoidable circumstances such as adverse weather conditions, natural calamities, government regulations, road blockages, or operational safety issues.</p>\n      <p>Any changes will be communicated to the customer at the earliest possible time with suitable alternatives offered wherever viable.</p>\n    </div>\n  </section>\n\n  <section id=\"user-responsibilities\" class=\"terms-section-card\">\n    <div class=\"terms-sec-header\">\n      <span class=\"terms-sec-num\">06</span>\n      <h3 class=\"terms-sec-title\">User Responsibilities</h3>\n    </div>\n    <div class=\"terms-sec-body\">\n      <ul class=\"terms-list\">\n        <li>Users must provide accurate, current, and complete personal, travel, and contact information.</li>\n        <li>Travelers are solely responsible for carrying valid government-issued identity proofs, passports, visas, and other required health or travel documents.</li>\n        <li>Wonderer South India will not be liable for any issues, delays, or denials arising due to incorrect, expired, or incomplete information provided by the user.</li>\n      </ul>\n    </div>\n  </section>\n\n  <section id=\"risks-liability\" class=\"terms-section-card\">\n    <div class=\"terms-sec-header\">\n      <span class=\"terms-sec-num\">07</span>\n      <h3 class=\"terms-sec-title\">Travel Risks & Liability</h3>\n    </div>\n    <div class=\"terms-sec-body\">\n      <p>Travel involves inherent risks. Wonderer South India shall not be held responsible for accidents, injuries, illnesses, loss of personal belongings, delays, or cancellations caused by factors beyond our reasonable control (force majeure).</p>\n      <p>We act primarily as a professional coordinator and intermediary between customers and verified third-party service providers and are not directly liable for their independent acts, omissions, or defaults.</p>\n    </div>\n  </section>\n\n  <section id=\"intellectual-property\" class=\"terms-section-card\">\n    <div class=\"terms-sec-header\">\n      <span class=\"terms-sec-num\">08</span>\n      <h3 class=\"terms-sec-title\">Intellectual Property</h3>\n    </div>\n    <div class=\"terms-sec-body\">\n      <p>All content on this website including text, photography, graphics, logos, itineraries, and UI designs are the intellectual property of Wonderer South India.</p>\n      <p>Unauthorized copying, scraping, reproduction, or commercial distribution of website content is strictly prohibited without prior written consent.</p>\n    </div>\n  </section>\n\n  <section id=\"privacy\" class=\"terms-section-card\">\n    <div class=\"terms-sec-header\">\n      <span class=\"terms-sec-num\">09</span>\n      <h3 class=\"terms-sec-title\">Privacy</h3>\n    </div>\n    <div class=\"terms-sec-body\">\n      <p>Any personal information shared with us is handled with high confidentiality in accordance with our Privacy Policy.</p>\n      <p>We do not sell, rent, or misuse customer data and implement rigorous technical measures to safeguard your personal information.</p>\n    </div>\n  </section>\n\n  <section id=\"third-party-links\" class=\"terms-section-card\">\n    <div class=\"terms-sec-header\">\n      <span class=\"terms-sec-num\">10</span>\n      <h3 class=\"terms-sec-title\">Third-Party Links</h3>\n    </div>\n    <div class=\"terms-sec-body\">\n      <p>Our website may contain links to external third-party websites or services. Wonderer South India does not control and is not responsible for the content, privacy policies, or practices of such external sites.</p>\n    </div>\n  </section>\n\n  <section id=\"governing-law\" class=\"terms-section-card\">\n    <div class=\"terms-sec-header\">\n      <span class=\"terms-sec-num\">11</span>\n      <h3 class=\"terms-sec-title\">Governing Law</h3>\n    </div>\n    <div class=\"terms-sec-body\">\n      <p>These Terms & Conditions shall be governed by and interpreted in accordance with the laws of the Republic of India. Any legal disputes or claims arising hereunder shall be subject to the exclusive jurisdiction of the competent courts in Tamil Nadu, India.</p>\n    </div>\n  </section>\n\n  <section id=\"updates-terms\" class=\"terms-section-card\">\n    <div class=\"terms-sec-header\">\n      <span class=\"terms-sec-num\">12</span>\n      <h3 class=\"terms-sec-title\">Updates to Terms</h3>\n    </div>\n    <div class=\"terms-sec-body\">\n      <p>Wonderer South India reserves the right to update or modify these Terms & Conditions at any time without prior notice. Continued use of the website or booking of services constitutes acceptance of the updated terms.</p>\n    </div>\n  </section>\n\n  <section id=\"contact-info\" class=\"terms-section-card terms-contact-highlight\">\n    <div class=\"terms-sec-header\">\n      <span class=\"terms-sec-num\">13</span>\n      <h3 class=\"terms-sec-title\">Contact Information</h3>\n    </div>\n    <div class=\"terms-sec-body\">\n      <p>For any questions, clarifications, or support regarding these Terms & Conditions, please reach out to us:</p>\n      <div class=\"terms-contact-grid\">\n        <div class=\"terms-contact-item\">\n          <strong>📧 Email:</strong> <a href=\"mailto:contact@tramaxtours.in\">contact@tramaxtours.in</a> / <a href=\"mailto:info@tramaxtours.in\">info@tramaxtours.in</a>\n        </div>\n        <div class=\"terms-contact-item\">\n          <strong>📞 Phone:</strong> <a href=\"tel:+918072566010\">+91 80725 66010</a> / <a href=\"tel:+919840291110\">+91 98402 91110</a>\n        </div>\n        <div class=\"terms-contact-item\">\n          <strong>📍 Office:</strong> Chennai, Tamil Nadu, India\n        </div>\n      </div>\n    </div>\n  </section>\n</div>', 'Terms & Conditions | Wonderer South India', 'Read the official Terms & Conditions for Wonderer South India. Learn about booking rules, cancellations, refunds, services, and travel responsibilities.', 'published', NULL, NULL, '2026-09-24 16:24:48', '2026-11-11 10:48:01');
INSERT INTO `pages` (`id`, `slug`, `title`, `subtitle`, `hero_media_id`, `content`, `seo_title`, `seo_description`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('3', 'refund-policy', 'Refund & Cancellation Policy', 'Transparent terms for booking confirmations, cancellation procedures, refund eligibility, timelines, and tour rescheduling.', NULL, '<div class=\"policy-container-v2 refund-policy-theme\">\n  <div class=\"policy-intro-box refund-banner-gradient\">\n    <p class=\"policy-lead\">At <strong>Wonderer South India</strong>, we understand that travel plans may change unexpectedly.</p>\n    <p>This Refund & Cancellation Policy outlines the exact terms under which cancellations, refunds, and rescheduling are handled. Please review this policy carefully before confirming your reservations.</p>\n  </div>\n\n  <section id=\"booking-confirmation\" class=\"policy-section-card\">\n    <div class=\"policy-sec-header\">\n      <span class=\"policy-sec-num\">01</span>\n      <h3 class=\"policy-sec-title\">Booking Confirmation & Advance Payment</h3>\n    </div>\n    <div class=\"policy-sec-body\">\n      <ul class=\"policy-list\">\n        <li>All tour packages and travel bookings are officially confirmed only after receipt of the required advance payment.</li>\n        <li>Official booking confirmation vouchers will be dispatched via email or WhatsApp containing complete itinerary specifics.</li>\n        <li>Any service, entrance pass, or detour not explicitly mentioned in the confirmed itinerary voucher will be treated as an additional chargeable service.</li>\n      </ul>\n    </div>\n  </section>\n\n  <section id=\"cancellation-procedure\" class=\"policy-section-card\">\n    <div class=\"policy-sec-header\">\n      <span class=\"policy-sec-num\">02</span>\n      <h3 class=\"policy-sec-title\">Cancellation Policy & Notification</h3>\n    </div>\n    <div class=\"policy-sec-body\">\n      <ul class=\"policy-list\">\n        <li>All cancellation requests must be submitted in writing via official email to <strong>contact@tramaxtours.in</strong> or through our verified <strong>Contact Us</strong> page.</li>\n        <li>The timestamp on which the written cancellation request is officially received will be registered as the official cancellation date.</li>\n        <li>Cancellation charges vary according to provider deadlines (partner hotels, airlines, heritage transport operators, etc.).</li>\n      </ul>\n    </div>\n  </section>\n\n  <section id=\"refund-eligibility\" class=\"policy-section-card\">\n    <div class=\"policy-sec-header\">\n      <span class=\"policy-sec-num\">03</span>\n      <h3 class=\"policy-sec-title\">Refund Eligibility & Conditions</h3>\n    </div>\n    <div class=\"policy-sec-body\">\n      <p>Refunds, if applicable, are subject to the individual terms and contractual cancellation policies of our third-party service partners. Wonderer South India acts as a professional intermediary and coordinates with vendors to maximize refund recovery.</p>\n      \n      <div class=\"policy-sub-card policy-eligible-box\">\n        <h4 class=\"policy-sub-title\" style=\"color: #01806c;\">✅ Refunds May Be Applicable Under:</h4>\n        <ul class=\"policy-list\">\n          <li>Cancellations submitted within the permitted advance time frame as stipulated in your specific package voucher.</li>\n          <li>Non-availability or cancellation of a confirmed service due to internal reasons beyond the customer\'s control.</li>\n          <li>Verified duplicate transactions or overpayments (reimbursed in full after audit).</li>\n        </ul>\n      </div>\n    </div>\n  </section>\n\n  <section id=\"non-refundable\" class=\"policy-section-card\">\n    <div class=\"policy-sec-header\">\n      <span class=\"policy-sec-num policy-sec-num-alert\">04</span>\n      <h3 class=\"policy-sec-title\">Non-Refundable Situations</h3>\n    </div>\n    <div class=\"policy-sec-body\">\n      <div class=\"policy-warning-card\">\n        <h4 class=\"policy-sub-title\" style=\"color: #b91c1c;\">⚠️ Strictly Non-Refundable Cases:</h4>\n        <ul class=\"policy-list policy-list-alert\">\n          <li>Last-minute cancellations or guest no-shows on the departure date.</li>\n          <li>Partial utilization or voluntary abandonment of booked tour components.</li>\n          <li>Cancellations arising from personal emergencies, illness, or missed flight connections not covered under provider waivers.</li>\n          <li>Special discounted, promotional tariffs, or peak holiday season bookings (December–January, festival weeks).</li>\n          <li>Visa rejections, passport expiry, or missing government documentation.</li>\n        </ul>\n      </div>\n    </div>\n  </section>\n\n  <section id=\"processing-timeline\" class=\"policy-section-card\">\n    <div class=\"policy-sec-header\">\n      <span class=\"policy-sec-num\">05</span>\n      <h3 class=\"policy-sec-title\">Refund Processing Timeline & Method</h3>\n    </div>\n    <div class=\"policy-sec-body\">\n      <div class=\"refund-timeline-grid\">\n        <div class=\"timeline-step-card\">\n          <div class=\"step-num\">Step 1</div>\n          <div class=\"step-title\">Written Request</div>\n          <p>Customer sends written cancellation with booking ID.</p>\n        </div>\n        <div class=\"timeline-step-card\">\n          <div class=\"step-num\">Step 2</div>\n          <div class=\"step-title\">Vendor Audit</div>\n          <p>Audit of hotel, flight, and transport cancellation recovery.</p>\n        </div>\n        <div class=\"timeline-step-card\">\n          <div class=\"step-num\">Step 3</div>\n          <div class=\"step-title\">7–14 Days Credit</div>\n          <p>Approved refunds credited to the original payment source.</p>\n        </div>\n      </div>\n      <p class=\"policy-note\" style=\"margin-top: 16px;\"><em>Note: Wonderer South India is not liable for intermediate banking delays or international card processing holidays.</em></p>\n    </div>\n  </section>\n\n  <section id=\"amendments-rescheduling\" class=\"policy-section-card\">\n    <div class=\"policy-sec-header\">\n      <span class=\"policy-sec-num\">06</span>\n      <h3 class=\"policy-sec-title\">Amendments & Tour Rescheduling</h3>\n    </div>\n    <div class=\"policy-sec-body\">\n      <ul class=\"policy-list\">\n        <li>Date changes and itinerary adjustments are subject to room availability, vehicle scheduling, and provider fee structures.</li>\n        <li>Rescheduling requests must be placed in writing at least <strong>48 hours prior</strong> to the scheduled departure.</li>\n        <li>Any seasonal tariff difference or carrier rebooking penalty must be borne directly by the customer.</li>\n      </ul>\n    </div>\n  </section>\n\n  <section id=\"force-majeure\" class=\"policy-section-card\">\n    <div class=\"policy-sec-header\">\n      <span class=\"policy-sec-num\">07</span>\n      <h3 class=\"policy-sec-title\">Force Majeure & Unforeseen Events</h3>\n    </div>\n    <div class=\"policy-sec-body\">\n      <p>Wonderer South India shall not be held liable for monetary compensation or refund penalties arising from events beyond human control (Force Majeure), including:</p>\n      <ul class=\"policy-list\">\n        <li>Severe weather disruptions, floods, earthquakes, or natural disasters.</li>\n        <li>Sudden government travel restrictions, road closures, or curfew orders.</li>\n        <li>Public health emergencies or pandemics.</li>\n        <li>Civil disturbances, riots, or public transport strikes.</li>\n      </ul>\n      <p>In all such scenarios, we work tirelessly with partners to secure future travel credits wherever allowable.</p>\n    </div>\n  </section>\n\n  <section id=\"tramax-cancellations\" class=\"policy-section-card\">\n    <div class=\"policy-sec-header\">\n      <span class=\"policy-sec-num\">08</span>\n      <h3 class=\"policy-sec-title\">Cancellations Initiated by Wonderer South India</h3>\n    </div>\n    <div class=\"policy-sec-body\">\n      <p>In rare operational circumstances where Wonderer South India must cancel a scheduled tour, guests will be promptly offered:</p>\n      <div class=\"policy-options-grid\">\n        <div class=\"option-pill-card\">\n          <span class=\"option-tag\">Option A</span>\n          <strong>100% Full Refund</strong> of all monies paid directly to Wonderer South India.\n        </div>\n        <div class=\"option-pill-card\">\n          <span class=\"option-tag\">Option B</span>\n          <strong>Alternative Tour Package</strong> of equivalent value with upgraded amenities.\n        </div>\n      </div>\n    </div>\n  </section>\n\n  <section id=\"communication-updates\" class=\"policy-section-card\">\n    <div class=\"policy-sec-header\">\n      <span class=\"policy-sec-num\">09</span>\n      <h3 class=\"policy-sec-title\">Mode of Communication & Policy Updates</h3>\n    </div>\n    <div class=\"policy-sec-body\">\n      <p><strong>Official Channels:</strong> All refund and cancellation claims must occur through official email or website communication channels. Verbal or unverified chat requests cannot be honored.</p>\n      <p><strong>Updates:</strong> Wonderer South India reserves the right to modify this Refund & Cancellation Policy at any time without prior notice. Updated terms take effect immediately upon publication.</p>\n    </div>\n  </section>\n\n  <section id=\"contact-refund\" class=\"policy-section-card policy-contact-highlight\">\n    <div class=\"policy-sec-header\">\n      <span class=\"policy-sec-num\">10</span>\n      <h3 class=\"policy-sec-title\">Refund Inquiries & Support Helpdesk</h3>\n    </div>\n    <div class=\"policy-sec-body\">\n      <p>For urgent cancellation requests or refund status tracking, please contact our helpdesk:</p>\n      <div class=\"policy-contact-grid\">\n        <div class=\"policy-contact-item\">\n          <strong>📧 Refunds Helpdesk:</strong> <a href=\"mailto:refunds@tramaxtours.in\">refunds@tramaxtours.in</a> / <a href=\"mailto:contact@tramaxtours.in\">contact@tramaxtours.in</a>\n        </div>\n        <div class=\"policy-contact-item\">\n          <strong>📞 Priority Helpline:</strong> <a href=\"tel:+918072566010\">+91 80725 66010</a> / <a href=\"tel:+919840291110\">+91 98402 91110</a>\n        </div>\n        <div class=\"policy-contact-item\">\n          <strong>📍 Helpdesk Hours:</strong> Mon – Sat: 9:00 AM – 7:00 PM IST\n        </div>\n      </div>\n    </div>\n  </section>\n</div>', 'Refund & Cancellation Policy | Wonderer South India', 'Read the official Refund and Cancellation Policy of Wonderer South India. Learn about eligibility, non-refundable situations, timelines, and rescheduling terms.', 'published', NULL, NULL, '2026-09-24 16:24:48', '2026-09-30 10:16:16');
INSERT INTO `pages` (`id`, `slug`, `title`, `subtitle`, `hero_media_id`, `content`, `seo_title`, `seo_description`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('4', 'privacy-policy', 'Privacy Policy', 'Our commitment to safeguarding your personal information, data confidentiality, and user rights at Tramax Tours.', NULL, '<div class=\"policy-container-v2 privacy-policy-theme\">\n  <div class=\"policy-intro-box\">\n    <p class=\"policy-lead\">At <strong>Wonderer South India</strong>, we are committed to protecting your privacy and ensuring the security of your personal information.</p>\n    <p>This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.</p>\n  </div>\n\n  <section id=\"info-collected\" class=\"policy-section-card\">\n    <div class=\"policy-sec-header\">\n      <span class=\"policy-sec-num\">01</span>\n      <h3 class=\"policy-sec-title\">Information We Collect</h3>\n    </div>\n    <div class=\"policy-sec-body\">\n      <p>We may collect the following types of information when you interact with our platform:</p>\n      \n      <div class=\"policy-sub-card\">\n        <h4 class=\"policy-sub-title\">👤 Personal Information</h4>\n        <ul class=\"policy-list\">\n          <li><strong>Full Name:</strong> For identification and reservation vouchers.</li>\n          <li><strong>Email Address:</strong> For sending booking confirmations, itineraries, and receipts.</li>\n          <li><strong>Phone Number:</strong> For real-time trip coordination and chauffeur communication.</li>\n          <li><strong>Travel Preferences & Enquiries:</strong> Destination preferences, group size, and custom tour requests.</li>\n          <li><strong>Identification Details:</strong> Government-issued ID, Passport, or Visa info (only when strictly required for monument passes or flight/train reservations).</li>\n        </ul>\n      </div>\n\n      <div class=\"policy-sub-card\" style=\"margin-top: 16px;\">\n        <h4 class=\"policy-sub-title\">💻 Non-Personal & Technical Information</h4>\n        <ul class=\"policy-list\">\n          <li>Browser type, operating system, and screen resolution.</li>\n          <li>Device information and approximate geographic location.</li>\n          <li>IP address and anonymous analytical identifiers.</li>\n          <li>Website usage data (pages visited, time spent, interaction timestamps).</li>\n        </ul>\n      </div>\n    </div>\n  </section>\n\n  <section id=\"how-we-use\" class=\"policy-section-card\">\n    <div class=\"policy-sec-header\">\n      <span class=\"policy-sec-num\">02</span>\n      <h3 class=\"policy-sec-title\">How We Use Your Information</h3>\n    </div>\n    <div class=\"policy-sec-body\">\n      <p>The information we collect is used purposefully to deliver seamless travel experiences:</p>\n      <ul class=\"policy-list\">\n        <li>Respond promptly to enquiries and customize your private itineraries.</li>\n        <li>Process reservations, hotel bookings, transportation, and payments.</li>\n        <li>Continuously improve our website performance, service quality, and guest experience.</li>\n        <li>Communicate itinerary updates, trip reminders, seasonal offers, or critical travel advisories.</li>\n        <li>Comply with applicable tourism regulations, taxation, and legal requirements.</li>\n      </ul>\n    </div>\n  </section>\n\n  <section id=\"sharing-info\" class=\"policy-section-card\">\n    <div class=\"policy-sec-header\">\n      <span class=\"policy-sec-num\">03</span>\n      <h3 class=\"policy-sec-title\">Sharing of Information</h3>\n    </div>\n    <div class=\"policy-sec-body\">\n      <div class=\"policy-highlight-badge\">\n        <span>🛡️ Strict Privacy Promise: We NEVER sell, trade, rent, or lease your personal data to any third-party marketing companies.</span>\n      </div>\n      <p style=\"margin-top: 14px;\">We share your information strictly on a need-to-know basis with:</p>\n      <ul class=\"policy-list\">\n        <li><strong>Verified Travel Partners:</strong> Hotels, airlines, chauffeur teams, and licensed tour guides for executing confirmed bookings.</li>\n        <li><strong>Regulatory & Government Authorities:</strong> When mandatory under applicable Indian or international law.</li>\n        <li><strong>Trusted Service Providers:</strong> Secure payment gateways, SMS/Email dispatchers who assist our operational infrastructure under non-disclosure agreements.</li>\n      </ul>\n    </div>\n  </section>\n\n  <section id=\"data-security\" class=\"policy-section-card\">\n    <div class=\"policy-sec-header\">\n      <span class=\"policy-sec-num\">04</span>\n      <h3 class=\"policy-sec-title\">Data Security</h3>\n    </div>\n    <div class=\"policy-sec-body\">\n      <p>We implement enterprise-grade technical and organizational security measures (including TLS/SSL encryption, restricted access protocols, and firewall protections) to protect your personal data against unauthorized access, alteration, or disclosure.</p>\n      <p class=\"policy-note\"><em>Note: While we adhere to top industry standards, no method of digital transmission or storage is 100% impenetrable. We constantly audit our systems to ensure safety.</em></p>\n    </div>\n  </section>\n\n  <section id=\"cookies\" class=\"policy-section-card\">\n    <div class=\"policy-sec-header\">\n      <span class=\"policy-sec-num\">05</span>\n      <h3 class=\"policy-sec-title\">Cookies Policy</h3>\n    </div>\n    <div class=\"policy-sec-body\">\n      <p>Our website utilizes secure cookies to:</p>\n      <ul class=\"policy-list\">\n        <li>Enhance user browsing experience and maintain session continuity.</li>\n        <li>Analyze aggregated traffic patterns to optimize page speed and navigation.</li>\n        <li>Remember your selected language and currency preferences.</li>\n      </ul>\n      <p>You can choose to disable cookies through your browser settings, though certain interactive features may experience limitations.</p>\n    </div>\n  </section>\n\n  <section id=\"third-party-links\" class=\"policy-section-card\">\n    <div class=\"policy-sec-header\">\n      <span class=\"policy-sec-num\">06</span>\n      <h3 class=\"policy-sec-title\">Third-Party Links</h3>\n    </div>\n    <div class=\"policy-sec-body\">\n      <p>Our website may contain links to third-party portals (such as external flight aggregators or tourism boards). Wonderer South India is not responsible for the privacy practices, policies, or content of such external websites. We encourage you to review their terms upon departure.</p>\n    </div>\n  </section>\n\n  <section id=\"user-rights\" class=\"policy-section-card\">\n    <div class=\"policy-sec-header\">\n      <span class=\"policy-sec-num\">07</span>\n      <h3 class=\"policy-sec-title\">User Rights</h3>\n    </div>\n    <div class=\"policy-sec-body\">\n      <p>You retain full control over your personal data. You have the right to:</p>\n      <ul class=\"policy-list\">\n        <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>\n        <li><strong>Rectification:</strong> Request correction of inaccurate, outdated, or incomplete data.</li>\n        <li><strong>Erasure / Deletion:</strong> Request deletion of your personal records, subject to statutory accounting requirements.</li>\n        <li><strong>Withdraw Consent:</strong> Opt-out from promotional communications at any time.</li>\n      </ul>\n      <p>Requests can be submitted directly via our <strong>Contact Us</strong> page or official email.</p>\n    </div>\n  </section>\n\n  <section id=\"retention-children\" class=\"policy-section-card\">\n    <div class=\"policy-sec-header\">\n      <span class=\"policy-sec-num\">08</span>\n      <h3 class=\"policy-sec-title\">Data Retention & Children\'s Privacy</h3>\n    </div>\n    <div class=\"policy-sec-body\">\n      <p><strong>Data Retention:</strong> We retain personal information only for as long as necessary to fulfill the trip execution, billing, dispute resolution, or as required by law.</p>\n      <p><strong>Children\'s Privacy:</strong> Our website services are not directed toward unaccompanied individuals under the age of 18. We do not knowingly collect personal information directly from children without parental or guardian consent.</p>\n    </div>\n  </section>\n\n  <section id=\"policy-changes-consent\" class=\"policy-section-card\">\n    <div class=\"policy-sec-header\">\n      <span class=\"policy-sec-num\">09</span>\n      <h3 class=\"policy-sec-title\">Changes to This Policy & Consent</h3>\n    </div>\n    <div class=\"policy-sec-body\">\n      <p>Wonderer South India reserves the right to update or modify this Privacy Policy at any time. Any changes will be published directly on this page with an updated revision timestamp.</p>\n      <p>By using our website or submitting your information for bookings or inquiries, you expressly consent to the practices described in this Privacy Policy.</p>\n    </div>\n  </section>\n\n  <section id=\"contact-privacy\" class=\"policy-section-card policy-contact-highlight\">\n    <div class=\"policy-sec-header\">\n      <span class=\"policy-sec-num\">10</span>\n      <h3 class=\"policy-sec-title\">Privacy Officer & Contact Information</h3>\n    </div>\n    <div class=\"policy-sec-body\">\n      <p>If you have any questions, concerns, or data requests regarding this Privacy Policy, please reach out to our privacy desk:</p>\n      <div class=\"policy-contact-grid\">\n        <div class=\"policy-contact-item\">\n          <strong>📧 Privacy Desk:</strong> <a href=\"mailto:privacy@tramaxtours.in\">privacy@tramaxtours.in</a> / <a href=\"mailto:contact@tramaxtours.in\">contact@tramaxtours.in</a>\n        </div>\n        <div class=\"policy-contact-item\">\n          <strong>📞 Telephone:</strong> <a href=\"tel:+918072566010\">+91 80725 66010</a> / <a href=\"tel:+919840291110\">+91 98402 91110</a>\n        </div>\n        <div class=\"policy-contact-item\">\n          <strong>📍 Address:</strong> Wonderer South India Head Office, Chennai, Tamil Nadu, India\n        </div>\n      </div>\n    </div>\n  </section>\n</div>', 'Privacy Policy | Wonderer South India', 'Learn how Wonderer South India protects and respects your privacy. Read our detailed information collection, data security, and cookies policy.', 'published', NULL, NULL, '2026-09-24 16:24:48', '2026-09-30 10:16:16');

-- -----------------------------------------------------
-- Table structure for `password_resets`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `password_resets`;
CREATE TABLE `password_resets` (
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`email`),
  KEY `idx_pwd_reset_token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table structure for `payments`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` bigint unsigned NOT NULL,
  `transaction_reference` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pay_on_arrival',
  `amount` decimal(10,2) NOT NULL,
  `payment_date` date DEFAULT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EUR',
  `status` enum('pending','completed','failed','refunded') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `payment_data` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `recorded_by` bigint unsigned DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_reference` (`transaction_reference`),
  KEY `idx_payments_booking` (`booking_id`),
  KEY `idx_payments_status` (`status`),
  KEY `idx_payments_method` (`payment_method`),
  KEY `idx_payments_reference` (`transaction_reference`),
  CONSTRAINT `fk_payments_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `payments`
INSERT INTO `payments` (`id`, `booking_id`, `transaction_reference`, `payment_method`, `amount`, `payment_date`, `currency`, `status`, `payment_data`, `notes`, `recorded_by`, `paid_at`, `created_at`, `updated_at`) VALUES ('1', '34', 'TX-TT-20260925-8D74', 'pay_on_arrival', '500.00', NULL, 'EUR', 'pending', NULL, NULL, NULL, NULL, '2026-09-25 16:29:53', '2026-09-25 16:29:53');
INSERT INTO `payments` (`id`, `booking_id`, `transaction_reference`, `payment_method`, `amount`, `payment_date`, `currency`, `status`, `payment_data`, `notes`, `recorded_by`, `paid_at`, `created_at`, `updated_at`) VALUES ('13', '60', 'TX-TT-20260928-EA89', 'pay_on_arrival', '130.00', NULL, 'USD', 'pending', NULL, NULL, NULL, NULL, '2026-09-28 13:35:44', '2026-09-28 13:35:44');
INSERT INTO `payments` (`id`, `booking_id`, `transaction_reference`, `payment_method`, `amount`, `payment_date`, `currency`, `status`, `payment_data`, `notes`, `recorded_by`, `paid_at`, `created_at`, `updated_at`) VALUES ('14', '61', 'TX-TT-20260930-7FEC', 'pay_on_arrival', '130.00', NULL, 'USD', 'pending', NULL, NULL, NULL, NULL, '2026-09-30 16:31:56', '2026-09-30 16:31:56');
INSERT INTO `payments` (`id`, `booking_id`, `transaction_reference`, `payment_method`, `amount`, `payment_date`, `currency`, `status`, `payment_data`, `notes`, `recorded_by`, `paid_at`, `created_at`, `updated_at`) VALUES ('15', '63', 'TX-WSI-20261106-5C3B', 'upi', '10000.00', NULL, 'INR', 'pending', NULL, NULL, NULL, NULL, '2026-11-06 11:32:09', '2026-11-06 11:32:09');
INSERT INTO `payments` (`id`, `booking_id`, `transaction_reference`, `payment_method`, `amount`, `payment_date`, `currency`, `status`, `payment_data`, `notes`, `recorded_by`, `paid_at`, `created_at`, `updated_at`) VALUES ('16', '63', 'UPI-TXN-39B524E6', 'upi', '3000.00', '2026-11-06', 'INR', 'completed', NULL, 'Received partial advance payment via Google Pay', '1', '2026-11-06 11:32:09', '2026-11-06 11:32:09', '2026-11-06 11:32:09');
INSERT INTO `payments` (`id`, `booking_id`, `transaction_reference`, `payment_method`, `amount`, `payment_date`, `currency`, `status`, `payment_data`, `notes`, `recorded_by`, `paid_at`, `created_at`, `updated_at`) VALUES ('17', '63', 'CASH-REC-3A6274', 'cash', '7000.00', '2026-11-06', 'INR', 'completed', NULL, 'Settled remaining balance in cash', '1', '2026-11-06 11:32:09', '2026-11-06 11:32:09', '2026-11-06 11:32:09');
INSERT INTO `payments` (`id`, `booking_id`, `transaction_reference`, `payment_method`, `amount`, `payment_date`, `currency`, `status`, `payment_data`, `notes`, `recorded_by`, `paid_at`, `created_at`, `updated_at`) VALUES ('18', '64', 'TX-WSI-20261106-777E', 'upi', '10000.00', NULL, 'INR', 'pending', NULL, NULL, NULL, NULL, '2026-11-06 11:32:36', '2026-11-06 11:32:36');
INSERT INTO `payments` (`id`, `booking_id`, `transaction_reference`, `payment_method`, `amount`, `payment_date`, `currency`, `status`, `payment_data`, `notes`, `recorded_by`, `paid_at`, `created_at`, `updated_at`) VALUES ('19', '64', 'UPI-TXN-0B62EE30', 'upi', '3000.00', '2026-11-06', 'INR', 'completed', NULL, 'Received partial advance payment via Google Pay', '1', '2026-11-06 11:32:36', '2026-11-06 11:32:36', '2026-11-06 11:32:36');
INSERT INTO `payments` (`id`, `booking_id`, `transaction_reference`, `payment_method`, `amount`, `payment_date`, `currency`, `status`, `payment_data`, `notes`, `recorded_by`, `paid_at`, `created_at`, `updated_at`) VALUES ('20', '64', 'CASH-REC-D5230A', 'cash', '7000.00', '2026-11-06', 'INR', 'completed', NULL, 'Settled remaining balance in cash', '1', '2026-11-06 11:32:36', '2026-11-06 11:32:36', '2026-11-06 11:32:36');
INSERT INTO `payments` (`id`, `booking_id`, `transaction_reference`, `payment_method`, `amount`, `payment_date`, `currency`, `status`, `payment_data`, `notes`, `recorded_by`, `paid_at`, `created_at`, `updated_at`) VALUES ('21', '65', 'TX-WSI-20261106-7DC3', 'upi', '10000.00', NULL, 'INR', 'pending', NULL, NULL, NULL, NULL, '2026-11-06 11:32:40', '2026-11-06 11:32:40');
INSERT INTO `payments` (`id`, `booking_id`, `transaction_reference`, `payment_method`, `amount`, `payment_date`, `currency`, `status`, `payment_data`, `notes`, `recorded_by`, `paid_at`, `created_at`, `updated_at`) VALUES ('22', '66', 'TX-WSI-20261106-2855', 'upi', '10000.00', NULL, 'INR', 'pending', NULL, NULL, NULL, NULL, '2026-11-06 11:33:06', '2026-11-06 11:33:06');
INSERT INTO `payments` (`id`, `booking_id`, `transaction_reference`, `payment_method`, `amount`, `payment_date`, `currency`, `status`, `payment_data`, `notes`, `recorded_by`, `paid_at`, `created_at`, `updated_at`) VALUES ('23', '66', 'UPI-TXN-B152B21F', 'upi', '3000.00', '2026-11-06', 'INR', 'completed', NULL, 'Received partial advance payment via Google Pay', '1', '2026-11-06 11:33:06', '2026-11-06 11:33:06', '2026-11-06 11:33:06');
INSERT INTO `payments` (`id`, `booking_id`, `transaction_reference`, `payment_method`, `amount`, `payment_date`, `currency`, `status`, `payment_data`, `notes`, `recorded_by`, `paid_at`, `created_at`, `updated_at`) VALUES ('24', '66', 'CASH-REC-6C2296', 'cash', '7000.00', '2026-11-06', 'INR', 'completed', NULL, 'Settled remaining balance in cash', '1', '2026-11-06 11:33:06', '2026-11-06 11:33:06', '2026-11-06 11:33:06');
INSERT INTO `payments` (`id`, `booking_id`, `transaction_reference`, `payment_method`, `amount`, `payment_date`, `currency`, `status`, `payment_data`, `notes`, `recorded_by`, `paid_at`, `created_at`, `updated_at`) VALUES ('25', '67', 'TX-WSI-20261106-6DE1', 'upi', '10000.00', NULL, 'INR', 'pending', NULL, NULL, NULL, NULL, '2026-11-06 11:33:06', '2026-11-06 11:33:06');
INSERT INTO `payments` (`id`, `booking_id`, `transaction_reference`, `payment_method`, `amount`, `payment_date`, `currency`, `status`, `payment_data`, `notes`, `recorded_by`, `paid_at`, `created_at`, `updated_at`) VALUES ('26', '68', 'TX-WSI-20261106-8B54', 'upi', '10000.00', NULL, 'INR', 'pending', NULL, NULL, NULL, NULL, '2026-11-06 12:33:11', '2026-11-06 12:33:11');
INSERT INTO `payments` (`id`, `booking_id`, `transaction_reference`, `payment_method`, `amount`, `payment_date`, `currency`, `status`, `payment_data`, `notes`, `recorded_by`, `paid_at`, `created_at`, `updated_at`) VALUES ('27', '68', 'UPI-TXN-2BBD6DB6', 'upi', '3000.00', '2026-11-06', 'INR', 'completed', NULL, 'Received partial advance payment via Google Pay', '1', '2026-11-06 12:33:11', '2026-11-06 12:33:11', '2026-11-06 12:33:11');
INSERT INTO `payments` (`id`, `booking_id`, `transaction_reference`, `payment_method`, `amount`, `payment_date`, `currency`, `status`, `payment_data`, `notes`, `recorded_by`, `paid_at`, `created_at`, `updated_at`) VALUES ('28', '68', 'CASH-REC-30BFD0', 'cash', '7000.00', '2026-11-06', 'INR', 'completed', NULL, 'Settled remaining balance in cash', '1', '2026-11-06 12:33:11', '2026-11-06 12:33:11', '2026-11-06 12:33:11');
INSERT INTO `payments` (`id`, `booking_id`, `transaction_reference`, `payment_method`, `amount`, `payment_date`, `currency`, `status`, `payment_data`, `notes`, `recorded_by`, `paid_at`, `created_at`, `updated_at`) VALUES ('29', '69', 'TX-WSI-20261106-32F4', 'upi', '10000.00', NULL, 'INR', 'pending', NULL, NULL, NULL, NULL, '2026-11-06 12:33:12', '2026-11-06 12:33:12');
INSERT INTO `payments` (`id`, `booking_id`, `transaction_reference`, `payment_method`, `amount`, `payment_date`, `currency`, `status`, `payment_data`, `notes`, `recorded_by`, `paid_at`, `created_at`, `updated_at`) VALUES ('30', '70', 'TX-WSI-20261111-84CF', 'pay_on_arrival', '130.00', NULL, 'USD', 'pending', NULL, NULL, NULL, NULL, '2026-11-11 10:39:44', '2026-11-11 10:39:44');
INSERT INTO `payments` (`id`, `booking_id`, `transaction_reference`, `payment_method`, `amount`, `payment_date`, `currency`, `status`, `payment_data`, `notes`, `recorded_by`, `paid_at`, `created_at`, `updated_at`) VALUES ('31', '71', 'TX-WSI-20261113-8C4A', 'pay_on_arrival', '1498.00', NULL, 'USD', 'pending', NULL, NULL, NULL, NULL, '2026-11-13 13:19:22', '2026-11-13 13:19:22');
INSERT INTO `payments` (`id`, `booking_id`, `transaction_reference`, `payment_method`, `amount`, `payment_date`, `currency`, `status`, `payment_data`, `notes`, `recorded_by`, `paid_at`, `created_at`, `updated_at`) VALUES ('32', '72', 'TX-WSI-20261113-8D53', 'pay_on_arrival', '10000.00', NULL, 'INR', 'pending', NULL, NULL, NULL, NULL, '2026-11-13 19:34:38', '2026-11-13 19:34:38');
INSERT INTO `payments` (`id`, `booking_id`, `transaction_reference`, `payment_method`, `amount`, `payment_date`, `currency`, `status`, `payment_data`, `notes`, `recorded_by`, `paid_at`, `created_at`, `updated_at`) VALUES ('33', '73', 'TX-WSI-20261113-F7EB', 'pay_on_arrival', '10000.00', NULL, 'INR', 'pending', NULL, NULL, NULL, NULL, '2026-11-13 19:39:29', '2026-11-13 19:39:29');

-- -----------------------------------------------------
-- Table structure for `permissions`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `group_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_permissions_group` (`group_name`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `permissions`
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('1', 'dashboard.view', 'Dashboard', 'View admin dashboard statistics and metrics', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('2', 'users.view', 'Users', 'View system users list and details', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('3', 'users.create', 'Users', 'Create new administrative and staff accounts', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('4', 'users.edit', 'Users', 'Update user profiles and details', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('5', 'users.delete', 'Users', 'Delete or disable user accounts', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('6', 'roles.view', 'Roles & Permissions', 'View roles and their assigned permissions', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('7', 'roles.manage', 'Roles & Permissions', 'Create, update, and assign roles and permissions', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('8', 'destinations.view', 'Destinations', 'View destinations list and details', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('9', 'destinations.create', 'Destinations', 'Create new destinations', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('10', 'destinations.edit', 'Destinations', 'Edit destination information and sections', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('11', 'destinations.delete', 'Destinations', 'Delete or archive destinations', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('12', 'destinations.publish', 'Destinations', 'Publish or unpublish destinations', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('13', 'tours.view', 'Tours', 'View tours list and details', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('14', 'tours.create', 'Tours', 'Create new tours and packages', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('15', 'tours.edit', 'Tours', 'Edit tour details, itineraries, pricing, and highlights', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('16', 'tours.delete', 'Tours', 'Delete or archive tours', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('17', 'tours.publish', 'Tours', 'Publish or unpublish tours', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('18', 'categories.manage', 'Tour Categories', 'Create, edit, reorder, and delete tour categories', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('19', 'bookings.view', 'Bookings', 'View all customer bookings and details', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('20', 'bookings.edit_status', 'Bookings', 'Update booking statuses and notes', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('21', 'bookings.delete', 'Bookings', 'Cancel or delete bookings', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('22', 'bookings.export', 'Bookings', 'Export bookings reports and lists', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('23', 'reviews.view', 'Reviews', 'View all customer reviews and ratings', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('24', 'reviews.moderate', 'Reviews', 'Approve, reject, feature, or delete reviews', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('25', 'faqs.manage', 'FAQs', 'Manage tour and destination FAQs', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('26', 'media.view', 'Media', 'Browse media library', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('27', 'media.upload', 'Media', 'Upload files to media library', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('28', 'media.delete', 'Media', 'Delete unused media files', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('29', 'homepage.manage', 'Homepage', 'Manage hero carousel, benefits, and home sections', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('30', 'pages.manage', 'Pages', 'Manage dynamic and static content pages', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('31', 'policies.manage', 'Policies', 'Manage Terms, Refund, and Privacy policy content', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('32', 'contact.view', 'Contact Messages', 'View customer contact submissions and inquiries', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('33', 'contact.manage', 'Contact Messages', 'Update contact message statuses and reply notes', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('34', 'footer.manage', 'Footer', 'Manage footer links and column organization', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('35', 'social.manage', 'Social Links', 'Manage social media channels and URLs', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('36', 'settings.view', 'Site Settings', 'View site configuration and general settings', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('37', 'settings.manage', 'Site Settings', 'Update site settings, branding, and contact details', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('38', 'audit_logs.view', 'Audit Logs', 'View administrative action audit trails and security logs', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('39', 'things_to_do.view', 'things_to_do', 'View Things To Do Experiences and Categories', '2026-09-28 15:56:00', '2026-09-28 15:56:00');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('40', 'things_to_do.create', 'things_to_do', 'Create Things To Do Experiences and Categories', '2026-09-28 15:56:00', '2026-09-28 15:56:00');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('41', 'things_to_do.edit', 'things_to_do', 'Edit Things To Do Experiences and Categories', '2026-09-28 15:56:00', '2026-09-28 15:56:00');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('42', 'things_to_do.publish', 'things_to_do', 'Publish/Unpublish Things To Do Experiences', '2026-09-28 15:56:00', '2026-09-28 15:56:00');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('43', 'things_to_do.delete', 'things_to_do', 'Delete Things To Do Experiences and Categories', '2026-09-28 15:56:00', '2026-09-28 15:56:00');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('44', 'things_to_do.manage', 'things_to_do', 'Full Administrative Management of Things To Do Suite', '2026-09-28 15:56:00', '2026-09-28 15:56:00');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('48', 'trip_requests.view', '', 'View bespoke trip requests and quotes', '2026-10-01 20:21:50', '2026-10-01 20:21:50');
INSERT INTO `permissions` (`id`, `name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES ('49', 'trip_requests.manage', '', 'Manage trip requests, status, notes and private docs', '2026-10-01 20:21:50', '2026-10-01 20:21:50');

-- -----------------------------------------------------
-- Table structure for `review_media`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `review_media`;
CREATE TABLE `review_media` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `review_id` bigint unsigned NOT NULL,
  `media_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_rm_review` (`review_id`),
  KEY `fk_rm_media` (`media_id`),
  CONSTRAINT `fk_rm_media` FOREIGN KEY (`media_id`) REFERENCES `media` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rm_review` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table structure for `reviews`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tour_id` bigint unsigned DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `customer_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating` tinyint unsigned NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `moderated_by` bigint unsigned DEFAULT NULL,
  `moderated_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_reviews_tour` (`tour_id`),
  KEY `idx_reviews_user` (`user_id`),
  KEY `idx_reviews_status` (`status`),
  KEY `idx_reviews_rating` (`rating`),
  KEY `idx_reviews_featured` (`is_featured`),
  KEY `idx_reviews_created_at` (`created_at`),
  KEY `fk_reviews_moderator` (`moderated_by`),
  KEY `idx_reviews_deleted_at` (`deleted_at`),
  KEY `fk_reviews_deleted_by` (`deleted_by`),
  CONSTRAINT `fk_reviews_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_moderator` FOREIGN KEY (`moderated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `reviews`
INSERT INTO `reviews` (`id`, `tour_id`, `user_id`, `customer_name`, `customer_email`, `customer_country`, `rating`, `title`, `content`, `image`, `status`, `is_featured`, `moderated_by`, `moderated_at`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES ('50', '138', NULL, 'marc', 'marc@example.com', 'india', '5', 'Delighted Traveler', 'Tour is very nice', 'uploads/media/demo_thingstodo_kerala_art.jpg', 'approved', '1', '458', '2026-11-11 06:39:01', '2026-11-11 12:09:01', '2026-11-11 12:09:01', NULL, NULL);
INSERT INTO `reviews` (`id`, `tour_id`, `user_id`, `customer_name`, `customer_email`, `customer_country`, `rating`, `title`, `content`, `image`, `status`, `is_featured`, `moderated_by`, `moderated_at`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES ('51', '144', NULL, 'Dr. Elena Rostova', 'elena.rostova@traveler.de', 'Germany', '5', 'Unforgettable South India Odyssey', 'Exploring Kerala and Tamil Nadu with a private chauffeur from Wanderer South India was the best decision we made. Our driver was polite, extremely knowledgeable about temple history, and the car was spotless every morning. Total peace of mind!', '/uploads/media/demo_home_tamilnadu.jpg', 'approved', '1', NULL, NULL, '2026-11-14 12:54:30', '2026-11-14 12:54:30', NULL, NULL);
INSERT INTO `reviews` (`id`, `tour_id`, `user_id`, `customer_name`, `customer_email`, `customer_country`, `rating`, `title`, `content`, `image`, `status`, `is_featured`, `moderated_by`, `moderated_at`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES ('52', '150', NULL, 'David & Sarah Miller', 'miller.travels@ukmail.co.uk', 'United Kingdom', '5', 'Magnificent Heritage & Shore Temples', 'The Mahabalipuram and Kanchipuram day tours were breathtaking! The rock relief carvings and seaside Shore Temple were brought to life by our private guide. The Pay on Arrival booking option was super smooth and reassuring.', '/uploads/media/demo_tamilnadu_mahabalipuram.jpg', 'approved', '1', NULL, NULL, '2026-11-14 12:54:30', '2026-11-14 12:54:30', NULL, NULL);
INSERT INTO `reviews` (`id`, `tour_id`, `user_id`, `customer_name`, `customer_email`, `customer_country`, `rating`, `title`, `content`, `image`, `status`, `is_featured`, `moderated_by`, `moderated_at`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES ('53', '170', NULL, 'Arjun & Priya Sharma', 'arjun.sharma@gmail.com', 'India', '5', 'Mystical Palm Leaf Horoscope Experience', 'We booked the sacred Palm Leaf Nadi Horoscope reading and temple tour in Vaitheeswaran Kovil. Finding my ancient leaf from thumbprint was an astonishing and deeply spiritual revelation. Superbly organized!', '/uploads/media/palmleaf_sage_astrology.jpg', 'approved', '1', NULL, NULL, '2026-11-14 12:54:30', '2026-11-14 12:54:30', NULL, NULL);
INSERT INTO `reviews` (`id`, `tour_id`, `user_id`, `customer_name`, `customer_email`, `customer_country`, `rating`, `title`, `content`, `image`, `status`, `is_featured`, `moderated_by`, `moderated_at`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES ('54', '142', NULL, 'Thomas & Claudia Weber', 'thomas.weber@munich-travel.de', 'Germany', '5', 'First-Class Chauffeur & Tea Gardens', 'Munnar mist heights and Alleppey houseboats were paradise. Wanderer South India took care of every single transfer with luxury AC vehicles. Excellent English communication and prompt WhatsApp updates throughout.', '/uploads/media/demo_carousel_munnar.jpg', 'approved', '1', NULL, NULL, '2026-11-14 12:54:30', '2026-11-14 12:54:30', NULL, NULL);
INSERT INTO `reviews` (`id`, `tour_id`, `user_id`, `customer_name`, `customer_email`, `customer_country`, `rating`, `title`, `content`, `image`, `status`, `is_featured`, `moderated_by`, `moderated_at`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES ('55', '169', NULL, 'Lucas Dubois', 'lucas.dubois@paris-voyage.fr', 'France', '5', 'Incredible Waves at Covelong Point', 'Surfing Covelong waves was the highlight of my trip to Tamil Nadu! Certified ocean instructors made me catch my first clean wave in under 45 minutes. Safe, exhilarating, and highly recommended!', '/uploads/media/surfing_tour_banner.jpg', 'approved', '1', NULL, NULL, '2026-11-14 12:54:30', '2026-11-14 12:54:30', NULL, NULL);
INSERT INTO `reviews` (`id`, `tour_id`, `user_id`, `customer_name`, `customer_email`, `customer_country`, `rating`, `title`, `content`, `image`, `status`, `is_featured`, `moderated_by`, `moderated_at`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES ('56', '145', NULL, 'Kavitha & Ramesh Sundaram', 'kavitha.sundaram@sgmail.com', 'Singapore', '5', 'Golden Chidambaram & Thanjavur Circuit', 'Brought my elderly parents for a temple pilgrimage across Thanjavur Big Temple and Madurai Meenakshi. The chauffeur was extraordinarily attentive, patient, and handled luggage effortlessly. A 5-star experience!', '/uploads/media/demo_tamilnadu_thanjavur.jpg', 'approved', '1', NULL, NULL, '2026-11-14 12:54:30', '2026-11-14 12:54:30', NULL, NULL);

-- -----------------------------------------------------
-- Table structure for `role_permissions`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions` (
  `role_id` int unsigned NOT NULL,
  `permission_id` int unsigned NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `fk_rp_permission` (`permission_id`),
  CONSTRAINT `fk_rp_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `role_permissions`
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '1');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '1');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('3', '1');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('4', '1');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '2');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '2');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '3');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '3');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '4');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '4');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '5');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '6');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '6');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '7');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '8');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '8');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('3', '8');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '9');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '9');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('3', '9');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '10');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '10');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('3', '10');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '11');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '11');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '12');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '12');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '13');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '13');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('3', '13');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '14');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '14');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('3', '14');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '15');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '15');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('3', '15');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '16');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '16');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '17');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '17');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '18');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '18');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('3', '18');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '19');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '19');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '20');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '20');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '21');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '21');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '22');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '22');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '23');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '23');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('4', '23');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '24');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '24');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('4', '24');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '25');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '25');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('3', '25');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '26');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '26');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('3', '26');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '27');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '27');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('3', '27');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '28');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '28');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '29');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '29');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('3', '29');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '30');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '30');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('3', '30');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '31');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '31');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('3', '31');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '32');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '32');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('4', '32');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '33');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '33');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('4', '33');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '34');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '34');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('3', '34');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '35');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '35');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('3', '35');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '36');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '36');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '37');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('1', '38');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '38');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '39');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '40');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '41');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '42');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '43');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '44');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '48');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES ('2', '49');

-- -----------------------------------------------------
-- Table structure for `roles`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_system` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_roles_slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `roles`
INSERT INTO `roles` (`id`, `name`, `slug`, `description`, `is_system`, `created_at`, `updated_at`) VALUES ('1', 'Super Admin', 'super_admin', 'Full system access and authority over all resources, users, and settings', '1', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `roles` (`id`, `name`, `slug`, `description`, `is_system`, `created_at`, `updated_at`) VALUES ('2', 'Admin', 'admin', 'Administrative management of tours, destinations, bookings, and content', '1', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `roles` (`id`, `name`, `slug`, `description`, `is_system`, `created_at`, `updated_at`) VALUES ('3', 'Editor', 'editor', 'Content editor with permissions to manage tours, destinations, media, and pages', '1', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `roles` (`id`, `name`, `slug`, `description`, `is_system`, `created_at`, `updated_at`) VALUES ('4', 'Moderator', 'moderator', 'Moderator for customer reviews, comments, and inquiries', '1', '2026-09-24 16:24:47', '2026-09-24 16:24:47');
INSERT INTO `roles` (`id`, `name`, `slug`, `description`, `is_system`, `created_at`, `updated_at`) VALUES ('5', 'Customer', 'customer', 'Registered public customer for viewing personal bookings and review history', '1', '2026-09-24 16:24:47', '2026-11-13 21:23:41');

-- -----------------------------------------------------
-- Table structure for `site_settings`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `site_settings`;
CREATE TABLE `site_settings` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` longtext COLLATE utf8mb4_unicode_ci,
  `setting_group` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`),
  KEY `idx_settings_key` (`setting_key`),
  KEY `idx_settings_group` (`setting_group`),
  KEY `idx_settings_deleted_at` (`deleted_at`),
  KEY `fk_settings_deleted_by` (`deleted_by`),
  CONSTRAINT `fk_settings_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `site_settings`
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('1', 'site_name', 'Wanderer South India', 'general', NULL, NULL, '2026-09-24 16:24:48', '2026-11-06 13:04:25');
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('2', 'site_tagline', 'DREAM. TRAVEL. DISCOVER.', 'general', NULL, NULL, '2026-09-24 16:24:48', '2026-11-03 12:38:24');
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('4', 'site_favicon', '/favicon.svg', 'general', NULL, NULL, '2026-09-24 16:24:48', '2026-09-24 16:24:48');
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('5', 'default_currency', 'EUR', 'general', NULL, NULL, '2026-09-24 16:24:48', '2026-09-24 16:24:48');
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('6', 'currency_symbol', 'Ôé¼', 'general', NULL, NULL, '2026-09-24 16:24:48', '2026-09-24 16:24:48');
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('7', 'timezone', 'Asia/Kolkata', 'general', NULL, NULL, '2026-09-24 16:24:48', '2026-09-24 16:24:48');
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('8', 'contact_person', 'P. Kishore', 'contact', NULL, NULL, '2026-09-24 16:24:48', '2026-09-24 16:24:48');
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('9', 'contact_email', 'contact@wonderersouthindia.in', 'contact', NULL, NULL, '2026-09-24 16:24:48', '2026-11-06 13:04:26');
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('10', 'contact_phone', '+91 8072566010', 'contact', NULL, NULL, '2026-09-24 16:24:48', '2026-11-06 13:04:26');
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('11', 'contact_address', 'Chennai, Tamil Nadu, India', 'contact', NULL, NULL, '2026-09-24 16:24:48', '2026-09-24 16:24:48');
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('12', 'contact_business_hours', 'Mon - Sun: 08:00 AM - 09:00 PM IST', 'contact', NULL, NULL, '2026-09-24 16:24:48', '2026-11-03 12:38:24');
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('13', 'footer_about', 'Wonderer South India specializes in foreign-client tourism, private sightseeing, cultural heritage expeditions, and custom travel across South India.', 'footer', NULL, NULL, '2026-09-24 16:24:48', '2026-11-03 12:38:24');
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('14', 'footer_copyright', '© 2026 Wanderer South India. All rights reserved.', 'footer', NULL, NULL, '2026-09-24 16:24:48', '2026-11-06 13:04:26');
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('15', 'seo_default_title', 'Wonderer South India | Premier South India Tours & Travel Experiences', 'seo', NULL, NULL, '2026-09-24 16:24:48', '2026-09-30 10:07:45');
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('16', 'seo_default_description', 'Discover premium South India tours, private sightseeing, cultural heritage packages, and hassle-free travel across Tamil Nadu, Kerala, Karnataka, and Goa with Wonderer South India.', 'seo', NULL, NULL, '2026-09-24 16:24:48', '2026-09-30 10:07:45');
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('17', 'default_payment_method', 'pay_on_arrival', 'payment', NULL, NULL, '2026-09-24 16:24:48', '2026-09-24 16:24:48');
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('24', 'meta_description', 'Discover premium South India tours, private sightseeing, cultural heritage packages, and hassle-free travel across Tamil Nadu, Kerala, Karnataka, and Goa with Wonderer South India.', 'general', NULL, NULL, '2026-09-28 11:03:10', '2026-09-30 10:07:45');
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('25', 'about', 'Wonderer South India specializes in foreign-client tourism, private sightseeing, cultural heritage expeditions, and custom travel across South India.', 'footer', NULL, NULL, '2026-09-28 11:03:10', '2026-09-30 10:07:45');
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('26', 'site_logo', '/logo.png', 'general', NULL, NULL, '2026-09-28 11:23:55', '2026-10-30 10:58:51');
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('27', 'site_logo_media_id', '1', 'general', NULL, NULL, '2026-09-28 11:23:55', '2026-09-28 11:23:55');
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('29', 'contact_whatsapp', '+91 8072566010', 'contact', NULL, NULL, '2026-09-29 13:58:26', '2026-11-06 13:04:26');
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('30', 'homepage_section_order', '[\"navbar\",\"hero\",\"search\",\"benefits\",\"categories\",\"tours\",\"destinations\",\"activities\",\"reviews\",\"cms\",\"footer\"]', 'homepage', NULL, NULL, '2026-09-29 16:06:21', '2026-11-03 12:38:23');
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('31', 'homepage_section_visibility', '{\"navbar\":true,\"hero\":true,\"search\":true,\"benefits\":true,\"categories\":true,\"tours\":true,\"destinations\":true,\"activities\":true,\"reviews\":true,\"cms\":true,\"footer\":true}', 'homepage', NULL, NULL, '2026-09-29 16:06:21', '2026-11-03 12:38:23');
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('32', 'search_heading', 'Where would you like to travel?', 'homepage', NULL, NULL, '2026-09-29 16:06:21', '2026-11-03 12:38:23');
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('33', 'search_subtitle', 'Search handcrafted itineraries across South India', 'homepage', NULL, NULL, '2026-09-29 16:06:22', '2026-11-03 12:38:23');
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('34', 'search_btn_text', 'Find Tours', 'homepage', NULL, NULL, '2026-09-29 16:06:22', '2026-11-03 12:38:23');
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('35', 'footer_planning_badge', 'Curated Itineraries & Luxury Transport', 'footer', NULL, NULL, '2026-09-30 15:42:53', '2026-11-06 13:04:26');
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('36', 'footer_planning_title', 'Travel Planning Services by Wanderer South India', 'footer', NULL, NULL, '2026-09-30 15:42:53', '2026-11-06 13:04:26');
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('37', 'footer_planning_lead', 'Let’s work with a family travel expert to book the vacation of your dreams!', 'footer', NULL, NULL, '2026-09-30 15:42:53', '2026-11-06 13:04:26');
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('38', 'footer_planning_prompt', '...check if your specific vacation is one we can assist with, including travel amenities for the whole family? We’d love to hear from you during your vacation planning journey!', 'footer', NULL, NULL, '2026-09-30 15:42:53', '2026-09-30 15:42:53');
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('39', 'footer_planning_btn_text', 'Message us on WhatsApp', 'footer', NULL, NULL, '2026-09-30 15:42:53', '2026-11-06 13:04:26');
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('40', 'footer_planning_whatsapp_msg', 'Hello Wonderer South India! I would like to inquire about family travel amenities, vacation planning services, and custom tour packages.', 'footer', NULL, NULL, '2026-09-30 15:42:53', '2026-09-30 15:42:53');
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('42', 'unauth_key', 'test', 'general', NULL, NULL, '2026-10-01 20:17:34', '2026-10-01 20:17:34');

-- -----------------------------------------------------
-- Table structure for `social_links`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `social_links`;
CREATE TABLE `social_links` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `platform` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sl_platform` (`platform`),
  KEY `idx_sl_order` (`display_order`),
  KEY `idx_sl_status` (`status`),
  KEY `idx_sl_deleted_at` (`deleted_at`),
  KEY `fk_sl_deleted_by` (`deleted_by`),
  CONSTRAINT `fk_sl_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `social_links`
INSERT INTO `social_links` (`id`, `platform`, `url`, `icon`, `display_order`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('1', 'facebook', 'https://facebook.com/tramaxtours', 'facebook', '1', 'active', NULL, NULL, '2026-09-24 16:24:48', '2026-09-24 16:24:48');
INSERT INTO `social_links` (`id`, `platform`, `url`, `icon`, `display_order`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('2', 'instagram', 'https://instagram.com/tramaxtours', 'instagram', '2', 'active', NULL, NULL, '2026-09-24 16:24:48', '2026-09-24 16:24:48');
INSERT INTO `social_links` (`id`, `platform`, `url`, `icon`, `display_order`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('3', 'youtube', 'https://youtube.com/@tramaxtours', 'youtube', '3', 'active', NULL, NULL, '2026-09-24 16:24:48', '2026-09-24 16:24:48');
INSERT INTO `social_links` (`id`, `platform`, `url`, `icon`, `display_order`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('4', 'x', 'https://x.com/tramaxtours', 'twitter', '4', 'active', NULL, NULL, '2026-09-24 16:24:48', '2026-09-24 16:24:48');
INSERT INTO `social_links` (`id`, `platform`, `url`, `icon`, `display_order`, `status`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES ('5', 'tripadvisor', 'https://tripadvisor.com', 'tripadvisor', '5', 'active', NULL, NULL, '2026-09-24 16:24:48', '2026-09-24 16:24:48');

-- -----------------------------------------------------
-- Table structure for `tour_availability_dates`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tour_availability_dates`;
CREATE TABLE `tour_availability_dates` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tour_id` bigint unsigned NOT NULL,
  `travel_date` date NOT NULL,
  `total_seats` int unsigned NOT NULL DEFAULT '20',
  `booked_seats` int unsigned NOT NULL DEFAULT '0',
  `is_closed` tinyint(1) NOT NULL DEFAULT '0',
  `booking_cutoff_hours` int unsigned NOT NULL DEFAULT '24',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_tour_availability_date` (`tour_id`,`travel_date`),
  KEY `idx_tour_availability_tour` (`tour_id`),
  KEY `idx_tour_availability_date` (`travel_date`),
  CONSTRAINT `fk_tour_availability_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table structure for `tour_categories`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tour_categories`;
CREATE TABLE `tour_categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `badge_color` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT '#0284c7',
  `icon` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `display_order` int NOT NULL DEFAULT '0',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_tour_cat_slug` (`slug`),
  KEY `idx_tour_cat_status` (`status`),
  KEY `idx_tour_cat_order` (`display_order`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `tour_categories`
INSERT INTO `tour_categories` (`id`, `name`, `slug`, `badge_color`, `icon`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('1', 'Cultural Tour', 'cultural-tour', '#0284c7', NULL, 'Heritage monuments, royal palaces, and ancient temple architecture.', '0', 'active', '2026-10-01 20:22:50', '2026-10-01 20:22:50');
INSERT INTO `tour_categories` (`id`, `name`, `slug`, `badge_color`, `icon`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('2', 'Pilgrimage', 'pilgrimage', '#0284c7', NULL, 'Spiritual circuits, sacred temples, and holy South India shrines.', '0', 'active', '2026-10-01 20:22:50', '2026-10-01 20:22:50');
INSERT INTO `tour_categories` (`id`, `name`, `slug`, `badge_color`, `icon`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('3', 'Beach Holiday', 'beach-holiday', '#0284c7', NULL, 'Pristine coastal retreats, coconut groves, and sun-kissed shores.', '0', 'active', '2026-10-01 20:22:50', '2026-10-01 20:22:50');
INSERT INTO `tour_categories` (`id`, `name`, `slug`, `badge_color`, `icon`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('4', 'Adventure Tour', 'adventure-tour', '#0284c7', NULL, 'Western Ghats trekking, wildlife safaris, and outdoor expeditions.', '0', 'active', '2026-10-01 20:22:50', '2026-10-01 20:22:50');
INSERT INTO `tour_categories` (`id`, `name`, `slug`, `badge_color`, `icon`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('5', 'Wildlife Tour', 'wildlife-tour', '#0284c7', NULL, 'National parks, tiger reserves, elephant sanctuaries, and birding.', '0', 'active', '2026-10-01 20:22:50', '2026-10-01 20:22:50');
INSERT INTO `tour_categories` (`id`, `name`, `slug`, `badge_color`, `icon`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('6', 'Shopping Tour', 'shopping-tour', '#0284c7', NULL, 'Silk weaving centers, spice bazaars, handicrafts, and artisanal markets.', '0', 'active', '2026-10-01 20:22:50', '2026-10-01 20:22:50');
INSERT INTO `tour_categories` (`id`, `name`, `slug`, `badge_color`, `icon`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('8', 'Surfing Tours', 'surfing-tour', '#0284c7', NULL, 'Professional ocean wave surfing lessons with certified ISA surf coaches at Covelong Point.', '9', 'active', '2026-11-05 14:56:23', '2026-11-12 10:27:46');
INSERT INTO `tour_categories` (`id`, `name`, `slug`, `badge_color`, `icon`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('9', 'Medical Tourism & Health Checks', 'medical-tourism', '#0284c7', NULL, 'Comprehensive executive health checkups, preventive diagnostics and holistic wellness.', '11', 'active', '2026-11-05 14:56:23', '2026-11-12 10:27:46');
INSERT INTO `tour_categories` (`id`, `name`, `slug`, `badge_color`, `icon`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('10', 'Palmleaf Horoscope Tours', 'palmleaf-horoscope', '#d97706', NULL, 'Ancient Maharishi Agastya Nadi Astrology reading and destiny discovery at Vaitheeswaran Kovil.', '10', 'active', '2026-11-11 13:20:52', '2026-11-12 10:27:46');
INSERT INTO `tour_categories` (`id`, `name`, `slug`, `badge_color`, `icon`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('11', 'City Sightseeing Tours', 'city-sightseeing-tours', '#0284c7', NULL, 'Iconic urban landmarks, bustling markets, panoramic view-points, and modern cultural highlights.', '1', 'active', '2026-11-12 10:27:46', '2026-11-12 10:27:46');
INSERT INTO `tour_categories` (`id`, `name`, `slug`, `badge_color`, `icon`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('12', 'Cultural & Heritage Tours', 'cultural-heritage-tours', '#0284c7', NULL, 'Living heritage monuments, royal palaces, UNESCO world heritage sites, and classical traditions.', '2', 'active', '2026-11-12 10:27:46', '2026-11-12 10:27:46');
INSERT INTO `tour_categories` (`id`, `name`, `slug`, `badge_color`, `icon`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('13', 'Family Tours', 'family-tours', '#0284c7', NULL, 'Curated vacations tailored for families and small groups wanting scenic beauty and cultural encounters.', '3', 'active', '2026-11-12 10:27:46', '2026-11-12 10:27:46');
INSERT INTO `tour_categories` (`id`, `name`, `slug`, `badge_color`, `icon`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('14', 'Guided Tours', 'guided-tours', '#0284c7', NULL, 'Expert localized commentary with licensed government storytellers and native scholars.', '4', 'active', '2026-11-12 10:27:46', '2026-11-12 10:27:46');
INSERT INTO `tour_categories` (`id`, `name`, `slug`, `badge_color`, `icon`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('15', 'Historical Tours', 'historical-tours', '#0284c7', NULL, 'Ancient fortifications, megalithic rock carvings, colonial settlements, and archaeological ruins.', '5', 'active', '2026-11-12 10:27:46', '2026-11-12 10:27:46');
INSERT INTO `tour_categories` (`id`, `name`, `slug`, `badge_color`, `icon`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('16', 'One Day Tours', 'one-day-tours', '#0284c7', NULL, 'Full-day and half-day immersive excursions with private chauffeur transport from city centers.', '6', 'active', '2026-11-12 10:27:46', '2026-11-12 10:27:46');
INSERT INTO `tour_categories` (`id`, `name`, `slug`, `badge_color`, `icon`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('17', 'Pilgrimage / Temple Tours', 'pilgrimage-temple-tours', '#0284c7', NULL, 'Spiritual circuits, sacred Dravidian temple architecture, holy tanks, and ancient pooja rituals.', '7', 'active', '2026-11-12 10:27:46', '2026-11-12 10:27:46');
INSERT INTO `tour_categories` (`id`, `name`, `slug`, `badge_color`, `icon`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('18', 'Private Tours', 'private-tours', '#0284c7', NULL, 'Exclusive personalized itineraries with private air-conditioned vehicle and bespoke schedule.', '8', 'active', '2026-11-12 10:27:46', '2026-11-12 10:27:46');

-- -----------------------------------------------------
-- Table structure for `tour_category_map`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tour_category_map`;
CREATE TABLE `tour_category_map` (
  `tour_id` bigint unsigned NOT NULL,
  `category_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`tour_id`,`category_id`),
  KEY `idx_tcm_category` (`category_id`),
  CONSTRAINT `fk_tcm_category` FOREIGN KEY (`category_id`) REFERENCES `tour_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_tcm_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `tour_category_map`
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('169', '8');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('170', '10');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('139', '11');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('143', '11');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('150', '11');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('152', '11');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('153', '11');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('138', '12');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('140', '12');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('141', '12');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('142', '12');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('144', '12');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('145', '12');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('150', '12');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('151', '12');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('152', '12');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('153', '12');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('139', '13');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('141', '13');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('143', '13');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('145', '13');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('138', '14');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('140', '15');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('150', '15');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('153', '15');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('150', '16');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('151', '16');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('152', '16');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('153', '16');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('144', '17');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('151', '17');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('138', '18');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('140', '18');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('142', '18');
INSERT INTO `tour_category_map` (`tour_id`, `category_id`) VALUES ('144', '18');

-- -----------------------------------------------------
-- Table structure for `tour_excludes`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tour_excludes`;
CREATE TABLE `tour_excludes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tour_id` bigint unsigned NOT NULL,
  `item_text` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_te_tour` (`tour_id`),
  KEY `idx_te_order` (`display_order`),
  CONSTRAINT `fk_te_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `tour_excludes`
INSERT INTO `tour_excludes` (`id`, `tour_id`, `item_text`, `display_order`, `created_at`, `updated_at`) VALUES ('5', '150', 'Entrance / admission tickets', '0', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_excludes` (`id`, `tour_id`, `item_text`, `display_order`, `created_at`, `updated_at`) VALUES ('6', '150', 'Accommodation', '1', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_excludes` (`id`, `tour_id`, `item_text`, `display_order`, `created_at`, `updated_at`) VALUES ('7', '150', 'Food and beverages', '2', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_excludes` (`id`, `tour_id`, `item_text`, `display_order`, `created_at`, `updated_at`) VALUES ('8', '150', 'Personal expenses & tips', '3', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_excludes` (`id`, `tour_id`, `item_text`, `display_order`, `created_at`, `updated_at`) VALUES ('16', '169', 'Personal towels and swimwear', '0', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_excludes` (`id`, `tour_id`, `item_text`, `display_order`, `created_at`, `updated_at`) VALUES ('17', '169', 'Food and extra beverages outside refreshments', '1', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_excludes` (`id`, `tour_id`, `item_text`, `display_order`, `created_at`, `updated_at`) VALUES ('18', '169', 'Personal gratuities for instructor / chauffeur', '2', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_excludes` (`id`, `tour_id`, `item_text`, `display_order`, `created_at`, `updated_at`) VALUES ('21', '170', 'Personal temple puja offerings or special homams', '0', '2026-11-12 10:36:25', '2026-11-12 10:36:25');
INSERT INTO `tour_excludes` (`id`, `tour_id`, `item_text`, `display_order`, `created_at`, `updated_at`) VALUES ('22', '170', 'Personal expenses and driver/translator gratuities', '1', '2026-11-12 10:36:25', '2026-11-12 10:36:25');

-- -----------------------------------------------------
-- Table structure for `tour_faqs`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tour_faqs`;
CREATE TABLE `tour_faqs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tour_id` bigint unsigned NOT NULL,
  `question` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  `status` enum('published','draft') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tfaq_tour` (`tour_id`),
  KEY `idx_tfaq_order` (`display_order`),
  KEY `idx_tfaq_status` (`status`),
  CONSTRAINT `fk_tfaq_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `tour_faqs`
INSERT INTO `tour_faqs` (`id`, `tour_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('1', '150', 'Is this a private tour and who is it suitable for?', 'Yes, this is a 100% private customized day tour with an exclusive air-conditioned vehicle and chauffeur. It is ideal for international travelers, couples, families, and history enthusiasts.', '0', 'published', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_faqs` (`id`, `tour_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('2', '150', 'How long is the Mahabalipuram Day Tour and which places are covered?', 'The tour duration is approximately 8–10 hours. Key covered attractions include the UNESCO World Heritage Shore Temple, Arjuna\'s Penance, Krishna\'s Butter Ball, Pancha Rathas (Five Rathas), Covelong Beach, and ISKCON Temple.', '1', 'published', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_faqs` (`id`, `tour_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('3', '150', 'What is included in the Mahabalipuram Day Tour package?', 'The package includes private AC cab transportation, chauffeur allowances, fuel, toll gate charges, and vehicle parking. Entrance tickets, guide fees, and meal arrangements can be chosen on-demand.', '2', 'published', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_faqs` (`id`, `tour_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('22', '169', 'Do I need to know how to swim to join the surfing lessons?', 'Whether you know how to swim or not, we will guide you so that you can surf independently with no fear. Just like a pro surfer.', '1', 'published', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_faqs` (`id`, `tour_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('23', '169', 'How are the surfing lessons structured?', 'Surfing lessons include a theatrical lesson for a half hour (30 minutes on equipment, handling, safety) followed by a practical session for one hour in the ocean.', '2', 'published', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_faqs` (`id`, `tour_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('24', '169', 'What do you learn as a beginner?', 'For beginners, you learn: Equipment and safety instructions, How to handle the board in the water, How to stand up on a board, and how to Surf your first waves close to the beach.', '3', 'published', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_faqs` (`id`, `tour_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('25', '169', 'What do you learn as an intermediator?', 'For intermediators, you learn: Refresher on basics, equipment and safety, How to paddle out behind the breaking waves, and How to take green waves on your own.', '4', 'published', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_faqs` (`id`, `tour_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('26', '169', 'What are the prices and what do they include?', 'Prices for beginners start from 5000 INR. Prices for intermediators are 6000 INR. Prices include: 1. Transport, 2. Surfing theory and practical lessons, 3. Guide.', '5', 'published', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_faqs` (`id`, `tour_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('27', '169', 'What are the opening times and contact details?', 'Opening Times: Every Day from 8 AM to 6 PM. Contact: E-Mail: welcome@yourbestdayinindia.com | Phone and WhatsApp: +91 9840291110.', '6', 'published', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_faqs` (`id`, `tour_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('34', '170', 'What does Nadi mean and what is Nadi Astrology?', 'Nadi, in the ancient language of Tamil, means “in search of”. Because an individual goes in search of the predictions made for them, to find purpose and direction, the entire system of the Maharishis’ insights and predictions eventually came to be called by this name, Nadi Astrology.', '1', 'published', '2026-11-12 10:36:25', '2026-11-12 10:36:25');
INSERT INTO `tour_faqs` (`id`, `tour_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('35', '170', 'How were the Palm Leaves prepared and preserved?', 'Three thousand years ago, personal information about you was dictated by the Maharishis to their disciples and handwritten on special Palm Leaves, also called Nadis. These Palm Leaves were preserved for all this time, for you to access their contents when you need it most.', '2', 'published', '2026-11-12 10:36:25', '2026-11-12 10:36:25');
INSERT INTO `tour_faqs` (`id`, `tour_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('36', '170', 'What are the procedures for palm leaf reading?', '1. Searching for bundle(s): we use your thumb impression and country of birth to search for candidate bundles. 2. Matching: moderated verification to identify your one personal leaf. 3. Reading: the reading lets you know about your life and future milestones.', '3', 'published', '2026-11-12 10:36:25', '2026-11-12 10:36:25');
INSERT INTO `tour_faqs` (`id`, `tour_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('37', '170', 'What are the opening times?', 'Opening Times: Every Day from 10 AM to 6 PM.', '4', 'published', '2026-11-12 10:36:25', '2026-11-12 10:36:25');
INSERT INTO `tour_faqs` (`id`, `tour_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('38', '170', 'What are the prices and what is included?', 'Prices for palm leaf horoscope per person: 7000 INR. Price includes: 1. Translator, 2. Transportation.', '5', 'published', '2026-11-12 10:36:25', '2026-11-12 10:36:25');
INSERT INTO `tour_faqs` (`id`, `tour_id`, `question`, `answer`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('39', '170', 'How do I contact or schedule an appointment?', 'Contact: E-Mail: welcome@yourbestdayinindia.com | Phone and WhatsApp: +91 9840291110.', '6', 'published', '2026-11-12 10:36:25', '2026-11-12 10:36:25');

-- -----------------------------------------------------
-- Table structure for `tour_gallery`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tour_gallery`;
CREATE TABLE `tour_gallery` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tour_id` bigint unsigned NOT NULL,
  `media_id` bigint unsigned NOT NULL,
  `is_cover` tinyint(1) NOT NULL DEFAULT '0',
  `display_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tour_gallery_tour` (`tour_id`),
  KEY `idx_tour_gallery_order` (`display_order`),
  KEY `idx_tour_gallery_cover` (`is_cover`),
  KEY `fk_tg_media` (`media_id`),
  CONSTRAINT `fk_tg_media` FOREIGN KEY (`media_id`) REFERENCES `media` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_tg_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `tour_gallery`
INSERT INTO `tour_gallery` (`id`, `tour_id`, `media_id`, `is_cover`, `display_order`, `created_at`) VALUES ('4', '150', '427', '1', '0', '2026-09-26 12:33:29');
INSERT INTO `tour_gallery` (`id`, `tour_id`, `media_id`, `is_cover`, `display_order`, `created_at`) VALUES ('5', '150', '423', '0', '1', '2026-09-26 12:33:29');
INSERT INTO `tour_gallery` (`id`, `tour_id`, `media_id`, `is_cover`, `display_order`, `created_at`) VALUES ('6', '150', '424', '0', '2', '2026-09-26 12:33:29');
INSERT INTO `tour_gallery` (`id`, `tour_id`, `media_id`, `is_cover`, `display_order`, `created_at`) VALUES ('17', '169', '504', '1', '1', '2026-11-11 13:20:52');
INSERT INTO `tour_gallery` (`id`, `tour_id`, `media_id`, `is_cover`, `display_order`, `created_at`) VALUES ('18', '169', '505', '0', '2', '2026-11-11 13:20:52');
INSERT INTO `tour_gallery` (`id`, `tour_id`, `media_id`, `is_cover`, `display_order`, `created_at`) VALUES ('19', '169', '506', '0', '3', '2026-11-11 13:20:52');
INSERT INTO `tour_gallery` (`id`, `tour_id`, `media_id`, `is_cover`, `display_order`, `created_at`) VALUES ('28', '170', '501', '1', '1', '2026-11-12 10:36:25');
INSERT INTO `tour_gallery` (`id`, `tour_id`, `media_id`, `is_cover`, `display_order`, `created_at`) VALUES ('29', '170', '502', '0', '2', '2026-11-12 10:36:25');
INSERT INTO `tour_gallery` (`id`, `tour_id`, `media_id`, `is_cover`, `display_order`, `created_at`) VALUES ('30', '170', '503', '0', '3', '2026-11-12 10:36:25');
INSERT INTO `tour_gallery` (`id`, `tour_id`, `media_id`, `is_cover`, `display_order`, `created_at`) VALUES ('31', '170', '508', '0', '4', '2026-11-12 10:36:25');

-- -----------------------------------------------------
-- Table structure for `tour_highlights`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tour_highlights`;
CREATE TABLE `tour_highlights` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tour_id` bigint unsigned NOT NULL,
  `highlight_text` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_th_tour` (`tour_id`),
  KEY `idx_th_order` (`display_order`),
  CONSTRAINT `fk_th_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `tour_highlights`
INSERT INTO `tour_highlights` (`id`, `tour_id`, `highlight_text`, `icon`, `display_order`, `created_at`, `updated_at`) VALUES ('5', '150', 'Full-day Mahabalipuram local sightseeing tour', NULL, '0', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_highlights` (`id`, `tour_id`, `highlight_text`, `icon`, `display_order`, `created_at`, `updated_at`) VALUES ('6', '150', 'Duration: 10 hours', NULL, '1', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_highlights` (`id`, `tour_id`, `highlight_text`, `icon`, `display_order`, `created_at`, `updated_at`) VALUES ('7', '150', 'Private cab tour (not shared with others)', NULL, '2', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_highlights` (`id`, `tour_id`, `highlight_text`, `icon`, `display_order`, `created_at`, `updated_at`) VALUES ('8', '150', 'Pickup and drop from your Chennai hotel / residence', NULL, '3', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_highlights` (`id`, `tour_id`, `highlight_text`, `icon`, `display_order`, `created_at`, `updated_at`) VALUES ('30', '169', '\"Surfing is not a sport, it’s a lifestyle\" — Turn your dream of being a surfer into reality', NULL, '1', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_highlights` (`id`, `tour_id`, `highlight_text`, `icon`, `display_order`, `created_at`, `updated_at`) VALUES ('31', '169', 'Whether you know how to swim or not, our guides coach you to surf independently with no fear', NULL, '2', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_highlights` (`id`, `tour_id`, `highlight_text`, `icon`, `display_order`, `created_at`, `updated_at`) VALUES ('32', '169', 'Structured lessons: 30-minute theatrical lesson + 1-hour practical in-water session', NULL, '3', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_highlights` (`id`, `tour_id`, `highlight_text`, `icon`, `display_order`, `created_at`, `updated_at`) VALUES ('33', '169', 'For beginners: equipment & safety instructions, board handling, and standing up close to shore', NULL, '4', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_highlights` (`id`, `tour_id`, `highlight_text`, `icon`, `display_order`, `created_at`, `updated_at`) VALUES ('34', '169', 'For intermediators: refresher on basics, paddling out behind the break & catching green waves solo', NULL, '5', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_highlights` (`id`, `tour_id`, `highlight_text`, `icon`, `display_order`, `created_at`, `updated_at`) VALUES ('35', '169', 'All-inclusive package: 1. Transport, 2. Surfing theory and practical lessons, 3. Dedicated Guide', NULL, '6', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_highlights` (`id`, `tour_id`, `highlight_text`, `icon`, `display_order`, `created_at`, `updated_at`) VALUES ('36', '169', 'Open Every Day from 8:00 AM to 6:00 PM with flexible booking slots', NULL, '7', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_highlights` (`id`, `tour_id`, `highlight_text`, `icon`, `display_order`, `created_at`, `updated_at`) VALUES ('44', '170', 'Nadi, in the ancient language of Tamil, means “in search of” — Find your purpose and direction', NULL, '1', '2026-11-12 10:36:25', '2026-11-12 10:36:25');
INSERT INTO `tour_highlights` (`id`, `tour_id`, `highlight_text`, `icon`, `display_order`, `created_at`, `updated_at`) VALUES ('45', '170', 'Dictated 3,000 years ago by Maharishis on special Palm Leaves specifically for your life path', NULL, '2', '2026-11-12 10:36:25', '2026-11-12 10:36:25');
INSERT INTO `tour_highlights` (`id`, `tour_id`, `highlight_text`, `icon`, `display_order`, `created_at`, `updated_at`) VALUES ('46', '170', 'Procedure 1: Searching for bundle(s) using your unique thumb impression and country of birth', NULL, '3', '2026-11-12 10:36:25', '2026-11-12 10:36:25');
INSERT INTO `tour_highlights` (`id`, `tour_id`, `highlight_text`, `icon`, `display_order`, `created_at`, `updated_at`) VALUES ('47', '170', 'Procedure 2: Moderated matching process by expert reader to locate your one personal Palm Leaf', NULL, '4', '2026-11-12 10:36:25', '2026-11-12 10:36:25');
INSERT INTO `tour_highlights` (`id`, `tour_id`, `highlight_text`, `icon`, `display_order`, `created_at`, `updated_at`) VALUES ('48', '170', 'Procedure 3: The Reading — reveals your destiny and guides you through life changing crossroads', NULL, '5', '2026-11-12 10:36:25', '2026-11-12 10:36:25');
INSERT INTO `tour_highlights` (`id`, `tour_id`, `highlight_text`, `icon`, `display_order`, `created_at`, `updated_at`) VALUES ('49', '170', 'Price for palm leaf horoscope: 7,000 INR per person — includes 1. Translator, 2. Transportation', NULL, '6', '2026-11-12 10:36:25', '2026-11-12 10:36:25');
INSERT INTO `tour_highlights` (`id`, `tour_id`, `highlight_text`, `icon`, `display_order`, `created_at`, `updated_at`) VALUES ('50', '170', 'Opening Times: Every Day from 10:00 AM to 6:00 PM with personalized care', NULL, '7', '2026-11-12 10:36:25', '2026-11-12 10:36:25');

-- -----------------------------------------------------
-- Table structure for `tour_includes`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tour_includes`;
CREATE TABLE `tour_includes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tour_id` bigint unsigned NOT NULL,
  `item_text` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ti_tour` (`tour_id`),
  KEY `idx_ti_order` (`display_order`),
  CONSTRAINT `fk_ti_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `tour_includes`
INSERT INTO `tour_includes` (`id`, `tour_id`, `item_text`, `display_order`, `created_at`, `updated_at`) VALUES ('6', '150', 'Private transportation for sightseeing in AC vehicle', '0', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_includes` (`id`, `tour_id`, `item_text`, `display_order`, `created_at`, `updated_at`) VALUES ('7', '150', 'Vehicle parking charges', '1', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_includes` (`id`, `tour_id`, `item_text`, `display_order`, `created_at`, `updated_at`) VALUES ('8', '150', 'Toll gate charges', '2', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_includes` (`id`, `tour_id`, `item_text`, `display_order`, `created_at`, `updated_at`) VALUES ('9', '150', 'Driver allowance (batta)', '3', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_includes` (`id`, `tour_id`, `item_text`, `display_order`, `created_at`, `updated_at`) VALUES ('10', '150', 'Tour guide (if selected)', '4', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_includes` (`id`, `tour_id`, `item_text`, `display_order`, `created_at`, `updated_at`) VALUES ('25', '169', '1. Transport (Sanitized private vehicle transfer to and from beach)', '0', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_includes` (`id`, `tour_id`, `item_text`, `display_order`, `created_at`, `updated_at`) VALUES ('26', '169', '2. Surfing theory (half hour) and practical lessons (one hour)', '1', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_includes` (`id`, `tour_id`, `item_text`, `display_order`, `created_at`, `updated_at`) VALUES ('27', '169', '3. Dedicated surf guide & certified instructor', '2', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_includes` (`id`, `tour_id`, `item_text`, `display_order`, `created_at`, `updated_at`) VALUES ('28', '169', 'High-grade foam & epoxy surfboards and safety leashes', '3', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_includes` (`id`, `tour_id`, `item_text`, `display_order`, `created_at`, `updated_at`) VALUES ('29', '169', 'UV quick-dry protective rashguard provided for each session', '4', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_includes` (`id`, `tour_id`, `item_text`, `display_order`, `created_at`, `updated_at`) VALUES ('30', '169', 'Beachside shower, changing facilities, and fresh tender coconut', '5', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_includes` (`id`, `tour_id`, `item_text`, `display_order`, `created_at`, `updated_at`) VALUES ('35', '170', '1. Translator (Dedicated live interpreter translating the ancient verses into clear English)', '0', '2026-11-12 10:36:25', '2026-11-12 10:36:25');
INSERT INTO `tour_includes` (`id`, `tour_id`, `item_text`, `display_order`, `created_at`, `updated_at`) VALUES ('36', '170', '2. Transportation (Sanitized private air-conditioned vehicle transfers)', '1', '2026-11-12 10:36:25', '2026-11-12 10:36:25');
INSERT INTO `tour_includes` (`id`, `tour_id`, `item_text`, `display_order`, `created_at`, `updated_at`) VALUES ('37', '170', 'Authentic Nadi bundle search conducted across heritage archives in India', '2', '2026-11-12 10:36:25', '2026-11-12 10:36:25');
INSERT INTO `tour_includes` (`id`, `tour_id`, `item_text`, `display_order`, `created_at`, `updated_at`) VALUES ('38', '170', 'Moderated matching verification and full individual life reading', '3', '2026-11-12 10:36:25', '2026-11-12 10:36:25');

-- -----------------------------------------------------
-- Table structure for `tour_itineraries`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tour_itineraries`;
CREATE TABLE `tour_itineraries` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tour_id` bigint unsigned NOT NULL,
  `time_period` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `display_order` int NOT NULL DEFAULT '0',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_titin_tour` (`tour_id`),
  KEY `idx_titin_order` (`display_order`),
  KEY `idx_titin_status` (`status`),
  CONSTRAINT `fk_titin_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `tour_itineraries`
INSERT INTO `tour_itineraries` (`id`, `tour_id`, `time_period`, `title`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('5', '150', 'Morning (08:30 AM - 11:00 AM)', 'Pickup & Shore Temple Exploration', 'Pickup from your Chennai hotel / residence in a private air-conditioned vehicle. Drive along the scenic East Coast Road (ECR) to Mahabalipuram and visit the iconic Shore Temple, an 8th-century UNESCO World Heritage Site overlooking the Bay of Bengal.', '0', 'active', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_itineraries` (`id`, `tour_id`, `time_period`, `title`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('6', '150', 'Late Morning (11:00 AM - 01:30 PM)', 'Krishna\'s Butter Ball, Arjuna\'s Penance & Pancha Rathas', 'Explore the gravity-defying Krishna\'s Butter Ball natural boulder. Marvel at Arjuna\'s Penance (Descent of the Ganges) stone relief carving, and walk through the monolithic Pancha Rathas (Five Rathas) rock-cut shrines.', '1', 'active', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_itineraries` (`id`, `tour_id`, `time_period`, `title`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('7', '150', 'Afternoon (01:30 PM - 03:00 PM)', 'Authentic Lunch Break & Local Handicrafts', 'Relax and savor authentic South Indian or fresh seafood lunch at a beachside restaurant. Browse traditional stone carving workshops and local seashell handicrafts.', '2', 'active', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_itineraries` (`id`, `tour_id`, `time_period`, `title`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('8', '150', 'Evening (03:30 PM - 06:30 PM)', 'Covelong Beach & ISKCON Temple Return Drive', 'Stop by scenic Covelong Beach for refreshing coastal breezes, followed by a visit to the grand ISKCON Temple in Akkarai. Drive back and drop off safely at your Chennai residence/hotel.', '3', 'active', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_itineraries` (`id`, `tour_id`, `time_period`, `title`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('18', '169', '30 Minutes', 'Theatrical Lesson & Ocean Safety Instructions', 'Equipment instructions and safety orientation on the sand. Learn how to handle the board in the water, understand rip currents, and practice pop-up mechanics.', '1', 'active', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_itineraries` (`id`, `tour_id`, `time_period`, `title`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('19', '169', '60 Minutes', 'Practical In-Water Wave Session', 'Hands-on wave riding with your instructor. Beginners practice popping up on the board and riding first waves close to the beach; intermediators paddle out behind breaking waves and take green waves independently.', '2', 'active', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_itineraries` (`id`, `tour_id`, `time_period`, `title`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('20', '169', 'Post-Session', 'Debrief, Refreshments & Return Transport', 'Review technique tips with your guide, enjoy fresh tender coconut by the beach, and return via private air-conditioned vehicle.', '3', 'active', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_itineraries` (`id`, `tour_id`, `time_period`, `title`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('24', '170', 'Step 1', 'Searching for Bundle(s)', 'As soon as we get the appointment, we use your thumb impression, including in which country you were born in, and the search will commence. Our expert readers in India will physically search for your Palm Leaf bundle(s), which might contain your individual Palm Leaf.', '1', 'active', '2026-11-12 10:36:25', '2026-11-12 10:36:25');
INSERT INTO `tour_itineraries` (`id`, `tour_id`, `time_period`, `title`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('25', '170', 'Step 2', 'Matching Process', 'Preparation for the matching process by moderator; Once the reader has found your bundle(s) that might contain your Palm Leaf, the matching process and thus the search for your one personal Palm Leaf within the bundle(s) begins.', '2', 'active', '2026-11-12 10:36:25', '2026-11-12 10:36:25');
INSERT INTO `tour_itineraries` (`id`, `tour_id`, `time_period`, `title`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('26', '170', 'Step 3', 'The Reading & Destiny Revelations', 'The reading is the most important part of your experience. Based on your individual Palm Leaf, which was identified during the preceding matching process, this final part will let you know about your life.', '3', 'active', '2026-11-12 10:36:25', '2026-11-12 10:36:25');

-- -----------------------------------------------------
-- Table structure for `tour_places`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tour_places`;
CREATE TABLE `tour_places` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tour_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `short_description` text COLLATE utf8mb4_unicode_ci,
  `media_id` bigint unsigned DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tp_tour` (`tour_id`),
  KEY `idx_tp_order` (`display_order`),
  KEY `idx_tp_status` (`status`),
  KEY `fk_tp_media` (`media_id`),
  CONSTRAINT `fk_tp_media` FOREIGN KEY (`media_id`) REFERENCES `media` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_tp_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `tour_places`
INSERT INTO `tour_places` (`id`, `tour_id`, `name`, `short_description`, `media_id`, `latitude`, `longitude`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('7', '150', 'Shore Temple (UNESCO World Heritage Site)', NULL, NULL, NULL, NULL, '1', 'active', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_places` (`id`, `tour_id`, `name`, `short_description`, `media_id`, `latitude`, `longitude`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('8', '150', 'Krishna\'s Butter Ball', NULL, NULL, NULL, NULL, '2', 'active', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_places` (`id`, `tour_id`, `name`, `short_description`, `media_id`, `latitude`, `longitude`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('9', '150', 'Arjuna\'s Penance (Descent of the Ganges)', NULL, NULL, NULL, NULL, '3', 'active', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_places` (`id`, `tour_id`, `name`, `short_description`, `media_id`, `latitude`, `longitude`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('10', '150', 'Pancha Rathas (Five Rathas)', NULL, NULL, NULL, NULL, '4', 'active', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_places` (`id`, `tour_id`, `name`, `short_description`, `media_id`, `latitude`, `longitude`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('11', '150', 'Covelong Beach', NULL, NULL, NULL, NULL, '5', 'active', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_places` (`id`, `tour_id`, `name`, `short_description`, `media_id`, `latitude`, `longitude`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('12', '150', 'ISKCON Temple Chennai', NULL, NULL, NULL, NULL, '6', 'active', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_places` (`id`, `tour_id`, `name`, `short_description`, `media_id`, `latitude`, `longitude`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('20', '169', 'Covelong Point Beach & Surf Village', 'Ideal sandy bottom beach break for beginner lessons, pop-up practice, and safe wave riding.', NULL, '12.79180000', '80.25200000', '1', 'active', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_places` (`id`, `tour_id`, `name`, `short_description`, `media_id`, `latitude`, `longitude`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('21', '169', 'Mahabalipuram Coastal Point Break', 'Historic point break rolling along the Coromandel coast for intermediators to catch green waves.', NULL, '12.61670000', '80.19280000', '2', 'active', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_places` (`id`, `tour_id`, `name`, `short_description`, `media_id`, `latitude`, `longitude`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('24', '170', 'Nadi Astrology Palm Leaf Reading Archive', 'Sacred library where centuries-old palm leaf bundles (Nadis) are preserved and matched.', NULL, '11.20140000', '79.72890000', '1', 'active', '2026-11-12 10:36:25', '2026-11-12 10:36:25');
INSERT INTO `tour_places` (`id`, `tour_id`, `name`, `short_description`, `media_id`, `latitude`, `longitude`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('25', '170', 'Vaitheeswaran Kovil Heritage Precinct', 'Historic temple epicenter of Sage Agastya astrological tradition in Tamil Nadu.', NULL, '11.20230000', '79.72750000', '2', 'active', '2026-11-12 10:36:25', '2026-11-12 10:36:25');

-- -----------------------------------------------------
-- Table structure for `tour_pricing_tiers`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tour_pricing_tiers`;
CREATE TABLE `tour_pricing_tiers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tour_id` bigint unsigned NOT NULL,
  `min_persons` int unsigned NOT NULL,
  `max_persons` int unsigned NOT NULL,
  `service_option` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EUR',
  `price` decimal(10,2) NOT NULL,
  `valid_from` date DEFAULT NULL,
  `valid_to` date DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tpt_tour` (`tour_id`),
  KEY `idx_tpt_persons` (`min_persons`,`max_persons`),
  KEY `idx_tpt_status` (`status`),
  CONSTRAINT `fk_tpt_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `tour_pricing_tiers`
INSERT INTO `tour_pricing_tiers` (`id`, `tour_id`, `min_persons`, `max_persons`, `service_option`, `currency`, `price`, `valid_from`, `valid_to`, `status`, `created_at`, `updated_at`) VALUES ('5', '150', '2', '3', 'Transportation only', 'EUR', '50.00', NULL, NULL, 'active', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_pricing_tiers` (`id`, `tour_id`, `min_persons`, `max_persons`, `service_option`, `currency`, `price`, `valid_from`, `valid_to`, `status`, `created_at`, `updated_at`) VALUES ('6', '150', '2', '3', 'Transportation with tour guide', 'EUR', '75.00', NULL, NULL, 'active', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_pricing_tiers` (`id`, `tour_id`, `min_persons`, `max_persons`, `service_option`, `currency`, `price`, `valid_from`, `valid_to`, `status`, `created_at`, `updated_at`) VALUES ('7', '150', '4', '5', 'Transportation only', 'EUR', '70.00', NULL, NULL, 'active', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_pricing_tiers` (`id`, `tour_id`, `min_persons`, `max_persons`, `service_option`, `currency`, `price`, `valid_from`, `valid_to`, `status`, `created_at`, `updated_at`) VALUES ('8', '150', '4', '5', 'Transportation with tour guide', 'EUR', '100.00', NULL, NULL, 'active', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_pricing_tiers` (`id`, `tour_id`, `min_persons`, `max_persons`, `service_option`, `currency`, `price`, `valid_from`, `valid_to`, `status`, `created_at`, `updated_at`) VALUES ('13', '169', '1', '12', 'Prices for Beginners (Starts from 5000 INR) — Includes Transport, Surfing Lessons & Guide', 'INR', '5000.00', NULL, NULL, 'active', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_pricing_tiers` (`id`, `tour_id`, `min_persons`, `max_persons`, `service_option`, `currency`, `price`, `valid_from`, `valid_to`, `status`, `created_at`, `updated_at`) VALUES ('14', '169', '1', '12', 'Prices for Intermediators (6000 INR) — Includes Transport, Surfing Lessons & Guide', 'INR', '6000.00', NULL, NULL, 'active', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_pricing_tiers` (`id`, `tour_id`, `min_persons`, `max_persons`, `service_option`, `currency`, `price`, `valid_from`, `valid_to`, `status`, `created_at`, `updated_at`) VALUES ('16', '170', '1', '8', 'Prices for Palm Leaf Horoscope Per Person (7000 INR) — Includes Translator & Transportation', 'INR', '7000.00', NULL, NULL, 'active', '2026-11-12 10:36:25', '2026-11-12 10:36:25');

-- -----------------------------------------------------
-- Table structure for `tour_related`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tour_related`;
CREATE TABLE `tour_related` (
  `tour_id` bigint unsigned NOT NULL,
  `related_tour_id` bigint unsigned NOT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`tour_id`,`related_tour_id`),
  KEY `idx_tr_related` (`related_tour_id`),
  CONSTRAINT `fk_tr_related` FOREIGN KEY (`related_tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_tr_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table structure for `tour_why_choose`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tour_why_choose`;
CREATE TABLE `tour_why_choose` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tour_id` bigint unsigned NOT NULL,
  `icon` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `display_order` int NOT NULL DEFAULT '0',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_twc_tour` (`tour_id`),
  KEY `idx_twc_order` (`display_order`),
  KEY `idx_twc_status` (`status`),
  CONSTRAINT `fk_twc_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `tour_why_choose`
INSERT INTO `tour_why_choose` (`id`, `tour_id`, `icon`, `title`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('6', '150', NULL, 'Explore UNESCO World Heritage monuments', NULL, '0', 'active', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_why_choose` (`id`, `tour_id`, `icon`, `title`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('7', '150', NULL, 'Experience ancient Pallava architecture', NULL, '1', 'active', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_why_choose` (`id`, `tour_id`, `icon`, `title`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('8', '150', NULL, 'Enjoy a comfortable private sightseeing tour', NULL, '2', 'active', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_why_choose` (`id`, `tour_id`, `icon`, `title`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('9', '150', NULL, 'Ideal for families, couples, and history lovers', NULL, '3', 'active', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_why_choose` (`id`, `tour_id`, `icon`, `title`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('10', '150', NULL, 'Flexible itinerary with professional driver', NULL, '4', 'active', '2026-09-26 12:33:29', '2026-09-26 12:33:29');
INSERT INTO `tour_why_choose` (`id`, `tour_id`, `icon`, `title`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('19', '169', '🏄', 'Surfing is a Lifestyle, Not Just a Sport', 'We help you to make your dream of being a surfer a reality with authentic ocean passion.', '0', 'active', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_why_choose` (`id`, `tour_id`, `icon`, `title`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('20', '169', '🏊', 'Swim or Not — Surf with No Fear', 'Whether you know how to swim or not, we will guide you so that you can surf independently with no fear. Just like a pro surfer.', '1', 'active', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_why_choose` (`id`, `tour_id`, `icon`, `title`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('21', '169', '🚗', 'All-Inclusive Convenience', 'Prices include: 1. Transport, 2. Surfing theory and practical lessons, 3. Guide.', '2', 'active', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_why_choose` (`id`, `tour_id`, `icon`, `title`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('22', '169', '⏰', 'Open Every Day from 8 AM to 6 PM', 'Flexible daily slots to accommodate your schedule.', '3', 'active', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_why_choose` (`id`, `tour_id`, `icon`, `title`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('23', '170', '📜', 'Ancient Nadi Heritage', 'Nadi means \"in search of\". Three thousand years ago, personal information was dictated by the Maharishis and preserved for you.', '0', 'active', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_why_choose` (`id`, `tour_id`, `icon`, `title`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('24', '170', '🗣️', 'Dedicated Translator Included', 'No language barriers. Your price includes a dedicated translator to guide and translate your entire reading.', '1', 'active', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_why_choose` (`id`, `tour_id`, `icon`, `title`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('25', '170', '🚗', 'Comfortable Private Transportation', 'Travel safely and comfortably with private roundtrip vehicle transfers included.', '2', 'active', '2026-11-11 13:20:52', '2026-11-11 13:20:52');
INSERT INTO `tour_why_choose` (`id`, `tour_id`, `icon`, `title`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES ('26', '170', '⏰', 'Open Every Day from 10 AM to 6 PM', 'Daily appointments available with direct organizer WhatsApp and email assistance.', '3', 'active', '2026-11-11 13:20:52', '2026-11-11 13:20:52');

-- -----------------------------------------------------
-- Table structure for `tours`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tours`;
CREATE TABLE `tours` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `destination_id` bigint unsigned NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `short_description` text COLLATE utf8mb4_unicode_ci,
  `overview` longtext COLLATE utf8mb4_unicode_ci,
  `metadata` json DEFAULT NULL,
  `tour_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration_text` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration_hours` decimal(5,2) DEFAULT NULL,
  `duration_days` int unsigned DEFAULT '1',
  `languages` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `featured_image_id` bigint unsigned DEFAULT NULL,
  `base_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EUR',
  `min_persons` int unsigned NOT NULL DEFAULT '1',
  `max_persons` int unsigned DEFAULT NULL,
  `map_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `map_zoom` tinyint unsigned DEFAULT '13',
  `seo_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seo_description` text COLLATE utf8mb4_unicode_ci,
  `canonical_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `og_image_id` bigint unsigned DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `display_order` int NOT NULL DEFAULT '0',
  `status` enum('draft','published','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` bigint unsigned DEFAULT NULL,
  `available_seats` int unsigned DEFAULT '20',
  `total_seats` int unsigned DEFAULT '20',
  `booking_deadline_days` int unsigned DEFAULT '1',
  `travel_days` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'Daily',
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_tours_destination` (`destination_id`),
  KEY `idx_tours_slug` (`slug`),
  KEY `idx_tours_status` (`status`),
  KEY `idx_tours_featured` (`is_featured`),
  KEY `idx_tours_base_price` (`base_price`),
  KEY `idx_tours_display_order` (`display_order`),
  KEY `idx_tours_deleted_at` (`deleted_at`),
  KEY `fk_tours_featured_image` (`featured_image_id`),
  KEY `fk_tours_og_image` (`og_image_id`),
  KEY `idx_tours_deleted_by` (`deleted_by`),
  CONSTRAINT `fk_tours_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_tours_destination` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_tours_featured_image` FOREIGN KEY (`featured_image_id`) REFERENCES `media` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_tours_og_image` FOREIGN KEY (`og_image_id`) REFERENCES `media` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=171 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `tours`
INSERT INTO `tours` (`id`, `destination_id`, `title`, `slug`, `short_description`, `overview`, `metadata`, `tour_type`, `duration_text`, `duration_hours`, `duration_days`, `languages`, `featured_image_id`, `base_price`, `currency`, `min_persons`, `max_persons`, `map_title`, `latitude`, `longitude`, `map_zoom`, `seo_title`, `seo_description`, `canonical_url`, `og_image_id`, `is_featured`, `display_order`, `status`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`, `available_seats`, `total_seats`, `booking_deadline_days`, `travel_days`) VALUES ('138', '120', 'Goa Signature Luxury & Heritage Odyssey', 'goa-signature-luxury-experience', 'Experience private chauffeur-guided excursions, 5-star heritage villas, and gourmet dining across Goa.', 'A handpicked luxury expedition exploring the quintessential highlights and concealed gems of Goa.', NULL, 'Cultural & Heritage Tours', NULL, NULL, '5', 'English & Tamil', '300', '749.00', 'USD', '1', NULL, NULL, NULL, NULL, '13', NULL, NULL, NULL, NULL, '1', '1', 'published', '2026-09-26 11:43:02', '2026-11-12 10:27:47', NULL, NULL, '20', '20', '1', 'Daily');
INSERT INTO `tours` (`id`, `destination_id`, `title`, `slug`, `short_description`, `overview`, `metadata`, `tour_type`, `duration_text`, `duration_hours`, `duration_days`, `languages`, `featured_image_id`, `base_price`, `currency`, `min_persons`, `max_persons`, `map_title`, `latitude`, `longitude`, `map_zoom`, `seo_title`, `seo_description`, `canonical_url`, `og_image_id`, `is_featured`, `display_order`, `status`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`, `available_seats`, `total_seats`, `booking_deadline_days`, `travel_days`) VALUES ('139', '120', 'Goa Scenic Highlights & Family Explorer', 'goa-scenic-family-getaway', 'Delightful family-friendly journeys with cultural immersion and scenic countryside trails in Goa.', 'An effortless vacation tailored for families and small groups wanting scenic beauty and cultural encounters.', NULL, 'Family Tours', NULL, NULL, '4', NULL, '277', '499.00', 'USD', '1', NULL, NULL, NULL, NULL, '13', NULL, NULL, NULL, NULL, '1', '2', 'published', '2026-09-26 11:43:02', '2026-11-14 12:58:26', NULL, '1', '20', '20', '1', 'Daily');
INSERT INTO `tours` (`id`, `destination_id`, `title`, `slug`, `short_description`, `overview`, `metadata`, `tour_type`, `duration_text`, `duration_hours`, `duration_days`, `languages`, `featured_image_id`, `base_price`, `currency`, `min_persons`, `max_persons`, `map_title`, `latitude`, `longitude`, `map_zoom`, `seo_title`, `seo_description`, `canonical_url`, `og_image_id`, `is_featured`, `display_order`, `status`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`, `available_seats`, `total_seats`, `booking_deadline_days`, `travel_days`) VALUES ('140', '121', 'Karnataka Signature Luxury & Heritage Odyssey', 'karnataka-signature-luxury-experience', 'Experience private chauffeur-guided excursions, 5-star heritage villas, and gourmet dining across Karnataka.', 'A handpicked luxury expedition exploring the quintessential highlights and concealed gems of Karnataka.', NULL, 'Cultural & Heritage Tours', NULL, NULL, '5', NULL, '359', '749.00', 'USD', '1', NULL, NULL, NULL, NULL, '13', NULL, NULL, NULL, NULL, '1', '1', 'published', '2026-09-26 11:43:02', '2026-11-12 10:27:47', NULL, NULL, '20', '20', '1', 'Daily');
INSERT INTO `tours` (`id`, `destination_id`, `title`, `slug`, `short_description`, `overview`, `metadata`, `tour_type`, `duration_text`, `duration_hours`, `duration_days`, `languages`, `featured_image_id`, `base_price`, `currency`, `min_persons`, `max_persons`, `map_title`, `latitude`, `longitude`, `map_zoom`, `seo_title`, `seo_description`, `canonical_url`, `og_image_id`, `is_featured`, `display_order`, `status`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`, `available_seats`, `total_seats`, `booking_deadline_days`, `travel_days`) VALUES ('141', '121', 'Karnataka Scenic Highlights & Family Explorer', 'karnataka-scenic-family-getaway', 'Delightful family-friendly journeys with cultural immersion and scenic countryside trails in Karnataka.', 'An effortless vacation tailored for families and small groups wanting scenic beauty and cultural encounters.', NULL, 'Family Tours', NULL, NULL, '4', NULL, '342', '499.00', 'USD', '1', NULL, NULL, NULL, NULL, '13', NULL, NULL, NULL, NULL, '1', '2', 'published', '2026-09-26 11:43:02', '2026-11-14 12:58:26', NULL, '1', '20', '20', '1', 'Daily');
INSERT INTO `tours` (`id`, `destination_id`, `title`, `slug`, `short_description`, `overview`, `metadata`, `tour_type`, `duration_text`, `duration_hours`, `duration_days`, `languages`, `featured_image_id`, `base_price`, `currency`, `min_persons`, `max_persons`, `map_title`, `latitude`, `longitude`, `map_zoom`, `seo_title`, `seo_description`, `canonical_url`, `og_image_id`, `is_featured`, `display_order`, `status`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`, `available_seats`, `total_seats`, `booking_deadline_days`, `travel_days`) VALUES ('142', '122', 'Kerala Signature Luxury & Heritage Odyssey', 'kerala-signature-luxury-experience', 'Experience private chauffeur-guided excursions, 5-star heritage villas, and gourmet dining across Kerala.', 'A handpicked luxury expedition exploring the quintessential highlights and concealed gems of Kerala.', NULL, 'Cultural & Heritage Tours', NULL, NULL, '5', NULL, '381', '749.00', 'USD', '1', NULL, NULL, NULL, NULL, '13', NULL, NULL, NULL, NULL, '1', '1', 'published', '2026-09-26 11:43:02', '2026-11-14 12:58:26', NULL, '1', '20', '20', '1', 'Daily');
INSERT INTO `tours` (`id`, `destination_id`, `title`, `slug`, `short_description`, `overview`, `metadata`, `tour_type`, `duration_text`, `duration_hours`, `duration_days`, `languages`, `featured_image_id`, `base_price`, `currency`, `min_persons`, `max_persons`, `map_title`, `latitude`, `longitude`, `map_zoom`, `seo_title`, `seo_description`, `canonical_url`, `og_image_id`, `is_featured`, `display_order`, `status`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`, `available_seats`, `total_seats`, `booking_deadline_days`, `travel_days`) VALUES ('143', '122', 'Kerala Scenic Highlights & Family Explorer', 'kerala-scenic-family-getaway', 'Delightful family-friendly journeys with cultural immersion and scenic countryside trails in Kerala.', 'An effortless vacation tailored for families and small groups wanting scenic beauty and cultural encounters.', NULL, 'Family Tours', NULL, NULL, '4', NULL, '374', '499.00', 'USD', '1', NULL, NULL, NULL, NULL, '13', NULL, NULL, NULL, NULL, '1', '2', 'published', '2026-09-26 11:43:02', '2026-11-12 10:27:47', NULL, NULL, '20', '20', '1', 'Daily');
INSERT INTO `tours` (`id`, `destination_id`, `title`, `slug`, `short_description`, `overview`, `metadata`, `tour_type`, `duration_text`, `duration_hours`, `duration_days`, `languages`, `featured_image_id`, `base_price`, `currency`, `min_persons`, `max_persons`, `map_title`, `latitude`, `longitude`, `map_zoom`, `seo_title`, `seo_description`, `canonical_url`, `og_image_id`, `is_featured`, `display_order`, `status`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`, `available_seats`, `total_seats`, `booking_deadline_days`, `travel_days`) VALUES ('144', '123', 'Tamil Nadu Signature Luxury & Heritage Odyssey', 'tamil-nadu-signature-luxury-experience', 'Experience private chauffeur-guided excursions, 5-star heritage villas, and gourmet dining across Tamil Nadu.', 'A handpicked luxury expedition exploring the quintessential highlights and concealed gems of Tamil Nadu.', NULL, 'Cultural & Heritage Tours', NULL, NULL, '5', NULL, '437', '749.00', 'USD', '1', NULL, NULL, NULL, NULL, '13', NULL, NULL, NULL, NULL, '1', '1', 'published', '2026-09-26 11:43:02', '2026-11-14 12:58:26', NULL, '1', '20', '20', '1', 'Daily');
INSERT INTO `tours` (`id`, `destination_id`, `title`, `slug`, `short_description`, `overview`, `metadata`, `tour_type`, `duration_text`, `duration_hours`, `duration_days`, `languages`, `featured_image_id`, `base_price`, `currency`, `min_persons`, `max_persons`, `map_title`, `latitude`, `longitude`, `map_zoom`, `seo_title`, `seo_description`, `canonical_url`, `og_image_id`, `is_featured`, `display_order`, `status`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`, `available_seats`, `total_seats`, `booking_deadline_days`, `travel_days`) VALUES ('145', '123', 'Tamil Nadu Scenic Highlights & Family Explorer', 'tamil-nadu-scenic-family-getaway', 'Delightful family-friendly journeys with cultural immersion and scenic countryside trails in Tamil Nadu.', 'An effortless vacation tailored for families and small groups wanting scenic beauty and cultural encounters.', NULL, 'Family Tours', NULL, NULL, '4', NULL, '422', '499.00', 'USD', '1', NULL, NULL, NULL, NULL, '13', NULL, NULL, NULL, NULL, '1', '2', 'published', '2026-09-26 11:43:02', '2026-11-14 12:58:26', NULL, '1', '20', '20', '1', 'Daily');
INSERT INTO `tours` (`id`, `destination_id`, `title`, `slug`, `short_description`, `overview`, `metadata`, `tour_type`, `duration_text`, `duration_hours`, `duration_days`, `languages`, `featured_image_id`, `base_price`, `currency`, `min_persons`, `max_persons`, `map_title`, `latitude`, `longitude`, `map_zoom`, `seo_title`, `seo_description`, `canonical_url`, `og_image_id`, `is_featured`, `display_order`, `status`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`, `available_seats`, `total_seats`, `booking_deadline_days`, `travel_days`) VALUES ('150', '123', 'Mahabalipuram Day Tour', 'mahabalipuram-day-tour', 'Step back in time with our Mahabalipuram Day Tour, exploring one of Tamil Nadu\'s most iconic heritage destinations.', '<p>Step back in time with our <strong>Mahabalipuram Day Tour</strong>, exploring one of Tamil Nadu\'s most iconic heritage destinations. Also known as <strong>Mamallapuram</strong>, this ancient port town dates back to the <strong>7th–9th century Pallava dynasty</strong> and is renowned for its rock-cut monuments and UNESCO World Heritage Sites carved entirely from granite.</p><p>This tour offers a perfect blend of <strong>history, architecture, spirituality, and coastal beauty</strong>, making it ideal for culture lovers, history enthusiasts, and families.</p>', NULL, 'One Day Tours', '1 Day (8 Hours)', '10.00', '1', 'English, Tamil', '427', '45.00', 'EUR', '1', NULL, 'Mahabalipuram UNESCO Heritage Circuit', '12.61670000', '80.19280000', '14', NULL, NULL, NULL, NULL, '1', '1', 'published', '2026-09-26 12:01:05', '2026-11-12 10:27:46', NULL, NULL, '20', '20', '1', 'Daily');
INSERT INTO `tours` (`id`, `destination_id`, `title`, `slug`, `short_description`, `overview`, `metadata`, `tour_type`, `duration_text`, `duration_hours`, `duration_days`, `languages`, `featured_image_id`, `base_price`, `currency`, `min_persons`, `max_persons`, `map_title`, `latitude`, `longitude`, `map_zoom`, `seo_title`, `seo_description`, `canonical_url`, `og_image_id`, `is_featured`, `display_order`, `status`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`, `available_seats`, `total_seats`, `booking_deadline_days`, `travel_days`) VALUES ('151', '123', 'Kanchipuram Day Tour', 'kanchipuram-day-tour', 'Private day excursion covering the iconic landmarks and cultural gems of kanchipuram.', 'Enjoy a seamless private air-conditioned vehicle with expert chauffeur guide exploring top historical monuments and photo spots.', NULL, 'One Day Tours', '1 Day (9 Hours)', NULL, '1', NULL, '417', '49.00', 'USD', '1', NULL, NULL, NULL, NULL, '13', NULL, NULL, NULL, NULL, '1', '2', 'published', '2026-09-26 12:01:05', '2026-11-14 12:58:26', NULL, '1', '20', '20', '1', 'Daily');
INSERT INTO `tours` (`id`, `destination_id`, `title`, `slug`, `short_description`, `overview`, `metadata`, `tour_type`, `duration_text`, `duration_hours`, `duration_days`, `languages`, `featured_image_id`, `base_price`, `currency`, `min_persons`, `max_persons`, `map_title`, `latitude`, `longitude`, `map_zoom`, `seo_title`, `seo_description`, `canonical_url`, `og_image_id`, `is_featured`, `display_order`, `status`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`, `available_seats`, `total_seats`, `booking_deadline_days`, `travel_days`) VALUES ('152', '123', 'PONDICHERRY DAY TOUR', 'pondicherry-day-tour', 'Private day excursion covering the iconic landmarks and cultural gems of pondicherry.', 'Enjoy a seamless private air-conditioned vehicle with expert chauffeur guide exploring top historical monuments and photo spots.', NULL, 'One Day Tours', '1 Day (12 Hours)', NULL, '1', NULL, '432', '65.00', 'USD', '1', NULL, NULL, NULL, NULL, '13', NULL, NULL, NULL, NULL, '1', '3', 'published', '2026-09-26 12:01:05', '2026-11-12 10:27:46', NULL, NULL, '20', '20', '1', 'Daily');
INSERT INTO `tours` (`id`, `destination_id`, `title`, `slug`, `short_description`, `overview`, `metadata`, `tour_type`, `duration_text`, `duration_hours`, `duration_days`, `languages`, `featured_image_id`, `base_price`, `currency`, `min_persons`, `max_persons`, `map_title`, `latitude`, `longitude`, `map_zoom`, `seo_title`, `seo_description`, `canonical_url`, `og_image_id`, `is_featured`, `display_order`, `status`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`, `available_seats`, `total_seats`, `booking_deadline_days`, `travel_days`) VALUES ('153', '123', 'Chennai Day Tour', 'chennai-day-tour', 'Private day excursion covering the iconic landmarks and cultural gems of chennai.', 'Enjoy a seamless private air-conditioned vehicle with expert chauffeur guide exploring top historical monuments and photo spots.', NULL, 'One Day Tours', '1 Day (8 Hours)', NULL, '1', NULL, '412', '39.00', 'USD', '1', NULL, NULL, NULL, NULL, '13', NULL, NULL, NULL, NULL, '1', '4', 'published', '2026-09-26 12:01:06', '2026-11-14 12:58:26', NULL, '1', '20', '20', '1', 'Daily');
INSERT INTO `tours` (`id`, `destination_id`, `title`, `slug`, `short_description`, `overview`, `metadata`, `tour_type`, `duration_text`, `duration_hours`, `duration_days`, `languages`, `featured_image_id`, `base_price`, `currency`, `min_persons`, `max_persons`, `map_title`, `latitude`, `longitude`, `map_zoom`, `seo_title`, `seo_description`, `canonical_url`, `og_image_id`, `is_featured`, `display_order`, `status`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`, `available_seats`, `total_seats`, `booking_deadline_days`, `travel_days`) VALUES ('169', '123', 'SURFING (YOUR BEST DAY)', 'surfing-your-best-day', '\"Surfing is not a sport, it’s a lifestyle.\" We help you to make your dream of being a surfer a reality. Whether you know how to swim or not, we will guide you so that you can surf independently with no fear. Just like a pro surfer.', '<p class=\"lead\"><strong>\"Surfing is not a sport, it’s a lifestyle\"</strong></p>\n<p>When we say that surfing is a lifestyle, we mean it. We help you to make your dream of being a surfer a reality.</p>\n<p>Whether you know how to swim or not, we will guide you so that you can surf independently with no fear. Just like a pro surfer.</p>\n\n<div class=\"surfing-lessons-info\" style=\"margin: 20px 0; padding: 18px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px;\">\n  <h3 style=\"color: #166534; margin: 0 0 10px 0; font-size: 18px;\">🏄 Surfing Lessons Structure</h3>\n  <ul style=\"margin: 0; padding-left: 20px; color: #15803d; line-height: 1.8;\">\n    <li><strong>Theatrical lesson for a half hour:</strong> Essential equipment knowledge, safety instructions, rip-current awareness, and board control.</li>\n    <li><strong>Practical session for one hour:</strong> Dedicated in-water ocean coaching to catch and ride your waves safely.</li>\n  </ul>\n</div>\n\n<div class=\"curriculum-grid\" style=\"display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin: 20px 0;\">\n  <div style=\"background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.03);\">\n    <h4 style=\"color: #0f172a; margin: 0 0 10px 0; font-size: 16px;\">🌱 What do you learn? (For Beginners)</h4>\n    <ul style=\"margin: 0; padding-left: 20px; color: #475569; line-height: 1.8;\">\n      <li>Equipment and safety instructions</li>\n      <li>How to handle the board in the water</li>\n      <li>How to stand up on a board</li>\n      <li>Surf your first waves close to the beach</li>\n    </ul>\n  </div>\n\n  <div style=\"background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.03);\">\n    <h4 style=\"color: #0f172a; margin: 0 0 10px 0; font-size: 16px;\">🌊 What do you learn? (For Intermediators)</h4>\n    <ul style=\"margin: 0; padding-left: 20px; color: #475569; line-height: 1.8;\">\n      <li>Refresher on basics, equipment and safety</li>\n      <li>How to paddle out behind the breaking waves</li>\n      <li>How to take green waves on your own</li>\n    </ul>\n  </div>\n</div>\n\n<div style=\"display: flex; flex-wrap: wrap; gap: 16px; margin: 20px 0;\">\n  <div style=\"flex: 1; min-width: 240px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;\">\n    <h4 style=\"color: #0f172a; margin: 0 0 6px 0; font-size: 15px;\">🕒 Opening Times</h4>\n    <p style=\"margin: 0; color: #334155; font-weight: 600;\">Every Day from 8:00 AM to 6:00 PM</p>\n  </div>\n\n  <div style=\"flex: 1; min-width: 240px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px;\">\n    <h4 style=\"color: #1e40af; margin: 0 0 6px 0; font-size: 15px;\">📞 Direct Tour Organizer Contact</h4>\n    <p style=\"margin: 0 0 4px 0; color: #1e3a8a;\"><strong>E-Mail:</strong> <a href=\"mailto:welcome@yourbestdayinindia.com\" style=\"color: #2563eb; text-decoration: none;\">welcome@yourbestdayinindia.com</a></p>\n    <p style=\"margin: 0; color: #1e3a8a;\"><strong>Phone &amp; WhatsApp:</strong> <a href=\"https://wa.me/919840291110\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color: #2563eb; text-decoration: none; font-weight: 600;\">+91 9840291110</a></p>\n  </div>\n</div>', '{\"opening_times\": \"Every Day from 8:00 AM to 6:00 PM\", \"organizer_email\": \"welcome@yourbestdayinindia.com\", \"organizer_phone\": \"+91 9840291110\", \"experience_details\": [{\"title\": \"Theatrical lesson for a half hour\", \"description\": \"Equipment instructions, ocean currents, safety protocols, and board control basics.\"}, {\"title\": \"Practical session for one hour\", \"description\": \"Hands-on ocean wave catching with personal guidance from your instructor.\"}], \"organizer_whatsapp\": \"+91 9840291110\"}', 'Surfing Tours', '1.5 Hours Lesson (Daily 8 AM - 6 PM)', '1.50', '1', 'English, Tamil', '504', '5000.00', 'INR', '1', '12', 'Covelong Point Surf Village & Beach', '12.79180000', '80.25200000', '13', 'SURFING (YOUR BEST DAY) — Surfing Lessons in India', 'Learn to surf in South India with certified guides. 30-min theory + 1-hour ocean wave session. Transport, lessons & guide included.', NULL, NULL, '1', '1', 'published', '2026-11-05 15:41:53', '2026-11-12 10:27:47', NULL, NULL, '20', '20', '1', 'Daily (8:00 AM - 6:00 PM)');
INSERT INTO `tours` (`id`, `destination_id`, `title`, `slug`, `short_description`, `overview`, `metadata`, `tour_type`, `duration_text`, `duration_hours`, `duration_days`, `languages`, `featured_image_id`, `base_price`, `currency`, `min_persons`, `max_persons`, `map_title`, `latitude`, `longitude`, `map_zoom`, `seo_title`, `seo_description`, `canonical_url`, `og_image_id`, `is_featured`, `display_order`, `status`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`, `available_seats`, `total_seats`, `booking_deadline_days`, `travel_days`) VALUES ('170', '123', 'PALMLEAF HOROSCOPE (FIND YOUR DESTINY)', 'palmleaf-horoscope-find-your-destiny', 'Nadi, in the ancient language of Tamil, means “in search of”. Dictated 3,000 years ago by Maharishis on sacred Palm Leaves specifically for you. Complete 3-procedure reading with dedicated translator and private transport included.', '<p class=\"lead\"><strong>PALMLEAF HOROSCOPE (FIND YOUR DESTINY)</strong></p>\n<p><strong>Nadi</strong>, in the ancient language of Tamil, means <em>“in search of”</em>. Because an individual goes in search of the predictions made for them, to find purpose and direction, the entire system of the Maharishis’ insights and predictions eventually came to be called by this name, <strong>Nadi Astrology</strong>.</p>\n<p>Three thousand years ago, personal information about you was dictated by the Maharishis to their disciples and handwritten on special Palm Leaves, also called Nadis. These Palm Leaves were preserved for all this time, for you to access their contents when you need it most. Your Palm Leaf was written specifically for you, to provide you with guidance during the most important times of your life, by allowing you to prepare for future life changing events.</p>\n<p>If you are approaching this crossroad in your life, then your Palm Leaf begins to draw you upon the search for its contents.</p>\n\n<div class=\"procedures-container\" style=\"margin: 24px 0; padding: 20px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 14px;\">\n  <h3 style=\"color: #92400e; margin: 0 0 16px 0; font-size: 19px;\">📜 Procedures for Palm Leaf Reading</h3>\n\n  <div style=\"margin-bottom: 16px; padding: 14px; background: #ffffff; border-radius: 10px; border-left: 4px solid #d97706;\">\n    <h4 style=\"margin: 0 0 6px 0; color: #78350f; font-size: 16px;\">1. Searching for bundle(s)</h4>\n    <p style=\"margin: 0; color: #4b5563; line-height: 1.65;\">As soon as we get the appointment, we use your thumb impression, including in which country you were born in, the search will commence. Our expert readers in India will physically search for your Palm Leaf bundle(s), which might contain your individual Palm Leaf.</p>\n  </div>\n\n  <div style=\"margin-bottom: 16px; padding: 14px; background: #ffffff; border-radius: 10px; border-left: 4px solid #d97706;\">\n    <h4 style=\"margin: 0 0 6px 0; color: #78350f; font-size: 16px;\">2. Matching</h4>\n    <p style=\"margin: 0; color: #4b5563; line-height: 1.65;\">Preparation for the matching process by moderator; Once the reader has found your bundle(s) that might contain your Palm Leaf, the matching process and thus the search for your one personal Palm Leaf within the bundle(s) begins.</p>\n  </div>\n\n  <div style=\"padding: 14px; background: #ffffff; border-radius: 10px; border-left: 4px solid #d97706;\">\n    <h4 style=\"margin: 0 0 6px 0; color: #78350f; font-size: 16px;\">3. Reading</h4>\n    <p style=\"margin: 0; color: #4b5563; line-height: 1.65;\">The reading is the most important part of your experience. Based on your individual Palm Leaf, which was identified during the preceding matching process, this final part will let you know about your life.</p>\n  </div>\n</div>\n\n<div style=\"display: flex; flex-wrap: wrap; gap: 16px; margin: 20px 0;\">\n  <div style=\"flex: 1; min-width: 240px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;\">\n    <h4 style=\"color: #0f172a; margin: 0 0 6px 0; font-size: 15px;\">🕒 Opening Times</h4>\n    <p style=\"margin: 0; color: #334155; font-weight: 600;\">Every Day from 10:00 AM to 6:00 PM</p>\n  </div>\n\n  <div style=\"flex: 1; min-width: 240px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px;\">\n    <h4 style=\"color: #166534; margin: 0 0 6px 0; font-size: 15px;\">💰 Price &amp; Inclusions</h4>\n    <p style=\"margin: 0 0 4px 0; color: #15803d; font-weight: 700;\">7,000 INR per person</p>\n    <p style=\"margin: 0; color: #166534; font-size: 13.5px;\">Includes: 1. Translator | 2. Transportation</p>\n  </div>\n</div>\n\n<div style=\"background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin: 20px 0;\">\n  <h4 style=\"color: #1e40af; margin: 0 0 6px 0; font-size: 15px;\">📞 Contact Organizer</h4>\n  <p style=\"margin: 0 0 4px 0; color: #1e3a8a;\"><strong>E-Mail:</strong> <a href=\"mailto:welcome@yourbestdayinindia.com\" style=\"color: #2563eb; text-decoration: none;\">welcome@yourbestdayinindia.com</a></p>\n  <p style=\"margin: 0; color: #1e3a8a;\"><strong>Phone &amp; WhatsApp:</strong> <a href=\"https://wa.me/919840291110\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color: #2563eb; text-decoration: none; font-weight: 600;\">+91 9840291110</a></p>\n</div>', '{\"procedures\": {\"3. Reading\": \"The reading is the most important part of your experience. Based on your individual Palm Leaf, this final part lets you know about your life.\", \"2. Matching\": \"Preparation for the matching process by moderator; Once the reader has found your bundle(s), the matching process begins.\", \"1. Searching for bundle(s)\": \"As soon as we get the appointment, we use your thumb impression, including in which country you were born in, the search will commence.\"}, \"opening_times\": \"Every Day from 10:00 AM to 6:00 PM\", \"organizer_email\": \"welcome@yourbestdayinindia.com\", \"organizer_phone\": \"+91 9840291110\", \"organizer_whatsapp\": \"+91 9840291110\"}', 'Palmleaf Horoscope Tours', 'Daily from 10 AM to 6 PM', '4.00', '1', 'English, Tamil (Translator Included)', '501', '7000.00', 'INR', '1', '8', 'Nadi Astrology Palmleaf Center & Vaitheeswaran Kovil', '11.20140000', '79.72890000', '13', 'PALMLEAF HOROSCOPE (FIND YOUR DESTINY) — Nadi Astrology India', 'Discover your destiny through 3,000-year-old Maharishi Palm Leaves. 3-step reading with personal translator and AC transport included.', NULL, NULL, '1', '2', 'published', '2026-11-11 13:20:52', '2026-11-12 10:36:25', NULL, NULL, '20', '20', '1', 'Daily (10:00 AM - 6:00 PM)');

-- -----------------------------------------------------
-- Table structure for `user_roles`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles` (
  `user_id` bigint unsigned NOT NULL,
  `role_id` int unsigned NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `fk_ur_role` (`role_id`),
  CONSTRAINT `fk_ur_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ur_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `user_roles`
INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES ('1', '1');
INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES ('456', '1');
INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES ('457', '1');
INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES ('458', '1');
INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES ('459', '5');
INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES ('460', '5');

-- -----------------------------------------------------
-- Table structure for `users`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive','suspended') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_status` (`status`),
  KEY `idx_users_email` (`email`),
  KEY `idx_users_deleted_at` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=461 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `users`
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `phone`, `avatar_url`, `status`, `email_verified_at`, `last_login_at`, `created_at`, `updated_at`, `deleted_at`) VALUES ('1', 'Super Admin', 'admin@tramaxtours.com', '$2y$12$tGtxGLHwkL3UE7/J.MvLXOexLwvr86DV4wbp8rpzNGLKWUNnQsIxy', '+919840000000', NULL, 'active', '2026-09-24 16:24:47', '2026-10-01 12:58:52', '2026-09-24 16:24:47', '2026-10-01 12:58:52', NULL);
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `phone`, `avatar_url`, `status`, `email_verified_at`, `last_login_at`, `created_at`, `updated_at`, `deleted_at`) VALUES ('456', 'Super Admin', 'admin@wanderersouthindia.com', '$2y$12$xdHqvbOjQhgj84Qd3F.F/e9cTnYrfny2ccuLHjCRNqdZGL2Q8RVfG', NULL, NULL, 'active', NULL, '2026-10-29 15:56:45', '2026-10-29 15:22:47', '2026-10-29 15:56:45', NULL);
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `phone`, `avatar_url`, `status`, `email_verified_at`, `last_login_at`, `created_at`, `updated_at`, `deleted_at`) VALUES ('457', 'Super Admin', 'mkarthika3568@gmail.com', '$2y$12$xdHqvbOjQhgj84Qd3F.F/e9cTnYrfny2ccuLHjCRNqdZGL2Q8RVfG', NULL, NULL, 'active', NULL, '2026-10-29 15:56:47', '2026-10-29 15:22:47', '2026-10-29 15:56:47', NULL);
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `phone`, `avatar_url`, `status`, `email_verified_at`, `last_login_at`, `created_at`, `updated_at`, `deleted_at`) VALUES ('458', 'Super Admin', 'admin@example.com', '$2y$12$8ix/g4OAVWoZzO5R46X5L.8vs7/73mXMOUG26/ceiPk6pKqhSdptu', NULL, NULL, 'active', NULL, '2026-11-14 09:23:15', '2026-10-29 15:56:44', '2026-11-14 09:23:15', NULL);
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `phone`, `avatar_url`, `status`, `email_verified_at`, `last_login_at`, `created_at`, `updated_at`, `deleted_at`) VALUES ('459', 'John Customer', 'customer_test_1794589081@example.com', '$2y$12$3u/H7kUHoIr2Dzd.uQhMk.PJpVjLsWDCWBi3dBNgMn7dTWgwfQeIW', '+91 9876543210', NULL, 'active', NULL, NULL, '2026-11-13 22:28:02', '2026-11-13 22:28:02', NULL);
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `phone`, `avatar_url`, `status`, `email_verified_at`, `last_login_at`, `created_at`, `updated_at`, `deleted_at`) VALUES ('460', 'mkarthika', 'karthika2005@gmail.com', '$2y$12$K/Z0otVb9pwITN4hGgFLCekLMgEq0qvIVg2DqhqNsOCQ2XlFyrz.G', NULL, NULL, 'active', NULL, NULL, '2026-11-14 08:15:21', '2026-11-14 08:15:21', NULL);

SET FOREIGN_KEY_CHECKS = 1;
