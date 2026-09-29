<?php
// Dev fixture: seeds a handful of real tours per destination so the destination
// detail page's "Tours in <Destination>" section has real data to render.
// Idempotent — safe to re-run (matches on slug).

require_once __DIR__ . '/vendor/autoload.php';
\App\Utils\Env::load(__DIR__ . '/.env');

use App\Utils\Database;
use App\Models\Tour;

$pdo = Database::getConnection();

function getOrCreateMedia(PDO $pdo, string $filePath, string $title): int
{
    $stmt = $pdo->prepare('SELECT id FROM media WHERE file_path = ? LIMIT 1');
    $stmt->execute([$filePath]);
    $id = $stmt->fetchColumn();
    if ($id) {
        return (int) $id;
    }

    $ins = $pdo->prepare("INSERT INTO media (filename, original_name, file_path, mime_type, file_size, alt_text, created_at, updated_at) VALUES (?, ?, ?, 'image/jpeg', 102400, ?, NOW(), NOW())");
    $ins->execute([basename($filePath), basename($filePath), $filePath, $title]);
    return (int) $pdo->lastInsertId();
}

function destinationId(PDO $pdo, string $slug): ?int
{
    $stmt = $pdo->prepare('SELECT id FROM destinations WHERE slug = ? LIMIT 1');
    $stmt->execute([$slug]);
    $id = $stmt->fetchColumn();
    return $id ? (int) $id : null;
}

function categoryIds(PDO $pdo, array $slugs): array
{
    if (empty($slugs)) {
        return [];
    }
    $placeholders = implode(',', array_fill(0, count($slugs), '?'));
    $stmt = $pdo->prepare("SELECT id FROM tour_categories WHERE slug IN ($placeholders)");
    $stmt->execute($slugs);
    return array_map('intval', $stmt->fetchAll(PDO::FETCH_COLUMN));
}

$tours = [
    // Tamil Nadu
    [
        'destination_slug' => 'tamil-nadu',
        'title' => 'Mahabalipuram Day Tour',
        'slug' => 'mahabalipuram-day-tour',
        'short_description' => 'Explore the UNESCO Shore Temple, Pancha Rathas, and the giant Arjuna\'s Penance rock relief on a private guided day trip from Chennai.',
        'overview' => "Mahabalipuram (Mamallapuram) is one of the most significant archaeological sites in South India, carved by the Pallava dynasty over 1,300 years ago. This private, air-conditioned day tour takes you through the Shore Temple, the monolithic Pancha Rathas, and the dramatic open-air relief of Arjuna's Penance, with a knowledgeable guide narrating the mythology and craftsmanship behind each monument.",
        'tour_type' => 'Private Day Tour',
        'duration_text' => 'Full Day (8 hours)',
        'duration_days' => 1,
        'base_price' => 65.00,
        'currency' => 'EUR',
        'min_persons' => 1,
        'max_persons' => 12,
        'is_featured' => 1,
        'image' => 'demo_tamilnadu_mahabalipuram.jpg',
        'categories' => ['cultural-heritage-tours', 'historical-tours'],
    ],
    [
        'destination_slug' => 'tamil-nadu',
        'title' => 'Kanchipuram Temple Tour',
        'slug' => 'kanchipuram-temple-tour',
        'short_description' => 'Visit the "City of a Thousand Temples" and see master silk weavers at work in this half-day cultural excursion.',
        'overview' => "Kanchipuram, one of the seven sacred cities of Hinduism, is renowned for its Dravidian temple architecture and centuries-old silk-weaving tradition. This guided tour covers the Ekambareswarar and Kailasanathar temples and a working handloom workshop, offering an intimate look at Tamil Nadu's living cultural heritage.",
        'tour_type' => 'Guided Tour',
        'duration_text' => 'Half Day (4 hours)',
        'duration_days' => 1,
        'base_price' => 45.00,
        'currency' => 'EUR',
        'min_persons' => 1,
        'max_persons' => 12,
        'is_featured' => 0,
        'image' => 'demo_tamilnadu_kanchipuram.jpg',
        'categories' => ['cultural-heritage-tours', 'guided-tours'],
    ],
    [
        'destination_slug' => 'tamil-nadu',
        'title' => 'Madurai Heritage Walk',
        'slug' => 'madurai-heritage-walk',
        'short_description' => 'Discover the towering gopurams of Meenakshi Amman Temple and the bustling flower and spice markets of Madurai.',
        'overview' => "Madurai is one of the oldest continuously inhabited cities in the world and home to the magnificent Meenakshi Amman Temple, with its 14 painted gopurams. This tour combines a guided temple visit with a walk through Madurai's historic markets and the Thirumalai Nayakkar Palace.",
        'tour_type' => 'City Sightseeing',
        'duration_text' => 'Full Day (7 hours)',
        'duration_days' => 1,
        'base_price' => 55.00,
        'currency' => 'EUR',
        'min_persons' => 1,
        'max_persons' => 12,
        'is_featured' => 0,
        'image' => 'demo_tamilnadu_madurai.jpg',
        'categories' => ['city-sightseeing-tours', 'cultural-heritage-tours'],
    ],
    // Kerala
    [
        'destination_slug' => 'kerala',
        'title' => 'Munnar Tea Hills Tour',
        'slug' => 'munnar-tea-hills-tour',
        'short_description' => 'Wind through emerald tea plantations and misty Western Ghats hill country on this scenic Munnar excursion.',
        'overview' => "Munnar's rolling tea estates sit over 1,600 metres above sea level in the Western Ghats. This tour visits working tea gardens, a tea museum, and scenic viewpoints over the plantation valleys, with a private chauffeur-guide throughout.",
        'tour_type' => 'Private Day Tour',
        'duration_text' => 'Full Day (8 hours)',
        'duration_days' => 1,
        'base_price' => 60.00,
        'currency' => 'EUR',
        'min_persons' => 1,
        'max_persons' => 10,
        'is_featured' => 1,
        'image' => 'demo_kerala_munnar.jpg',
        'categories' => ['adventure-nature-tours', 'private-tours'],
    ],
    [
        'destination_slug' => 'kerala',
        'title' => 'Alleppey Backwater Cruise',
        'slug' => 'alleppey-backwater-cruise',
        'short_description' => 'Glide through Kerala\'s palm-fringed backwaters on a traditional houseboat with a private chef and guide.',
        'overview' => "Alleppey's network of canals, lagoons, and paddy fields is best experienced from the deck of a traditional Kettuvallam houseboat. This cruise includes a home-style Kerala lunch prepared onboard and stops at village markets along the waterways.",
        'tour_type' => 'Cruise',
        'duration_text' => 'Full Day (6 hours)',
        'duration_days' => 1,
        'base_price' => 80.00,
        'currency' => 'EUR',
        'min_persons' => 2,
        'max_persons' => 8,
        'is_featured' => 0,
        'image' => 'demo_kerala_alappuzha.jpg',
        'categories' => ['adventure-nature-tours', 'family-tours'],
    ],
    [
        'destination_slug' => 'kerala',
        'title' => 'Fort Kochi Heritage Walk',
        'slug' => 'fort-kochi-heritage-walk',
        'short_description' => 'Stroll through Fort Kochi\'s Chinese fishing nets, colonial architecture, and spice markets on a guided walking tour.',
        'overview' => "Fort Kochi carries centuries of Portuguese, Dutch, and British influence alongside its Malabar trading heritage. This walking tour covers the iconic Chinese fishing nets, St. Francis Church, and the aromatic spice markets of Mattancherry.",
        'tour_type' => 'Guided Tour',
        'duration_text' => 'Half Day (4 hours)',
        'duration_days' => 1,
        'base_price' => 40.00,
        'currency' => 'EUR',
        'min_persons' => 1,
        'max_persons' => 12,
        'is_featured' => 0,
        'image' => 'demo_kerala_cochin.jpg',
        'categories' => ['cultural-heritage-tours', 'guided-tours'],
    ],
    // Karnataka
    [
        'destination_slug' => 'karnataka',
        'title' => 'Hampi Ruins Tour',
        'slug' => 'hampi-ruins-tour',
        'short_description' => 'Explore the UNESCO World Heritage ruins of the Vijayanagara Empire scattered across Hampi\'s boulder-strewn landscape.',
        'overview' => "Hampi's temples, royal enclosures, and market streets are the remains of one of the largest empires in Indian history. This tour covers the Virupaksha Temple, the Stone Chariot at Vittala Temple, and the Royal Enclosure with a specialist heritage guide.",
        'tour_type' => 'Historical Tour',
        'duration_text' => 'Full Day (8 hours)',
        'duration_days' => 1,
        'base_price' => 58.00,
        'currency' => 'EUR',
        'min_persons' => 1,
        'max_persons' => 12,
        'is_featured' => 1,
        'image' => 'demo_karnataka_hampi.jpg',
        'categories' => ['historical-tours', 'cultural-heritage-tours'],
    ],
    [
        'destination_slug' => 'karnataka',
        'title' => 'Mysore Palace & City Tour',
        'slug' => 'mysore-palace-city-tour',
        'short_description' => 'Tour the illuminated Mysore Palace and the city\'s bustling Devaraja Market on a private day trip.',
        'overview' => "Mysore Palace, seat of the former Wodeyar dynasty, is one of India's most visited royal residences. This tour includes a guided palace visit, the Chamundi Hills viewpoint, and a walk through Devaraja Market's spice and flower stalls.",
        'tour_type' => 'Private Day Tour',
        'duration_text' => 'Full Day (7 hours)',
        'duration_days' => 1,
        'base_price' => 55.00,
        'currency' => 'EUR',
        'min_persons' => 1,
        'max_persons' => 12,
        'is_featured' => 0,
        'image' => 'demo_karnataka_mysore.jpg',
        'categories' => ['city-sightseeing-tours', 'private-tours'],
    ],
    [
        'destination_slug' => 'karnataka',
        'title' => 'Coorg Coffee Estate Tour',
        'slug' => 'coorg-coffee-estate-tour',
        'short_description' => 'Walk through aromatic coffee and spice plantations in the misty hills of Coorg.',
        'overview' => "Known as the Scotland of India, Coorg's rolling hills are covered in coffee, cardamom, and pepper plantations. This tour includes a guided plantation walk, a coffee-tasting session, and views over the Western Ghats.",
        'tour_type' => 'Adventure & Nature',
        'duration_text' => 'Full Day (6 hours)',
        'duration_days' => 1,
        'base_price' => 62.00,
        'currency' => 'EUR',
        'min_persons' => 1,
        'max_persons' => 10,
        'is_featured' => 0,
        'image' => 'demo_karnataka_coorg.jpg',
        'categories' => ['adventure-nature-tours', 'one-day-tours'],
    ],
    // Goa
    [
        'destination_slug' => 'goa',
        'title' => 'Old Goa Churches Tour',
        'slug' => 'old-goa-churches-tour',
        'short_description' => 'Visit the UNESCO-listed Basilica of Bom Jesus and Se Cathedral, icons of Goa\'s Portuguese heritage.',
        'overview' => "Old Goa was once the capital of Portuguese India and remains home to some of Asia's finest examples of Baroque architecture. This tour covers the Basilica of Bom Jesus, Se Cathedral, and the ruins of St. Augustine's Tower.",
        'tour_type' => 'Historical Tour',
        'duration_text' => 'Half Day (4 hours)',
        'duration_days' => 1,
        'base_price' => 42.00,
        'currency' => 'EUR',
        'min_persons' => 1,
        'max_persons' => 12,
        'is_featured' => 1,
        'image' => 'demo_goa_oldgoa.jpg',
        'categories' => ['historical-tours', 'cultural-heritage-tours'],
    ],
    [
        'destination_slug' => 'goa',
        'title' => 'North Goa Beaches Tour',
        'slug' => 'north-goa-beaches-tour',
        'short_description' => 'Relax across Goa\'s most scenic beaches, from Baga to Vagator, with a private chauffeur-guide.',
        'overview' => "This tour strings together North Goa's most photogenic coastline, including Baga Beach, Fort Aguada, and the cliffside views at Vagator, with time to relax at beach shacks along the way.",
        'tour_type' => 'Private Day Tour',
        'duration_text' => 'Full Day (7 hours)',
        'duration_days' => 1,
        'base_price' => 50.00,
        'currency' => 'EUR',
        'min_persons' => 1,
        'max_persons' => 12,
        'is_featured' => 0,
        'image' => 'demo_goa_beach_1.jpg',
        'categories' => ['private-tours', 'family-tours'],
    ],
    [
        'destination_slug' => 'goa',
        'title' => 'Spice Plantation & River Cruise',
        'slug' => 'spice-plantation-river-cruise',
        'short_description' => 'Walk through an organic spice plantation and cruise the Mandovi River at sunset.',
        'overview' => "This half-day tour combines a guided walk through an organic spice and fruit plantation with a relaxed sunset cruise along the Mandovi River, a classic introduction to Goa beyond its beaches.",
        'tour_type' => 'Guided Tour',
        'duration_text' => 'Half Day (5 hours)',
        'duration_days' => 1,
        'base_price' => 48.00,
        'currency' => 'EUR',
        'min_persons' => 1,
        'max_persons' => 12,
        'is_featured' => 0,
        'image' => 'demo_goa_culture.jpg',
        'categories' => ['guided-tours', 'adventure-nature-tours'],
    ],
];

$mediaDir = 'uploads/media/';
$created = 0;
$skipped = 0;

foreach ($tours as $t) {
    $stmt = $pdo->prepare('SELECT id FROM tours WHERE slug = ? LIMIT 1');
    $stmt->execute([$t['slug']]);
    if ($stmt->fetchColumn()) {
        echo " [SKIP] {$t['title']} already exists\n";
        $skipped++;
        continue;
    }

    $destId = destinationId($pdo, $t['destination_slug']);
    if (!$destId) {
        echo " [ERROR] destination '{$t['destination_slug']}' not found for {$t['title']}\n";
        continue;
    }

    $imageId = getOrCreateMedia($pdo, $mediaDir . $t['image'], $t['title']);
    $catIds = categoryIds($pdo, $t['categories']);

    $tourId = Tour::create([
        'destination_id' => $destId,
        'title' => $t['title'],
        'slug' => $t['slug'],
        'short_description' => $t['short_description'],
        'overview' => $t['overview'],
        'tour_type' => $t['tour_type'],
        'duration_text' => $t['duration_text'],
        'duration_days' => $t['duration_days'],
        'languages' => 'English',
        'featured_image_id' => $imageId,
        'base_price' => $t['base_price'],
        'currency' => $t['currency'],
        'min_persons' => $t['min_persons'],
        'max_persons' => $t['max_persons'],
        'available_seats' => 20,
        'total_seats' => 20,
        'booking_deadline_days' => 1,
        'travel_days' => 'Daily',
        'is_featured' => $t['is_featured'],
        'display_order' => 0,
        'status' => 'published',
    ], $catIds);

    echo " [OK] Created {$t['title']} (ID: $tourId, destination: {$t['destination_slug']})\n";
    $created++;
}

echo "Done. Created: $created, Skipped: $skipped\n";
