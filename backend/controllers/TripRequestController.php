<?php

namespace App\Controllers;

use App\Models\Destination;
use App\Models\SiteSetting;
use App\Models\TripRequest;
use App\Models\Tour;
use App\Services\AuditService;
use App\Services\FileUploader;
use App\Services\MailService;
use App\Utils\Request;
use Throwable;

class TripRequestController extends BaseController
{
    private const DOCUMENT_STORAGE_CONFIG = [
        'max_file_size' => 10485760,
        'allowed_mime_types' => [
            'image/jpeg' => ['jpg', 'jpeg'],
            'image/png' => ['png'],
            'application/pdf' => ['pdf'],
        ],
        'allowed_extensions' => ['jpg', 'jpeg', 'png', 'pdf'],
        'disallowed_extensions' => [
            'php', 'php3', 'php4', 'php5', 'php7', 'php8', 'phtml', 'phar',
            'exe', 'sh', 'bat', 'cmd', 'js', 'html', 'htm', 'cgi', 'pl', 'py',
            'jar', 'vbs', 'dll', 'bin', 'msi', 'com', 'scr', 'ps1',
        ],
    ];

    /**
     * Submit a new trip request. Public endpoint.
     * POST /api/v1/trip-requests
     *
     * @return void
     */
    public function store(): void
    {
        $body = Request::getBody();

        // Honeypot: a hidden field real visitors never fill. Bots that fill
        // every field get a fake success response, no record is created.
        if (!empty($body['website'])) {
            $this->success(['reference_id' => TripRequest::generateReferenceId()], 'Trip request submitted successfully', 201);
            return;
        }

        $ip = $_SERVER['REMOTE_ADDR'] ?? '';
        if (TripRequest::exceedsIpRateLimit($ip)) {
            $this->error('Too many trip requests submitted recently. Please try again later.', 429, null, 'RATE_LIMITED');
            return;
        }

        $errors = $this->validate($body);
        if (!empty($errors)) {
            $this->error('Validation failed. Please correct the errors in the request.', 422, $errors, 'VALIDATION_ERROR');
            return;
        }

        $email = trim((string) $body['email']);
        if (TripRequest::hasRecentDuplicate($email)) {
            $this->error('A similar trip request was already submitted moments ago. Please wait before submitting again.', 429, null, 'DUPLICATE_SUBMISSION');
            return;
        }

        // Server-validate prefill query params / body hints — never trust them blindly.
        $destinationId = null;
        if (!empty($body['destination_slug'])) {
            $destination = Destination::findBySlug((string) $body['destination_slug']);
            $destinationId = $destination['id'] ?? null;
        } elseif (!empty($body['destination_id'])) {
            $destination = Destination::findById((int) $body['destination_id']);
            $destinationId = $destination['id'] ?? null;
        }

        $tourId = null;
        if (!empty($body['tour_slug'])) {
            $tour = Tour::findBySlug((string) $body['tour_slug']);
            $tourId = $tour['id'] ?? null;
            if ($tour && !$destinationId) {
                $destinationId = $tour['destination_id'] ?? null;
            }
        } elseif (!empty($body['tour_id'])) {
            $tour = Tour::findById((int) $body['tour_id']);
            $tourId = $tour['id'] ?? null;
            if ($tour && !$destinationId) {
                $destinationId = $tour['destination_id'] ?? null;
            }
        }

        $preferredCategories = [];
        if (!empty($body['preferred_categories'])) {
            $raw = is_array($body['preferred_categories'])
                ? $body['preferred_categories']
                : explode(',', (string) $body['preferred_categories']);
            $preferredCategories = TripRequest::filterValidCategorySlugs($raw);
        }

        $data = [
            'full_name' => trim((string) $body['full_name']),
            'email' => $email,
            'phone' => trim((string) $body['phone']),
            'whatsapp_number' => !empty($body['whatsapp_number']) ? trim((string) $body['whatsapp_number']) : null,
            'preferred_contact_method' => in_array($body['preferred_contact_method'] ?? '', TripRequest::ALLOWED_CONTACT_METHODS, true)
                ? $body['preferred_contact_method'] : 'email',
            'destination_id' => $destinationId,
            'tour_id' => $tourId,
            'trip_start_date' => $body['trip_start_date'] ?? null,
            'trip_end_date' => $body['trip_end_date'] ?? null,
            'duration_days' => !empty($body['duration_days']) ? (int) $body['duration_days'] : null,
            'trip_notes' => $body['trip_notes'] ?? null,
            'adults_count' => max(1, (int) ($body['adults_count'] ?? 1)),
            'children_count' => max(0, (int) ($body['children_count'] ?? 0)),
            'infants_count' => max(0, (int) ($body['infants_count'] ?? 0)),
            'preferred_categories' => !empty($preferredCategories) ? implode(',', $preferredCategories) : null,
            'special_interests' => $body['special_interests'] ?? null,
            'transportation_mode' => in_array($body['transportation_mode'] ?? '', TripRequest::ALLOWED_TRANSPORTATION_MODES, true)
                ? $body['transportation_mode'] : 'not_sure',
            'needs_airport_pickup' => !empty($body['needs_airport_pickup']),
            'accommodation_type' => in_array($body['accommodation_type'] ?? '', TripRequest::ALLOWED_ACCOMMODATION_TYPES, true)
                ? $body['accommodation_type'] : 'not_sure',
            'accommodation_notes' => $body['accommodation_notes'] ?? null,
            'arrival_mode' => in_array($body['arrival_mode'] ?? '', TripRequest::ALLOWED_ARRIVAL_MODES, true)
                ? $body['arrival_mode'] : 'none',
            'arrival_details' => $body['arrival_details'] ?? null,
            'arrival_datetime' => !empty($body['arrival_datetime']) ? $body['arrival_datetime'] : null,
            'departure_mode' => in_array($body['departure_mode'] ?? '', TripRequest::ALLOWED_ARRIVAL_MODES, true)
                ? $body['departure_mode'] : 'none',
            'departure_details' => $body['departure_details'] ?? null,
            'departure_datetime' => !empty($body['departure_datetime']) ? $body['departure_datetime'] : null,
            'budget_amount' => isset($body['budget_amount']) && $body['budget_amount'] !== '' ? (float) $body['budget_amount'] : null,
            'budget_currency' => $body['budget_currency'] ?? null,
            'budget_notes' => $body['budget_notes'] ?? null,
            'source_ip' => $ip,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
        ];

        $documents = [];
        try {
            foreach (['passport', 'flight_ticket'] as $docField) {
                if (!empty($_FILES[$docField]) && ($_FILES[$docField]['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
                    $uploader = new FileUploader(array_merge(self::DOCUMENT_STORAGE_CONFIG, [
                        'storage_path' => self::documentStorageDir(),
                    ]));
                    $result = $uploader->upload($_FILES[$docField]);
                    $documents[] = [
                        'document_type' => $docField,
                        'original_name' => $result['original_name'],
                        'stored_filename' => $result['filename'],
                        'mime_type' => $result['mime_type'],
                        'file_size' => $result['file_size'],
                    ];
                }
            }
        } catch (Throwable $e) {
            $this->error('Document upload failed: ' . $e->getMessage(), 422, null, 'DOCUMENT_UPLOAD_FAILED');
            return;
        }

        try {
            $created = TripRequest::create($data, $documents);
        } catch (Throwable $e) {
            $this->error('Failed to submit trip request: ' . $e->getMessage(), 500, null, 'CREATE_TRIP_REQUEST_FAILED');
            return;
        }

        $tripRequest = TripRequest::findById($created['id']);

        $emailStatus = 'not_configured';
        if (MailService::isConfigured()) {
            $emailStatus = MailService::sendTripRequestReceived($tripRequest) ? 'sent' : 'failed';
        }
        TripRequest::updateEmailStatus($created['id'], $emailStatus);

        AuditService::log(null, 'trip_request_create', 'trip_request', $created['id'], null, $data);

        $this->success([
            'id' => $created['id'],
            'reference_id' => $created['reference_id'],
            'email_status' => $emailStatus,
            'whatsapp_link' => $this->buildWhatsAppLink($tripRequest, false),
        ], 'Trip request submitted successfully', 201);
    }

    /**
     * List trip requests with filters, pagination, and KPI counts. Admin only.
     * GET /api/v1/trip-requests
     *
     * @return void
     */
    public function index(): void
    {
        $params = Request::getQueryParams();

        $page = isset($params['page']) ? (int) $params['page'] : 1;
        $limit = isset($params['limit']) ? (int) $params['limit'] : 20;

        $filters = [
            'status' => $params['status'] ?? null,
            'destination_id' => $params['destination_id'] ?? null,
            'search' => $params['search'] ?? null,
            'date_from' => $params['date_from'] ?? null,
            'date_to' => $params['date_to'] ?? null,
            'sort_by' => $params['sort_by'] ?? 'created_at',
            'order' => $params['order'] ?? 'DESC',
        ];

        $result = TripRequest::paginate($filters, $page, $limit);

        $this->success(
            $result['items'],
            'Trip requests retrieved successfully',
            200,
            ['pagination' => $result['pagination']]
        );
    }

    /**
     * KPI summary counts by status. Admin only.
     * GET /api/v1/trip-requests/kpi-summary
     *
     * @return void
     */
    public function kpiSummary(): void
    {
        $this->success(TripRequest::kpiCounts(), 'KPI summary retrieved successfully');
    }

    /**
     * Public, safe-fields-only lookup by reference ID (e.g. a "thank you" page).
     * Never exposes documents or admin_notes.
     * GET /api/v1/trip-requests/reference/{referenceId}
     *
     * @param string $referenceId
     * @return void
     */
    public function showByReference(string $referenceId): void
    {
        $tripRequest = TripRequest::findByReference($referenceId);

        if (!$tripRequest) {
            $this->error('Trip request not found.', 404, null, 'TRIP_REQUEST_NOT_FOUND');
            return;
        }

        $this->success([
            'reference_id' => $tripRequest['reference_id'],
            'full_name' => $tripRequest['full_name'],
            'destination_name' => $tripRequest['destination_name'],
            'tour_title' => $tripRequest['tour_title'],
            'trip_start_date' => $tripRequest['trip_start_date'],
            'trip_end_date' => $tripRequest['trip_end_date'],
            'status' => $tripRequest['status'],
            'email_status' => $tripRequest['email_status'],
            'created_at' => $tripRequest['created_at'],
        ], 'Trip request retrieved successfully');
    }

    /**
     * Full detail view including status history and document metadata. Admin only.
     * GET /api/v1/trip-requests/{id}
     *
     * @param string $id
     * @return void
     */
    public function show(string $id): void
    {
        $tripRequest = TripRequest::findById((int) $id);

        if (!$tripRequest) {
            $this->error('Trip request not found.', 404, null, 'TRIP_REQUEST_NOT_FOUND');
            return;
        }

        $tripRequest['status_history'] = TripRequest::getStatusHistory((int) $id);
        $tripRequest['documents'] = TripRequest::getDocuments((int) $id);
        $tripRequest['whatsapp_link'] = $this->buildWhatsAppLink($tripRequest, false);
        $tripRequest['admin_whatsapp_link'] = $this->buildWhatsAppLink($tripRequest, true);

        $this->success($tripRequest, 'Trip request retrieved successfully');
    }

    /**
     * Update editable fields (not status — use the dedicated status endpoint). Admin only.
     * PATCH/PUT /api/v1/trip-requests/{id}
     *
     * @param string $id
     * @return void
     */
    public function update(string $id): void
    {
        $tripRequestId = (int) $id;
        $existing = TripRequest::findById($tripRequestId);

        if (!$existing) {
            $this->error('Trip request not found.', 404, null, 'TRIP_REQUEST_NOT_FOUND');
            return;
        }

        $body = Request::getBody();
        $errors = [];

        if (array_key_exists('full_name', $body) && trim((string) $body['full_name']) === '') {
            $errors['full_name'] = 'Full name cannot be blank.';
        }

        if (array_key_exists('email', $body) && !filter_var($body['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'A valid email address is required.';
        }

        if (!empty($errors)) {
            $this->error('Validation failed. Please correct the errors in the request.', 422, $errors, 'VALIDATION_ERROR');
            return;
        }

        $allowedFields = [
            'full_name', 'email', 'phone', 'whatsapp_number', 'preferred_contact_method',
            'trip_start_date', 'trip_end_date', 'duration_days', 'trip_notes',
            'adults_count', 'children_count', 'infants_count', 'special_interests',
            'transportation_mode', 'needs_airport_pickup', 'accommodation_type', 'accommodation_notes',
            'arrival_mode', 'arrival_details', 'arrival_datetime',
            'departure_mode', 'departure_details', 'departure_datetime',
            'budget_amount', 'budget_currency', 'budget_notes',
        ];

        $fields = [];
        $params = [':id' => $tripRequestId];
        foreach ($allowedFields as $col) {
            if (array_key_exists($col, $body)) {
                $fields[] = "`{$col}` = :{$col}";
                $params[":{$col}"] = $body[$col];
            }
        }

        if (!empty($fields)) {
            $fields[] = '`updated_at` = NOW()';
            $sql = 'UPDATE `trip_requests` SET ' . implode(', ', $fields) . ' WHERE `id` = :id';
            \App\Utils\Database::getConnection()->prepare($sql)->execute($params);
        }

        $updated = TripRequest::findById($tripRequestId);

        $userId = Request::getUserId();
        AuditService::log($userId, 'trip_request_update', 'trip_request', $tripRequestId, $existing, $updated);

        $this->success($updated, 'Trip request updated successfully');
    }

    /**
     * Change status with a logged history entry. Admin only.
     * PATCH /api/v1/trip-requests/{id}/status
     *
     * @param string $id
     * @return void
     */
    public function updateStatus(string $id): void
    {
        $tripRequestId = (int) $id;
        $body = Request::getBody();

        $newStatus = (string) ($body['status'] ?? '');
        if (!in_array($newStatus, TripRequest::ALLOWED_STATUSES, true)) {
            $this->error('Invalid status. Allowed values: ' . implode(', ', TripRequest::ALLOWED_STATUSES) . '.', 422, null, 'VALIDATION_ERROR');
            return;
        }

        $existing = TripRequest::findById($tripRequestId);
        if (!$existing) {
            $this->error('Trip request not found.', 404, null, 'TRIP_REQUEST_NOT_FOUND');
            return;
        }

        $userId = Request::getUserId();
        $note = !empty($body['note']) ? (string) $body['note'] : null;

        TripRequest::updateStatus($tripRequestId, $newStatus, $userId, $note);

        $updated = TripRequest::findById($tripRequestId);
        AuditService::log($userId, 'trip_request_status_change', 'trip_request', $tripRequestId, ['status' => $existing['status']], ['status' => $newStatus]);

        $this->success($updated, 'Trip request status updated successfully');
    }

    /**
     * Append an admin note without changing status. Admin only.
     * POST /api/v1/trip-requests/{id}/notes
     *
     * @param string $id
     * @return void
     */
    public function addNote(string $id): void
    {
        $tripRequestId = (int) $id;
        $body = Request::getBody();
        $note = trim((string) ($body['note'] ?? ''));

        if ($note === '') {
            $this->error('Note text is required.', 422, ['note' => 'Note text is required.'], 'VALIDATION_ERROR');
            return;
        }

        $userId = Request::getUserId();
        $added = TripRequest::addNote($tripRequestId, $note, $userId);

        if (!$added) {
            $this->error('Trip request not found.', 404, null, 'TRIP_REQUEST_NOT_FOUND');
            return;
        }

        AuditService::log($userId, 'trip_request_note_add', 'trip_request', $tripRequestId, null, ['note' => $note]);

        $this->success(TripRequest::findById($tripRequestId), 'Note added successfully');
    }

    /**
     * Full status-change timeline. Admin only.
     * GET /api/v1/trip-requests/{id}/timeline
     *
     * @param string $id
     * @return void
     */
    public function timeline(string $id): void
    {
        $tripRequestId = (int) $id;
        if (!TripRequest::findById($tripRequestId)) {
            $this->error('Trip request not found.', 404, null, 'TRIP_REQUEST_NOT_FOUND');
            return;
        }

        $this->success(TripRequest::getStatusHistory($tripRequestId), 'Timeline retrieved successfully');
    }

    /**
     * Download a privately stored document (passport/flight ticket). Admin only
     * — never a publicly accessible URL. Route-gated by PermissionMiddleware
     * (trip_requests.manage), same as every other admin trip-request endpoint.
     * GET /api/v1/trip-requests/{id}/documents/{documentId}/download
     *
     * @param string $id
     * @param string $documentId
     * @return void
     */
    public function downloadDocument(string $id, string $documentId): void
    {
        $tripRequestId = (int) $id;
        $document = TripRequest::findDocument((int) $documentId, $tripRequestId);

        if (!$document) {
            $this->error('Document not found.', 404, null, 'DOCUMENT_NOT_FOUND');
            return;
        }

        $filePath = rtrim(self::documentStorageDir(), '/\\') . DIRECTORY_SEPARATOR . $document['stored_filename'];
        if (!file_exists($filePath)) {
            $this->error('Document file is missing from storage.', 404, null, 'DOCUMENT_FILE_MISSING');
            return;
        }

        $userId = Request::getUserId();
        AuditService::log($userId, 'trip_request_document_download', 'trip_request_document', (int) $documentId, null, null);

        while (ob_get_level() > 0) {
            ob_end_clean();
        }

        header('Content-Type: ' . $document['mime_type']);
        header('Content-Disposition: attachment; filename="' . basename($document['original_name']) . '"');
        header('Content-Length: ' . filesize($filePath));
        readfile($filePath);
        exit;
    }

    /**
     * Soft-delete a trip request. Admin only.
     * DELETE /api/v1/trip-requests/{id}
     *
     * @param string $id
     * @return void
     */
    public function destroy(string $id): void
    {
        $tripRequestId = (int) $id;
        $existing = TripRequest::findById($tripRequestId);

        if (!$existing) {
            $this->error('Trip request not found.', 404, null, 'TRIP_REQUEST_NOT_FOUND');
            return;
        }

        TripRequest::delete($tripRequestId);

        $userId = Request::getUserId();
        AuditService::log($userId, 'trip_request_delete', 'trip_request', $tripRequestId, $existing, null);

        $this->success(null, 'Trip request deleted successfully');
    }

    private function validate(array $body): array
    {
        $errors = [];

        if (empty($body['full_name']) || trim((string) $body['full_name']) === '') {
            $errors['full_name'] = 'Full name is required.';
        } elseif (mb_strlen((string) $body['full_name']) > 150) {
            $errors['full_name'] = 'Full name cannot exceed 150 characters.';
        }

        if (empty($body['email']) || !filter_var($body['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'A valid email address is required.';
        }

        if (empty($body['phone']) || trim((string) $body['phone']) === '') {
            $errors['phone'] = 'A contact phone number is required.';
        }

        foreach (['trip_start_date', 'trip_end_date'] as $dateField) {
            if (!empty($body[$dateField]) && !\DateTime::createFromFormat('Y-m-d', (string) $body[$dateField])) {
                $errors[$dateField] = 'Date must be in YYYY-MM-DD format.';
            }
        }

        if (!empty($body['trip_start_date']) && !empty($body['trip_end_date']) && empty($errors['trip_start_date']) && empty($errors['trip_end_date'])) {
            if ($body['trip_end_date'] < $body['trip_start_date']) {
                $errors['trip_end_date'] = 'Trip end date cannot be before the start date.';
            }
        }

        if (isset($body['budget_amount']) && $body['budget_amount'] !== '' && !is_numeric($body['budget_amount'])) {
            $errors['budget_amount'] = 'Budget amount must be a number.';
        }

        return $errors;
    }

    private function buildWhatsAppLink(array $tripRequest, bool $forAdmin): string
    {
        $setting = SiteSetting::findByKey('contact_whatsapp');
        $number = preg_replace('/\D/', '', (string) ($setting['setting_value'] ?? '918072566010'));

        if ($forAdmin) {
            $message = "Hi {$tripRequest['full_name']}, this is Wanderer South India regarding your trip request {$tripRequest['reference_id']}.";
        } else {
            $message = "Hi Wanderer South India, I'd like to follow up on my trip request {$tripRequest['reference_id']}.";
        }

        return 'https://wa.me/' . $number . '?text=' . rawurlencode($message);
    }

    private static function documentStorageDir(): string
    {
        $dir = dirname(__DIR__) . '/storage/trip_documents';
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        return $dir;
    }
}
