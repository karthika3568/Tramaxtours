<?php

/**
 * CLI Test Script for Outgoing SMTP Configuration
 * Usage: php backend/scripts/test_mail.php recipient@example.com
 */

declare(strict_types=1);

if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    echo "This script can only be run via CLI.\n";
    exit(1);
}

require_once dirname(__DIR__) . '/vendor/autoload.php';
require_once dirname(__DIR__) . '/utils/Env.php';
require_once dirname(__DIR__) . '/services/MailService.php';

use App\Utils\Env;
use App\Services\MailService;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

// Load .env
$envPath = dirname(__DIR__) . '/.env';
if (file_exists($envPath)) {
    Env::load($envPath);
}

$recipient = $argv[1] ?? null;
if (!$recipient || !filter_var($recipient, FILTER_VALIDATE_EMAIL)) {
    echo "❌ Error: Please provide a valid recipient email address.\n";
    echo "Usage: php backend/scripts/test_mail.php recipient@example.com\n";
    exit(1);
}

echo "=========================================================\n";
echo "🔍 Testing SMTP Configuration for Wanderer South India\n";
echo "=========================================================\n";

$host = (string) Env::get('MAIL_HOST', '127.0.0.1');
$port = (int) Env::get('MAIL_PORT', 587);
$username = (string) Env::get('MAIL_USERNAME', '');
$encryption = (string) Env::get('MAIL_ENCRYPTION', 'tls');
$fromEmail = (string) (Env::get('MAIL_FROM_ADDRESS') ?: Env::get('FROM_EMAIL', 'bookings@wanderersouthindia.com'));
$fromName = (string) (Env::get('MAIL_FROM_NAME') ?: Env::get('FROM_NAME', 'Wanderer South India'));

echo "Host:       {$host}\n";
echo "Port:       {$port}\n";
echo "Encryption: {$encryption}\n";
echo "User:       " . ($username ? $username : '(Unauthenticated / Local Relay)') . "\n";
echo "From:       {$fromName} <{$fromEmail}>\n";
echo "To:         {$recipient}\n";
echo "---------------------------------------------------------\n";

try {
    $mailer = new PHPMailer(true);
    $mailer->isSMTP();
    $mailer->CharSet = 'UTF-8';
    $mailer->Timeout = 10;

    $mailer->Host = $host;
    $mailer->Port = $port;

    if ($username !== '') {
        $mailer->SMTPAuth = true;
        $mailer->Username = $username;
        $mailer->Password = (string) Env::get('MAIL_PASSWORD', '');
    } else {
        $mailer->SMTPAuth = false;
    }

    if (strtolower($encryption) === 'tls' || ($encryption === '' && $port === 587)) {
        $mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mailer->SMTPAutoTLS = true;
    } elseif (strtolower($encryption) === 'ssl' || ($encryption === '' && $port === 465)) {
        $mailer->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    } else {
        $mailer->SMTPSecure = '';
        $mailer->SMTPAutoTLS = false;
    }

    $mailer->setFrom($fromEmail, $fromName);
    $mailer->addAddress($recipient);

    $mailer->isHTML(true);
    $mailer->Subject = 'SMTP Test Message — Wanderer South India';
    $mailer->Body = '<div style="font-family: Arial, sans-serif; padding: 20px;"><h2>SMTP Test Passed!</h2><p>Your Wanderer South India mail transport is configured properly.</p></div>';
    $mailer->AltBody = "SMTP Test Passed!\nYour Wanderer South India mail transport is configured properly.";

    $mailer->send();

    echo "✅ SUCCESS: Test email successfully sent and accepted by the SMTP server.\n";
    echo "⚠️ Note: Acceptance by the SMTP server does not guarantee delivery to the inbox (check spam/inbox or DNS SPF/DKIM/DMARC records in production).\n";
    exit(0);
} catch (PHPMailerException $e) {
    echo "❌ SMTP ERROR: " . $e->getMessage() . "\n";
    exit(1);
} catch (\Throwable $e) {
    echo "❌ UNEXPECTED ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
