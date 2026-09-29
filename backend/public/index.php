<?php

/**
 * Tramax Tours - PHP REST API Entry Point & Front Controller
 * 
 * @package TramaxTours
 */

declare(strict_types=1);

// Set root path constants
define('BACKEND_ROOT', dirname(__DIR__));
define('PUBLIC_ROOT', __DIR__);

// 1. Autoloader Setup (Composer Autoloader or Built-in PSR-4 Fallback)
$composerAutoload = BACKEND_ROOT . '/vendor/autoload.php';
if (file_exists($composerAutoload)) {
    require_once $composerAutoload;
} else {
    spl_autoload_register(function ($class) {
        $prefix = 'App\\';
        $baseDir = BACKEND_ROOT . '/';

        $len = strlen($prefix);
        if (strncmp($prefix, $class, $len) !== 0) {
            return;
        }

        $relativeClass = substr($class, $len);
        $parts = explode('\\', $relativeClass);
        if (count($parts) > 1) {
            $parts[0] = strtolower($parts[0]);
        }
        $file = $baseDir . implode('/', $parts) . '.php';

        if (file_exists($file)) {
            require_once $file;
        }
    });
}

use App\Utils\Env;
use App\Utils\ErrorHandler;
use App\Utils\Router;
use App\Middleware\CorsMiddleware;
use App\Middleware\SecurityHeadersMiddleware;

use App\Utils\Response;

// 2. Load Environment Variables (.env)
$envPath = BACKEND_ROOT . '/.env';
if (file_exists($envPath)) {
    Env::load($envPath);
}

// 3. Register Centralized Error & Exception Handler
$debug = (bool) Env::get('APP_DEBUG', false);
ErrorHandler::register($debug);

// 4. Set Application Timezone
$timezone = (string) Env::get('APP_TIMEZONE', 'UTC');
date_default_timezone_set($timezone);

// 5. Execute Global Middleware
(new CorsMiddleware())->handle();
(new SecurityHeadersMiddleware())->handle();

// 6. Secure Static Uploaded Files Streamer
$requestPath = \App\Utils\Request::getPath();
if (str_starts_with($requestPath, '/uploads/')) {
    $mediaDir = BACKEND_ROOT . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'media';
    if (!is_dir($mediaDir)) {
        @mkdir($mediaDir, 0755, true);
    }

    $allowedBaseDir = realpath($mediaDir);
    $targetPath = BACKEND_ROOT . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, ltrim($requestPath, '/'));
    $realTargetFile = realpath($targetPath);

    if ($allowedBaseDir && $realTargetFile && is_file($realTargetFile)) {
        // Enforce boundary check strictly within /uploads/media
        $normalizedBase = rtrim(str_replace('/', DIRECTORY_SEPARATOR, $allowedBaseDir), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        $normalizedTarget = str_replace('/', DIRECTORY_SEPARATOR, $realTargetFile);

        $baseCompare = DIRECTORY_SEPARATOR === '\\' ? strtolower($normalizedBase) : $normalizedBase;
        $targetCompare = DIRECTORY_SEPARATOR === '\\' ? strtolower($normalizedTarget) : $normalizedTarget;

        if (str_starts_with($targetCompare, $baseCompare)) {
            $mime = 'application/octet-stream';
            if (function_exists('finfo_open')) {
                $finfo = @finfo_open(FILEINFO_MIME_TYPE);
                if ($finfo) {
                    $detected = @finfo_file($finfo, $realTargetFile);
                    if ($detected) {
                        $mime = $detected;
                    }
                    @finfo_close($finfo);
                }
            }
            if ($mime === 'application/octet-stream') {
                $ext = strtolower(pathinfo($realTargetFile, PATHINFO_EXTENSION));
                $mime = match ($ext) {
                    'jpg', 'jpeg' => 'image/jpeg',
                    'png' => 'image/png',
                    'webp' => 'image/webp',
                    'svg' => 'image/svg+xml',
                    'pdf' => 'application/pdf',
                    default => 'application/octet-stream',
                };
            }

            header('Content-Type: ' . $mime);
            header('Content-Length: ' . (string) filesize($realTargetFile));
            header('Cache-Control: public, max-age=31536000');
            readfile($realTargetFile);
            exit;
        } else {
            Response::error('Access denied. Directory traversal is strictly prohibited.', 403, null, 'FORBIDDEN_PATH');
        }
    } else {
        Response::error('Requested media asset not found.', 404, null, 'MEDIA_NOT_FOUND');
    }
}

// 7. Initialize Router and Register Routes
$router = new Router();
require_once BACKEND_ROOT . '/routes/api.php';

// 8. Dispatch Incoming Request
$router->dispatch();
