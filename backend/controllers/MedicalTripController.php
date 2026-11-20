<?php

namespace App\Controllers;

use App\Models\MedicalTrip;
use App\Services\AuditService;
use App\Utils\Request;
use Throwable;

class MedicalTripController extends BaseController
{
    /**
     * Public: List published and active medical trips.
     * GET /api/v1/medical-trips
     */
    public function index(): void
    {
        $params = Request::getQueryParams();
        $page = isset($params['page']) ? (int) $params['page'] : 1;
        $limit = isset($params['limit']) ? (int) $params['limit'] : 20;

        $filters = [
            'search' => $params['search'] ?? null,
            'category' => $params['category'] ?? null,
            'is_published' => 1,
            'is_active' => 1,
            'sort_by' => $params['sort_by'] ?? 'display_order',
            'order' => $params['order'] ?? 'ASC',
        ];

        $result = MedicalTrip::paginate($filters, $page, $limit);

        $this->success(
            $result['items'],
            'Medical trips retrieved successfully',
            200,
            ['pagination' => $result['pagination']]
        );
    }

    /**
     * Public: List active medical add-on tests.
     * GET /api/v1/medical-trips/addons
     */
    public function addons(): void
    {
        $addons = MedicalTrip::getAddons(true);
        $this->success($addons, 'Medical addons retrieved successfully');
    }

    /**
     * Public: Retrieve single medical trip by slug or ID with full assessments & diseases.
     * GET /api/v1/medical-trips/{slug}
     */
    public function show(string $idOrSlug): void
    {
        $idOrSlug = trim($idOrSlug);
        if ($idOrSlug === '') {
            $this->error('Medical trip identifier is required.', 400);
            return;
        }

        if (is_numeric($idOrSlug)) {
            $trip = MedicalTrip::findById((int) $idOrSlug, true);
        } else {
            $trip = MedicalTrip::findBySlug($idOrSlug, true);
        }

        if (!$trip) {
            $this->error('Medical trip package not found.', 404);
            return;
        }

        $this->success($trip, 'Medical trip details retrieved successfully');
    }

    /**
     * Public: Submit a booking request for a medical trip.
     * POST /api/v1/medical-trips/{id}/book or POST /api/v1/medical-trips/book
     */
    public function book(?string $id = null): void
    {
        $body = Request::getBody();

        $tripId = $id ? (int) $id : (int) ($body['medical_trip_id'] ?? 0);
        if ($tripId <= 0) {
            $this->error('Valid medical trip package ID is required.', 422, ['medical_trip_id' => 'Valid package ID required']);
            return;
        }

        $trip = MedicalTrip::findById($tripId, false);
        if (!$trip) {
            $this->error('The selected medical package does not exist.', 404);
            return;
        }

        // Normalize fields for unified BookingController
        $body['medical_trip_id'] = $tripId;
        if (empty($body['first_name'])) {
            $fullName = trim($body['full_name'] ?? ($body['customer_name'] ?? ($body['name'] ?? '')));
            if ($fullName !== '') {
                $parts = explode(' ', $fullName);
                $body['first_name'] = $parts[0];
                $body['last_name'] = count($parts) > 1 ? implode(' ', array_slice($parts, 1)) : $parts[0];
            }
        }
        if (empty($body['booking_date']) && !empty($body['preferred_date'])) {
            $body['booking_date'] = $body['preferred_date'];
            $body['arrival_date'] = $body['preferred_date'];
        }
        if (empty($body['tickets_count']) && !empty($body['number_of_persons'])) {
            $body['tickets_count'] = (int) $body['number_of_persons'];
            $body['adults_count'] = (int) $body['number_of_persons'];
        }
        if (empty($body['destination_name'])) {
            $body['destination_name'] = $trip['title'];
        }

        Request::setBody($body);

        $bookingController = new BookingController();
        $bookingController->store();
    }

    /* --------------------------------------------------------------------------
     * Admin APIs
     * -------------------------------------------------------------------------- */

    /**
     * Admin: List all medical trips with complete filters.
     * GET /api/v1/admin/medical-trips
     */
    public function adminIndex(): void
    {
        $params = Request::getQueryParams();
        $page = isset($params['page']) ? (int) $params['page'] : 1;
        $limit = isset($params['limit']) ? (int) $params['limit'] : 20;

        $filters = [
            'search' => $params['search'] ?? null,
            'category' => $params['category'] ?? null,
            'is_published' => $params['is_published'] ?? null,
            'is_active' => $params['is_active'] ?? null,
            'sort_by' => $params['sort_by'] ?? 'created_at',
            'order' => $params['order'] ?? 'DESC',
        ];

        $result = MedicalTrip::paginate($filters, $page, $limit);

        $this->success(
            $result['items'],
            'Admin medical trips retrieved successfully',
            200,
            ['pagination' => $result['pagination']]
        );
    }

    /**
     * Admin: Get single medical trip by ID for editing.
     * GET /api/v1/admin/medical-trips/{id}
     */
    public function adminShow(string $id): void
    {
        $trip = MedicalTrip::findById((int) $id, true);
        if (!$trip) {
            $this->error('Medical trip package not found.', 404);
            return;
        }
        $this->success($trip, 'Medical trip retrieved successfully');
    }

    /**
     * Admin: Create new medical trip package.
     * POST /api/v1/admin/medical-trips
     */
    public function store(): void
    {
        $body = Request::getBody();

        if (empty($body['title'])) {
            $this->error('Package Title is required.', 422, ['title' => 'Title is required']);
            return;
        }

        try {
            $id = MedicalTrip::create($body);
            $newTrip = MedicalTrip::findById($id, true);
            $userId = Request::getUserId();
            AuditService::log($userId, 'medical_trip_create', 'medical_trips', $id, null, ['title' => $body['title'] ?? '']);

            $this->success($newTrip, 'Medical trip package created successfully!', 201);
        } catch (Throwable $e) {
            $this->error('Failed to create medical trip: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Admin: Update medical trip package.
     * PUT/PATCH /api/v1/admin/medical-trips/{id}
     */
    public function update(string $id): void
    {
        $tripId = (int) $id;
        $existing = MedicalTrip::findById($tripId, false);
        if (!$existing) {
            $this->error('Medical trip package not found.', 404);
            return;
        }

        $body = Request::getBody();

        try {
            MedicalTrip::update($tripId, $body);
            $updated = MedicalTrip::findById($tripId, true);
            $userId = Request::getUserId();
            AuditService::log($userId, 'medical_trip_update', 'medical_trips', $tripId, null, $body);

            $this->success($updated, 'Medical trip package updated successfully!');
        } catch (Throwable $e) {
            $this->error('Failed to update medical trip: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Admin: Delete medical trip package.
     * DELETE /api/v1/admin/medical-trips/{id}
     */
    public function destroy(string $id): void
    {
        $tripId = (int) $id;
        $existing = MedicalTrip::findById($tripId, false);
        if (!$existing) {
            $this->error('Medical trip package not found.', 404);
            return;
        }

        try {
            MedicalTrip::delete($tripId);
            $userId = Request::getUserId();
            AuditService::log($userId, 'medical_trip_delete', 'medical_trips', $tripId, $existing, null);
            $this->success(['id' => $tripId], 'Medical trip package deleted successfully!');
        } catch (Throwable $e) {
            $this->error('Failed to delete medical trip: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Admin: Toggle publish status.
     * POST /api/v1/admin/medical-trips/{id}/publish
     */
    public function togglePublish(string $id): void
    {
        $tripId = (int) $id;
        MedicalTrip::togglePublish($tripId);
        $trip = MedicalTrip::findById($tripId, false);
        $this->success($trip, 'Publish status updated');
    }

    /**
     * Admin: Toggle active status.
     * POST /api/v1/admin/medical-trips/{id}/activate
     */
    public function toggleActive(string $id): void
    {
        $tripId = (int) $id;
        MedicalTrip::toggleActive($tripId);
        $trip = MedicalTrip::findById($tripId, false);
        $this->success($trip, 'Active status updated');
    }

    /* --------------------------------------------------------------------------
     * Assessment & Test Endpoints
     * -------------------------------------------------------------------------- */

    public function addAssessment(string $id): void
    {
        $tripId = (int) $id;
        $body = Request::getBody();
        if (empty($body['title'])) {
            $this->error('Assessment Title is required.', 422);
            return;
        }
        $asmtId = MedicalTrip::addAssessment($tripId, $body);
        $assessments = MedicalTrip::getAssessments($tripId);
        $this->success($assessments, 'Assessment added successfully', 201);
    }

    public function updateAssessment(string $asmtId): void
    {
        $id = (int) $asmtId;
        $body = Request::getBody();
        MedicalTrip::updateAssessment($id, $body);
        $this->success(['id' => $id], 'Assessment updated successfully');
    }

    public function deleteAssessment(string $asmtId): void
    {
        $id = (int) $asmtId;
        MedicalTrip::deleteAssessment($id);
        $this->success(['id' => $id], 'Assessment deleted successfully');
    }

    public function reorderAssessments(string $id): void
    {
        $body = Request::getBody();
        $orderedIds = $body['ordered_ids'] ?? [];
        if (!empty($orderedIds) && is_array($orderedIds)) {
            MedicalTrip::reorderAssessments($orderedIds);
        }
        $this->success(MedicalTrip::getAssessments((int) $id), 'Assessments reordered');
    }

    public function addTest(string $asmtId): void
    {
        $aid = (int) $asmtId;
        $body = Request::getBody();
        if (empty($body['test_name']) && empty($body['name'])) {
            $this->error('Test name is required.', 422);
            return;
        }
        $testId = MedicalTrip::addTest($aid, $body);
        $tests = MedicalTrip::getAssessmentTests($aid);
        $this->success($tests, 'Test added successfully', 201);
    }

    public function updateTest(string $testId): void
    {
        $id = (int) $testId;
        $body = Request::getBody();
        MedicalTrip::updateTest($id, $body);
        $this->success(['id' => $id], 'Test updated successfully');
    }

    public function deleteTest(string $testId): void
    {
        $id = (int) $testId;
        MedicalTrip::deleteTest($id);
        $this->success(['id' => $id], 'Test deleted successfully');
    }

    /* --------------------------------------------------------------------------
     * Diseases Screened Endpoints (Deprecated / Removed)
     * -------------------------------------------------------------------------- */

    public function addDisease(string $id): void
    {
        $this->success([], 'Diseases screened feature is discontinued', 200);
    }

    public function updateDisease(string $diseaseId): void
    {
        $this->success([], 'Diseases screened feature is discontinued');
    }

    public function deleteDisease(string $diseaseId): void
    {
        $this->success([], 'Diseases screened feature is discontinued');
    }

    /* --------------------------------------------------------------------------
     * Booking Requests Endpoints
     * -------------------------------------------------------------------------- */

    public function bookings(): void
    {
        $params = Request::getQueryParams();
        $page = isset($params['page']) ? (int) $params['page'] : 1;
        $limit = isset($params['limit']) ? (int) $params['limit'] : 20;

        $filters = [
            'search' => $params['search'] ?? null,
            'status' => $params['status'] ?? null,
            'medical_trip_id' => $params['medical_trip_id'] ?? null,
        ];

        $result = MedicalTrip::getBookings($filters, $page, $limit);
        $this->success($result['items'], 'Medical bookings retrieved', 200, ['pagination' => $result['pagination']]);
    }

    public function updateBookingStatus(string $bookingId): void
    {
        $id = (int) $bookingId;
        $body = Request::getBody();
        $status = $body['status'] ?? 'contacted';
        MedicalTrip::updateBookingStatus($id, $status);
        $this->success(['id' => $id, 'status' => $status], 'Booking status updated');
    }
}
