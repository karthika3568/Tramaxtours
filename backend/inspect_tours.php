<?php

require_once __DIR__ . '/vendor/autoload.php';
$pdo = App\Utils\Database::getConnection();
$t = $pdo->query('SELECT t.id, t.title, t.status, t.destination_id, d.name as dest_name, d.status as dest_status FROM tours t LEFT JOIN destinations d ON t.destination_id = d.id')->fetchAll(PDO::FETCH_ASSOC);
print_r($t);
