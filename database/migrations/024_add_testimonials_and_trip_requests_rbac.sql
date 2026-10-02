-- Migration: 024_add_testimonials_and_trip_requests_rbac.sql
-- Description: New permission slugs for the Testimonials module and the Trip
-- Request ("Request My Trip") module, following the exact naming convention
-- already used by every other resource in database/seeds.sql. The original
-- seed's "Super Admin gets ALL permissions" / "Admin gets all except 3" rules
-- were one-time SELECTs run at initial seed time — they do NOT retroactively
-- apply to permission rows inserted later by a migration like this one, so
-- Super Admin (role 1) and Admin (role 2) are granted explicitly below,
-- re-running the same WHERE-exclusion logic seeds.sql uses for Admin.

INSERT INTO `permissions` (`name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES
('testimonials.view', 'Testimonials', 'View customer testimonials', NOW(), NOW()),
('testimonials.manage', 'Testimonials', 'Create, edit, delete, and publish customer testimonials', NOW(), NOW()),
('trip_requests.view', 'Trip Requests', 'View custom trip/quote requests and their details', NOW(), NOW()),
('trip_requests.manage', 'Trip Requests', 'Update trip request status, add notes, and manage documents', NOW(), NOW())
ON DUPLICATE KEY UPDATE `group_name` = VALUES(`group_name`), `description` = VALUES(`description`);

-- Super Admin: all permissions (matches seeds.sql section 3's rule).
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 1, `id` FROM `permissions`
WHERE `name` IN ('testimonials.view', 'testimonials.manage', 'trip_requests.view', 'trip_requests.manage');

-- Admin: all permissions except users.delete/roles.manage/settings.manage (matches seeds.sql section 4's rule).
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 2, `id` FROM `permissions`
WHERE `name` IN ('testimonials.view', 'testimonials.manage', 'trip_requests.view', 'trip_requests.manage');

-- Moderator: same explicit grant pattern it already has for the analogous
-- reviews.*/contact.* resources.
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 4, `id` FROM `permissions`
WHERE `name` IN ('testimonials.view', 'testimonials.manage', 'trip_requests.view', 'trip_requests.manage');
