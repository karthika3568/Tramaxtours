-- Migration: 022_create_tour_availability_dates_table.sql
-- Description: Date-specific seat capacity per tour (e.g. Wed=20 seats, Thu=15 seats),
-- with per-date open/close control and a booking cutoff. A tour with no rows in this
-- table keeps its existing global available_seats/total_seats behaviour unchanged —
-- this is purely additive so existing tours/bookings are unaffected until an admin
-- opts a tour into date-based availability by adding dates.
CREATE TABLE IF NOT EXISTS `tour_availability_dates` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `tour_id` BIGINT UNSIGNED NOT NULL,
    `travel_date` DATE NOT NULL,
    `total_seats` INT UNSIGNED NOT NULL DEFAULT 20,
    `booked_seats` INT UNSIGNED NOT NULL DEFAULT 0,
    `is_closed` TINYINT(1) NOT NULL DEFAULT 0,
    `booking_cutoff_hours` INT UNSIGNED NOT NULL DEFAULT 24,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uniq_tour_availability_date` (`tour_id`, `travel_date`),
    INDEX `idx_tour_availability_tour` (`tour_id`),
    INDEX `idx_tour_availability_date` (`travel_date`),
    CONSTRAINT `fk_tour_availability_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
