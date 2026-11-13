<?php

namespace App\Services;

use App\Utils\Env;
use Throwable;

class SmsService
{
    /**
     * Check if external SMS gateway credentials exist.
     *
     * @return bool
     */
    public static function isConfigured(): bool
    {
        $apiKey = trim((string) Env::get('SMS_API_KEY', ''));
        $gatewayUrl = trim((string) Env::get('SMS_GATEWAY_URL', ''));
        return ($apiKey !== '' || $gatewayUrl !== '');
    }

    /**
     * Dispatch SMS message via configured gateway or local audit log simulator.
     *
     * @param string $to Recipient phone number with country code
     * @param string $message Text content of the SMS
     * @return array [bool $success, ?string $errorMessage, ?string $responsePayload]
     */
    public static function send(string $to, string $message): array
    {
        $cleanPhone = preg_replace('/[^0-9+]/', '', trim($to));
        if ($cleanPhone === '' || strlen($cleanPhone) < 8) {
            return [false, 'Invalid phone number supplied for SMS delivery.', null];
        }

        // If external gateway is configured, invoke HTTP gateway
        if (self::isConfigured()) {
            $gatewayUrl = (string) Env::get('SMS_GATEWAY_URL', '');
            $apiKey = (string) Env::get('SMS_API_KEY', '');
            $senderId = (string) Env::get('SMS_SENDER_ID', 'WNDRER');

            try {
                $ch = curl_init();
                $postData = [
                    'api_key' => $apiKey,
                    'sender' => $senderId,
                    'to' => $cleanPhone,
                    'message' => $message,
                ];

                curl_setopt($ch, CURLOPT_URL, $gatewayUrl);
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 10);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

                $response = curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                $err = curl_error($ch);
                curl_close($ch);

                if ($err) {
                    error_log("[Wanderer SMS Error] cURL failure to {$cleanPhone}: {$err}");
                    return [false, "cURL SMS error: {$err}", null];
                }

                if ($httpCode >= 200 && $httpCode < 300) {
                    error_log("[Wanderer SMS Delivered] Sent to {$cleanPhone}: {$message}");
                    return [true, null, (string) $response];
                }

                error_log("[Wanderer SMS HTTP Error] Gateway responded with {$httpCode}: {$response}");
                return [false, "Gateway returned HTTP {$httpCode}", (string) $response];
            } catch (Throwable $e) {
                error_log("[Wanderer SMS Exception] {$e->getMessage()}");
                return [false, $e->getMessage(), null];
            }
        }

        // Non-gateway / Dev Simulation mode (records cleanly to server log)
        error_log("[Wanderer SMS Simulation] To: {$cleanPhone} | Body: {$message}");
        return [true, null, 'SIMULATED_SUCCESS'];
    }

    /**
     * Send initial booking request SMS to customer.
     *
     * @param array $booking
     * @return array
     */
    public static function sendCustomerBookingRequestSms(array $booking): array
    {
        $phone = $booking['customer']['phone'] ?? ($booking['phone'] ?? '');
        $name = $booking['customer']['name'] ?? ($booking['first_name'] ?? 'Guest');
        $tourTitle = $booking['tour']['title'] ?? ($booking['destination_name'] ?? 'South India Tour');
        $date = $booking['arrival_date'] ?? ($booking['booking_date'] ?? date('Y-m-d'));
        $orderNumber = $booking['order_number'] ?? ('#' . ($booking['id'] ?? ''));

        $msg = "Hello {$name}, your booking request for {$tourTitle} on {$date} has been received (Ref: {$orderNumber}). Our team will contact you shortly to discuss tour payment & confirmation. Wanderer South India";
        return self::send($phone, $msg);
    }

    /**
     * Send initial booking request alert SMS to admin.
     *
     * @param array $booking
     * @return array
     */
    public static function sendAdminBookingRequestSms(array $booking): array
    {
        $adminPhone = trim((string) Env::get('ADMIN_PHONE', '+919840291110'));
        $customerName = $booking['customer']['name'] ?? trim(($booking['first_name'] ?? '') . ' ' . ($booking['last_name'] ?? ''));
        $customerPhone = $booking['customer']['phone'] ?? ($booking['phone'] ?? '');
        $tourTitle = $booking['tour']['title'] ?? ($booking['destination_name'] ?? 'Tour');
        $date = $booking['arrival_date'] ?? ($booking['booking_date'] ?? date('Y-m-d'));
        $orderNumber = $booking['order_number'] ?? ('#' . ($booking['id'] ?? ''));

        $msg = "New Tour Booking Request: {$orderNumber} by {$customerName} ({$customerPhone}) for {$tourTitle} on {$date}. Status: PENDING. Please contact customer.";
        return self::send($adminPhone, $msg);
    }

    /**
     * Send confirmed ticket SMS to customer.
     *
     * @param array $booking
     * @param string|null $ticketNumber
     * @return array
     */
    public static function sendCustomerConfirmationSms(array $booking, ?string $ticketNumber = null): array
    {
        $phone = $booking['customer']['phone'] ?? ($booking['phone'] ?? '');
        $name = $booking['customer']['name'] ?? ($booking['first_name'] ?? 'Guest');
        $tourTitle = $booking['tour']['title'] ?? ($booking['destination_name'] ?? 'South India Tour');
        $date = $booking['arrival_date'] ?? ($booking['booking_date'] ?? date('Y-m-d'));
        $orderNumber = $booking['order_number'] ?? '';
        $ticket = $ticketNumber ?: ($booking['ticket_number'] ?? $orderNumber);
        $currency = $booking['currency'] ?? 'INR';
        $price = number_format((float) ($booking['agreed_price'] ?? ($booking['total_price'] ?? 0)), 2);

        $msg = "CONFIRMED! Dear {$name}, your booking for {$tourTitle} on {$date} is CONFIRMED. Ticket No: {$ticket}, Ref: {$orderNumber}. Confirmed Price: {$currency} {$price}. Confirmation voucher emailed. Wanderer South India";
        return self::send($phone, $msg);
    }

    /**
     * Send booking confirmed notice SMS to admin.
     *
     * @param array $booking
     * @param string|null $ticketNumber
     * @return array
     */
    public static function sendAdminConfirmationSms(array $booking, ?string $ticketNumber = null): array
    {
        $adminPhone = trim((string) Env::get('ADMIN_PHONE', '+919840291110'));
        $orderNumber = $booking['order_number'] ?? '';
        $ticket = $ticketNumber ?: ($booking['ticket_number'] ?? $orderNumber);
        $tourTitle = $booking['tour']['title'] ?? 'Tour';
        $customerName = $booking['customer']['name'] ?? ($booking['first_name'] ?? 'Customer');

        $msg = "Booking {$orderNumber} CONFIRMED! Ticket: {$ticket}. Customer: {$customerName}. Tour: {$tourTitle}. Ticket PDF dispatched to customer.";
        return self::send($adminPhone, $msg);
    }

    /**
     * Send booking cancellation notice SMS to customer.
     *
     * @param array $booking
     * @param string|null $reason
     * @return array
     */
    public static function sendCustomerCancellationSms(array $booking, ?string $reason = null): array
    {
        $phone = $booking['customer']['phone'] ?? ($booking['phone'] ?? '');
        $orderNumber = $booking['order_number'] ?? '';
        $reasonText = $reason ? " Reason: {$reason}." : '';

        $msg = "Booking Update: Your booking {$orderNumber} with Wanderer South India has been CANCELLED.{$reasonText} Please contact us for questions.";
        return self::send($phone, $msg);
    }

    /**
     * Send booking rejection notice SMS to customer.
     *
     * @param array $booking
     * @param string|null $reason
     * @return array
     */
    public static function sendCustomerRejectionSms(array $booking, ?string $reason = null): array
    {
        $phone = $booking['customer']['phone'] ?? ($booking['phone'] ?? '');
        $orderNumber = $booking['order_number'] ?? '';
        $reasonText = $reason ? " Note: {$reason}." : '';

        $msg = "Booking Update: We are unable to confirm booking {$orderNumber} at this time.{$reasonText} Contact support at +91 9840291110 for alternatives.";
        return self::send($phone, $msg);
    }
}
