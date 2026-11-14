<?php

require_once __DIR__ . '/../utils/Env.php';
require_once __DIR__ . '/../utils/Database.php';

use App\Utils\Database;
use App\Utils\Env;

Env::load(__DIR__ . '/../.env');
$pdo = Database::getConnection();

// 1. Gather all references
$references = [
    'tours.featured_image_id' => "SELECT id, featured_image_id as mid FROM tours WHERE featured_image_id IS NOT NULL",
    'tours.og_image_id' => "SELECT id, og_image_id as mid FROM tours WHERE og_image_id IS NOT NULL",
    'tour_gallery.media_id' => "SELECT id, media_id as mid FROM tour_gallery WHERE media_id IS NOT NULL",
    'destinations.featured_image_id' => "SELECT id, featured_image_id as mid FROM destinations WHERE featured_image_id IS NOT NULL",
    'destinations.intro_media_id' => "SELECT id, intro_media_id as mid FROM destinations WHERE intro_media_id IS NOT NULL",
    'destination_sections.media_id' => "SELECT id, media_id as mid FROM destination_sections WHERE media_id IS NOT NULL",
    'home_hero_slides.desktop_media_id' => "SELECT id, desktop_media_id as mid FROM home_hero_slides WHERE desktop_media_id IS NOT NULL",
    'home_hero_slides.mobile_media_id' => "SELECT id, mobile_media_id as mid FROM home_hero_slides WHERE mobile_media_id IS NOT NULL",
    'home_benefits.media_id' => "SELECT id, media_id as mid FROM home_benefits WHERE media_id IS NOT NULL",
    'things_to_do.hero_media_id' => "SELECT id, hero_media_id as mid FROM things_to_do WHERE hero_media_id IS NOT NULL",
    'pages.hero_media_id' => "SELECT id, hero_media_id as mid FROM pages WHERE hero_media_id IS NOT NULL",
    'cms_sections.media_id' => "SELECT id, media_id as mid FROM cms_sections WHERE media_id IS NOT NULL",
];

$usage = []; // media_id => [ [refName, rowId], ... ]
foreach ($references as $refName => $sql) {
    try {
        $rows = $pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as $r) {
            $mid = (int)$r['mid'];
            $usage[$mid][] = ['ref' => $refName, 'id' => $r['id']];
        }
    } catch (\Throwable $e) {}
}

$mediaRows = $pdo->query("SELECT * FROM media ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);

$diskRoots = [
    dirname(__DIR__, 2) . '/public/',
    dirname(__DIR__) . '/',
    dirname(__DIR__) . '/public/',
    dirname(__DIR__, 2) . '/',
];

function resolveFile($path, $roots) {
    if (!$path || preg_match('/^https?:\/\//i', $path)) return null;
    $clean = ltrim(str_replace('\\', '/', $path), '/');
    foreach ($roots as $b) {
        $full = $b . $clean;
        if (file_exists($full) && is_file($full)) {
            return realpath($full);
        }
    }
    return null;
}

$missing = [];
$byHash = [];
$validCount = 0;

foreach ($mediaRows as $m) {
    $id = (int)$m['id'];
    $file = resolveFile($m['file_path'], $diskRoots);
    if (!$file || filesize($file) === 0) {
        $missing[] = [
            'id' => $id,
            'path' => $m['file_path'],
            'used' => $usage[$id] ?? [],
        ];
    } else {
        $hash = md5_file($file);
        $byHash[$hash][] = [
            'id' => $id,
            'file' => $file,
            'row' => $m,
            'size' => filesize($file),
            'used' => $usage[$id] ?? [],
        ];
        $validCount++;
    }
}

echo "=== SUMMARY ===\n";
echo "Total rows: " . count($mediaRows) . "\n";
echo "Missing or 0-byte: " . count($missing) . "\n";
echo "Valid files: " . $validCount . "\n";
echo "Unique content hashes: " . count($byHash) . "\n";

$redundantRows = 0;
$redundantBytes = 0;
foreach ($byHash as $hash => $items) {
    if (count($items) > 1) {
        $redundantRows += (count($items) - 1);
        $redundantBytes += (count($items) - 1) * $items[0]['size'];
    }
}
$mbWaste = round($redundantBytes / 1024 / 1024, 2);
echo "Duplicate rows that can be merged: {$redundantRows} (wasting {$mbWaste} MB in duplicated files)\n";

echo "\n--- Broken / Missing Media in Use vs Unused ---\n";
$missingUsed = 0;
$missingUnused = 0;
foreach ($missing as $mis) {
    if (!empty($mis['used'])) {
        $missingUsed++;
        echo " [CRITICAL USED] ID {$mis['id']}: {$mis['path']} used by " . count($mis['used']) . " entities\n";
    } else {
        $missingUnused++;
    }
}
echo "Missing & In-Use: {$missingUsed}\n";
echo "Missing & Completely Unused: {$missingUnused}\n";

echo "\n--- All Duplicate Groups Breakdown ---\n";
$groupNum = 1;
foreach ($byHash as $hash => $items) {
    if (count($items) > 1) {
        echo "Group #{$groupNum} ({$hash}) - " . count($items) . " duplicate copies (" . round($items[0]['size'] / 1024, 1) . " KB each):\n";
        foreach ($items as $it) {
            $uCount = count($it['used']);
            $uStr = $uCount > 0 ? " [USED by {$uCount} places]" : " [UNUSED]";
            echo "   ID {$it['id']}: {$it['row']['filename']} -> {$it['file']}{$uStr}\n";
        }
        $groupNum++;
    }
}

