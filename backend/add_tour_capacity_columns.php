<?php

require_once __DIR__ . '/vendor/autoload.php';
\App\Utils\Env::load(__DIR__ . '/.env');

use App\Utils\Database;

$pdo = Database::getConnection();

echo "Adding tour capacity and deadline columns to tours table...\n";

try {
    $pdo->query("
        ALTER TABLE `tours`
        ADD COLUMN `available_seats` INT UNSIGNED NULL DEFAULT 20,
        ADD COLUMN `total_seats` INT UNSIGNED NULL DEFAULT 20,
        ADD COLUMN `booking_deadline_days` INT UNSIGNED NULL DEFAULT 1,
        ADD COLUMN `travel_days` VARCHAR(255) NULL DEFAULT 'Daily'
    ");
    echo "[OK] Columns added successfully.\n";
} catch (\PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column') !== false) {
        echo "[INFO] Columns already exist.\n";
    } else {
        echo "[ERROR] " . $e->getMessage() . "\n";
    }
}

// Update existing tours to have default seats
$pdo->query("UPDATE `tours` SET `available_seats` = 15, `total_seats` = 20 WHERE `available_seats` IS NULL");

echo "[OK] Tour capacity setup complete.\n";
