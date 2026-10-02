<?php
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/utils/Env.php';
require_once __DIR__ . '/utils/Database.php';

\App\Utils\Env::load(__DIR__ . '/.env');
$db = \App\Utils\Database::getConnection();

echo "Running migrations 012 to 022...\n";

$migrationFiles = glob(__DIR__ . '/../database/migrations/*.sql');
sort($migrationFiles);

foreach ($migrationFiles as $file) {
    $filename = basename($file);
    if (preg_match('/^(01[2-9]|02[0-9])/', $filename)) {
        echo "Executing $filename...\n";
        $sql = file_get_contents($file);
        try {
            $db->exec($sql);
            echo "  [+] Success\n";
        } catch (Exception $e) {
            echo "  [-] Notice: " . $e->getMessage() . "\n";
        }
    }
}

echo "All migrations finished.\n";
