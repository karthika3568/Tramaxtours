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

        if (empty($name)) {
            $this->error('Full name is required.', 422, ['name' => 'Name cannot be blank.']);
            return;
        }

        if (empty($phone) && empty($whatsappNumber)) {
            $this->error('WhatsApp or contact phone number is required.', 422, ['phone' => 'Please provide a contact number for quotation delivery.']);
            return;
        }

        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $email = 'guest_' . time() . '@wonderersouthindia.in';
        }

        $inquiryId = Inquiry::create([
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
            'travel_date' => !empty($body['arrival_date']) ? $body['arrival_date'] : (!empty($body['travel_date']) ? $body['travel_date'] : (!empty($body['travelDate']) ? $body['travelDate'] : null)),
            'arrival_date' => !empty($body['arrival_date']) ? $body['arrival_date'] : null,
            'departure_date' => !empty($body['departure_date']) ? $body['departure_date'] : null,
            'duration_days' => !empty($body['duration_days']) ? $body['duration_days'] : (!empty($body['number_of_days']) ? $body['number_of_days'] : null),
            'travelers' => !empty($body['travelers']) ? (int) $body['travelers'] : 1,
            'adults_count' => isset($body['adults_count']) ? (int)$body['adults_count'] : (isset($body['adults']) ? (int)$body['adults'] : 1),
            'children_count' => isset($body['children_count']) ? (int)$body['children_count'] : (isset($body['children']) ? (int)$body['children'] : 0),
            'infants_count' => isset($body['infants_count']) ? (int)$body['infants_count'] : (isset($body['infants']) ? (int)$body['infants'] : 0),
            'vehicle_preference' => !empty($body['vehicle_preference']) ? trim((string)$body['vehicle_preference']) : (!empty($body['vehicle']) ? trim((string)$body['vehicle']) : null),
            'airport_pickup' => !empty($body['airport_pickup']),
            'airport_drop' => !empty($body['airport_drop']),
            'hotel_category' => !empty($body['hotel_category']) ? trim((string)$body['hotel_category']) : null,
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
            'budget_currency' => !empty($body['budget_currency']) ? trim((string)$body['budget_currency']) : 'INR',
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
