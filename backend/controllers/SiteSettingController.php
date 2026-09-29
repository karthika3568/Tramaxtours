<?php

namespace App\Controllers;

use App\Models\SiteSetting;
use App\Services\AuditService;
use App\Utils\Request;

class SiteSettingController extends BaseController
{
    /**
     * List all active site settings with optional search, group filtering, or grouped view.
     * GET /api/v1/site-settings
     * Permission: settings.view
     *
     * @return void
     */
    public function index(): void
    {
        $queryParams = Request::getQueryParams();

        // If client specifically requests formatted key-value map grouped by category
        if (isset($queryParams['grouped']) && in_array(strtolower((string) $queryParams['grouped']), ['true', '1'], true)) {
            $grouped = SiteSetting::getAllGrouped();
            $this->success($grouped, 'Grouped site settings retrieved successfully');
        }

        $page = max(1, (int) ($queryParams['page'] ?? 1));
        $limit = max(1, min(200, (int) ($queryParams['limit'] ?? 100)));

        $filters = [
            'group' => trim((string) ($queryParams['group'] ?? '')),
            'search' => trim((string) ($queryParams['search'] ?? '')),
            'sort_by' => trim((string) ($queryParams['sort_by'] ?? 'id')),
            'sort_order' => trim((string) ($queryParams['sort_order'] ?? 'ASC')),
            'page' => $page,
            'limit' => $limit,
        ];

        $settings = SiteSetting::list($filters);
        $total = SiteSetting::count($filters);
        $totalPages = (int) ceil($total / $limit);

        $this->success(
            $settings,
            'Site settings retrieved successfully',
            200,
            [
                'pagination' => [
                    'total' => $total,
                    'page' => $page,
                    'limit' => $limit,
                    'total_pages' => $totalPages,
                ]
            ]
        );
    }

    /**
     * Retrieve a single site setting by numeric ID or setting_key.
     * GET /api/v1/site-settings/{id}
     * Permission: settings.view
     *
     * @param string $id
     * @return void
     */
    public function show(string $id): void
    {
        $setting = null;
        if (is_numeric($id)) {
            $setting = SiteSetting::findById((int) $id);
        } else {
            $setting = SiteSetting::findByKey($id);
        }

        if (!$setting) {
            $this->error('Site setting not found or has been deactivated.', 404, null, 'SETTING_NOT_FOUND');
        }

        $this->success($setting, 'Site setting retrieved successfully');
    }

    /**
     * Retrieve all settings for a specific group.
     * GET /api/v1/site-settings/group/{group}
     * Permission: settings.view
     *
     * @param string $group
     * @return void
     */
    public function getByGroup(string $group): void
    {
        $normalizedGroup = strtolower(trim($group));
        if (!in_array($normalizedGroup, SiteSetting::ALLOWED_GROUPS, true)) {
            $this->error(
                'Invalid setting group. Allowed groups: ' . implode(', ', SiteSetting::ALLOWED_GROUPS) . '.',
                422,
                ['group' => 'Invalid setting group provided.'],
                'INVALID_SETTING_GROUP'
            );
        }

        $settings = SiteSetting::getByGroup($normalizedGroup);
        $this->success($settings, "Settings for group '{$normalizedGroup}' retrieved successfully");
    }

    /**
     * Create a new site setting.
     * POST /api/v1/site-settings
     * Permission: settings.manage
     *
     * @return void
     */
    public function store(): void
    {
        $data = Request::getBody();
        $errors = [];

        // 1. Setting Key
        $key = trim((string) ($data['setting_key'] ?? ''));
        if (empty($key)) {
            $errors['setting_key'] = 'Setting key is required.';
        } elseif (mb_strlen($key) > 100) {
            $errors['setting_key'] = 'Setting key cannot exceed 100 characters.';
        } elseif (!preg_match('/^[a-z0-9_.-]+$/i', $key)) {
            $errors['setting_key'] = 'Setting key must contain only alphanumeric characters, underscores, hyphens, and dots.';
        } elseif (SiteSetting::isKeyTaken($key)) {
            $errors['setting_key'] = "The setting key '{$key}' is already in use.";
        }

        // 2. Setting Group
        $group = strtolower(trim((string) ($data['setting_group'] ?? 'general')));
        if (!in_array($group, SiteSetting::ALLOWED_GROUPS, true)) {
            $errors['setting_group'] = 'Invalid setting group. Allowed groups: ' . implode(', ', SiteSetting::ALLOWED_GROUPS) . '.';
        }

        // 3. Setting Value
        $value = isset($data['setting_value']) ? (string) $data['setting_value'] : null;

        if (!empty($errors)) {
            $this->error('Site setting validation failed.', 422, $errors, 'VALIDATION_ERROR');
        }

        try {
            $settingData = [
                'setting_key' => $key,
                'setting_value' => $value,
                'setting_group' => $group,
            ];

            $settingId = SiteSetting::create($settingData);
            $newSetting = SiteSetting::findById($settingId);

            $userId = Request::getUserId();

            // Record audit log
            AuditService::log(
                $userId,
                'site_setting_create',
                'site_setting',
                $settingId,
                null,
                [
                    'setting_key' => $key,
                    'setting_group' => $group,
                    'setting_value' => $value,
                ]
            );

            $this->success($newSetting, 'Site setting created successfully', 201);
        } catch (\Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'SETTING_CREATE_FAILED');
        }
    }

    /**
     * Update an existing site setting.
     * PUT /api/v1/site-settings/{id} or PATCH /api/v1/site-settings/{id}
     * Permission: settings.manage
     *
     * @param string $id
     * @return void
     */
    public function update(string $id): void
    {
        $setting = null;
        if (is_numeric($id)) {
            $setting = SiteSetting::findById((int) $id);
        } else {
            $setting = SiteSetting::findByKey($id);
        }

        $data = Request::getBody();

        if (!$setting) {
            if (!is_numeric($id)) {
                $settingGroup = strtolower(trim((string) ($data['setting_group'] ?? 'homepage')));
                if (!in_array($settingGroup, SiteSetting::ALLOWED_GROUPS, true)) {
                    $settingGroup = 'homepage';
                }
                $settingId = SiteSetting::create([
                    'setting_key' => $id,
                    'setting_value' => isset($data['setting_value']) ? (string) $data['setting_value'] : null,
                    'setting_group' => $settingGroup,
                ]);
                $created = SiteSetting::findById($settingId);
                $this->success($created, 'Site setting saved successfully', 200);
                return;
            }
            $this->error('Site setting not found.', 404, null, 'SETTING_NOT_FOUND');
        }

        $settingId = (int) $setting['id'];
        $errors = [];
        $updatePayload = [];

        // Setting Key
        if (array_key_exists('setting_key', $data)) {
            $key = trim((string) $data['setting_key']);
            if (empty($key)) {
                $errors['setting_key'] = 'Setting key cannot be empty.';
            } elseif (mb_strlen($key) > 100) {
                $errors['setting_key'] = 'Setting key cannot exceed 100 characters.';
            } elseif (!preg_match('/^[a-z0-9_.-]+$/i', $key)) {
                $errors['setting_key'] = 'Setting key must contain only alphanumeric characters, underscores, hyphens, and dots.';
            } elseif (SiteSetting::isKeyTaken($key, $settingId)) {
                $errors['setting_key'] = "The setting key '{$key}' is already in use by another setting.";
            } else {
                $updatePayload['setting_key'] = $key;
            }
        }

        // Setting Group
        if (array_key_exists('setting_group', $data)) {
            $group = strtolower(trim((string) $data['setting_group']));
            if (!in_array($group, SiteSetting::ALLOWED_GROUPS, true)) {
                $errors['setting_group'] = 'Invalid setting group. Allowed groups: ' . implode(', ', SiteSetting::ALLOWED_GROUPS) . '.';
            } else {
                $updatePayload['setting_group'] = $group;
            }
        }

        // Setting Value
        if (array_key_exists('setting_value', $data)) {
            $updatePayload['setting_value'] = $data['setting_value'] !== null ? (string) $data['setting_value'] : null;
        }

        if (!empty($errors)) {
            $this->error('Site setting update validation failed.', 422, $errors, 'VALIDATION_ERROR');
        }

        if (empty($updatePayload)) {
            $this->success($setting, 'No changes submitted for site setting update.');
        }

        try {
            SiteSetting::update($settingId, $updatePayload);
            $updated = SiteSetting::findById($settingId);

            $userId = Request::getUserId();

            // Record audit log
            AuditService::log(
                $userId,
                'site_setting_update',
                'site_setting',
                $settingId,
                [
                    'setting_key' => $setting['setting_key'],
                    'setting_group' => $setting['setting_group'],
                    'setting_value' => $setting['setting_value'],
                ],
                $updatePayload
            );

            $this->success($updated, 'Site setting updated successfully');
        } catch (\Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'SETTING_UPDATE_FAILED');
        }
    }

    /**
     * Reversible soft-delete for a site setting.
     * DELETE /api/v1/site-settings/{id}
     * Permission: settings.manage
     *
     * @param string $id
     * @return void
     */
    public function destroy(string $id): void
    {
        $setting = null;
        if (is_numeric($id)) {
            $setting = SiteSetting::findById((int) $id);
        } else {
            $setting = SiteSetting::findByKey($id);
        }

        if (!$setting) {
            $this->error('Site setting not found.', 404, null, 'SETTING_NOT_FOUND');
        }

        $settingId = (int) $setting['id'];

        // Protect system-critical settings from deletion
        if ($setting['is_system_critical']) {
            $this->error(
                "System-critical setting '{$setting['setting_key']}' cannot be deleted as it is required for application stability.",
                409,
                ['setting_key' => $setting['setting_key']],
                'CANNOT_DELETE_SYSTEM_CRITICAL_SETTING'
            );
        }

        $queryParams = Request::getQueryParams();
        $isForce = isset($queryParams['force']) && in_array(strtolower((string) $queryParams['force']), ['true', '1'], true);

        $userId = Request::getUserId();

        SiteSetting::softDelete($settingId, $userId, $isForce);

        // Record audit log
        AuditService::log(
            $userId,
            $isForce ? 'site_setting_delete' : 'site_setting_soft_delete',
            'site_setting',
            $settingId,
            [
                'setting_key' => $setting['setting_key'],
                'setting_group' => $setting['setting_group'],
                'is_force' => $isForce,
            ],
            $isForce ? null : ['deleted_at' => date('Y-m-d H:i:s'), 'deleted_by' => $userId]
        );

        $this->success([
            'id' => $settingId,
            'setting_key' => $setting['setting_key'],
            'is_deleted' => true,
            'deleted_at' => date('Y-m-d H:i:s'),
            'deleted_by' => $userId,
        ], $isForce ? 'Site setting permanently deleted' : 'Site setting soft-deleted successfully');
    }

    /**
     * Restore a soft-deleted site setting.
     * POST /api/v1/site-settings/{id}/restore or PATCH /api/v1/site-settings/{id}/restore
     * Permission: settings.manage
     *
     * @param string $id
     * @return void
     */
    public function restore(string $id): void
    {
        $setting = null;
        if (is_numeric($id)) {
            $setting = SiteSetting::findById((int) $id, true);
        } else {
            $setting = SiteSetting::findByKey($id, true);
        }

        if (!$setting) {
            $this->error('Site setting not found.', 404, null, 'SETTING_NOT_FOUND');
        }

        $settingId = (int) $setting['id'];

        if (empty($setting['deleted_at'])) {
            $this->success($setting, 'Site setting is already active');
        }

        try {
            SiteSetting::restore($settingId);
            $restored = SiteSetting::findById($settingId);
            if (!$restored) {
                $restored = SiteSetting::findById($settingId, true) ?? [];
            }

            $userId = Request::getUserId();

            // Record audit log
            AuditService::log(
                $userId,
                'site_setting_restore',
                'site_setting',
                $settingId,
                [
                    'deleted_at' => $setting['deleted_at'],
                    'deleted_by' => $setting['deleted_by'] ?? null,
                ],
                [
                    'setting_key' => $restored['setting_key'] ?? '',
                    'setting_group' => $restored['setting_group'] ?? '',
                    'deleted_at' => null,
                    'deleted_by' => null,
                ]
            );

            $this->success($restored, 'Site setting restored successfully');
        } catch (\Throwable $e) {
            $this->error($e->getMessage(), 500, null, 'SETTING_RESTORE_FAILED');
        }
    }
}
