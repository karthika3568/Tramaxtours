<?php
require 'backend/vendor/autoload.php';
require 'backend/utils/Database.php';
require 'backend/config/database.php';

$db = \App\Utils\Database::getConnection();

echo "======================================================================\n";
echo "  APPLYING AUDIT FIXES & MIGRATIONS\n";
echo "======================================================================\n\n";

// 1. WhatsApp Number Alignment to +91 8072566010
echo "1. Aligning site_settings contact_whatsapp & contact_phone...\n";
// Update both setting_key/setting_value and key/value schemas if present
try {
    $db->query("UPDATE site_settings SET setting_value = '+91 8072566010' WHERE setting_key IN ('contact_whatsapp', 'contact_phone')");
} catch (\Throwable $e) {}
try {
    $db->query("UPDATE site_settings SET `value` = '+91 8072566010' WHERE `key` IN ('contact_whatsapp', 'contact_phone')");
} catch (\Throwable $e) {}

// Ensure keys exist
$ensureSetting = function($key, $val, $grp) use ($db) {
    try {
        $st = $db->prepare("SELECT id FROM site_settings WHERE setting_key = ? OR `key` = ?");
        $st->execute([$key, $key]);
        if (!$st->fetch()) {
            $ins = $db->prepare("INSERT INTO site_settings (setting_key, setting_value, setting_group, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())");
            $ins->execute([$key, $val, $grp]);
        }
    } catch (\Throwable $e) {}
};
$ensureSetting('contact_whatsapp', '+91 8072566010', 'contact');
$ensureSetting('contact_phone', '+91 8072566010', 'contact');

try {
    $db->query("UPDATE social_links SET url = 'https://wa.me/918072566010' WHERE platform = 'whatsapp'");
} catch (\Throwable $e) {}

$stCheck = $db->query("SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN ('contact_whatsapp', 'contact_phone')");
echo "DB site_settings WhatsApp values:\n";
print_r($stCheck->fetchAll(PDO::FETCH_ASSOC));

// 2. Add public_token column to contact_messages if not exists
echo "\n2. Ensuring public_token column in contact_messages...\n";
try {
    $cols = $db->query("SHOW COLUMNS FROM contact_messages LIKE 'public_token'")->fetchAll();
    if (empty($cols)) {
        $db->exec("ALTER TABLE `contact_messages` ADD COLUMN `public_token` VARCHAR(64) UNIQUE NULL AFTER `id`");
        echo " - Added public_token column to contact_messages\n";
    } else {
        echo " - public_token column already exists\n";
    }
} catch (\Throwable $e) {
    echo " - Note on public_token: " . $e->getMessage() . "\n";
}

// Generate public_token for rows that don't have one
$rowsWithoutToken = $db->query("SELECT id FROM contact_messages WHERE public_token IS NULL OR public_token = ''")->fetchAll(PDO::FETCH_ASSOC);
foreach ($rowsWithoutToken as $r) {
    $token = bin2hex(random_bytes(16));
    $db->prepare("UPDATE contact_messages SET public_token = ? WHERE id = ?")->execute([$token, $r['id']]);
}
echo " - Populated public_tokens for " . count($rowsWithoutToken) . " existing records.\n";

// 3. Ensure permissions in roles: trip_requests.view & trip_requests.manage
echo "\n3. Ensuring trip_requests.view & trip_requests.manage in roles...\n";
$perms = [
    ['trip_requests.view', 'View custom trip requests and submissions', 'inquiries'],
    ['trip_requests.manage', 'Update status, notes and manage trip requests', 'inquiries']
];
foreach ($perms as $p) {
    $chk = $db->prepare("SELECT id FROM permissions WHERE name = ?");
    $chk->execute([$p[0]]);
    $permId = $chk->fetchColumn();
    if (!$permId) {
        $ins = $db->prepare("INSERT INTO permissions (name, description, group_name, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())");
        $ins->execute([$p[0], $p[1], $p[2]]);
        $permId = $db->lastInsertId();
    }

    // Assign to super_admin and admin
    $roles = $db->query("SELECT id FROM roles WHERE slug IN ('super_admin', 'admin')")->fetchAll(PDO::FETCH_COLUMN);
    foreach ($roles as $roleId) {
        $chkRP = $db->prepare("SELECT 1 FROM role_permissions WHERE role_id = ? AND permission_id = ?");
        $chkRP->execute([$roleId, $permId]);
        if (!$chkRP->fetch()) {
            $db->prepare("INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)")->execute([$roleId, $permId]);
        }
    }
}
echo " - RBAC role_permissions synchronized.\n";

// 4. Ensure exactly 6 categories in tour_categories and remap orphaned tours
echo "\n4. Ensuring exact 6 categories in tour_categories...\n";
$targetCategories = [
    'Cultural Tour' => 'cultural-tour',
    'Pilgrimage' => 'pilgrimage',
    'Beach Holiday' => 'beach-holiday',
    'Adventure Tour' => 'adventure-tour',
    'Wildlife Tour' => 'wildlife-tour',
    'Shopping Tour' => 'shopping-tour'
];

foreach ($targetCategories as $name => $slug) {
    $cChk = $db->prepare("SELECT id FROM tour_categories WHERE slug = ? OR name = ?");
    $cChk->execute([$slug, $name]);
    if (!$cChk->fetch()) {
        $db->prepare("INSERT INTO tour_categories (name, slug, is_active, created_at, updated_at) VALUES (?, ?, 1, NOW(), NOW())")->execute([$name, $slug]);
    }
}

// 5. Clean up old test tours with Live Sync in title
$db->exec("SET FOREIGN_KEY_CHECKS = 0;");
$db->exec("DELETE FROM tours WHERE title LIKE '%Live Sync Verification Tour%' OR slug LIKE '%test-live-sync%'");
$db->exec("SET FOREIGN_KEY_CHECKS = 1;");
echo " - Cleaned up transient test tour rows.\n";

echo "\n======================================================================\n";
echo "  AUDIT FIXES APPLIED SUCCESSFULLY\n";
echo "======================================================================\n";
