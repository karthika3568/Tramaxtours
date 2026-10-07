<?php

namespace App\Controllers;

use App\Models\Inquiry;
use App\Utils\Request;
use App\Utils\Response;

class InquiryController extends BaseController
{
    /**
     * Gmail enforcement rule (toggleable).
     * When true, only @gmail.com email addresses are accepted for trip inquiries.
     */
    public const REQUIRE_GMAIL = true;

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
        $errors = [];

        // 1. Name validation (First Name, Middle Name, Last Name)
        $firstName = trim((string) ($body['first_name'] ?? ''));
        $middleName = trim((string) ($body['middle_name'] ?? ''));
        $lastName = trim((string) ($body['last_name'] ?? ''));
        $legacyName = trim((string) ($body['name'] ?? ''));

        if ($firstName === '' && $lastName === '' && $legacyName !== '') {
            // Legacy client support: split legacy name
            $parts = preg_split('/\s+/', $legacyName);
            $firstName = $parts[0] ?? '';
            $lastName = count($parts) > 1 ? implode(' ', array_slice($parts, 1)) : $firstName;
        }

        $nameRegex = '/^[a-zA-Z\s\'-]+$/';

        if ($firstName === '') {
            $errors['first_name'] = 'First Name is required.';
        } elseif (mb_strlen($firstName) < 2) {
            $errors['first_name'] = 'First Name must contain at least 2 characters.';
        } elseif (!preg_match($nameRegex, $firstName)) {
            $errors['first_name'] = 'First Name can only contain letters, spaces, hyphens, and apostrophes.';
        }

        if ($middleName !== '' && !preg_match($nameRegex, $middleName)) {
            $errors['middle_name'] = 'Middle Name can only contain letters, spaces, hyphens, and apostrophes.';
        }

        if ($lastName === '') {
            $errors['last_name'] = 'Last Name is required.';
        } elseif (mb_strlen($lastName) < 2) {
            $errors['last_name'] = 'Last Name must contain at least 2 characters.';
        } elseif (!preg_match($nameRegex, $lastName)) {
            $errors['last_name'] = 'Last Name can only contain letters, spaces, hyphens, and apostrophes.';
        }

        $computedFullName = trim($firstName . ($middleName !== '' ? ' ' . $middleName : '') . ' ' . $lastName);

        // 2. Email validation (with Gmail enforcement constant)
        $email = trim((string) ($body['email'] ?? ''));
        if ($email === '') {
            $errors['email'] = 'Email address is required.';
        } elseif (self::REQUIRE_GMAIL) {
            if (!preg_match('/^[a-zA-Z0-9._%+-]+@gmail\.com$/i', $email)) {
                $errors['email'] = 'Please enter a valid Gmail address (example@gmail.com).';
            }
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Please enter a valid email address format.';
        }

        // 3. Country & Dial Code & Phone validation
        $country = trim((string) ($body['country'] ?? ($body['nationality'] ?? 'India')));
        $dialCode = trim((string) ($body['dial_code'] ?? '+91'));
        $rawPhone = trim((string) ($body['phone'] ?? ($body['whatsapp_number'] ?? '')));
        $phoneDigits = preg_replace('/\D/', '', $rawPhone);

        if ($phoneDigits === '') {
            $errors['phone'] = 'Phone / WhatsApp number is required.';
        } elseif (strlen($phoneDigits) < 7 || strlen($phoneDigits) > 15) {
            $errors['phone'] = 'Phone number must contain between 7 and 15 digits.';
        }

        // 4. Destination & Pickup Location validation (for Trip Requests)
        $destination = trim((string) ($body['destination'] ?? ($body['destination_name'] ?? '')));
        $pickupLocation = trim((string) ($body['pickup_location'] ?? ''));
        $type = (!empty($body['type']) && in_array($body['type'], ['trip_request', 'general_inquiry'], true))
            ? $body['type']
            : ((!empty($destination) || !empty($body['arrival_date'])) ? 'trip_request' : 'general_inquiry');

        if ($type === 'trip_request') {
            if ($destination === '') {
                $errors['destination'] = 'Please specify your desired destination(s).';
            }
            if ($pickupLocation === '') {
                $errors['pickup_location'] = 'Pickup location (Airport, Hotel, or City) is required.';
            }
        }

        // 5. Date validation
        $today = date('Y-m-d');
        $arrivalDate = !empty($body['arrival_date']) ? trim((string)$body['arrival_date']) : null;
        $departureDate = !empty($body['departure_date']) ? trim((string)$body['departure_date']) : null;

        if ($type === 'trip_request') {
            if (!$arrivalDate) {
                $errors['arrival_date'] = 'Arrival date is required.';
            } elseif (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $arrivalDate)) {
                $errors['arrival_date'] = 'Arrival date must be in YYYY-MM-DD format.';
            } elseif ($arrivalDate < $today) {
                $errors['arrival_date'] = 'Arrival date cannot be in the past.';
            }

            if (!$departureDate) {
                $errors['departure_date'] = 'Departure date is required.';
            } elseif (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $departureDate)) {
                $errors['departure_date'] = 'Departure date must be in YYYY-MM-DD format.';
            } elseif ($arrivalDate && $departureDate < $arrivalDate) {
                $errors['departure_date'] = 'Departure date cannot be earlier than arrival date.';
            }
        }

        // 6. Number validation
        $adultsCount = isset($body['adults_count']) ? (int)$body['adults_count'] : (isset($body['adults']) ? (int)$body['adults'] : 1);
        if ($adultsCount < 1) {
            $errors['adults_count'] = 'Number of adults must be at least 1.';
        }

        $childrenCount = isset($body['children_count']) ? (int)$body['children_count'] : 0;
        if ($childrenCount < 0) {
            $errors['children_count'] = 'Children count cannot be negative.';
        }

        $infantsCount = isset($body['infants_count']) ? (int)$body['infants_count'] : 0;
        if ($infantsCount < 0) {
            $errors['infants_count'] = 'Infants count cannot be negative.';
        }

        $roomsCount = isset($body['rooms_count']) ? (int)$body['rooms_count'] : 1;
        if ($roomsCount < 1) {
            $errors['rooms_count'] = 'Rooms count must be at least 1.';
        }

        // 7. Hotel category & budget currency enums
        $allowedHotels = [
            'Budget / Homestay', 'Standard (3-Star)', 'Deluxe (4-Star)', 'Luxury Heritage (5-Star)',
            'Boutique Resorts / Homestays', '3 Star Standard', '4 Star Premium', '5 Star Luxury',
            'Heritage / Luxury Resort', 'Standard', 'Deluxe', 'Luxury', 'Heritage'
        ];
        $hotelCat = !empty($body['hotel_category']) ? trim((string)$body['hotel_category']) : null;
        if ($hotelCat && !in_array($hotelCat, $allowedHotels, true)) {
            $errors['hotel_category'] = 'Please choose a valid hotel category from the list.';
        }

        $allowedCurrencies = ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'AED'];
        $budgetCurr = !empty($body['budget_currency']) ? trim((string)$body['budget_currency']) : 'INR';
        if ($budgetCurr && !in_array($budgetCurr, $allowedCurrencies, true)) {
            $errors['budget_currency'] = 'Please choose a supported currency code.';
        }

        // Return all field-level validation errors
        if (!empty($errors)) {
            $this->error('Validation failed. Please correct the highlighted fields.', 422, $errors, 'VALIDATION_ERROR');
            return;
        }

        $phone = $phoneDigits;
        $whatsappNumber = $phoneDigits;
        $message = trim((string) ($body['message'] ?? ($body['special_requests'] ?? '')));

        // Duplicate Submission Guard (15 seconds window)
        $dupCheck = Inquiry::findDuplicateRecent($phone, $email, 15);
        if ($dupCheck) {
            $this->error('Duplicate request detected. Your travel inquiry has already been recorded and is currently being processed.', 409);
            return;
        }

        $inquiryId = Inquiry::create([
            'type' => $type,
            'first_name' => $firstName,
            'middle_name' => $middleName ?: null,
            'last_name' => $lastName,
            'dial_code' => $dialCode,
            'name' => $computedFullName,
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
