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
        $phone = trim((string) ($body['phone'] ?? ''));
        $message = trim((string) ($body['message'] ?? ''));

        if (empty($name)) {
            $this->error('Full name is required.', 422, ['name' => 'Name cannot be blank.']);
            return;
        }

        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('A valid email address is required.', 422, ['email' => 'Please provide a valid email address.']);
            return;
        }

        if (empty($phone)) {
            $this->error('Contact phone number is required.', 422, ['phone' => 'Please provide a phone number for communication.']);
            return;
        }

        $inquiryId = Inquiry::create([
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'subject' => !empty($body['subject']) ? $body['subject'] : (!empty($body['tour_title']) ? 'Inquiry for ' . $body['tour_title'] : (!empty($body['tour']) ? 'Inquiry for ' . $body['tour'] : 'Website Travel Inquiry')),
            'message' => $message ?: 'Customer submitted travel planning inquiry.',
            'tour_id' => !empty($body['tour_id']) ? (int) $body['tour_id'] : null,
            'destination_id' => !empty($body['destination_id']) ? (int) $body['destination_id'] : null,
            'destination_name' => !empty($body['destination']) ? $body['destination'] : ($body['destination_name'] ?? null),
            'tour_title' => !empty($body['tour']) ? $body['tour'] : ($body['tour_title'] ?? null),
            'tour_slug' => !empty($body['tour_slug']) ? $body['tour_slug'] : null,
            'destination_slug' => !empty($body['destination_slug']) ? $body['destination_slug'] : null,
            'travel_date' => !empty($body['travelDate']) ? $body['travelDate'] : ($body['travel_date'] ?? null),
            'travelers' => !empty($body['travelers']) ? (int) $body['travelers'] : 1,
            'status' => 'new',
        ]);

        $created = Inquiry::find($inquiryId);

        $this->success(
            $created,
            'Thank you! Your travel inquiry has been received. Our coordinator will contact you shortly.',
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

        Inquiry::updateStatus($inquiryId, $status, $adminNotes);

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
