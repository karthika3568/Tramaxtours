-- Migration: 026_ensure_rating_on_reviews.sql
-- Description: Ensure rating TINYINT column exists on reviews table with default 5
SET FOREIGN_KEY_CHECKS = 0;

SET @dbname = DATABASE();
SET @tablename = 'reviews';
SET @colname = 'rating';

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @colname
  ) > 0,
  'ALTER TABLE `reviews` MODIFY COLUMN `rating` TINYINT UNSIGNED NOT NULL DEFAULT 5',
  'ALTER TABLE `reviews` ADD COLUMN `rating` TINYINT UNSIGNED NOT NULL DEFAULT 5 AFTER `customer_country`'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Also update any null or 0 rating values to default 5
UPDATE `reviews` SET `rating` = 5 WHERE `rating` IS NULL OR `rating` = 0;

SET FOREIGN_KEY_CHECKS = 1;
