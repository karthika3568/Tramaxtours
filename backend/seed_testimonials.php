<?php

require_once __DIR__ . '/vendor/autoload.php';
$pdo = App\Utils\Database::getConnection();

$revCount = (int)$pdo->query("SELECT count(*) FROM reviews WHERE status = 'approved' AND deleted_at IS NULL")->fetchColumn();
if ($revCount < 3) {
    $reviews = [
        ['Customer 1', 'David & Sarah Jenkins', 'United Kingdom', 'Memorable South India Experience', 'The tour arrangements, private vehicle, and local guide in Kerala were exceptional.', 5],
        ['Customer 2', 'Elena Rostova', 'Germany', 'Pristine Temples & Tea Estates', 'Wonderer South India provided seamless transit and beautiful luxury homestays.', 5],
        ['Customer 3', 'Michael Chang', 'Singapore', 'Highly Professional Travel Desk', 'Prompt responses on WhatsApp and bespoke itinerary designed specifically for our family.', 5],
    ];

    $tourId = (int)$pdo->query("SELECT id FROM tours WHERE deleted_at IS NULL LIMIT 1")->fetchColumn();

    $stmt = $pdo->prepare("INSERT INTO reviews (tour_id, customer_name, customer_email, customer_country, rating, title, content, status, is_featured, created_at, updated_at) VALUES (:tour_id, :name, :email, :country, :rating, :title, :content, 'approved', 1, NOW(), NOW())");

    foreach ($reviews as $idx => $r) {
        $stmt->execute([
            ':tour_id' => $tourId ?: 7,
            ':name' => $r[1],
            ':email' => "guest{$idx}@wanderer.in",
            ':country' => $r[2],
            ':rating' => $r[5],
            ':title' => $r[3],
            ':content' => $r[4],
        ]);
    }
}

echo "Reviews count: " . $pdo->query("SELECT count(*) FROM reviews WHERE status = 'approved' AND deleted_at IS NULL")->fetchColumn() . "\n";
