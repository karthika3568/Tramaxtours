<?php
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/utils/Env.php';
require_once __DIR__ . '/utils/Database.php';

\App\Utils\Env::load(__DIR__ . '/.env');
$db = \App\Utils\Database::getConnection();

echo "Adding all trip request fields to contact_messages table...\n";

$existingCols = $db->query("SHOW COLUMNS FROM contact_messages")->fetchAll(PDO::FETCH_COLUMN);

$columnsToAdd = [
    'type' => "ENUM('general_inquiry', 'trip_request') NOT NULL DEFAULT 'trip_request' AFTER id",
    'whatsapp_number' => "VARCHAR(50) NULL AFTER phone",
    'country' => "VARCHAR(100) NULL AFTER email",
    'destination_name' => "VARCHAR(255) NULL AFTER destination_id",
    'tour_title' => "VARCHAR(255) NULL AFTER tour_id",
    'pickup_location' => "VARCHAR(255) NULL",
    'travel_date' => "VARCHAR(100) NULL",
    'arrival_date' => "DATE NULL",
    'departure_date' => "DATE NULL",
    'duration_days' => "VARCHAR(100) NULL",
    'travelers' => "INT UNSIGNED NULL DEFAULT 1",
    'adults_count' => "INT UNSIGNED NULL DEFAULT 1",
    'children_count' => "INT UNSIGNED NULL DEFAULT 0",
    'infants_count' => "INT UNSIGNED NULL DEFAULT 0",
    'vehicle_preference' => "VARCHAR(100) NULL",
    'airport_pickup' => "TINYINT(1) NOT NULL DEFAULT 0",
    'airport_drop' => "TINYINT(1) NOT NULL DEFAULT 0",
    'hotel_category' => "VARCHAR(100) NULL",
    'rooms_count' => "INT UNSIGNED NULL DEFAULT 1",
    'room_type' => "VARCHAR(100) NULL",
    'tour_types' => "JSON NULL",
    'tour_guide_required' => "TINYINT(1) NOT NULL DEFAULT 0",
    'preferred_language' => "VARCHAR(100) NULL DEFAULT 'English'",
    'arrival_flight_train_number' => "VARCHAR(100) NULL",
    'arrival_time' => "VARCHAR(50) NULL",
    'departure_flight_train_number' => "VARCHAR(100) NULL",
    'departure_time' => "VARCHAR(50) NULL",
    'approximate_budget' => "VARCHAR(100) NULL",
    'budget_currency' => "VARCHAR(10) NULL DEFAULT 'INR'",
    'passport_file_url' => "VARCHAR(255) NULL",
    'flight_ticket_url' => "VARCHAR(255) NULL",
    'preferred_contact_methods' => "JSON NULL",
    'access_token' => "VARCHAR(64) NULL",
    'quotation_amount' => "DECIMAL(10, 2) NULL"
];

foreach ($columnsToAdd as $colName => $colDef) {
    if (!in_array($colName, $existingCols, true)) {
        try {
            $db->exec("ALTER TABLE `contact_messages` ADD COLUMN `{$colName}` {$colDef}");
            echo "  [+] Added column: {$colName}\n";
        } catch (Exception $e) {
            echo "  [-] Error adding {$colName}: " . $e->getMessage() . "\n";
        }
    }
}

// Modify status enum
$db->exec("ALTER TABLE `contact_messages` MODIFY COLUMN `status` ENUM('new', 'contacted', 'planning', 'quotation_sent', 'confirmed', 'closed', 'cancelled') NOT NULL DEFAULT 'new'");
echo "  [+] Updated status enum\n";

// Ensure destination 1 exists
$destExists = $db->query("SELECT id FROM destinations LIMIT 1")->fetchColumn();
if (!$destExists) {
    $db->exec("INSERT INTO destinations (id, name, slug, status, created_at, updated_at) VALUES (1, 'Tamil Nadu', 'tamil-nadu', 'published', NOW(), NOW())");
    echo "  [+] Seeded sample destination 1\n";
}

// Ensure .htaccess in storage/documents
@mkdir(__DIR__ . '/storage/documents', 0777, true);
file_put_contents(__DIR__ . '/storage/documents/.htaccess', "Deny from all\n");
echo "  [+] Created private storage/.htaccess\n";

echo "Schema update completed successfully.\n";
