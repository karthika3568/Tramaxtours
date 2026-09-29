<?php

namespace App\Utils;

class Response
{
    /**
     * Send a standardized JSON response.
     *
     * @param array $payload
     * @param int $statusCode
     * @param array $headers
     * @return void
     */
    public static function json(array $payload, int $statusCode = 200, array $headers = []): void
    {
        $body = (string) json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);

        if (!headers_sent()) {
            http_response_code($statusCode);
            header('Content-Type: application/json; charset=UTF-8');
            header('Content-Length: ' . (string) strlen($body));

            foreach ($headers as $header => $value) {
                header("{$header}: {$value}");
            }
        }

        echo $body;
        exit;
    }

    /**
     * Send a successful JSON response.
     *
     * @param mixed $data
     * @param string $message
     * @param int $statusCode
     * @param array $extra
     * @return void
     */
    public static function success(mixed $data = null, string $message = 'Success', int $statusCode = 200, array $extra = []): void
    {
        $payload = array_merge([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $extra);

        self::json($payload, $statusCode);
    }

    /**
     * Send an error JSON response.
     *
     * @param string $message
     * @param int $statusCode
     * @param array|null $errors
     * @param string|null $errorCode
     * @return void
     */
    public static function error(string $message = 'An error occurred', int $statusCode = 400, ?array $errors = null, ?string $errorCode = null): void
    {
        $payload = [
            'success' => false,
            'message' => $message,
        ];

        if ($errorCode !== null) {
            $payload['error_code'] = $errorCode;
        }

        if ($errors !== null && !empty($errors)) {
            $payload['errors'] = $errors;
        }

        self::json($payload, $statusCode);
    }
}
