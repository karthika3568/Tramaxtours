<?php

namespace App\Services;

use App\Utils\Env;
use RuntimeException;

class FileUploader
{
    /**
     * Active media configuration.
     */
    private array $config;

    public function __construct(?array $config = null)
    {
        if ($config !== null) {
            $this->config = $config;
        } else {
            $configPath = dirname(__DIR__) . '/config/media.php';
            $this->config = file_exists($configPath) ? require $configPath : [];
        }
    }

    /**
     * Validate and process an uploaded file.
     *
     * @param array $file $_FILES['file'] entry
     * @return array
     * @throws RuntimeException
     */
    public function upload(array $file): array
    {
        // 1. Verify upload error code
        $this->checkUploadError($file['error'] ?? UPLOAD_ERR_NO_FILE);

        $tmpName = $file['tmp_name'] ?? '';
        $originalName = (string) ($file['name'] ?? '');
        $fileSize = (int) ($file['size'] ?? 0);

        if (!is_uploaded_file($tmpName) && !file_exists($tmpName)) {
            throw new RuntimeException('Uploaded file is missing or invalid.', 400);
        }

        if ($fileSize <= 0) {
            throw new RuntimeException('Cannot upload an empty file.', 400);
        }

        // 2. Validate max file size
        $maxSize = $this->config['max_file_size'] ?? 10485760;
        if ($fileSize > $maxSize) {
            $maxMb = round($maxSize / (1024 * 1024), 1);
            throw new RuntimeException("File exceeds the maximum allowable upload size of {$maxMb}MB.", 400);
        }

        // 3. Extract and sanitize file extension
        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        if ($extension === '') {
            throw new RuntimeException('Uploaded file must have a valid file extension.', 400);
        }

        // 4. Blacklist and Whitelist checks
        $disallowed = $this->config['disallowed_extensions'] ?? [];
        if (in_array($extension, $disallowed, true)) {
            throw new RuntimeException("Files with .{$extension} extension are strictly prohibited.", 400);
        }

        $allowedExts = $this->config['allowed_extensions'] ?? ['jpg', 'jpeg', 'png', 'webp', 'svg', 'pdf'];
        if (!in_array($extension, $allowedExts, true)) {
            $allowedList = implode(', ', $allowedExts);
            throw new RuntimeException("Invalid file extension. Allowed extensions: {$allowedList}.", 400);
        }

        // 5. Inspect MIME Type using Magic Bytes and Fileinfo fallback
        $detectedMime = $this->detectMimeType($tmpName, $extension);

        if (!$detectedMime) {
            throw new RuntimeException('Could not determine MIME type of uploaded file.', 400);
        }

        $allowedMimes = $this->config['allowed_mime_types'] ?? [];
        if (!array_key_exists($detectedMime, $allowedMimes)) {
            throw new RuntimeException("Unsupported file MIME type [{$detectedMime}].", 400);
        }

        $validExtensionsForMime = $allowedMimes[$detectedMime];
        if (!in_array($extension, $validExtensionsForMime, true)) {
            throw new RuntimeException("MIME type [{$detectedMime}] does not match file extension [.{$extension}].", 400);
        }

        // 6. Deep Content Validation
        if (in_array($detectedMime, ['image/jpeg', 'image/png', 'image/webp'], true)) {
            $imageInfo = @getimagesize($tmpName);
            if ($imageInfo === false) {
                throw new RuntimeException('Corrupted or invalid image content.', 400);
            }
        } elseif ($detectedMime === 'image/svg+xml') {
            $this->validateSvgSecurity($tmpName);
        }

        // 7. Ensure Storage Directory Exists
        $storageDir = $this->config['storage_path'] ?? (dirname(__DIR__) . '/uploads/media');
        if (!is_dir($storageDir)) {
            if (!mkdir($storageDir, 0755, true) && !is_dir($storageDir)) {
                throw new RuntimeException('Failed to create upload storage directory.', 500);
            }
        }

        // 8. Generate Unique Storage Filename
        $uniqueFilename = sprintf(
            'media_%s_%s.%s',
            date('Ymd_His'),
            bin2hex(random_bytes(8)),
            $extension
        );

        $targetPath = rtrim($storageDir, '/\\') . DIRECTORY_SEPARATOR . $uniqueFilename;

        // 9. Move Uploaded File
        $success = is_uploaded_file($tmpName)
            ? move_uploaded_file($tmpName, $targetPath)
            : copy($tmpName, $targetPath);

        if (!$success) {
            throw new RuntimeException('Failed to save uploaded file to storage disk.', 500);
        }

        // 10. Set Secure File Permissions
        @chmod($targetPath, 0644);

        $publicRelativePath = 'uploads/media/' . $uniqueFilename;

        return [
            'filename' => $uniqueFilename,
            'original_name' => $originalName,
            'file_path' => $publicRelativePath,
            'file_size' => $fileSize,
            'mime_type' => $detectedMime,
            'full_path' => $targetPath,
        ];
    }

    /**
     * Detect file MIME type via Magic Bytes header inspection and Fileinfo fallback.
     *
     * @param string $filePath
     * @param string $extension
     * @return string|null
     */
    private function detectMimeType(string $filePath, string $extension): ?string
    {
        $handle = @fopen($filePath, 'rb');
        if (!$handle) {
            return null;
        }

        $header = (string) fread($handle, 512);
        fclose($handle);

        if (strlen($header) < 4) {
            return null;
        }

        // JPEG: FF D8 FF
        if (strncmp($header, "\xFF\xD8\xFF", 3) === 0) {
            return 'image/jpeg';
        }

        // PNG: 89 50 4E 47 0D 0A 1A 0A
        if (strncmp($header, "\x89PNG\r\n\x1a\n", 8) === 0) {
            return 'image/png';
        }

        // WebP: RIFF....WEBP
        if (strncmp($header, 'RIFF', 4) === 0 && strlen($header) >= 12 && substr($header, 8, 4) === 'WEBP') {
            return 'image/webp';
        }

        // PDF: %PDF-
        if (strncmp($header, '%PDF-', 5) === 0) {
            return 'application/pdf';
        }

        // SVG: contains <svg
        if ($extension === 'svg') {
            if (stripos($header, '<svg') !== false || (stripos($header, '<?xml') !== false && stripos($header, '<svg') !== false)) {
                return 'image/svg+xml';
            }
        }

        // Fallback to finfo if extension enabled
        if (function_exists('finfo_open')) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mime = finfo_file($finfo, $filePath);
            finfo_close($finfo);
            if ($mime) {
                return $mime;
            }
        }

        return null;
    }

    /**
     * Check standard PHP file upload error codes.
     *
     * @param int $errorCode
     * @return void
     * @throws RuntimeException
     */
    private function checkUploadError(int $errorCode): void
    {
        switch ($errorCode) {
            case UPLOAD_ERR_OK:
                return;
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                throw new RuntimeException('Uploaded file exceeds server size limits.', 400);
            case UPLOAD_ERR_PARTIAL:
                throw new RuntimeException('File was only partially uploaded. Please try again.', 400);
            case UPLOAD_ERR_NO_FILE:
                throw new RuntimeException('No file was uploaded.', 400);
            case UPLOAD_ERR_NO_TMP_DIR:
                throw new RuntimeException('Missing temporary upload folder on server.', 500);
            case UPLOAD_ERR_CANT_WRITE:
                throw new RuntimeException('Failed to write uploaded file to disk.', 500);
            case UPLOAD_ERR_EXTENSION:
                throw new RuntimeException('A PHP extension stopped the file upload.', 500);
            default:
                throw new RuntimeException('Unknown file upload error.', 400);
        }
    }

    /**
     * Inspect SVG content for malicious scripts or event handlers.
     *
     * @param string $filePath
     * @return void
     * @throws RuntimeException
     */
    private function validateSvgSecurity(string $filePath): void
    {
        $content = file_get_contents($filePath);
        if ($content === false || trim($content) === '') {
            throw new RuntimeException('Empty or unreadable SVG file.', 400);
        }

        $dangerousPatterns = [
            '/<script/i',
            '/javascript\s*:/i',
            '/data\s*:\s*text\/html/i',
            '/onload\s*=/i',
            '/onerror\s*=/i',
            '/onclick\s*=/i',
            '/onmouseover\s*=/i',
            '/<foreignObject/i',
            '/<iframe/i',
            '/<embed/i',
            '/<object/i',
        ];

        foreach ($dangerousPatterns as $pattern) {
            if (preg_match($pattern, $content)) {
                throw new RuntimeException('SVG file contains potentially dangerous script content.', 400);
            }
        }
    }
}
