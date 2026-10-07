<?php
/**
 * CLI Migration & Database Backup Runner for Wanderer South India
 * 
 * Usage:
 *   php backend/scripts/run_migration.php [options] [migration_files...]
 * 
 * Examples:
 *   php backend/scripts/run_migration.php --backup
 *   php backend/scripts/run_migration.php database/migrations/023_add_image_to_reviews.sql
 *   php backend/scripts/run_migration.php --describe bookings
 *   php backend/scripts/run_migration.php --all-pending
 */

// 1. Strict CLI-only guard (must not be reachable from web server)
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    echo "Forbidden: This script can only be executed via the CLI.\n";
    exit(1);
}

// 2. Load Environment Variables from backend/.env
$baseDir = dirname(__DIR__);
$projectRoot = dirname($baseDir);
$envFile = $baseDir . '/.env';

if (!file_exists($envFile)) {
    echo "❌ Error: .env file not found at: {$envFile}\n";
    exit(1);
}

// Parse .env manually if not already populated
$envLines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$env = [];
foreach ($envLines as $line) {
    $line = trim($line);
    if ($line === '' || str_starts_with($line, '#')) {
        continue;
    }
    if (strpos($line, '=') !== false) {
        [$k, $v] = explode('=', $line, 2);
        $k = trim($k);
        $v = trim($v, " \t\n\r\0\x0B\"'");
        $env[$k] = $v;
    }
}

$dbHost = $env['DB_HOST'] ?? '127.0.0.1';
$dbPort = $env['DB_PORT'] ?? '3306';
$dbName = $env['DB_DATABASE'] ?? 'tramaxtours';
$dbUser = $env['DB_USERNAME'] ?? 'root';
$dbPass = $env['DB_PASSWORD'] ?? '';
$dbCharset = $env['DB_CHARSET'] ?? 'utf8mb4';

// 3. Connect via PDO
try {
    $dsn = "mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset={$dbCharset}";
    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::MYSQL_ATTR_MULTI_STATEMENTS => true,
    ]);
} catch (PDOException $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
    exit(1);
}

echo "======================================================================\n";
echo "🐘 Wanderer South India - CLI Migration & DB Tool\n";
echo "Connected to: {$dbName}@{$dbHost}:{$dbPort} (User: {$dbUser})\n";
echo "======================================================================\n\n";

/**
 * Perform a database backup outside of the project directory.
 */
function createDatabaseBackup(PDO $pdo, string $host, string $port, string $dbname, string $user, string $pass): string {
    // Target backup directory outside the workspace
    $userHome = getenv('USERPROFILE') ?: (getenv('HOME') ?: sys_get_temp_dir());
    $backupDir = $userHome . DIRECTORY_SEPARATOR . 'wanderer_db_backups';
    
    if (!is_dir($backupDir)) {
        mkdir($backupDir, 0755, true);
    }
    
    $timestamp = date('Y-m-d_His');
    $backupFilePath = $backupDir . DIRECTORY_SEPARATOR . "backup_{$dbname}_{$timestamp}.sql";
    
    echo "📦 Creating database backup...\n";
    
    // Check if mysqldump is available
    $dumpCommand = "mysqldump --host={$host} --port={$port} --user={$user} " . ($pass !== '' ? "--password={$pass} " : '') . "{$dbname} > \"{$backupFilePath}\" 2>&1";
    $output = [];
    $returnCode = 1;
    @exec($dumpCommand, $output, $returnCode);
    
    if ($returnCode === 0 && file_exists($backupFilePath) && filesize($backupFilePath) > 0) {
        echo "✅ Backup created successfully via mysqldump!\n";
        echo "📁 Backup path: {$backupFilePath} (" . number_format(filesize($backupFilePath) / 1024, 2) . " KB)\n\n";
        return $backupFilePath;
    }
    
    // Fallback: Pure PHP SQL Export
    echo "ℹ️ mysqldump not available in PATH; generating backup using PHP export...\n";
    $fh = fopen($backupFilePath, 'w');
    if (!$fh) {
        throw new RuntimeException("Could not open backup file for writing: {$backupFilePath}");
    }
    
    fwrite($fh, "-- Wanderer South India Database Backup\n");
    fwrite($fh, "-- Database: {$dbname}\n");
    fwrite($fh, "-- Generated: " . date('Y-m-d H:i:s') . "\n\n");
    fwrite($fh, "SET FOREIGN_KEY_CHECKS=0;\n\n");
    
    $tablesStmt = $pdo->query("SHOW TABLES");
    $tables = $tablesStmt->fetchAll(PDO::FETCH_COLUMN);
    
    foreach ($tables as $table) {
        // Table structure
        $createStmt = $pdo->query("SHOW CREATE TABLE `{$table}`");
        $createRow = $createStmt->fetch(PDO::FETCH_NUM);
        fwrite($fh, "DROP TABLE IF EXISTS `{$table}`;\n");
        fwrite($fh, $createRow[1] . ";\n\n");
        
        // Table data
        $dataStmt = $pdo->query("SELECT * FROM `{$table}`");
        $rows = $dataStmt->fetchAll(PDO::FETCH_ASSOC);
        if (!empty($rows)) {
            $cols = array_map(fn($c) => "`{$c}`", array_keys($rows[0]));
            $colsStr = implode(', ', $cols);
            
            foreach ($rows as $row) {
                $values = array_map(function($val) use ($pdo) {
                    if ($val === null) return 'NULL';
                    return $pdo->quote($val);
                }, array_values($row));
                $valuesStr = implode(', ', $values);
                fwrite($fh, "INSERT INTO `{$table}` ({$colsStr}) VALUES ({$valuesStr});\n");
            }
            fwrite($fh, "\n");
        }
    }
    
    fwrite($fh, "SET FOREIGN_KEY_CHECKS=1;\n");
    fclose($fh);
    
    echo "✅ Backup created successfully via PHP SQL export!\n";
    echo "📁 Backup path: {$backupFilePath} (" . number_format(filesize($backupFilePath) / 1024, 2) . " KB)\n\n";
    return $backupFilePath;
}

/**
 * Get list of existing column names for a table.
 */
function getExistingColumns(PDO $pdo, string $dbname, string $table): array {
    $stmt = $pdo->prepare("
        SELECT COLUMN_NAME 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = :dbname AND TABLE_NAME = :table
    ");
    $stmt->execute([':dbname' => $dbname, ':table' => $table]);
    return $stmt->fetchAll(PDO::FETCH_COLUMN);
}

/**
 * Run a specific SQL migration file.
 */
function runMigrationFile(PDO $pdo, string $dbname, string $filePath, string $projectRoot): array {
    $resolvedPath = file_exists($filePath) ? $filePath : $projectRoot . '/' . ltrim($filePath, '/\\');
    if (!file_exists($resolvedPath)) {
        echo "❌ Migration file not found: {$filePath}\n";
        return ['success' => false, 'added' => [], 'skipped' => []];
    }
    
    $filename = basename($resolvedPath);
    echo "----------------------------------------------------------------------\n";
    echo "🚀 Running Migration: {$filename}\n";
    
    // Check specific tables before running
    $beforeBookingsCols = getExistingColumns($pdo, $dbname, 'bookings');
    $beforeReviewsCols = getExistingColumns($pdo, $dbname, 'reviews');
    
    $sql = file_get_contents($resolvedPath);
    
    // Special check for reviews.image in 023
    if ($filename === '023_add_image_to_reviews.sql') {
        if (in_array('image', $beforeReviewsCols, true)) {
            echo "⏭️ Column `image` already exists on `reviews` table. Skipping.\n";
            return ['success' => true, 'added' => [], 'skipped' => ['reviews.image']];
        }
    }
    
    try {
        $pdo->exec($sql);
    } catch (\Throwable $e) {
        // If error is duplicate column, inform and continue
        if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
            echo "ℹ️ Note: Column already existed ({$e->getMessage()})\n";
        } else {
            echo "⚠️ Notice/Result: " . $e->getMessage() . "\n";
        }
    }
    
    $afterBookingsCols = getExistingColumns($pdo, $dbname, 'bookings');
    $afterReviewsCols = getExistingColumns($pdo, $dbname, 'reviews');
    
    $newBookingsCols = array_values(array_diff($afterBookingsCols, $beforeBookingsCols));
    $newReviewsCols = array_values(array_diff($afterReviewsCols, $beforeReviewsCols));
    
    $added = [];
    if (!empty($newReviewsCols)) {
        foreach ($newReviewsCols as $c) {
            $added[] = "reviews.{$c}";
            echo "  ➕ Added column: `reviews`.`{$c}`\n";
        }
    }
    if (!empty($newBookingsCols)) {
        foreach ($newBookingsCols as $c) {
            $added[] = "bookings.{$c}";
            echo "  ➕ Added column: `bookings`.`{$c}`\n";
        }
    }
    
    if (empty($added)) {
        echo "  ℹ️ All columns in {$filename} were already present in the database.\n";
    } else {
        echo "  ✅ Successfully applied {$filename}\n";
    }
    
    return ['success' => true, 'added' => $added, 'skipped' => []];
}

/**
 * Print DESCRIBE table in clean formatted output.
 */
function describeTable(PDO $pdo, string $table): void {
    echo "\n======================================================================\n";
    echo "📋 Table Schema: DESCRIBE `{$table}`\n";
    echo "======================================================================\n";
    
    $stmt = $pdo->query("DESCRIBE `{$table}`");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    printf("%-32s | %-24s | %-6s | %-5s | %-16s | %s\n", "Field", "Type", "Null", "Key", "Default", "Extra");
    echo str_repeat('-', 100) . "\n";
    
    foreach ($columns as $col) {
        printf(
            "%-32s | %-24s | %-6s | %-5s | %-16s | %s\n",
            $col['Field'],
            $col['Type'],
            $col['Null'],
            $col['Key'],
            $col['Default'] !== null ? $col['Default'] : 'NULL',
            $col['Extra']
        );
    }
    echo "======================================================================\n\n";
}

// 4. CLI Argument Processing
$args = array_slice($argv, 1);
$allAddedColumns = [];

// Step 1: Always perform backup first
$backupPath = createDatabaseBackup($pdo, $dbHost, $dbPort, $dbName, $dbUser, $dbPass);

// Determine migration files to run
$filesToRun = [];
if (empty($args) || in_array('--default', $args)) {
    // Default task: Run 023, 027, 028 in order (explicitly excluding 024)
    $filesToRun = [
        'database/migrations/023_add_image_to_reviews.sql',
        'database/migrations/027_add_extended_fields_to_bookings.sql',
        'database/migrations/028_add_email_security_and_tokens_to_bookings.sql',
    ];
} else {
    foreach ($args as $arg) {
        if ($arg === '--describe' || $arg === '--backup') {
            continue;
        }
        if (str_ends_with($arg, '.sql')) {
            $filesToRun[] = $arg;
        }
    }
    if (empty($filesToRun)) {
        $filesToRun = [
            'database/migrations/023_add_image_to_reviews.sql',
            'database/migrations/027_add_extended_fields_to_bookings.sql',
            'database/migrations/028_add_email_security_and_tokens_to_bookings.sql',
        ];
    }
}

// Step 2: Run migrations in order
foreach ($filesToRun as $file) {
    if (basename($file) === '024_seed_hero_slides.sql') {
        echo "⏭️ Explicitly skipping migration 024 (seed hero slides) as instructed.\n";
        continue;
    }
    $res = runMigrationFile($pdo, $dbName, $file, $projectRoot);
    if (!empty($res['added'])) {
        $allAddedColumns = array_merge($allAddedColumns, $res['added']);
    }
}

// Step 3: Summary of added columns
echo "\n======================================================================\n";
echo "📊 Migration Summary:\n";
if (!empty($allAddedColumns)) {
    echo "Columns added during this run (" . count($allAddedColumns) . "):\n";
    foreach ($allAddedColumns as $col) {
        echo " - {$col}\n";
    }
} else {
    echo "All target columns in migrations 023, 027, and 028 are already up to date.\n";
}

// Step 4: Run DESCRIBE bookings
describeTable($pdo, 'bookings');

echo "🎉 Migration process completed successfully.\n";
