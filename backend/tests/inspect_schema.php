<?php
require_once __DIR__ . '/../utils/Env.php';
require_once __DIR__ . '/../utils/Database.php';

use App\Utils\Database;
use App\Utils\Env;

Env::load(__DIR__ . '/../.env');
$pdo = Database::getConnection();

echo "=== ROLE PERMISSIONS MAPPING ===\n";
$rows = $pdo->query("
    SELECT r.slug, r.name, COUNT(rp.permission_id) as perm_count, GROUP_CONCAT(p.name) as permissions
    FROM roles r
    LEFT JOIN role_permissions rp ON r.id = rp.role_id
    LEFT JOIN permissions p ON rp.permission_id = p.id
    GROUP BY r.id
")->fetchAll(PDO::FETCH_ASSOC);

foreach ($rows as $row) {
    echo "Role: {$row['slug']} ({$row['name']}) -> {$row['perm_count']} perms: {$row['permissions']}\n\n";
}
