<?php

namespace App\Utils;

use Throwable;
use ErrorException;

class ErrorHandler
{
    /**
     * Whether debug mode is active.
     */
    private static bool $debug = false;

    /**
     * Register global error, exception, and shutdown handlers.
     *
     * @param bool $debug
     * @return void
     */
    public static function register(bool $debug = false): void
    {
        self::$debug = $debug;

        // Set error reporting
        error_reporting(E_ALL);

        if ($debug) {
            ini_set('display_errors', '0'); // Still capture via handler, return JSON
        } else {
            ini_set('display_errors', '0');
        }

        set_error_handler([self::class, 'handleError']);
        set_exception_handler([self::class, 'handleException']);
        register_shutdown_function([self::class, 'handleShutdown']);
    }

    /**
     * Convert PHP errors into ErrorException.
     *
     * @param int $level
     * @param string $message
     * @param string $file
     * @param int $line
     * @return bool
     * @throws ErrorException
     */
    public static function handleError(int $level, string $message, string $file = '', int $line = 0): bool
    {
        if (!(error_reporting() & $level)) {
            // Silenced with @-operator
            return false;
        }

        if (in_array($level, [E_DEPRECATED, E_USER_DEPRECATED], true)) {
            error_log(sprintf("[Tramax Deprecation] %s in %s:%d", $message, $file, $line));
            return true;
        }

        throw new ErrorException($message, 0, $level, $file, $line);
    }

    /**
     * Handle uncaught exceptions and output JSON response.
     *
     * @param Throwable $e
     * @return void
     */
    public static function handleException(Throwable $e): void
    {
        $statusCode = 500;
        $code = $e->getCode();

        if (is_int($code) && $code >= 400 && $code < 600) {
            $statusCode = $code;
        }

        // Log the exception details internally
        error_log(sprintf(
            "[Tramax API Unhandled Exception] %s in %s:%d\nStack Trace:\n%s",
            $e->getMessage(),
            $e->getFile(),
            $e->getLine(),
            $e->getTraceAsString()
        ));

        $payload = [
            'success' => false,
            'message' => self::$debug ? $e->getMessage() : 'An unexpected internal server error occurred.',
        ];

        if (self::$debug) {
            $payload['debug'] = [
                'type' => get_class($e),
                'code' => $e->getCode(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => explode("\n", $e->getTraceAsString()),
            ];
        }

        Response::json($payload, $statusCode);
    }

    /**
     * Handle fatal errors on shutdown.
     *
     * @return void
     */
    public static function handleShutdown(): void
    {
        $error = error_get_last();
        if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
            error_log(sprintf(
                "[Tramax API Fatal Error] %s in %s:%d",
                $error['message'],
                $error['file'],
                $error['line']
            ));

            $payload = [
                'success' => false,
                'message' => self::$debug ? $error['message'] : 'A fatal server error occurred.',
            ];

            if (self::$debug) {
                $payload['debug'] = [
                    'type' => 'FatalError',
                    'file' => $error['file'],
                    'line' => $error['line'],
                ];
            }

            Response::json($payload, 500);
        }
    }
}
