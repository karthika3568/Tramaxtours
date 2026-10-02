<?php

namespace App\Services;

use App\Utils\Env;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;
use Throwable;

class MailService
{
    /**
     * Send the booking confirmation email with the PDF receipt attached.
     * Best-effort: failures are logged, never thrown, so a mail outage can't
     * break the booking checkout flow itself.
     *
     * @param array $booking Formatted booking (Booking::formatBookingDetails() shape)
     * @param string $pdfPath Absolute path to the generated receipt PDF
     * @param string $receiptUrl Signed, access-controlled URL the customer can use to
     *                           re-download the receipt later (e.g. from a different device)
     * @return bool
     */
    public static function sendBookingConfirmation(array $booking, string $pdfPath, string $receiptUrl): bool
    {
        $toEmail = $booking['customer']['email'] ?? null;
        if (!$toEmail) {
            return false;
        }

        try {
            $mailer = new PHPMailer(true);
            $mailer->isSMTP();
            $mailer->Host = Env::get('MAIL_HOST', '127.0.0.1');
            $mailer->Port = (int) Env::get('MAIL_PORT', 1025);
            $mailer->SMTPAuth = (bool) Env::get('MAIL_USERNAME', '');

            if ($mailer->SMTPAuth) {
                $mailer->Username = (string) Env::get('MAIL_USERNAME', '');
                $mailer->Password = (string) Env::get('MAIL_PASSWORD', '');
            }

            $encryption = (string) Env::get('MAIL_ENCRYPTION', '');
            if ($encryption === 'tls') {
                $mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            } elseif ($encryption === 'ssl') {
                $mailer->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            } else {
                $mailer->SMTPAutoTLS = false;
            }

            $mailer->setFrom(
                (string) Env::get('MAIL_FROM_ADDRESS', 'bookings@wanderersouthindia.com'),
                (string) Env::get('MAIL_FROM_NAME', 'Wanderer South India')
            );
            $mailer->addAddress($toEmail, $booking['customer']['name'] ?? '');
            $mailer->addAttachment($pdfPath, 'WandererSouthIndia-Receipt-' . $booking['order_number'] . '.pdf');

            $mailer->isHTML(true);
            $mailer->Subject = 'Your Wanderer South India Booking Confirmation — ' . $booking['order_number'];
            $mailer->Body = self::renderEmailHtml($booking, $receiptUrl);
            $mailer->AltBody = self::renderEmailPlainText($booking, $receiptUrl);

            $mailer->send();
            return true;
        } catch (PHPMailerException|Throwable $e) {
            error_log('[Wanderer Mail Error] Failed to send booking confirmation for ' . $booking['order_number'] . ': ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Whether outgoing mail has been configured at all (a MAIL_HOST is set).
     * Used so callers can honestly report email_status = 'not_configured'
     * instead of attempting a send that was never going to work.
     *
     * @return bool
     */
    public static function isConfigured(): bool
    {
        return trim((string) Env::get('MAIL_HOST', '')) !== '';
    }

    /**
     * Send the "trip request received" acknowledgement email to the customer.
     * Best-effort: failures are logged, never thrown. Never attaches any of
     * the customer's private documents (passport/ticket) — those stay
     * admin-only, downloadable only through the protected API endpoint.
     *
     * @param array $tripRequest TripRequest::format() shape
     * @return bool
     */
    public static function sendTripRequestReceived(array $tripRequest): bool
    {
        $toEmail = $tripRequest['email'] ?? null;
        if (!$toEmail) {
            return false;
        }

        try {
            $mailer = new PHPMailer(true);
            $mailer->isSMTP();
            $mailer->Host = Env::get('MAIL_HOST', '127.0.0.1');
            $mailer->Port = (int) Env::get('MAIL_PORT', 1025);
            $mailer->SMTPAuth = (bool) Env::get('MAIL_USERNAME', '');

            if ($mailer->SMTPAuth) {
                $mailer->Username = (string) Env::get('MAIL_USERNAME', '');
                $mailer->Password = (string) Env::get('MAIL_PASSWORD', '');
            }

            $encryption = (string) Env::get('MAIL_ENCRYPTION', '');
            if ($encryption === 'tls') {
                $mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            } elseif ($encryption === 'ssl') {
                $mailer->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            } else {
                $mailer->SMTPAutoTLS = false;
            }

            $mailer->setFrom(
                (string) Env::get('MAIL_FROM_ADDRESS', 'bookings@wanderersouthindia.com'),
                (string) Env::get('MAIL_FROM_NAME', 'Wanderer South India')
            );
            $mailer->addAddress($toEmail, $tripRequest['full_name'] ?? '');

            $mailer->isHTML(true);
            $mailer->Subject = 'Trip Request Received — ' . $tripRequest['reference_id'] . ' | Wanderer South India';
            $mailer->Body = self::renderTripRequestHtml($tripRequest);
            $mailer->AltBody = self::renderTripRequestPlainText($tripRequest);

            $mailer->send();
            return true;
        } catch (PHPMailerException|Throwable $e) {
            error_log('[Wanderer Mail Error] Failed to send trip request acknowledgement for ' . $tripRequest['reference_id'] . ': ' . $e->getMessage());
            return false;
        }
    }

    private static function renderTripRequestHtml(array $tr): string
    {
        $e = fn($v) => htmlspecialchars((string) ($v ?? ''), ENT_QUOTES, 'UTF-8');
        $destinationOrTour = $tr['tour_title'] ?? $tr['destination_name'] ?? 'South India';
        $dates = $tr['trip_start_date']
            ? $e($tr['trip_start_date']) . ($tr['trip_end_date'] ? ' – ' . $e($tr['trip_end_date']) : '')
            : 'To be finalized';
        $travelers = ((int) $tr['adults_count']) + ((int) $tr['children_count']) + ((int) $tr['infants_count']);

        return <<<HTML
<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0B1329;">
    <div style="background: linear-gradient(135deg, #01AA90, #01806C); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">Wanderer South India</h1>
        <p style="color: #e6f7f4; margin: 4px 0 0;">Trip Request Received!</p>
    </div>
    <div style="border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
        <p>Hi {$e($tr['full_name'])},</p>
        <p>Thank you for reaching out to Wanderer South India. We've received your trip request and our travel team will contact you shortly to help plan your journey.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 6px 0; color: #64748b;">Reference ID</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">{$e($tr['reference_id'])}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Interested In</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">{$e($destinationOrTour)}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Travel Dates</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">{$dates}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Travelers</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">{$e((string) $travelers)}</td></tr>
        </table>
        <p>Please keep your reference ID handy for any follow-up communication.</p>
        <p style="color: #64748b; font-size: 12px;">If you have any questions in the meantime, reply to this email or contact us on WhatsApp at +91 80725 66010.</p>
    </div>
</div>
HTML;
    }

    private static function renderTripRequestPlainText(array $tr): string
    {
        $destinationOrTour = $tr['tour_title'] ?? $tr['destination_name'] ?? 'South India';
        $dates = $tr['trip_start_date']
            ? $tr['trip_start_date'] . ($tr['trip_end_date'] ? ' - ' . $tr['trip_end_date'] : '')
            : 'To be finalized';
        $travelers = ((int) $tr['adults_count']) + ((int) $tr['children_count']) + ((int) $tr['infants_count']);

        return "Hi " . $tr['full_name'] . ",\n\n"
            . "Thank you for reaching out to Wanderer South India. We've received your trip request and our travel team will contact you shortly.\n\n"
            . "Reference ID: {$tr['reference_id']}\n"
            . "Interested In: {$destinationOrTour}\n"
            . "Travel Dates: {$dates}\n"
            . "Travelers: {$travelers}\n\n"
            . "Please keep your reference ID handy for any follow-up communication.\n\n"
            . "Thank you for choosing Wanderer South India.";
    }

    private static function renderEmailHtml(array $booking, string $receiptUrl): string
    {
        $e = fn($v) => htmlspecialchars((string) ($v ?? ''), ENT_QUOTES, 'UTF-8');
        $customer = $booking['customer'] ?? [];
        $tour = $booking['tour'] ?? [];
        $currency = $booking['currency'] ?? 'INR';
        $total = $currency . ' ' . number_format((float) $booking['total_price'], 2);

        return <<<HTML
<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0B1329;">
    <div style="background: linear-gradient(135deg, #01AA90, #01806C); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">Wanderer South India</h1>
        <p style="color: #e6f7f4; margin: 4px 0 0;">Booking Confirmed!</p>
    </div>
    <div style="border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
        <p>Hi {$e($customer['name'] ?? 'Traveler')},</p>
        <p>Thank you for booking with Wanderer South India. Here are your reservation details:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 6px 0; color: #64748b;">Order Number</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">{$e($booking['order_number'])}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Tour</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">{$e($tour['title'] ?? '')}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Destination</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">{$e($tour['destination_name'] ?? '')}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Travel Date</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">{$e($booking['booking_date'])}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Guests</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">{$e($booking['tickets_count'])}</td></tr>
            <tr><td style="padding: 10px 0; color: #64748b; border-top: 1px solid #e2e8f0;">Total</td><td style="padding: 10px 0; font-weight: bold; text-align: right; border-top: 1px solid #e2e8f0;">{$e($total)}</td></tr>
        </table>
        <p>Your receipt is attached as a PDF. You can also download it any time using the secure link below:</p>
        <p style="text-align: center; margin: 20px 0;">
            <a href="{$e($receiptUrl)}" style="background: #01AA90; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Download Receipt (PDF)</a>
        </p>
        <p style="color: #64748b; font-size: 12px;">Payment: {$e(str_replace('_', ' ', ucwords((string) $booking['payment_method'], '_')))}. If you have any questions, reply to this email or contact info@wanderersouthindia.com.</p>
    </div>
</div>
HTML;
    }

    private static function renderEmailPlainText(array $booking, string $receiptUrl): string
    {
        $customer = $booking['customer'] ?? [];
        $tour = $booking['tour'] ?? [];
        $currency = $booking['currency'] ?? 'INR';
        $total = $currency . ' ' . number_format((float) $booking['total_price'], 2);

        return "Hi " . ($customer['name'] ?? 'Traveler') . ",\n\n"
            . "Thank you for booking with Wanderer South India.\n\n"
            . "Order Number: {$booking['order_number']}\n"
            . "Tour: " . ($tour['title'] ?? '') . "\n"
            . "Destination: " . ($tour['destination_name'] ?? '') . "\n"
            . "Travel Date: {$booking['booking_date']}\n"
            . "Guests: {$booking['tickets_count']}\n"
            . "Total: {$total}\n\n"
            . "Download your receipt: {$receiptUrl}\n\n"
            . "Thank you for choosing Wanderer South India.";
    }
}
