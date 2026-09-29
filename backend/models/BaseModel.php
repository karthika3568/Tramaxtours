<?php

namespace App\Models;

use App\Utils\Database;
use PDO;
use PDOStatement;

abstract class BaseModel
{
    /**
     * Get the PDO database connection.
     *
     * @return PDO
     */
    protected static function db(): PDO
    {
        return Database::getConnection();
    }

    /**
     * Execute a prepared SQL query and return the statement.
     *
     * @param string $sql
     * @param array $params
     * @return PDOStatement
     */
    protected static function query(string $sql, array $params = []): PDOStatement
    {
        $stmt = self::db()->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    /**
     * Fetch a single row as an associative array.
     *
     * @param string $sql
     * @param array $params
     * @return array|null
     */
    protected static function fetchOne(string $sql, array $params = []): ?array
    {
        $stmt = self::query($sql, $params);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    /**
     * Fetch all rows matching the query.
     *
     * @param string $sql
     * @param array $params
     * @return array
     */
    protected static function fetchAll(string $sql, array $params = []): array
    {
        $stmt = self::query($sql, $params);
        return $stmt->fetchAll();
    }

    /**
     * Fetch a single scalar value.
     *
     * @param string $sql
     * @param array $params
     * @return mixed
     */
    protected static function fetchColumn(string $sql, array $params = []): mixed
    {
        $stmt = self::query($sql, $params);
        return $stmt->fetchColumn();
    }

    /**
     * Execute an INSERT, UPDATE, or DELETE query and return affected rows count.
     *
     * @param string $sql
     * @param array $params
     * @return int
     */
    protected static function execute(string $sql, array $params = []): int
    {
        $stmt = self::query($sql, $params);
        return $stmt->rowCount();
    }

    /**
     * Return the last inserted ID.
     *
     * @return string
     */
    protected static function lastInsertId(): string
    {
        return self::db()->lastInsertId();
    }
}
