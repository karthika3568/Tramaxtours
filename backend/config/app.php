<?php

use App\Utils\Env;

return [
    'name' => Env::get('APP_NAME', 'WandererSouthIndia'),
    'env' => Env::get('APP_ENV', 'production'),
    'debug' => (bool) Env::get('APP_DEBUG', false),
    'url' => Env::get('APP_URL', 'http://127.0.0.1:8080'),
    'timezone' => Env::get('APP_TIMEZONE', 'UTC'),
    'version' => '1.0.0',
];
