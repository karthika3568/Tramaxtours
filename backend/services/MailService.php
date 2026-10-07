<?php

namespace App\Services;

use App\Utils\Env;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;
use Throwable;

class MailService
{
    /**
     * Check if SMTP configuration exists and is complete in environment variables.
     * When MAIL_HOST is configured, if MAIL_USERNAME is provided, password is also required.
     * If MAIL_USERNAME is empty, it operates in unauthenticated mode (e.g. Mailpit/local dev relay).
     *
     * @return array [bool $isConfigured, array $missingKeys]
     */
    public static function checkSmtpConfiguration(): array
    {
        $host = trim((string) Env::get('MAIL_HOST', ''));
        if ($host === '') {
            return [false, ['MAIL_HOST']];
        }

        $username = trim((string) Env::get('MAIL_USERNAME', ''));
        if ($username !== '') {
            $password = trim((string) Env::get('MAIL_PASSWORD', ''));
            if ($password === '') {
                return [false, ['MAIL_PASSWORD']];
            }
        }

        return [true, []];
    }

    /**
     * Sanitize header strings against CR/LF header injection attacks.
     *
     * @param string $input
     * @return string
     * @throws \InvalidArgumentException if CRLF injection is detected
     */
    public static function sanitizeHeader(string $input): string
    {
        if (preg_match('/[\r\n]/', $input)) {
            throw new \InvalidArgumentException('Header injection attempt detected: carriage return or line feed in header value.');
        }
        return trim($input);
    }

    /**
     * Build and configure a PHPMailer instance using current environment settings.
     *
     * @return PHPMailer
     * @throws PHPMailerException
     */
    private static function createMailer(): PHPMailer
    {
        $mailer = new PHPMailer(true);
        $mailer->isSMTP();
        $mailer->CharSet = 'UTF-8';
        $mailer->Timeout = 12; // Prevent hanging on dead SMTP servers

        $host = (string) Env::get('MAIL_HOST', '127.0.0.1');
        $port = (int) Env::get('MAIL_PORT', 587);
        $username = trim((string) Env::get('MAIL_USERNAME', ''));
        $password = (string) Env::get('MAIL_PASSWORD', '');
        $encryption = strtolower(trim((string) Env::get('MAIL_ENCRYPTION', 'tls')));

        $mailer->Host = $host;
        $mailer->Port = $port;

        // Authentication is enabled only when a username is provided
        if ($username !== '') {
            $mailer->SMTPAuth = true;
            $mailer->Username = $username;
            $mailer->Password = $password;
        } else {
            $mailer->SMTPAuth = false;
        }

        // Encryption configuration
        if ($encryption === 'tls' || ($encryption === '' && $port === 587)) {
            $mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mailer->SMTPAutoTLS = true;
        } elseif ($encryption === 'ssl' || ($encryption === '' && $port === 465)) {
            $mailer->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        } else {
            $mailer->SMTPSecure = '';
            $mailer->SMTPAutoTLS = false;
        }

        // Production TLS verification is maintained (do not disable verification)
        $fromEmail = (string) (Env::get('MAIL_FROM_ADDRESS') ?: Env::get('FROM_EMAIL', 'bookings@wanderersouthindia.com'));
        $fromName = (string) (Env::get('MAIL_FROM_NAME') ?: Env::get('FROM_NAME', 'Wanderer South India'));

        $cleanFromEmail = self::sanitizeHeader($fromEmail);
        $cleanFromName = self::sanitizeHeader($fromName);

        $mailer->setFrom($cleanFromEmail, $cleanFromName);
        $mailer->addReplyTo($cleanFromEmail, $cleanFromName);

        // Keep SMTP debug output off outside explicit local debug
        $mailer->SMTPDebug = 0;

        return $mailer;
    }

    /**
     * Send the booking confirmation ticket email to the customer.
     *
     * @param array $booking Formatted booking details
     * @param string|null $pdfPath Absolute path to the generated receipt PDF
     * @param string|null $receiptUrl Secure download URL
     * @return array [bool $success, ?string $errorMessage]
     */
    public static function sendCustomerTicket(array $booking, ?string $pdfPath = null, ?string $receiptUrl = null): array
    {
        $toEmail = trim((string) ($booking['customer']['email'] ?? ''));
        if ($toEmail === '' || !filter_var($toEmail, FILTER_VALIDATE_EMAIL)) {
            return [false, 'A valid customer recipient email address is required on the booking record.'];
        }

        [$isConfigured, $missing] = self::checkSmtpConfiguration();
        if (!$isConfigured) {
            $missingStr = implode(', ', $missing);
            $msg = "SMTP is not configured on the server. Missing: {$missingStr} in backend/.env.";
            error_log('[Wanderer Mail Notice] ' . $msg);
            return [false, $msg];
        }

        try {
            $cleanToEmail = self::sanitizeHeader($toEmail);
            $cleanCustomerName = self::sanitizeHeader((string) ($booking['customer']['name'] ?? 'Valued Guest'));
            $orderNumber = self::sanitizeHeader((string) ($booking['order_number'] ?? 'Reservation'));

            $mailer = self::createMailer();
            $mailer->addAddress($cleanToEmail, $cleanCustomerName);

            if ($pdfPath && file_exists($pdfPath)) {
                $attachmentName = 'Tour-Ticket-' . $orderNumber . '.pdf';
                $mailer->addAttachment($pdfPath, $attachmentName, 'base64', 'application/pdf');
            }

            $mailer->isHTML(true);
            $mailer->Subject = "Booking Confirmed — {$orderNumber} | Wanderer South India";
            $mailer->Body = self::renderCustomerEmailHtml($booking, $receiptUrl);
            $mailer->AltBody = self::renderCustomerEmailPlainText($booking, $receiptUrl);

            $mailer->send();
            return [true, null];
        } catch (PHPMailerException|Throwable $e) {
            $errorMsg = $e->getMessage();
            error_log("[Wanderer Mail Error] Failed customer ticket dispatch for {$booking['order_number']}: {$errorMsg}");
            return [false, "SMTP delivery failed: {$errorMsg}"];
        }
    }

    /**
     * Send an internal booking notification copy to the administrator.
     * Dispatched as a separate SMTP message (no CC/BCC leakage).
     *
     * @param array $booking Formatted booking details
     * @param string|null $pdfPath Absolute path to the generated receipt PDF
     * @return array [bool $success, ?string $errorMessage]
     */
    public static function sendAdminNotification(array $booking, ?string $pdfPath = null): array
    {
        $adminEmail = trim((string) (Env::get('ADMIN_EMAIL') ?: 'admin@wanderersouthindia.com'));
        if ($adminEmail === '' || !filter_var($adminEmail, FILTER_VALIDATE_EMAIL)) {
            return [false, 'A valid ADMIN_EMAIL address must be configured.'];
        }

        [$isConfigured, $missing] = self::checkSmtpConfiguration();
        if (!$isConfigured) {
            $missingStr = implode(', ', $missing);
            return [false, "SMTP is not configured. Missing: {$missingStr}"];
        }

        try {
            $cleanAdminEmail = self::sanitizeHeader($adminEmail);
            $orderNumber = self::sanitizeHeader((string) ($booking['order_number'] ?? 'Reservation'));

            $mailer = self::createMailer();
            $mailer->addAddress($cleanAdminEmail, 'Admin — Wanderer South India');

            if ($pdfPath && file_exists($pdfPath)) {
                $attachmentName = 'Tour-Ticket-' . $orderNumber . '.pdf';
                $mailer->addAttachment($pdfPath, $attachmentName, 'base64', 'application/pdf');
            }

            $mailer->isHTML(true);
            $mailer->Subject = "New Tour Booking — {$orderNumber}";
            $mailer->Body = self::renderAdminEmailHtml($booking);
            $mailer->AltBody = self::renderAdminEmailPlainText($booking);

            $mailer->send();
            return [true, null];
        } catch (PHPMailerException|Throwable $e) {
            $errorMsg = $e->getMessage();
            error_log("[Wanderer Mail Error] Failed admin notification for {$booking['order_number']}: {$errorMsg}");
            return [false, "SMTP admin dispatch failed: {$errorMsg}"];
        }
    }

    /**
     * Legacy wrapper for backward compatibility. Dispatches customer email and admin copy.
     *
     * @param array $booking
     * @param string $pdfPath
     * @param string $receiptUrl
     * @return array [bool $success, ?string $errorMessage]
     */
    public static function sendBookingConfirmation(array $booking, string $pdfPath, string $receiptUrl): array
    {
        [$custSent, $custError] = self::sendCustomerTicket($booking, $pdfPath, $receiptUrl);
        // Best-effort admin copy
        self::sendAdminNotification($booking, $pdfPath);

        return [$custSent, $custError];
    }

    /**
     * Render the clean, responsive, inline-CSS HTML customer confirmation ticket.
     */
    private static function renderCustomerEmailHtml(array $booking, ?string $receiptUrl): string
    {
        $e = fn($v) => htmlspecialchars((string) ($v ?? ''), ENT_QUOTES, 'UTF-8');
        $customer = $booking['customer'] ?? [];
        $tour = $booking['tour'] ?? [];
        $currency = $booking['currency'] ?? 'INR';
        $total = $currency . ' ' . number_format((float) $booking['total_price'], 2);

        $travelDate = $booking['arrival_date'] ?? $booking['booking_date'] ?? date('Y-m-d');
        $pickup = $booking['pickup_location'] ?? 'Hotel / Airport Pickup';
        $vehicle = $booking['vehicle_preference'] ?? 'Standard Air-Conditioned Vehicle';
        $hotel = $booking['hotel_category'] ?? 'Standard Selected Accommodation';
        $specialRequests = $booking['special_requests'] ?? ($booking['customer_notes'] ?? 'None');

        $receiptButtonHtml = '';
        if ($receiptUrl) {
            $receiptButtonHtml = <<<HTML
            <div style="text-align: center; margin: 24px 0 16px;">
                <a href="{$e($receiptUrl)}" style="display: inline-block; background: linear-gradient(135deg, #1226de, #0a178c); color: #ffffff; padding: 13px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; box-shadow: 0 4px 12px rgba(18,38,222,0.3);">📄 Download Official PDF Voucher</a>
            </div>
HTML;
        }

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Booking Confirmed — {$e($booking['order_number'])}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px 12px; color: #0B1329;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
        
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #0B1329 0%, #1226de 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
            <div style="font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #93c5fd; margin-bottom: 6px;">🌴 WANDERER SOUTH INDIA</div>
            <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #ffffff;">Booking Confirmed ✓</h1>
            <p style="margin: 0; font-size: 14px; color: #e2e8f0;">Reservation Reference: <strong style="color: #67e8f9; font-size: 16px;">#{$e($booking['order_number'])}</strong></p>
        </div>

        <!-- Body Content -->
        <div style="padding: 28px 24px;">
            <p style="font-size: 15px; line-height: 1.6; margin: 0 0 18px;">
                Dear <strong>{$e($customer['name'] ?? 'Valued Guest')}</strong>,<br>
                Thank you for choosing <strong>Wanderer South India</strong>! Your tour package has been successfully reserved in our system. Your official PDF voucher is attached to this email.
            </p>

            <!-- Key Summary Card -->
            <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 14px; font-size: 16px; font-weight: 700; color: #1226de; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                    🧳 Tour Reservation Details
                </h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; width: 42%;">Tour Package:</td>
                        <td style="padding: 6px 0; font-weight: 700; color: #0B1329; text-align: right;">{$e($tour['title'] ?? $booking['destination_name'] ?? 'South India Tour')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b;">Travel Date:</td>
                        <td style="padding: 6px 0; font-weight: 700; color: #0B1329; text-align: right;">{$e($travelDate)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b;">Duration:</td>
                        <td style="padding: 6px 0; font-weight: 700; color: #0B1329; text-align: right;">{$e($booking['duration_days'] ?? 'As Itinerary')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b;">Travelers / Guests:</td>
                        <td style="padding: 6px 0; font-weight: 700; color: #0B1329; text-align: right;">{$e($booking['tickets_count'])} Guests ({$e($booking['adults_count'] ?? 1)} Adults, {$e($booking['children_count'] ?? 0)} Children)</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b;">Pickup Point:</td>
                        <td style="padding: 6px 0; font-weight: 700; color: #0B1329; text-align: right;">{$e($pickup)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b;">Vehicle Preference:</td>
                        <td style="padding: 6px 0; font-weight: 700; color: #0B1329; text-align: right;">{$e($vehicle)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b;">Accommodation:</td>
                        <td style="padding: 6px 0; font-weight: 700; color: #0B1329; text-align: right;">{$e($hotel)}</td>
                    </tr>
                    <tr style="border-top: 1px dashed #cbd5e1;">
                        <td style="padding: 10px 0 0; color: #0B1329; font-weight: 800; font-size: 15px;">Total Amount:</td>
                        <td style="padding: 10px 0 0; font-weight: 800; color: #16a34a; font-size: 16px; text-align: right;">{$e($total)} (Pay on Arrival)</td>
                    </tr>
                </table>
            </div>

            <!-- Special Requests / Notes -->
            <div style="background: #eff6ff; border-left: 4px solid #1226de; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px; font-size: 13px;">
                <strong style="color: #1e3a8a;">Special Requests & Preferences:</strong><br>
                {$e($specialRequests)}
            </div>

            {$receiptButtonHtml}

            <!-- Support / Contact Box -->
            <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; margin-top: 24px; font-size: 13px; color: #64748b; line-height: 1.6;">
                <p style="margin: 0 0 8px;"><strong>Need assistance or modifications?</strong></p>
                <p style="margin: 0 0 4px;">📞 WhatsApp / Call: <strong>+91 8072566010</strong></p>
                <p style="margin: 0;">✉️ Email Support: <a href="mailto:info@wanderersouthindia.com" style="color: #1226de; text-decoration: none;">info@wanderersouthindia.com</a></p>
            </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            © 2026 Wanderer South India • South India Heritage, Temple & Hill Station Tour Specialist
        </div>
    </div>
</body>
</html>
HTML;
    }

    /**
     * Render the plain-text alternative version for the customer ticket.
     */
    private static function renderCustomerEmailPlainText(array $booking, ?string $receiptUrl): string
    {
        $customer = $booking['customer'] ?? [];
        $tour = $booking['tour'] ?? [];
        $currency = $booking['currency'] ?? 'INR';
        $total = $currency . ' ' . number_format((float) $booking['total_price'], 2);
        $travelDate = $booking['arrival_date'] ?? $booking['booking_date'] ?? date('Y-m-d');
        $pickup = $booking['pickup_location'] ?? 'Hotel / Airport Pickup';

        $text = "🌴 WANDERER SOUTH INDIA — BOOKING CONFIRMATION\n"
            . "=========================================================\n\n"
            . "Dear " . ($customer['name'] ?? 'Valued Guest') . ",\n\n"
            . "Your reservation has been confirmed. Here are your booking details:\n\n"
            . "• Order Reference: #" . ($booking['order_number'] ?? '') . "\n"
            . "• Tour Package: " . ($tour['title'] ?? $booking['destination_name'] ?? 'South India Tour') . "\n"
            . "• Travel Date: " . $travelDate . "\n"
            . "• Duration: " . ($booking['duration_days'] ?? 'Standard') . "\n"
            . "• Guests: " . ($booking['tickets_count'] ?? 1) . " (" . ($booking['adults_count'] ?? 1) . " Adults, " . ($booking['children_count'] ?? 0) . " Children)\n"
            . "• Pickup Point: " . $pickup . "\n"
            . "• Total Amount: " . $total . " (Pay on Arrival)\n\n"
            . "Special Requests: " . ($booking['special_requests'] ?? 'None') . "\n\n";

        if ($receiptUrl) {
            $text .= "Download your official PDF voucher: " . $receiptUrl . "\n\n";
        }

        $text .= "If you have any questions, contact us on WhatsApp (+91 8072566010) or reply to this email.\n\n"
            . "Thank you for choosing Wanderer South India!";

        return $text;
    }

    /**
     * Render internal admin notification email HTML.
     */
    private static function renderAdminEmailHtml(array $booking): string
    {
        $e = fn($v) => htmlspecialchars((string) ($v ?? ''), ENT_QUOTES, 'UTF-8');
        $customer = $booking['customer'] ?? [];
        $tour = $booking['tour'] ?? [];
        $currency = $booking['currency'] ?? 'INR';
        $total = $currency . ' ' . number_format((float) $booking['total_price'], 2);

        return <<<HTML
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 20px; color: #0B1329;">
    <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 10px; padding: 24px; border: 1px solid #e2e8f0;">
        <h2 style="color: #1226de; margin: 0 0 12px; font-size: 18px;">🔔 New Booking Placed — #{$e($booking['order_number'])}</h2>
        <p style="font-size: 14px; margin: 0 0 16px;">A new reservation has been placed by <strong>{$e($customer['name'] ?? 'Customer')}</strong>.</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr><td style="padding: 6px 0; color: #64748b;">Customer Name:</td><td style="font-weight: bold; text-align: right;">{$e($customer['name'] ?? '')}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Customer Email:</td><td style="font-weight: bold; text-align: right;">{$e($customer['email'] ?? '')}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Customer Phone:</td><td style="font-weight: bold; text-align: right;">{$e($customer['phone'] ?? '')}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Tour Title:</td><td style="font-weight: bold; text-align: right;">{$e($tour['title'] ?? '')}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Travel Date:</td><td style="font-weight: bold; text-align: right;">{$e($booking['arrival_date'] ?? $booking['booking_date'])}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Guests:</td><td style="font-weight: bold; text-align: right;">{$e($booking['tickets_count'])}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Total Price:</td><td style="font-weight: bold; text-align: right; color: #16a34a;">{$e($total)}</td></tr>
        </table>
    </div>
</body>
</html>
HTML;
    }

    /**
     * Render internal admin notification plain-text.
     */
    private static function renderAdminEmailPlainText(array $booking): string
    {
        $customer = $booking['customer'] ?? [];
        $tour = $booking['tour'] ?? [];
        return "NEW TOUR BOOKING — #" . ($booking['order_number'] ?? '') . "\n\n"
            . "Customer: " . ($customer['name'] ?? '') . " (" . ($customer['email'] ?? '') . ", " . ($customer['phone'] ?? '') . ")\n"
            . "Tour: " . ($tour['title'] ?? '') . "\n"
            . "Date: " . ($booking['arrival_date'] ?? $booking['booking_date'] ?? '') . "\n"
            . "Guests: " . ($booking['tickets_count'] ?? 1) . "\n"
            . "Amount: " . ($booking['currency'] ?? 'INR') . " " . number_format((float) ($booking['total_price'] ?? 0), 2);
    }
}
