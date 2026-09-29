<?php

use App\Utils\Env;

return [
    'storage_path' => dirname(__DIR__) . '/uploads/media',
    'public_uri' => '/uploads/media',
    'max_file_size' => (int) Env::get('MEDIA_MAX_FILE_SIZE', 10485760), // 10 MB default
    'allowed_mime_types' => [
        'image/jpeg' => ['jpg', 'jpeg'],
        'image/png' => ['png'],
        'image/webp' => ['webp'],
        'image/svg+xml' => ['svg'],
        'application/pdf' => ['pdf'],
    ],
    'allowed_extensions' => ['jpg', 'jpeg', 'png', 'webp', 'svg', 'pdf'],
    'disallowed_extensions' => [
        'php', 'php3', 'php4', 'php5', 'php7', 'php8', 'phtml', 'phar',
        'exe', 'sh', 'bat', 'cmd', 'js', 'html', 'htm', 'cgi', 'pl', 'py',
        'jar', 'vbs', 'dll', 'bin', 'msi', 'com', 'scr', 'ps1'
    ],
];
