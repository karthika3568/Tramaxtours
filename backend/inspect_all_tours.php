<?php

require_once __DIR__ . '/vendor/autoload.php';
$pdo = App\Utils\Database::getConnection();
$rows = $pdo->query('SELECT id, title, destination_id, deleted_at, status FROM tours')->fetchAll(PDO::FETCH_ASSOC);
print_r($rows);
