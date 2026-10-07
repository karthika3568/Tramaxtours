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
        $middleName = trim($body['middle_name'] ?? ($body['customer']['middle_name'] ?? ''));
        $lastName = trim($body['last_name'] ?? ($body['customer']['last_name'] ?? ''));
        $email = trim($body['email'] ?? ($body['customer']['email'] ?? ''));
        $phone = trim($body['phone'] ?? ($body['customer']['phone'] ?? ''));
        $dialCode = trim($body['dial_code'] ?? ($body['customer']['dial_code'] ?? '+91'));
        $country = trim($body['country'] ?? ($body['customer']['country'] ?? ($body['billing_address']['country'] ?? 'India')));

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

        // 3. Billing Address (smart fallback to pickup location / customer country if not explicitly provided)
        $pickupLocation = trim($body['pickup_location'] ?? ($body['address_line1'] ?? ($body['billing_address']['address_line1'] ?? 'Hotel / Airport Pickup')));
        $address1 = trim($body['address_line1'] ?? ($body['billing_address']['address_line1'] ?? $pickupLocation));
        $address2 = trim($body['address_line2'] ?? ($body['billing_address']['address_line2'] ?? ''));
        $city = trim($body['city'] ?? ($body['billing_address']['city'] ?? 'Chennai'));
        $state = trim($body['state'] ?? ($body['billing_address']['state'] ?? 'Tamil Nadu'));
        $postalCode = trim($body['postal_code'] ?? ($body['billing_address']['postal_code'] ?? '600001'));
        $billingCountry = trim($body['country'] ?? ($body['billing_address']['country'] ?? $country));

        // 4. Validate Booking Date & Travelers Count
        $bookingDate = !empty($body['booking_date']) ? trim($body['booking_date']) : (!empty($body['arrival_date']) ? trim($body['arrival_date']) : date('Y-m-d'));
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $bookingDate)) {
            $errors['booking_date'] = 'Booking date must be a valid date in YYYY-MM-DD format.';
        }

        $adultsCount = isset($body['adults_count']) ? (int) $body['adults_count'] : 1;
        $childrenCount = isset($body['children_count']) ? (int) $body['children_count'] : 0;
        $infantsCount = isset($body['infants_count']) ? (int) $body['infants_count'] : 0;
        $ticketsCount = isset($body['tickets_count']) ? (int) $body['tickets_count'] : max(1, $adultsCount + $childrenCount);

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
            $currency = !empty($body['currency']) ? (string) $body['currency'] : ($tour['currency'] ?? 'INR');

            $userId = Request::getUserId();

            $bookingData = [
                'order_number' => $body['order_number'] ?? null,
                'user_id' => $userId,
                'tour_id' => $tourId,
                'pricing_tier_id' => !empty($body['pricing_tier_id']) ? (int) $body['pricing_tier_id'] : null,
                'first_name' => $firstName,
                'middle_name' => $middleName ?: null,
                'last_name' => $lastName,
                'dial_code' => $dialCode,
                'country' => $country,
                'destination_name' => $body['destination_name'] ?? ($body['destination'] ?? ($tour['title'] ?? null)),
                'pickup_location' => $pickupLocation,
                'arrival_date' => $body['arrival_date'] ?? $bookingDate,
                'departure_date' => $body['departure_date'] ?? null,
                'duration_days' => $body['duration_days'] ?? null,
                'adults_count' => $adultsCount,
                'children_count' => $childrenCount,
                'infants_count' => $infantsCount,
                'tour_types' => $body['tour_types'] ?? null,
                'tour_guide_required' => !empty($body['tour_guide_required']),
                'preferred_language' => $body['preferred_language'] ?? null,
                'vehicle_preference' => $body['vehicle_preference'] ?? null,
                'airport_pickup' => !empty($body['airport_pickup']),
                'airport_drop' => !empty($body['airport_drop']),
                'hotel_category' => $body['hotel_category'] ?? null,
                'room_type' => $body['room_type'] ?? null,
                'rooms_count' => isset($body['rooms_count']) ? (int) $body['rooms_count'] : 1,
                'arrival_flight_train_number' => $body['arrival_flight_train_number'] ?? null,
                'arrival_time' => $body['arrival_time'] ?? null,
                'departure_flight_train_number' => $body['departure_flight_train_number'] ?? null,
                'departure_time' => $body['departure_time'] ?? null,
                'approximate_budget' => $body['approximate_budget'] ?? null,
                'budget_currency' => $body['budget_currency'] ?? 'INR',
                'passport_file_url' => $body['passport_file_url'] ?? null,
                'flight_ticket_url' => $body['flight_ticket_url'] ?? null,
                'preferred_contact_methods' => $body['preferred_contact_methods'] ?? null,
                'special_requests' => $body['special_requests'] ?? ($body['customer_notes'] ?? null),
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
                'middle_name' => $middleName ?: null,
                'last_name' => $lastName,
                'dial_code' => $dialCode,
                'country' => $country,
                'email' => $email,
                'phone' => $phone,
            ];

            $billingData = [
                'address_line1' => $address1,
                'address_line2' => $address2 ?: null,
                'city' => $city,
                'state' => $state ?: null,
                'postal_code' => $postalCode,
                'country' => $billingCountry,
            ];

            $bookingResult = Booking::create($bookingData, $customerData, $billingData);
            $bookingId = is_array($bookingResult) ? (int) $bookingResult['id'] : (int) $bookingResult;
            $accessToken = is_array($bookingResult) ? ($bookingResult['access_token'] ?? null) : null;

            $createdBooking = Booking::findById($bookingId);
            if ($accessToken) {
                $createdBooking['access_token'] = $accessToken;
            }

            // Audit log
            if ($userId) {
                AuditService::log($userId, 'booking_create', 'booking', $bookingId, null, [
                    'order_number' => $createdBooking['order_number'],
                    'tour_id' => $tourId,
                    'total_price' => $totalPrice,
                ]);
            }

            // Generate the PDF receipt and dispatch customer ticket + admin copy.
            // Best-effort — a mail/PDF failure must never roll back or fail the saved booking.
            try {
                $pdfPath = PdfService::generateBookingReceipt($createdBooking);
                $receiptUrl = $this->buildReceiptUrl($bookingId, $createdBooking['order_number']);
                [$custSent, $custError] = MailService::sendCustomerTicket($createdBooking, $pdfPath, $receiptUrl);
                [$adminSent, $adminError] = MailService::sendAdminNotification($createdBooking, $pdfPath);
                Booking::recordEmailDispatchResult($bookingId, $custSent, $custError, $adminSent, $adminError);
            } catch (Throwable $e) {
                error_log('[Wanderer Booking] Automatic email dispatch failed for booking ' . $bookingId . ': ' . $e->getMessage());
                Booking::recordEmailDispatchResult($bookingId, false, $e->getMessage(), false, $e->getMessage());
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
     * Resend the booking confirmation ticket email to the customer and admin copy.
     * Protected by booking reference + unguessable access_token verification or admin session.
     * POST /api/v1/bookings/{id}/resend-confirmation
     * POST /api/v1/bookings/{id}/send-confirmation
     *
     * @param string $id
     * @return void
     */
    public function resendConfirmation(string $id): void
    {
        $id = trim($id);
        if (is_numeric($id)) {
            $booking = Booking::findById((int) $id);
        } else {
            $booking = Booking::findByOrderNumber($id);
        }

        if (!$booking) {
            $this->error('Booking not found.', 404, null, 'BOOKING_NOT_FOUND');
            return;
        }

        if (!$this->canAccessConfirmation($booking)) {
            $this->error('You do not have permission to resend this confirmation. A valid booking access token or admin credentials are required.', 403, null, 'FORBIDDEN');
            return;
        }

        $bookingId = (int) $booking['id'];

        // Atomic rate-limiting: max 3 customer sends per booking, 60s minimum cooldown gap
        [$allowed, $code, $rateLimitMsg] = Booking::claimEmailSendSlot($bookingId, 60, 3);
        if (!$allowed) {
            $this->error($rateLimitMsg ?: 'Please wait before requesting another email confirmation.', 429, null, $code);
            return;
        }

        try {
            $pdfPath = PdfService::generateBookingReceipt($booking);
            $receiptUrl = $this->buildReceiptUrl($bookingId, $booking['order_number']);

            [$custSent, $custError] = MailService::sendCustomerTicket($booking, $pdfPath, $receiptUrl);
            [$adminSent, $adminError] = MailService::sendAdminNotification($booking, $pdfPath);

            Booking::recordEmailDispatchResult($bookingId, $custSent, $custError, $adminSent, $adminError);
        } catch (Throwable $e) {
            Booking::recordEmailDispatchResult($bookingId, false, $e->getMessage(), false, $e->getMessage());
            $this->error('Failed to generate receipt or connect to mail service: ' . $e->getMessage(), 500, null, 'RESEND_FAILED');
            return;
        }

        if (!$custSent) {
            $this->error($custError ?: 'Could not send the confirmation email. Please check the mail server configuration in backend/.env.', 502, null, 'MAIL_SEND_FAILED');
            return;
        }

        $customerEmail = $booking['customer']['email'] ?? 'your registered email';
        $this->success(null, "Ticket sent to {$customerEmail}");
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

        // Check if plain access_token matches
        if ($providedToken !== '' && Booking::verifyAccessToken((int) $booking['id'], $providedToken)) {
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

    /**
     * Verify ownership before allowing confirmation resends.
     * Requires valid access_token, signed receipt token, or admin permissions.
     */
    private function canAccessConfirmation(array $booking): bool
    {
        if ($this->canAccessReceipt($booking)) {
            return true;
        }

        $body = Request::getBody();
        $token = trim((string) (
            $body['token'] 
            ?? $body['access_token'] 
            ?? Request::getQueryParams('token', '') 
            ?? Request::getQueryParams('access_token', '')
            ?? Request::getHeader('X-Access-Token') 
            ?? ''
        ));

        if ($token !== '' && Booking::verifyAccessToken((int) $booking['id'], $token)) {
            return true;
        }

        return false;
    }
}
