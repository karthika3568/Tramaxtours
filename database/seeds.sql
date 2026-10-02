-- ==============================================================================
-- Wanderer South India - Production Development Seed Data
-- Target Database: tramaxtours
-- Phase: Phase 1 Database Architecture
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. SEED ROLES
-- ------------------------------------------------------------------------------
INSERT INTO `roles` (`id`, `name`, `slug`, `description`, `is_system`, `created_at`, `updated_at`) VALUES
(1, 'Super Admin', 'super_admin', 'Full system access and authority over all resources, users, and settings', 1, NOW(), NOW()),
(2, 'Admin', 'admin', 'Administrative management of tours, destinations, bookings, and content', 1, NOW(), NOW()),
(3, 'Editor', 'editor', 'Content editor with permissions to manage tours, destinations, media, and pages', 1, NOW(), NOW()),
(4, 'Moderator', 'moderator', 'Moderator for customer reviews, comments, and inquiries', 1, NOW(), NOW()),
(5, 'Customer', 'customer', 'Registered public customer for viewing personal bookings and review history', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `description` = VALUES(`description`);

-- ------------------------------------------------------------------------------
-- 2. SEED GRANULAR PERMISSIONS
-- ------------------------------------------------------------------------------
INSERT INTO `permissions` (`name`, `group_name`, `description`, `created_at`, `updated_at`) VALUES
-- Dashboard
('dashboard.view', 'Dashboard', 'View admin dashboard statistics and metrics', NOW(), NOW()),
-- Users
('users.view', 'Users', 'View system users list and details', NOW(), NOW()),
('users.create', 'Users', 'Create new administrative and staff accounts', NOW(), NOW()),
('users.edit', 'Users', 'Update user profiles and details', NOW(), NOW()),
('users.delete', 'Users', 'Delete or disable user accounts', NOW(), NOW()),
-- Roles & Permissions
('roles.view', 'Roles & Permissions', 'View roles and their assigned permissions', NOW(), NOW()),
('roles.manage', 'Roles & Permissions', 'Create, update, and assign roles and permissions', NOW(), NOW()),
-- Destinations
('destinations.view', 'Destinations', 'View destinations list and details', NOW(), NOW()),
('destinations.create', 'Destinations', 'Create new destinations', NOW(), NOW()),
('destinations.edit', 'Destinations', 'Edit destination information and sections', NOW(), NOW()),
('destinations.delete', 'Destinations', 'Delete or archive destinations', NOW(), NOW()),
('destinations.publish', 'Destinations', 'Publish or unpublish destinations', NOW(), NOW()),
-- Tours
('tours.view', 'Tours', 'View tours list and details', NOW(), NOW()),
('tours.create', 'Tours', 'Create new tours and packages', NOW(), NOW()),
('tours.edit', 'Tours', 'Edit tour details, itineraries, pricing, and highlights', NOW(), NOW()),
('tours.delete', 'Tours', 'Delete or archive tours', NOW(), NOW()),
('tours.publish', 'Tours', 'Publish or unpublish tours', NOW(), NOW()),
-- Tour Categories
('categories.manage', 'Tour Categories', 'Create, edit, reorder, and delete tour categories', NOW(), NOW()),
-- Bookings
('bookings.view', 'Bookings', 'View all customer bookings and details', NOW(), NOW()),
('bookings.edit_status', 'Bookings', 'Update booking statuses and notes', NOW(), NOW()),
('bookings.delete', 'Bookings', 'Cancel or delete bookings', NOW(), NOW()),
('bookings.export', 'Bookings', 'Export bookings reports and lists', NOW(), NOW()),
-- Reviews
('reviews.view', 'Reviews', 'View all customer reviews and ratings', NOW(), NOW()),
('reviews.moderate', 'Reviews', 'Approve, reject, feature, or delete reviews', NOW(), NOW()),
-- FAQs
('faqs.manage', 'FAQs', 'Manage tour and destination FAQs', NOW(), NOW()),
-- Media
('media.view', 'Media', 'Browse media library', NOW(), NOW()),
('media.upload', 'Media', 'Upload files to media library', NOW(), NOW()),
('media.delete', 'Media', 'Delete unused media files', NOW(), NOW()),
-- Homepage & CMS
('homepage.manage', 'Homepage', 'Manage hero carousel, benefits, and home sections', NOW(), NOW()),
('pages.manage', 'Pages', 'Manage dynamic and static content pages', NOW(), NOW()),
('policies.manage', 'Policies', 'Manage Terms, Refund, and Privacy policy content', NOW(), NOW()),
-- Contact & Inquiries
('contact.view', 'Contact Messages', 'View customer contact submissions and inquiries', NOW(), NOW()),
('contact.manage', 'Contact Messages', 'Update contact message statuses and reply notes', NOW(), NOW()),
-- Footer & Social
('footer.manage', 'Footer', 'Manage footer links and column organization', NOW(), NOW()),
('social.manage', 'Social Links', 'Manage social media channels and URLs', NOW(), NOW()),
-- Site Settings
('settings.view', 'Site Settings', 'View site configuration and general settings', NOW(), NOW()),
('settings.manage', 'Site Settings', 'Update site settings, branding, and contact details', NOW(), NOW()),
-- Audit Logs
('audit_logs.view', 'Audit Logs', 'View administrative action audit trails and security logs', NOW(), NOW()),
-- Testimonials
('testimonials.view', 'Testimonials', 'View customer testimonials', NOW(), NOW()),
('testimonials.manage', 'Testimonials', 'Create, edit, delete, and publish customer testimonials', NOW(), NOW()),
-- Trip Requests
('trip_requests.view', 'Trip Requests', 'View custom trip/quote requests and their details', NOW(), NOW()),
('trip_requests.manage', 'Trip Requests', 'Update trip request status, add notes, and manage documents', NOW(), NOW())
ON DUPLICATE KEY UPDATE `group_name` = VALUES(`group_name`), `description` = VALUES(`description`);

-- ------------------------------------------------------------------------------
-- 3. ASSIGN PERMISSIONS TO SUPER ADMIN (ALL PERMISSIONS)
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 1, `id` FROM `permissions`;

-- ------------------------------------------------------------------------------
-- 4. ASSIGN PERMISSIONS TO ADMIN (OPERATIONAL PERMISSIONS)
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 2, `id` FROM `permissions`
WHERE `name` NOT IN ('users.delete', 'roles.manage', 'settings.manage');

-- ------------------------------------------------------------------------------
-- 5. ASSIGN PERMISSIONS TO EDITOR
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 3, `id` FROM `permissions`
WHERE `name` IN (
    'dashboard.view', 'destinations.view', 'destinations.create', 'destinations.edit',
    'tours.view', 'tours.create', 'tours.edit', 'categories.manage',
    'faqs.manage', 'media.view', 'media.upload', 'homepage.manage',
    'pages.manage', 'policies.manage', 'footer.manage', 'social.manage'
);

-- ------------------------------------------------------------------------------
-- 6. ASSIGN PERMISSIONS TO MODERATOR
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 4, `id` FROM `permissions`
WHERE `name` IN (
    'dashboard.view', 'reviews.view', 'reviews.moderate', 'contact.view', 'contact.manage',
    'testimonials.view', 'testimonials.manage', 'trip_requests.view', 'trip_requests.manage'
);

-- ------------------------------------------------------------------------------
-- 7. SEED INITIAL SUPER ADMIN USER
-- Default email: admin@wanderersouthindia.com
-- Default password: Admin@Tramax2026! (Bcrypt hashed)
-- ------------------------------------------------------------------------------
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `phone`, `status`, `email_verified_at`, `created_at`, `updated_at`)
VALUES (
    1,
    'Super Admin',
    'admin@wanderersouthindia.com',
    '$2y$12$3krWVQGArtFozBH1wu5O4uHVBKAUcyBtIJeCvXjjsPq61DG3D2I/i',
    '+919840000000',
    'active',
    NOW(),
    NOW(),
    NOW()
)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `status` = VALUES(`status`);

-- Assign Super Admin role to user 1
INSERT IGNORE INTO `user_roles` (`user_id`, `role_id`) VALUES (1, 1);

-- ------------------------------------------------------------------------------
-- 8. SEED DEFAULT TOUR CATEGORIES
-- ------------------------------------------------------------------------------
INSERT INTO `tour_categories` (`name`, `slug`, `badge_color`, `icon`, `description`, `display_order`, `status`, `created_at`, `updated_at`) VALUES
('Cultural Tour', 'cultural-tour', '#b45309', 'landmark', 'Immerse in ancient architecture, monuments, and UNESCO world heritage sites', 1, 'active', NOW(), NOW()),
('Pilgrimage', 'pilgrimage', '#7c3aed', 'temple', 'Visit sacred temples, churches, and historic places of worship', 2, 'active', NOW(), NOW()),
('Beach Holiday', 'beach-holiday', '#0284c7', 'waves', 'Relax on sun-soaked coastlines and scenic beach destinations', 3, 'active', NOW(), NOW()),
('Adventure Tour', 'adventure-tour', '#16a34a', 'tree', 'Experience natural landscapes, hill stations, backwaters, and plantations', 4, 'active', NOW(), NOW()),
('Wildlife Tour', 'wildlife-tour', '#ea580c', 'paw', 'Explore national parks, sanctuaries, and natural wildlife habitats', 5, 'active', NOW(), NOW()),
('Shopping Tour', 'shopping-tour', '#db2777', 'shopping-bag', 'Discover local markets, handicrafts, and curated shopping experiences', 6, 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE `badge_color` = VALUES(`badge_color`), `description` = VALUES(`description`);

-- ------------------------------------------------------------------------------
-- 9. SEED ESSENTIAL SITE SETTINGS
-- ------------------------------------------------------------------------------
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`, `created_at`, `updated_at`) VALUES
('site_name', 'Wanderer South India', 'general', NOW(), NOW()),
('site_tagline', 'Travel Made Simple & Memorable', 'general', NOW(), NOW()),
('site_logo', '/uploads/branding/logo.png', 'general', NOW(), NOW()),
('site_favicon', '/favicon.svg', 'general', NOW(), NOW()),
('default_currency', 'EUR', 'general', NOW(), NOW()),
('currency_symbol', '€', 'general', NOW(), NOW()),
('timezone', 'Asia/Kolkata', 'general', NOW(), NOW()),
('contact_person', 'P. Kishore', 'contact', NOW(), NOW()),
('contact_email', 'contact@wanderersouthindia.com', 'contact', NOW(), NOW()),
('contact_phone', '+91 80725 66010', 'contact', NOW(), NOW()),
('contact_whatsapp', '+91 80725 66010', 'contact', NOW(), NOW()),
('contact_address', 'Chennai, Tamil Nadu, India', 'contact', NOW(), NOW()),
('contact_business_hours', 'Monday - Sunday: 08:00 AM - 09:00 PM IST', 'contact', NOW(), NOW()),
('footer_about', 'Wanderer South India specializes in foreign-client tourism, private sightseeing, cultural heritage expeditions, and custom travel across South India.', 'footer', NOW(), NOW()),
('footer_copyright', '© 2026 Wanderer South India. All rights reserved.', 'footer', NOW(), NOW()),
('seo_default_title', 'Wanderer South India | Premier South India Tours & Travel Experiences', 'seo', NOW(), NOW()),
('seo_default_description', 'Discover premium South India tours, private sightseeing, cultural heritage packages, and hassle-free travel across Tamil Nadu, Kerala, Karnataka, and Goa with Wanderer South India.', 'seo', NOW(), NOW()),
('default_payment_method', 'pay_on_arrival', 'payment', NOW(), NOW())
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

-- ------------------------------------------------------------------------------
-- 10. SEED DEFAULT POLICY & INFORMATION PAGES
-- ------------------------------------------------------------------------------
INSERT INTO `pages` (`slug`, `title`, `subtitle`, `content`, `seo_title`, `seo_description`, `status`, `created_at`, `updated_at`) VALUES
('about-us', 'About Wanderer South India', 'Your Trusted Travel Partner for Authentic South Indian Experiences', '<h2>Welcome to Wanderer South India</h2><p>Wanderer South India is dedicated to providing high-quality, reliable, and personalized travel experiences across South India for international and discerning travelers. With years of local expertise, private luxury vehicle fleets, and expert guides, we turn vacations into unforgettable journeys.</p><h3>Our Mission</h3><p>To deliver authentic, safe, comfortable, and seamless travel memories with transparent pricing and exceptional hospitality.</p>', 'About Us | Wanderer South India', 'Learn about Wanderer South India, our commitment to hospitality, private travel expertise, and memorable South Indian experiences.', 'published', NOW(), NOW()),
('terms-conditions', 'Terms & Conditions', 'Please read our terms and booking conditions carefully', '<h2>Terms & Conditions</h2><p>By using the Wanderer South India platform or booking any tour or travel package with us, you agree to comply with and be bound by the following terms and conditions.</p><h3>1. Booking & Payment</h3><p>Bookings are subject to availability. For Pay on Arrival bookings, payment in full is required at the commencement of the tour in the agreed currency.</p><h3>2. Tour Conduct & Safety</h3><p>Passengers must follow local safety guidelines and adhere to scheduled departure times for seamless service.</p>', 'Terms & Conditions | Wanderer South India', 'Read the official booking terms, passenger guidelines, and service conditions of Wanderer South India.', 'published', NOW(), NOW()),
('refund-policy', 'Refund & Cancellation Policy', 'Clear and transparent policies for our travelers', '<h2>Refund & Cancellation Policy</h2><p>We understand that travel plans may change. Our cancellation and refund policy is outlined below:</p><h3>1. Cancellations</h3><p>Cancellations made at least 24 hours prior to scheduled tour departure will incur no penalty. Cancellations made within 24 hours of departure may be subject to a nominal administrative charge.</p><h3>2. Refunds</h3><p>Where applicable, refunds are processed within 5-7 business days through the original channel of payment.</p>', 'Refund & Cancellation Policy | Wanderer South India', 'Understand the refund and cancellation terms for tours booked with Wanderer South India.', 'published', NOW(), NOW()),
('privacy-policy', 'Privacy Policy', 'How we protect and respect your personal information', '<h2>Privacy Policy</h2><p>Wanderer South India respects your privacy and is committed to protecting your personal data. This privacy statement explains how we collect, handle, and safeguard your details when booking tours or contacting us.</p><h3>Information We Collect</h3><p>We collect essential customer information such as name, email address, phone number, and billing details solely for fulfilling tour bookings and providing travel support.</p>', 'Privacy Policy | Wanderer South India', 'Learn how Wanderer South India collects, uses, and safeguards customer data.', 'published', NOW(), NOW())
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `content` = VALUES(`content`);

-- ------------------------------------------------------------------------------
-- 11. SEED DEFAULT FOOTER LINKS
-- ------------------------------------------------------------------------------
INSERT INTO `footer_links` (`column_name`, `label`, `url`, `display_order`, `is_external`, `status`, `created_at`, `updated_at`) VALUES
('useful_links', 'Home', '/', 1, 0, 'active', NOW(), NOW()),
('useful_links', 'Tours', '/tours', 2, 0, 'active', NOW(), NOW()),
('useful_links', 'Destinations', '/destinations', 3, 0, 'active', NOW(), NOW()),
('useful_links', 'About Us', '/about-us', 4, 0, 'active', NOW(), NOW()),
('useful_links', 'Contact Us', '/contact', 5, 0, 'active', NOW(), NOW()),
('policy_pages', 'Terms & Conditions', '/terms-conditions', 1, 0, 'active', NOW(), NOW()),
('policy_pages', 'Refund Policy', '/refund-policy', 2, 0, 'active', NOW(), NOW()),
('policy_pages', 'Privacy Policy', '/privacy-policy', 3, 0, 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE `label` = VALUES(`label`), `url` = VALUES(`url`);

-- ------------------------------------------------------------------------------
-- 12. SEED DEFAULT SOCIAL MEDIA LINKS
-- ------------------------------------------------------------------------------
INSERT INTO `social_links` (`platform`, `url`, `icon`, `display_order`, `status`, `created_at`, `updated_at`) VALUES
('facebook', 'https://facebook.com/wanderersouthindia', 'facebook', 1, 'active', NOW(), NOW()),
('instagram', 'https://instagram.com/wanderersouthindia', 'instagram', 2, 'active', NOW(), NOW()),
('youtube', 'https://youtube.com/@wanderersouthindia', 'youtube', 3, 'active', NOW(), NOW()),
('x', 'https://x.com/wanderersouthindia', 'twitter', 4, 'active', NOW(), NOW()),
('tripadvisor', 'https://tripadvisor.com', 'tripadvisor', 5, 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE `url` = VALUES(`url`), `icon` = VALUES(`icon`);

-- ------------------------------------------------------------------------------
-- 13. SEED DEFAULT HOME BENEFITS
-- ------------------------------------------------------------------------------
INSERT INTO `home_benefits` (`title`, `description`, `icon`, `display_order`, `status`, `created_at`, `updated_at`) VALUES
('Discover More Experiences', 'Handcrafted itineraries exploring South India’s iconic UNESCO heritage, coastal beauties, and vibrant culture.', 'compass', 1, 'active', NOW(), NOW()),
('Easy & Flexible Booking', 'Simple direct booking with clear pricing, transparent inclusions, and convenient Pay on Arrival option.', 'calendar-check', 2, 'active', NOW(), NOW()),
('Trusted Travel Support', 'Dedicated travel assistance, licensed multilingual drivers, and round-the-clock customer support.', 'headphones', 3, 'active', NOW(), NOW()),
('Private & Comfortable Tours', 'Air-conditioned private vehicles, door-to-door pickup and drop, and personalized pacing for each group.', 'shield-check', 4, 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`);

-- ------------------------------------------------------------------------------
-- 14. RECORD MIGRATIONS IN TRACKING TABLE
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO `migrations` (`migration`, `batch`, `executed_at`) VALUES
('001_create_rbac_tables', 1, NOW()),
('002_create_media_table', 1, NOW()),
('003_create_destination_tables', 1, NOW()),
('004_create_tour_tables', 1, NOW()),
('005_create_cms_home_tables', 1, NOW()),
('006_create_booking_tables', 1, NOW()),
('007_create_review_tables', 1, NOW()),
('008_create_contact_tables', 1, NOW()),
('009_create_settings_pages_tables', 1, NOW()),
('010_create_audit_logs_table', 1, NOW()),
('011_seed_initial_data', 1, NOW());

SET FOREIGN_KEY_CHECKS = 1;
