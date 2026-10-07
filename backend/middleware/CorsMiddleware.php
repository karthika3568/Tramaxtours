<?php

namespace App\Middleware;

use App\Utils\Request;
use App\Utils\Response;

class CorsMiddleware
{
    /**
     * Handle CORS headers and preflight OPTIONS request.
     *
     * @return void
     */
    public function handle(): void
    {
        $corsConfigPath = dirname(__DIR__) . '/config/cors.php';
        $config = file_exists($corsConfigPath) ? require $corsConfigPath : [];

        $allowedOrigins = $config['allowed_origins'] ?? ['http://localhost:5173', 'http://127.0.0.1:5173'];
        $allowedMethods = $config['allowed_methods'] ?? ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
        $allowedHeaders = $config['allowed_headers'] ?? ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-Access-Token', 'x-access-token', 'X-CSRF-Token'];
        $exposedHeaders = $config['exposed_headers'] ?? ['Content-Range', 'X-Total-Count'];
        $allowCredentials = $config['allow_credentials'] ?? true;
        $maxAge = $config['max_age'] ?? 86400;

        $origin = Request::getHeader('Origin');

        // Check if origin is allowed or if development wildcard
        if ($origin) {
            if (in_array('*', $allowedOrigins, true)) {
                header('Access-Control-Allow-Origin: *');
            } elseif (in_array($origin, $allowedOrigins, true)) {
                header("Access-Control-Allow-Origin: {$origin}");
                header('Vary: Origin');
            }
        } elseif (!empty($allowedOrigins)) {
            // Default header fallback for non-browser direct calls
            header("Access-Control-Allow-Origin: {$allowedOrigins[0]}");
        }

        if ($allowCredentials) {
            header('Access-Control-Allow-Credentials: true');
        }

        header('Access-Control-Allow-Methods: ' . implode(', ', $allowedMethods));
        header('Access-Control-Allow-Headers: ' . implode(', ', $allowedHeaders));

        if (!empty($exposedHeaders)) {
            header('Access-Control-Expose-Headers: ' . implode(', ', $exposedHeaders));
        }

        // Intercept preflight OPTIONS request immediately
        if (Request::getMethod() === 'OPTIONS') {
            header("Access-Control-Max-Age: {$maxAge}");
            http_response_code(204);
            exit;
        }
    }
}
