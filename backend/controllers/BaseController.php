<?php

namespace App\Controllers;

use App\Utils\Response;

abstract class BaseController
{
    /**
     * Return a standardized JSON response.
     *
     * @param array $payload
     * @param int $statusCode
     * @return void
     */
    protected function json(array $payload, int $statusCode = 200): void
    {
        Response::json($payload, $statusCode);
    }

    /**
     * Return a standardized success JSON response.
     *
     * @param mixed $data
     * @param string $message
     * @param int $statusCode
     * @param array $extra
     * @return void
     */
    protected function success(mixed $data = null, string $message = 'Success', int $statusCode = 200, array $extra = []): void
    {
        Response::success($data, $message, $statusCode, $extra);
    }

    /**
     * Return a standardized error JSON response.
     *
     * @param string $message
     * @param int $statusCode
     * @param array|null $errors
     * @param string|null $errorCode
     * @return void
     */
    protected function error(string $message = 'An error occurred', int $statusCode = 400, ?array $errors = null, ?string $errorCode = null): void
    {
        Response::error($message, $statusCode, $errors, $errorCode);
    }
}
