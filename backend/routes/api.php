<?php

use App\Controllers\AuthController;
use App\Controllers\BookingController;
use App\Controllers\CmsSectionController;
use App\Controllers\DashboardController;
use App\Controllers\DestinationController;
use App\Controllers\FooterLinkController;
use App\Controllers\HealthController;
use App\Controllers\HomeBenefitController;
use App\Controllers\HomeHeroSlideController;
use App\Controllers\MediaController;
use App\Controllers\PageController;
use App\Controllers\ReviewController;
use App\Controllers\RoleController;
use App\Controllers\SiteSettingController;
use App\Controllers\SocialLinkController;
use App\Controllers\TourController;
use App\Controllers\UserController;
use App\Middleware\AuthMiddleware;
use App\Middleware\PermissionMiddleware;
use App\Middleware\RoleMiddleware;
use App\Utils\Router;

/**
 * TramaxTours Backend API Routes Definition
 * 
 * @var Router $router
 */

// Global API v1 Route Group
$router->group('/api/v1', function (Router $router) {

    // Health & System Status Endpoints
    $router->get('/health', [HealthController::class, 'health']);
    $router->get('/health/database', [HealthController::class, 'databaseHealth']);

    // Authentication & RBAC Routes
    $router->group('/auth', function (Router $router) {
        // Public Endpoints
        $router->post('/login', [AuthController::class, 'login']);

        // Protected Endpoints (Bearer Token required)
        $router->get('/me', [AuthController::class, 'me'], [AuthMiddleware::class]);
        $router->post('/logout', [AuthController::class, 'logout'], [AuthMiddleware::class]);

        // Authorization Verification Test Endpoints
        $router->get('/test', [AuthController::class, 'testAuth'], [AuthMiddleware::class]);
        $router->get('/test/admin', [AuthController::class, 'testAdmin'], [new RoleMiddleware(['super_admin', 'admin'])]);
        $router->get('/test/permission', [AuthController::class, 'testPermission'], [new PermissionMiddleware('users.view')]);
    });

    // Dashboard & Operations Statistics Route (Permission: dashboard.view)
    $router->group('/dashboard', function (Router $router) {
        $router->get('/stats', [DashboardController::class, 'stats'], [new PermissionMiddleware('dashboard.view')]);
        $router->get('', [DashboardController::class, 'stats'], [new PermissionMiddleware('dashboard.view')]);
    });

    // Media Library & Asset Management Routes
    $router->group('/media', function (Router $router) {
        // List Media & Search (Permission: media.view)
        $router->get('', [MediaController::class, 'index'], [new PermissionMiddleware('media.view')]);

        // Upload Media (Permission: media.upload)
        $router->post('/upload', [MediaController::class, 'upload'], [new PermissionMiddleware('media.upload')]);
        $router->post('', [MediaController::class, 'upload'], [new PermissionMiddleware('media.upload')]);

        // Get Single Media Details (Permission: media.view)
        $router->get('/{id}', [MediaController::class, 'show'], [new PermissionMiddleware('media.view')]);

        // Update Media Metadata (Permission: media.upload)
        $router->put('/{id}', [MediaController::class, 'update'], [new PermissionMiddleware('media.upload')]);
        $router->patch('/{id}', [MediaController::class, 'update'], [new PermissionMiddleware('media.upload')]);

        // Delete Media (Permission: media.delete)
        $router->delete('/{id}', [MediaController::class, 'delete'], [new PermissionMiddleware('media.delete')]);
    });

    // Destinations Management Routes
    $router->group('/destinations', function (Router $router) {
        // List Destinations (Public / Authenticated)
        $router->get('', [DestinationController::class, 'index']);

        // Create Destination (Permission: destinations.create)
        $router->post('', [DestinationController::class, 'store'], [new PermissionMiddleware('destinations.create')]);

        // Get Single Destination by ID or Slug (Public / Authenticated)
        $router->get('/{id}', [DestinationController::class, 'show']);

        // Update Destination (Permission: destinations.edit)
        $router->put('/{id}', [DestinationController::class, 'update'], [new PermissionMiddleware('destinations.edit')]);
        $router->patch('/{id}', [DestinationController::class, 'update'], [new PermissionMiddleware('destinations.edit')]);

        // Delete Destination (Permission: destinations.delete)
        $router->delete('/{id}', [DestinationController::class, 'destroy'], [new PermissionMiddleware('destinations.delete')]);

        // Restore Destination (Permission: destinations.delete)
        $router->post('/{id}/restore', [DestinationController::class, 'restore'], [new PermissionMiddleware('destinations.delete')]);
        $router->patch('/{id}/restore', [DestinationController::class, 'restore'], [new PermissionMiddleware('destinations.delete')]);

        // Publish / Unpublish Destination (Permission: destinations.publish)
        $router->post('/{id}/publish', [DestinationController::class, 'publish'], [new PermissionMiddleware('destinations.publish')]);
        $router->patch('/{id}/publish', [DestinationController::class, 'publish'], [new PermissionMiddleware('destinations.publish')]);
        $router->post('/{id}/unpublish', [DestinationController::class, 'unpublish'], [new PermissionMiddleware('destinations.publish')]);
        $router->patch('/{id}/unpublish', [DestinationController::class, 'unpublish'], [new PermissionMiddleware('destinations.publish')]);
    });

    // Tours Management Routes
    $router->group('/tours', function (Router $router) {
        // List Tours (Public / Authenticated)
        $router->get('', [TourController::class, 'index']);

        // Create Tour (Permission: tours.create)
        $router->post('', [TourController::class, 'store'], [new PermissionMiddleware('tours.create')]);

        // Get Single Tour by ID or Slug (Public / Authenticated)
        $router->get('/{id}', [TourController::class, 'show']);

        // Update Tour (Permission: tours.edit)
        $router->put('/{id}', [TourController::class, 'update'], [new PermissionMiddleware('tours.edit')]);
        $router->patch('/{id}', [TourController::class, 'update'], [new PermissionMiddleware('tours.edit')]);

        // Delete Tour (Permission: tours.delete)
        $router->delete('/{id}', [TourController::class, 'destroy'], [new PermissionMiddleware('tours.delete')]);

        // Restore Tour (Permission: tours.delete)
        $router->post('/{id}/restore', [TourController::class, 'restore'], [new PermissionMiddleware('tours.delete')]);
        $router->patch('/{id}/restore', [TourController::class, 'restore'], [new PermissionMiddleware('tours.delete')]);

        // Publish / Unpublish Tour (Permission: tours.publish)
        $router->post('/{id}/publish', [TourController::class, 'publish'], [new PermissionMiddleware('tours.publish')]);
        $router->patch('/{id}/publish', [TourController::class, 'publish'], [new PermissionMiddleware('tours.publish')]);
        $router->post('/{id}/unpublish', [TourController::class, 'unpublish'], [new PermissionMiddleware('tours.publish')]);
        $router->patch('/{id}/unpublish', [TourController::class, 'unpublish'], [new PermissionMiddleware('tours.publish')]);
    });

    // Tour Categories Directory (Public / Authenticated)
    $router->get('/tour-categories', [TourController::class, 'categories']);



    // Pages & CMS Content Management Routes
    $router->group('/pages', function (Router $router) {
        // List Pages (Public / Authenticated)
        $router->get('', [PageController::class, 'index']);

        // Create Page (Permission: pages.manage)
        $router->post('', [PageController::class, 'store'], [new PermissionMiddleware('pages.manage')]);

        // Get Single Page by ID or Slug (Public / Authenticated)
        $router->get('/{id}', [PageController::class, 'show']);

        // Update Page (Permission: pages.manage)
        $router->put('/{id}', [PageController::class, 'update'], [new PermissionMiddleware('pages.manage')]);
        $router->patch('/{id}', [PageController::class, 'update'], [new PermissionMiddleware('pages.manage')]);

        // Delete Page (Permission: pages.manage)
        $router->delete('/{id}', [PageController::class, 'destroy'], [new PermissionMiddleware('pages.manage')]);

        // Restore Page (Permission: pages.manage)
        $router->post('/{id}/restore', [PageController::class, 'restore'], [new PermissionMiddleware('pages.manage')]);
        $router->patch('/{id}/restore', [PageController::class, 'restore'], [new PermissionMiddleware('pages.manage')]);

        // Publish / Unpublish Page (Permission: pages.manage)
        $router->post('/{id}/publish', [PageController::class, 'publish'], [new PermissionMiddleware('pages.manage')]);
        $router->patch('/{id}/publish', [PageController::class, 'publish'], [new PermissionMiddleware('pages.manage')]);
        $router->post('/{id}/unpublish', [PageController::class, 'unpublish'], [new PermissionMiddleware('pages.manage')]);
        $router->patch('/{id}/unpublish', [PageController::class, 'unpublish'], [new PermissionMiddleware('pages.manage')]);
    });

    // CMS Modular Sections Management Routes
    $router->group('/cms-sections', function (Router $router) {
        // List CMS Sections (Public / Authenticated)
        $router->get('', [CmsSectionController::class, 'index']);

        // Create CMS Section (Permission: homepage.manage)
        $router->post('', [CmsSectionController::class, 'store'], [new PermissionMiddleware('homepage.manage')]);

        // Get Single CMS Section by ID or section_key (Public / Authenticated)
        $router->get('/{id}', [CmsSectionController::class, 'show']);

        // Update CMS Section (Permission: homepage.manage)
        $router->put('/{id}', [CmsSectionController::class, 'update'], [new PermissionMiddleware('homepage.manage')]);
        $router->patch('/{id}', [CmsSectionController::class, 'update'], [new PermissionMiddleware('homepage.manage')]);

        // Delete CMS Section (Permission: homepage.manage)
        $router->delete('/{id}', [CmsSectionController::class, 'destroy'], [new PermissionMiddleware('homepage.manage')]);

        // Restore CMS Section (Permission: homepage.manage)
        $router->post('/{id}/restore', [CmsSectionController::class, 'restore'], [new PermissionMiddleware('homepage.manage')]);
        $router->patch('/{id}/restore', [CmsSectionController::class, 'restore'], [new PermissionMiddleware('homepage.manage')]);

        // Activate / Deactivate CMS Section (Permission: homepage.manage)
        $router->post('/{id}/activate', [CmsSectionController::class, 'activate'], [new PermissionMiddleware('homepage.manage')]);
        $router->patch('/{id}/activate', [CmsSectionController::class, 'activate'], [new PermissionMiddleware('homepage.manage')]);
        $router->post('/{id}/deactivate', [CmsSectionController::class, 'deactivate'], [new PermissionMiddleware('homepage.manage')]);
        $router->patch('/{id}/deactivate', [CmsSectionController::class, 'deactivate'], [new PermissionMiddleware('homepage.manage')]);
    });

    // Homepage Hero Slides Management Routes
    $router->group('/home-hero-slides', function (Router $router) {
        // List Hero Slides (Public / Authenticated)
        $router->get('', [HomeHeroSlideController::class, 'index']);

        // Create Hero Slide (Permission: homepage.manage)
        $router->post('', [HomeHeroSlideController::class, 'store'], [new PermissionMiddleware('homepage.manage')]);

        // Get Single Hero Slide by ID (Public / Authenticated)
        $router->get('/{id}', [HomeHeroSlideController::class, 'show']);

        // Update Hero Slide (Permission: homepage.manage)
        $router->put('/{id}', [HomeHeroSlideController::class, 'update'], [new PermissionMiddleware('homepage.manage')]);
        $router->patch('/{id}', [HomeHeroSlideController::class, 'update'], [new PermissionMiddleware('homepage.manage')]);

        // Delete Hero Slide (Permission: homepage.manage)
        $router->delete('/{id}', [HomeHeroSlideController::class, 'destroy'], [new PermissionMiddleware('homepage.manage')]);

        // Restore Hero Slide (Permission: homepage.manage)
        $router->post('/{id}/restore', [HomeHeroSlideController::class, 'restore'], [new PermissionMiddleware('homepage.manage')]);
        $router->patch('/{id}/restore', [HomeHeroSlideController::class, 'restore'], [new PermissionMiddleware('homepage.manage')]);

        // Activate / Deactivate Hero Slide (Permission: homepage.manage)
        $router->post('/{id}/activate', [HomeHeroSlideController::class, 'activate'], [new PermissionMiddleware('homepage.manage')]);
        $router->patch('/{id}/activate', [HomeHeroSlideController::class, 'activate'], [new PermissionMiddleware('homepage.manage')]);
        $router->post('/{id}/deactivate', [HomeHeroSlideController::class, 'deactivate'], [new PermissionMiddleware('homepage.manage')]);
        $router->patch('/{id}/deactivate', [HomeHeroSlideController::class, 'deactivate'], [new PermissionMiddleware('homepage.manage')]);
    });

    // Homepage Benefits Management Routes
    $router->group('/home-benefits', function (Router $router) {
        // List Benefits (Public / Authenticated)
        $router->get('', [HomeBenefitController::class, 'index']);

        // Create Benefit (Permission: homepage.manage)
        $router->post('', [HomeBenefitController::class, 'store'], [new PermissionMiddleware('homepage.manage')]);

        // Get Single Benefit by ID (Public / Authenticated)
        $router->get('/{id}', [HomeBenefitController::class, 'show']);

        // Update Benefit (Permission: homepage.manage)
        $router->put('/{id}', [HomeBenefitController::class, 'update'], [new PermissionMiddleware('homepage.manage')]);
        $router->patch('/{id}', [HomeBenefitController::class, 'update'], [new PermissionMiddleware('homepage.manage')]);

        // Delete Benefit (Permission: homepage.manage)
        $router->delete('/{id}', [HomeBenefitController::class, 'destroy'], [new PermissionMiddleware('homepage.manage')]);

        // Restore Benefit (Permission: homepage.manage)
        $router->post('/{id}/restore', [HomeBenefitController::class, 'restore'], [new PermissionMiddleware('homepage.manage')]);
        $router->patch('/{id}/restore', [HomeBenefitController::class, 'restore'], [new PermissionMiddleware('homepage.manage')]);

        // Activate / Deactivate Benefit (Permission: homepage.manage)
        $router->post('/{id}/activate', [HomeBenefitController::class, 'activate'], [new PermissionMiddleware('homepage.manage')]);
        $router->patch('/{id}/activate', [HomeBenefitController::class, 'activate'], [new PermissionMiddleware('homepage.manage')]);
        $router->post('/{id}/deactivate', [HomeBenefitController::class, 'deactivate'], [new PermissionMiddleware('homepage.manage')]);
        $router->patch('/{id}/deactivate', [HomeBenefitController::class, 'deactivate'], [new PermissionMiddleware('homepage.manage')]);
    });

    // Site Settings Management Routes
    $router->group('/site-settings', function (Router $router) {
        // List all settings (Public / Authenticated)
        $router->get('', [SiteSettingController::class, 'index']);

        // Get settings by group (Public / Authenticated)
        $router->get('/group/{group}', [SiteSettingController::class, 'getByGroup']);

        // Get single setting by ID or setting_key (Public / Authenticated)
        $router->get('/{id}', [SiteSettingController::class, 'show']);

        // Create new setting (Permission: settings.manage)
        $router->post('', [SiteSettingController::class, 'store'], [new PermissionMiddleware('settings.manage')]);

        // Update setting (Permission: settings.manage)
        $router->put('/{id}', [SiteSettingController::class, 'update'], [new PermissionMiddleware('settings.manage')]);
        $router->patch('/{id}', [SiteSettingController::class, 'update'], [new PermissionMiddleware('settings.manage')]);

        // Delete setting (Permission: settings.manage)
        $router->delete('/{id}', [SiteSettingController::class, 'destroy'], [new PermissionMiddleware('settings.manage')]);

        // Restore setting (Permission: settings.manage)
        $router->post('/{id}/restore', [SiteSettingController::class, 'restore'], [new PermissionMiddleware('settings.manage')]);
        $router->patch('/{id}/restore', [SiteSettingController::class, 'restore'], [new PermissionMiddleware('settings.manage')]);
    });

    // Footer Links Management Routes
    $router->group('/footer-links', function (Router $router) {
        // List Footer Links (Public / Authenticated)
        $router->get('', [FooterLinkController::class, 'index']);

        // Create Footer Link (Permission: footer.manage)
        $router->post('', [FooterLinkController::class, 'store'], [new PermissionMiddleware('footer.manage')]);

        // Get Single Footer Link by ID (Public / Authenticated)
        $router->get('/{id}', [FooterLinkController::class, 'show']);

        // Update Footer Link (Permission: footer.manage)
        $router->put('/{id}', [FooterLinkController::class, 'update'], [new PermissionMiddleware('footer.manage')]);
        $router->patch('/{id}', [FooterLinkController::class, 'update'], [new PermissionMiddleware('footer.manage')]);

        // Delete Footer Link (Permission: footer.manage)
        $router->delete('/{id}', [FooterLinkController::class, 'destroy'], [new PermissionMiddleware('footer.manage')]);

        // Restore Footer Link (Permission: footer.manage)
        $router->post('/{id}/restore', [FooterLinkController::class, 'restore'], [new PermissionMiddleware('footer.manage')]);
        $router->patch('/{id}/restore', [FooterLinkController::class, 'restore'], [new PermissionMiddleware('footer.manage')]);

        // Activate / Deactivate Footer Link (Permission: footer.manage)
        $router->post('/{id}/activate', [FooterLinkController::class, 'activate'], [new PermissionMiddleware('footer.manage')]);
        $router->patch('/{id}/activate', [FooterLinkController::class, 'activate'], [new PermissionMiddleware('footer.manage')]);
        $router->post('/{id}/deactivate', [FooterLinkController::class, 'deactivate'], [new PermissionMiddleware('footer.manage')]);
        $router->patch('/{id}/deactivate', [FooterLinkController::class, 'deactivate'], [new PermissionMiddleware('footer.manage')]);
    });

    // Social Links Management Routes
    $router->group('/social-links', function (Router $router) {
        // List Social Links (Public / Authenticated)
        $router->get('', [SocialLinkController::class, 'index']);

        // Create Social Link (Permission: social.manage)
        $router->post('', [SocialLinkController::class, 'store'], [new PermissionMiddleware('social.manage')]);

        // Get Single Social Link by ID (Public / Authenticated)
        $router->get('/{id}', [SocialLinkController::class, 'show']);

        // Update Social Link (Permission: social.manage)
        $router->put('/{id}', [SocialLinkController::class, 'update'], [new PermissionMiddleware('social.manage')]);
        $router->patch('/{id}', [SocialLinkController::class, 'update'], [new PermissionMiddleware('social.manage')]);

        // Delete Social Link (Permission: social.manage)
        $router->delete('/{id}', [SocialLinkController::class, 'destroy'], [new PermissionMiddleware('social.manage')]);

        // Restore Social Link (Permission: social.manage)
        $router->post('/{id}/restore', [SocialLinkController::class, 'restore'], [new PermissionMiddleware('social.manage')]);
        $router->patch('/{id}/restore', [SocialLinkController::class, 'restore'], [new PermissionMiddleware('social.manage')]);

        // Activate / Deactivate Social Link (Permission: social.manage)
        $router->post('/{id}/activate', [SocialLinkController::class, 'activate'], [new PermissionMiddleware('social.manage')]);
        $router->patch('/{id}/activate', [SocialLinkController::class, 'activate'], [new PermissionMiddleware('social.manage')]);
        $router->post('/{id}/deactivate', [SocialLinkController::class, 'deactivate'], [new PermissionMiddleware('social.manage')]);
        $router->patch('/{id}/deactivate', [SocialLinkController::class, 'deactivate'], [new PermissionMiddleware('social.manage')]);
    });

    // Reviews & Testimonials Management Routes
    $router->group('/reviews', function (Router $router) {
        // List Reviews (Public / Authenticated)
        $router->get('', [ReviewController::class, 'index']);

        // Create Review (Permission: reviews.moderate)
        $router->post('', [ReviewController::class, 'store'], [new PermissionMiddleware('reviews.moderate')]);

        // Get Single Review Detail by ID (Public / Authenticated)
        $router->get('/{id}', [ReviewController::class, 'show']);

        // Update Review (Permission: reviews.moderate)
        $router->put('/{id}', [ReviewController::class, 'update'], [new PermissionMiddleware('reviews.moderate')]);
        $router->patch('/{id}', [ReviewController::class, 'update'], [new PermissionMiddleware('reviews.moderate')]);

        // Delete Review (Permission: reviews.moderate)
        $router->delete('/{id}', [ReviewController::class, 'destroy'], [new PermissionMiddleware('reviews.moderate')]);

        // Restore Review (Permission: reviews.moderate)
        $router->post('/{id}/restore', [ReviewController::class, 'restore'], [new PermissionMiddleware('reviews.moderate')]);
        $router->patch('/{id}/restore', [ReviewController::class, 'restore'], [new PermissionMiddleware('reviews.moderate')]);

        // Approve / Reject Review (Permission: reviews.moderate)
        $router->post('/{id}/approve', [ReviewController::class, 'approve'], [new PermissionMiddleware('reviews.moderate')]);
        $router->patch('/{id}/approve', [ReviewController::class, 'approve'], [new PermissionMiddleware('reviews.moderate')]);
        $router->post('/{id}/reject', [ReviewController::class, 'reject'], [new PermissionMiddleware('reviews.moderate')]);
        $router->patch('/{id}/reject', [ReviewController::class, 'reject'], [new PermissionMiddleware('reviews.moderate')]);

        // Feature / Unfeature Review (Permission: reviews.moderate)
        $router->post('/{id}/feature', [ReviewController::class, 'feature'], [new PermissionMiddleware('reviews.moderate')]);
        $router->patch('/{id}/feature', [ReviewController::class, 'feature'], [new PermissionMiddleware('reviews.moderate')]);
        $router->post('/{id}/unfeature', [ReviewController::class, 'unfeature'], [new PermissionMiddleware('reviews.moderate')]);
        $router->patch('/{id}/unfeature', [ReviewController::class, 'unfeature'], [new PermissionMiddleware('reviews.moderate')]);
    });

    // Bookings & Orders Management Routes
    $router->group('/bookings', function (Router $router) {
        // List Bookings (Permission: bookings.view)
        $router->get('', [BookingController::class, 'index'], [new PermissionMiddleware('bookings.view')]);

        // Aggregate Statistics (Permission: bookings.view)
        $router->get('/stats', [BookingController::class, 'stats'], [new PermissionMiddleware('bookings.view')]);

        // Create Booking (Public & Authenticated allowed)
        $router->post('', [BookingController::class, 'store']);

        // Get Single Booking Detail by ID or Order Number (Permission: bookings.view)
        $router->get('/{id}', [BookingController::class, 'show'], [new PermissionMiddleware('bookings.view')]);

        // Update Booking Notes / Info (Permission: bookings.edit_status)
        $router->put('/{id}', [BookingController::class, 'update'], [new PermissionMiddleware('bookings.edit_status')]);
        $router->patch('/{id}', [BookingController::class, 'update'], [new PermissionMiddleware('bookings.edit_status')]);

        // Update Booking Status (Permission: bookings.edit_status)
        $router->post('/{id}/status', [BookingController::class, 'updateStatus'], [new PermissionMiddleware('bookings.edit_status')]);
        $router->post('/{id}/confirm', [BookingController::class, 'confirm'], [new PermissionMiddleware('bookings.edit_status')]);
        $router->post('/{id}/complete', [BookingController::class, 'complete'], [new PermissionMiddleware('bookings.edit_status')]);
        $router->post('/{id}/cancel', [BookingController::class, 'cancel'], [new PermissionMiddleware('bookings.edit_status')]);

        // Delete Booking (Permission: bookings.delete)
        $router->delete('/{id}', [BookingController::class, 'destroy'], [new PermissionMiddleware('bookings.delete')]);

        // Restore Booking (Permission: bookings.delete)
        $router->post('/{id}/restore', [BookingController::class, 'restore'], [new PermissionMiddleware('bookings.delete')]);
        $router->patch('/{id}/restore', [BookingController::class, 'restore'], [new PermissionMiddleware('bookings.delete')]);
    });

    // Staff & User Management Routes
    $router->group('/users', function (Router $router) {
        // List Users / Staff with filters (Permission: users.view)
        $router->get('', [UserController::class, 'index'], [new PermissionMiddleware('users.view')]);

        // User Statistics (Permission: users.view)
        $router->get('/stats', [UserController::class, 'stats'], [new PermissionMiddleware('users.view')]);

        // Create User / Staff (Permission: users.create)
        $router->post('', [UserController::class, 'store'], [new PermissionMiddleware('users.create')]);

        // Get Single User Details (Permission: users.view)
        $router->get('/{id}', [UserController::class, 'show'], [new PermissionMiddleware('users.view')]);

        // Update User / Staff (Permission: users.edit)
        $router->put('/{id}', [UserController::class, 'update'], [new PermissionMiddleware('users.edit')]);
        $router->patch('/{id}', [UserController::class, 'update'], [new PermissionMiddleware('users.edit')]);

        // Activate User Account (Permission: users.edit)
        $router->post('/{id}/activate', [UserController::class, 'activate'], [new PermissionMiddleware('users.edit')]);
        $router->patch('/{id}/activate', [UserController::class, 'activate'], [new PermissionMiddleware('users.edit')]);

        // Deactivate / Disable User Account (Permission: users.edit)
        $router->post('/{id}/deactivate', [UserController::class, 'deactivate'], [new PermissionMiddleware('users.edit')]);
        $router->patch('/{id}/deactivate', [UserController::class, 'deactivate'], [new PermissionMiddleware('users.edit')]);

        // Delete / Soft Delete User Account (Permission: users.delete)
        $router->delete('/{id}', [UserController::class, 'destroy'], [new PermissionMiddleware('users.delete')]);
    });

    // Roles & Access Control Routes
    $router->group('/roles', function (Router $router) {
        // List all Roles with user count and permissions (Permission: roles.view)
        $router->get('', [RoleController::class, 'index'], [new PermissionMiddleware('roles.view')]);

        // Get Single Role Details (Permission: roles.view)
        $router->get('/{id}', [RoleController::class, 'show'], [new PermissionMiddleware('roles.view')]);
    });

    // System Permissions Directory Route
    $router->group('/permissions', function (Router $router) {
        // List all system permissions grouped (Permission: roles.view)
        $router->get('', [RoleController::class, 'permissions'], [new PermissionMiddleware('roles.view')]);
    });
});


