<?php
require_once __DIR__ . '/../vendor/autoload.php';
\App\Utils\Env::load(__DIR__ . '/../.env');
$pdo = \App\Utils\Database::getConnection();

function hasColumn(PDO $pdo, string $table, string $column): bool {
    $stmt = $pdo->query("SHOW COLUMNS FROM `$table` LIKE '$column'");
    return (bool) $stmt->fetch();
}

$export = [
    'tour_categories' => [],
    'destinations' => [],
    'tours' => [],
    'media' => [],
    'home_hero_slides' => [],
    'home_benefits' => [],
    'site_settings' => [],
    'pages' => [],
    'cms_sections' => [],
    'things_to_do' => [],
    'medical_trips' => [],
    'footer_links' => [],
    'social_links' => [],
];

// 0. Export Tour Categories
$export['tour_categories'] = $pdo->query("SELECT * FROM tour_categories ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);

// 1. Export Destinations
$dWhere = hasColumn($pdo, 'destinations', 'deleted_at') ? 'WHERE deleted_at IS NULL' : '';
$dests = $pdo->query("SELECT * FROM destinations $dWhere ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);
foreach ($dests as $d) {
    $dId = (int)$d['id'];
    
    // Featured image path
    $dFeatPath = null;
    if (!empty($d['featured_image_id'])) {
        $stmtM = $pdo->prepare("SELECT file_path FROM media WHERE id = ?");
        $stmtM->execute([$d['featured_image_id']]);
        $dFeatPath = $stmtM->fetchColumn() ?: null;
    }
    $d['featured_image_path'] = $dFeatPath;

    // Intro image path
    $dIntroPath = null;
    if (!empty($d['intro_media_id'])) {
        $stmtM = $pdo->prepare("SELECT file_path FROM media WHERE id = ?");
        $stmtM->execute([$d['intro_media_id']]);
        $dIntroPath = $stmtM->fetchColumn() ?: null;
    }
    $d['intro_media_path'] = $dIntroPath;

    $sWhere = hasColumn($pdo, 'destination_sections', 'deleted_at') ? 'AND deleted_at IS NULL' : '';
    $sections = $pdo->query("SELECT * FROM destination_sections WHERE destination_id = $dId $sWhere ORDER BY display_order ASC")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($sections as &$sec) {
        if (!empty($sec['media_id'])) {
            $stmtM = $pdo->prepare("SELECT file_path FROM media WHERE id = ?");
            $stmtM->execute([$sec['media_id']]);
            $sec['media_path'] = $stmtM->fetchColumn() ?: null;
        }
    }

    $fWhere = hasColumn($pdo, 'destination_faqs', 'deleted_at') ? 'AND deleted_at IS NULL' : '';
    $faqs = $pdo->query("SELECT * FROM destination_faqs WHERE destination_id = $dId $fWhere ORDER BY display_order ASC")->fetchAll(PDO::FETCH_ASSOC);
    $gallery = $pdo->query("SELECT * FROM destination_gallery WHERE destination_id = $dId ORDER BY display_order ASC")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($gallery as &$gal) {
        if (!empty($gal['media_id'])) {
            $stmtM = $pdo->prepare("SELECT file_path FROM media WHERE id = ?");
            $stmtM->execute([$gal['media_id']]);
            $gal['media_path'] = $stmtM->fetchColumn() ?: null;
        }
    }

    $d['sections'] = $sections;
    $d['faqs'] = $faqs;
    $d['gallery'] = $gallery;
    $export['destinations'][] = $d;
}

// 2. Export Tours (all tours with relationships)
$tWhere = hasColumn($pdo, 'tours', 'deleted_at') ? 'WHERE deleted_at IS NULL' : '';
$tours = $pdo->query("SELECT * FROM tours $tWhere ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);
foreach ($tours as $t) {
    $tId = (int)$t['id'];
    $t['status'] = 'published';
    
    // Category slugs
    $catSlugs = $pdo->query("
        SELECT c.slug FROM tour_categories c
        INNER JOIN tour_category_map m ON c.id = m.category_id
        WHERE m.tour_id = $tId
    ")->fetchAll(PDO::FETCH_COLUMN);

    // Destination slug
    $destSlug = null;
    if (!empty($t['destination_id'])) {
        $stmtD = $pdo->prepare("SELECT slug FROM destinations WHERE id = ?");
        $stmtD->execute([$t['destination_id']]);
        $destSlug = $stmtD->fetchColumn() ?: null;
    }
    
    $t['destination_slug'] = $destSlug;
    $t['category_slugs'] = $catSlugs;
    $t['highlights'] = $pdo->query("SELECT * FROM tour_highlights WHERE tour_id = $tId ORDER BY display_order ASC")->fetchAll(PDO::FETCH_ASSOC);
    $t['itineraries'] = $pdo->query("SELECT * FROM tour_itineraries WHERE tour_id = $tId ORDER BY display_order ASC, id ASC")->fetchAll(PDO::FETCH_ASSOC);
    $t['includes'] = $pdo->query("SELECT * FROM tour_includes WHERE tour_id = $tId ORDER BY display_order ASC")->fetchAll(PDO::FETCH_ASSOC);
    $t['excludes'] = $pdo->query("SELECT * FROM tour_excludes WHERE tour_id = $tId ORDER BY display_order ASC")->fetchAll(PDO::FETCH_ASSOC);
    $t['why_choose'] = $pdo->query("SELECT * FROM tour_why_choose WHERE tour_id = $tId ORDER BY display_order ASC")->fetchAll(PDO::FETCH_ASSOC);
    $t['faqs'] = $pdo->query("SELECT * FROM tour_faqs WHERE tour_id = $tId ORDER BY display_order ASC")->fetchAll(PDO::FETCH_ASSOC);
    $t['pricing_tiers'] = $pdo->query("SELECT * FROM tour_pricing_tiers WHERE tour_id = $tId ORDER BY min_persons ASC")->fetchAll(PDO::FETCH_ASSOC);
    $t['places'] = $pdo->query("SELECT * FROM tour_places WHERE tour_id = $tId ORDER BY display_order ASC")->fetchAll(PDO::FETCH_ASSOC);
    
    $gallery = $pdo->query("SELECT * FROM tour_gallery WHERE tour_id = $tId ORDER BY display_order ASC")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($gallery as &$gal) {
        if (!empty($gal['media_id'])) {
            $stmtM = $pdo->prepare("SELECT file_path FROM media WHERE id = ?");
            $stmtM->execute([$gal['media_id']]);
            $gal['media_path'] = $stmtM->fetchColumn() ?: null;
        }
    }
    $t['gallery'] = $gallery;

    // Featured image path
    $featImgPath = null;
    if (!empty($t['featured_image_id'])) {
        $stmtM = $pdo->prepare("SELECT file_path FROM media WHERE id = ?");
        $stmtM->execute([$t['featured_image_id']]);
        $featImgPath = $stmtM->fetchColumn() ?: null;
    }
    $t['featured_image_path'] = $featImgPath;

    $export['tours'][] = $t;
}

// 3. Media used by tours and destinations
$export['media'] = $pdo->query("SELECT id, filename, original_name, file_path, file_size, mime_type, alt_text FROM media")->fetchAll(PDO::FETCH_ASSOC);

// 4. Hero slides & benefits
$hWhere = hasColumn($pdo, 'home_hero_slides', 'deleted_at') ? 'WHERE deleted_at IS NULL' : '';
$export['home_hero_slides'] = $pdo->query("SELECT * FROM home_hero_slides $hWhere ORDER BY display_order ASC")->fetchAll(PDO::FETCH_ASSOC);

$bWhere = hasColumn($pdo, 'home_benefits', 'deleted_at') ? 'WHERE deleted_at IS NULL' : '';
$export['home_benefits'] = $pdo->query("SELECT * FROM home_benefits $bWhere ORDER BY display_order ASC")->fetchAll(PDO::FETCH_ASSOC);

// 5. Site settings
$sWhere = hasColumn($pdo, 'site_settings', 'deleted_at') ? 'WHERE deleted_at IS NULL' : '';
$export['site_settings'] = $pdo->query("SELECT * FROM site_settings $sWhere")->fetchAll(PDO::FETCH_ASSOC);

// 6. Pages
$pWhere = hasColumn($pdo, 'pages', 'deleted_at') ? 'WHERE deleted_at IS NULL' : '';
$export['pages'] = $pdo->query("SELECT * FROM pages $pWhere ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);

// 7. CMS Sections
$export['cms_sections'] = $pdo->query("SELECT * FROM cms_sections ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);

// 8. Things to do
$export['things_to_do'] = $pdo->query("SELECT * FROM things_to_do ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);

// 9. Medical trips
$export['medical_trips'] = $pdo->query("SELECT * FROM medical_trips ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);

// 10. Footer links & social links
$export['footer_links'] = $pdo->query("SELECT * FROM footer_links ORDER BY display_order ASC")->fetchAll(PDO::FETCH_ASSOC);
$export['social_links'] = $pdo->query("SELECT * FROM social_links ORDER BY display_order ASC")->fetchAll(PDO::FETCH_ASSOC);

@mkdir(__DIR__ . '/../storage', 0777, true);
file_put_contents(__DIR__ . '/../storage/production_catalog_seed.json', json_encode($export, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));

echo "Successfully exported:\n";
echo "- " . count($export['tour_categories']) . " tour categories\n";
echo "- " . count($export['destinations']) . " destinations\n";
echo "- " . count($export['tours']) . " tours\n";
echo "- " . count($export['media']) . " media rows\n";
echo "- " . count($export['pages']) . " pages\n";
echo "- " . count($export['cms_sections']) . " cms sections\n";
