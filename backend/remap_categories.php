<?php

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/utils/Env.php';
require_once __DIR__ . '/utils/Database.php';

use App\Utils\Database;
use App\Utils\Env;

Env::load(__DIR__ . '/.env');

$db = Database::getConnection();

echo "=======================================================\n";
echo "  CATEGORIES CLEANUP & REMAPPING\n";
echo "=======================================================\n";

echo "\n--- BEFORE CATEGORIES SELECT ---\n";
$beforeCats = $db->query("SELECT id, name, slug FROM tour_categories ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);
foreach ($beforeCats as $c) {
    echo "  [ID: {$c['id']}] {$c['name']} (slug: {$c['slug']})\n";
}

// 1. Ensure the 6 exact categories exist
$target = [
    'Cultural Tour' => ['slug' => 'cultural-tour', 'desc' => 'Heritage monuments, royal palaces, and ancient temple architecture.'],
    'Pilgrimage' => ['slug' => 'pilgrimage', 'desc' => 'Spiritual circuits, sacred temples, and holy South India shrines.'],
    'Beach Holiday' => ['slug' => 'beach-holiday', 'desc' => 'Pristine coastal retreats, coconut groves, and sun-kissed shores.'],
    'Adventure Tour' => ['slug' => 'adventure-tour', 'desc' => 'Western Ghats trekking, wildlife safaris, and outdoor expeditions.'],
    'Wildlife Tour' => ['slug' => 'wildlife-tour', 'desc' => 'National parks, tiger reserves, elephant sanctuaries, and birding.'],
    'Shopping Tour' => ['slug' => 'shopping-tour', 'desc' => 'Silk weaving centers, spice bazaars, handicrafts, and artisanal markets.']
];

// Check mapping table
$mapTable = 'tour_category_mappings';
$hasMappingTable = (bool) $db->query("SHOW TABLES LIKE 'tour_category_mappings'")->fetch();
if (!$hasMappingTable) {
    $hasMappingTable = (bool) $db->query("SHOW TABLES LIKE 'tour_categories_pivot'")->fetch();
    if ($hasMappingTable) $mapTable = 'tour_categories_pivot';
}

// Let's create the 6 clean categories with IDs 1 to 6
$db->exec("SET FOREIGN_KEY_CHECKS = 0");

// Check if tours table has category_id column
$tourCols = $db->query("SHOW COLUMNS FROM tours")->fetchAll(PDO::FETCH_COLUMN);

// Re-map tours to the new category definitions
$db->exec("DELETE FROM `tour_categories`");
$db->exec("ALTER TABLE `tour_categories` AUTO_INCREMENT = 1");

$stmtInsert = $db->prepare("INSERT INTO `tour_categories` (`id`, `name`, `slug`, `description`, `status`, `created_at`, `updated_at`) 
    VALUES (:id, :name, :slug, :desc, 'active', NOW(), NOW())");

$id = 1;
$categoryMap = [];
foreach ($target as $name => $meta) {
    $stmtInsert->execute([
        ':id' => $id,
        ':name' => $name,
        ':slug' => $meta['slug'],
        ':desc' => $meta['desc']
    ]);
    $categoryMap[$name] = $id;
    $id++;
}

// Remap all existing tours
if ($hasMappingTable) {
    $db->exec("DELETE FROM `$mapTable`");
    $tourRows = $db->query("SELECT id, title, tour_type FROM tours")->fetchAll(PDO::FETCH_ASSOC);
    $stmtMap = $db->prepare("INSERT IGNORE INTO `$mapTable` (`tour_id`, `category_id`) VALUES (:tour_id, :category_id)");
    
    foreach ($tourRows as $t) {
        $titleLower = strtolower($t['title'] . ' ' . ($t['tour_type'] ?? ''));
        $catId = 1; // default Cultural Tour
        if (str_contains($titleLower, 'temple') || str_contains($titleLower, 'pilgrim') || str_contains($titleLower, 'kanchipuram') || str_contains($titleLower, 'madurai') || str_contains($titleLower, 'thanjavur')) {
            $catId = 2; // Pilgrimage
        } elseif (str_contains($titleLower, 'beach') || str_contains($titleLower, 'pondicherry') || str_contains($titleLower, 'goa') || str_contains($titleLower, 'alleppey')) {
            $catId = 3; // Beach Holiday
        } elseif (str_contains($titleLower, 'trek') || str_contains($titleLower, 'hill') || str_contains($titleLower, 'munnar') || str_contains($titleLower, 'ooty') || str_contains($titleLower, 'kodaikanal')) {
            $catId = 4; // Adventure Tour
        } elseif (str_contains($titleLower, 'wildlife') || str_contains($titleLower, 'safari') || str_contains($titleLower, 'thekkady') || str_contains($titleLower, 'periyar') || str_contains($titleLower, 'kabini')) {
            $catId = 5; // Wildlife Tour
        } elseif (str_contains($titleLower, 'silk') || str_contains($titleLower, 'shop') || str_contains($titleLower, 'bazaar') || str_contains($titleLower, 'market')) {
            $catId = 6; // Shopping Tour
        }

        $stmtMap->execute([':tour_id' => $t['id'], ':category_id' => $catId]);
        // Also add primary Cultural Tour if different
        if ($catId !== 1) {
            $stmtMap->execute([':tour_id' => $t['id'], ':category_id' => 1]);
        }
    }
}

if (in_array('category_id', $tourCols, true)) {
    $db->exec("UPDATE tours SET category_id = 1 WHERE category_id IS NULL OR category_id > 6");
}

$db->exec("SET FOREIGN_KEY_CHECKS = 1");

echo "\n--- AFTER CATEGORIES SELECT (EXACT 6 CATEGORIES) ---\n";
$afterCats = $db->query("SELECT id, name, slug, description FROM tour_categories ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);
foreach ($afterCats as $c) {
    echo "  [ID: {$c['id']}] {$c['name']} (slug: {$c['slug']}) - {$c['description']}\n";
}

echo "\n=======================================================\n";
echo "  CATEGORIES REMAPPED SUCCESSFULLY!\n";
echo "=======================================================\n";
