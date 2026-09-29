<?php
require_once __DIR__ . '/../vendor/autoload.php';
\App\Utils\Env::load(__DIR__ . '/../.env');

$pdo = \App\Utils\Database::getConnection();

$media = $pdo->query("SELECT id, file_path, original_name, filename FROM media ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);
echo "Total media records in DB: " . count($media) . "\n";
foreach ($media as $m) {
    echo "ID {$m['id']}: {$m['file_path']} ({$m['original_name']})\n";
}
