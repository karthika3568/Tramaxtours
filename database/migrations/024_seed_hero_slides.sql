-- Migration: 024_seed_hero_slides.sql
-- Description: Seed initial South India hero slides and media assets into MySQL database
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Ensure Carousel Media exist in media table
INSERT INTO `media` (`id`, `filename`, `original_name`, `file_path`, `mime_type`, `file_size`, `alt_text`, `caption`, `created_at`, `updated_at`)
VALUES
(101, 'demo_carousel_tamilnadu.jpg', 'demo_carousel_tamilnadu.jpg', 'uploads/media/demo_carousel_tamilnadu.jpg', 'image/jpeg', 160437, 'Wanderer South India Tamil Nadu', 'Tamil Nadu Temples & Heritage', NOW(), NOW()),
(102, 'demo_carousel_kerala.jpg', 'demo_carousel_kerala.jpg', 'uploads/media/demo_carousel_kerala.jpg', 'image/jpeg', 84784, 'Kerala Emerald Backwaters', 'Kerala Emerald Backwaters', NOW(), NOW()),
(103, 'demo_carousel_karnataka.jpg', 'demo_carousel_karnataka.jpg', 'uploads/media/demo_carousel_karnataka.jpg', 'image/jpeg', 281788, 'Karnataka Royal Dynasties', 'Karnataka Royal Dynasties', NOW(), NOW()),
(104, 'demo_carousel_goa.jpg', 'demo_carousel_goa.jpg', 'uploads/media/demo_carousel_goa.jpg', 'image/jpeg', 419713, 'Goa Golden Shores & Sunshine', 'Goa Golden Shores', NOW(), NOW()),
(105, 'demo_carousel_pondicherry.jpg', 'demo_carousel_pondicherry.jpg', 'uploads/media/demo_carousel_pondicherry.jpg', 'image/jpeg', 193518, 'Pondicherry French Riviera of the East', 'Pondicherry French Riviera', NOW(), NOW())
ON DUPLICATE KEY UPDATE `file_path` = VALUES(`file_path`), `alt_text` = VALUES(`alt_text`);

-- 2. Seed Hero Slides
INSERT INTO `home_hero_slides` (`id`, `title`, `subtitle`, `desktop_media_id`, `mobile_media_id`, `cta_label`, `cta_url`, `display_order`, `status`, `created_at`, `updated_at`)
VALUES
(1, 'Wanderer South India', 'Plan your memorable journey across majestic temples, pristine beaches & heritage', 101, 101, 'Plan My Trip', '/destinations/tamil-nadu', 1, 'active', NOW(), NOW()),
(2, 'Kerala Emerald Backwaters', 'Cruise through peaceful lagoons, lush spice plantations & Ayurvedic wellness', 102, 102, 'Plan My Trip', '/destinations/kerala', 2, 'active', NOW(), NOW()),
(3, 'Karnataka Royal Dynasties', 'Explore the grand palaces of Mysore and ancient ruins of UNESCO Hampi', 103, 103, 'Plan My Trip', '/destinations/karnataka', 3, 'active', NOW(), NOW()),
(4, 'Goa Golden Shores & Sunshine', 'Sun-drenched coastal beauty, Portuguese heritage & vibrant beach getaways', 104, 104, 'Plan My Trip', '/destinations/goa', 4, 'active', NOW(), NOW()),
(5, 'Pondicherry French Riviera of the East', 'Colonial boulevards, vibrant cafes, spiritual tranquility & beachside promenades', 105, 105, 'Plan My Trip', '/destinations/pondicherry', 5, 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `desktop_media_id` = VALUES(`desktop_media_id`), `status` = VALUES(`status`);

SET FOREIGN_KEY_CHECKS = 1;
