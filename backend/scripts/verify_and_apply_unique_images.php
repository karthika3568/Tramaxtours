<?php
require_once __DIR__ . '/../vendor/autoload.php';
\App\Utils\Env::load(__DIR__ . '/../.env');

$pdo = \App\Utils\Database::getConnection();

function getMediaIdByPath(PDO $pdo, string $path): ?int {
    $stmt = $pdo->prepare("SELECT id FROM media WHERE file_path = :path LIMIT 1");
    $stmt->execute([':path' => $path]);
    $id = $stmt->fetchColumn();
    if ($id) return (int) $id;

    // Try without uploads/ prefix or with it
    $alt = str_starts_with($path, 'uploads/') ? substr($path, 8) : 'uploads/' . $path;
    $stmt->execute([':path' => $alt]);
    $id = $stmt->fetchColumn();
    return $id ? (int) $id : null;
}

echo "1. Checking Media Records...\n";

// Map of all paths we want to use
$desiredPaths = [
    // Carousel (Slides)
    'carousel_tamilnadu' => 'uploads/media/demo_carousel_tamilnadu.jpg',
    'carousel_kerala' => 'uploads/media/demo_carousel_kerala.jpg',
    'carousel_karnataka' => 'uploads/media/demo_carousel_karnataka.jpg',
    'carousel_goa' => 'uploads/media/demo_carousel_goa.jpg',
    'carousel_pondicherry' => 'uploads/media/demo_carousel_pondicherry.jpg',

    // Destination Featured
    'dest_home_tamilnadu' => 'uploads/media/demo_home_tamilnadu.jpg',
    'dest_home_kerala' => 'uploads/media/demo_home_kerala.jpg',
    'dest_home_karnataka' => 'uploads/media/demo_home_karnataka.jpg',
    'dest_home_goa' => 'uploads/media/demo_home_goa.jpg',

    // Destination Intro
    'dest_intro_tamilnadu' => 'uploads/media/demo_tamilnadu_culture.jpg',
    'dest_intro_kerala' => 'uploads/media/demo_kerala_home.jpg',
    'dest_intro_karnataka' => 'uploads/media/demo_karnataka_home.jpg',
    'dest_intro_goa' => 'uploads/media/demo_goa_home.jpg',

    // Seasonal Activities - Tamil Nadu
    'sec_tn_1' => 'uploads/media/demo_tamilnadu_chennai_view_1.jpg',
    'sec_tn_2' => 'uploads/media/demo_tamilnadu_pondicherry_view_1.jpg',
    'sec_tn_3' => 'uploads/media/demo_tamilnadu_thanjavur_view_1.jpg',
    'sec_tn_4' => 'uploads/media/demo_tamilnadu_madurai_view_1.jpg',

    // Seasonal Activities - Kerala
    'sec_kl_1' => 'uploads/media/demo_kerala_alappuzha.jpg',
    'sec_kl_2' => 'uploads/media/demo_kerala_munnar_view_1.jpg',
    'sec_kl_3' => 'uploads/media/demo_kerala_nationalparks_view_1.jpg',
    'sec_kl_4' => 'uploads/media/demo_kerala_cochin_view_1.jpg',
    'sec_kl_5' => 'uploads/media/demo_kerala_varkala_view_1.jpg',

    // Seasonal Activities - Karnataka
    'sec_ka_1' => 'uploads/media/demo_karnataka_hampi.jpg',
    'sec_ka_2' => 'uploads/media/demo_karnataka_mysore_view_1.jpg',
    'sec_ka_3' => 'uploads/media/demo_karnataka_bangalore_view_1.jpg',
    'sec_ka_4' => 'uploads/media/demo_karnataka_coorg_view_1.jpg',
    'sec_ka_5' => 'uploads/media/demo_karnataka_nationalparks_view_1.jpg',

    // Seasonal Activities - Goa
    'sec_ga_1' => 'uploads/media/demo_goa_beach_2.jpg',
    'sec_ga_2' => 'uploads/media/demo_goa_margoa_view_1.jpg',
    'sec_ga_3' => 'uploads/media/demo_goa_beaches_view_1.jpg',
    'sec_ga_4' => 'uploads/media/demo_goa_oldgoa_view_1.jpg',
    'sec_ga_5' => 'uploads/media/demo_goa_culture_view_1.jpg',

    // Tours (Each tour gets its own distinct image)
    'tour_mahabalipuram' => 'uploads/media/demo_tamilnadu_mahabalipuram.jpg',
    'tour_kanchipuram' => 'uploads/media/demo_tamilnadu_kanchipuram.jpg',
    'tour_pondicherry' => 'uploads/media/demo_tamilnadu_pondicherry.jpg',
    'tour_chennai' => 'uploads/media/demo_tamilnadu_chennai.jpg',
    'tour_tn_luxury' => 'uploads/media/demo_tamilnadu_thanjavur.jpg',
    'tour_tn_scenic' => 'uploads/media/demo_tamilnadu_madurai.jpg',
    'tour_kl_luxury' => 'uploads/media/demo_kerala_munnar.jpg',
    'tour_kl_scenic' => 'uploads/media/demo_kerala_cochin.jpg',
    'tour_ka_luxury' => 'uploads/media/demo_karnataka_mysore.jpg',
    'tour_ka_scenic' => 'uploads/media/demo_karnataka_coorg.jpg',
    'tour_ga_luxury' => 'uploads/media/demo_goa_oldgoa.jpg',
    'tour_ga_scenic' => 'uploads/media/demo_goa_beaches.jpg',
    'tour_sl_luxury' => 'uploads/media/demo_tamilnadu_trichy.jpg',
    'tour_sl_scenic' => 'uploads/media/demo_tamilnadu_thiruvannamalai.jpg',
    'tour_ap_luxury' => 'uploads/media/demo_kerala_trivandrum.jpg',
    'tour_ap_scenic' => 'uploads/media/demo_karnataka_bangalore.jpg',
];

$mediaIds = [];
foreach ($desiredPaths as $key => $path) {
    $id = getMediaIdByPath($pdo, $path);
    if (!$id) {
        // Insert if not present
        $filename = basename($path);
        $pdo->prepare("INSERT INTO media (filename, original_name, file_path, file_size, mime_type, created_at, updated_at)
                       VALUES (:fn, :on, :fp, 102400, 'image/jpeg', NOW(), NOW())")
            ->execute([
                ':fn' => $filename,
                ':on' => $filename,
                ':fp' => $path
            ]);
        $id = (int) $pdo->lastInsertId();
        echo " - Created missing media record ID {$id} for {$path}\n";
    }
    $mediaIds[$key] = $id;
    echo "Media '{$key}' => ID: {$id} ({$path})\n";
}

echo "\n2. Updating Homepage Hero Carousel Slides (Unique images only)...\n";
// Clean up any extraneous slides and keep only the 4 curated official destination slides
$pdo->exec("UPDATE home_hero_slides SET deleted_at = NOW(), deleted_by = 1, status = 'inactive' WHERE id NOT IN (38, 39, 40, 41)");

// Slide 1: Tamil Nadu
$pdo->prepare("UPDATE home_hero_slides SET title = 'Tamil Nadu Living Heritage & Grand Temples', subtitle = 'Explore magnificent Dravidian temples, UNESCO monuments, and timeless classical arts.', desktop_media_id = :mid1, mobile_media_id = :mid2, display_order = 1, status = 'active', deleted_at = NULL WHERE id = 41")
    ->execute([':mid1' => $mediaIds['carousel_tamilnadu'], ':mid2' => $mediaIds['carousel_tamilnadu']]);

// Slide 2: Kerala
$pdo->prepare("UPDATE home_hero_slides SET title = 'Kerala Emerald Backwaters & Wellness', subtitle = 'Cruise tranquil palm-fringed backwaters, misty tea plantations, and rejuvenate with Ayurveda.', desktop_media_id = :mid1, mobile_media_id = :mid2, display_order = 2, status = 'active', deleted_at = NULL WHERE id = 38")
    ->execute([':mid1' => $mediaIds['carousel_kerala'], ':mid2' => $mediaIds['carousel_kerala']]);

// Slide 3: Karnataka
$pdo->prepare("UPDATE home_hero_slides SET title = 'Karnataka Royal Palaces & UNESCO Hampi', subtitle = 'Discover the golden grandeur of Mysore Palace, ancient ruins of Hampi, and lush coffee hills.', desktop_media_id = :mid1, mobile_media_id = :mid2, display_order = 3, status = 'active', deleted_at = NULL WHERE id = 39")
    ->execute([':mid1' => $mediaIds['carousel_karnataka'], ':mid2' => $mediaIds['carousel_karnataka']]);

// Slide 4: Goa
$pdo->prepare("UPDATE home_hero_slides SET title = 'Goa Golden Beaches & Coastal Splendor', subtitle = 'Relax on sun-kissed coastlines, historic Portuguese heritage sites, and vibrant culture.', desktop_media_id = :mid1, mobile_media_id = :mid2, display_order = 4, status = 'active', deleted_at = NULL WHERE id = 40")
    ->execute([':mid1' => $mediaIds['carousel_goa'], ':mid2' => $mediaIds['carousel_goa']]);

echo " - Carousel updated with 4 distinct carousel images.\n";

echo "\n3. Updating Destinations (Featured Card and Intro Visual)...\n";
// Tamil Nadu
$pdo->prepare("UPDATE destinations SET featured_image_id = :f, intro_media_id = :i WHERE slug = 'tamil-nadu'")
    ->execute([':f' => $mediaIds['dest_home_tamilnadu'], ':i' => $mediaIds['dest_intro_tamilnadu']]);

// Kerala
$pdo->prepare("UPDATE destinations SET featured_image_id = :f, intro_media_id = :i WHERE slug = 'kerala'")
    ->execute([':f' => $mediaIds['dest_home_kerala'], ':i' => $mediaIds['dest_intro_kerala']]);

// Karnataka
$pdo->prepare("UPDATE destinations SET featured_image_id = :f, intro_media_id = :i WHERE slug = 'karnataka'")
    ->execute([':f' => $mediaIds['dest_home_karnataka'], ':i' => $mediaIds['dest_intro_karnataka']]);

// Goa
$pdo->prepare("UPDATE destinations SET featured_image_id = :f, intro_media_id = :i WHERE slug = 'goa'")
    ->execute([':f' => $mediaIds['dest_home_goa'], ':i' => $mediaIds['dest_intro_goa']]);

echo " - Destinations updated with unique featured and intro visuals.\n";

echo "\n4. Updating Seasonal Activities (Destination Sections)...\n";
// Tamil Nadu (Dest 123)
$pdo->prepare("UPDATE destination_sections SET media_id = :mid WHERE destination_id = 123 AND title LIKE '%Best Time%'")->execute([':mid' => $mediaIds['sec_tn_1']]);
$pdo->prepare("UPDATE destination_sections SET media_id = :mid WHERE destination_id = 123 AND title LIKE '%Comfortable%'")->execute([':mid' => $mediaIds['sec_tn_2']]);
$pdo->prepare("UPDATE destination_sections SET media_id = :mid WHERE destination_id = 123 AND title LIKE '%Cultural%'")->execute([':mid' => $mediaIds['sec_tn_3']]);
$pdo->prepare("UPDATE destination_sections SET media_id = :mid WHERE destination_id = 123 AND title LIKE '%Flexible%'")->execute([':mid' => $mediaIds['sec_tn_4']]);

// Kerala (Dest 122)
$pdo->prepare("UPDATE destination_sections SET media_id = :mid WHERE destination_id = 122 AND title LIKE '%Best Time%'")->execute([':mid' => $mediaIds['sec_kl_1']]);
$pdo->prepare("UPDATE destination_sections SET media_id = :mid WHERE destination_id = 122 AND title LIKE '%Comfortable%'")->execute([':mid' => $mediaIds['sec_kl_2']]);
$pdo->prepare("UPDATE destination_sections SET media_id = :mid WHERE destination_id = 122 AND title LIKE '%Backwaters%'")->execute([':mid' => $mediaIds['sec_kl_3']]);
$pdo->prepare("UPDATE destination_sections SET media_id = :mid WHERE destination_id = 122 AND title LIKE '%Cultural%'")->execute([':mid' => $mediaIds['sec_kl_4']]);
$pdo->prepare("UPDATE destination_sections SET media_id = :mid WHERE destination_id = 122 AND title LIKE '%Flexible%'")->execute([':mid' => $mediaIds['sec_kl_5']]);

// Karnataka (Dest 121)
$pdo->prepare("UPDATE destination_sections SET media_id = :mid WHERE destination_id = 121 AND title LIKE '%Best Time%'")->execute([':mid' => $mediaIds['sec_ka_1']]);
$pdo->prepare("UPDATE destination_sections SET media_id = :mid WHERE destination_id = 121 AND title LIKE '%Comfortable%'")->execute([':mid' => $mediaIds['sec_ka_2']]);
$pdo->prepare("UPDATE destination_sections SET media_id = :mid WHERE destination_id = 121 AND title LIKE '%Heritage%'")->execute([':mid' => $mediaIds['sec_ka_3']]);
$pdo->prepare("UPDATE destination_sections SET media_id = :mid WHERE destination_id = 121 AND title LIKE '%Nature%'")->execute([':mid' => $mediaIds['sec_ka_4']]);
$pdo->prepare("UPDATE destination_sections SET media_id = :mid WHERE destination_id = 121 AND title LIKE '%Flexible%'")->execute([':mid' => $mediaIds['sec_ka_5']]);

// Goa (Dest 120)
$pdo->prepare("UPDATE destination_sections SET media_id = :mid WHERE destination_id = 120 AND title LIKE '%Best Time%'")->execute([':mid' => $mediaIds['sec_ga_1']]);
$pdo->prepare("UPDATE destination_sections SET media_id = :mid WHERE destination_id = 120 AND title LIKE '%Comfortable%'")->execute([':mid' => $mediaIds['sec_ga_2']]);
$pdo->prepare("UPDATE destination_sections SET media_id = :mid WHERE destination_id = 120 AND title LIKE '%Beaches%'")->execute([':mid' => $mediaIds['sec_ga_3']]);
$pdo->prepare("UPDATE destination_sections SET media_id = :mid WHERE destination_id = 120 AND title LIKE '%Cultural%'")->execute([':mid' => $mediaIds['sec_ga_4']]);
$pdo->prepare("UPDATE destination_sections SET media_id = :mid WHERE destination_id = 120 AND title LIKE '%Flexible%'")->execute([':mid' => $mediaIds['sec_ga_5']]);

echo " - Seasonal activities updated with unique visuals.\n";

echo "\n5. Updating Tours with Unique Featured Images (Zero Overlap with Carousel or Destination Cards)...\n";
$tourMappings = [
    150 => $mediaIds['tour_mahabalipuram'],
    151 => $mediaIds['tour_kanchipuram'],
    152 => $mediaIds['tour_pondicherry'],
    153 => $mediaIds['tour_chennai'],
    144 => $mediaIds['tour_tn_luxury'],
    145 => $mediaIds['tour_tn_scenic'],
    142 => $mediaIds['tour_kl_luxury'],
    143 => $mediaIds['tour_kl_scenic'],
    140 => $mediaIds['tour_ka_luxury'],
    141 => $mediaIds['tour_ka_scenic'],
    138 => $mediaIds['tour_ga_luxury'],
    139 => $mediaIds['tour_ga_scenic'],
    146 => $mediaIds['tour_sl_luxury'],
    147 => $mediaIds['tour_sl_scenic'],
    148 => $mediaIds['tour_ap_luxury'],
    149 => $mediaIds['tour_ap_scenic'],
];

$tourStmt = $pdo->prepare("UPDATE tours SET featured_image_id = :mid WHERE id = :id");
foreach ($tourMappings as $tourId => $mid) {
    $tourStmt->execute([':mid' => $mid, ':id' => $tourId]);
}

echo " - Tours updated with unique individual images.\n";

// Verification: Check all live components for any duplicate image usage
echo "\n=======================================================\n";
echo "6. VERIFYING ZERO DUPLICATE IMAGES ACROSS THE SITE:\n";
echo "=======================================================\n";

$allAllocations = [];

// Active Hero Slides
$slides = $pdo->query("SELECT s.id, s.title, m.id as media_id, m.file_path FROM home_hero_slides s JOIN media m ON s.desktop_media_id = m.id WHERE s.deleted_at IS NULL AND s.status = 'active'")->fetchAll(PDO::FETCH_ASSOC);
foreach ($slides as $s) {
    $allAllocations[] = ['type' => 'Hero Slide #' . $s['id'] . ' (' . $s['title'] . ')', 'media_id' => $s['media_id'], 'file_path' => $s['file_path']];
}

// Destinations Featured & Intro
$dests = $pdo->query("SELECT d.id, d.name, mf.id as feat_id, mf.file_path as feat_path, mi.id as intro_id, mi.file_path as intro_path FROM destinations d LEFT JOIN media mf ON d.featured_image_id = mf.id LEFT JOIN media mi ON d.intro_media_id = mi.id WHERE d.status = 'published'")->fetchAll(PDO::FETCH_ASSOC);
foreach ($dests as $d) {
    if ($d['feat_id']) {
        $allAllocations[] = ['type' => 'Destination Card (' . $d['name'] . ')', 'media_id' => $d['feat_id'], 'file_path' => $d['feat_path']];
    }
    if ($d['intro_id']) {
        $allAllocations[] = ['type' => 'Destination Intro Visual (' . $d['name'] . ')', 'media_id' => $d['intro_id'], 'file_path' => $d['intro_path']];
    }
}

// Destination Sections (Seasonal Activities)
$sections = $pdo->query("SELECT ds.id, d.name as dest_name, ds.title, m.id as media_id, m.file_path FROM destination_sections ds JOIN destinations d ON ds.destination_id = d.id JOIN media m ON ds.media_id = m.id WHERE ds.status = 'active'")->fetchAll(PDO::FETCH_ASSOC);
foreach ($sections as $sec) {
    $allAllocations[] = ['type' => 'Seasonal Activity (' . $sec['dest_name'] . ' - ' . $sec['title'] . ')', 'media_id' => $sec['media_id'], 'file_path' => $sec['file_path']];
}

// Tours
$tours = $pdo->query("SELECT t.id, t.title, m.id as media_id, m.file_path FROM tours t JOIN media m ON t.featured_image_id = m.id WHERE t.status = 'published'")->fetchAll(PDO::FETCH_ASSOC);
foreach ($tours as $t) {
    $allAllocations[] = ['type' => 'Tour Card #' . $t['id'] . ' (' . $t['title'] . ')', 'media_id' => $t['media_id'], 'file_path' => $t['file_path']];
}

$counts = [];
foreach ($allAllocations as $item) {
    $path = $item['file_path'];
    if (!isset($counts[$path])) {
        $counts[$path] = [];
    }
    $counts[$path][] = $item['type'];
}

$hasDuplicates = false;
foreach ($counts as $path => $locations) {
    if (count($locations) > 1) {
        $hasDuplicates = true;
        echo "❌ DUPLICATE FOUND for [{$path}]:\n";
        foreach ($locations as $loc) {
            echo "   - {$loc}\n";
        }
    }
}

if (!$hasDuplicates) {
    echo "✅ PERFECT! ZERO DUPLICATES! Every single image is used EXACTLY ONCE across the entire website!\n";
    echo "Total unique images active: " . count($counts) . "\n";
    foreach ($allAllocations as $item) {
        echo " • " . str_pad($item['type'], 55) . " => " . $item['file_path'] . "\n";
    }
}

echo "\nUnique image assignment completed successfully!\n";

