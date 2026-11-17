<?php
require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../utils/Env.php';
\App\Utils\Env::load(__DIR__ . '/../.env');

use App\Utils\Database;

try {
    $pdo = Database::getConnection();
    
    $sql = "CREATE TABLE IF NOT EXISTS `email_queue` (
      `id` bigint unsigned NOT NULL AUTO_INCREMENT,
      `booking_id` bigint unsigned DEFAULT NULL,
      `email_type` varchar(50) NOT NULL,
      `recipient_email` varchar(191) NOT NULL,
      `recipient_name` varchar(150) DEFAULT NULL,
      `subject` varchar(255) NOT NULL,
      `body_html` longtext NOT NULL,
      `body_text` text DEFAULT NULL,
      `attachment_path` varchar(500) DEFAULT NULL,
      `attachment_name` varchar(255) DEFAULT NULL,
      `status` enum('pending','processing','sent','failed') NOT NULL DEFAULT 'pending',
      `attempts` int unsigned NOT NULL DEFAULT 0,
      `max_attempts` int unsigned NOT NULL DEFAULT 3,
      `last_error` text DEFAULT NULL,
      `sent_at` datetime DEFAULT NULL,
      `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      KEY `idx_eq_status` (`status`),
      KEY `idx_eq_booking` (`booking_id`),
      KEY `idx_eq_type` (`email_type`),
      KEY `idx_eq_created_at` (`created_at`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    $pdo->exec($sql);
    echo "SUCCESS: email_queue table verified.\n";
} catch (Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
