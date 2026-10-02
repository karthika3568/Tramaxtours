<?php

namespace App\Controllers;

use App\Utils\Database;
use App\Utils\Env;
use Throwable;

class HealthController extends BaseController
{
    /**
     * Basic API health check endpoint.
     * GET /api/v1/health
     *
     * @return void
     */
    public function health(): void
    {
        $this->success([
            'status' => 'healthy',
            'service' => 'Wanderer South India Backend API',
            'version' => '1.0.0',
            'environment' => Env::get('APP_ENV', 'development'),
            'php_version' => PHP_VERSION,
            'timestamp' => gmdate('Y-m-d\TH:i:s\Z'),
        ], 'Wanderer South India API is running');
    }

    /**
     * Database health check endpoint verifying connection to the configured MySQL database.
     * GET /api/v1/health/database
     *
     * @return void
     */
    public function databaseHealth(): void
    {
        $startTime = microtime(true);

        try {
            $pdo = Database::getConnection();

            // Run lightweight non-destructive verification queries
            $dbStmt = $pdo->query('SELECT DATABASE() AS current_db, VERSION() AS mysql_version');
            $dbInfo = $dbStmt->fetch();

            $tablesStmt = $pdo->prepare(
                'SELECT COUNT(*) AS total_tables FROM information_schema.TABLES WHERE TABLE_SCHEMA = :schema_name'
            );
            $targetDb = Env::get('DB_DATABASE', 'tramaxtours');
            $tablesStmt->execute([':schema_name' => $targetDb]);
            $tableCount = (int) $tablesStmt->fetchColumn();

            $latencyMs = round((microtime(true) - $startTime) * 1000, 2);

            $this->success([
                'status' => 'connected',
                'database' => $dbInfo['current_db'] ?? $targetDb,
                'driver' => 'pdo_mysql',
                'mysql_version' => $dbInfo['mysql_version'] ?? 'Unknown',
                'tables_count' => $tableCount,
                'charset' => Env::get('DB_CHARSET', 'utf8mb4'),
                'latency_ms' => $latencyMs,
                'timestamp' => gmdate('Y-m-d\TH:i:s\Z'),
            ], 'MySQL database connection successfully established and verified');
        } catch (Throwable $e) {
            $latencyMs = round((microtime(true) - $startTime) * 1000, 2);

            $this->error(
                'Database connection check failed',
                503,
                [
                    'status' => 'disconnected',
                    'database' => Env::get('DB_DATABASE', 'tramaxtours'),
                    'error' => Env::get('APP_DEBUG', false) ? $e->getMessage() : 'Could not connect to database server',
                    'latency_ms' => $latencyMs,
                    'timestamp' => gmdate('Y-m-d\TH:i:s\Z'),
                ],
                'DATABASE_CONNECTION_ERROR'
            );
        }
    }
}
