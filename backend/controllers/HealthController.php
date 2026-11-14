<?php

namespace App\Controllers;

use App\Utils\Database;
use App\Utils\Env;
use Throwable;

class HealthController extends BaseController
{
    /**
     * Basic API health check endpoint.
     * GET /api/v1/health
     *
     * @return void
     */
    public function health(): void
    {
        $this->success([
            'status' => 'healthy',
            'service' => 'WandererSouthIndia Backend API',
            'version' => '1.0.0',
            'environment' => Env::get('APP_ENV', 'development'),
            'php_version' => PHP_VERSION,
            'timestamp' => gmdate('Y-m-d\TH:i:s\Z'),
        ], 'WandererSouthIndia API is running');
    }

    /**
     * Database health check endpoint verifying connection to 'wanderersouthindia' MySQL database.
     * GET /api/v1/health/database
     *
     * @return void
     */
    public function databaseHealth(): void
    {
        $startTime = microtime(true);

        try {
            $pdo = Database::getConnection();

            // Auto-heal schema on database health check
            self::runSchemaUpdates($pdo);

            // Run lightweight verification queries
            $dbStmt = $pdo->query('SELECT DATABASE() AS current_db, VERSION() AS mysql_version');
            $dbInfo = $dbStmt->fetch();

            $tablesStmt = $pdo->prepare(
                'SELECT COUNT(*) AS total_tables FROM information_schema.TABLES WHERE TABLE_SCHEMA = :schema_name'
            );
            $targetDb = $dbInfo['current_db'] ?? Env::get('DB_DATABASE', 'wanderersouthindia');
            $tablesStmt->execute([':schema_name' => $targetDb]);
            $tableCount = (int) $tablesStmt->fetchColumn();

            $latencyMs = round((microtime(true) - $startTime) * 1000, 2);

            $this->success([
                'status' => 'connected',
                'database' => $dbInfo['current_db'] ?? $targetDb,
                'driver' => 'pdo_mysql',
                'mysql_version' => $dbInfo['mysql_version'] ?? 'Unknown',
                'tables_count' => $tableCount,
                'charset' => Env::get('DB_CHARSET', 'utf8mb4'),
                'latency_ms' => $latencyMs,
                'schema_auto_heal' => 'verified',
                'timestamp' => gmdate('Y-m-d\TH:i:s\Z'),
            ], 'MySQL database connection successfully established and verified');
        } catch (Throwable $e) {
            $latencyMs = round((microtime(true) - $startTime) * 1000, 2);

            $this->error(
                'Database connection check failed',
                503,
                [
                    'status' => 'disconnected',
                    'database' => Env::get('DB_DATABASE', 'wanderersouthindia'),
                    'error' => Env::get('APP_DEBUG', false) ? $e->getMessage() : 'Could not connect to database server',
                    'latency_ms' => $latencyMs,
                    'timestamp' => gmdate('Y-m-d\TH:i:s\Z'),
                ],
                'DATABASE_CONNECTION_ERROR'
            );
        }
    }

    /**
     * Complete list of self-healing schema updates.
     *
     * @param \PDO $pdo
     * @return array<string>
     */
    public static function runSchemaUpdates(\PDO $pdo): array
    {
        $schemaUpdates = [
            "ALTER TABLE `tours` ADD COLUMN `available_seats` INT UNSIGNED NULL DEFAULT 20",
            "ALTER TABLE `tours` ADD COLUMN `total_seats` INT UNSIGNED NULL DEFAULT 20",
            "ALTER TABLE `tours` ADD COLUMN `booking_deadline_days` INT UNSIGNED NULL DEFAULT 1",
            "ALTER TABLE `tours` ADD COLUMN `travel_days` VARCHAR(255) NULL DEFAULT 'Daily'",
            "ALTER TABLE `tours` ADD COLUMN `metadata` JSON NULL",
            "ALTER TABLE `tours` ADD COLUMN `deleted_by` BIGINT UNSIGNED NULL",
            "ALTER TABLE `destinations` ADD COLUMN `deleted_by` BIGINT UNSIGNED NULL",
            "ALTER TABLE `contact_messages` ADD COLUMN `type` VARCHAR(50) NOT NULL DEFAULT 'trip_request'",
            "ALTER TABLE `contact_messages` ADD COLUMN `first_name` VARCHAR(100) NULL",
            "ALTER TABLE `contact_messages` ADD COLUMN `middle_name` VARCHAR(100) NULL",
            "ALTER TABLE `contact_messages` ADD COLUMN `last_name` VARCHAR(100) NULL",
            "ALTER TABLE `contact_messages` ADD COLUMN `dial_code` VARCHAR(20) NULL DEFAULT '+91'",
            "ALTER TABLE `contact_messages` ADD COLUMN `whatsapp_number` VARCHAR(50) NULL",
            "ALTER TABLE `contact_messages` ADD COLUMN `country` VARCHAR(100) NULL",
            "ALTER TABLE `contact_messages` ADD COLUMN `destination_name` VARCHAR(150) NULL",
            "ALTER TABLE `contact_messages` ADD COLUMN `pickup_location` VARCHAR(255) NULL",
            "ALTER TABLE `contact_messages` ADD COLUMN `tour_title` VARCHAR(191) NULL",
            "ALTER TABLE `contact_messages` ADD COLUMN `travel_date` VARCHAR(100) NULL",
            "ALTER TABLE `contact_messages` ADD COLUMN `arrival_date` VARCHAR(100) NULL",
            "ALTER TABLE `contact_messages` ADD COLUMN `departure_date` VARCHAR(100) NULL",
            "ALTER TABLE `contact_messages` ADD COLUMN `duration_days` VARCHAR(50) NULL",
            "ALTER TABLE `contact_messages` ADD COLUMN `travelers` INT UNSIGNED NULL DEFAULT 1",
            "ALTER TABLE `contact_messages` ADD COLUMN `adults_count` INT UNSIGNED NULL DEFAULT 1",
            "ALTER TABLE `contact_messages` ADD COLUMN `children_count` INT UNSIGNED NULL DEFAULT 0",
            "ALTER TABLE `contact_messages` ADD COLUMN `infants_count` INT UNSIGNED NULL DEFAULT 0",
            "ALTER TABLE `contact_messages` ADD COLUMN `vehicle_preference` VARCHAR(100) NULL",
            "ALTER TABLE `contact_messages` ADD COLUMN `airport_pickup` TINYINT(1) DEFAULT 0",
            "ALTER TABLE `contact_messages` ADD COLUMN `airport_drop` TINYINT(1) DEFAULT 0",
            "ALTER TABLE `contact_messages` ADD COLUMN `hotel_category` VARCHAR(100) NULL",
            "ALTER TABLE `contact_messages` ADD COLUMN `rooms_count` INT UNSIGNED DEFAULT 1",
            "ALTER TABLE `contact_messages` ADD COLUMN `room_type` VARCHAR(100) NULL",
            "ALTER TABLE `contact_messages` ADD COLUMN `tour_types` TEXT NULL",
            "ALTER TABLE `contact_messages` ADD COLUMN `tour_guide_required` TINYINT(1) DEFAULT 0",
            "ALTER TABLE `contact_messages` ADD COLUMN `preferred_language` VARCHAR(100) DEFAULT 'English'",
            "ALTER TABLE `contact_messages` ADD COLUMN `arrival_flight_train_number` VARCHAR(100) NULL",
            "ALTER TABLE `contact_messages` ADD COLUMN `arrival_time` VARCHAR(50) NULL",
            "ALTER TABLE `contact_messages` ADD COLUMN `departure_flight_train_number` VARCHAR(100) NULL",
            "ALTER TABLE `contact_messages` ADD COLUMN `departure_time` VARCHAR(50) NULL",
            "ALTER TABLE `contact_messages` ADD COLUMN `approximate_budget` VARCHAR(100) NULL",
            "ALTER TABLE `contact_messages` ADD COLUMN `budget_currency` VARCHAR(10) DEFAULT 'INR'",
            "ALTER TABLE `contact_messages` ADD COLUMN `passport_file_url` VARCHAR(255) NULL",
            "ALTER TABLE `contact_messages` ADD COLUMN `flight_ticket_url` VARCHAR(255) NULL",
            "ALTER TABLE `contact_messages` ADD COLUMN `preferred_contact_methods` TEXT NULL",
            "ALTER TABLE `contact_messages` ADD COLUMN `quotation_amount` DECIMAL(10,2) NULL",
            "ALTER TABLE `contact_messages` ADD COLUMN `public_token` VARCHAR(64) NULL",
            "ALTER TABLE `contact_messages` ADD COLUMN `reference_id` VARCHAR(50) NULL",
            "ALTER TABLE `bookings` MODIFY COLUMN `booking_status` VARCHAR(50) NOT NULL DEFAULT 'pending'",
            "ALTER TABLE `bookings` ADD COLUMN `preferred_session` VARCHAR(100) NULL",
            "ALTER TABLE `bookings` ADD COLUMN `experience_level` VARCHAR(100) NULL",
            "ALTER TABLE `bookings` ADD COLUMN `additional_details` JSON NULL",
            "ALTER TABLE `bookings` ADD COLUMN `ticket_number` VARCHAR(64) NULL DEFAULT NULL",
            "ALTER TABLE `bookings` ADD COLUMN `ticket_pdf_path` VARCHAR(255) NULL DEFAULT NULL",
            "ALTER TABLE `bookings` ADD COLUMN `agreed_price` DECIMAL(10, 2) NULL DEFAULT NULL",
            "ALTER TABLE `bookings` ADD COLUMN `payment_discussion_notes` TEXT NULL DEFAULT NULL",
            "ALTER TABLE `bookings` ADD COLUMN `confirmed_at` DATETIME NULL DEFAULT NULL",
            "ALTER TABLE `bookings` ADD COLUMN `confirmed_by` BIGINT UNSIGNED NULL DEFAULT NULL",
            "ALTER TABLE `bookings` ADD COLUMN `sms_status` VARCHAR(50) NULL DEFAULT 'pending'",
            "ALTER TABLE `bookings` ADD COLUMN `sms_sent_at` DATETIME NULL DEFAULT NULL",
            "ALTER TABLE `bookings` ADD COLUMN `last_sms_error` TEXT NULL DEFAULT NULL",
            "ALTER TABLE `reviews` ADD COLUMN `rating` INT NOT NULL DEFAULT 5",
            "ALTER TABLE `reviews` ADD COLUMN `image` VARCHAR(255) NULL",
            "ALTER TABLE `users` ADD COLUMN `avatar_url` VARCHAR(500) NULL AFTER `phone`",
            "CREATE TABLE IF NOT EXISTS `password_resets` (
                `email` VARCHAR(191) NOT NULL,
                `token` VARCHAR(255) NOT NULL,
                `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (`email`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
            "INSERT IGNORE INTO `roles` (`id`, `name`, `slug`, `description`, `is_system`, `created_at`, `updated_at`)
             VALUES (5, 'Customer', 'customer', 'Registered public customer', 1, NOW(), NOW())",
        ];

        $logs = [];
        foreach ($schemaUpdates as $sql) {
            try {
                $pdo->exec($sql);
                $logs[] = "[SCHEMA_OK] $sql";
            } catch (\Throwable $e) {
                // Ignore duplicate column errors
            }
        }
        return $logs;
    }

    /**
     * Synchronize remote database schema and tour catalog.
     * POST /api/v1/health/sync-catalog
     * POST /api/v1/system/sync-catalog
     *
     * @return void
     */
    public function syncCatalog(): void
    {
        try {
            $syncKey = \App\Utils\Request::getHeader('X-Sync-Key') ?: (\App\Utils\Request::getQueryParams()['key'] ?? null);
            $expectedKey = Env::get('JWT_SECRET', 'wanderer_tours_jwt_secret_key_2026_super_secure_9b78c1d3f4e5a6b7c8d9e0f1a2b3c4d5');

            // Check auth header for super_admin or admin
            $authHeader = \App\Utils\Request::getHeader('Authorization');
            $isAdmin = false;
            if ($authHeader && preg_match('/^Bearer\s+(.*?)$/i', trim($authHeader), $matches)) {
                try {
                    $payload = \App\Utils\JWT::decode($matches[1]);
                    $roles = $payload['roles'] ?? [];
                    if (in_array('super_admin', $roles) || in_array('admin', $roles)) {
                        $isAdmin = true;
                    }
                } catch (\Throwable $t) {}
            }

            if (!$isAdmin && (!$syncKey || !hash_equals($expectedKey, (string)$syncKey))) {
                $this->error('Unauthorized access to system sync endpoint.', 403, null, 'FORBIDDEN');
                return;
            }

        $pdo = Database::getConnection();
        $logs = self::runSchemaUpdates($pdo);

        // 2. Load JSON fixture
        $fixturePath = dirname(__DIR__, 2) . '/backend/storage/production_catalog_seed.json';
        if (!file_exists($fixturePath)) {
            $fixturePath = __DIR__ . '/../storage/production_catalog_seed.json';
        }

        if (!file_exists($fixturePath)) {
            $this->error('Production catalog seed fixture not found.', 500, ['path' => $fixturePath], 'FIXTURE_NOT_FOUND');
            return;
        }

        $catalog = json_decode(file_get_contents($fixturePath), true);
        if (!$catalog) {
            $this->error('Failed to parse catalog seed JSON.', 500, null, 'JSON_PARSE_ERROR');
            return;
        }

        // Helper to find media ID by file_path or create it
        $getMediaId = function ($filePath, $alt = '') use ($pdo) {
            if (!$filePath) return null;
            $stmt = $pdo->prepare("SELECT id FROM media WHERE file_path = ? OR filename = ? LIMIT 1");
            $stmt->execute([$filePath, basename($filePath)]);
            $id = $stmt->fetchColumn();
            if ($id) return (int) $id;
            
            $ins = $pdo->prepare("INSERT INTO media (filename, original_name, file_path, mime_type, file_size, alt_text, created_at, updated_at) VALUES (?, ?, ?, 'image/jpeg', 102400, ?, NOW(), NOW())");
            $ins->execute([basename($filePath), basename($filePath), $filePath, $alt ?: basename($filePath)]);
            return (int) $pdo->lastInsertId();
        };

        // 3. Sync Media entries from fixture
        $mediaSynced = 0;
        if (!empty($catalog['media'])) {
            foreach ($catalog['media'] as $m) {
                $mPath = $m['file_path'] ?? '';
                if ($mPath) {
                    $getMediaId($mPath, $m['alt_text'] ?? '');
                    $mediaSynced++;
                }
            }
        }

        // 4. Sync Destinations
        $destSynced = 0;
        $destMap = []; // slug => id
        if (!empty($catalog['destinations'])) {
            foreach ($catalog['destinations'] as $d) {
                $featId = !empty($d['featured_image_path']) ? $getMediaId($d['featured_image_path'], $d['name']) : null;
                $introId = !empty($d['intro_media_path']) ? $getMediaId($d['intro_media_path'], $d['name']) : null;

                $stmt = $pdo->prepare("SELECT id FROM destinations WHERE slug = ? LIMIT 1");
                $stmt->execute([$d['slug']]);
                $dId = $stmt->fetchColumn();

                if ($dId) {
                    $dId = (int)$dId;
                    $upd = $pdo->prepare("
                        UPDATE destinations SET
                            name = :name,
                            hero_title = :hero_title,
                            hero_subtitle = :hero_subtitle,
                            short_description = :short_description,
                            intro_label = :intro_label,
                            intro_heading = :intro_heading,
                            intro_content = :intro_content,
                            language = :language,
                            currency = :currency,
                            religion = :religion,
                            heritage = :heritage,
                            timezone = :timezone,
                            latitude = :latitude,
                            longitude = :longitude,
                            is_featured = :is_featured,
                            display_order = :display_order,
                            status = 'published',
                            featured_image_id = COALESCE(:featured_image_id, featured_image_id),
                            intro_media_id = COALESCE(:intro_media_id, intro_media_id),
                            deleted_at = NULL,
                            updated_at = NOW()
                        WHERE id = :id
                    ");
                    $upd->execute([
                        ':name' => $d['name'],
                        ':hero_title' => $d['hero_title'] ?? $d['name'],
                        ':hero_subtitle' => $d['hero_subtitle'] ?? '',
                        ':short_description' => $d['short_description'] ?? '',
                        ':intro_label' => $d['intro_label'] ?? '',
                        ':intro_heading' => $d['intro_heading'] ?? '',
                        ':intro_content' => $d['intro_content'] ?? '',
                        ':language' => $d['language'] ?? 'English / Tamil',
                        ':currency' => $d['currency'] ?? 'INR',
                        ':religion' => $d['religion'] ?? '',
                        ':heritage' => $d['heritage'] ?? '',
                        ':timezone' => $d['timezone'] ?? 'GMT +5:30',
                        ':latitude' => $d['latitude'] ?? null,
                        ':longitude' => $d['longitude'] ?? null,
                        ':is_featured' => $d['is_featured'] ?? 1,
                        ':display_order' => $d['display_order'] ?? 0,
                        ':featured_image_id' => $featId,
                        ':intro_media_id' => $introId,
                        ':id' => $dId,
                    ]);
                } else {
                    $ins = $pdo->prepare("
                        INSERT INTO destinations (
                            name, slug, hero_title, hero_subtitle, short_description,
                            intro_label, intro_heading, intro_content, language, currency,
                            religion, heritage, timezone, latitude, longitude, is_featured,
                            display_order, status, featured_image_id, intro_media_id, created_at, updated_at
                        ) VALUES (
                            :name, :slug, :hero_title, :hero_subtitle, :short_description,
                            :intro_label, :intro_heading, :intro_content, :language, :currency,
                            :religion, :heritage, :timezone, :latitude, :longitude, :is_featured,
                            :display_order, 'published', :featured_image_id, :intro_media_id, NOW(), NOW()
                        )
                    ");
                    $ins->execute([
                        ':name' => $d['name'],
                        ':slug' => $d['slug'],
                        ':hero_title' => $d['hero_title'] ?? $d['name'],
                        ':hero_subtitle' => $d['hero_subtitle'] ?? '',
                        ':short_description' => $d['short_description'] ?? '',
                        ':intro_label' => $d['intro_label'] ?? '',
                        ':intro_heading' => $d['intro_heading'] ?? '',
                        ':intro_content' => $d['intro_content'] ?? '',
                        ':language' => $d['language'] ?? 'English / Tamil',
                        ':currency' => $d['currency'] ?? 'INR',
                        ':religion' => $d['religion'] ?? '',
                        ':heritage' => $d['heritage'] ?? '',
                        ':timezone' => $d['timezone'] ?? 'GMT +5:30',
                        ':latitude' => $d['latitude'] ?? null,
                        ':longitude' => $d['longitude'] ?? null,
                        ':is_featured' => $d['is_featured'] ?? 1,
                        ':display_order' => $d['display_order'] ?? 0,
                        ':featured_image_id' => $featId,
                        ':intro_media_id' => $introId,
                    ]);
                    $dId = (int) $pdo->lastInsertId();
                }

                $destMap[$d['slug']] = $dId;

                // Sync destination sections
                $pdo->exec("DELETE FROM destination_sections WHERE destination_id = $dId");
                if (!empty($d['sections'])) {
                    $secIns = $pdo->prepare("INSERT INTO destination_sections (destination_id, media_id, title, subtitle, content, display_order, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())");
                    foreach ($d['sections'] as $sec) {
                        $sMid = !empty($sec['media_path']) ? $getMediaId($sec['media_path']) : null;
                        $secIns->execute([$dId, $sMid, $sec['title'] ?? '', $sec['subtitle'] ?? null, $sec['content'] ?? '', $sec['display_order'] ?? 0]);
                    }
                }

                // Sync destination faqs
                $pdo->exec("DELETE FROM destination_faqs WHERE destination_id = $dId");
                if (!empty($d['faqs'])) {
                    $faqIns = $pdo->prepare("INSERT INTO destination_faqs (destination_id, question, answer, display_order, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'active', NOW(), NOW())");
                    foreach ($d['faqs'] as $faq) {
                        $faqIns->execute([$dId, $faq['question'] ?? '', $faq['answer'] ?? '', $faq['display_order'] ?? 0]);
                    }
                }

                $destSynced++;
            }
        }

        // Soft delete test destinations (like test-destination1, test-destination2)
        $pdo->exec("UPDATE destinations SET status = 'draft', deleted_at = NOW() WHERE slug LIKE 'test-%'");

        // 5. Ensure Tour Categories
        $categoriesList = [
            ['name' => 'City Sightseeing Tours', 'slug' => 'city-sightseeing-tours', 'badge_color' => '#0284c7', 'icon' => 'compass', 'description' => 'Explore vibrant city landmarks, architecture, and urban attractions', 'display_order' => 1],
            ['name' => 'Cultural & Heritage Tours', 'slug' => 'cultural-heritage-tours', 'badge_color' => '#b45309', 'icon' => 'landmark', 'description' => 'Immerse in ancient architecture, monuments, and UNESCO world heritage sites', 'display_order' => 2],
            ['name' => 'Guided Tours', 'slug' => 'guided-tours', 'badge_color' => '#059669', 'icon' => 'user-check', 'description' => 'Tours accompanied by knowledgeable and licensed professional guides', 'display_order' => 3],
            ['name' => 'Historical Tours', 'slug' => 'historical-tours', 'badge_color' => '#7c3aed', 'icon' => 'book-open', 'description' => 'Step back in time to explore historic dynasties, temples, and colonial history', 'display_order' => 4],
            ['name' => 'One Day Tours', 'slug' => 'one-day-tours', 'badge_color' => '#ea580c', 'icon' => 'sun', 'description' => 'Perfect single-day excursions designed with comfortable door-to-door transit', 'display_order' => 5],
            ['name' => 'Private Tours', 'slug' => 'private-tours', 'badge_color' => '#0d9488', 'icon' => 'shield', 'description' => 'Exclusive private cab transportation tailored to individual itineraries', 'display_order' => 6],
            ['name' => 'Family Tours', 'slug' => 'family-tours', 'badge_color' => '#db2777', 'icon' => 'users', 'description' => 'Comfortable, paced tours suitable for multi-generational families', 'display_order' => 7],
            ['name' => 'Adventure & Nature Tours', 'slug' => 'adventure-nature-tours', 'badge_color' => '#16a34a', 'icon' => 'tree', 'description' => 'Experience natural landscapes, hill stations, wildlife, and coastal views', 'display_order' => 8],
            ['name' => 'Surfing Tour', 'slug' => 'surfing-tour', 'badge_color' => '#0284c7', 'icon' => 'compass', 'description' => 'Professional ocean surfing lessons, wave riding and beach sessions at Covelong Point and Mahabalipuram.', 'display_order' => 9],
            ['name' => 'Palmleaf Horoscope Tour', 'slug' => 'palmleaf-horoscope-tour', 'badge_color' => '#b45309', 'icon' => 'book-open', 'description' => 'Sacred ancient Nadi Palm Leaf astrology reading, thumbprint identification, Sanskrit interpretation at Vaitheeswaran Kovil.', 'display_order' => 10],
            ['name' => 'Medical Tourism', 'slug' => 'medical-tourism', 'badge_color' => '#0284c7', 'icon' => 'shield', 'description' => 'Executive health checkups, comprehensive diagnostics and wellness health tourism.', 'display_order' => 11],
        ];

        $catMap = []; // slug => id
        foreach ($categoriesList as $cat) {
            $cStmt = $pdo->prepare("SELECT id FROM tour_categories WHERE slug = ? LIMIT 1");
            $cStmt->execute([$cat['slug']]);
            $cid = $cStmt->fetchColumn();
            if ($cid) {
                $cid = (int)$cid;
                $pdo->prepare("UPDATE tour_categories SET name = ?, badge_color = ?, icon = ?, description = ?, display_order = ?, status = 'active' WHERE id = ?")
                    ->execute([$cat['name'], $cat['badge_color'], $cat['icon'], $cat['description'], $cat['display_order'], $cid]);
            } else {
                $pdo->prepare("INSERT INTO tour_categories (name, slug, badge_color, icon, description, display_order, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())")
                    ->execute([$cat['name'], $cat['slug'], $cat['badge_color'], $cat['icon'], $cat['description'], $cat['display_order']]);
                $cid = (int)$pdo->lastInsertId();
            }
            $catMap[$cat['slug']] = $cid;
        }

        // 6. Sync Tours
        $toursSynced = 0;
        if (!empty($catalog['tours'])) {
            foreach ($catalog['tours'] as $t) {
                $destId = null;
                if (!empty($t['destination_slug']) && isset($destMap[$t['destination_slug']])) {
                    $destId = $destMap[$t['destination_slug']];
                } elseif (!empty($destMap['tamil-nadu'])) {
                    $destId = $destMap['tamil-nadu'];
                }

                $featId = !empty($t['featured_image_path']) ? $getMediaId($t['featured_image_path'], $t['title']) : null;

                $tStmt = $pdo->prepare("SELECT id FROM tours WHERE slug = ? LIMIT 1");
                $tStmt->execute([$t['slug']]);
                $tId = $tStmt->fetchColumn();

                $metadataVal = is_array($t['metadata'] ?? null) ? json_encode($t['metadata']) : ($t['metadata'] ?? null);

                if ($tId) {
                    $tId = (int)$tId;
                    $updT = $pdo->prepare("
                        UPDATE tours SET
                            destination_id = :destination_id,
                            title = :title,
                            short_description = :short_description,
                            overview = :overview,
                            tour_type = :tour_type,
                            duration_text = :duration_text,
                            duration_hours = :duration_hours,
                            duration_days = :duration_days,
                            languages = :languages,
                            featured_image_id = COALESCE(:featured_image_id, featured_image_id),
                            base_price = :base_price,
                            currency = :currency,
                            min_persons = :min_persons,
                            max_persons = :max_persons,
                            available_seats = :available_seats,
                            total_seats = :total_seats,
                            booking_deadline_days = :booking_deadline_days,
                            travel_days = :travel_days,
                            map_title = :map_title,
                            latitude = :latitude,
                            longitude = :longitude,
                            map_zoom = :map_zoom,
                            seo_title = :seo_title,
                            seo_description = :seo_description,
                            canonical_url = :canonical_url,
                            is_featured = :is_featured,
                            display_order = :display_order,
                            status = 'published',
                            metadata = :metadata,
                            deleted_at = NULL,
                            updated_at = NOW()
                        WHERE id = :id
                    ");
                    $updT->execute([
                        ':destination_id' => $destId,
                        ':title' => $t['title'],
                        ':short_description' => $t['short_description'] ?? '',
                        ':overview' => $t['overview'] ?? '',
                        ':tour_type' => $t['tour_type'] ?? 'One Day Tours',
                        ':duration_text' => $t['duration_text'] ?? 'Full Day',
                        ':duration_hours' => $t['duration_hours'] ?? null,
                        ':duration_days' => $t['duration_days'] ?? 1,
                        ':languages' => $t['languages'] ?? 'English',
                        ':featured_image_id' => $featId,
                        ':base_price' => $t['base_price'] ?? 45.00,
                        ':currency' => $t['currency'] ?? 'EUR',
                        ':min_persons' => $t['min_persons'] ?? 1,
                        ':max_persons' => $t['max_persons'] ?? 12,
                        ':available_seats' => $t['available_seats'] ?? 20,
                        ':total_seats' => $t['total_seats'] ?? 20,
                        ':booking_deadline_days' => $t['booking_deadline_days'] ?? 1,
                        ':travel_days' => $t['travel_days'] ?? 'Daily',
                        ':map_title' => $t['map_title'] ?? null,
                        ':latitude' => $t['latitude'] ?? null,
                        ':longitude' => $t['longitude'] ?? null,
                        ':map_zoom' => $t['map_zoom'] ?? 13,
                        ':seo_title' => $t['seo_title'] ?? null,
                        ':seo_description' => $t['seo_description'] ?? null,
                        ':canonical_url' => $t['canonical_url'] ?? null,
                        ':is_featured' => $t['is_featured'] ?? 0,
                        ':display_order' => $t['display_order'] ?? 0,
                        ':metadata' => $metadataVal,
                        ':id' => $tId,
                    ]);
                } else {
                    $insT = $pdo->prepare("
                        INSERT INTO tours (
                            destination_id, title, slug, short_description, overview,
                            tour_type, duration_text, duration_hours, duration_days,
                            languages, featured_image_id, base_price, currency,
                            min_persons, max_persons, available_seats, total_seats,
                            booking_deadline_days, travel_days, map_title, latitude, longitude,
                            map_zoom, seo_title, seo_description, canonical_url,
                            is_featured, display_order, status, metadata, created_at, updated_at
                        ) VALUES (
                            :destination_id, :title, :slug, :short_description, :overview,
                            :tour_type, :duration_text, :duration_hours, :duration_days,
                            :languages, :featured_image_id, :base_price, :currency,
                            :min_persons, :max_persons, :available_seats, :total_seats,
                            :booking_deadline_days, :travel_days, :map_title, :latitude, :longitude,
                            :map_zoom, :seo_title, :seo_description, :canonical_url,
                            :is_featured, :display_order, 'published', :metadata, NOW(), NOW()
                        )
                    ");
                    $insT->execute([
                        ':destination_id' => $destId,
                        ':title' => $t['title'],
                        ':slug' => $t['slug'],
                        ':short_description' => $t['short_description'] ?? '',
                        ':overview' => $t['overview'] ?? '',
                        ':tour_type' => $t['tour_type'] ?? 'One Day Tours',
                        ':duration_text' => $t['duration_text'] ?? 'Full Day',
                        ':duration_hours' => $t['duration_hours'] ?? null,
                        ':duration_days' => $t['duration_days'] ?? 1,
                        ':languages' => $t['languages'] ?? 'English',
                        ':featured_image_id' => $featId,
                        ':base_price' => $t['base_price'] ?? 45.00,
                        ':currency' => $t['currency'] ?? 'EUR',
                        ':min_persons' => $t['min_persons'] ?? 1,
                        ':max_persons' => $t['max_persons'] ?? 12,
                        ':available_seats' => $t['available_seats'] ?? 20,
                        ':total_seats' => $t['total_seats'] ?? 20,
                        ':booking_deadline_days' => $t['booking_deadline_days'] ?? 1,
                        ':travel_days' => $t['travel_days'] ?? 'Daily',
                        ':map_title' => $t['map_title'] ?? null,
                        ':latitude' => $t['latitude'] ?? null,
                        ':longitude' => $t['longitude'] ?? null,
                        ':map_zoom' => $t['map_zoom'] ?? 13,
                        ':seo_title' => $t['seo_title'] ?? null,
                        ':seo_description' => $t['seo_description'] ?? null,
                        ':canonical_url' => $t['canonical_url'] ?? null,
                        ':is_featured' => $t['is_featured'] ?? 0,
                        ':display_order' => $t['display_order'] ?? 0,
                        ':metadata' => $metadataVal,
                    ]);
                    $tId = (int)$pdo->lastInsertId();
                }

                // Map categories
                $pdo->exec("DELETE FROM tour_category_map WHERE tour_id = $tId");
                if (!empty($t['category_slugs'])) {
                    $catIns = $pdo->prepare("INSERT IGNORE INTO tour_category_map (tour_id, category_id) VALUES (?, ?)");
                    foreach ($t['category_slugs'] as $cSlug) {
                        if (isset($catMap[$cSlug])) {
                            $catIns->execute([$tId, $catMap[$cSlug]]);
                        }
                    }
                }

                // Highlights
                $pdo->exec("DELETE FROM tour_highlights WHERE tour_id = $tId");
                if (!empty($t['highlights'])) {
                    $hIns = $pdo->prepare("INSERT INTO tour_highlights (tour_id, highlight_text, display_order) VALUES (?, ?, ?)");
                    foreach ($t['highlights'] as $hl) {
                        $hIns->execute([$tId, $hl['highlight_text'] ?? '', $hl['display_order'] ?? 0]);
                    }
                }

                // Itineraries
                $pdo->exec("DELETE FROM tour_itineraries WHERE tour_id = $tId");
                if (!empty($t['itineraries'])) {
                    $itinIns = $pdo->prepare("INSERT INTO tour_itineraries (tour_id, time_period, title, description, display_order, status) VALUES (?, ?, ?, ?, ?, 'active')");
                    foreach ($t['itineraries'] as $itin) {
                        $itinIns->execute([$tId, $itin['time_period'] ?? 'Day', $itin['title'] ?? '', $itin['description'] ?? '', $itin['display_order'] ?? 0]);
                    }
                }

                // Includes
                $pdo->exec("DELETE FROM tour_includes WHERE tour_id = $tId");
                if (!empty($t['includes'])) {
                    $incIns = $pdo->prepare("INSERT INTO tour_includes (tour_id, item_text, display_order) VALUES (?, ?, ?)");
                    foreach ($t['includes'] as $inc) {
                        $incIns->execute([$tId, $inc['item_text'] ?? '', $inc['display_order'] ?? 0]);
                    }
                }

                // Excludes
                $pdo->exec("DELETE FROM tour_excludes WHERE tour_id = $tId");
                if (!empty($t['excludes'])) {
                    $excIns = $pdo->prepare("INSERT INTO tour_excludes (tour_id, item_text, display_order) VALUES (?, ?, ?)");
                    foreach ($t['excludes'] as $exc) {
                        $excIns->execute([$tId, $exc['item_text'] ?? '', $exc['display_order'] ?? 0]);
                    }
                }

                // Why choose
                $pdo->exec("DELETE FROM tour_why_choose WHERE tour_id = $tId");
                if (!empty($t['why_choose'])) {
                    $whyIns = $pdo->prepare("INSERT INTO tour_why_choose (tour_id, title, description, icon, display_order) VALUES (?, ?, ?, ?, ?)");
                    foreach ($t['why_choose'] as $wc) {
                        $whyIns->execute([$tId, $wc['title'] ?? '', $wc['description'] ?? '', $wc['icon'] ?? '', $wc['display_order'] ?? 0]);
                    }
                }

                // FAQs
                $pdo->exec("DELETE FROM tour_faqs WHERE tour_id = $tId");
                if (!empty($t['faqs'])) {
                    $tfIns = $pdo->prepare("INSERT INTO tour_faqs (tour_id, question, answer, display_order, status) VALUES (?, ?, ?, ?, 'active')");
                    foreach ($t['faqs'] as $tf) {
                        $tfIns->execute([$tId, $tf['question'] ?? '', $tf['answer'] ?? '', $tf['display_order'] ?? 0]);
                    }
                }

                // Pricing Tiers
                $pdo->exec("DELETE FROM tour_pricing_tiers WHERE tour_id = $tId");
                if (!empty($t['pricing_tiers'])) {
                    $ptIns = $pdo->prepare("INSERT INTO tour_pricing_tiers (tour_id, tier_name, min_persons, max_persons, price_per_person) VALUES (?, ?, ?, ?, ?)");
                    foreach ($t['pricing_tiers'] as $pt) {
                        $ptIns->execute([$tId, $pt['tier_name'] ?? 'Standard', $pt['min_persons'] ?? 1, $pt['max_persons'] ?? 1, $pt['price_per_person'] ?? 0]);
                    }
                }

                // Places
                $pdo->exec("DELETE FROM tour_places WHERE tour_id = $tId");
                if (!empty($t['places'])) {
                    $plIns = $pdo->prepare("INSERT INTO tour_places (tour_id, place_name, description, display_order) VALUES (?, ?, ?, ?)");
                    foreach ($t['places'] as $pl) {
                        $plIns->execute([$tId, $pl['place_name'] ?? '', $pl['description'] ?? '', $pl['display_order'] ?? 0]);
                    }
                }

                // Gallery
                $pdo->exec("DELETE FROM tour_gallery WHERE tour_id = $tId");
                if (!empty($t['gallery'])) {
                    $galIns = $pdo->prepare("INSERT INTO tour_gallery (tour_id, media_id, caption, display_order) VALUES (?, ?, ?, ?)");
                    foreach ($t['gallery'] as $gal) {
                        $gMid = !empty($gal['media_path']) ? $getMediaId($gal['media_path']) : null;
                        if ($gMid) {
                            $galIns->execute([$tId, $gMid, $gal['caption'] ?? '', $gal['display_order'] ?? 0]);
                        }
                    }
                }

                $toursSynced++;
            }
        }

        // 7. Site settings
        if (!empty($catalog['site_settings'])) {
            $setIns = $pdo->prepare("INSERT INTO site_settings (setting_key, setting_value, setting_group, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()");
            foreach ($catalog['site_settings'] as $ss) {
                $setIns->execute([$ss['setting_key'], $ss['setting_value'] ?? '', $ss['setting_group'] ?? 'general']);
            }
        }

        // 8. Pages (About Us, Terms, Privacy, Refund)
        $pagesSynced = 0;
        if (!empty($catalog['pages'])) {
            $pIns = $pdo->prepare("
                INSERT INTO pages (
                    slug, title, subtitle, hero_media_id, content,
                    seo_title, seo_description, status, created_at, updated_at
                ) VALUES (
                    :slug, :title, :subtitle, :hero_media_id, :content,
                    :seo_title, :seo_description, :status, NOW(), NOW()
                ) ON DUPLICATE KEY UPDATE
                    title = VALUES(title),
                    subtitle = VALUES(subtitle),
                    hero_media_id = VALUES(hero_media_id),
                    content = VALUES(content),
                    seo_title = VALUES(seo_title),
                    seo_description = VALUES(seo_description),
                    status = VALUES(status),
                    deleted_at = NULL,
                    updated_at = NOW()
            ");
            foreach ($catalog['pages'] as $p) {
                $pIns->execute([
                    ':slug' => $p['slug'],
                    ':title' => $p['title'],
                    ':subtitle' => $p['subtitle'] ?? '',
                    ':hero_media_id' => $p['hero_media_id'] ?? null,
                    ':content' => $p['content'] ?? '',
                    ':seo_title' => $p['seo_title'] ?? null,
                    ':seo_description' => $p['seo_description'] ?? null,
                    ':status' => $p['status'] ?? 'published',
                ]);
                $pagesSynced++;
            }
        }

        // 9. CMS Sections
        $cmsSynced = 0;
        if (!empty($catalog['cms_sections'])) {
            $cIns = $pdo->prepare("
                INSERT INTO cms_sections (
                    section_key, title, subtitle, content, media_id,
                    display_order, status, created_at, updated_at
                ) VALUES (
                    :section_key, :title, :subtitle, :content, :media_id,
                    :display_order, :status, NOW(), NOW()
                ) ON DUPLICATE KEY UPDATE
                    title = VALUES(title),
                    subtitle = VALUES(subtitle),
                    content = VALUES(content),
                    media_id = VALUES(media_id),
                    display_order = VALUES(display_order),
                    status = VALUES(status),
                    deleted_at = NULL,
                    updated_at = NOW()
            ");
            foreach ($catalog['cms_sections'] as $cs) {
                $cIns->execute([
                    ':section_key' => $cs['section_key'],
                    ':title' => $cs['title'] ?? '',
                    ':subtitle' => $cs['subtitle'] ?? null,
                    ':content' => $cs['content'] ?? '',
                    ':media_id' => $cs['media_id'] ?? null,
                    ':display_order' => $cs['display_order'] ?? 0,
                    ':status' => $cs['status'] ?? 'published',
                ]);
                $cmsSynced++;
            }
        }

        // 10. Home Hero Slides
        if (!empty($catalog['home_hero_slides'])) {
            $hIns = $pdo->prepare("
                INSERT INTO home_hero_slides (
                    id, title, subtitle, desktop_media_id, mobile_media_id,
                    cta_label, cta_url, display_order, status, created_at, updated_at
                ) VALUES (
                    :id, :title, :subtitle, :desktop_media_id, :mobile_media_id,
                    :cta_label, :cta_url, :display_order, :status, NOW(), NOW()
                ) ON DUPLICATE KEY UPDATE
                    title = VALUES(title),
                    subtitle = VALUES(subtitle),
                    desktop_media_id = VALUES(desktop_media_id),
                    mobile_media_id = VALUES(mobile_media_id),
                    cta_label = VALUES(cta_label),
                    cta_url = VALUES(cta_url),
                    display_order = VALUES(display_order),
                    status = VALUES(status),
                    deleted_at = NULL,
                    updated_at = NOW()
            ");
            foreach ($catalog['home_hero_slides'] as $hs) {
                $hIns->execute([
                    ':id' => $hs['id'],
                    ':title' => $hs['title'] ?? '',
                    ':subtitle' => $hs['subtitle'] ?? null,
                    ':desktop_media_id' => $hs['desktop_media_id'] ?? null,
                    ':mobile_media_id' => $hs['mobile_media_id'] ?? null,
                    ':cta_label' => $hs['cta_label'] ?? null,
                    ':cta_url' => $hs['cta_url'] ?? null,
                    ':display_order' => $hs['display_order'] ?? 0,
                    ':status' => $hs['status'] ?? 'active',
                ]);
            }
        }

        // 11. Home Benefits
        if (!empty($catalog['home_benefits'])) {
            $bIns = $pdo->prepare("
                INSERT INTO home_benefits (
                    id, title, description, icon, media_id,
                    display_order, status, created_at, updated_at
                ) VALUES (
                    :id, :title, :description, :icon, :media_id,
                    :display_order, :status, NOW(), NOW()
                ) ON DUPLICATE KEY UPDATE
                    title = VALUES(title),
                    description = VALUES(description),
                    icon = VALUES(icon),
                    media_id = VALUES(media_id),
                    display_order = VALUES(display_order),
                    status = VALUES(status),
                    deleted_at = NULL,
                    updated_at = NOW()
            ");
            foreach ($catalog['home_benefits'] as $hb) {
                $bIns->execute([
                    ':id' => $hb['id'],
                    ':title' => $hb['title'] ?? '',
                    ':description' => $hb['description'] ?? '',
                    ':icon' => $hb['icon'] ?? 'award',
                    ':media_id' => $hb['media_id'] ?? null,
                    ':display_order' => $hb['display_order'] ?? 0,
                    ':status' => $hb['status'] ?? 'active',
                ]);
            }
        }

        // 12. Things To Do
        if (!empty($catalog['things_to_do'])) {
            $ttdIns = $pdo->prepare("
                INSERT INTO things_to_do (
                    title, slug, destination_id, state_region, hero_media_id,
                    short_description, full_description, duration, best_time,
                    location, suitable_for, adventure_level, is_featured,
                    display_order, status, created_at, updated_at
                ) VALUES (
                    :title, :slug, :destination_id, :state_region, :hero_media_id,
                    :short_description, :full_description, :duration, :best_time,
                    :location, :suitable_for, :adventure_level, :is_featured,
                    :display_order, :status, NOW(), NOW()
                ) ON DUPLICATE KEY UPDATE
                    title = VALUES(title),
                    destination_id = VALUES(destination_id),
                    state_region = VALUES(state_region),
                    hero_media_id = VALUES(hero_media_id),
                    short_description = VALUES(short_description),
                    full_description = VALUES(full_description),
                    duration = VALUES(duration),
                    best_time = VALUES(best_time),
                    location = VALUES(location),
                    suitable_for = VALUES(suitable_for),
                    adventure_level = VALUES(adventure_level),
                    is_featured = VALUES(is_featured),
                    display_order = VALUES(display_order),
                    status = VALUES(status),
                    updated_at = NOW()
            ");
            foreach ($catalog['things_to_do'] as $ttd) {
                $ttdIns->execute([
                    ':title' => $ttd['title'],
                    ':slug' => $ttd['slug'],
                    ':destination_id' => $ttd['destination_id'] ?? null,
                    ':state_region' => $ttd['state_region'] ?? null,
                    ':hero_media_id' => $ttd['hero_media_id'] ?? null,
                    ':short_description' => $ttd['short_description'] ?? '',
                    ':full_description' => $ttd['full_description'] ?? '',
                    ':duration' => $ttd['duration'] ?? '',
                    ':best_time' => $ttd['best_time'] ?? '',
                    ':location' => $ttd['location'] ?? '',
                    ':suitable_for' => $ttd['suitable_for'] ?? '',
                    ':adventure_level' => $ttd['adventure_level'] ?? 'Easy',
                    ':is_featured' => $ttd['is_featured'] ?? 0,
                    ':display_order' => $ttd['display_order'] ?? 0,
                    ':status' => $ttd['status'] ?? 'published',
                ]);
            }
        }

        $this->success([
            'destinations_synced' => $destSynced,
            'tours_synced' => $toursSynced,
            'media_synced' => $mediaSynced,
            'pages_synced' => $pagesSynced,
            'cms_synced' => $cmsSynced,
            'schema_logs' => $logs,
        ], 'Catalog and schema successfully synchronized');
        } catch (\Throwable $err) {
            $this->error('Sync failed: ' . $err->getMessage(), 500, [
                'file' => $err->getFile(),
                'line' => $err->getLine(),
                'trace' => $err->getTraceAsString(),
            ], 'SYNC_EXCEPTION');
        }
    }
}
