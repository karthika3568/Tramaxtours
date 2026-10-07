<?php

namespace App\Models;

use App\Utils\Database;
use PDO;

class Booking extends BaseModel
{
    public const ALLOWED_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'];
    public const ALLOWED_PAYMENT_STATUSES = ['pending', 'paid', 'not_required', 'failed', 'refunded'];

    /**
     * Generate a unique order number (e.g. TT-20260925-A8F2).
     *
     * @return string
     */
    public static function generateOrderNumber(): string
    {
        $prefix = 'WSI-' . date('Ymd') . '-';
        do {
            $suffix = strtoupper(bin2hex(random_bytes(2)));
            $orderNumber = $prefix . $suffix;
        } while (self::orderNumberExists($orderNumber));

        return $orderNumber;
    }

    /**
     * Check if an order number already exists.
     *
     * @param string $orderNumber
     * @param int|null $excludeId
     * @return bool
     */
    public static function orderNumberExists(string $orderNumber, ?int $excludeId = null): bool
    {
        $sql = 'SELECT COUNT(*) FROM `bookings` WHERE `order_number` = :order_number';
        $params = [':order_number' => $orderNumber];

        if ($excludeId !== null) {
            $sql .= ' AND `id` != :exclude_id';
            $params[':exclude_id'] = $excludeId;
        }

        return ((int) self::fetchColumn($sql, $params)) > 0;
    }

    /**
     * Create a new booking with customer and billing details.
     *
     * @param array $bookingData
     * @param array $customerData
     * @param array $billingData
     * @param array|null $paymentData
     * @return array
     */
    public static function create(
        array $bookingData,
        array $customerData,
        array $billingData,
        ?array $paymentData = null
    ): array {
        $orderNumber = !empty($bookingData['order_number'])
            ? (string) $bookingData['order_number']
            : self::generateOrderNumber();

        $adultsCount = isset($bookingData['adults_count']) ? (int) $bookingData['adults_count'] : 1;
        $childrenCount = isset($bookingData['children_count']) ? (int) $bookingData['children_count'] : 0;
        $infantsCount = isset($bookingData['infants_count']) ? (int) $bookingData['infants_count'] : 0;
        $ticketsCount = max(1, (int) ($bookingData['tickets_count'] ?? ($adultsCount + $childrenCount)));

        $unitPrice = (float) ($bookingData['unit_price'] ?? 0.0);
        $subtotal = isset($bookingData['subtotal']) ? (float) $bookingData['subtotal'] : ($unitPrice * $ticketsCount);
        $taxAmount = (float) ($bookingData['tax_amount'] ?? 0.0);
        $discountAmount = (float) ($bookingData['discount_amount'] ?? 0.0);
        $totalPrice = isset($bookingData['total_price']) ? (float) $bookingData['total_price'] : ($subtotal + $taxAmount - $discountAmount);

        $currency = !empty($bookingData['currency']) ? (string) $bookingData['currency'] : 'INR';
        $bookingStatus = in_array($bookingData['booking_status'] ?? '', self::ALLOWED_STATUSES, true)
            ? $bookingData['booking_status']
            : 'pending';
        $paymentMethod = !empty($bookingData['payment_method']) ? (string) $bookingData['payment_method'] : 'pay_on_arrival';
        $paymentStatus = in_array($bookingData['payment_status'] ?? '', self::ALLOWED_PAYMENT_STATUSES, true)
            ? $bookingData['payment_status']
            : 'pending';

        $tourId = (int) $bookingData['tour_id'];
        $bookingDate = !empty($bookingData['booking_date']) ? $bookingData['booking_date'] : (!empty($bookingData['arrival_date']) ? $bookingData['arrival_date'] : date('Y-m-d'));

        // Generate unguessable random access token for public customer verification
        $plainToken = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $plainToken);

        Database::beginTransaction();

        try {
            // Date-specific seat reservation — only enforced for tours the admin has
            // opted into date-based availability for (see TourAvailability). Tours with
            // no configured dates keep their existing unrestricted booking behaviour.
            if (TourAvailability::tourUsesDateAvailability($tourId)) {
                if (!TourAvailability::reserveSeats($tourId, $bookingDate, $ticketsCount)) {
                    throw new \RuntimeException(
                        'The selected travel date is fully booked, closed, or past the booking cutoff. Please choose another date.',
                        409
                    );
                }
            }

            $bookingId = self::insertBookingRecords($bookingData, $customerData, $billingData, $paymentData, [
                'order_number' => $orderNumber,
                'access_token_hash' => $tokenHash,
                'tour_id' => $tourId,
                'booking_date' => $bookingDate,
                'tickets_count' => $ticketsCount,
                'unit_price' => $unitPrice,
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'discount_amount' => $discountAmount,
                'total_price' => $totalPrice,
                'currency' => $currency,
                'booking_status' => $bookingStatus,
                'payment_method' => $paymentMethod,
                'payment_status' => $paymentStatus,
            ]);

            Database::commit();
            return [
                'id' => $bookingId,
                'access_token' => $plainToken,
                'order_number' => $orderNumber,
            ];
        } catch (\Throwable $e) {
            Database::rollBack();
            throw $e;
        }
    }

    /**
     * Insert the related rows for a new booking (bookings, customer details, billing
     * address, status history, payment).
     *
     * @return int
     */
    private static function insertBookingRecords(
        array $bookingData,
        array $customerData,
        array $billingData,
        ?array $paymentData,
        array $computed
    ): int {
        ['order_number' => $orderNumber, 'access_token_hash' => $accessTokenHash, 'tour_id' => $tourId, 'booking_date' => $bookingDate,
         'tickets_count' => $ticketsCount, 'unit_price' => $unitPrice, 'subtotal' => $subtotal,
         'tax_amount' => $taxAmount, 'discount_amount' => $discountAmount, 'total_price' => $totalPrice,
         'currency' => $currency, 'booking_status' => $bookingStatus, 'payment_method' => $paymentMethod,
         'payment_status' => $paymentStatus] = $computed;

        $tourTypes = isset($bookingData['tour_types'])
            ? (is_array($bookingData['tour_types']) ? json_encode($bookingData['tour_types']) : (string) $bookingData['tour_types'])
            : null;

        $contactMethods = isset($bookingData['preferred_contact_methods'])
            ? (is_array($bookingData['preferred_contact_methods']) ? json_encode($bookingData['preferred_contact_methods']) : (string) $bookingData['preferred_contact_methods'])
            : null;

        $sql = 'INSERT INTO `bookings` (
            `order_number`, `access_token_hash`, `user_id`, `tour_id`, `pricing_tier_id`,
            `first_name`, `middle_name`, `last_name`, `dial_code`, `country`, `destination_name`,
            `pickup_location`, `arrival_date`, `departure_date`, `duration_days`,
            `adults_count`, `children_count`, `infants_count`,
            `tour_types`, `tour_guide_required`, `preferred_language`, `vehicle_preference`,
            `airport_pickup`, `airport_drop`, `hotel_category`, `room_type`, `rooms_count`,
            `arrival_flight_train_number`, `arrival_time`, `departure_flight_train_number`, `departure_time`,
            `approximate_budget`, `budget_currency`, `passport_file_url`, `flight_ticket_url`,
            `preferred_contact_methods`, `special_requests`,
            `booking_date`, `tickets_count`, `unit_price`, `subtotal`, `tax_amount`, `discount_amount`,
            `total_price`, `currency`, `booking_status`, `payment_method`, `payment_status`,
            `customer_notes`, `admin_notes`, `created_at`, `updated_at`
        ) VALUES (
            :order_number, :access_token_hash, :user_id, :tour_id, :pricing_tier_id,
            :first_name, :middle_name, :last_name, :dial_code, :country, :destination_name,
            :pickup_location, :arrival_date, :departure_date, :duration_days,
            :adults_count, :children_count, :infants_count,
            :tour_types, :tour_guide_required, :preferred_language, :vehicle_preference,
            :airport_pickup, :airport_drop, :hotel_category, :room_type, :rooms_count,
            :arrival_flight_train_number, :arrival_time, :departure_flight_train_number, :departure_time,
            :approximate_budget, :budget_currency, :passport_file_url, :flight_ticket_url,
            :preferred_contact_methods, :special_requests,
            :booking_date, :tickets_count, :unit_price, :subtotal, :tax_amount, :discount_amount,
            :total_price, :currency, :booking_status, :payment_method, :payment_status,
            :customer_notes, :admin_notes, NOW(), NOW()
        )';

        self::execute($sql, [
            ':order_number' => $orderNumber,
            ':access_token_hash' => $accessTokenHash,
            ':user_id' => !empty($bookingData['user_id']) ? (int) $bookingData['user_id'] : null,
            ':tour_id' => (int) $bookingData['tour_id'],
            ':pricing_tier_id' => !empty($bookingData['pricing_tier_id']) ? (int) $bookingData['pricing_tier_id'] : null,
            ':first_name' => !empty($bookingData['first_name']) ? (string) $bookingData['first_name'] : (!empty($customerData['first_name']) ? (string) $customerData['first_name'] : null),
            ':middle_name' => !empty($bookingData['middle_name']) ? (string) $bookingData['middle_name'] : (!empty($customerData['middle_name']) ? (string) $customerData['middle_name'] : null),
            ':last_name' => !empty($bookingData['last_name']) ? (string) $bookingData['last_name'] : (!empty($customerData['last_name']) ? (string) $customerData['last_name'] : null),
            ':dial_code' => !empty($bookingData['dial_code']) ? (string) $bookingData['dial_code'] : (!empty($customerData['dial_code']) ? (string) $customerData['dial_code'] : '+91'),
            ':country' => !empty($bookingData['country']) ? (string) $bookingData['country'] : (!empty($customerData['country']) ? (string) $customerData['country'] : 'India'),
            ':destination_name' => !empty($bookingData['destination_name']) ? (string) $bookingData['destination_name'] : (!empty($bookingData['destination']) ? (string) $bookingData['destination'] : null),
            ':pickup_location' => !empty($bookingData['pickup_location']) ? (string) $bookingData['pickup_location'] : null,
            ':arrival_date' => !empty($bookingData['arrival_date']) ? (string) $bookingData['arrival_date'] : $bookingDate,
            ':departure_date' => !empty($bookingData['departure_date']) ? (string) $bookingData['departure_date'] : null,
            ':duration_days' => !empty($bookingData['duration_days']) ? (string) $bookingData['duration_days'] : null,
            ':adults_count' => isset($bookingData['adults_count']) ? (int) $bookingData['adults_count'] : $ticketsCount,
            ':children_count' => isset($bookingData['children_count']) ? (int) $bookingData['children_count'] : 0,
            ':infants_count' => isset($bookingData['infants_count']) ? (int) $bookingData['infants_count'] : 0,
            ':tour_types' => $tourTypes,
            ':tour_guide_required' => isset($bookingData['tour_guide_required']) ? ($bookingData['tour_guide_required'] ? 1 : 0) : 0,
            ':preferred_language' => !empty($bookingData['preferred_language']) ? (string) $bookingData['preferred_language'] : null,
            ':vehicle_preference' => !empty($bookingData['vehicle_preference']) ? (string) $bookingData['vehicle_preference'] : null,
            ':airport_pickup' => isset($bookingData['airport_pickup']) ? ($bookingData['airport_pickup'] ? 1 : 0) : 0,
            ':airport_drop' => isset($bookingData['airport_drop']) ? ($bookingData['airport_drop'] ? 1 : 0) : 0,
            ':hotel_category' => !empty($bookingData['hotel_category']) ? (string) $bookingData['hotel_category'] : null,
            ':room_type' => !empty($bookingData['room_type']) ? (string) $bookingData['room_type'] : null,
            ':rooms_count' => isset($bookingData['rooms_count']) ? (int) $bookingData['rooms_count'] : 1,
            ':arrival_flight_train_number' => !empty($bookingData['arrival_flight_train_number']) ? (string) $bookingData['arrival_flight_train_number'] : null,
            ':arrival_time' => !empty($bookingData['arrival_time']) ? (string) $bookingData['arrival_time'] : null,
            ':departure_flight_train_number' => !empty($bookingData['departure_flight_train_number']) ? (string) $bookingData['departure_flight_train_number'] : null,
            ':departure_time' => !empty($bookingData['departure_time']) ? (string) $bookingData['departure_time'] : null,
            ':approximate_budget' => !empty($bookingData['approximate_budget']) ? (string) $bookingData['approximate_budget'] : null,
            ':budget_currency' => !empty($bookingData['budget_currency']) ? (string) $bookingData['budget_currency'] : 'INR',
            ':passport_file_url' => !empty($bookingData['passport_file_url']) ? (string) $bookingData['passport_file_url'] : null,
            ':flight_ticket_url' => !empty($bookingData['flight_ticket_url']) ? (string) $bookingData['flight_ticket_url'] : null,
            ':preferred_contact_methods' => $contactMethods,
            ':special_requests' => !empty($bookingData['special_requests']) ? (string) $bookingData['special_requests'] : null,
            ':booking_date' => $bookingDate,
            ':tickets_count' => $ticketsCount,
            ':unit_price' => $unitPrice,
            ':subtotal' => $subtotal,
            ':tax_amount' => $taxAmount,
            ':discount_amount' => $discountAmount,
            ':total_price' => $totalPrice,
            ':currency' => $currency,
            ':booking_status' => $bookingStatus,
            ':payment_method' => $paymentMethod,
            ':payment_status' => $paymentStatus,
            ':customer_notes' => !empty($bookingData['customer_notes']) ? (string) $bookingData['customer_notes'] : null,
            ':admin_notes' => !empty($bookingData['admin_notes']) ? (string) $bookingData['admin_notes'] : null,
        ]);

        $bookingId = (int) self::lastInsertId();

        // 2. Insert Customer Details
        $custSql = 'INSERT INTO `booking_customer_details` (
            `booking_id`, `first_name`, `middle_name`, `last_name`, `dial_code`, `country`, `email`, `phone`, `created_at`, `updated_at`
        ) VALUES (
            :booking_id, :first_name, :middle_name, :last_name, :dial_code, :country, :email, :phone, NOW(), NOW()
        )';
        self::execute($custSql, [
            ':booking_id' => $bookingId,
            ':first_name' => (string) ($customerData['first_name'] ?? ($bookingData['first_name'] ?? '')),
            ':middle_name' => !empty($customerData['middle_name']) ? (string) $customerData['middle_name'] : (!empty($bookingData['middle_name']) ? (string) $bookingData['middle_name'] : null),
            ':last_name' => (string) ($customerData['last_name'] ?? ($bookingData['last_name'] ?? '')),
            ':dial_code' => !empty($customerData['dial_code']) ? (string) $customerData['dial_code'] : (!empty($bookingData['dial_code']) ? (string) $bookingData['dial_code'] : '+91'),
            ':country' => !empty($customerData['country']) ? (string) $customerData['country'] : (!empty($bookingData['country']) ? (string) $bookingData['country'] : 'India'),
            ':email' => (string) ($customerData['email'] ?? ($bookingData['email'] ?? '')),
            ':phone' => (string) ($customerData['phone'] ?? ($bookingData['phone'] ?? '')),
        ]);

        // 3. Insert Billing Address
        $billSql = 'INSERT INTO `booking_billing_addresses` (
            `booking_id`, `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country`, `created_at`, `updated_at`
        ) VALUES (
            :booking_id, :address_line1, :address_line2, :city, :state, :postal_code, :country, NOW(), NOW()
        )';
        self::execute($billSql, [
            ':booking_id' => $bookingId,
            ':address_line1' => (string) ($billingData['address_line1'] ?? ($bookingData['pickup_location'] ?? 'Hotel / Airport Pickup')),
            ':address_line2' => !empty($billingData['address_line2']) ? (string) $billingData['address_line2'] : null,
            ':city' => (string) ($billingData['city'] ?? ($bookingData['country'] ?? 'Chennai')),
            ':state' => !empty($billingData['state']) ? (string) $billingData['state'] : 'Tamil Nadu',
            ':postal_code' => (string) ($billingData['postal_code'] ?? '600001'),
            ':country' => (string) ($billingData['country'] ?? ($bookingData['country'] ?? 'India')),
        ]);

        // 4. Record Initial Status History
        $histSql = 'INSERT INTO `booking_status_history` (
            `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`
        ) VALUES (
            :booking_id, NULL, :new_status, :changed_by, :notes, NOW()
        )';
        self::execute($histSql, [
            ':booking_id' => $bookingId,
            ':new_status' => $bookingStatus,
            ':changed_by' => !empty($bookingData['changed_by']) ? (int) $bookingData['changed_by'] : null,
            ':notes' => 'Booking placed successfully',
        ]);

        // 5. Insert Payment record
        $payAmount = isset($paymentData['amount']) ? (float) $paymentData['amount'] : $totalPrice;
        $payCurrency = !empty($paymentData['currency']) ? (string) $paymentData['currency'] : $currency;
        $payStatus = !empty($paymentData['status']) ? (string) $paymentData['status'] : 'pending';
        $payMethod = !empty($paymentData['payment_method']) ? (string) $paymentData['payment_method'] : $paymentMethod;
        $payTxRef = !empty($paymentData['transaction_reference']) ? (string) $paymentData['transaction_reference'] : 'TX-' . $orderNumber;

        $paySql = 'INSERT INTO `payments` (
            `booking_id`, `transaction_reference`, `payment_method`, `amount`, `currency`, `status`, `created_at`, `updated_at`
        ) VALUES (
            :booking_id, :transaction_reference, :payment_method, :amount, :currency, :status, NOW(), NOW()
        )';
        self::execute($paySql, [
            ':booking_id' => $bookingId,
            ':transaction_reference' => $payTxRef,
            ':payment_method' => $payMethod,
            ':amount' => $payAmount,
            ':currency' => $payCurrency,
            ':status' => $payStatus,
        ]);

        return $bookingId;
    }

    /**
     * Update booking fields.
     *
     * @param int $id
     * @param array $data
     * @return bool
     */
    public static function update(int $id, array $data): bool
    {
        $fields = [];
        $params = [':id' => $id];

        $allowedColumns = [
            'booking_date', 'tickets_count', 'unit_price', 'subtotal',
            'tax_amount', 'discount_amount', 'total_price', 'currency',
            'booking_status', 'payment_method', 'payment_status',
            'customer_notes', 'admin_notes'
        ];

        foreach ($allowedColumns as $col) {
            if (array_key_exists($col, $data)) {
                $fields[] = "`{$col}` = :{$col}";
                if (in_array($col, ['tickets_count'], true)) {
                    $params[":{$col}"] = (int) $data[$col];
                } elseif (in_array($col, ['unit_price', 'subtotal', 'tax_amount', 'discount_amount', 'total_price'], true)) {
                    $params[":{$col}"] = (float) $data[$col];
                } else {
                    $params[":{$col}"] = $data[$col] !== null ? (string) $data[$col] : null;
                }
            }
        }

        if (empty($fields)) {
            return true;
        }

        $fields[] = '`updated_at` = NOW()';
        $sql = 'UPDATE `bookings` SET ' . implode(', ', $fields) . ' WHERE `id` = :id AND `deleted_at` IS NULL';

        return self::execute($sql, $params) > 0;
    }

    /**
     * Update booking status and write to status history.
     *
     * @param int $id
     * @param string $newStatus
     * @param int|null $changedBy
     * @param string|null $notes
     * @return bool
     */
    public static function updateStatus(
        int $id,
        string $newStatus,
        ?int $changedBy = null,
        ?string $notes = null
    ): bool {
        if (!in_array($newStatus, self::ALLOWED_STATUSES, true)) {
            return false;
        }

        // Get previous status + booking details (needed to release reserved seats below)
        $existing = self::fetchOne(
            'SELECT `booking_status`, `tour_id`, `booking_date`, `tickets_count` FROM `bookings` WHERE `id` = :id',
            [':id' => $id]
        );
        $prevStatus = (string) ($existing['booking_status'] ?? '');

        $updateSql = 'UPDATE `bookings` SET `booking_status` = :status, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NULL';
        $affected = self::execute($updateSql, [':id' => $id, ':status' => $newStatus]);

        if ($affected > 0) {
            $histSql = 'INSERT INTO `booking_status_history` (
                `booking_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`
            ) VALUES (
                :booking_id, :prev_status, :new_status, :changed_by, :notes, NOW()
            )';
            self::execute($histSql, [
                ':booking_id' => $id,
                ':prev_status' => $prevStatus ?: null,
                ':new_status' => $newStatus,
                ':changed_by' => $changedBy,
                ':notes' => $notes,
            ]);

            // Releasing the date-specific seat reservation on cancel/reject (idempotent —
            // only fires on the transition into a cancelled state, not if already there).
            $cancelledLike = ['cancelled', 'rejected'];
            if (in_array($newStatus, $cancelledLike, true) && !in_array($prevStatus, $cancelledLike, true) && $existing) {
                $tourId = (int) $existing['tour_id'];
                if (TourAvailability::tourUsesDateAvailability($tourId)) {
                    TourAvailability::releaseSeats($tourId, $existing['booking_date'], (int) $existing['tickets_count']);
                }
            }

            return true;
        }

        return false;
    }

    /**
     * Soft delete booking.
     *
     * @param int $id
     * @param bool $force
     * @return bool
     */
    public static function delete(int $id, bool $force = false): bool
    {
        if ($force) {
            return self::execute('DELETE FROM `bookings` WHERE `id` = :id', [':id' => $id]) > 0;
        }

        return self::execute(
            'UPDATE `bookings` SET `deleted_at` = NOW(), `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NULL',
            [':id' => $id]
        ) > 0;
    }

    /**
     * Restore soft deleted booking.
     *
     * @param int $id
     * @return bool
     */
    public static function restore(int $id): bool
    {
        return self::execute(
            'UPDATE `bookings` SET `deleted_at` = NULL, `updated_at` = NOW() WHERE `id` = :id AND `deleted_at` IS NOT NULL',
            [':id' => $id]
        ) > 0;
    }

    /**
     * Find booking by primary ID.
     *
     * @param int $id
     * @param bool $includeDeleted
     * @return array|null
     */
    public static function findById(int $id, bool $includeDeleted = false): ?array
    {
        $sql = 'SELECT b.*,
                       t.`title` AS tour_title, t.`slug` AS tour_slug, t.`tour_type`,
                       t.`duration_days`, t.`duration_text`, t.`featured_image_id`,
                       fi.`file_path` AS tour_image_path, fi.`original_name` AS tour_image_name,
                       d.`name` AS destination_name, d.`slug` AS destination_slug,
                       pt.`service_option` AS tier_service_option
                FROM `bookings` b
                JOIN `tours` t ON b.`tour_id` = t.`id`
                LEFT JOIN `destinations` d ON t.`destination_id` = d.`id`
                LEFT JOIN `media` fi ON t.`featured_image_id` = fi.`id`
                LEFT JOIN `tour_pricing_tiers` pt ON b.`pricing_tier_id` = pt.`id`
                WHERE b.`id` = :id';

        if (!$includeDeleted) {
            $sql .= ' AND b.`deleted_at` IS NULL';
        }
        $sql .= ' LIMIT 1';

        $row = self::fetchOne($sql, [':id' => $id]);
        return $row ? self::formatBookingDetails($row) : null;
    }

    /**
     * Find booking by unique order number.
     *
     * @param string $orderNumber
     * @param bool $includeDeleted
     * @return array|null
     */
    public static function findByOrderNumber(string $orderNumber, bool $includeDeleted = false): ?array
    {
        $sql = 'SELECT b.*,
                       t.`title` AS tour_title, t.`slug` AS tour_slug, t.`tour_type`,
                       t.`duration_days`, t.`duration_text`, t.`featured_image_id`,
                       fi.`file_path` AS tour_image_path, fi.`original_name` AS tour_image_name,
                       d.`name` AS destination_name, d.`slug` AS destination_slug,
                       pt.`service_option` AS tier_service_option
                FROM `bookings` b
                JOIN `tours` t ON b.`tour_id` = t.`id`
                LEFT JOIN `destinations` d ON t.`destination_id` = d.`id`
                LEFT JOIN `media` fi ON t.`featured_image_id` = fi.`id`
                LEFT JOIN `tour_pricing_tiers` pt ON b.`pricing_tier_id` = pt.`id`
                WHERE b.`order_number` = :order_number';

        if (!$includeDeleted) {
            $sql .= ' AND b.`deleted_at` IS NULL';
        }
        $sql .= ' LIMIT 1';

        $row = self::fetchOne($sql, [':order_number' => $orderNumber]);
        return $row ? self::formatBookingDetails($row) : null;
    }

    /**
     * Paginate bookings with filtering and sorting.
     *
     * @param array $filters
     * @param int $page
     * @param int $limit
     * @return array
     */
    public static function paginate(array $filters = [], int $page = 1, int $limit = 20): array
    {
        $page = max(1, $page);
        $limit = min(100, max(1, $limit));
        $offset = ($page - 1) * $limit;

        $where = ['b.`deleted_at` IS NULL'];
        $params = [];

        // Search query across order number, customer name, email, phone, and tour title
        if (!empty($filters['search'])) {
            $where[] = '(
                b.`order_number` LIKE :search1 OR
                bcd.`first_name` LIKE :search2 OR
                bcd.`last_name` LIKE :search3 OR
                CONCAT(bcd.`first_name`, " ", bcd.`last_name`) LIKE :search4 OR
                bcd.`email` LIKE :search5 OR
                bcd.`phone` LIKE :search6 OR
                t.`title` LIKE :search7
            )';
            $searchTerm = '%' . trim($filters['search']) . '%';
            $params[':search1'] = $searchTerm;
            $params[':search2'] = $searchTerm;
            $params[':search3'] = $searchTerm;
            $params[':search4'] = $searchTerm;
            $params[':search5'] = $searchTerm;
            $params[':search6'] = $searchTerm;
            $params[':search7'] = $searchTerm;
        }

        // Filter by booking status
        if (!empty($filters['status']) && in_array($filters['status'], self::ALLOWED_STATUSES, true)) {
            $where[] = 'b.`booking_status` = :status';
            $params[':status'] = $filters['status'];
        }

        // Filter by payment status
        if (!empty($filters['payment_status']) && in_array($filters['payment_status'], self::ALLOWED_PAYMENT_STATUSES, true)) {
            $where[] = 'b.`payment_status` = :payment_status';
            $params[':payment_status'] = $filters['payment_status'];
        }

        // Filter by tour_id
        if (!empty($filters['tour_id'])) {
            $where[] = 'b.`tour_id` = :tour_id';
            $params[':tour_id'] = (int) $filters['tour_id'];
        }

        // Filter by date range (booking_date)
        if (!empty($filters['date_from'])) {
            $where[] = 'b.`booking_date` >= :date_from';
            $params[':date_from'] = $filters['date_from'];
        }
        if (!empty($filters['date_to'])) {
            $where[] = 'b.`booking_date` <= :date_to';
            $params[':date_to'] = $filters['date_to'];
        }

        $whereSql = implode(' AND ', $where);

        // Total count
        $countSql = "SELECT COUNT(*)
                     FROM `bookings` b
                     JOIN `tours` t ON b.`tour_id` = t.`id`
                     LEFT JOIN `booking_customer_details` bcd ON b.`id` = bcd.`booking_id`
                     WHERE {$whereSql}";
        $total = (int) self::fetchColumn($countSql, $params);

        // Sorting
        $allowedSort = [
            'id' => 'b.`id`',
            'order_number' => 'b.`order_number`',
            'booking_date' => 'b.`booking_date`',
            'created_at' => 'b.`created_at`',
            'total_price' => 'b.`total_price`',
            'booking_status' => 'b.`booking_status`',
        ];

        $sortBy = isset($allowedSort[$filters['sort_by'] ?? '']) ? $allowedSort[$filters['sort_by']] : 'b.`created_at`';
        $order = strtolower($filters['order'] ?? '') === 'asc' ? 'ASC' : 'DESC';

        $dataSql = "SELECT b.*,
                           t.`title` AS tour_title, t.`slug` AS tour_slug, t.`tour_type`,
                           t.`duration_days`, t.`duration_text`,
                           fi.`file_path` AS tour_image_path,
                           bcd.`first_name`, bcd.`last_name`, bcd.`email` AS customer_email, bcd.`phone` AS customer_phone,
                           bba.`city` AS billing_city, bba.`country` AS billing_country
                    FROM `bookings` b
                    JOIN `tours` t ON b.`tour_id` = t.`id`
                    LEFT JOIN `media` fi ON t.`featured_image_id` = fi.`id`
                    LEFT JOIN `booking_customer_details` bcd ON b.`id` = bcd.`booking_id`
                    LEFT JOIN `booking_billing_addresses` bba ON b.`id` = bba.`booking_id`
                    WHERE {$whereSql}
                    ORDER BY {$sortBy} {$order}
                    LIMIT {$limit} OFFSET {$offset}";

        $rows = self::fetchAll($dataSql, $params);
        $items = array_map([self::class, 'formatBookingListItem'], $rows);

        $totalPages = $total > 0 ? (int) ceil($total / $limit) : 1;

        return [
            'items' => $items,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'total_pages' => $totalPages,
                'has_next' => $page < $totalPages,
                'has_prev' => $page > 1,
            ],
        ];
    }

    /**
     * Get aggregate booking stats.
     *
     * @return array
     */
    public static function getStats(): array
    {
        $sql = 'SELECT
            COUNT(*) AS total_bookings,
            SUM(CASE WHEN `booking_status` = "pending" THEN 1 ELSE 0 END) AS pending_count,
            SUM(CASE WHEN `booking_status` = "confirmed" THEN 1 ELSE 0 END) AS confirmed_count,
            SUM(CASE WHEN `booking_status` = "completed" THEN 1 ELSE 0 END) AS completed_count,
            SUM(CASE WHEN `booking_status` = "cancelled" THEN 1 ELSE 0 END) AS cancelled_count,
            SUM(CASE WHEN `booking_status` = "rejected" THEN 1 ELSE 0 END) AS rejected_count,
            SUM(CASE WHEN `booking_status` != "cancelled" AND `booking_status` != "rejected" THEN `total_price` ELSE 0 END) AS total_revenue,
            SUM(CASE WHEN DATE(`created_at`) = CURDATE() THEN 1 ELSE 0 END) AS today_count
        FROM `bookings`
        WHERE `deleted_at` IS NULL';

        $row = self::fetchOne($sql);

        return [
            'total' => (int) ($row['total_bookings'] ?? 0),
            'pending' => (int) ($row['pending_count'] ?? 0),
            'confirmed' => (int) ($row['confirmed_count'] ?? 0),
            'completed' => (int) ($row['completed_count'] ?? 0),
            'cancelled' => (int) ($row['cancelled_count'] ?? 0),
            'rejected' => (int) ($row['rejected_count'] ?? 0),
            'total_revenue' => (float) ($row['total_revenue'] ?? 0.0),
            'today_count' => (int) ($row['today_count'] ?? 0),
        ];
    }

    /**
     * Format row for list output.
     *
     * @param array $row
     * @return array
     */
    public static function formatBookingListItem(array $row): array
    {
        $customerName = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? ''));

        return [
            'id' => (int) $row['id'],
            'order_number' => $row['order_number'],
            'tour_id' => (int) $row['tour_id'],
            'tour' => [
                'id' => (int) $row['tour_id'],
                'title' => $row['tour_title'] ?? null,
                'slug' => $row['tour_slug'] ?? null,
                'tour_type' => $row['tour_type'] ?? null,
                'duration_days' => isset($row['duration_days']) ? (int) $row['duration_days'] : 1,
                'duration_text' => $row['duration_text'] ?? null,
                'image_path' => $row['tour_image_path'] ?? null,
            ],
            'customer' => [
                'name' => $customerName ?: 'Anonymous',
                'first_name' => $row['first_name'] ?? null,
                'last_name' => $row['last_name'] ?? null,
                'email' => $row['customer_email'] ?? null,
                'phone' => $row['customer_phone'] ?? null,
                'city' => $row['billing_city'] ?? null,
                'country' => $row['billing_country'] ?? null,
            ],
            'booking_date' => $row['booking_date'],
            'tickets_count' => (int) $row['tickets_count'],
            'unit_price' => (float) $row['unit_price'],
            'total_price' => (float) $row['total_price'],
            'currency' => $row['currency'],
            'booking_status' => $row['booking_status'],
            'payment_method' => $row['payment_method'],
            'payment_status' => $row['payment_status'],
            'created_at' => $row['created_at'],
        ];
    }

    /**
     * Format full booking details with customer, billing, tour, pricing tier, status history and payment.
     *
     * @param array $row
     * @return array
     */
    public static function formatBookingDetails(array $row): array
    {
        $bookingId = (int) $row['id'];

        // Customer details
        $custSql = 'SELECT * FROM `booking_customer_details` WHERE `booking_id` = :id LIMIT 1';
        $customer = self::fetchOne($custSql, [':id' => $bookingId]);

        // Billing address
        $billSql = 'SELECT * FROM `booking_billing_addresses` WHERE `booking_id` = :id LIMIT 1';
        $billing = self::fetchOne($billSql, [':id' => $bookingId]);

        // Status history
        $histSql = 'SELECT bsh.*, u.`name` AS changed_by_name, u.`email` AS changed_by_email
                    FROM `booking_status_history` bsh
                    LEFT JOIN `users` u ON bsh.`changed_by` = u.`id`
                    WHERE bsh.`booking_id` = :id
                    ORDER BY bsh.`created_at` ASC, bsh.`id` ASC';
        $historyRows = self::fetchAll($histSql, [':id' => $bookingId]);
        $statusHistory = array_map(function ($h) {
            return [
                'id' => (int) $h['id'],
                'previous_status' => $h['previous_status'],
                'new_status' => $h['new_status'],
                'changed_by' => $h['changed_by'] ? (int) $h['changed_by'] : null,
                'changed_by_name' => $h['changed_by_name'] ?? 'System / Customer',
                'notes' => $h['notes'],
                'created_at' => $h['created_at'],
            ];
        }, $historyRows);

        // Payments
        $paySql = 'SELECT * FROM `payments` WHERE `booking_id` = :id ORDER BY `created_at` DESC';
        $payments = self::fetchAll($paySql, [':id' => $bookingId]);

        $customerName = trim(($customer['first_name'] ?? '') . ' ' . ($customer['last_name'] ?? ''));

        return [
            'id' => $bookingId,
            'order_number' => $row['order_number'],
            'user_id' => $row['user_id'] ? (int) $row['user_id'] : null,
            'tour_id' => (int) $row['tour_id'],
            'tour' => [
                'id' => (int) $row['tour_id'],
                'title' => $row['tour_title'] ?? null,
                'slug' => $row['tour_slug'] ?? null,
                'tour_type' => $row['tour_type'] ?? null,
                'duration_days' => isset($row['duration_days']) ? (int) $row['duration_days'] : 1,
                'duration_text' => $row['duration_text'] ?? null,
                'destination_name' => $row['destination_name'] ?? null,
                'destination_slug' => $row['destination_slug'] ?? null,
                'image_path' => $row['tour_image_path'] ?? null,
                'image_name' => $row['tour_image_name'] ?? null,
            ],
            'pricing_tier_id' => $row['pricing_tier_id'] ? (int) $row['pricing_tier_id'] : null,
            'pricing_tier' => $row['tier_service_option'] ?? null,
            'booking_date' => $row['booking_date'],
            'tickets_count' => (int) $row['tickets_count'],
            'unit_price' => (float) $row['unit_price'],
            'subtotal' => (float) $row['subtotal'],
            'tax_amount' => (float) $row['tax_amount'],
            'discount_amount' => (float) $row['discount_amount'],
            'total_price' => (float) $row['total_price'],
            'currency' => $row['currency'],
            'booking_status' => $row['booking_status'],
            'payment_method' => $row['payment_method'],
            'payment_status' => $row['payment_status'],
            'customer_notes' => $row['customer_notes'],
            'admin_notes' => $row['admin_notes'],
            'first_name' => $row['first_name'] ?? ($customer['first_name'] ?? null),
            'middle_name' => $row['middle_name'] ?? ($customer['middle_name'] ?? null),
            'last_name' => $row['last_name'] ?? ($customer['last_name'] ?? null),
            'dial_code' => $row['dial_code'] ?? ($customer['dial_code'] ?? '+91'),
            'country' => $row['country'] ?? ($customer['country'] ?? 'India'),
            'destination_name' => $row['destination_name'] ?? ($row['tour_destination_name'] ?? null),
            'pickup_location' => $row['pickup_location'] ?? null,
            'arrival_date' => $row['arrival_date'] ?? $row['booking_date'],
            'departure_date' => $row['departure_date'] ?? null,
            'duration_days' => $row['duration_days'] ?? null,
            'adults_count' => isset($row['adults_count']) ? (int) $row['adults_count'] : (int) $row['tickets_count'],
            'children_count' => isset($row['children_count']) ? (int) $row['children_count'] : 0,
            'infants_count' => isset($row['infants_count']) ? (int) $row['infants_count'] : 0,
            'tour_types' => !empty($row['tour_types']) ? (json_decode($row['tour_types'], true) ?: $row['tour_types']) : [],
            'tour_guide_required' => !empty($row['tour_guide_required']),
            'preferred_language' => $row['preferred_language'] ?? null,
            'vehicle_preference' => $row['vehicle_preference'] ?? null,
            'airport_pickup' => !empty($row['airport_pickup']),
            'airport_drop' => !empty($row['airport_drop']),
            'hotel_category' => $row['hotel_category'] ?? null,
            'room_type' => $row['room_type'] ?? null,
            'rooms_count' => isset($row['rooms_count']) ? (int) $row['rooms_count'] : 1,
            'arrival_flight_train_number' => $row['arrival_flight_train_number'] ?? null,
            'arrival_time' => $row['arrival_time'] ?? null,
            'departure_flight_train_number' => $row['departure_flight_train_number'] ?? null,
            'departure_time' => $row['departure_time'] ?? null,
            'approximate_budget' => $row['approximate_budget'] ?? null,
            'budget_currency' => $row['budget_currency'] ?? 'INR',
            'passport_file_url' => $row['passport_file_url'] ?? null,
            'flight_ticket_url' => $row['flight_ticket_url'] ?? null,
            'preferred_contact_methods' => !empty($row['preferred_contact_methods']) ? (json_decode($row['preferred_contact_methods'], true) ?: $row['preferred_contact_methods']) : [],
            'special_requests' => $row['special_requests'] ?? null,
            'customer' => $customer ? [
                'name' => $customerName ?: trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? '')),
                'first_name' => $customer['first_name'] ?? ($row['first_name'] ?? null),
                'middle_name' => $customer['middle_name'] ?? ($row['middle_name'] ?? null),
                'last_name' => $customer['last_name'] ?? ($row['last_name'] ?? null),
                'dial_code' => $customer['dial_code'] ?? ($row['dial_code'] ?? '+91'),
                'country' => $customer['country'] ?? ($row['country'] ?? 'India'),
                'email' => $customer['email'] ?? null,
                'phone' => $customer['phone'] ?? null,
            ] : null,
            'billing_address' => $billing ? [
                'address_line1' => $billing['address_line1'],
                'address_line2' => $billing['address_line2'],
                'city' => $billing['city'],
                'state' => $billing['state'],
                'postal_code' => $billing['postal_code'],
                'country' => $billing['country'],
            ] : null,
            'status_history' => $statusHistory,
            'payments' => array_map(function ($p) {
                return [
                    'id' => (int) $p['id'],
                    'transaction_reference' => $p['transaction_reference'],
                    'payment_method' => $p['payment_method'],
                    'amount' => (float) $p['amount'],
                    'currency' => $p['currency'],
                    'status' => $p['status'],
                    'paid_at' => $p['paid_at'],
                    'created_at' => $p['created_at'],
                ];
            }, $payments),
            'customer_email_status' => $row['customer_email_status'] ?? 'pending',
            'customer_email_sent_at' => $row['customer_email_sent_at'] ?? null,
            'admin_email_status' => $row['admin_email_status'] ?? 'pending',
            'admin_email_sent_at' => $row['admin_email_sent_at'] ?? null,
            'email_send_count' => (int) ($row['email_send_count'] ?? 0),
            'last_email_attempt_at' => $row['last_email_attempt_at'] ?? null,
            'last_email_error' => $row['last_email_error'] ?? null,
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
            'deleted_at' => $row['deleted_at'] ?? null,
        ];
    }

    /**
     * Verify the provided plain access token against the stored SHA-256 hash in constant time.
     *
     * @param int $bookingId
     * @param string $token
     * @return bool
     */
    public static function verifyAccessToken(int $bookingId, string $token): bool
    {
        $token = trim($token);
        if ($token === '') {
            return false;
        }

        $sql = 'SELECT `access_token_hash` FROM `bookings` WHERE `id` = :id';
        $storedHash = (string) self::fetchColumn($sql, [':id' => $bookingId]);
        if ($storedHash === '') {
            return false;
        }

        return hash_equals($storedHash, hash('sha256', $token));
    }

    /**
     * Attempt to claim an email dispatch slot atomically with cooldown and max-limit checks.
     *
     * @param int $bookingId
     * @param int $cooldownSeconds Default 60 seconds
     * @param int $maxSends Default 3 sends
     * @return array [bool $allowed, string $code, ?string $message]
     */
    public static function claimEmailSendSlot(int $bookingId, int $cooldownSeconds = 60, int $maxSends = 3): array
    {
        Database::beginTransaction();
        try {
            $sql = 'SELECT `id`, `email_send_count`, `last_email_attempt_at`, TIMESTAMPDIFF(SECOND, `last_email_attempt_at`, NOW()) AS `elapsed_seconds`, `customer_email_status` FROM `bookings` WHERE `id` = :id FOR UPDATE';
            $row = self::fetchOne($sql, [':id' => $bookingId]);

            if (!$row) {
                Database::rollBack();
                return [false, 'NOT_FOUND', 'Booking record not found.'];
            }

            $sendCount = (int) ($row['email_send_count'] ?? 0);
            if ($sendCount >= $maxSends) {
                Database::rollBack();
                return [false, 'LIMIT_EXCEEDED', "Maximum email dispatch limit ({$maxSends} sends) has been reached for this booking."];
            }

            if (!empty($row['last_email_attempt_at']) && $row['elapsed_seconds'] !== null) {
                $elapsed = (int) $row['elapsed_seconds'];
                if ($elapsed < $cooldownSeconds) {
                    $remaining = $cooldownSeconds - $elapsed;
                    Database::rollBack();
                    return [false, 'COOLDOWN_ACTIVE', "Please wait {$remaining} seconds before requesting another email confirmation."];
                }
            }

            $updateSql = 'UPDATE `bookings` SET `last_email_attempt_at` = NOW() WHERE `id` = :id';
            self::execute($updateSql, [':id' => $bookingId]);

            Database::commit();
            return [true, 'CLAIMED', null];
        } catch (\Throwable $e) {
            Database::rollBack();
            return [false, 'DB_ERROR', $e->getMessage()];
        }
    }

    /**
     * Record the result of an email dispatch attempt.
     *
     * @param int $bookingId
     * @param bool $custSent
     * @param string|null $custError
     * @param bool $adminSent
     * @param string|null $adminError
     * @return void
     */
    public static function recordEmailDispatchResult(
        int $bookingId,
        bool $custSent,
        ?string $custError,
        bool $adminSent,
        ?string $adminError
    ): void {
        $fields = [];
        $params = [':id' => $bookingId];

        if ($custSent) {
            $fields[] = '`customer_email_status` = "sent"';
            $fields[] = '`customer_email_sent_at` = NOW()';
            $fields[] = '`email_send_count` = `email_send_count` + 1';
            $fields[] = '`last_email_error` = NULL';
        } else {
            $fields[] = '`customer_email_status` = "failed"';
            if ($custError) {
                $fields[] = '`last_email_error` = :err';
                $params[':err'] = substr($custError, 0, 255);
            }
        }

        if ($adminSent) {
            $fields[] = '`admin_email_status` = "sent"';
            $fields[] = '`admin_email_sent_at` = NOW()';
        } else {
            $fields[] = '`admin_email_status` = "failed"';
        }

        if (!empty($fields)) {
            $sql = 'UPDATE `bookings` SET ' . implode(', ', $fields) . ', `updated_at` = NOW() WHERE `id` = :id';
            self::execute($sql, $params);
        }
    }
}
