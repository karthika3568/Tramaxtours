-- Migration: 023_rebrand_wanderer_south_india.sql
-- Description: Rebrand "Tramax Tours" -> "Wanderer South India" across all
-- customer/admin-facing content stored in the database. Does NOT touch the
-- admin login credential email (admin@tramaxtours.com) — that is an account
-- identifier, not public branding, and changing it is out of scope here.
-- Social link URLs point at a placeholder "wanderersouthindia" handle; an
-- admin should update these via Admin > Social Links once real accounts exist.

-- Site settings (site_name/footer/SEO/contact already updated directly during
-- development; this REPLACE sweep makes the migration idempotent/safe to
-- re-run and catches any value containing the old name).
UPDATE `site_settings`
SET `setting_value` = REPLACE(`setting_value`, 'Tramax Tours', 'Wanderer South India')
WHERE `setting_value` LIKE '%Tramax Tours%';

UPDATE `site_settings`
SET `setting_value` = REPLACE(`setting_value`, 'tramaxtours.in', 'wanderersouthindia.com')
WHERE `setting_value` LIKE '%tramaxtours.in%';

UPDATE `site_settings`
SET `setting_value` = REPLACE(`setting_value`, 'tramaxtours.com', 'wanderersouthindia.com')
WHERE `setting_value` LIKE '%tramaxtours.com%';

-- CMS pages (about-us, terms-conditions, refund-policy, privacy-policy)
UPDATE `pages`
SET `title` = REPLACE(`title`, 'Tramax Tours', 'Wanderer South India'),
    `subtitle` = REPLACE(`subtitle`, 'Tramax Tours', 'Wanderer South India'),
    `content` = REPLACE(`content`, 'Tramax Tours', 'Wanderer South India'),
    `seo_title` = REPLACE(`seo_title`, 'Tramax Tours', 'Wanderer South India'),
    `seo_description` = REPLACE(`seo_description`, 'Tramax Tours', 'Wanderer South India')
WHERE `title` LIKE '%Tramax Tours%'
   OR `subtitle` LIKE '%Tramax Tours%'
   OR `content` LIKE '%Tramax Tours%'
   OR `seo_title` LIKE '%Tramax Tours%'
   OR `seo_description` LIKE '%Tramax Tours%';

-- Social link placeholder handles
UPDATE `social_links`
SET `url` = REPLACE(`url`, 'tramaxtours', 'wanderersouthindia')
WHERE `url` LIKE '%tramaxtours%';

-- CMS homepage sections / benefits / destination copy, if any reference the old name
UPDATE `cms_sections`
SET `title` = REPLACE(`title`, 'Tramax Tours', 'Wanderer South India'),
    `subtitle` = REPLACE(`subtitle`, 'Tramax Tours', 'Wanderer South India'),
    `content` = REPLACE(`content`, 'Tramax Tours', 'Wanderer South India')
WHERE `title` LIKE '%Tramax Tours%' OR `subtitle` LIKE '%Tramax Tours%' OR `content` LIKE '%Tramax Tours%';

UPDATE `home_hero_slides`
SET `title` = REPLACE(`title`, 'Tramax Tours', 'Wanderer South India'),
    `subtitle` = REPLACE(`subtitle`, 'Tramax Tours', 'Wanderer South India')
WHERE `title` LIKE '%Tramax Tours%' OR `subtitle` LIKE '%Tramax Tours%';

UPDATE `destinations`
SET `hero_title` = REPLACE(`hero_title`, 'Tramax Tours', 'Wanderer South India'),
    `hero_subtitle` = REPLACE(`hero_subtitle`, 'Tramax Tours', 'Wanderer South India'),
    `short_description` = REPLACE(`short_description`, 'Tramax Tours', 'Wanderer South India'),
    `seo_title` = REPLACE(`seo_title`, 'Tramax Tours', 'Wanderer South India'),
    `seo_description` = REPLACE(`seo_description`, 'Tramax Tours', 'Wanderer South India')
WHERE `hero_title` LIKE '%Tramax Tours%' OR `hero_subtitle` LIKE '%Tramax Tours%'
   OR `short_description` LIKE '%Tramax Tours%' OR `seo_title` LIKE '%Tramax Tours%'
   OR `seo_description` LIKE '%Tramax Tours%';

UPDATE `tours`
SET `short_description` = REPLACE(`short_description`, 'Tramax Tours', 'Wanderer South India'),
    `overview` = REPLACE(`overview`, 'Tramax Tours', 'Wanderer South India'),
    `seo_title` = REPLACE(`seo_title`, 'Tramax Tours', 'Wanderer South India'),
    `seo_description` = REPLACE(`seo_description`, 'Tramax Tours', 'Wanderer South India')
WHERE `short_description` LIKE '%Tramax Tours%' OR `overview` LIKE '%Tramax Tours%'
   OR `seo_title` LIKE '%Tramax Tours%' OR `seo_description` LIKE '%Tramax Tours%';
