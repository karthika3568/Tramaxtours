<?php

declare(strict_types=1);

define('BACKEND_ROOT', dirname(__DIR__));
require_once BACKEND_ROOT . '/utils/Env.php';
require_once BACKEND_ROOT . '/utils/Database.php';

use App\Utils\Env;
use App\Utils\Database;

Env::load(BACKEND_ROOT . '/.env');
$pdo = Database::getConnection();

echo "Running Migration 017 (Site Settings Soft-Delete Columns)..." . PHP_EOL;

// 1. Check if deleted_at already exists on site_settings
$colChk = (int) $pdo->query("SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'site_settings' AND column_name = 'deleted_at'")->fetchColumn();

if ($colChk > 0) {
    echo "Column 'deleted_at' already exists on 'site_settings'. Skipping column addition." . PHP_EOL;
} else {
    $sql = "ALTER TABLE `site_settings`
        ADD COLUMN `deleted_at` TIMESTAMP NULL DEFAULT NULL AFTER `setting_group`,
        ADD COLUMN `deleted_by` BIGINT UNSIGNED NULL AFTER `deleted_at`,
        ADD INDEX `idx_settings_deleted_at` (`deleted_at`),
        ADD CONSTRAINT `fk_settings_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE";
    $pdo->exec($sql);
    echo "Successfully added 'deleted_at' and 'deleted_by' columns and constraints to 'site_settings' table." . PHP_EOL;
}

// 2. Record migration
$stmt = $pdo->prepare("SELECT COUNT(*) FROM migrations WHERE migration = '017_add_site_settings_soft_delete_columns'");
$stmt->execute();
if ((int) $stmt->fetchColumn() === 0) {
    $pdo->prepare("INSERT INTO migrations (migration, batch, executed_at) VALUES ('017_add_site_settings_soft_delete_columns', 4, NOW())")->execute();
    echo "Recorded migration '017_add_site_settings_soft_delete_columns' in migrations table." . PHP_EOL;
}

echo "Migration 017 complete." . PHP_EOL;
