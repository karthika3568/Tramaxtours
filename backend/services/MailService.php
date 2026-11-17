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
     * @param bool $keepAlive Whether to maintain connection across multiple sends
     * @return PHPMailer
     * @throws PHPMailerException
     */
    public static function createMailer(bool $keepAlive = false): PHPMailer
    {
        $mailer = new PHPMailer(true);
        $mailer->isSMTP();
        $mailer->CharSet = 'UTF-8';
        $mailer->Timeout = (int) Env::get('MAIL_TIMEOUT', 6);
        $mailer->SMTPKeepAlive = $keepAlive;

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

        $mailer->SMTPOptions = [
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true,
            ],
        ];

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
     * Check if a specific email has already been sent or is actively queued for this booking (duplicate prevention).
     */
    public static function hasAlreadySent(int $bookingId, string $emailType): bool
    {
        try {
            $pdo = \App\Utils\Database::getConnection();
            $stmt = $pdo->prepare('SELECT COUNT(*) FROM `email_queue` WHERE `booking_id` = :id AND `email_type` = :type AND `status` IN ("sent", "pending", "processing")');
            $stmt->execute([':id' => $bookingId, ':type' => $emailType]);
            if ((int) $stmt->fetchColumn() > 0) {
                return true;
            }

            // Also check booking record customer_email_status
            if ($emailType === 'customer_ticket' || $emailType === 'customer_acknowledgement') {
                $bStmt = $pdo->prepare('SELECT `customer_email_status`, `customer_email_sent_at` FROM `bookings` WHERE `id` = :id');
                $bStmt->execute([':id' => $bookingId]);
                $row = $bStmt->fetch(\PDO::FETCH_ASSOC);
                if ($row && $row['customer_email_status'] === 'sent' && !empty($row['customer_email_sent_at'])) {
                    return true;
                }
            }

            return false;
        } catch (Throwable $e) {
            error_log('[MailService hasAlreadySent] Error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Enqueue an email job into the database queue.
     */
    public static function enqueue(
        ?int $bookingId,
        string $emailType,
        string $recipientEmail,
        ?string $recipientName,
        string $subject,
        string $bodyHtml,
        ?string $bodyText = null,
        ?string $attachmentPath = null,
        ?string $attachmentName = null
    ): ?int {
        try {
            $cleanRecipient = self::sanitizeHeader($recipientEmail);
            if (!filter_var($cleanRecipient, FILTER_VALIDATE_EMAIL)) {
                return null;
            }

            $pdo = \App\Utils\Database::getConnection();

            // Prevent duplicate pending or processing jobs
            if ($bookingId !== null) {
                $check = $pdo->prepare('SELECT `id` FROM `email_queue` WHERE `booking_id` = :bid AND `email_type` = :type AND `status` IN ("pending", "processing", "sent") LIMIT 1');
                $check->execute([':bid' => $bookingId, ':type' => $emailType]);
                if ($check->fetch()) {
                    return null; // Already queued or sent
                }
            }

            $stmt = $pdo->prepare('INSERT INTO `email_queue`
                (`booking_id`, `email_type`, `recipient_email`, `recipient_name`, `subject`, `body_html`, `body_text`, `attachment_path`, `attachment_name`, `status`, `attempts`, `created_at`, `updated_at`)
                VALUES (:bid, :type, :to_email, :to_name, :subject, :html, :text, :att_path, :att_name, "pending", 0, NOW(), NOW())');

            $stmt->execute([
                ':bid' => $bookingId,
                ':type' => $emailType,
                ':to_email' => $cleanRecipient,
                ':to_name' => $recipientName ? self::sanitizeHeader($recipientName) : null,
                ':subject' => self::sanitizeHeader($subject),
                ':html' => $bodyHtml,
                ':text' => $bodyText,
                ':att_path' => $attachmentPath,
                ':att_name' => $attachmentName ? self::sanitizeHeader($attachmentName) : null,
            ]);

            return (int) $pdo->lastInsertId();
        } catch (Throwable $e) {
            error_log('[MailService enqueue] Failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Enqueue initial booking request acknowledgement and admin notification.
     */
    public static function queueBookingRequest(array $booking, bool $force = false): array
    {
        $bookingId = (int) ($booking['id'] ?? 0);
        $customerEmail = trim((string) ($booking['customer']['email'] ?? $booking['customer_email'] ?? $booking['email'] ?? ''));
        $customerName = trim((string) ($booking['customer']['name'] ?? $booking['customer_name'] ?? $booking['name'] ?? 'Valued Guest'));
        $orderNumber = (string) ($booking['order_number'] ?? 'Reservation');
        $adminEmail = trim((string) Env::get('ADMIN_EMAIL', ''));

        $customerAlreadySent = self::hasAlreadySent($bookingId, 'customer_acknowledgement');
        $adminAlreadySent = self::hasAlreadySent($bookingId, 'admin_notification');

        if (!$force && $customerAlreadySent && $adminAlreadySent) {
            return [
                'success' => false,
                'message' => 'Booking request emails already sent or enqueued for this booking.',
                'enqueued' => [],
            ];
        }

        $enqueued = [];

        // 1. Customer Acknowledgement
        if ($customerEmail !== '' && filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
            if ($force || !$customerAlreadySent) {
                $jobId = self::enqueue(
                    $bookingId,
                    'customer_acknowledgement',
                    $customerEmail,
                    $customerName,
                    "Booking Request Received — {$orderNumber} | Wanderer South India",
                    self::renderCustomerAcknowledgementHtml($booking),
                    self::renderCustomerAcknowledgementPlainText($booking)
                );
                if ($jobId) $enqueued['customer'] = $jobId;
            }
        }

        // 2. Admin Notification
        if ($adminEmail !== '' && filter_var($adminEmail, FILTER_VALIDATE_EMAIL)) {
            if ($force || !$adminAlreadySent) {
                $jobId = self::enqueue(
                    $bookingId,
                    'admin_notification',
                    $adminEmail,
                    'Admin — Wanderer South India',
                    "🔔 New Booking Request Awaiting Contact — {$orderNumber}",
                    self::renderAdminEmailHtml($booking),
                    self::renderAdminEmailPlainText($booking)
                );
                if ($jobId) $enqueued['admin'] = $jobId;
            }
        }

        return [
            'success' => !empty($enqueued),
            'enqueued' => $enqueued,
            'message' => !empty($enqueued) ? 'Booking request email(s) enqueued successfully.' : 'No new emails to enqueue.',
        ];
    }

    /**
     * Enqueue confirmed booking ticket email to customer and admin copy.
     */
    public static function queueBookingConfirmation(
        array $booking,
        ?string $pdfPath = null,
        ?string $receiptUrl = null,
        bool $force = false
    ): array {
        $bookingId = (int) ($booking['id'] ?? 0);
        $customerEmail = trim((string) ($booking['customer']['email'] ?? $booking['customer_email'] ?? $booking['email'] ?? ''));
        $customerName = trim((string) ($booking['customer']['name'] ?? $booking['customer_name'] ?? $booking['name'] ?? 'Valued Guest'));
        $orderNumber = (string) ($booking['order_number'] ?? 'Reservation');
        $adminEmail = trim((string) Env::get('ADMIN_EMAIL', ''));

        $customerAlreadySent = self::hasAlreadySent($bookingId, 'customer_ticket');
        $adminAlreadySent = self::hasAlreadySent($bookingId, 'admin_confirmed_copy');

        if (!$force && $customerAlreadySent && $adminAlreadySent) {
            return [
                'success' => false,
                'message' => 'Confirmation ticket emails already sent or enqueued for this booking.',
                'enqueued' => [],
            ];
        }

        $attachmentName = $pdfPath ? ('Official-Tour-Ticket-' . $orderNumber . '.pdf') : null;
        $enqueued = [];

        // 1. Customer Ticket
        if ($customerEmail !== '' && filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
            if ($force || !$customerAlreadySent) {
                $jobId = self::enqueue(
                    $bookingId,
                    'customer_ticket',
                    $customerEmail,
                    $customerName,
                    "Booking Confirmed & Official Ticket — {$orderNumber} | Wanderer South India",
                    self::renderCustomerEmailHtml($booking, $receiptUrl),
                    self::renderCustomerEmailPlainText($booking, $receiptUrl),
                    $pdfPath,
                    $attachmentName
                );
                if ($jobId) $enqueued['customer'] = $jobId;
            }
        }

        // 2. Admin Confirmed Copy
        if ($adminEmail !== '' && filter_var($adminEmail, FILTER_VALIDATE_EMAIL)) {
            if ($force || !$adminAlreadySent) {
                $jobId = self::enqueue(
                    $bookingId,
                    'admin_confirmed_copy',
                    $adminEmail,
                    'Admin — Wanderer South India',
                    "✓ Booking Approved & Confirmed — {$orderNumber}",
                    self::renderAdminConfirmedHtml($booking, $orderNumber),
                    "BOOKING APPROVED — #{$orderNumber}\nCustomer: {$customerName}\nTour: " . ($booking['tour']['title'] ?? ''),
                    $pdfPath,
                    $attachmentName
                );
                if ($jobId) $enqueued['admin'] = $jobId;
            }
        }

        return [
            'success' => !empty($enqueued),
            'enqueued' => $enqueued,
            'message' => !empty($enqueued) ? 'Confirmation email(s) enqueued successfully.' : 'No new emails to enqueue.',
        ];
    }

    /**
     * Process queued emails using persistent SMTP connection for maximum throughput.
     * Transport confirmation is verified before marking any email sent.
     */
    public static function processQueue(int $limit = 20, ?int $specificBookingId = null): array
    {
        [$isConfigured, $missing] = self::checkSmtpConfiguration();
        if (!$isConfigured) {
            $msg = 'SMTP is not configured. Missing: ' . implode(', ', $missing);
            error_log('[MailService processQueue] ' . $msg);
            return ['processed' => 0, 'sent' => 0, 'failed' => 0, 'errors' => [$msg]];
        }

        $pdo = \App\Utils\Database::getConnection();

        $query = 'SELECT * FROM `email_queue` WHERE `status` = "pending" OR (`status` = "failed" AND `attempts` < `max_attempts`)';
        $params = [];

        if ($specificBookingId !== null) {
            $query .= ' AND `booking_id` = :bid';
            $params[':bid'] = $specificBookingId;
        }

        $query .= ' ORDER BY `id` ASC LIMIT ' . (int) $limit;

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $jobs = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        if (empty($jobs)) {
            return ['processed' => 0, 'sent' => 0, 'failed' => 0, 'errors' => []];
        }

        $processed = 0;
        $sentCount = 0;
        $failedCount = 0;
        $errors = [];

        // Initialize persistent connection across the batch
        $mailer = null;
        try {
            $mailer = self::createMailer(true);
        } catch (Throwable $e) {
            error_log('[MailService processQueue] Failed to initialize mailer: ' . $e->getMessage());
            return ['processed' => 0, 'sent' => 0, 'failed' => count($jobs), 'errors' => [$e->getMessage()]];
        }

        foreach ($jobs as $job) {
            $jobId = (int) $job['id'];
            $bookingId = !empty($job['booking_id']) ? (int) $job['booking_id'] : null;
            $emailType = $job['email_type'];
            $processed++;

            // Mark job as processing and increment attempt counter
            $pdo->prepare('UPDATE `email_queue` SET `status` = "processing", `attempts` = `attempts` + 1 WHERE `id` = :id')
                ->execute([':id' => $jobId]);

            try {
                $mailer->clearAddresses();
                $mailer->clearAttachments();
                $mailer->clearReplyTos();

                $fromEmail = (string) (Env::get('MAIL_FROM_ADDRESS') ?: Env::get('FROM_EMAIL', 'welcome@yourbestdayinindia.com'));
                $fromName = (string) (Env::get('MAIL_FROM_NAME') ?: Env::get('FROM_NAME', 'Wanderer South India'));
                $mailer->addReplyTo(self::sanitizeHeader($fromEmail), self::sanitizeHeader($fromName));

                $mailer->addAddress($job['recipient_email'], $job['recipient_name'] ?: '');
                $mailer->isHTML(true);
                $mailer->Subject = $job['subject'];
                $mailer->Body = $job['body_html'];
                $mailer->AltBody = $job['body_text'] ?: strip_tags($job['body_html']);

                if (!empty($job['attachment_path']) && file_exists($job['attachment_path'])) {
                    $attName = !empty($job['attachment_name']) ? $job['attachment_name'] : basename($job['attachment_path']);
                    $mailer->addAttachment($job['attachment_path'], $attName, 'base64', 'application/pdf');
                }

                // Strictly verify delivery confirmation from SMTP transport
                $sent = $mailer->send();
                if ($sent) {
                    $pdo->prepare('UPDATE `email_queue` SET `status` = "sent", `sent_at` = NOW(), `last_error` = NULL WHERE `id` = :id')
                        ->execute([':id' => $jobId]);

                    $sentCount++;

                    // Update booking record delivery status
                    if ($bookingId) {
                        if ($emailType === 'customer_acknowledgement' || $emailType === 'customer_ticket') {
                            \App\Models\Booking::recordEmailDispatchResult($bookingId, true, null, false, null);
                        } elseif ($emailType === 'admin_notification' || $emailType === 'admin_confirmed_copy') {
                            \App\Models\Booking::recordEmailDispatchResult($bookingId, false, null, true, null);
                        }
                    }
                } else {
                    throw new \RuntimeException($mailer->ErrorInfo ?: 'Unknown mail transport failure');
                }
            } catch (Throwable $e) {
                $errorMsg = $e->getMessage();
                $errors[] = "Job {$jobId} failed: {$errorMsg}";
                $failedCount++;

                $pdo->prepare('UPDATE `email_queue` SET `status` = "failed", `last_error` = :err WHERE `id` = :id')
                    ->execute([':id' => $jobId, ':err' => substr($errorMsg, 0, 500)]);

                if ($bookingId) {
                    if ($emailType === 'customer_acknowledgement' || $emailType === 'customer_ticket') {
                        \App\Models\Booking::recordEmailDispatchResult($bookingId, false, $errorMsg, false, null);
                    }
                }
            }
        }

        // Close persistent SMTP connection
        try {
            $mailer->smtpClose();
        } catch (Throwable $e) {
            // Ignore
        }

        return [
            'processed' => $processed,
            'sent' => $sentCount,
            'failed' => $failedCount,
            'errors' => $errors,
        ];
    }

    /**
     * Trigger asynchronous background queue processing to avoid blocking user HTTP responses.
     */
    public static function triggerAsyncProcessing(?int $bookingId = null): void
    {
        // Strategy 1: FastCGI request finish (PHP-FPM)
        if (function_exists('fastcgi_finish_request')) {
            fastcgi_finish_request();
            self::processQueue(20, $bookingId);
            return;
        }

        // Strategy 2: Detached CLI background process
        $scriptPath = realpath(__DIR__ . '/../scripts/process_email_queue.php');
        if ($scriptPath && file_exists($scriptPath)) {
            $arg = $bookingId ? (string) $bookingId : '0';
            if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
                $cmd = "start /B php " . escapeshellarg($scriptPath) . " {$arg} > NUL 2>&1";
                pclose(popen($cmd, "r"));
                return;
            } else {
                $cmd = "php " . escapeshellarg($scriptPath) . " {$arg} > /dev/null 2>&1 &";
                exec($cmd);
                return;
            }
        }

        // Strategy 3: Graceful fallback - process inline with persistent connection
        self::processQueue(20, $bookingId);
    }

    /**
     * Send a password-reset verification code to the account's registered email.
     * The code must never be returned in an API response when this succeeds —
     * only a failed/not-configured send justifies falling back to displaying it.
     *
     * @param string $toEmail
     * @param string $code
     * @return array [bool $success, ?string $errorMessage]
     */
    public static function sendPasswordResetCode(string $toEmail, string $code): array
    {
        if ($toEmail === '' || !filter_var($toEmail, FILTER_VALIDATE_EMAIL)) {
            return [false, 'A valid recipient email address is required.'];
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
            $cleanCode = self::sanitizeHeader($code);

            $mailer = self::createMailer();
            $mailer->addAddress($cleanToEmail);

            $mailer->isHTML(true);
            $mailer->Subject = 'Your Password Reset Code | Wanderer South India';
            $mailer->Body = "<p>Your password reset verification code is:</p><h2 style=\"letter-spacing:4px;\">{$cleanCode}</h2><p>This code expires shortly. If you did not request this, you can safely ignore this email.</p>";
            $mailer->AltBody = "Your password reset verification code is: {$cleanCode}\n\nThis code expires shortly. If you did not request this, you can safely ignore this email.";

            $mailer->send();
            return [true, null];
        } catch (PHPMailerException|Throwable $e) {
            $errorMsg = $e->getMessage();
            error_log("[Wanderer Mail Error] Failed password reset code dispatch to {$toEmail}: {$errorMsg}");
            return [false, "SMTP delivery failed: {$errorMsg}"];
        }
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
        $adminEmail = trim((string) Env::get('ADMIN_EMAIL', ''));
        if ($adminEmail === '' || !filter_var($adminEmail, FILTER_VALIDATE_EMAIL)) {
            return [false, 'A valid ADMIN_EMAIL address must be configured in .env.'];
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
        $adminEmail = trim((string) Env::get('ADMIN_EMAIL', ''));
        if ($adminEmail === '' || !filter_var($adminEmail, FILTER_VALIDATE_EMAIL)) {
            return [false, 'A valid ADMIN_EMAIL address must be configured in .env.'];
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

    public static function renderAdminConfirmedHtml(array $booking, string $orderNumber): string
    {
        $currency = $booking['currency'] ?? 'INR';
        $total = $currency . ' ' . number_format((float) ($booking['total_price'] ?? 0), 2);
        $advance = $currency . ' ' . number_format((float) ($booking['advance_amount'] ?? 0), 2);
        $balance = $currency . ' ' . number_format((float) ($booking['balance_amount'] ?? 0), 2);
        $customerName = htmlspecialchars((string) ($booking['customer']['name'] ?? 'Guest'), ENT_QUOTES, 'UTF-8');
        $customerPhone = htmlspecialchars((string) ($booking['customer']['phone'] ?? ''), ENT_QUOTES, 'UTF-8');
        $tourTitle = htmlspecialchars((string) ($booking['tour']['title'] ?? ''), ENT_QUOTES, 'UTF-8');
        $bookingDate = htmlspecialchars((string) ($booking['booking_date'] ?? ''), ENT_QUOTES, 'UTF-8');
        $paymentMethod = htmlspecialchars((string) ($booking['payment_method'] ?? 'Manual'), ENT_QUOTES, 'UTF-8');

        return <<<HTML
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 20px; color: #0B1329;">
    <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 10px; padding: 24px; border: 1px solid #e2e8f0;">
        <h2 style="color: #01aa90; margin: 0 0 12px; font-size: 18px;">✓ Booking Approved &amp; Confirmed — #{$orderNumber}</h2>
        <p style="font-size: 14px; margin: 0 0 16px;">This booking has been approved by the administrator. Official ticket has been emailed to the customer with PDF attached.</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr><td style="padding: 6px 0; color: #64748b;">Customer:</td><td style="font-weight: bold; text-align: right;">{$customerName} ({$customerPhone})</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Tour:</td><td style="font-weight: bold; text-align: right;">{$tourTitle}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Travel Date:</td><td style="font-weight: bold; text-align: right;">{$bookingDate}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Total Amount:</td><td style="font-weight: bold; text-align: right;">{$total}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Advance Paid:</td><td style="font-weight: bold; text-align: right; color: #16a34a;">{$advance}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Remaining Balance:</td><td style="font-weight: bold; text-align: right; color: #e11d48;">{$balance}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Payment Method:</td><td style="font-weight: bold; text-align: right;">{$paymentMethod}</td></tr>
        </table>
    </div>
</body>
</html>
HTML;
    }

    public static function getSupportEmail(): string
    {
        $mailFrom = Env::get('MAIL_FROM_ADDRESS');
        if (!empty($mailFrom)) {
            return (string) $mailFrom;
        }
        $adminEmail = Env::get('ADMIN_EMAIL');
        if (!empty($adminEmail)) {
            return (string) $adminEmail;
        }
        return 'contact@wonderersouthindia.in';
    }

    /**
     * Send customer acknowledgement email for Custom Trip Request / Inquiry.
     *
     * @param array $inquiry
     * @return array [bool $success, ?string $errorMessage]
     */
    public static function sendInquiryCustomerAcknowledgement(array $inquiry): array
    {
        $toEmail = trim((string) ($inquiry['email'] ?? ''));
        if ($toEmail === '' || !filter_var($toEmail, FILTER_VALIDATE_EMAIL)) {
            return [false, 'A valid customer email is required.'];
        }

        [$isConfigured, $missing] = self::checkSmtpConfiguration();
        if (!$isConfigured) {
            return [false, 'SMTP is not configured on the server.'];
        }

        try {
            $cleanToEmail = self::sanitizeHeader($toEmail);
            $cleanName = self::sanitizeHeader((string) ($inquiry['name'] ?? 'Valued Traveler'));
            $destination = self::sanitizeHeader((string) ($inquiry['destination_name'] ?? ($inquiry['destination'] ?? 'South India')));

            $mailer = self::createMailer();
            $mailer->addAddress($cleanToEmail, $cleanName);

            $mailer->isHTML(true);
            $mailer->Subject = "Custom Trip Request Received — {$destination} | Wanderer South India";
            $mailer->Body = <<<HTML
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 20px; color: #0B1329;">
    <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
        <h2 style="color: #01aa90; margin: 0 0 12px; font-size: 20px;">Trip Request Received 🌴</h2>
        <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
            Dear <strong>{$cleanName}</strong>,<br>
            Thank you for reaching out to <strong>Wanderer South India</strong>! We have received your custom tour itinerary request for <strong>{$destination}</strong>.
        </p>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #16a34a; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px; font-size: 13.5px; color: #166534;">
            Our South India tour specialist will review your preferences and share a personalized quote &amp; plan with you shortly via Email and WhatsApp.
        </div>
        <p style="font-size: 13px; color: #64748b; margin: 0;">Need immediate assistance? Call/WhatsApp: <strong>+91 9840291110</strong></p>
    </div>
</body>
</html>
HTML;
            $mailer->AltBody = "Dear {$cleanName},\n\nWe have received your custom trip request for {$destination}. Our tour expert will contact you shortly with a personalized plan and quote.\n\nThank you for choosing Wanderer South India!";

            $mailer->send();
            return [true, null];
        } catch (PHPMailerException|Throwable $e) {
            $errorMsg = $e->getMessage();
            error_log("[Wanderer Mail Error] Failed trip request acknowledgement dispatch: {$errorMsg}");
            return [false, "SMTP delivery failed: {$errorMsg}"];
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
        $supportEmail = self::getSupportEmail();

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
                <p style="margin: 0;">✉️ Email: <a href="mailto:{$e($supportEmail)}" style="color: #01aa90; text-decoration: none;">{$e($supportEmail)}</a></p>
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
        $supportEmail = self::getSupportEmail();

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
            . "If you have any questions, call or WhatsApp us at +91 9840291110 or email " . $supportEmail . ".\n\n"
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
        $supportEmail = self::getSupportEmail();

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
                <p style="margin: 0;">✉️ Email Support: <a href="mailto:{$e($supportEmail)}" style="color: #01aa90; text-decoration: none;">{$e($supportEmail)}</a></p>
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
