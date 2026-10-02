<?php

namespace App\Utils;

use PDO;
use PDOException;
use RuntimeException;

class Database
{
    /**
     * Singleton instance of PDO connection.
     */
    private static ?PDO $instance = null;

    /**
     * Active connection configuration.
     */
    private static ?array $config = null;

    /**
     * Private constructor to prevent direct instantiation.
     */
    private function __construct()
    {
    }

    /**
     * Prevent cloning.
     */
    private function __clone()
    {
    }

    /**
     * Load or set configuration array.
     *
     * @param array|null $config
     * @return void
     */
    public static function setConfig(?array $config = null): void
    {
        self::$config = $config;
    }

    /**
     * Get the PDO database connection singleton.
     *
     * @return PDO
     * @throws RuntimeException
     */
    public static function getConnection(): PDO
    {
        if (self::$instance !== null) {
            return self::$instance;
        }

        if (self::$config === null) {
            $configPath = dirname(__DIR__) . '/config/database.php';
            if (file_exists($configPath)) {
                self::$config = require $configPath;
            } else {
                throw new RuntimeException("Database configuration file not found at [{$configPath}].");
            }
        }

        $cfg = self::$config;
        $host = $cfg['host'] ?? '127.0.0.1';
        $port = $cfg['port'] ?? 3306;
        $dbname = $cfg['database'] ?? 'tramaxtours';
        $username = $cfg['username'] ?? 'root';
        $password = $cfg['password'] ?? '';
        $charset = $cfg['charset'] ?? 'utf8mb4';
        $options = $cfg['options'] ?? [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];

        $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset={$charset}";

        try {
            self::$instance = new PDO($dsn, $username, $password, $options);
            return self::$instance;
        } catch (PDOException $e) {
            // Sanitize message to ensure password/credentials are never leaked in traces/messages
            $maskedMessage = "Database connection failed for database '{$dbname}' on {$host}:{$port}.";
            
            // Log full technical error internally if needed (without raw password)
            error_log("[Wanderer Database Error] Code " . $e->getCode() . ": " . $e->getMessage());

            throw new RuntimeException($maskedMessage, (int) $e->getCode(), $e);
        }
    }

    /**
     * Check if a database connection is active and healthy.
     *
     * @return bool
     */
    public static function isConnected(): bool
    {
        try {
            $pdo = self::getConnection();
            $stmt = $pdo->query('SELECT 1');
            return $stmt !== false;
        } catch (\Throwable $e) {
            return false;
        }
    }

    /**
     * Begin a transaction.
     *
     * @return bool
     */
    public static function beginTransaction(): bool
    {
        return self::getConnection()->beginTransaction();
    }

    /**
     * Commit active transaction.
     *
     * @return bool
     */
    public static function commit(): bool
    {
        return self::getConnection()->commit();
    }

    /**
     * Rollback active transaction.
     *
     * @return bool
     */
    public static function rollBack(): bool
    {
        return self::getConnection()->rollBack();
    }

    /**
     * Reset connection instance (useful for unit tests or reconnections).
     *
     * @return void
     */
    public static function disconnect(): void
    {
        self::$instance = null;
    }
}
