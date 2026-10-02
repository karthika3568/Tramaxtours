<?php

require_once __DIR__ . '/vendor/autoload.php';
$pdo = App\Utils\Database::getConnection();
$d = $pdo->query('SELECT id, name, deleted_at, status FROM destinations')->fetchAll(PDO::FETCH_ASSOC);
print_r($d);
