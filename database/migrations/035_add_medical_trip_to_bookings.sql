-- Migration 035: Add Medical Trip columns and relax tour_id constraint in bookings
-- Allows medical tour bookings to be saved and managed seamlessly alongside tour bookings.

ALTER TABLE `bookings` MODIFY COLUMN `tour_id` BIGINT UNSIGNED NULL DEFAULT NULL;

ALTER TABLE `bookings`
    ADD COLUMN `medical_trip_id` INT UNSIGNED NULL DEFAULT NULL AFTER `tour_id`,
    ADD COLUMN `is_medical_booking` TINYINT(1) DEFAULT 0 AFTER `medical_trip_id`;

ALTER TABLE `bookings` ADD INDEX `idx_bookings_medical_trip` (`medical_trip_id`);

ALTER TABLE `bookings` ADD CONSTRAINT `fk_bookings_medical_trip` FOREIGN KEY (`medical_trip_id`) REFERENCES `medical_trips` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
