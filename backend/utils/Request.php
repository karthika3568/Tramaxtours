<?php

namespace App\Utils;

class Request
{
    /**
     * Parsed JSON or form body.
     */
    private static ?array $body = null;

    /**
     * Get the normalized HTTP request method.
     *
     * @return string
     */
    public static function getMethod(): string
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        if ($method === 'POST') {
            if (isset($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'])) {
                $method = strtoupper($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE']);
            } elseif (isset($_POST['_method'])) {
                $method = strtoupper($_POST['_method']);
            }
        }

        return strtoupper($method);
    }

    /**
     * Get the clean request URI path (without query string).
     *
     * @return string
     */
    public static function getPath(): string
    {
        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        
        // Remove query string
        $position = strpos($uri, '?');
        if ($position !== false) {
            $uri = substr($uri, 0, $position);
        }

        // Clean trailing slash (except root '/')
        $uri = rtrim($uri, '/');
        return $uri === '' ? '/' : $uri;
    }

    /**
     * Get query string parameters ($_GET).
     *
     * @param string|null $key
     * @param mixed $default
     * @return mixed
     */
    public static function getQueryParams(?string $key = null, mixed $default = null): mixed
    {
        if ($key === null) {
            return $_GET;
        }

        return $_GET[$key] ?? $default;
    }

    /**
     * Get parsed request payload (JSON or POST).
     *
     * @return array
     */
    public static function getBody(): array
    {
        if (self::$body !== null) {
            return self::$body;
        }

        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

        if (str_contains($contentType, 'application/json')) {
            $rawInput = file_get_contents('php://input');
            $decoded = json_decode($rawInput, true);
            self::$body = is_array($decoded) ? $decoded : [];
        } else {
            self::$body = $_POST;
        }

        return self::$body;
    }

    /**
     * Get a specific request header.
     *
     * @param string $headerName
     * @param mixed $default
     * @return mixed
     */
    public static function getHeader(string $headerName, mixed $default = null): mixed
    {
        $normalized = 'HTTP_' . strtoupper(str_replace('-', '_', $headerName));

        if (isset($_SERVER[$normalized])) {
            return $_SERVER[$normalized];
        }

        if (function_exists('getallheaders')) {
            $headers = getallheaders();
            foreach ($headers as $key => $value) {
                if (strcasecmp($key, $headerName) === 0) {
                    return $value;
                }
            }
        }

        return $default;
    }

    /**
     * Get the client IP address.
     *
     * @return string
     */
    public static function getClientIp(): string
    {
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            return $_SERVER['HTTP_CLIENT_IP'];
        }

        if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $list = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
            return trim($list[0]);
        }

        return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    }

    /**
     * Currently authenticated user context.
     */
    private static ?array $authenticatedUser = null;

    /**
     * Set the authenticated user context.
     *
     * @param array|null $user
     * @return void
     */
    public static function setAuthenticatedUser(?array $user): void
    {
        self::$authenticatedUser = $user;
    }

    /**
     * Get the currently authenticated user context.
     *
     * @return array|null
     */
    public static function getAuthenticatedUser(): ?array
    {
        return self::$authenticatedUser;
    }

    /**
     * Get the authenticated user ID, or null.
     *
     * @return int|null
     */
    public static function getUserId(): ?int
    {
        return isset(self::$authenticatedUser['id']) ? (int) self::$authenticatedUser['id'] : null;
    }
}
