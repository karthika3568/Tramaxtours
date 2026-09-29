<?php

namespace App\Utils;

class Env
{
    /**
     * Loaded environment variables cache.
     */
    private static array $variables = [];

    /**
     * Whether .env file has been loaded.
     */
    private static bool $loaded = false;

    /**
     * Load environment variables from a .env file into $_ENV, $_SERVER, and internal cache.
     *
     * @param string $filePath
     * @return bool
     */
    public static function load(string $filePath): bool
    {
        if (!file_exists($filePath) || !is_readable($filePath)) {
            return false;
        }

        $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines === false) {
            return false;
        }

        foreach ($lines as $line) {
            $line = trim($line);

            // Skip comments and empty lines
            if ($line === '' || str_starts_with($line, '#') || str_starts_with($line, ';')) {
                continue;
            }

            // Split into key and value by first '='
            $parts = explode('=', $line, 2);
            if (count($parts) !== 2) {
                continue;
            }

            $key = trim($parts[0]);
            $value = trim($parts[1]);

            // Strip enclosing quotes (double or single)
            if (
                (str_starts_with($value, '"') && str_ends_with($value, '"')) ||
                (str_starts_with($value, "'") && str_ends_with($value, "'"))
            ) {
                $value = substr($value, 1, -1);
            }

            // Parse special literal values
            $parsedValue = match (strtolower($value)) {
                'true', '(true)' => true,
                'false', '(false)' => false,
                'null', '(null)' => null,
                'empty', '(empty)' => '',
                default => $value,
            };

            self::$variables[$key] = $parsedValue;

            // Also populate $_ENV, $_SERVER, and putenv
            $_ENV[$key] = $parsedValue;
            $_SERVER[$key] = $parsedValue;
            if (is_string($value) || is_numeric($value)) {
                putenv("{$key}={$value}");
            }
        }

        self::$loaded = true;
        return true;
    }

    /**
     * Get an environment variable with optional default value fallback.
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        if (array_key_exists($key, self::$variables)) {
            return self::$variables[$key];
        }

        if (array_key_exists($key, $_ENV)) {
            return $_ENV[$key];
        }

        if (array_key_exists($key, $_SERVER)) {
            return $_SERVER[$key];
        }

        $envVal = getenv($key);
        if ($envVal !== false) {
            return match (strtolower($envVal)) {
                'true', '(true)' => true,
                'false', '(false)' => false,
                'null', '(null)' => null,
                'empty', '(empty)' => '',
                default => $envVal,
            };
        }

        return $default;
    }

    /**
     * Check if an environment variable exists.
     *
     * @param string $key
     * @return bool
     */
    public static function has(string $key): bool
    {
        return array_key_exists($key, self::$variables) ||
               array_key_exists($key, $_ENV) ||
               array_key_exists($key, $_SERVER) ||
               getenv($key) !== false;
    }

    /**
     * Set an environment variable in runtime memory.
     *
     * @param string $key
     * @param mixed $value
     * @return void
     */
    public static function set(string $key, mixed $value): void
    {
        self::$variables[$key] = $value;
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }
}
