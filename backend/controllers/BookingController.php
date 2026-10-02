<?php

namespace App\Controllers;

use App\Models\Booking;
use App\Models\Tour;
use App\Models\User;
use App\Services\AuditService;
use App\Services\MailService;
use App\Services\PdfService;
use App\Utils\Env;
use App\Utils\JWT;
use App\Utils\Request;
use Throwable;

class BookingController extends BaseController
{
    /**
     * List paginated bookings with optional search and filters.
     * GET /api/v1/bookings
     *
     * @return void
     */
    public function index(): void
    {
        $params = Request::getQueryParams();

        $page = isset($params['page']) ? (int) $params['page'] : 1;
        $limit = isset($params['limit']) ? (int) $params['limit'] : (isset($params['per_page']) ? (int) $params['per_page'] : 20);

        $filters = [
            'search' => $params['search'] ?? null,
            'status' => $params['status'] ?? null,
            'payment_status' => $params['payment_status'] ?? null,
            'tour_id' => $params['tour_id'] ?? null,
            'date_from' => $params['date_from'] ?? null,
            'date_to' => $params['date_to'] ?? null,
            'sort_by' => $params['sort_by'] ?? 'created_at',
            'order' => $params['order'] ?? 'DESC',
        ];

        $result = Booking::paginate($filters, $page, $limit);

        $this->success(
            $result['items'],
            'Bookings retrieved successfully',
            200,
            ['pagination' => $result['pagination']]
        );
    }

    /**
     * Get aggregate statistics for booking dashboard cards.
     * GET /api/v1/bookings/stats
     *
     * @return void
     */
    public function stats(): void
    {
        $stats = Booking::getStats();
        $this->success($stats, 'Booking statistics retrieved successfully');
    }

    /**
     * Retrieve a single booking by ID or Order Number.
     * GET /api/v1/bookings/{idOrOrderNumber}
     *
     * @param string $idOrOrderNumber
     * @return void
     */
    public function show(string $idOrOrderNumber): void
    {
        $idOrOrderNumber = trim($idOrOrderNumber);
        if ($idOrOrderNumber === '') {
            $this->error('Booking identifier cannot be empty.', 400, null, 'INVALID_IDENTIFIER');
        }

        if (is_numeric($idOrOrderNumber)) {
            $booking = Booking::findById((int) $idOrOrderNumber);
        } else {
            $booking = Booking::findByOrderNumber($idOrOrderNumber);
        }

        if (!$booking) {
            $this->error('Booking not found.', 404, null, 'BOOKING_NOT_FOUND');
        }

        $this->success($booking, 'Booking details retrieved successfully');
    }

    /**
     * Create a new booking (Public checkout or Admin creation).
     * POST /api/v1/bookings
     *
     * @return void
     */
    public function store(): void
    {
        $body = Request::getBody();
        $errors = [];

        // 1. Validate Tour
        $tourId = !empty($body['tour_id']) ? (int) $body['tour_id'] : null;
        if (!$tourId) {
            $errors['tour_id'] = 'Tour selection is required.';
        } else {
            $tour = Tour::findById($tourId);
            if (!$tour) {
                $errors['tour_id'] = "Referenced tour ID [{$tourId}] does not exist or has been deleted.";
            }
        }

        // 2. Validate Customer Details
        $firstName = trim($body['first_name'] ?? ($body['customer']['first_name'] ?? ''));
        $lastName = trim($body['last_name'] ?? ($body['customer']['last_name'] ?? ''));
        $email = trim($body['email'] ?? ($body['customer']['email'] ?? ''));
        $phone = trim($body['phone'] ?? ($body['customer']['phone'] ?? ''));

        if ($firstName === '') {
            $errors['first_name'] = 'Customer first name is required.';
        }
        if ($lastName === '') {
            $errors['last_name'] = 'Customer last name is required.';
        }
        if ($email === '') {
            $errors['email'] = 'Customer email address is required.';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'A valid customer email address is required.';
        }
        if ($phone === '') {
            $errors['phone'] = 'Customer contact phone number is required.';
        }

        // 3. Validate Billing Address
        $address1 = trim($body['address_line1'] ?? ($body['billing_address']['address_line1'] ?? ''));
        $address2 = trim($body['address_line2'] ?? ($body['billing_address']['address_line2'] ?? ''));
        $city = trim($body['city'] ?? ($body['billing_address']['city'] ?? ''));
        $state = trim($body['state'] ?? ($body['billing_address']['state'] ?? ''));
        $postalCode = trim($body['postal_code'] ?? ($body['billing_address']['postal_code'] ?? ''));
        $country = trim($body['country'] ?? ($body['billing_address']['country'] ?? ''));

        if ($address1 === '') {
            $errors['address_line1'] = 'Billing address line is required.';
        }
        if ($city === '') {
            $errors['city'] = 'Billing city is required.';
        }
        if ($postalCode === '') {
            $errors['postal_code'] = 'Postal / ZIP code is required.';
        }
        if ($country === '') {
            $errors['country'] = 'Billing country is required.';
        }

        // 4. Validate Booking Date & Tickets Count
        $bookingDate = !empty($body['booking_date']) ? trim($body['booking_date']) : date('Y-m-d');
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $bookingDate)) {
            $errors['booking_date'] = 'Booking date must be a valid date in YYYY-MM-DD format.';
        }

        $ticketsCount = isset($body['tickets_count']) ? (int) $body['tickets_count'] : 1;
        if ($ticketsCount < 1) {
            $errors['tickets_count'] = 'Ticket / guest count must be at least 1.';
        }

        if (!empty($errors)) {
            $this->error('Validation failed. Please correct the errors in the request.', 422, $errors, 'VALIDATION_ERROR');
        }

        try {
            // Determine Pricing
            $unitPrice = isset($body['unit_price']) ? (float) $body['unit_price'] : (float) ($tour['base_price'] ?? 0.0);
            $subtotal = isset($body['subtotal']) ? (float) $body['subtotal'] : ($unitPrice * $ticketsCount);
            $taxAmount = (float) ($body['tax_amount'] ?? 0.0);
            $discountAmount = (float) ($body['discount_amount'] ?? 0.0);
            $totalPrice = isset($body['total_price']) ? (float) $body['total_price'] : ($subtotal + $taxAmount - $discountAmount);
            $currency = !empty($body['currency']) ? (string) $body['currency'] : ($tour['currency'] ?? 'EUR');

            $userId = Request::getUserId();

            $bookingData = [
                'order_number' => $body['order_number'] ?? null,
                'user_id' => $userId,
                'tour_id' => $tourId,
                'pricing_tier_id' => !empty($body['pricing_tier_id']) ? (int) $body['pricing_tier_id'] : null,
                'booking_date' => $bookingDate,
                'tickets_count' => $ticketsCount,
                'unit_price' => $unitPrice,
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'discount_amount' => $discountAmount,
                'total_price' => $totalPrice,
                'currency' => $currency,
                'booking_status' => $body['booking_status'] ?? 'pending',
                'payment_method' => $body['payment_method'] ?? 'pay_on_arrival',
                'payment_status' => $body['payment_status'] ?? 'pending',
                'customer_notes' => $body['customer_notes'] ?? null,
                'admin_notes' => $body['admin_notes'] ?? null,
                'changed_by' => $userId,
            ];

            $customerData = [
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $email,
                'phone' => $phone,
            ];

            $billingData = [
                'address_line1' => $address1,
                'address_line2' => $address2 ?: null,
                'city' => $city,
                'state' => $state ?: null,
                'postal_code' => $postalCode,
                'country' => $country,
            ];

            $bookingId = Booking::create($bookingData, $customerData, $billingData);
            $createdBooking = Booking::findById($bookingId);

            // Audit log
            if ($userId) {
                AuditService::log($userId, 'booking_create', 'booking', $bookingId, null, [
                    'order_number' => $createdBooking['order_number'],
                    'tour_id' => $tourId,
                    'total_price' => $totalPrice,
                ]);
            }

            // Generate the PDF receipt and email it to the customer. Best-effort —
            // a mail/PDF failure must not block the booking itself from succeeding.
            try {
                $pdfPath = PdfService::generateBookingReceipt($createdBooking);
                $receiptUrl = $this->buildReceiptUrl($bookingId, $createdBooking['order_number']);
                MailService::sendBookingConfirmation($createdBooking, $pdfPath, $receiptUrl);
            } catch (Throwable $e) {
                error_log('[Wanderer Booking] Receipt generation/email failed for booking ' . $bookingId . ': ' . $e->getMessage());
            }

            $this->success($createdBooking, 'Booking placed successfully', 201);
        } catch (Throwable $e) {
            if ($e->getCode() === 409) {
                $this->error($e->getMessage(), 409, null, 'DATE_NOT_AVAILABLE');
            }
            $this->error('Failed to create booking: ' . $e->getMessage(), 500, null, 'DATABASE_ERROR');
        }
    }

    /**
     * Update booking notes or details.
     * PUT/PATCH /api/v1/bookings/{id}
     *
     * @param string $id
     * @return void
     */
    public function update(string $id): void
    {
        $id = (int) $id;
        $booking = Booking::findById($id);

        if (!$booking) {
            $this->error('Booking not found.', 404, null, 'BOOKING_NOT_FOUND');
        }

        $body = Request::getBody();

        try {
            $updateData = [];
            $allowedFields = [
                'booking_date', 'tickets_count', 'unit_price', 'subtotal',
                'tax_amount', 'discount_amount', 'total_price', 'currency',
                'booking_status', 'payment_method', 'payment_status',
                'customer_notes', 'admin_notes'
            ];

            foreach ($allowedFields as $field) {
                if (array_key_exists($field, $body)) {
                    $updateData[$field] = $body[$field];
                }
            }

            Booking::update($id, $updateData);

            $userId = Request::getUserId();
            if ($userId) {
                AuditService::log($userId, 'booking_update', 'booking', $id, null, $updateData);
            }

            $updatedBooking = Booking::findById($id);
            $this->success($updatedBooking, 'Booking updated successfully');
        } catch (Throwable $e) {
            $this->error('Failed to update booking: ' . $e->getMessage(), 500, null, 'DATABASE_ERROR');
        }
    }

    /**
     * Update status of a booking.
     * POST /api/v1/bookings/{id}/status
     *
     * @param string $id
     * @return void
     */
    public function updateStatus(string $id): void
    {
        $id = (int) $id;
        $booking = Booking::findById($id);

        if (!$booking) {
            $this->error('Booking not found.', 404, null, 'BOOKING_NOT_FOUND');
        }

        $body = Request::getBody();
        $status = $body['status'] ?? $body['booking_status'] ?? null;
        $notes = $body['notes'] ?? null;

        if (!$status || !in_array($status, Booking::ALLOWED_STATUSES, true)) {
            $this->error(
                'Invalid status. Allowed values: ' . implode(', ', Booking::ALLOWED_STATUSES) . '.',
                422,
                ['status' => 'Valid status is required.'],
                'VALIDATION_ERROR'
            );
        }

        $userId = Request::getUserId();
        $success = Booking::updateStatus($id, $status, $userId, $notes);

        if (!$success) {
            $this->error('Failed to update booking status.', 500, null, 'UPDATE_FAILED');
        }

        if ($userId) {
            AuditService::log($userId, 'booking_status_change', 'booking', $id, null, [
                'previous_status' => $booking['booking_status'],
                'new_status' => $status,
                'notes' => $notes,
            ]);
        }

        $updatedBooking = Booking::findById($id);
        $this->success($updatedBooking, "Booking status updated to '{$status}' successfully");
    }

    /**
     * Confirm a booking.
     * POST /api/v1/bookings/{id}/confirm
     *
     * @param string $id
     * @return void
     */
    public function confirm(string $id): void
    {
        $this->applyDirectStatus((int) $id, 'confirmed', 'Booking confirmed by administrator');
    }

    /**
     * Complete a booking.
     * POST /api/v1/bookings/{id}/complete
     *
     * @param string $id
     * @return void
     */
    public function complete(string $id): void
    {
        $this->applyDirectStatus((int) $id, 'completed', 'Booking marked as completed');
    }

    /**
     * Cancel a booking.
     * POST /api/v1/bookings/{id}/cancel
     *
     * @param string $id
     * @return void
     */
    public function cancel(string $id): void
    {
        $this->applyDirectStatus((int) $id, 'cancelled', 'Booking cancelled by administrator');
    }

    /**
     * Helper to apply status directly.
     *
     * @param int $id
     * @param string $status
     * @param string $defaultNotes
     * @return void
     */
    private function applyDirectStatus(int $id, string $status, string $defaultNotes): void
    {
        $booking = Booking::findById($id);
        if (!$booking) {
            $this->error('Booking not found.', 404, null, 'BOOKING_NOT_FOUND');
        }

        $body = Request::getBody();
        $notes = $body['notes'] ?? $defaultNotes;
        $userId = Request::getUserId();

        $success = Booking::updateStatus($id, $status, $userId, $notes);
        if (!$success) {
            $this->error("Failed to update status to '{$status}'.", 500, null, 'UPDATE_FAILED');
        }

        if ($userId) {
            AuditService::log($userId, 'booking_' . $status, 'booking', $id, null, [
                'previous_status' => $booking['booking_status'],
                'new_status' => $status,
                'notes' => $notes,
            ]);
        }

        $updatedBooking = Booking::findById($id);
        $this->success($updatedBooking, "Booking has been {$status} successfully");
    }

    /**
     * Soft-delete booking.
     * DELETE /api/v1/bookings/{id}
     *
     * @param string $id
     * @return void
     */
    public function destroy(string $id): void
    {
        $id = (int) $id;
        $booking = Booking::findById($id);

        if (!$booking) {
            $this->error('Booking not found.', 404, null, 'BOOKING_NOT_FOUND');
        }

        $success = Booking::delete($id);
        if (!$success) {
            $this->error('Failed to delete booking.', 500, null, 'DELETE_FAILED');
        }

        $userId = Request::getUserId();
        if ($userId) {
            AuditService::log($userId, 'booking_soft_delete', 'booking', $id, null, [
                'order_number' => $booking['order_number'],
            ]);
        }

        $this->success([
            'id' => $id,
            'order_number' => $booking['order_number'],
            'deleted_at' => date('Y-m-d H:i:s'),
        ], 'Booking deleted successfully');
    }

    /**
     * Restore soft-deleted booking.
     * POST /api/v1/bookings/{id}/restore
     *
     * @param string $id
     * @return void
     */
    public function restore(string $id): void
    {
        $id = (int) $id;
        $booking = Booking::findById($id, true);

        if (!$booking) {
            $this->error('Booking not found.', 404, null, 'BOOKING_NOT_FOUND');
        }

        if ($booking['deleted_at'] === null) {
            $this->error('Booking is already active and not deleted.', 400, null, 'NOT_DELETED');
        }

        $success = Booking::restore($id);
        if (!$success) {
            $this->error('Failed to restore booking.', 500, null, 'RESTORE_FAILED');
        }

        $userId = Request::getUserId();
        if ($userId) {
            AuditService::log($userId, 'booking_restore', 'booking', $id, null, [
                'order_number' => $booking['order_number'],
            ]);
        }

        $restoredBooking = Booking::findById($id);
        $this->success($restoredBooking, 'Booking restored successfully');
    }

    /**
     * Stream the booking confirmation PDF. Access is granted to:
     *  - the authenticated customer who owns the booking,
     *  - a staff member with `bookings.view` permission,
     *  - or anyone presenting the signed `token` query param sent in the
     *    confirmation email (so the link keeps working from a fresh browser
     *    with no session, without making receipts guessable/public).
     * GET /api/v1/bookings/{id}/receipt
     *
     * @param string $id
     * @return void
     */
    public function receipt(string $id): void
    {
        $bookingId = (int) $id;
        $booking = Booking::findById($bookingId);

        if (!$booking) {
            $this->error('Booking not found.', 404, null, 'BOOKING_NOT_FOUND');
        }

        if (!$this->canAccessReceipt($booking)) {
            $this->error('You do not have permission to access this receipt.', 403, null, 'FORBIDDEN');
        }

        try {
            $pdfPath = PdfService::receiptPathFor($booking['order_number']);
            if (!file_exists($pdfPath)) {
                $pdfPath = PdfService::generateBookingReceipt($booking);
            }
        } catch (Throwable $e) {
            $this->error('Failed to generate receipt: ' . $e->getMessage(), 500, null, 'RECEIPT_GENERATION_FAILED');
            return;
        }

        while (ob_get_level() > 0) {
            ob_end_clean();
        }

        header('Content-Type: application/pdf');
        header('Content-Disposition: inline; filename="WandererSouthIndia-Receipt-' . $booking['order_number'] . '.pdf"');
        header('Content-Length: ' . filesize($pdfPath));
        readfile($pdfPath);
        exit;
    }

    /**
     * Resend the booking confirmation email (with PDF attached) to the customer.
     * POST /api/v1/bookings/{id}/resend-confirmation
     *
     * @param string $id
     * @return void
     */
    public function resendConfirmation(string $id): void
    {
        $bookingId = (int) $id;
        $booking = Booking::findById($bookingId);

        if (!$booking) {
            $this->error('Booking not found.', 404, null, 'BOOKING_NOT_FOUND');
        }

        if (!$this->canAccessReceipt($booking)) {
            $this->error('You do not have permission to resend this confirmation.', 403, null, 'FORBIDDEN');
        }

        try {
            $pdfPath = PdfService::generateBookingReceipt($booking);
            $receiptUrl = $this->buildReceiptUrl($bookingId, $booking['order_number']);
            $sent = MailService::sendBookingConfirmation($booking, $pdfPath, $receiptUrl);
        } catch (Throwable $e) {
            $this->error('Failed to resend confirmation: ' . $e->getMessage(), 500, null, 'RESEND_FAILED');
            return;
        }

        if (!$sent) {
            $this->error('Could not send the confirmation email. Please check the mail server configuration.', 502, null, 'MAIL_SEND_FAILED');
        }

        $this->success(null, 'Confirmation email resent successfully');
    }

    /**
     * Compute the signed token used to authorize the emailed receipt link
     * without requiring the customer to be logged in.
     */
    private function receiptToken(int $bookingId, string $orderNumber): string
    {
        $secret = (string) Env::get('JWT_SECRET', 'wanderer_default_secret_key_change_in_production_12345');
        return hash_hmac('sha256', $bookingId . '|' . $orderNumber, $secret);
    }

    private function buildReceiptUrl(int $bookingId, string $orderNumber): string
    {
        $appUrl = rtrim((string) Env::get('APP_URL', 'http://localhost:8080'), '/');
        $token = $this->receiptToken($bookingId, $orderNumber);
        return "{$appUrl}/api/v1/bookings/{$bookingId}/receipt?token={$token}";
    }

    private function canAccessReceipt(array $booking): bool
    {
        $providedToken = (string) Request::getQueryParams('token', '');
        if ($providedToken !== '' && hash_equals($this->receiptToken($booking['id'], $booking['order_number']), $providedToken)) {
            return true;
        }

        $authHeader = Request::getHeader('Authorization');
        if ($authHeader && preg_match('/^Bearer\s+(.*?)$/i', trim($authHeader), $matches)) {
            try {
                $payload = JWT::decode($matches[1]);
                $userId = (int) ($payload['sub'] ?? $payload['user_id'] ?? 0);
                if ($userId && $userId === (int) $booking['user_id']) {
                    return true;
                }

                $user = User::findById($userId);
                if ($user && $user['status'] === 'active') {
                    $permissions = User::getUserPermissions($userId);
                    if (in_array('bookings.view', $permissions, true)) {
                        return true;
                    }
                }
            } catch (Throwable $e) {
                // fall through to deny
            }
        }

        return false;
    }
}
