<?php

use App\Utils\Env;

return [
    'secret' => Env::get('JWT_SECRET', 'wanderer_default_secret_key_change_in_production_12345'),
    'expiration' => (int) Env::get('JWT_EXPIRATION', 86400), // 24 hours in seconds
    'issuer' => Env::get('JWT_ISSUER', 'WandererSouthIndiaAPI'),
    'algorithm' => 'HS256',
];
