<?php

namespace App\Services;

use App\Utils\Database;
use App\Utils\Request;
use Throwable;

class AuditService
{
    /**
     * Log an administrative, security, or domain action into audit_logs.
     *
     * Supports both signatures:
     * - log(?int $userId, string $action, string $entityType, ?int $entityId, ?array $oldValues, ?array $newValues)
     * - log(string $action, string $entityType, ?int $entityId, ?array $oldValues, ?array $newValues)
     */
    public static function log(
        $userId,
        string $action = '',
        string $entityType = '',
        ?int $entityId = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): bool {
        try {
            if (is_string($userId)) {
                // Shift arguments when userId was omitted
                $newValues = $oldValues;
                $oldValues = is_array($entityId) ? $entityId : null;
                $entityId = is_numeric($entityType) ? (int) $entityType : null;
                $entityType = $action ?: 'system';
                $action = $userId;
                $userId = Request::getUserId();
            } else {
                $userId = $userId ? (int) $userId : Request::getUserId();
            }
            $pdo = Database::getConnection();

            $ip = $ipAddress ?? Request::getClientIp();
            $agent = $userAgent ?? (string) Request::getHeader('User-Agent', '');
            if (strlen($agent) > 255) {
                $agent = substr($agent, 0, 255);
            }

            $oldJson = $oldValues !== null ? json_encode($oldValues, JSON_UNESCAPED_UNICODE) : null;
            $newJson = $newValues !== null ? json_encode($newValues, JSON_UNESCAPED_UNICODE) : null;

            $stmt = $pdo->prepare(
                'INSERT INTO `audit_logs` (`user_id`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`, `user_agent`, `created_at`)
                 VALUES (:user_id, :action, :entity_type, :entity_id, :old_values, :new_values, :ip_address, :user_agent, NOW())'
            );

            return $stmt->execute([
                ':user_id' => $userId,
                ':action' => $action,
                ':entity_type' => $entityType,
                ':entity_id' => $entityId,
                ':old_values' => $oldJson,
                ':new_values' => $newJson,
                ':ip_address' => $ip,
                ':user_agent' => $agent,
            ]);
        } catch (Throwable $e) {
            error_log('[Wanderer Audit Log Error] ' . $e->getMessage());
            return false;
        }
    }
}
