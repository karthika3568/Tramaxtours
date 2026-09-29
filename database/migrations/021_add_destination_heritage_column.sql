-- Migration: 021_add_destination_heritage_column.sql
-- Description: Add a distinct "Heritage" quick-fact field to destinations,
-- separate from the existing "Religion" field (previously conflated on the
-- public destination page).
ALTER TABLE `destinations`
    ADD COLUMN `heritage` VARCHAR(150) NULL AFTER `religion`;
