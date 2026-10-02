<?php

namespace App\Controllers;

use App\Models\Inquiry;
use App\Utils\Request;
use App\Utils\Response;

class InquiryController extends BaseController
{
    /**
     * Public Submission Endpoint: Store customer inquiry.
     * POST /api/v1/inquiries
     * POST /api/v1/contact-messages
     *
     * @return void
     */
    public function store(): void
    {
        $body = Request::getBody();

        $name = trim((string) ($body['name'] ?? ''));
        $email = trim((string) ($body['email'] ?? ''));
        $phone = trim((string) ($body['phone'] ?? $body['whatsapp_number'] ?? ''));
        $whatsappNumber = trim((string) ($body['whatsapp_number'] ?? $body['phone'] ?? ''));
        $message = trim((string) ($body['message'] ?? $body['special_requests'] ?? ''));

        // 1. Full name validation
        if (empty($name)) {
            $this->error('Full name is required.', 422, ['name' => 'Name cannot be blank.']);
            return;
        }

        // 2. Phone / WhatsApp validation
        $rawPhoneDigits = preg_replace('/\D/', '', $phone ?: $whatsappNumber);
        if (empty($phone) && empty($whatsappNumber)) {
            $this->error('WhatsApp or contact phone number is required.', 422, ['phone' => 'Please provide a contact number for quotation delivery.']);
            return;
        } elseif (strlen($rawPhoneDigits) < 7) {
            $this->error('Invalid phone number format.', 422, ['phone' => 'Phone number must contain at least 7 valid digits including country code.']);
            return;
        }

        // 3. Email validation
        if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Invalid email address format.', 422, ['email' => 'Please provide a valid email address.']);
            return;
        }
        if (empty($email)) {
            $email = 'guest_' . time() . '@wonderersouthindia.in';
        }

        // 4. Date validation (departure >= arrival)
        $arrivalDate = !empty($body['arrival_date']) ? trim((string)$body['arrival_date']) : null;
        $departureDate = !empty($body['departure_date']) ? trim((string)$body['departure_date']) : null;
        if ($arrivalDate && $departureDate && $departureDate < $arrivalDate) {
            $this->error('Departure date cannot be before arrival date.', 422, ['departure_date' => 'Departure date cannot be earlier than arrival date.']);
            return;
        }

        // 5. Enum validations
        $allowedHotels = ['Standard (3-Star)', 'Deluxe (4-Star)', 'Luxury Heritage (5-Star)', 'Boutique Resorts / Homestays', 'Standard', 'Deluxe', 'Luxury', 'Heritage'];
        $hotelCat = !empty($body['hotel_category']) ? trim((string)$body['hotel_category']) : null;
        if ($hotelCat && !in_array($hotelCat, $allowedHotels, true)) {
            $this->error('Invalid hotel category selected.', 422, ['hotel_category' => 'Please choose a valid hotel category from the list.']);
            return;
        }

        $allowedCurrencies = ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'AED'];
        $budgetCurr = !empty($body['budget_currency']) ? trim((string)$body['budget_currency']) : 'INR';
        if ($budgetCurr && !in_array($budgetCurr, $allowedCurrencies, true)) {
            $this->error('Invalid budget currency selected.', 422, ['budget_currency' => 'Please choose a supported currency code.']);
            return;
        }

        // Duplicate Submission Guard (15 seconds window) - Generic message only (no reference_id leak)
        $dupCheck = Inquiry::findDuplicateRecent($phone ?: $whatsappNumber, $email, 15);
        if ($dupCheck) {
            $this->error('Duplicate request detected. Your travel inquiry has already been recorded and is currently being processed.', 409);
            return;
        }

        // Type definition: general contact form submissions vs trip planner requests
        $type = (!empty($body['type']) && in_array($body['type'], ['trip_request', 'general_inquiry'], true))
            ? $body['type']
            : ((!empty($body['destination']) || !empty($body['destination_name']) || !empty($body['arrival_date'])) ? 'trip_request' : 'general_inquiry');

        $inquiryId = Inquiry::create([
            'type' => $type,
            'name' => $name,
            'email' => $email,
            'phone' => $phone ?: $whatsappNumber,
            'whatsapp_number' => $whatsappNumber ?: $phone,
            'country' => !empty($body['country']) ? trim((string)$body['country']) : (!empty($body['nationality']) ? trim((string)$body['nationality']) : null),
            'subject' => !empty($body['subject']) ? $body['subject'] : (!empty($body['tour_title']) ? 'Inquiry: ' . $body['tour_title'] : (!empty($body['destination']) ? 'Trip: ' . $body['destination'] : 'Custom South India Tour Itinerary Request')),
            'message' => $message ?: 'Custom itinerary & quotation requested via Wonderer South India planner.',
            'tour_id' => !empty($body['tour_id']) ? (int) $body['tour_id'] : null,
            'destination_id' => !empty($body['destination_id']) ? (int) $body['destination_id'] : null,
            'destination_name' => !empty($body['destination_name']) ? $body['destination_name'] : (!empty($body['destination']) ? $body['destination'] : (!empty($body['destinations']) ? $body['destinations'] : null)),
            'tour_title' => !empty($body['tour_title']) ? $body['tour_title'] : (!empty($body['tour']) ? $body['tour'] : null),
            'tour_slug' => !empty($body['tour_slug']) ? $body['tour_slug'] : null,
            'destination_slug' => !empty($body['destination_slug']) ? $body['destination_slug'] : null,
            'pickup_location' => !empty($body['pickup_location']) ? trim((string)$body['pickup_location']) : null,
            'travel_date' => $arrivalDate ?: (!empty($body['travel_date']) ? $body['travel_date'] : null),
            'arrival_date' => $arrivalDate,
            'departure_date' => $departureDate,
            'duration_days' => !empty($body['duration_days']) ? $body['duration_days'] : (!empty($body['number_of_days']) ? $body['number_of_days'] : null),
            'travelers' => !empty($body['travelers']) ? (int) $body['travelers'] : 1,
            'adults_count' => isset($body['adults_count']) ? (int)$body['adults_count'] : (isset($body['adults']) ? (int)$body['adults'] : 1),
            'children_count' => isset($body['children_count']) ? (int)$body['children_count'] : (isset($body['children']) ? (int)$body['children'] : 0),
            'infants_count' => isset($body['infants_count']) ? (int)$body['infants_count'] : (isset($body['infants']) ? (int)$body['infants'] : 0),
            'vehicle_preference' => !empty($body['vehicle_preference']) ? trim((string)$body['vehicle_preference']) : (!empty($body['vehicle']) ? trim((string)$body['vehicle']) : null),
            'airport_pickup' => !empty($body['airport_pickup']),
            'airport_drop' => !empty($body['airport_drop']),
            'hotel_category' => $hotelCat,
            'rooms_count' => isset($body['rooms_count']) ? (int)$body['rooms_count'] : 1,
            'room_type' => !empty($body['room_type']) ? trim((string)$body['room_type']) : null,
            'tour_types' => !empty($body['tour_types']) ? $body['tour_types'] : (!empty($body['tour_preferences']) ? $body['tour_preferences'] : null),
            'tour_guide_required' => !empty($body['tour_guide_required']),
            'preferred_language' => !empty($body['preferred_language']) ? trim((string)$body['preferred_language']) : 'English',
            'arrival_flight_train_number' => !empty($body['arrival_flight_train_number']) ? trim((string)$body['arrival_flight_train_number']) : null,
            'arrival_time' => !empty($body['arrival_time']) ? trim((string)$body['arrival_time']) : null,
            'departure_flight_train_number' => !empty($body['departure_flight_train_number']) ? trim((string)$body['departure_flight_train_number']) : null,
            'departure_time' => !empty($body['departure_time']) ? trim((string)$body['departure_time']) : null,
            'approximate_budget' => !empty($body['approximate_budget']) ? trim((string)$body['approximate_budget']) : null,
            'budget_currency' => $budgetCurr,
            'passport_file_url' => !empty($body['passport_file_url']) ? trim((string)$body['passport_file_url']) : null,
            'flight_ticket_url' => !empty($body['flight_ticket_url']) ? trim((string)$body['flight_ticket_url']) : null,
            'preferred_contact_methods' => !empty($body['preferred_contact_methods']) ? $body['preferred_contact_methods'] : null,
            'status' => 'new',
        ]);

        $created = Inquiry::find($inquiryId);

        $this->success(
            $created,
            'Thank you! Your custom travel plan request has been received. Our South India holiday expert will send your tailored itinerary & quote promptly.',
            201
        );
    }

    /**
     * Admin: List Inquiries with search, filters, and pagination.
     * GET /api/v1/inquiries
     *
     * @return void
     */
    public function index(): void
    {
        $queryParams = Request::getQueryParams();

        $page = max(1, (int) ($queryParams['page'] ?? 1));
        $limit = max(1, min(100, (int) ($queryParams['limit'] ?? 20)));

        $filters = [
            'type' => !empty($queryParams['type']) ? trim((string) $queryParams['type']) : 'trip_request',
            'search' => trim((string) ($queryParams['search'] ?? '')),
            'status' => trim((string) ($queryParams['status'] ?? '')),
            'destination_id' => isset($queryParams['destination_id']) && is_numeric($queryParams['destination_id']) ? (int) $queryParams['destination_id'] : null,
            'tour_id' => isset($queryParams['tour_id']) && is_numeric($queryParams['tour_id']) ? (int) $queryParams['tour_id'] : null,
            'date_from' => trim((string) ($queryParams['date_from'] ?? '')),
            'date_to' => trim((string) ($queryParams['date_to'] ?? '')),
        ];

        $result = Inquiry::paginate($page, $limit, $filters);

        $this->success(
            $result['data'],
            'Inquiries retrieved successfully',
            200,
            ['pagination' => $result['pagination']]
        );
    }

    /**
     * Admin: Inquiry metrics.
     * GET /api/v1/inquiries/stats
     *
     * @return void
     */
    public function stats(): void
    {
        $stats = Inquiry::stats();
        $this->success($stats, 'Inquiry statistics retrieved successfully');
    }

    /**
     * Admin: Get single inquiry by ID.
     * GET /api/v1/inquiries/{id}
     *
     * @param string $id
     * @return void
     */
    public function show(string $id): void
    {
        $inquiryId = (int) $id;
        $inquiry = Inquiry::find($inquiryId);

        if (!$inquiry) {
            $this->error('Inquiry not found.', 404);
            return;
        }

        $this->success($inquiry, 'Inquiry details retrieved successfully');
    }

    /**
     * Public: Get sanitized trip request summary by reference ID or integer ID for success page.
     * GET /api/v1/inquiries/public-summary/{id}
     *
     * @param string $id
     * @return void
     */
    public function publicSummary(string $id): void
    {
        // Rate Limiter: Max 60 requests per minute per IP
        $clientIp = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $rateLimitDir = dirname(__DIR__) . '/storage/ratelimit';
        @mkdir($rateLimitDir, 0777, true);
        $rateFile = $rateLimitDir . '/rl_' . md5($clientIp . '_pubsum') . '.json';
        $now = time();
        $rateData = file_exists($rateFile) ? json_decode((string)file_get_contents($rateFile), true) : null;
        if (!is_array($rateData) || ($now - ($rateData['start'] ?? $now)) > 60) {
            $rateData = ['count' => 1, 'start' => $now];
        } else {
            $rateData['count'] = ($rateData['count'] ?? 0) + 1;
        }
        file_put_contents($rateFile, json_encode($rateData));
        if ($rateData['count'] > 60) {
            $this->error('Too many requests. Please slow down.', 429);
            return;
        }

        // Lookup by token or reference ID
        $inquiry = null;
        if (strlen($id) === 32 && ctype_xdigit($id)) {
            $inquiry = Inquiry::findByToken($id);
        }

        if (!$inquiry) {
            $numericId = (int) (strrpos($id, '-') !== false ? substr($id, strrpos($id, '-') + 1) : preg_replace('/\D/', '', $id));
            $inquiry = $numericId > 0 ? Inquiry::find($numericId) : null;
        }

        if (!$inquiry) {
            $this->error('Trip request not found or reference is invalid.', 404);
            return;
        }

        $createdYear = !empty($inquiry['created_at']) ? date('Y', strtotime($inquiry['created_at'])) : date('Y');
        $referenceId = 'TRP-' . $createdYear . '-' . str_pad((string)$inquiry['id'], 6, '0', STR_PAD_LEFT);

        // Extract first name only for safe greeting without leaking full PII
        $fullName = trim($inquiry['name'] ?? '');
        $firstName = explode(' ', $fullName)[0] ?: 'Traveler';

        // Calculate safe masked email without exposing full PII
        $maskedEmail = null;
        if (!empty($inquiry['email'])) {
            $parts = explode('@', (string)$inquiry['email']);
            if (count($parts) === 2) {
                $u = $parts[0];
                $d = $parts[1];
                $maskedU = (strlen($u) <= 2) ? (substr($u, 0, 1) . '***') : (substr($u, 0, 1) . '***' . substr($u, -1));
                $maskedEmail = $maskedU . '@' . $d;
            }
        }

        // Return strictly minimal non-sensitive summary for customer confirmation view
        $summary = [
            'reference_id' => $referenceId,
            'public_token' => $inquiry['public_token'] ?? null,
            'first_name' => $firstName,
            'masked_email' => $maskedEmail,
            'destination_name' => $inquiry['destination_name'] ?: 'South India',
            'arrival_date' => $inquiry['arrival_date'],
            'departure_date' => $inquiry['departure_date'],
            'duration_days' => $inquiry['duration_days'],
            'travelers' => $inquiry['travelers'],
            'adults_count' => $inquiry['adults_count'],
            'children_count' => $inquiry['children_count'],
            'infants_count' => $inquiry['infants_count'],
            'status' => $inquiry['status'],
            'email_status' => 'not_configured', // Honest email delivery gateway state
            'created_at' => $inquiry['created_at'],
        ];

        $this->success($summary, 'Trip request summary retrieved successfully');
    }

    /**
     * Admin: Protected endpoint to stream/download attached document (Passport / Flight Ticket).
     * GET /api/v1/trip-requests/{id}/documents/{type}
     *
     * @param string $id
     * @param string $type
     * @return void
     */
    public function downloadDocument(string $id, string $type = 'passport'): void
    {
        $numericId = (int) (strrpos($id, '-') !== false ? substr($id, strrpos($id, '-') + 1) : preg_replace('/\D/', '', $id));
        $inquiry = $numericId > 0 ? Inquiry::find($numericId) : null;

        if (!$inquiry) {
            $this->error('Trip request record not found.', 404);
            return;
        }

        $typeKey = strtolower(trim($type));
        $docField = ($typeKey === 'ticket' || $typeKey === 'flight_ticket' || $typeKey === 'flight')
            ? 'flight_ticket_url'
            : 'passport_file_url';

        $rawPath = $inquiry[$docField] ?? null;

        if (!$rawPath) {
            $this->error('No document file attached for ' . htmlspecialchars($typeKey) . '.', 404);
            return;
        }

        // Check if physical file exists in private storage/documents
        $storageDir = dirname(__DIR__) . '/storage/documents/';
        $cleanFileName = basename($rawPath);
        $fullPath = $storageDir . $cleanFileName;

        if (file_exists($fullPath) && is_file($fullPath)) {
            $finfo = new \finfo(FILEINFO_MIME_TYPE);
            $mimeType = $finfo->file($fullPath) ?: 'application/octet-stream';
            
            header('Content-Type: ' . $mimeType);
            header('Content-Disposition: attachment; filename="' . $cleanFileName . '"');
            header('Content-Length: ' . filesize($fullPath));
            header('Cache-Control: private, no-transform, no-store, must-revalidate');
            readfile($fullPath);
            exit;
        }

        // Return secure descriptor
        $this->success([
            'document_type' => $typeKey,
            'file_name' => $rawPath,
            'reference_id' => $inquiry['reference_id'] ?? ('TRP-' . $inquiry['id']),
            'customer_name' => $inquiry['name'],
        ], 'Document record retrieved securely');
    }

    /**
     * Admin: Update status / notes of an inquiry.
     * PUT /api/v1/inquiries/{id}
     * POST /api/v1/inquiries/{id}/status
     *
     * @param string $id
     * @return void
     */
    public function update(string $id): void
    {
        $inquiryId = (int) $id;
        $inquiry = Inquiry::find($inquiryId);

        if (!$inquiry) {
            $this->error('Inquiry not found.', 404);
            return;
        }

        $body = Request::getBody();
        $status = !empty($body['status']) ? (string) $body['status'] : $inquiry['status'];
        $adminNotes = isset($body['admin_notes']) ? (string) $body['admin_notes'] : null;
        $quotationAmount = isset($body['quotation_amount']) && is_numeric($body['quotation_amount']) ? (float) $body['quotation_amount'] : null;

        Inquiry::updateStatus($inquiryId, $status, $adminNotes, $quotationAmount);

        $updated = Inquiry::find($inquiryId);
        $this->success($updated, 'Inquiry updated successfully');
    }

    /**
     * Admin: Delete an inquiry.
     * DELETE /api/v1/inquiries/{id}
     *
     * @param string $id
     * @return void
     */
    public function destroy(string $id): void
    {
        $inquiryId = (int) $id;
        $inquiry = Inquiry::find($inquiryId);

        if (!$inquiry) {
            $this->error('Inquiry not found.', 404);
            return;
        }

        Inquiry::delete($inquiryId);
        $this->success(null, 'Inquiry deleted successfully');
    }
}
