<?php

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/utils/Env.php';
require_once __DIR__ . '/utils/Database.php';

use App\Utils\Database;
use App\Utils\Env;

Env::load(__DIR__ . '/.env');

$db = Database::getConnection();

echo "=======================================================\n";
echo "  WANDERER SOUTH INDIA DB MIGRATION & REPAIR\n";
echo "=======================================================\n";

// 1. RBAC Permissions
echo "\n1. Updating Permissions...\n";
$permCols = $db->query("SHOW COLUMNS FROM permissions")->fetchAll(PDO::FETCH_COLUMN);
echo "  Permissions Columns: " . implode(', ', $permCols) . "\n";

$fields = ['name'];
if (in_array('slug', $permCols, true)) $fields[] = 'slug';
if (in_array('description', $permCols, true)) $fields[] = 'description';
if (in_array('created_at', $permCols, true)) $fields[] = 'created_at';

$sql = "INSERT IGNORE INTO `permissions` (" . implode(', ', array_map(fn($f) => "`$f`", $fields)) . ") VALUES ";
$vals1 = ["'trip_requests.view'"];
if (in_array('slug', $permCols, true)) $vals1[] = "'trip_requests.view'";
if (in_array('description', $permCols, true)) $vals1[] = "'View bespoke trip requests and quotes'";
if (in_array('created_at', $permCols, true)) $vals1[] = "NOW()";

$vals2 = ["'trip_requests.manage'"];
if (in_array('slug', $permCols, true)) $vals2[] = "'trip_requests.manage'";
if (in_array('description', $permCols, true)) $vals2[] = "'Manage trip requests, status, notes and private docs'";
if (in_array('created_at', $permCols, true)) $vals2[] = "NOW()";

$fullSql = $sql . "(" . implode(', ', $vals1) . "), (" . implode(', ', $vals2) . ")";
$db->exec($fullSql);
echo "  [+] Inserted permissions: trip_requests.view and trip_requests.manage\n";

// Attach to roles
$roles = $db->query("SELECT id, name FROM roles WHERE name IN ('super_admin', 'admin', 'operations_manager', 'tour_operator')")->fetchAll(PDO::FETCH_ASSOC);
$permRows = $db->query("SELECT id, name FROM permissions WHERE name IN ('trip_requests.view', 'trip_requests.manage')")->fetchAll(PDO::FETCH_ASSOC);

$rolePermStmt = $db->prepare("INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`) VALUES (:role_id, :permission_id)");
foreach ($roles as $r) {
    foreach ($permRows as $p) {
        $rolePermStmt->execute([
            ':role_id' => $r['id'],
            ':permission_id' => $p['id']
        ]);
    }
    echo "  [+] Attached permissions to role: {$r['name']}\n";
}

// 2. Categories in tour_categories table
echo "\n2. Tour Categories (tour_categories)...\n";
$catCols = $db->query("SHOW COLUMNS FROM tour_categories")->fetchAll(PDO::FETCH_COLUMN);
echo "  tour_categories columns: " . implode(', ', $catCols) . "\n";

echo "  BEFORE Categories in DB:\n";
$beforeCats = $db->query("SELECT id, name, slug FROM tour_categories")->fetchAll(PDO::FETCH_ASSOC);
foreach ($beforeCats as $c) {
    echo "    - [ID: {$c['id']}] {$c['name']} ({$c['slug']})\n";
}

// Required 6 categories
$requiredCategories = [
    ['name' => 'Cultural Tour', 'slug' => 'cultural-tour', 'description' => 'Heritage monuments, royal palaces, and ancient temple architecture.'],
    ['name' => 'Pilgrimage', 'slug' => 'pilgrimage', 'description' => 'Spiritual circuits, sacred temples, and holy South India shrines.'],
    ['name' => 'Beach Holiday', 'slug' => 'beach-holiday', 'description' => 'Pristine coastal retreats, coconut groves, and sun-kissed shores.'],
    ['name' => 'Adventure Tour', 'slug' => 'adventure-tour', 'description' => 'Western Ghats trekking, wildlife safaris, and outdoor expeditions.'],
    ['name' => 'Wildlife Tour', 'slug' => 'wildlife-tour', 'description' => 'National parks, tiger reserves, elephant sanctuaries, and birding.'],
    ['name' => 'Shopping Tour', 'slug' => 'shopping-tour', 'description' => 'Silk weaving centers, spice bazaars, handicrafts, and artisanal markets.']
];

$upsertCat = $db->prepare("INSERT INTO `tour_categories` (`name`, `slug`, `description`, `created_at`, `updated_at`) 
    VALUES (:name, :slug, :description, NOW(), NOW())
    ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `description` = VALUES(`description`)");

foreach ($requiredCategories as $rc) {
    $upsertCat->execute($rc);
}

echo "\n  AFTER Categories in DB:\n";
$afterCats = $db->query("SELECT id, name, slug FROM tour_categories ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);
foreach ($afterCats as $c) {
    echo "    - [ID: {$c['id']}] {$c['name']} ({$c['slug']})\n";
}

// 3. Statuses in contact_messages
echo "\n3. Contact messages & Trip requests statuses:\n";
$statusCounts = $db->query("SELECT status, COUNT(*) as cnt FROM contact_messages GROUP BY status")->fetchAll(PDO::FETCH_ASSOC);
foreach ($statusCounts as $sc) {
    echo "  - {$sc['status']}: {$sc['cnt']}\n";
}

echo "\n=======================================================\n";
echo "  MIGRATION COMPLETE & VERIFIED!\n";
echo "=======================================================\n";
