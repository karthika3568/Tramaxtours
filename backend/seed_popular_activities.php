<?php

require __DIR__ . '/vendor/autoload.php';
\App\Utils\Env::load(__DIR__ . '/.env');

use App\Utils\Database;
use App\Models\Destination;
use App\Models\Tour;
use App\Models\Media;

$db = Database::getConnection();

// Ensure destinations exist for Mahabalipuram, Kanchipuram, Pondicherry, Chennai
$destSpecs = [
    ['name' => 'Mahabalipuram', 'slug' => 'mahabalipuram', 'hero' => 'Monolithic Shore Temples & Rock Carvings', 'image' => 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=900&auto=format&fit=crop&q=80'],
    ['name' => 'Kanchipuram', 'slug' => 'kanchipuram', 'hero' => 'City of Thousand Golden Temples & Silk Heritage', 'image' => 'https://images.unsplash.com/photo-1600100397608-f010e47f2597?w=900&auto=format&fit=crop&q=80'],
    ['name' => 'Pondicherry (Puducherry)', 'slug' => 'pondicherry', 'hero' => 'French Quarters, Matrimandir & Promenade Beaches', 'image' => 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=900&auto=format&fit=crop&q=80'],
    ['name' => 'Chennai', 'slug' => 'chennai', 'hero' => 'Colonial Heritage, Marina Coast & Cultural Capital', 'image' => 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=900&auto=format&fit=crop&q=80'],
];

$destIds = [];
foreach ($destSpecs as $ds) {
    $stmt = $db->prepare('SELECT id FROM destinations WHERE slug = :slug LIMIT 1');
    $stmt->execute([':slug' => $ds['slug']]);
    $existing = $stmt->fetchColumn();

    if ($existing) {
        $destIds[$ds['slug']] = (int) $existing;
    } else {
        $mId = Media::create([
            'filename' => $ds['slug'] . '_cover.jpg',
            'original_name' => $ds['name'] . '_cover.jpg',
            'file_path' => $ds['image'],
            'file_size' => 450000,
            'mime_type' => 'image/jpeg',
            'alt_text' => $ds['name'] . ' scenic heritage',
        ]);

        $dId = Destination::create([
            'name' => $ds['name'],
            'slug' => $ds['slug'],
            'hero_title' => $ds['hero'],
            'short_description' => "Discover {$ds['name']} with our tours.",
            'featured_image_id' => $mId,
            'is_featured' => 1,
            'display_order' => 1,
            'status' => 'published',
        ]);
        $destIds[$ds['slug']] = $dId;
    }
}

// Ensure Pilgrimage / Temple Tours category exists if wanted
$checkCat = $db->query('SELECT id FROM tour_categories WHERE slug = "pilgrimage-temple-tours"')->fetchColumn();
if (!$checkCat) {
    $db->exec('INSERT INTO tour_categories (name, slug, description, badge_color, display_order, created_at, updated_at) VALUES ("Pilgrimage / Temple Tours", "pilgrimage-temple-tours", "Spiritual sanctums and ancient living temples", "#01aa90", 9, NOW(), NOW())');
}

$allCats = $db->query('SELECT id, name, slug FROM tour_categories')->fetchAll(PDO::FETCH_ASSOC);
$catMap = [];
foreach ($allCats as $c) {
    $catMap[$c['name']] = (int) $c['id'];
    $catMap[$c['slug']] = (int) $c['id'];
}

// Popular Activities Tours from Screenshot
$popularTours = [
    [
        'title' => 'Mahabalipuram Day Tour',
        'slug' => 'mahabalipuram-day-tour',
        'dest_slug' => 'mahabalipuram',
        'image' => 'uploads/media/demo_tamilnadu_mahabalipuram.jpg',
        'rating' => 0.0,
        'reviews_count' => 0,
        'price' => 45,
        'duration_days' => 1,
        'duration_text' => '1 Day (8 Hours)',
        'categories' => [
            'City Sightseeing Tours',
            'Cultural & Heritage Tours',
            'Guided Tours',
            'Historical Tours',
            'One Day Tours',
            'Private Tours',
        ],
    ],
    [
        'title' => 'Kanchipuram Day Tour',
        'slug' => 'kanchipuram-day-tour',
        'dest_slug' => 'kanchipuram',
        'image' => 'uploads/media/demo_tamilnadu_kanchipuram.jpg',
        'rating' => 0.0,
        'reviews_count' => 0,
        'price' => 49,
        'duration_days' => 1,
        'duration_text' => '1 Day (9 Hours)',
        'categories' => [
            'Cultural & Heritage Tours',
            'Guided Tours',
            'One Day Tours',
            'Pilgrimage / Temple Tours',
            'Private Tours',
        ],
    ],
    [
        'title' => 'PONDICHERRY DAY TOUR',
        'slug' => 'pondicherry-day-tour',
        'dest_slug' => 'pondicherry',
        'image' => 'uploads/media/demo_tamilnadu_pondicherry.jpg',
        'rating' => 0.0,
        'reviews_count' => 0,
        'price' => 65,
        'duration_days' => 1,
        'duration_text' => '1 Day (12 Hours)',
        'categories' => [
            'City Sightseeing Tours',
            'Cultural & Heritage Tours',
            'Guided Tours',
            'One Day Tours',
            'Private Tours',
        ],
    ],
    [
        'title' => 'Chennai Day Tour',
        'slug' => 'chennai-day-tour',
        'dest_slug' => 'chennai',
        'image' => 'uploads/media/demo_tamilnadu_chennai.jpg',
        'rating' => 5.0,
        'reviews_count' => 1,
        'price' => 39,
        'duration_days' => 1,
        'duration_text' => '1 Day (8 Hours)',
        'categories' => [
            'City Sightseeing Tours',
            'Cultural & Heritage Tours',
            'Family Tours',
            'Guided Tours',
            'One Day Tours',
            'Private Tours',
        ],
    ],
];

foreach ($popularTours as $index => $pt) {
    $destId = $destIds[$pt['dest_slug']] ?? 1;

    $mId = Media::create([
        'filename' => $pt['slug'] . '_img.jpg',
        'original_name' => $pt['title'] . '.jpg',
        'file_path' => $pt['image'],
        'file_size' => 500000,
        'mime_type' => 'image/jpeg',
        'alt_text' => $pt['title'],
    ]);

    $catIdsToSync = [];
    foreach ($pt['categories'] as $cName) {
        if (!empty($catMap[$cName])) {
            $catIdsToSync[] = $catMap[$cName];
        }
    }

    $existingTour = $db->prepare('SELECT id FROM tours WHERE slug = :slug LIMIT 1');
    $existingTour->execute([':slug' => $pt['slug']]);
    $tId = $existingTour->fetchColumn();

    if ($tId) {
        $updateStmt = $db->prepare('UPDATE tours SET title = :title, destination_id = :did, featured_image_id = :fi, base_price = :pr, duration_days = :dd, duration_text = :dt, is_featured = 1, display_order = :ord, status = "published", deleted_at = NULL WHERE id = :id');
        $updateStmt->execute([
            ':title' => $pt['title'],
            ':did' => $destId,
            ':fi' => $mId,
            ':pr' => $pt['price'],
            ':dd' => $pt['duration_days'],
            ':dt' => $pt['duration_text'],
            ':ord' => $index + 1,
            ':id' => $tId,
        ]);
        Tour::syncCategories((int) $tId, $catIdsToSync);
        echo "Updated Tour: {$pt['title']} (ID: {$tId})\n";
    } else {
        $newTourId = Tour::create([
            'title' => $pt['title'],
            'slug' => $pt['slug'],
            'destination_id' => $destId,
            'tour_type' => 'day-tour',
            'short_description' => "Private day excursion covering the iconic landmarks and cultural gems of {$pt['dest_slug']}.",
            'overview' => "Enjoy a seamless private air-conditioned vehicle with expert chauffeur guide exploring top historical monuments and photo spots.",
            'duration_days' => $pt['duration_days'],
            'duration_text' => $pt['duration_text'],
            'base_price' => $pt['price'],
            'currency' => 'USD',
            'featured_image_id' => $mId,
            'is_featured' => 1,
            'display_order' => $index + 1,
            'status' => 'published',
        ], $catIdsToSync);
        echo "Created Tour: {$pt['title']} (ID: {$newTourId})\n";
    }
}

echo "Popular Activities tours seeded successfully!\n";
