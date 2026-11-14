<?php

namespace App\Controllers;

use App\Models\Booking;
use App\Models\Tour;
use App\Services\AuditService;
use App\Services\PdfService;
use App\Utils\Database;
use App\Utils\Request;
use App\Utils\Response;

class CustomerBookingController extends BaseController
{
    /**
     * Get authenticated customer's bookings list with filtering and pagination.
     * GET /api/v1/customer/bookings
     *
     * @return void
     */
    public function index(): void
    {
        $authUser = Request::getAuthenticatedUser();
        $userId = (int) ($authUser['id'] ?? 0);
        $userEmail = strtolower(trim((string) ($authUser['email'] ?? '')));

        if (!$userId) {
            $this->error('Authentication required.', 401, null, 'UNAUTHORIZED');
        }

        $params = Request::getQueryParams();
        $page = max(1, (int) ($params['page'] ?? 1));
        $perPage = max(1, min(50, (int) ($params['per_page'] ?? 10)));
        $statusFilter = strtolower(trim((string) ($params['status'] ?? 'all')));
        $sortBy = strtolower(trim((string) ($params['sort_by'] ?? 'created_at')));
        $sortOrder = strtoupper(trim((string) ($params['sort_order'] ?? 'DESC'))) === 'ASC' ? 'ASC' : 'DESC';

        $allowedSorts = ['created_at', 'booking_date', 'arrival_date', 'total_price', 'booking_status'];
        if (!in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'created_at';
        }

        $db = Database::getConnection();

        // Base WHERE clause scoped strictly to this customer
        $where = ["b.deleted_at IS NULL", "(b.user_id = :user_id OR LOWER(TRIM(bcd.email)) = :user_email)"];
        $bindings = [
            ':user_id' => $userId,
            ':user_email' => $userEmail,
        ];

        // Status filter
        if ($statusFilter !== 'all' && $statusFilter !== '') {
            if ($statusFilter === 'pending') {
                $where[] = "b.booking_status IN ('pending', 'contacted', 'payment_discussion', 'awaiting_confirmation')";
            } elseif ($statusFilter === 'confirmed') {
                $where[] = "b.booking_status = 'confirmed'";
            } elseif ($statusFilter === 'completed') {
                $where[] = "b.booking_status = 'completed'";
            } elseif ($statusFilter === 'cancelled') {
                $where[] = "b.booking_status IN ('cancelled', 'rejected')";
            } else {
                $where[] = "b.booking_status = :status";
                $bindings[':status'] = $statusFilter;
            }
        }

        $whereSql = implode(' AND ', $where);

        // Count total matching
        $countSql = "SELECT COUNT(DISTINCT b.id)
                     FROM bookings b
                     LEFT JOIN booking_customer_details bcd ON b.id = bcd.booking_id
                     WHERE {$whereSql}";
        $stmt = $db->prepare($countSql);
        $stmt->execute($bindings);
        $total = (int) $stmt->fetchColumn();

        $totalPages = max(1, (int) ceil($total / $perPage));
        $offset = ($page - 1) * $perPage;

        // Fetch bookings
        $dataSql = "SELECT b.*,
                           t.title as tour_title,
                           t.slug as tour_slug,
                           t.featured_image,
                           bcd.first_name,
                           bcd.last_name,
                           bcd.email as customer_email,
                           bcd.phone as customer_phone
                    FROM bookings b
                    LEFT JOIN tours t ON b.tour_id = t.id
                    LEFT JOIN booking_customer_details bcd ON b.id = bcd.booking_id
                    WHERE {$whereSql}
                    GROUP BY b.id
                    ORDER BY b.{$sortBy} {$sortOrder}
                    LIMIT {$perPage} OFFSET {$offset}";

        $stmt = $db->prepare($dataSql);
        $stmt->execute($bindings);
        $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $bookings = array_map(function ($row) {
            return Booking::formatBookingListItem($row);
        }, $rows);

        $this->success([
            'data' => $bookings,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'total_pages' => $totalPages,
            ],
            'stats' => $this->calculateStats($userId, $userEmail),
        ], 'Customer bookings retrieved successfully');
    }

    /**
     * Get aggregate statistics for authenticated customer.
     * GET /api/v1/customer/bookings/stats
     *
     * @return void
     */
    public function stats(): void
    {
        $authUser = Request::getAuthenticatedUser();
        $userId = (int) ($authUser['id'] ?? 0);
        $userEmail = strtolower(trim((string) ($authUser['email'] ?? '')));

        if (!$userId) {
            $this->error('Authentication required.', 401, null, 'UNAUTHORIZED');
        }

        $stats = $this->calculateStats($userId, $userEmail);
        $this->success($stats, 'Customer booking statistics retrieved successfully');
    }

    /**
     * Get single booking details with strict customer ownership check.
     * GET /api/v1/customer/bookings/{id}
     *
     * @param int|string $id
     * @return void
     */
    public function show(int|string $id): void
    {
        $authUser = Request::getAuthenticatedUser();
        $userId = (int) ($authUser['id'] ?? 0);
        $userEmail = strtolower(trim((string) ($authUser['email'] ?? '')));

        if (!$userId) {
            $this->error('Authentication required.', 401, null, 'UNAUTHORIZED');
        }

        $booking = is_numeric($id) ? Booking::findById((int) $id) : Booking::findByOrderNumber((string) $id);

        if (!$booking) {
            $this->error('Booking record not found.', 404, null, 'NOT_FOUND');
        }

        // Strict customer ownership verification
        $bookingUserId = (int) ($booking['user_id'] ?? 0);
        $bookingCustomerEmail = strtolower(trim((string) ($booking['customer']['email'] ?? '')));

        if ($bookingUserId !== $userId && $bookingCustomerEmail !== $userEmail) {
            AuditService::log(
                $userId,
                'unauthorized_booking_access',
                'booking',
                (int) $booking['id'],
                null,
                ['attempted_user_id' => $userId, 'owner_user_id' => $bookingUserId]
            );

            $this->error('You are not authorized to view this booking.', 403, null, 'FORBIDDEN');
        }

        $formatted = Booking::formatBookingDetails($booking);
        $this->success($formatted, 'Booking details retrieved successfully');
    }

    /**
     * Download confirmed ticket PDF with strict customer ownership & status check.
     * GET /api/v1/customer/bookings/{id}/receipt
     *
     * @param int|string $id
     * @return void
     */
    public function receipt(int|string $id): void
    {
        $authUser = Request::getAuthenticatedUser();
        $userId = (int) ($authUser['id'] ?? 0);
        $userEmail = strtolower(trim((string) ($authUser['email'] ?? '')));

        if (!$userId) {
            $this->error('Authentication required.', 401, null, 'UNAUTHORIZED');
        }

        $booking = is_numeric($id) ? Booking::findById((int) $id) : Booking::findByOrderNumber((string) $id);

        if (!$booking) {
            $this->error('Booking record not found.', 404, null, 'NOT_FOUND');
        }

        // Strict ownership check
        $bookingUserId = (int) ($booking['user_id'] ?? 0);
        $bookingCustomerEmail = strtolower(trim((string) ($booking['customer']['email'] ?? '')));

        if ($bookingUserId !== $userId && $bookingCustomerEmail !== $userEmail) {
            $this->error('You are not authorized to download this ticket.', 403, null, 'FORBIDDEN');
        }

        // Ticket PDF is strictly permitted when status is confirmed
        $status = strtolower(trim((string) ($booking['booking_status'] ?? 'pending')));
        if ($status !== 'confirmed') {
            $this->error('Confirmed ticket receipt is only available once your booking has been officially confirmed by our team.', 400, [
                'current_status' => $booking['booking_status'],
            ], 'TICKET_NOT_CONFIRMED');
        }

        $pdfService = new PdfService();
        $pdfContent = $pdfService->generateBookingConfirmationPdf($booking);

        $orderNumber = $booking['order_number'] ?? "booking-{$booking['id']}";
        $ticketNumber = $booking['ticket_number'] ?? $orderNumber;
        $filename = "Ticket-{$ticketNumber}.pdf";

        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Content-Length: ' . strlen($pdfContent));
        header('Cache-Control: private, max-age=0, must-revalidate');
        header('Pragma: public');

        echo $pdfContent;
        exit;
    }

    /**
     * Calculate dynamic aggregate counts for customer.
     *
     * @param int $userId
     * @param string $userEmail
     * @return array
     */
    private function calculateStats(int $userId, string $userEmail): array
    {
        $db = Database::getConnection();

        $sql = "SELECT 
                    COUNT(DISTINCT b.id) AS total_bookings,
                    SUM(CASE WHEN b.booking_status IN ('pending', 'contacted', 'payment_discussion', 'awaiting_confirmation') THEN 1 ELSE 0 END) AS pending_bookings,
                    SUM(CASE WHEN b.booking_status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed_bookings,
                    SUM(CASE WHEN b.booking_status = 'completed' THEN 1 ELSE 0 END) AS completed_bookings,
                    SUM(CASE WHEN b.booking_status IN ('cancelled', 'rejected') THEN 1 ELSE 0 END) AS cancelled_bookings
                FROM bookings b
                LEFT JOIN booking_customer_details bcd ON b.id = bcd.booking_id
                WHERE b.deleted_at IS NULL 
                  AND (b.user_id = :user_id OR LOWER(TRIM(bcd.email)) = :user_email)";

        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':user_id' => $userId,
            ':user_email' => $userEmail,
        ]);

        $res = $stmt->fetch(\PDO::FETCH_ASSOC);

        return [
            'total_bookings' => (int) ($res['total_bookings'] ?? 0),
            'pending_bookings' => (int) ($res['pending_bookings'] ?? 0),
            'confirmed_bookings' => (int) ($res['confirmed_bookings'] ?? 0),
            'completed_bookings' => (int) ($res['completed_bookings'] ?? 0),
            'cancelled_bookings' => (int) ($res['cancelled_bookings'] ?? 0),
        ];
    }
}
