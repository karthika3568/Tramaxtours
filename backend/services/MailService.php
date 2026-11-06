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

        // Sender configuration
        $fromEmail = (string) (Env::get('MAIL_FROM_ADDRESS') ?: Env::get('FROM_EMAIL', 'welcome@yourbestdayinindia.com'));
        $fromName = (string) (Env::get('MAIL_FROM_NAME') ?: Env::get('FROM_NAME', 'Wanderer South India'));

        $cleanFromEmail = self::sanitizeHeader($fromEmail);
        $cleanFromName = self::sanitizeHeader($fromName);

        $mailer->setFrom($cleanFromEmail, $cleanFromName);
        $mailer->addReplyTo($cleanFromEmail, $cleanFromName);

        $mailer->SMTPDebug = 0;

        return $mailer;
    }

    /**
     * Send the initial Booking Request Received acknowledgement email to the customer.
     * Strictly NO PDF ticket attached — ticket is only issued upon admin approval.
     *
     * @param array $booking Formatted booking details
     * @return array [bool $success, ?string $errorMessage]
     */
    public static function sendCustomerAcknowledgement(array $booking): array
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

            $mailer->isHTML(true);
            $mailer->Subject = "Booking Request Received — {$orderNumber} | Wanderer South India";
            $mailer->Body = self::renderCustomerAcknowledgementHtml($booking);
            $mailer->AltBody = self::renderCustomerAcknowledgementPlainText($booking);

            $mailer->send();
            return [true, null];
        } catch (PHPMailerException|Throwable $e) {
            $errorMsg = $e->getMessage();
            error_log("[Wanderer Mail Error] Failed customer acknowledgement dispatch for {$booking['order_number']}: {$errorMsg}");
            return [false, "SMTP delivery failed: {$errorMsg}"];
        }
    }

    /**
     * Send the official confirmed booking ticket email to the customer with PDF attached.
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
                $attachmentName = 'Official-Tour-Ticket-' . $orderNumber . '.pdf';
                $mailer->addAttachment($pdfPath, $attachmentName, 'base64', 'application/pdf');
            }

            $mailer->isHTML(true);
            $mailer->Subject = "Booking Confirmed & Official Ticket — {$orderNumber} | Wanderer South India";
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
     * Send an internal booking notification copy to the administrator when a new request arrives.
     *
     * @param array $booking Formatted booking details
     * @param string|null $pdfPath Optional path if generated
     * @return array [bool $success, ?string $errorMessage]
     */
    public static function sendAdminNotification(array $booking, ?string $pdfPath = null): array
    {
        $adminEmail = trim((string) (Env::get('ADMIN_EMAIL') ?: 'mkarthika3568@gmail.com'));
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
            $mailer->Subject = "🔔 New Booking Request Awaiting Contact — {$orderNumber}";
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
     * Send a confirmation copy with the PDF ticket to the administrator upon booking approval.
     *
     * @param array $booking Formatted booking details
     * @param string $pdfPath Absolute path to the generated receipt PDF
     * @return array [bool $success, ?string $errorMessage]
     */
    public static function sendAdminConfirmedCopy(array $booking, string $pdfPath): array
    {
        $adminEmail = trim((string) (Env::get('ADMIN_EMAIL') ?: 'mkarthika3568@gmail.com'));
        if ($adminEmail === '' || !filter_var($adminEmail, FILTER_VALIDATE_EMAIL)) {
            return [false, 'A valid ADMIN_EMAIL address must be configured.'];
        }

        [$isConfigured, $missing] = self::checkSmtpConfiguration();
        if (!$isConfigured) {
            return [false, "SMTP is not configured."];
        }

        try {
            $cleanAdminEmail = self::sanitizeHeader($adminEmail);
            $orderNumber = self::sanitizeHeader((string) ($booking['order_number'] ?? 'Reservation'));

            $mailer = self::createMailer();
            $mailer->addAddress($cleanAdminEmail, 'Admin — Wanderer South India');

            if (file_exists($pdfPath)) {
                $attachmentName = 'Confirmed-Ticket-' . $orderNumber . '.pdf';
                $mailer->addAttachment($pdfPath, $attachmentName, 'base64', 'application/pdf');
            }

            $currency = $booking['currency'] ?? 'INR';
            $total = $currency . ' ' . number_format((float) ($booking['total_price'] ?? 0), 2);
            $advance = $currency . ' ' . number_format((float) ($booking['advance_amount'] ?? 0), 2);
            $balance = $currency . ' ' . number_format((float) ($booking['balance_amount'] ?? 0), 2);

            $mailer->isHTML(true);
            $mailer->Subject = "✓ Booking Approved & Confirmed — {$orderNumber}";
            $mailer->Body = <<<HTML
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 20px; color: #0B1329;">
    <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 10px; padding: 24px; border: 1px solid #e2e8f0;">
        <h2 style="color: #01aa90; margin: 0 0 12px; font-size: 18px;">✓ Booking Approved &amp; Confirmed — #{$orderNumber}</h2>
        <p style="font-size: 14px; margin: 0 0 16px;">This booking has been approved by the administrator. Official ticket has been emailed to the customer with PDF attached.</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr><td style="padding: 6px 0; color: #64748b;">Customer:</td><td style="font-weight: bold; text-align: right;">{$booking['customer']['name']} ({$booking['customer']['phone']})</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Tour:</td><td style="font-weight: bold; text-align: right;">{$booking['tour']['title']}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Travel Date:</td><td style="font-weight: bold; text-align: right;">{$booking['booking_date']}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Total Amount:</td><td style="font-weight: bold; text-align: right;">{$total}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Advance Paid:</td><td style="font-weight: bold; text-align: right; color: #16a34a;">{$advance}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Remaining Balance:</td><td style="font-weight: bold; text-align: right; color: #e11d48;">{$balance}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Payment Method:</td><td style="font-weight: bold; text-align: right;">{$booking['payment_method']}</td></tr>
        </table>
    </div>
</body>
</html>
HTML;
            $mailer->AltBody = "BOOKING APPROVED — #{$orderNumber}\n\nCustomer: {$booking['customer']['name']} ({$booking['customer']['phone']})\nTour: {$booking['tour']['title']}\nTotal: {$total}\nAdvance: {$advance}\nBalance: {$balance}\nMethod: {$booking['payment_method']}";

            $mailer->send();
            return [true, null];
        } catch (PHPMailerException|Throwable $e) {
            $errorMsg = $e->getMessage();
            error_log("[Wanderer Mail Error] Failed admin confirmed dispatch for {$booking['order_number']}: {$errorMsg}");
            return [false, "SMTP admin dispatch failed: {$errorMsg}"];
        }
    }

    /**
     * Render Customer Request Received Acknowledgement Email HTML (NO PDF).
     */
    private static function renderCustomerAcknowledgementHtml(array $booking): string
    {
        $e = fn($v) => htmlspecialchars((string) ($v ?? ''), ENT_QUOTES, 'UTF-8');
        $customer = $booking['customer'] ?? [];
        $tour = $booking['tour'] ?? [];
        $currency = $booking['currency'] ?? 'INR';
        $total = $currency . ' ' . number_format((float) $booking['total_price'], 2);
        $travelDate = $booking['arrival_date'] ?? $booking['booking_date'] ?? date('Y-m-d');
        $pickup = $booking['pickup_location'] ?? 'Hotel / Airport Pickup';

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Booking Request Received — {$e($booking['order_number'])}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px 12px; color: #0B1329;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
        
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #0B1329 0%, #01aa90 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
            <div style="font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #93c5fd; margin-bottom: 6px;">🌴 WANDERER SOUTH INDIA (TRAMAX TOURS)</div>
            <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #ffffff;">Booking Request Received 📋</h1>
            <p style="margin: 0; font-size: 14px; color: #e2e8f0;">Request Reference: <strong style="color: #67e8f9; font-size: 16px;">#{$e($booking['order_number'])}</strong></p>
        </div>

        <!-- Body Content -->
        <div style="padding: 28px 24px;">
            <p style="font-size: 15px; line-height: 1.6; margin: 0 0 18px;">
                Dear <strong>{$e($customer['name'] ?? 'Valued Guest')}</strong>,<br>
                Thank you for your interest in touring with <strong>Wanderer South India</strong>! We have received your booking request for the tour package detailed below.
            </p>

            <!-- Status Notice Box -->
            <div style="background: #fefce8; border: 1px solid #fef08a; border-left: 5px solid #eab308; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <h4 style="margin: 0 0 8px; color: #854d0e; font-size: 15px;">⏳ What Happens Next? (Manual Payment &amp; Confirmation)</h4>
                <p style="margin: 0 0 8px; font-size: 13.5px; color: #713f12; line-height: 1.5;">
                    Our tour coordinator will contact you shortly via <strong>Phone or WhatsApp ({$e($customer['phone'] ?? '')})</strong> to:
                </p>
                <ul style="margin: 0; padding-left: 20px; font-size: 13.5px; color: #713f12; line-height: 1.6;">
                    <li>Confirm your pickup location, scheduled travel dates, and special requirements.</li>
                    <li>Discuss and arrange your preferred manual payment method: <strong>Cash, UPI (GPay, PhonePe), Bank Transfer, or Direct Payment</strong>.</li>
                    <li>Record advance payment arrangements if required.</li>
                </ul>
                <p style="margin: 8px 0 0; font-size: 13px; font-weight: bold; color: #854d0e;">
                    * Your official confirmed PDF ticket and travel voucher will be issued immediately upon administrator approval and payment verification.
                </p>
            </div>

            <!-- Tour Summary Card -->
            <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 14px; font-size: 16px; font-weight: 700; color: #01aa90; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                    🧳 Requested Tour Details
                </h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; width: 42%;">Tour Package:</td>
                        <td style="padding: 6px 0; font-weight: 700; color: #0B1329; text-align: right;">{$e($tour['title'] ?? $booking['destination_name'] ?? 'South India Tour')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b;">Scheduled Date:</td>
                        <td style="padding: 6px 0; font-weight: 700; color: #0B1329; text-align: right;">{$e($travelDate)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b;">Travelers / Guests:</td>
                        <td style="padding: 6px 0; font-weight: 700; color: #0B1329; text-align: right;">{$e($booking['tickets_count'])} Guest(s)</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b;">Pickup Location:</td>
                        <td style="padding: 6px 0; font-weight: 700; color: #0B1329; text-align: right;">{$e($pickup)}</td>
                    </tr>
                    <tr style="border-top: 1px dashed #cbd5e1;">
                        <td style="padding: 10px 0 0; color: #0B1329; font-weight: 800; font-size: 15px;">Estimated Amount:</td>
                        <td style="padding: 10px 0 0; font-weight: 800; color: #01aa90; font-size: 16px; text-align: right;">{$e($total)}</td>
                    </tr>
                </table>
            </div>

            <!-- Contact Box -->
            <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; margin-top: 24px; font-size: 13px; color: #64748b; line-height: 1.6;">
                <p style="margin: 0 0 8px;"><strong>Need to speak with us immediately?</strong></p>
                <p style="margin: 0 0 4px;">📞 Phone &amp; WhatsApp: <strong>+91 9840291110 / +91 8072566010</strong></p>
                <p style="margin: 0;">✉️ Email: <a href="mailto:welcome@yourbestdayinindia.com" style="color: #01aa90; text-decoration: none;">welcome@yourbestdayinindia.com</a></p>
            </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            © 2026 Wanderer South India (Tramax Tours) • Authentic South India Experiences
        </div>
    </div>
</body>
</html>
HTML;
    }

    /**
     * Render Customer Request Received Acknowledgement Plain-text.
     */
    private static function renderCustomerAcknowledgementPlainText(array $booking): string
    {
        $customer = $booking['customer'] ?? [];
        $tour = $booking['tour'] ?? [];
        $currency = $booking['currency'] ?? 'INR';
        $total = $currency . ' ' . number_format((float) $booking['total_price'], 2);
        $travelDate = $booking['arrival_date'] ?? $booking['booking_date'] ?? date('Y-m-d');

        return "🌴 WANDERER SOUTH INDIA (TRAMAX TOURS) — BOOKING REQUEST RECEIVED\n"
            . "=========================================================\n\n"
            . "Dear " . ($customer['name'] ?? 'Valued Guest') . ",\n\n"
            . "We have received your tour reservation request! Here is your summary:\n\n"
            . "• Request Reference: #" . ($booking['order_number'] ?? '') . "\n"
            . "• Tour Package: " . ($tour['title'] ?? $booking['destination_name'] ?? 'South India Tour') . "\n"
            . "• Scheduled Date: " . $travelDate . "\n"
            . "• Guests: " . ($booking['tickets_count'] ?? 1) . "\n"
            . "• Estimated Amount: " . $total . "\n\n"
            . "WHAT HAPPENS NEXT?\n"
            . "Our tour coordinator will contact you shortly via Phone or WhatsApp (" . ($customer['phone'] ?? '') . ") to:\n"
            . "1. Confirm itinerary & pickup details.\n"
            . "2. Arrange manual payment: Cash, UPI (GPay/PhonePe), Bank Transfer, or Direct Payment.\n"
            . "3. Issue your official confirmed ticket and voucher upon verification.\n\n"
            . "If you have any questions, call or WhatsApp us at +91 9840291110 or email welcome@yourbestdayinindia.com.\n\n"
            . "Thank you for choosing Wanderer South India!";
    }

    /**
     * Render the confirmed ticket customer email HTML (with PDF download button and breakdown).
     */
    private static function renderCustomerEmailHtml(array $booking, ?string $receiptUrl): string
    {
        $e = fn($v) => htmlspecialchars((string) ($v ?? ''), ENT_QUOTES, 'UTF-8');
        $customer = $booking['customer'] ?? [];
        $tour = $booking['tour'] ?? [];
        $currency = $booking['currency'] ?? 'INR';
        $total = $currency . ' ' . number_format((float) $booking['total_price'], 2);
        $advance = $currency . ' ' . number_format((float) ($booking['advance_amount'] ?? 0), 2);
        $balance = $currency . ' ' . number_format((float) ($booking['balance_amount'] ?? 0), 2);
        $payMethod = ucwords(str_replace('_', ' ', (string) ($booking['payment_method'] ?? 'Manual Payment')));

        $travelDate = $booking['arrival_date'] ?? $booking['booking_date'] ?? date('Y-m-d');
        $pickup = $booking['pickup_location'] ?? 'Hotel / Airport Pickup';
        $vehicle = $booking['vehicle_preference'] ?? 'Standard Air-Conditioned Vehicle';
        $hotel = $booking['hotel_category'] ?? 'Standard Selected Accommodation';
        $specialRequests = $booking['special_requests'] ?? ($booking['customer_notes'] ?? 'None');

        $receiptButtonHtml = '';
        if ($receiptUrl) {
            $receiptButtonHtml = <<<HTML
            <div style="text-align: center; margin: 24px 0 16px;">
                <a href="{$e($receiptUrl)}" style="display: inline-block; background: linear-gradient(135deg, #01aa90, #01806c); color: #ffffff; padding: 13px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; box-shadow: 0 4px 12px rgba(1,170,144,0.3);">📄 Download Official PDF Ticket</a>
            </div>
HTML;
        }

        $balanceWarningHtml = '';
        if ((float) ($booking['balance_amount'] ?? 0) > 0) {
            $balanceWarningHtml = <<<HTML
            <div style="background: #fffbeb; border: 1px solid #fde68a; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px; font-size: 13px; color: #92400e;">
                <strong>⚠️ Balance Payable:</strong> A remaining balance of <strong>{$e($balance)}</strong> is payable upon tour arrival or commencement via {$e($payMethod)}.
            </div>
HTML;
        } else {
            $balanceWarningHtml = <<<HTML
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #16a34a; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px; font-size: 13px; color: #166534;">
                <strong>✓ Fully Paid:</strong> All tour charges have been settled in full. Thank you!
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
        <div style="background: linear-gradient(135deg, #0B1329 0%, #01aa90 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
            <div style="font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #93c5fd; margin-bottom: 6px;">🌴 WANDERER SOUTH INDIA (TRAMAX TOURS)</div>
            <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #ffffff;">Booking Confirmed ✓</h1>
            <p style="margin: 0; font-size: 14px; color: #e2e8f0;">Official Ticket Reference: <strong style="color: #67e8f9; font-size: 16px;">#{$e($booking['order_number'])}</strong></p>
        </div>

        <!-- Body Content -->
        <div style="padding: 28px 24px;">
            <p style="font-size: 15px; line-height: 1.6; margin: 0 0 18px;">
                Dear <strong>{$e($customer['name'] ?? 'Valued Guest')}</strong>,<br>
                Your tour reservation has been <strong>approved and confirmed</strong> by our management team! Your official PDF travel voucher is attached to this email.
            </p>

            {$balanceWarningHtml}

            <!-- Tour Details Card -->
            <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 14px; font-size: 16px; font-weight: 700; color: #01aa90; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                    🧳 Confirmed Itinerary Details
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
                        <td style="padding: 6px 0; color: #64748b;">Travelers / Guests:</td>
                        <td style="padding: 6px 0; font-weight: 700; color: #0B1329; text-align: right;">{$e($booking['tickets_count'])} Guests ({$e($booking['adults_count'] ?? 1)} Adults, {$e($booking['children_count'] ?? 0)} Children)</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b;">Pickup Point:</td>
                        <td style="padding: 6px 0; font-weight: 700; color: #0B1329; text-align: right;">{$e($pickup)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b;">Vehicle:</td>
                        <td style="padding: 6px 0; font-weight: 700; color: #0B1329; text-align: right;">{$e($vehicle)}</td>
                    </tr>
                </table>
            </div>

            <!-- Payment Summary Card -->
            <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 14px; font-size: 16px; font-weight: 700; color: #01aa90; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                    💳 Payment Breakdown
                </h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
                    <tr>
                        <td style="padding: 6px 0; color: #64748b;">Total Tour Price:</td>
                        <td style="padding: 6px 0; font-weight: 700; color: #0B1329; text-align: right;">{$e($total)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b;">Payment Method:</td>
                        <td style="padding: 6px 0; font-weight: 700; color: #0B1329; text-align: right;">{$e($payMethod)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b;">Advance / Amount Paid:</td>
                        <td style="padding: 6px 0; font-weight: 700; color: #16a34a; text-align: right;">{$e($advance)}</td>
                    </tr>
                    <tr style="border-top: 1px dashed #cbd5e1;">
                        <td style="padding: 10px 0 0; color: #0B1329; font-weight: 800; font-size: 15px;">Remaining Balance:</td>
                        <td style="padding: 10px 0 0; font-weight: 800; color: #e11d48; font-size: 16px; text-align: right;">{$e($balance)}</td>
                    </tr>
                </table>
            </div>

            {$receiptButtonHtml}

            <!-- Support / Contact Box -->
            <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; margin-top: 24px; font-size: 13px; color: #64748b; line-height: 1.6;">
                <p style="margin: 0 0 8px;"><strong>Need assistance or modifications?</strong></p>
                <p style="margin: 0 0 4px;">📞 WhatsApp / Call: <strong>+91 9840291110 / +91 8072566010</strong></p>
                <p style="margin: 0;">✉️ Email Support: <a href="mailto:welcome@yourbestdayinindia.com" style="color: #01aa90; text-decoration: none;">welcome@yourbestdayinindia.com</a></p>
            </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            © 2026 Wanderer South India (Tramax Tours) • Authentic South India Experiences
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
        $advance = $currency . ' ' . number_format((float) ($booking['advance_amount'] ?? 0), 2);
        $balance = $currency . ' ' . number_format((float) ($booking['balance_amount'] ?? 0), 2);
        $payMethod = ucwords(str_replace('_', ' ', (string) ($booking['payment_method'] ?? 'Manual Payment')));
        $travelDate = $booking['arrival_date'] ?? $booking['booking_date'] ?? date('Y-m-d');
        $pickup = $booking['pickup_location'] ?? 'Hotel / Airport Pickup';

        $text = "🌴 WANDERER SOUTH INDIA (TRAMAX TOURS) — BOOKING CONFIRMED\n"
            . "=========================================================\n\n"
            . "Dear " . ($customer['name'] ?? 'Valued Guest') . ",\n\n"
            . "Your reservation has been officially approved and confirmed!\n\n"
            . "• Order Reference: #" . ($booking['order_number'] ?? '') . "\n"
            . "• Tour Package: " . ($tour['title'] ?? $booking['destination_name'] ?? 'South India Tour') . "\n"
            . "• Travel Date: " . $travelDate . "\n"
            . "• Guests: " . ($booking['tickets_count'] ?? 1) . "\n"
            . "• Pickup Point: " . $pickup . "\n\n"
            . "PAYMENT SUMMARY:\n"
            . "• Total Price: " . $total . "\n"
            . "• Payment Method: " . $payMethod . "\n"
            . "• Advance / Paid: " . $advance . "\n"
            . "• Remaining Balance: " . $balance . "\n\n";

        if ($receiptUrl) {
            $text .= "Download your official PDF voucher: " . $receiptUrl . "\n\n";
        }

        $text .= "If you have any questions, contact us on WhatsApp (+91 9840291110) or reply to this email.\n\n"
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
        <h2 style="color: #01aa90; margin: 0 0 12px; font-size: 18px;">🔔 New Booking Request Awaiting Contact — #{$e($booking['order_number'])}</h2>
        <div style="background: #fefce8; border-left: 4px solid #eab308; padding: 10px 14px; margin-bottom: 16px; font-size: 13px; color: #854d0e;">
            <strong>Action Required:</strong> Contact customer to arrange manual payment (Cash/UPI/Bank Transfer) and approve the booking in the Admin Dashboard.
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr><td style="padding: 6px 0; color: #64748b;">Customer Name:</td><td style="font-weight: bold; text-align: right;">{$e($customer['name'] ?? '')}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Customer Email:</td><td style="font-weight: bold; text-align: right;">{$e($customer['email'] ?? '')}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Customer Phone:</td><td style="font-weight: bold; text-align: right;">{$e($customer['phone'] ?? '')}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Tour Title:</td><td style="font-weight: bold; text-align: right;">{$e($tour['title'] ?? '')}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Travel Date:</td><td style="font-weight: bold; text-align: right;">{$e($booking['arrival_date'] ?? $booking['booking_date'])}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Guests:</td><td style="font-weight: bold; text-align: right;">{$e($booking['tickets_count'])}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Estimated Total:</td><td style="font-weight: bold; text-align: right; color: #16a34a;">{$e($total)}</td></tr>
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
        return "NEW TOUR BOOKING REQUEST — #" . ($booking['order_number'] ?? '') . "\n\n"
            . "Action: Please contact the customer to arrange payment and approve the booking.\n\n"
            . "Customer: " . ($customer['name'] ?? '') . " (" . ($customer['email'] ?? '') . ", " . ($customer['phone'] ?? '') . ")\n"
            . "Tour: " . ($tour['title'] ?? '') . "\n"
            . "Date: " . ($booking['arrival_date'] ?? $booking['booking_date'] ?? '') . "\n"
            . "Guests: " . ($booking['tickets_count'] ?? 1) . "\n"
            . "Amount: " . ($booking['currency'] ?? 'INR') . " " . number_format((float) ($booking['total_price'] ?? 0), 2);
    }
}
