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
    'document_storage_path' => dirname(__DIR__) . '/storage/documents',
    'document_max_file_size' => 5242880, // 5 MB single source
    'document_allowed_mimes' => [
        'application/pdf' => ['pdf'],
        'image/jpeg' => ['jpg', 'jpeg'],
        'image/png' => ['png'],
        'image/webp' => ['webp'],
    ],
];
