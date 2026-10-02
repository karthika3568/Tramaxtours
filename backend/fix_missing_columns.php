<?php
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/utils/Env.php';
require_once __DIR__ . '/utils/Database.php';

\App\Utils\Env::load(__DIR__ . '/.env');
$db = \App\Utils\Database::getConnection();

echo "Aligning database schema for all models...\n";

function addColIfNotExists($db, $table, $col, $def) {
    $cols = $db->query("SHOW COLUMNS FROM `$table`")->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array($col, $cols, true)) {
        $db->exec("ALTER TABLE `$table` ADD COLUMN `$col` $def");
        echo "  [+] Added $col to $table\n";
    }
}

// 1. Tours table
addColIfNotExists($db, 'tours', 'available_seats', 'INT UNSIGNED NOT NULL DEFAULT 20');
addColIfNotExists($db, 'tours', 'total_seats', 'INT UNSIGNED NOT NULL DEFAULT 20');
addColIfNotExists($db, 'tours', 'booking_deadline_days', 'INT UNSIGNED NOT NULL DEFAULT 1');
addColIfNotExists($db, 'tours', 'travel_days', "VARCHAR(100) NULL DEFAULT 'Daily'");
addColIfNotExists($db, 'tours', 'deleted_by', 'BIGINT UNSIGNED NULL DEFAULT NULL');

// 2. Reviews table
addColIfNotExists($db, 'reviews', 'deleted_at', 'TIMESTAMP NULL DEFAULT NULL');
addColIfNotExists($db, 'reviews', 'deleted_by', 'BIGINT UNSIGNED NULL DEFAULT NULL');

// 3. Destinations table
addColIfNotExists($db, 'destinations', 'deleted_at', 'TIMESTAMP NULL DEFAULT NULL');
addColIfNotExists($db, 'destinations', 'deleted_by', 'BIGINT UNSIGNED NULL DEFAULT NULL');

// 4. Pages table
addColIfNotExists($db, 'pages', 'deleted_at', 'TIMESTAMP NULL DEFAULT NULL');
addColIfNotExists($db, 'pages', 'deleted_by', 'BIGINT UNSIGNED NULL DEFAULT NULL');

// 5. Site Settings default whatsapp
$db->exec("INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`, `created_at`, `updated_at`) 
    VALUES ('contact_whatsapp', '+91 8072566010', 'contact', NOW(), NOW())
    ON DUPLICATE KEY UPDATE `setting_value` = '+91 8072566010'");

echo "Alignment complete.\n";
