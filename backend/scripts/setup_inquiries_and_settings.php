<?php
require_once __DIR__ . '/../vendor/autoload.php';
\App\Utils\Env::load(__DIR__ . '/../.env');

$pdo = \App\Utils\Database::getConnection();

echo "1. Checking & Updating site_settings for phone and whatsapp...\n";

// Update or Insert contact_phone
$stmt = $pdo->prepare("SELECT id FROM site_settings WHERE setting_key = 'contact_phone'");
$stmt->execute();
if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $pdo->prepare("UPDATE site_settings SET setting_value = '+91 8072566010' WHERE setting_key = 'contact_phone'")->execute();
    echo " - Updated contact_phone to +91 8072566010\n";
} else {
    $pdo->prepare("INSERT INTO site_settings (setting_key, setting_value, setting_group, created_at, updated_at) VALUES ('contact_phone', '+91 8072566010', 'contact', NOW(), NOW())")->execute();
    echo " - Inserted contact_phone: +91 8072566010\n";
}

// Update or Insert contact_whatsapp
$stmt = $pdo->prepare("SELECT id FROM site_settings WHERE setting_key = 'contact_whatsapp'");
$stmt->execute();
if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $pdo->prepare("UPDATE site_settings SET setting_value = '+91 8072566010' WHERE setting_key = 'contact_whatsapp'")->execute();
    echo " - Updated contact_whatsapp to +91 8072566010\n";
} else {
    $pdo->prepare("INSERT INTO site_settings (setting_key, setting_value, setting_group, created_at, updated_at) VALUES ('contact_whatsapp', '+91 8072566010', 'contact', NOW(), NOW())")->execute();
    echo " - Inserted contact_whatsapp: +91 8072566010\n";
}

echo "\n2. Updating contact_messages table schema...\n";

// Check columns in contact_messages
$colsStmt = $pdo->query("SHOW COLUMNS FROM contact_messages");
$existingCols = array_column($colsStmt->fetchAll(PDO::FETCH_ASSOC), 'Field');

if (!in_array('travel_date', $existingCols)) {
    $pdo->exec("ALTER TABLE `contact_messages` ADD COLUMN `travel_date` VARCHAR(100) NULL AFTER `destination_id`");
    echo " - Added travel_date column\n";
}

if (!in_array('travelers', $existingCols)) {
    $pdo->exec("ALTER TABLE `contact_messages` ADD COLUMN `travelers` INT UNSIGNED NULL DEFAULT 1 AFTER `travel_date`");
    echo " - Added travelers column\n";
}

if (!in_array('destination_name', $existingCols)) {
    $pdo->exec("ALTER TABLE `contact_messages` ADD COLUMN `destination_name` VARCHAR(150) NULL AFTER `travelers`");
    echo " - Added destination_name column\n";
}

if (!in_array('tour_title', $existingCols)) {
    $pdo->exec("ALTER TABLE `contact_messages` ADD COLUMN `tour_title` VARCHAR(191) NULL AFTER `destination_name`");
    echo " - Added tour_title column\n";
}

// Update status ENUM to support new, contacted, converted, closed, read, replied, archived
$pdo->exec("ALTER TABLE `contact_messages` MODIFY COLUMN `status` ENUM('new', 'contacted', 'converted', 'closed', 'read', 'replied', 'archived') NOT NULL DEFAULT 'new'");
echo " - Updated status ENUM on contact_messages\n";

// Check if any sample inquiry exists, if not seed a couple for demo/testing
$count = (int) $pdo->query("SELECT COUNT(*) FROM contact_messages")->fetchColumn();
if ($count === 0) {
    $pdo->exec("INSERT INTO contact_messages (name, email, phone, subject, message, destination_name, travel_date, travelers, status, created_at, updated_at) VALUES
    ('Kavitha Raman', 'kavitha.raman@example.com', '+91 98412 34567', 'Inquiry for Tamil Nadu Temple Tour', 'Looking for a 5-day private cab tour covering Mahabalipuram, Thanjavur, and Madurai for 4 family members in October.', 'Tamil Nadu', '2026-10-15', 4, 'new', NOW(), NOW()),
    ('Alexander Becker', 'a.becker@berlin-travel.de', '+49 170 1234567', 'Kerala Backwaters & Munnar Honeymoon', 'We would like a luxury 7-day private package with 1 night houseboat stay in Alleppey and 2 nights in Munnar with English chauffeur.', 'Kerala', '2026-11-01', 2, 'contacted', NOW(), NOW())");
    echo " - Seeded sample inquiries for testing\n";
}

echo "\n3. Ensuring role permissions for Inquiries (contact.view, contact.manage)...\n";
$pdo->exec("INSERT IGNORE INTO permissions (name, group_name, description, created_at, updated_at) VALUES 
('contact.view', 'Contact Messages', 'View customer contact submissions and inquiries', NOW(), NOW()), 
('contact.manage', 'Contact Messages', 'Update contact message statuses and reply notes', NOW(), NOW())");

$pdo->exec("INSERT IGNORE INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id FROM roles r 
CROSS JOIN permissions p 
WHERE p.name IN ('contact.view', 'contact.manage') 
AND r.name IN ('super_admin', 'admin', 'moderator', 'operations')");
echo " - Role permissions assigned.\n";

echo "\n4. Updating social_links table for WhatsApp...\n";
$pdo->exec("UPDATE social_links SET url = 'https://wa.me/918072566010' WHERE platform = 'whatsapp'");
echo " - Social link for WhatsApp updated.\n";

echo "\nDatabase setup for Inquiries and Settings completed successfully!\n";
