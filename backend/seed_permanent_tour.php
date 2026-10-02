<?php

require_once __DIR__ . '/vendor/autoload.php';
$pdo = App\Utils\Database::getConnection();

// 1. Ensure published destination
$dest = $pdo->query("SELECT id FROM destinations WHERE deleted_at IS NULL AND status = 'published' LIMIT 1")->fetch(PDO::FETCH_ASSOC);
if (!$dest) {
    $pdo->exec("INSERT INTO destinations (name, slug, short_description, status, display_order, created_at, updated_at) VALUES ('Kerala & Tamil Nadu Highlights', 'kerala-tamil-nadu-highlights', 'Scenic hill stations, temples, and tranquil backwaters.', 'published', 1, NOW(), NOW())");
    $destId = (int)$pdo->lastInsertId();
} else {
    $destId = (int)$dest['id'];
}

// 2. Ensure published tour
$tour = $pdo->query("SELECT id FROM tours WHERE deleted_at IS NULL AND status = 'published' LIMIT 1")->fetch(PDO::FETCH_ASSOC);
if (!$tour) {
    $pdo->exec("INSERT INTO tours (destination_id, title, slug, short_description, overview, tour_type, duration_text, duration_hours, duration_days, base_price, currency, min_persons, max_persons, available_seats, total_seats, is_featured, display_order, status, created_at, updated_at) VALUES ({$destId}, '7-Day South India Heritage & Hill Stations Tour', '7-day-south-india-heritage-hill-stations-tour', 'Experience tea plantations, ancient heritage temples, and luxury backwater cruises.', 'Comprehensive 7-day guided tour across Tamil Nadu & Kerala with luxury accommodations.', 'multiday', '7 Days / 6 Nights', 168, 7, 750.00, 'EUR', 1, 12, 10, 12, 1, 1, 'published', NOW(), NOW())");
    $tourId = (int)$pdo->lastInsertId();

    $catId = (int)$pdo->query("SELECT id FROM tour_categories WHERE slug = 'cultural-tour' OR slug = 'cultural-heritage-tours' LIMIT 1")->fetchColumn();
    if ($catId) {
        $pdo->exec("INSERT IGNORE INTO tour_category_map (tour_id, category_id) VALUES ({$tourId}, {$catId})");
    }
}

echo "Published Tour and Destination successfully seeded.\n";
