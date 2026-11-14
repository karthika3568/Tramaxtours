<?php
require_once dirname(__DIR__) . '/utils/Database.php';
require_once dirname(__DIR__) . '/utils/Env.php';

use App\Utils\Database;
use App\Utils\Env;

Env::load(dirname(__DIR__) . '/.env');

$pdo = Database::getConnection();

// Drop unused legacy tour_related table if exists
$pdo->exec("DROP TABLE IF EXISTS `tour_related`");

$stmt = $pdo->query("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'");
$tables = $stmt->fetchAll(PDO::FETCH_NUM);

echo "========================================================\n";
echo " DATABASE TABLE INVENTORY: " . count($tables) . " TABLES\n";
echo " Database: " . Env::get('DB_DATABASE', 'tramaxtours') . "\n";
echo "========================================================\n\n";

$tableData = [];
foreach ($tables as $t) {
    $tName = $t[0];
    $count = (int) $pdo->query("SELECT COUNT(*) FROM `{$tName}`")->fetchColumn();
    $colsStmt = $pdo->query("SHOW COLUMNS FROM `{$tName}`");
    $cols = $colsStmt->fetchAll(PDO::FETCH_ASSOC);
    $colCount = count($cols);
    $colNames = array_column($cols, 'Field');
    
    $tableData[] = [
        'name' => $tName,
        'rows' => $count,
        'cols' => $colCount,
        'fields' => implode(', ', array_slice($colNames, 0, 5)) . ($colCount > 5 ? '...' : '')
    ];
}

foreach ($tableData as $td) {
    printf("%-35s | %5d rows | %3d cols | (%s)\n", $td['name'], $td['rows'], $td['cols'], $td['fields']);
}
