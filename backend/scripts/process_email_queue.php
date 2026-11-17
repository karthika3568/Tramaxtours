<?php
/**
 * Asynchronous Background Email Queue Processor
 * Wanderer South India / Tramax Tours
 */

declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../utils/Env.php';
\App\Utils\Env::load(__DIR__ . '/../.env');

use App\Services\MailService;

// Optional booking ID filter from CLI arguments
$bookingId = isset($argv[1]) && is_numeric($argv[1]) ? (int) $argv[1] : null;
$limit = isset($argv[2]) && is_numeric($argv[2]) ? (int) $argv[2] : 20;

$result = MailService::processQueue($limit, $bookingId);

echo json_encode([
    'timestamp' => date('c'),
    'booking_id' => $bookingId,
    'processed' => $result['processed'] ?? 0,
    'sent' => $result['sent'] ?? 0,
    'failed' => $result['failed'] ?? 0,
    'errors' => $result['errors'] ?? [],
]) . PHP_EOL;
