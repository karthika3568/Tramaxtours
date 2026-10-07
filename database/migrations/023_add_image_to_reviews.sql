-- Migration: 023_add_image_to_reviews.sql
-- Description: Add image / client avatar column to reviews table for testimonials with fallback
SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE `reviews`
    ADD COLUMN `image` VARCHAR(500) NULL AFTER `content`;

SET FOREIGN_KEY_CHECKS = 1;
