<?php

namespace App\Controllers;

use App\Models\Media;
use App\Services\AuditService;
use App\Services\FileUploader;
use App\Utils\Request;
use Throwable;

class MediaController extends BaseController
{
    /**
     * List paginated media library items with filtering.
     * GET /api/v1/media
     *
     * @return void
     */
    public function index(): void
    {
        $params = Request::getQueryParams();

        $page = isset($params['page']) ? (int) $params['page'] : 1;
        $limit = isset($params['limit']) ? (int) $params['limit'] : 20;

        $filters = [
            'search' => $params['search'] ?? null,
            'mime_type' => $params['mime_type'] ?? null,
            'type' => $params['type'] ?? null,
            'uploaded_by' => $params['uploaded_by'] ?? null,
            'date_from' => $params['date_from'] ?? null,
            'date_to' => $params['date_to'] ?? null,
            'sort_by' => $params['sort_by'] ?? 'id',
            'order' => $params['order'] ?? 'DESC',
        ];

        $result = Media::paginate($filters, $page, $limit);

        $this->success(
            $result['items'],
            'Media assets retrieved successfully',
            200,
            ['pagination' => $result['pagination']]
        );
    }

    /**
     * Get a single media item by ID.
     * GET /api/v1/media/{id}
     *
     * @param string $id
     * @return void
     */
    public function show(string $id): void
    {
        $mediaId = (int) $id;
        if ($mediaId <= 0) {
            $this->error('Invalid media ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $media = Media::findById($mediaId);
        if (!$media) {
            $this->error('Media asset not found.', 404, null, 'MEDIA_NOT_FOUND');
        }

        $references = Media::getUsageReferences($mediaId);
        $media['usage_references'] = $references;
        $media['is_in_use'] = !empty($references);

        $this->success($media, 'Media asset retrieved successfully');
    }

    /**
     * Upload a new media file.
     * POST /api/v1/media/upload or POST /api/v1/media
     *
     * @return void
     */
    public function upload(): void
    {
        if (empty($_FILES['file'])) {
            $this->error('No file was provided in the upload request. Form field must be named [file].', 422, null, 'MISSING_FILE');
        }

        $altText = isset($_POST['alt_text']) ? trim((string) $_POST['alt_text']) : null;
        $caption = isset($_POST['caption']) ? trim((string) $_POST['caption']) : null;

        if ($altText !== null && strlen($altText) > 255) {
            $this->error('Alt text cannot exceed 255 characters.', 422, null, 'VALIDATION_ERROR');
        }
        if ($caption !== null && strlen($caption) > 255) {
            $this->error('Caption cannot exceed 255 characters.', 422, null, 'VALIDATION_ERROR');
        }

        try {
            $uploader = new FileUploader();
            $fileInfo = $uploader->upload($_FILES['file']);

            $userId = Request::getUserId();

            $mediaId = Media::create([
                'filename' => $fileInfo['filename'],
                'original_name' => $fileInfo['original_name'],
                'file_path' => $fileInfo['file_path'],
                'file_size' => $fileInfo['file_size'],
                'mime_type' => $fileInfo['mime_type'],
                'alt_text' => $altText,
                'caption' => $caption,
                'uploaded_by' => $userId,
            ]);

            $media = Media::findById($mediaId);

            // Record audit log
            AuditService::log(
                $userId,
                'media_upload',
                'media',
                $mediaId,
                null,
                [
                    'filename' => $fileInfo['filename'],
                    'original_name' => $fileInfo['original_name'],
                    'file_size' => $fileInfo['file_size'],
                    'mime_type' => $fileInfo['mime_type'],
                ]
            );

            $this->success($media, 'Media file uploaded successfully', 201);
        } catch (Throwable $e) {
            $statusCode = ($e->getCode() >= 400 && $e->getCode() < 600) ? (int) $e->getCode() : 400;
            $this->error($e->getMessage(), $statusCode, null, 'UPLOAD_FAILED');
        }
    }

    /**
     * Update media metadata (alt text, caption).
     * PUT /api/v1/media/{id} or PATCH /api/v1/media/{id}
     *
     * @param string $id
     * @return void
     */
    public function update(string $id): void
    {
        $mediaId = (int) $id;
        if ($mediaId <= 0) {
            $this->error('Invalid media ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $existing = Media::findById($mediaId);
        if (!$existing) {
            $this->error('Media asset not found.', 404, null, 'MEDIA_NOT_FOUND');
        }

        $body = Request::getBody();

        $altText = array_key_exists('alt_text', $body)
            ? ($body['alt_text'] !== null ? trim((string) $body['alt_text']) : null)
            : $existing['alt_text'];

        $caption = array_key_exists('caption', $body)
            ? ($body['caption'] !== null ? trim((string) $body['caption']) : null)
            : $existing['caption'];

        if ($altText !== null && strlen($altText) > 255) {
            $this->error('Alt text cannot exceed 255 characters.', 422, null, 'VALIDATION_ERROR');
        }
        if ($caption !== null && strlen($caption) > 255) {
            $this->error('Caption cannot exceed 255 characters.', 422, null, 'VALIDATION_ERROR');
        }

        Media::updateMetadata($mediaId, $altText, $caption);
        $updated = Media::findById($mediaId);

        $userId = Request::getUserId();

        // Record audit log
        AuditService::log(
            $userId,
            'media_update',
            'media',
            $mediaId,
            [
                'alt_text' => $existing['alt_text'],
                'caption' => $existing['caption'],
            ],
            [
                'alt_text' => $altText,
                'caption' => $caption,
            ]
        );

        $this->success($updated, 'Media metadata updated successfully');
    }

    /**
     * Delete media item and its physical disk asset.
     * DELETE /api/v1/media/{id}
     *
     * @param string $id
     * @return void
     */
    public function delete(string $id): void
    {
        $mediaId = (int) $id;
        if ($mediaId <= 0) {
            $this->error('Invalid media ID parameter.', 400, null, 'INVALID_PARAMETER');
        }

        $media = Media::findById($mediaId);
        if (!$media) {
            $this->error('Media asset not found.', 404, null, 'MEDIA_NOT_FOUND');
        }

        // Check active references
        $references = Media::getUsageReferences($mediaId);
        $isForce = strtolower((string) Request::getQueryParams('force', 'false')) === 'true';

        if (!empty($references) && !$isForce) {
            $this->error(
                'Media asset is currently in use across application content and cannot be deleted.',
                409,
                [
                    'usage_references' => $references,
                    'hint' => 'Pass ?force=true query parameter to unlink and delete if necessary.',
                ],
                'MEDIA_IN_USE'
            );
        }

        // Remove file from disk
        $diskPath = dirname(__DIR__) . '/' . ltrim($media['file_path'], '/\\');
        if (file_exists($diskPath) && is_file($diskPath)) {
            @unlink($diskPath);
        }

        // Delete from database
        Media::delete($mediaId);

        $userId = Request::getUserId();

        // Record audit log
        AuditService::log(
            $userId,
            'media_delete',
            'media',
            $mediaId,
            [
                'filename' => $media['filename'],
                'original_name' => $media['original_name'],
            ],
            null
        );

        $this->success(null, 'Media asset successfully deleted');
    }
}
