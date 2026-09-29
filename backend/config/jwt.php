<?php

use App\Utils\Env;

return [
    'secret' => Env::get('JWT_SECRET', 'tramax_default_secret_key_change_in_production_12345'),
    'expiration' => (int) Env::get('JWT_EXPIRATION', 315360000), // 10 years
    'issuer' => Env::get('JWT_ISSUER', 'TramaxToursAPI'),
    'algorithm' => 'HS256',
];
