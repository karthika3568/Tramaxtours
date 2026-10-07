<?php

define('BACKEND_ROOT', __DIR__);

require_once __DIR__ . '/utils/Env.php';
require_once __DIR__ . '/utils/Database.php';

use App\Utils\Database;
use App\Utils\Env;

try {
    Env::load(__DIR__ . '/.env');
    $db = Database::getConnection();
    echo "Applying migrations...\n";

    $migrations = [
        '025_add_name_and_dial_code_to_contact_messages.sql',
        '026_ensure_rating_on_reviews.sql',
        '027_add_extended_fields_to_bookings.sql',
    ];

    foreach ($migrations as $file) {
        $path = __DIR__ . '/../database/migrations/' . $file;
        if (!file_exists($path)) {
            echo "[-] Missing file: $path\n";
            continue;
        }
        $sql = file_get_contents($path);
        $db->exec($sql);
        echo "[+] Applied: $file\n";
    }

    echo "\n=== Verifying contact_messages schema ===\n";
    $cols = $db->query("SHOW COLUMNS FROM contact_messages")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($cols as $col) {
        if (in_array($col['Field'], ['first_name', 'middle_name', 'last_name', 'dial_code', 'name', 'phone', 'whatsapp_number'])) {
            echo "  - {$col['Field']} ({$col['Type']})\n";
        }
    }

    echo "\n=== Verifying reviews schema ===\n";
    $colsReviews = $db->query("SHOW COLUMNS FROM reviews")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($colsReviews as $col) {
        if (in_array($col['Field'], ['rating', 'image', 'customer_name', 'content'])) {
            echo "  - {$col['Field']} ({$col['Type']})\n";
        }
    }

    echo "\n[SUCCESS] Migrations completed and verified.\n";
} catch (\Throwable $e) {
    echo "[-] Error: " . $e->getMessage() . "\n";
    exit(1);
}
