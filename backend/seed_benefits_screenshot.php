<?php

require __DIR__ . '/vendor/autoload.php';
\App\Utils\Env::load(__DIR__ . '/.env');

use App\Utils\Database;

$db = Database::getConnection();

$benefits = [
    [
        'id' => 1,
        'title' => 'Discover the possibilities',
        'description' => 'With nearly half a million attractions, hotels & more, you’re sure to find joy.',
        'icon' => 'globe',
        'display_order' => 1,
    ],
    [
        'id' => 2,
        'title' => 'Enjoy deals & delights',
        'description' => 'Quality activities. Great prices. Plus, earn credits to save more.',
        'icon' => 'tag',
        'display_order' => 2,
    ],
    [
        'id' => 3,
        'title' => 'Exploring made easy',
        'description' => 'Book last minute, skip lines & get free cancellation for easier exploring.',
        'icon' => 'umbrella',
        'display_order' => 3,
    ],
    [
        'id' => 4,
        'title' => 'Travel you can trust',
        'description' => 'Read reviews & get reliable customer support. We\'re with you at every step.',
        'icon' => 'award',
        'display_order' => 4,
    ],
];

// Clean extra demo items
$db->exec('DELETE FROM home_benefits WHERE id > 4');

foreach ($benefits as $b) {
    $stmt = $db->prepare('SELECT id FROM home_benefits WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $b['id']]);
    if ($stmt->fetchColumn()) {
        $up = $db->prepare('UPDATE home_benefits SET title = :title, description = :desc, icon = :icon, display_order = :ord, status = "active", deleted_at = NULL WHERE id = :id');
        $up->execute([
            ':title' => $b['title'],
            ':desc' => $b['description'],
            ':icon' => $b['icon'],
            ':ord' => $b['display_order'],
            ':id' => $b['id'],
        ]);
    } else {
        $ins = $db->prepare('INSERT INTO home_benefits (id, title, description, icon, display_order, status, created_at, updated_at) VALUES (:id, :title, :desc, :icon, :ord, "active", NOW(), NOW())');
        $ins->execute([
            ':id' => $b['id'],
            ':title' => $b['title'],
            ':desc' => $b['description'],
            ':icon' => $b['icon'],
            ':ord' => $b['display_order'],
        ]);
    }
}

echo "Home benefits updated to match screenshot successfully!\n";
