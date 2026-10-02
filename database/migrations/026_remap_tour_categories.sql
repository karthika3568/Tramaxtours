-- Migration: 026_remap_tour_categories.sql
-- Description: Replace the original 8 demo tour categories with exactly the
-- 6 categories the business now operates: Cultural Tour, Pilgrimage,
-- Beach Holiday, Adventure Tour, Wildlife Tour, Shopping Tour.
-- Every existing tour is remapped to at least one of the new categories
-- BEFORE the old categories are removed, so `tour_category_map` rows are
-- re-pointed, never orphaned (tour_category_map.category_id is
-- ON DELETE CASCADE, which is exactly why old mappings must be replaced
-- first). Wildlife Tour and Shopping Tour intentionally start with 0 tours
-- — they just need to exist and be admin-manageable per spec.

-- 1. Create the 6 required categories (idempotent on slug).
INSERT INTO `tour_categories` (`name`, `slug`, `badge_color`, `icon`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES
('Cultural Tour', 'cultural-tour', '#b45309', 'landmark', 'Immerse in ancient architecture, monuments, and UNESCO world heritage sites', 1, 'active', NOW(), NOW()),
('Pilgrimage', 'pilgrimage', '#7c3aed', 'temple', 'Visit sacred temples, churches, and historic places of worship', 2, 'active', NOW(), NOW()),
('Beach Holiday', 'beach-holiday', '#0284c7', 'waves', 'Relax on sun-soaked coastlines and scenic beach destinations', 3, 'active', NOW(), NOW()),
('Adventure Tour', 'adventure-tour', '#16a34a', 'tree', 'Experience natural landscapes, hill stations, backwaters, and plantations', 4, 'active', NOW(), NOW()),
('Wildlife Tour', 'wildlife-tour', '#ea580c', 'paw', 'Explore national parks, sanctuaries, and natural wildlife habitats', 5, 'active', NOW(), NOW()),
('Shopping Tour', 'shopping-tour', '#db2777', 'shopping-bag', 'Discover local markets, handicrafts, and curated shopping experiences', 6, 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE `badge_color` = VALUES(`badge_color`), `description` = VALUES(`description`);

-- 2. Remap every existing tour to its new category/categories before the
-- old categories are deleted. INSERT IGNORE skips duplicates safely
-- (composite PRIMARY KEY (tour_id, category_id) on tour_category_map).
INSERT IGNORE INTO `tour_category_map` (`tour_id`, `category_id`)
SELECT t.id, c.id FROM `tours` t, `tour_categories` c
WHERE c.slug = 'cultural-tour' AND t.slug IN (
    'mahabalipuram-day-tour', 'kanchipuram-temple-tour', 'madurai-heritage-walk',
    'fort-kochi-heritage-walk', 'hampi-ruins-tour', 'mysore-palace-city-tour',
    'old-goa-churches-tour'
);

INSERT IGNORE INTO `tour_category_map` (`tour_id`, `category_id`)
SELECT t.id, c.id FROM `tours` t, `tour_categories` c
WHERE c.slug = 'pilgrimage' AND t.slug IN (
    'kanchipuram-temple-tour', 'madurai-heritage-walk', 'old-goa-churches-tour'
);

INSERT IGNORE INTO `tour_category_map` (`tour_id`, `category_id`)
SELECT t.id, c.id FROM `tours` t, `tour_categories` c
WHERE c.slug = 'adventure-tour' AND t.slug IN (
    'munnar-tea-hills-tour', 'alleppey-backwater-cruise', 'coorg-coffee-estate-tour',
    'spice-plantation-river-cruise'
);

INSERT IGNORE INTO `tour_category_map` (`tour_id`, `category_id`)
SELECT t.id, c.id FROM `tours` t, `tour_categories` c
WHERE c.slug = 'beach-holiday' AND t.slug IN (
    'north-goa-beaches-tour'
);

-- 3. Remove the 8 original demo categories. ON DELETE CASCADE on
-- tour_category_map.category_id automatically drops only the stale
-- mappings to these old rows — every tour already has a new mapping
-- from step 2, so nothing is orphaned.
DELETE FROM `tour_categories` WHERE `slug` IN (
    'city-sightseeing-tours', 'cultural-heritage-tours', 'guided-tours',
    'historical-tours', 'one-day-tours', 'private-tours', 'family-tours',
    'adventure-nature-tours'
);
