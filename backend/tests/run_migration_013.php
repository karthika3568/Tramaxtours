<?php

declare(strict_types=1);

define('BACKEND_ROOT', dirname(__DIR__));
require_once BACKEND_ROOT . '/utils/Env.php';
require_once BACKEND_ROOT . '/utils/Database.php';

use App\Utils\Env;
use App\Utils\Database;

Env::load(BACKEND_ROOT . '/.env');
$pdo = Database::getConnection();

echo "Running Migration 013 (Pages Soft-Delete Columns)..." . PHP_EOL;

// 1. Check if deleted_at already exists on pages
$colChk = (int) $pdo->query("SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'pages' AND column_name = 'deleted_at'")->fetchColumn();

if ($colChk > 0) {
    echo "Column 'deleted_at' already exists on 'pages'. Skipping column addition." . PHP_EOL;
} else {
    $sql = "ALTER TABLE `pages`
        ADD COLUMN `deleted_at` TIMESTAMP NULL DEFAULT NULL AFTER `status`,
        ADD COLUMN `deleted_by` BIGINT UNSIGNED NULL AFTER `deleted_at`,
        ADD INDEX `idx_pages_deleted_at` (`deleted_at`),
        ADD CONSTRAINT `fk_pages_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE";
    $pdo->exec($sql);
    echo "Successfully added 'deleted_at' and 'deleted_by' columns and constraints to 'pages' table." . PHP_EOL;
}

// 2. Record migration
$stmt = $pdo->prepare("SELECT COUNT(*) FROM migrations WHERE migration = '013_add_pages_soft_delete_columns'");
$stmt->execute();
if ((int) $stmt->fetchColumn() === 0) {
    $pdo->prepare("INSERT INTO migrations (migration, batch, executed_at) VALUES ('013_add_pages_soft_delete_columns', 2, NOW())")->execute();
    echo "Recorded migration '013_add_pages_soft_delete_columns' in migrations table." . PHP_EOL;
}

echo "Migration 013 complete." . PHP_EOL;
