<?php

declare(strict_types=1);

define('BACKEND_ROOT', dirname(__DIR__));
require_once BACKEND_ROOT . '/utils/Env.php';
require_once BACKEND_ROOT . '/utils/Database.php';

use App\Utils\Database;
use App\Utils\Env;

try {
    Env::load(BACKEND_ROOT . '/.env');
    $pdo = Database::getConnection();

    $destColExists = (int) $pdo->query("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'destinations' AND COLUMN_NAME = 'deleted_by'")->fetchColumn();
    if ($destColExists === 0) {
        $pdo->exec("ALTER TABLE `destinations` ADD COLUMN `deleted_by` BIGINT UNSIGNED NULL AFTER `deleted_at`, ADD INDEX `idx_destinations_deleted_by` (`deleted_by`), ADD CONSTRAINT `fk_dest_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;");
        echo "Added deleted_by to destinations table." . PHP_EOL;
    } else {
        echo "destinations.deleted_by already exists." . PHP_EOL;
    }

    $tourColExists = (int) $pdo->query("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tours' AND COLUMN_NAME = 'deleted_by'")->fetchColumn();
    if ($tourColExists === 0) {
        $pdo->exec("ALTER TABLE `tours` ADD COLUMN `deleted_by` BIGINT UNSIGNED NULL AFTER `deleted_at`, ADD INDEX `idx_tours_deleted_by` (`deleted_by`), ADD CONSTRAINT `fk_tours_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;");
        echo "Added deleted_by to tours table." . PHP_EOL;
    } else {
        echo "tours.deleted_by already exists." . PHP_EOL;
    }

    echo "Migration 012 execution verified successfully." . PHP_EOL;
} catch (Exception $e) {
    echo "Error applying migration: " . $e->getMessage() . PHP_EOL;
    exit(1);
}
