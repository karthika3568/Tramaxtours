<?php

require_once __DIR__ . '/vendor/autoload.php';
$res = \App\Models\Tour::paginate([], 1, 5);
print_r($res);
