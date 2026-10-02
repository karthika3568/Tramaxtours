<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Utils\Database;

$pdo = Database::getConnection();
$users = $pdo->query("SELECT id, name, email, password_hash, status FROM users")->fetchAll(PDO::FETCH_ASSOC);

echo "Users in database:\n";
foreach ($users as $u) {
    echo "ID: {$u['id']} | Name: {$u['name']} | Email: {$u['email']} | Status: {$u['status']}\n";
    $p1 = password_verify('Admin@12345', $u['password_hash']);
    $p2 = password_verify('Admin@Wanderer2026!', $u['password_hash']);
    $p3 = password_verify('admin123', $u['password_hash']);
    echo "  Password 'Admin@12345' valid? " . ($p1 ? "YES" : "NO") . "\n";
    echo "  Password 'Admin@Wanderer2026!' valid? " . ($p2 ? "YES" : "NO") . "\n";
    echo "  Password 'admin123' valid? " . ($p3 ? "YES" : "NO") . "\n";
}
