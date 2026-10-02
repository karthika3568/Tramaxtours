<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Utils\Database;

$pdo = Database::getConnection();

// Check if destination exists
$destId = $pdo->query("SELECT id FROM destinations LIMIT 1")->fetchColumn();
if (!$destId) {
    $pdo->exec("INSERT INTO destinations (name, slug, short_description, status, display_order, created_at, updated_at) VALUES ('Kerala Backwaters & Munnar', 'kerala-backwaters-munnar', 'Scenic hill stations and tranquil backwaters of God\'s Own Country.', 'published', 1, NOW(), NOW())");
    $destId = $pdo->lastInsertId();
}

// Check if tour exists
$tourId = $pdo->query("SELECT id FROM tours LIMIT 1")->fetchColumn();
if (!$tourId) {
    $pdo->exec("INSERT INTO tours (destination_id, title, slug, short_description, overview, tour_type, duration_text, duration_hours, duration_days, base_price, currency, min_persons, max_persons, available_seats, total_seats, is_featured, display_order, status, created_at, updated_at) VALUES ({$destId}, '7-Day Kerala Highlights & Heritage Tour', '7-day-kerala-highlights-heritage-tour', 'Experience tea plantations, wildlife sanctuaries, and luxury houseboat cruises.', 'Comprehensive 7-day guided tour across Kerala with luxury accommodations.', 'multiday', '7 Days / 6 Nights', 168, 7, 750.00, 'EUR', 1, 12, 10, 12, 1, 1, 'published', NOW(), NOW())");
    $tourId = $pdo->lastInsertId();

    // Map to category
    $catId = $pdo->query("SELECT id FROM tour_categories WHERE slug = 'cultural-tour' OR slug = 'cultural-heritage-tours' LIMIT 1")->fetchColumn();
    if ($catId) {
        $pdo->exec("INSERT IGNORE INTO tour_category_map (tour_id, category_id) VALUES ({$tourId}, {$catId})");
    }
}

echo "Destination ID: {$destId}, Tour ID: {$tourId}\n";
