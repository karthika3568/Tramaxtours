<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Utils\Database;

$pdo = Database::getConnection();

try {
    $pdo->exec("ALTER TABLE contact_messages ADD COLUMN reference_id VARCHAR(32) AFTER id");
    echo "Column reference_id added.\n";
} catch (\Throwable $e) {
    echo "Notice: " . $e->getMessage() . "\n";
}

$pdo->exec("UPDATE contact_messages SET reference_id = CONCAT('TRP-', YEAR(created_at), '-', LPAD(id, 6, '0')) WHERE reference_id IS NULL OR reference_id = ''");
echo "Reference IDs backfilled.\n";
