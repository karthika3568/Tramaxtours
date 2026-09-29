<?php

namespace App\Controllers;

use App\Utils\Database;
use App\Utils\Request;

class DashboardController extends BaseController
{
    /**
     * Get aggregate statistics and operational metrics for the admin dashboard.
     * GET /api/v1/dashboard/stats
     * Permission: dashboard.view
     *
     * @return void
     */
    public function stats(): void
    {
        $pdo = Database::getConnection();

        // 1. Tours Statistics
        $toursStmt = $pdo->query("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'published' AND deleted_at IS NULL THEN 1 ELSE 0 END) as published,
                SUM(CASE WHEN status = 'draft' AND deleted_at IS NULL THEN 1 ELSE 0 END) as draft
            FROM tours 
            WHERE deleted_at IS NULL
        ");
        $toursStats = $toursStmt->fetch(\PDO::FETCH_ASSOC);

        // 2. Destinations Statistics
        $destStmt = $pdo->query("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'published' AND deleted_at IS NULL THEN 1 ELSE 0 END) as published,
                SUM(CASE WHEN status = 'draft' AND deleted_at IS NULL THEN 1 ELSE 0 END) as draft
            FROM destinations 
            WHERE deleted_at IS NULL
        ");
        $destStats = $destStmt->fetch(\PDO::FETCH_ASSOC);

        // 3. Bookings Statistics
        $bookStmt = $pdo->query("
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN booking_status = 'pending' AND deleted_at IS NULL THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN booking_status = 'confirmed' AND deleted_at IS NULL THEN 1 ELSE 0 END) as confirmed,
                SUM(CASE WHEN booking_status = 'completed' AND deleted_at IS NULL THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN booking_status = 'cancelled' AND deleted_at IS NULL THEN 1 ELSE 0 END) as cancelled,
                SUM(CASE WHEN booking_status = 'rejected' AND deleted_at IS NULL THEN 1 ELSE 0 END) as rejected,
                SUM(CASE WHEN deleted_at IS NULL THEN total_price ELSE 0 END) as total_value,
                SUM(CASE WHEN DATE(created_at) = CURDATE() AND deleted_at IS NULL THEN 1 ELSE 0 END) as today_count,
                SUM(CASE WHEN booking_date >= CURDATE() AND booking_status NOT IN ('cancelled', 'rejected') AND deleted_at IS NULL THEN 1 ELSE 0 END) as upcoming_count
            FROM bookings
            WHERE deleted_at IS NULL
        ");
        $bookStats = $bookStmt->fetch(\PDO::FETCH_ASSOC);

        // 4. Reviews Statistics
        $revStmt = $pdo->query("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' AND deleted_at IS NULL THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'approved' AND deleted_at IS NULL THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'rejected' AND deleted_at IS NULL THEN 1 ELSE 0 END) as rejected,
                AVG(CASE WHEN status = 'approved' AND deleted_at IS NULL THEN rating ELSE NULL END) as average_rating
            FROM reviews 
            WHERE deleted_at IS NULL
        ");
        $revStats = $revStmt->fetch(\PDO::FETCH_ASSOC);

        // 5. CMS Pages Statistics
        $pageStmt = $pdo->query("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'published' AND deleted_at IS NULL THEN 1 ELSE 0 END) as published,
                SUM(CASE WHEN status = 'draft' AND deleted_at IS NULL THEN 1 ELSE 0 END) as draft
            FROM pages 
            WHERE deleted_at IS NULL
        ");
        $pageStats = $pageStmt->fetch(\PDO::FETCH_ASSOC);

        // 6. Media Library Statistics
        $mediaStmt = $pdo->query("SELECT COUNT(*) as total FROM media");
        $mediaStats = $mediaStmt->fetch(\PDO::FETCH_ASSOC);

        // 7. Recent 5 Bookings
        $recentBookingsStmt = $pdo->query("
            SELECT 
                b.id,
                b.order_number,
                b.booking_date,
                b.tickets_count,
                b.total_price,
                b.currency,
                b.booking_status,
                b.payment_status,
                b.created_at,
                t.title as tour_title,
                t.slug as tour_slug,
                CONCAT(COALESCE(c.first_name, ''), ' ', COALESCE(c.last_name, '')) as customer_name,
                c.email as customer_email
            FROM bookings b
            LEFT JOIN tours t ON b.tour_id = t.id
            LEFT JOIN booking_customer_details c ON b.id = c.booking_id
            WHERE b.deleted_at IS NULL
            ORDER BY b.created_at DESC
            LIMIT 5
        ");
        $recentBookings = $recentBookingsStmt->fetchAll(\PDO::FETCH_ASSOC);

        // 7b. Upcoming 5 Bookings — by travel date (booking_date), not creation date.
        // Distinct from "Recent Bookings" above, which is ordered by created_at.
        $upcomingBookingsStmt = $pdo->query("
            SELECT
                b.id,
                b.order_number,
                b.booking_date,
                b.tickets_count,
                b.total_price,
                b.currency,
                b.booking_status,
                b.payment_status,
                t.title as tour_title,
                t.slug as tour_slug,
                d.name as destination_name,
                CONCAT(COALESCE(c.first_name, ''), ' ', COALESCE(c.last_name, '')) as customer_name,
                c.email as customer_email
            FROM bookings b
            LEFT JOIN tours t ON b.tour_id = t.id
            LEFT JOIN destinations d ON t.destination_id = d.id
            LEFT JOIN booking_customer_details c ON b.id = c.booking_id
            WHERE b.deleted_at IS NULL
              AND b.booking_date >= CURDATE()
              AND b.booking_status NOT IN ('cancelled', 'rejected')
            ORDER BY b.booking_date ASC
            LIMIT 5
        ");
        $upcomingBookings = $upcomingBookingsStmt->fetchAll(\PDO::FETCH_ASSOC);

        // 8. Recent 5 Reviews
        $recentReviewsStmt = $pdo->query("
            SELECT 
                r.id,
                r.customer_name,
                r.customer_country,
                r.rating,
                r.title,
                r.content,
                r.status,
                r.is_featured,
                r.created_at,
                t.title as tour_title
            FROM reviews r
            LEFT JOIN tours t ON r.tour_id = t.id
            WHERE r.deleted_at IS NULL
            ORDER BY r.created_at DESC
            LIMIT 5
        ");
        $recentReviews = $recentReviewsStmt->fetchAll(\PDO::FETCH_ASSOC);

        // 9. Recent 5 Tours
        $recentToursStmt = $pdo->query("
            SELECT 
                t.id,
                t.title,
                t.slug,
                t.status,
                t.duration_days,
                t.tour_type,
                t.base_price,
                t.is_featured,
                d.name as destination_name
            FROM tours t
            LEFT JOIN destinations d ON t.destination_id = d.id
            WHERE t.deleted_at IS NULL
            ORDER BY t.created_at DESC
            LIMIT 5
        ");
        $recentTours = $recentToursStmt->fetchAll(\PDO::FETCH_ASSOC);

        // 10. Pending Actions Summary
        $pendingActions = [
            'pending_bookings' => (int) ($bookStats['pending'] ?? 0),
            'pending_reviews' => (int) ($revStats['pending'] ?? 0),
            'draft_tours' => (int) ($toursStats['draft'] ?? 0),
            'draft_destinations' => (int) ($destStats['draft'] ?? 0),
            'draft_pages' => (int) ($pageStats['draft'] ?? 0),
        ];

        $payload = [
            'overview' => [
                'tours' => [
                    'total' => (int) ($toursStats['total'] ?? 0),
                    'published' => (int) ($toursStats['published'] ?? 0),
                    'draft' => (int) ($toursStats['draft'] ?? 0),
                ],
                'destinations' => [
                    'total' => (int) ($destStats['total'] ?? 0),
                    'published' => (int) ($destStats['published'] ?? 0),
                    'draft' => (int) ($destStats['draft'] ?? 0),
                ],
                'bookings' => [
                    'total' => (int) ($bookStats['total'] ?? 0),
                    'pending' => (int) ($bookStats['pending'] ?? 0),
                    'confirmed' => (int) ($bookStats['confirmed'] ?? 0),
                    'completed' => (int) ($bookStats['completed'] ?? 0),
                    'cancelled' => (int) ($bookStats['cancelled'] ?? 0),
                    'rejected' => (int) ($bookStats['rejected'] ?? 0),
                    'total_value' => (float) ($bookStats['total_value'] ?? 0),
                    // 'today' = created today (new bookings placed). 'upcoming' = travel date
                    // in the future (not created date) — deliberately distinct fields.
                    'today' => (int) ($bookStats['today_count'] ?? 0),
                    'upcoming' => (int) ($bookStats['upcoming_count'] ?? 0),
                ],
                'reviews' => [
                    'total' => (int) ($revStats['total'] ?? 0),
                    'pending' => (int) ($revStats['pending'] ?? 0),
                    'approved' => (int) ($revStats['approved'] ?? 0),
                    'rejected' => (int) ($revStats['rejected'] ?? 0),
                    'average_rating' => $revStats['average_rating'] !== null ? round((float) $revStats['average_rating'], 2) : 5.0,
                ],
                'pages' => [
                    'total' => (int) ($pageStats['total'] ?? 0),
                    'published' => (int) ($pageStats['published'] ?? 0),
                    'draft' => (int) ($pageStats['draft'] ?? 0),
                ],
                'media' => [
                    'total' => (int) ($mediaStats['total'] ?? 0),
                ],
            ],
            'pending_actions' => $pendingActions,
            'recent_bookings' => $recentBookings,
            'upcoming_bookings' => $upcomingBookings,
            'recent_reviews' => $recentReviews,
            'recent_tours' => $recentTours,
            'timestamp' => gmdate('Y-m-d\TH:i:s\Z'),
        ];

        $this->success($payload, 'Dashboard operational metrics retrieved successfully');
    }
}
