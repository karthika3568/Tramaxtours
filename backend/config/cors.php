<?php

use App\Utils\Env;

$rawOrigins = (string) Env::get('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000');
$allowedOrigins = array_values(array_filter(array_map('trim', explode(',', $rawOrigins))));

return [
    'allowed_origins' => $allowedOrigins,
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    'allowed_headers' => [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'X-CSRF-Token',
    ],
    'exposed_headers' => [
        'Content-Range',
        'X-Total-Count',
    ],
    'allow_credentials' => true,
    'max_age' => 86400, // 24 hours preflight cache
];
