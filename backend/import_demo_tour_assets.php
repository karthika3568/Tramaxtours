<?php

require_once __DIR__ . '/vendor/autoload.php';
\App\Utils\Env::load(__DIR__ . '/.env');

use App\Utils\Database;

echo "====================================================\n";
echo "  TRAMAX TOURS — IMPORT DEMO TOUR ASSETS & CONTENT  \n";
echo "====================================================\n";

$pdo = Database::getConnection();

$sourceDir = 'E:\\demo tour\\index\\Images';
if (!is_dir($sourceDir)) {
    echo "[ERROR] Source directory '{$sourceDir}' not found!\n";
    exit(1);
}

$targetUploadsBackend = __DIR__ . '/public/uploads/media';
$targetUploadsFrontend = dirname(__DIR__) . '/public/uploads/media';

if (!is_dir($targetUploadsBackend)) {
    mkdir($targetUploadsBackend, 0777, true);
}
if (!is_dir($targetUploadsFrontend)) {
    mkdir($targetUploadsFrontend, 0777, true);
}

// 1. Recursive copy of images and registration in media table
$mediaMap = []; // relative path / filename => media_id

$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($sourceDir, RecursiveDirectoryIterator::SKIP_DOTS),
    RecursiveIteratorIterator::SELF_FIRST
);

$copiedCount = 0;
$registeredCount = 0;

foreach ($iterator as $item) {
    if ($item->isFile()) {
        $ext = strtolower($item->getExtension());
        if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif', 'ico'])) {
            continue;
        }

        $filename = $item->getFilename();
        if ($filename === 'Thumbs.db') continue;

        $relativePath = str_replace($sourceDir . DIRECTORY_SEPARATOR, '', $item->getPathname());
        $sanitizedName = 'demo_' . preg_replace('/[^a-zA-Z0-9_\.]/', '_', strtolower($relativePath));
        
        $destFileBackend = $targetUploadsBackend . '/' . $sanitizedName;
        $destFileFrontend = $targetUploadsFrontend . '/' . $sanitizedName;

        copy($item->getPathname(), $destFileBackend);
        copy($item->getPathname(), $destFileFrontend);
        $copiedCount++;

        // Check if media already exists in DB
        $filePathDb = 'uploads/media/' . $sanitizedName;
        $stmt = $pdo->prepare("SELECT id FROM media WHERE file_path = ? OR filename = ? LIMIT 1");
        $stmt->execute([$filePathDb, $sanitizedName]);
        $existingId = $stmt->fetchColumn();

        $fileSize = $item->getSize();
        $mimeType = match($ext) {
            'png' => 'image/png',
            'webp' => 'image/webp',
            'gif' => 'image/gif',
            'ico' => 'image/x-icon',
            default => 'image/jpeg',
        };

        if ($existingId) {
            $mediaMap[$relativePath] = (int)$existingId;
            $mediaMap[$filename] = (int)$existingId;
            $mediaMap[basename($relativePath)] = (int)$existingId;
        } else {
            $insStmt = $pdo->prepare("
                INSERT INTO media (filename, original_name, file_path, mime_type, file_size, alt_text, caption, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ");
            $insStmt->execute([
                $sanitizedName,
                $filename,
                $filePathDb,
                $mimeType,
                $fileSize,
                pathinfo($filename, PATHINFO_FILENAME),
                pathinfo($filename, PATHINFO_FILENAME)
            ]);
            $newId = (int)$pdo->lastInsertId();
            $mediaMap[$relativePath] = $newId;
            $mediaMap[$filename] = $newId;
            $mediaMap[basename($relativePath)] = $newId;
            $registeredCount++;
        }
    }
}

echo "[OK] Copied {$copiedCount} image files and synced {$registeredCount} new media records in DB.\n";

// Helper to find media ID
function getMediaId($mediaMap, $keys) {
    foreach ((array)$keys as $k) {
        if (isset($mediaMap[$k])) return $mediaMap[$k];
        foreach ($mediaMap as $path => $id) {
            if (stripos($path, $k) !== false) return $id;
        }
    }
    return null;
}

// 2. Set Up Hero Carousel Slides
echo "Updating Hero Carousel Slides with 8 Wander South India slides...\n";

$heroSlidesData = [
    [
        'title' => 'Tamil Nadu — Ancient Temples & Living Heritage',
        'subtitle' => 'DREAM. TRAVEL. DISCOVER.',
        'cta_label' => 'Explore Tamil Nadu',
        'cta_url' => '/destinations/tamil-nadu',
        'media_key' => 'Carousel\\TamilNadu.jpg',
        'display_order' => 1,
    ],
    [
        'title' => 'Kerala — God’s Own Country',
        'subtitle' => 'SERENE BACKWATERS & MISTY HILLS',
        'cta_label' => 'Explore Kerala',
        'cta_url' => '/destinations/kerala',
        'media_key' => 'Carousel\\Kerala.jpg',
        'display_order' => 2,
    ],
    [
        'title' => 'Karnataka — Royal Palaces & UNESCO Heritage',
        'subtitle' => 'MAJESTIC MONUMENTS & WILDLIFE',
        'cta_label' => 'Explore Karnataka',
        'cta_url' => '/destinations/karnataka',
        'media_key' => 'Carousel\\Karnataka.jpg',
        'display_order' => 3,
    ],
    [
        'title' => 'Goa — Sun-Drenched Beaches & Portuguese Charm',
        'subtitle' => 'COASTAL PARADISE & HERITAGE',
        'cta_label' => 'Explore Goa',
        'cta_url' => '/destinations/goa',
        'media_key' => 'Carousel\\Goa.jpg',
        'display_order' => 4,
    ],
    [
        'title' => 'Pondicherry — French Quarter & Serene Coastlines',
        'subtitle' => 'COLONIAL ELEGANCE ON THE BAY',
        'cta_label' => 'Explore Pondicherry',
        'cta_url' => '/destinations/pondicherry',
        'media_key' => 'Carousel\\Pondicherry.jpg',
        'display_order' => 5,
    ],
    [
        'title' => 'Taj Mahal & Golden Triangle — Iconic Wonders',
        'subtitle' => 'EPITOME OF TIMELESS LOVE & ARCHITECTURE',
        'cta_label' => 'Explore Golden Triangle',
        'cta_url' => '/tours',
        'media_key' => 'Carousel\\TajMahal.jpg',
        'display_order' => 6,
    ],
    [
        'title' => 'Rajasthan — Land of Maharajas & Royal Forts',
        'subtitle' => 'DESERT SAFARIS & OPULENT PALACES',
        'cta_label' => 'Explore Rajasthan',
        'cta_url' => '/tours',
        'media_key' => 'Carousel\\Rajasthan.jpg',
        'display_order' => 7,
    ],
    [
        'title' => 'Delhi — Historic Heart of India',
        'subtitle' => 'CULTURAL CROSSROADS & TIMELESS MONUMENTS',
        'cta_label' => 'Explore Delhi',
        'cta_url' => '/tours',
        'media_key' => 'Carousel\\Delhi.jpg',
        'display_order' => 8,
    ],
];

// Clean existing slides
$pdo->query("DELETE FROM home_hero_slides");

foreach ($heroSlidesData as $slide) {
    $mediaId = getMediaId($mediaMap, [$slide['media_key'], basename($slide['media_key'])]);

    $ins = $pdo->prepare("
        INSERT INTO home_hero_slides (title, subtitle, cta_label, cta_url, desktop_media_id, mobile_media_id, display_order, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
    ");
    $ins->execute([
        $slide['title'],
        $slide['subtitle'],
        $slide['cta_label'],
        $slide['cta_url'],
        $mediaId,
        $mediaId,
        $slide['display_order'],
    ]);
}
echo "[OK] Hero slides inserted.\n";

// 3. Update Destinations with rich demo tour content & imagery
echo "Updating Destinations (Tamil Nadu, Kerala, Karnataka, Goa, Pondicherry)...\n";

$destinationsData = [
    [
        'name' => 'Tamil Nadu',
        'slug' => 'tamil-nadu',
        'hero_title' => 'Ancient Temples, Rich Heritage & Living Chola Art',
        'hero_subtitle' => 'Explore the land of magnificent Dravidian architecture, cultural temples, and coastal wonders',
        'intro_content' => 'Tamil Nadu is home to four UNESCO World Heritage sites including the Great Living Chola Temples and Mahabalipuram shore temples. Surrounded by the Bay of Bengal, the state boasts a rich 3,000-year-old cultural legacy, Carnatic music, classical Bharatanatyam dance, and mouthwatering South Indian cuisine.',
        'image_key' => 'Home\\TamilNadu.jpg',
        'display_order' => 1,
    ],
    [
        'name' => 'Kerala',
        'slug' => 'kerala',
        'hero_title' => 'God’s Own Country — Backwaters, Hills & Serenity',
        'hero_subtitle' => 'Experience tranquil houseboats, tea-carpeted Western Ghats, and rejuvenating Ayurveda',
        'intro_content' => 'Named as one of the ten paradises of the world by National Geographic Traveler, Kerala is famous for its ecotourism initiatives, serene palm-fringed backwaters of Alleppey, rolling hills of Munnar, wildlife sanctuaries of Thekkady, and pristine beaches of Kovalam and Varkala.',
        'image_key' => 'Home\\Kerala.jpg',
        'display_order' => 2,
    ],
    [
        'name' => 'Karnataka',
        'slug' => 'karnataka',
        'hero_title' => 'Royal Palaces, Ancient Hampi & Western Ghats',
        'hero_subtitle' => 'From the grandeur of Mysore Palace to the boulder-strewn ruins of the Vijayanagara Empire',
        'intro_content' => 'Karnataka offers a captivating blend of historic monuments, world heritage ruins in Hampi and Pattadakal, magnificent waterfalls like Jog Falls, coffee plantations in Coorg and Chikmagalur, and the wildlife rich forests of Bandipur and Nagarhole.',
        'image_key' => 'Home\\Karnataka.jpg',
        'display_order' => 3,
    ],
    [
        'name' => 'Goa',
        'slug' => 'goa',
        'hero_title' => 'Sun-Kissed Beaches, Portuguese Charm & Coastal Vibe',
        'hero_subtitle' => 'Golden sands, UNESCO-listed Baroque churches, vibrant nightlife, and spice plantations',
        'intro_content' => 'India’s premier beach destination, Goa combines scenic coastlines with a rich 450-year Portuguese heritage. Explore the stunning Basilica of Bom Jesus, historic forts like Aguada and Chapora, Dudhsagar Waterfalls, and relax along idyllic beaches like Calangute, Palolem, and Anjuna.',
        'image_key' => 'Home\\Goa.jpg',
        'display_order' => 4,
    ],
    [
        'name' => 'Pondicherry',
        'slug' => 'pondicherry',
        'hero_title' => 'French Colonial Elegance & Coastal Peace',
        'hero_subtitle' => 'Pastel villas, chic seaside promenade, quiet beaches, and spiritual harmony at Auroville',
        'intro_content' => 'Known as the French Riviera of the East, Puducherry retains charming French architecture in White Town, leafy boulevards, boutique cafes, the world-renowned Sri Aurobindo Ashram, and experimental township of Auroville.',
        'image_key' => 'Home\\Pondicherry.jpg',
        'display_order' => 5,
    ],
];

foreach ($destinationsData as $dest) {
    $mediaId = getMediaId($mediaMap, [$dest['image_key'], basename($dest['image_key'])]);

    $chk = $pdo->prepare("SELECT id FROM destinations WHERE slug = ? OR name = ? LIMIT 1");
    $chk->execute([$dest['slug'], $dest['name']]);
    $destId = $chk->fetchColumn();

    if ($destId) {
        $upd = $pdo->prepare("
            UPDATE destinations 
            SET name = ?, hero_title = ?, hero_subtitle = ?, intro_content = ?, featured_image_id = COALESCE(?, featured_image_id), is_featured = 1, status = 'published', display_order = ?, updated_at = NOW()
            WHERE id = ?
        ");
        $upd->execute([
            $dest['name'],
            $dest['hero_title'],
            $dest['hero_subtitle'],
            $dest['intro_content'],
            $mediaId,
            $dest['display_order'],
            $destId
        ]);
    } else {
        $ins = $pdo->prepare("
            INSERT INTO destinations (name, slug, hero_title, hero_subtitle, intro_content, featured_image_id, is_featured, display_order, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 1, ?, 'published', NOW(), NOW())
        ");
        $ins->execute([
            $dest['name'],
            $dest['slug'],
            $dest['hero_title'],
            $dest['hero_subtitle'],
            $dest['intro_content'],
            $mediaId,
            $dest['display_order'],
        ]);
    }
}
echo "[OK] Destinations updated with images.\n";

// 4. Update CMS Storytelling Sections with exact Wander South India text
echo "Updating CMS Storytelling Sections...\n";

$cmsSectionsData = [
    [
        'section_key' => 'home_places_to_explore',
        'title' => 'Places To Explore — Diverse, Spell-Binding India',
        'subtitle' => 'India’s languages, religions, dance, music, architecture, food, and customs differ wonderfully across every state. A spell-binding country where people of unlike communities live together in oneness.',
        'content' => 'India contains majestic peaks dusted with glistening snow, sun-drenched beaches, ancient hand-carved temples, and sprawling cities rich with history. The southern part of the country, surrounded by the Arabian Sea and the Bay of Bengal, is listed among the most picturesque destinations on Earth.',
        'media_key' => 'Home\\IndiaMap.PNG',
        'display_order' => 1,
    ],
    [
        'section_key' => 'home_why_travel_with_us',
        'title' => 'Why Travel With Tramax Tours',
        'subtitle' => 'We believe that planning the details of your trip should be as enjoyable and effortless as the journey itself.',
        'content' => 'With 24/7 dedicated support, certified local tour guides, tailored private itineraries, and guaranteed transparent pricing, we deliver world-class travel across South India.',
        'media_key' => 'AboutUs.jpg',
        'display_order' => 2,
    ],
];

// Clean existing cms sections
$pdo->query("DELETE FROM cms_sections");

foreach ($cmsSectionsData as $cms) {
    $mediaId = getMediaId($mediaMap, [$cms['media_key'], basename($cms['media_key'])]);

    $ins = $pdo->prepare("
        INSERT INTO cms_sections (section_key, title, subtitle, content, media_id, display_order, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
    ");
    $ins->execute([
        $cms['section_key'],
        $cms['title'],
        $cms['subtitle'],
        $cms['content'],
        $mediaId,
        $cms['display_order'],
    ]);
}
echo "[OK] CMS Sections inserted.\n";

// 5. Update Site Settings (Tagline, About, etc.)
echo "Updating Site Settings with Wander South India branding...\n";

$settingsToUpdate = [
    ['general', 'site_name', 'Wonderer South India'],
    ['general', 'site_tagline', 'DREAM. TRAVEL. DISCOVER.'],
    ['general', 'meta_description', 'Wonderer South India believes that planning the details of your trip can be as enjoyable as the trip itself. Tailored South India tours, safaris, and cultural expeditions.'],
    ['footer', 'about', 'Wonderer South India specializes in international tourist safaris, private sightseeing, cultural expeditions, and custom itineraries across premier South Indian destinations.'],
];

foreach ($settingsToUpdate as [$group, $key, $val]) {
    $chk = $pdo->prepare("SELECT id FROM site_settings WHERE setting_group = ? AND setting_key = ? LIMIT 1");
    $chk->execute([$group, $key]);
    if ($chk->fetchColumn()) {
        $upd = $pdo->prepare("UPDATE site_settings SET setting_value = ?, updated_at = NOW() WHERE setting_group = ? AND setting_key = ?");
        $upd->execute([$val, $group, $key]);
    } else {
        $ins = $pdo->prepare("INSERT INTO site_settings (setting_group, setting_key, setting_value, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())");
        $ins->execute([$group, $key, $val]);
    }
}
echo "[OK] Site Settings updated.\n";

// 6. Enrich Tours with actual Demo Tour Images
echo "Enriching Featured Tours with high-res demo tour media...\n";

$tourMediaUpdates = [
    'tamil' => 'Carousel\\TamilNadu.jpg',
    'kerala' => 'Carousel\\Kerala.jpg',
    'karnataka' => 'Carousel\\Karnataka.jpg',
    'goa' => 'Carousel\\Goa.jpg',
    'pondicherry' => 'Carousel\\Pondicherry.jpg',
    'wildlife' => 'ThingsToDo\\WildLife.jpg',
    'safari' => 'ThingsToDo\\WildLife.jpg',
    'city' => 'ThingsToDo\\CityTour.jpg',
    'art' => 'ThingsToDo\\Art.jpg',
    'culture' => 'ThingsToDo\\Art.jpg',
];

$toursStmt = $pdo->query("SELECT id, title, slug FROM tours WHERE status = 'published' AND deleted_at IS NULL");
$tours = $toursStmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($tours as $t) {
    $titleLower = strtolower($t['title'] . ' ' . $t['slug']);
    foreach ($tourMediaUpdates as $keyword => $imgKey) {
        if (strpos($titleLower, $keyword) !== false) {
            $mId = getMediaId($mediaMap, [$imgKey, basename($imgKey)]);
            if ($mId) {
                $upd = $pdo->prepare("UPDATE tours SET featured_image_id = ?, updated_at = NOW() WHERE id = ?");
                $upd->execute([$mId, $t['id']]);
                break;
            }
        }
    }
}
echo "[OK] Tours enriched with demo tour media.\n";

echo "\n====================================================\n";
echo "  IMPORT COMPLETED SUCCESSFULLY!                     \n";
echo "====================================================\n";
