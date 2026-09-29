<?php

namespace App\Models;

class TourAvailability extends BaseModel
{
    /**
     * Whether a tour has opted into date-based availability at all.
     * Tours with no rows here keep the legacy global available_seats/total_seats behaviour.
     */
    public static function tourUsesDateAvailability(int $tourId): bool
    {
        return (int) self::fetchColumn(
            'SELECT COUNT(*) FROM `tour_availability_dates` WHERE `tour_id` = :id',
            [':id' => $tourId]
        ) > 0;
    }

    /**
     * List all configured dates for a tour (past and future), most recent first.
     */
    public static function listForTour(int $tourId): array
    {
        $rows = self::fetchAll(
            'SELECT * FROM `tour_availability_dates` WHERE `tour_id` = :id ORDER BY `travel_date` ASC',
            [':id' => $tourId]
        );

        return array_map([self::class, 'format'], $rows);
    }

    /**
     * List only upcoming (today or later) dates for a tour — used on public tour pages.
     */
    public static function listUpcomingForTour(int $tourId): array
    {
        $rows = self::fetchAll(
            'SELECT * FROM `tour_availability_dates` WHERE `tour_id` = :id AND `travel_date` >= CURDATE() ORDER BY `travel_date` ASC',
            [':id' => $tourId]
        );

        return array_map([self::class, 'format'], $rows);
    }

    public static function findForDate(int $tourId, string $date): ?array
    {
        $row = self::fetchOne(
            'SELECT * FROM `tour_availability_dates` WHERE `tour_id` = :id AND `travel_date` = :date LIMIT 1',
            [':id' => $tourId, ':date' => $date]
        );

        return $row ? self::format($row) : null;
    }

    /**
     * Create or update the capacity/status for one travel date.
     */
    public static function upsert(int $tourId, string $date, array $data): array
    {
        $existing = self::fetchOne(
            'SELECT id FROM `tour_availability_dates` WHERE `tour_id` = :id AND `travel_date` = :date LIMIT 1',
            [':id' => $tourId, ':date' => $date]
        );

        $totalSeats = isset($data['total_seats']) ? max(0, (int) $data['total_seats']) : 20;
        $isClosed = !empty($data['is_closed']) ? 1 : 0;
        $cutoffHours = isset($data['booking_cutoff_hours']) ? max(0, (int) $data['booking_cutoff_hours']) : 24;

        if ($existing) {
            self::execute(
                'UPDATE `tour_availability_dates`
                 SET `total_seats` = :total_seats, `is_closed` = :is_closed, `booking_cutoff_hours` = :cutoff, `updated_at` = NOW()
                 WHERE `id` = :id',
                [
                    ':total_seats' => $totalSeats,
                    ':is_closed' => $isClosed,
                    ':cutoff' => $cutoffHours,
                    ':id' => $existing['id'],
                ]
            );
            $id = (int) $existing['id'];
        } else {
            self::execute(
                'INSERT INTO `tour_availability_dates`
                    (`tour_id`, `travel_date`, `total_seats`, `booked_seats`, `is_closed`, `booking_cutoff_hours`, `created_at`, `updated_at`)
                 VALUES (:tour_id, :travel_date, :total_seats, 0, :is_closed, :cutoff, NOW(), NOW())',
                [
                    ':tour_id' => $tourId,
                    ':travel_date' => $date,
                    ':total_seats' => $totalSeats,
                    ':is_closed' => $isClosed,
                    ':cutoff' => $cutoffHours,
                ]
            );
            $id = (int) self::lastInsertId();
        }

        $row = self::fetchOne('SELECT * FROM `tour_availability_dates` WHERE `id` = :id', [':id' => $id]);
        return self::format($row);
    }

    public static function deleteForDate(int $tourId, string $date): bool
    {
        return self::execute(
            'DELETE FROM `tour_availability_dates` WHERE `tour_id` = :id AND `travel_date` = :date',
            [':id' => $tourId, ':date' => $date]
        ) > 0;
    }

    /**
     * Atomically reserve seats for a booking on a specific date. Returns true on success,
     * false if the date is closed, sold out, past its cutoff, or not configured at all.
     * Uses a single conditional UPDATE so concurrent bookings can't oversell.
     */
    public static function reserveSeats(int $tourId, string $date, int $ticketsCount): bool
    {
        $affected = self::execute(
            'UPDATE `tour_availability_dates`
             SET `booked_seats` = `booked_seats` + :tickets_add, `updated_at` = NOW()
             WHERE `tour_id` = :tour_id
               AND `travel_date` = :date
               AND `is_closed` = 0
               AND (`total_seats` - `booked_seats`) >= :tickets_check
               AND (
                   `travel_date` > CURDATE()
                   OR (`travel_date` = CURDATE() AND TIME_TO_SEC(TIMEDIFF(CONCAT(`travel_date`, " 23:59:59"), NOW())) >= `booking_cutoff_hours` * 3600)
               )',
            [':tickets_add' => $ticketsCount, ':tickets_check' => $ticketsCount, ':tour_id' => $tourId, ':date' => $date]
        );

        return $affected > 0;
    }

    /**
     * Release previously reserved seats (e.g. on booking cancellation).
     */
    public static function releaseSeats(int $tourId, string $date, int $ticketsCount): void
    {
        self::execute(
            'UPDATE `tour_availability_dates`
             SET `booked_seats` = GREATEST(0, `booked_seats` - :tickets), `updated_at` = NOW()
             WHERE `tour_id` = :tour_id AND `travel_date` = :date',
            [':tickets' => $ticketsCount, ':tour_id' => $tourId, ':date' => $date]
        );
    }

    private static function format(array $row): array
    {
        $totalSeats = (int) $row['total_seats'];
        $bookedSeats = (int) $row['booked_seats'];
        $availableSeats = max(0, $totalSeats - $bookedSeats);
        $isClosed = (bool) $row['is_closed'];

        $cutoffPassed = false;
        $travelDate = $row['travel_date'];
        if ($travelDate < date('Y-m-d')) {
            $cutoffPassed = true;
        } elseif ($travelDate === date('Y-m-d')) {
            $cutoffSeconds = (int) $row['booking_cutoff_hours'] * 3600;
            $secondsUntilEndOfDay = strtotime($travelDate . ' 23:59:59') - time();
            $cutoffPassed = $secondsUntilEndOfDay < $cutoffSeconds;
        }

        if ($isClosed) {
            $status = 'closed';
        } elseif ($travelDate < date('Y-m-d') || $cutoffPassed) {
            $status = 'booking_closed';
        } elseif ($availableSeats <= 0) {
            $status = 'full';
        } elseif ($availableSeats <= 5) {
            $status = 'low';
        } else {
            $status = 'available';
        }

        return [
            'id' => (int) $row['id'],
            'tour_id' => (int) $row['tour_id'],
            'travel_date' => $travelDate,
            'total_seats' => $totalSeats,
            'booked_seats' => $bookedSeats,
            'available_seats' => $availableSeats,
            'is_closed' => $isClosed,
            'booking_cutoff_hours' => (int) $row['booking_cutoff_hours'],
            'status' => $status,
            'is_bookable' => $status === 'available' || $status === 'low',
        ];
    }
}
