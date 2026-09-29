<?php

require_once __DIR__ . '/vendor/autoload.php';
\App\Utils\Env::load(__DIR__ . '/.env');

use App\Utils\Database;

$pdo = Database::getConnection();

echo "Seeding the 4 official destinations with exact Seasonal Activities accordion content...\n";

$destinations = [
    [
        'name' => 'Tamil Nadu',
        'slug' => 'tamil-nadu',
        'hero_title' => 'Tamil Nadu',
        'hero_subtitle' => 'Discover Tamil Nadu with our tours.',
        'short_description' => 'Discover Tamil Nadu with our tours. Explore ancient Dravidian temples, UNESCO heritage monuments, hill stations, and vibrant cultural arts.',
        'intro_label' => 'Tamil Nadu is ancient, Tamil Nadu is eternal',
        'intro_heading' => 'History of the Land of Temples & Timeless Culture',
        'intro_content' => "Tamil Nadu is one of the world’s oldest living civilizations, with a history that stretches back over 5,000 years. Renowned for its classical heritage, the region flourished under powerful dynasties such as the Cholas, Cheras, Pandyas, Pallavas, and Vijayanagara rulers, who shaped South India through monumental architecture, literature, trade, and spiritual traditions.\n\nThe state is celebrated as the Land of Temples, home to magnificent Dravidian marvels like Brihadeeswarar Temple, Meenakshi Amman Temple, Shore Temple, and Ekambareswarar Temple. Beyond architecture, Tamil Nadu is the birthplace of Tamil language, one of the oldest classical languages in the world, and a vibrant center for Bharatanatyam, Carnatic music, silk weaving, bronze sculptures, and spiritual philosophy. Today, Tamil Nadu seamlessly blends ancient traditions with modern life, offering travelers a deeply enriching cultural journey.",
        'language' => 'English / Tamil',
        'currency' => 'Indian Rupee (INR)',
        'religion' => 'Hinduism / Christianity / Islam',
        'heritage' => 'UNESCO World Heritage Sites',
        'timezone' => 'GMT +5:30',
        'is_featured' => 1,
        'display_order' => 1,
        'status' => 'published',
        'featured_img_path' => 'uploads/media/demo_home_tamilnadu.jpg',
        'intro_img_path' => 'uploads/media/demo_tamilnadu_mahabalipuram.jpg',
        'seasonal' => [
            [
                'title' => 'Best Time to Visit Tamil Nadu',
                'content' => 'Tamil Nadu can be explored throughout the year, but the most pleasant season is from October to March, when the climate is ideal for temple visits, heritage walks, hill stations, and coastal sightseeing.',
                'image' => 'uploads/media/demo_tamilnadu_chennai.jpg'
            ],
            [
                'title' => 'Comfortable Private Sightseeing',
                'content' => 'Explore Tamil Nadu comfortably with private, chauffeur-driven vehicles designed for flexible sightseeing across temples, heritage landmarks, cities, hill stations, and coastal destinations.',
                'image' => 'uploads/media/demo_tamilnadu_pondicherry.jpg'
            ],
            [
                'title' => 'Cultural & Heritage Experiences',
                'content' => 'Experience Tamil Nadu through its magnificent temples, UNESCO heritage landmarks, classical Tamil culture, Bharatanatyam, Carnatic music, traditional cuisine, silk weaving, and historic architecture.',
                'image' => 'uploads/media/demo_tamilnadu_thanjavur.jpg'
            ],
            [
                'title' => 'Flexible Tours Across All Seasons',
                'content' => 'Tamil Nadu offers flexible travel experiences throughout the year, allowing travelers to combine cultural heritage, temple visits, beaches, hill stations, wildlife, and local experiences according to the season.',
                'image' => 'uploads/media/demo_tamilnadu_madurai.jpg'
            ],
        ],
    ],
    [
        'name' => 'Kerala',
        'slug' => 'kerala',
        'hero_title' => 'Kerala',
        'hero_subtitle' => 'Discover Kerala with our tours.',
        'short_description' => 'Discover Kerala with our tours. Tranquil emerald backwaters, tea plantation hills in Munnar, Ayurvedic wellness, and tropical beaches.',
        'intro_label' => 'God’s Own Country — Nature, Backwaters & Wellness',
        'intro_heading' => 'Enchanting Palm Groves, Spice Hills & Serene Waters',
        'intro_content' => "Kerala is a tropical paradise acclaimed worldwide for its tranquil emerald backwaters, misty Western Ghat hill stations, pristine Arabian Sea coastlines, and ancient Ayurvedic healing traditions.\n\nFlourishing through centuries of spice trade with Arab, Roman, and European mariners, Kerala offers an exquisite tapestry of Kathakali dance, temple festivals, tea plantations, and backwater houseboats. From the rolling hills of Munnar to the palm-fringed canals of Alleppey and the vibrant spice markets of Fort Kochi, Kerala offers a serene rejuvenation of mind, body, and soul.",
        'language' => 'English / Malayalam',
        'currency' => 'Indian Rupee (INR)',
        'religion' => 'Hinduism / Christianity / Islam',
        'heritage' => 'Backwaters / Western Ghats / Cultural Heritage',
        'timezone' => 'GMT +5:30',
        'is_featured' => 1,
        'display_order' => 2,
        'status' => 'published',
        'featured_img_path' => 'uploads/media/demo_home_kerala.jpg',
        'intro_img_path' => 'uploads/media/demo_carousel_kerala.jpg',
        'seasonal' => [
            [
                'title' => 'Best Time to Visit Kerala',
                'content' => 'The ideal season to explore Kerala is between September and March for cool, pleasant backwater cruises and sightseeing, while June to August offers the best climate for traditional Ayurvedic wellness therapies and lush monsoon landscapes.',
                'image' => 'uploads/media/demo_kerala_alappuzha.jpg'
            ],
            [
                'title' => 'Comfortable Private Sightseeing',
                'content' => 'Travel effortlessly across Kerala in private, air-conditioned chauffeur-driven vehicles with dedicated local driver-guides, providing seamless transfers between Kochi, Munnar, Thekkady, Alleppey, and Kovalam.',
                'image' => 'uploads/media/demo_kerala_munnar.jpg'
            ],
            [
                'title' => 'Backwaters & Nature Experiences',
                'content' => 'Cruise along tranquil palm-fringed backwaters aboard authentic luxury houseboats in Alleppey and Kumarakom, walk through fragrant tea and spice plantations in Munnar, and explore Periyar Lake wildlife sanctuaries.',
                'image' => 'uploads/media/demo_kerala_nationalparks.jpg'
            ],
            [
                'title' => 'Cultural & Heritage Experiences',
                'content' => 'Immerse yourself in Kerala’s rich living heritage with live Kathakali dance dramas, Kalaripayattu martial arts, historic colonial architecture in Fort Kochi, and vibrant temple festivals.',
                'image' => 'uploads/media/demo_kerala_cochin.jpg'
            ],
            [
                'title' => 'Flexible Tours Across All Seasons',
                'content' => 'Kerala tours are customizable for every season, offering relaxing backwater retreats, high-altitude hill station escapes, tropical beach getaways, and holistic Ayurvedic rejuvenation all year round.',
                'image' => 'uploads/media/demo_kerala_varkala.jpg'
            ],
        ],
    ],
    [
        'name' => 'Karnataka',
        'slug' => 'karnataka',
        'hero_title' => 'Karnataka',
        'hero_subtitle' => 'Discover Karnataka with our tours.',
        'short_description' => 'Discover Karnataka with our tours. Regal palaces of Mysore, UNESCO ruins of Hampi, lush coffee estates in Coorg, and rich wildlife sanctuaries.',
        'intro_label' => 'One State, Many Worlds',
        'intro_heading' => 'Royal Palaces, Ancient Hampi & Coffee Mist Hills',
        'intro_content' => "Karnataka is a mesmerizing land of royal opulence and UNESCO architectural treasures. Home to the legendary Vijayanagara Empire capital of Hampi, the stone-carved temples of Belur and Halebidu, the regal Mysore Palace, and aromatic coffee hills of Coorg and Chikmagalur.\n\nKarnataka seamlessly bridges historic grandeur with lush wildlife national parks and vibrant cultural life. Experience royal heritage, wildlife safaris in Bandipur and Nagarhole, and breathtaking waterfalls cascading down the Western Ghats.",
        'language' => 'English / Kannada',
        'currency' => 'Indian Rupee (INR)',
        'religion' => 'Hinduism / Christianity / Islam / Jainism',
        'heritage' => 'Hampi / Mysore / Historic Heritage',
        'timezone' => 'GMT +5:30',
        'is_featured' => 1,
        'display_order' => 3,
        'status' => 'published',
        'featured_img_path' => 'uploads/media/demo_home_karnataka.jpg',
        'intro_img_path' => 'uploads/media/demo_carousel_karnataka.jpg',
        'seasonal' => [
            [
                'title' => 'Best Time to Visit Karnataka',
                'content' => 'October to April provides the most pleasant and dry weather for exploring the UNESCO ruins of Hampi, the regal palaces of Mysore, wildlife safaris, and the cool coffee hills of Coorg.',
                'image' => 'uploads/media/demo_karnataka_hampi.jpg'
            ],
            [
                'title' => 'Comfortable Private Sightseeing',
                'content' => 'Discover Karnataka with private sanitized chauffeur-driven vehicles, ensuring comfortable travel across historic temple circuits, royal heritage cities, wildlife reserves, and scenic Western Ghats destinations.',
                'image' => 'uploads/media/demo_karnataka_mysore.jpg'
            ],
            [
                'title' => 'Heritage & Historical Experiences',
                'content' => 'Marvel at the illuminated grandeur of Mysore Palace, walk through the ancient boulder-strewn monuments of the Vijayanagara Empire in Hampi, and admire the stone carvings of Belur and Halebidu.',
                'image' => 'uploads/media/demo_karnataka_bangalore.jpg'
            ],
            [
                'title' => 'Nature & Wildlife Experiences',
                'content' => 'Embark on thrilling Jeep safaris in Nagarhole and Bandipur National Parks to spot wild tigers and Asian elephants, and stay in serene coffee estate homestays amidst the misty hills of Coorg and Chikmagalur.',
                'image' => 'uploads/media/demo_karnataka_coorg.jpg'
            ],
            [
                'title' => 'Flexible Tours Across All Seasons',
                'content' => 'Karnataka offers varied travel experiences in every season, from winter heritage tours and wildlife expeditions to lush monsoon waterfall journeys and year-round coffee plantation retreats.',
                'image' => 'uploads/media/demo_karnataka_nationalparks.jpg'
            ],
        ],
    ],
    [
        'name' => 'Goa',
        'slug' => 'goa',
        'hero_title' => 'Goa',
        'hero_subtitle' => 'Discover Goa with our tours.',
        'short_description' => 'Discover Goa with our tours. Sun-kissed beaches, UNESCO Portuguese cathedrals, spice plantations, and serene river cruises.',
        'intro_label' => 'Sun, Sand, Spice & Portuguese Heritage',
        'intro_heading' => 'Golden Beaches, Baroque Cathedrals & Vibrant Coastlines',
        'intro_content' => "Goa is India’s most celebrated coastal haven, blessed with sun-drenched Arabian Sea beaches, UNESCO World Heritage Baroque churches of Old Goa, spice plantations, and historic Portuguese mansions.\n\nOffering a unique fusion of Indian hospitality and European charm, Goa provides unforgettable beachside relaxation, heritage walks, river cruises, and flavorful coastal dining.",
        'language' => 'English / Konkani',
        'currency' => 'Indian Rupee (INR)',
        'religion' => 'Christianity / Hinduism',
        'heritage' => 'Portuguese & Coastal Heritage',
        'timezone' => 'GMT +5:30',
        'is_featured' => 1,
        'display_order' => 4,
        'status' => 'published',
        'featured_img_path' => 'uploads/media/demo_home_goa.jpg',
        'intro_img_path' => 'uploads/media/demo_carousel_goa.jpg',
        'seasonal' => [
            [
                'title' => 'Best Time to Visit Goa',
                'content' => 'November to March is the peak season with sunny tropical skies, warm waters, and vibrant beach shacks, while June to September offers lush green landscapes and tranquil romantic monsoon getaways.',
                'image' => 'uploads/media/demo_goa_beach_2.jpg'
            ],
            [
                'title' => 'Comfortable Private Sightseeing',
                'content' => 'Explore North and South Goa in comfort with private air-conditioned vehicles, tailored for hassle-free sightseeing across historic forts, pristine beaches, spice plantations, and Portuguese quarters.',
                'image' => 'uploads/media/demo_goa_margoa.jpg'
            ],
            [
                'title' => 'Beaches & Coastal Experiences',
                'content' => 'Relax on sun-kissed golden sand beaches from lively Baga and Calangute to serene South Goa havens like Palolem and Morjim, enjoy thrilling watersports, and take sunset cruises along the Mandovi River.',
                'image' => 'uploads/media/demo_goa_beaches.jpg'
            ],
            [
                'title' => 'Cultural & Heritage Experiences',
                'content' => 'Discover Goa’s rich Indo-Portuguese heritage with visits to the UNESCO Baroque churches of Old Goa including Basilica of Bom Jesus and Se Cathedral, historic Fort Aguada, and the colorful Latin Quarter of Fontainhas.',
                'image' => 'uploads/media/demo_goa_oldgoa.jpg'
            ],
            [
                'title' => 'Flexible Tours Across All Seasons',
                'content' => 'Goa offers versatile travel opportunities throughout the year, from vibrant winter beach holidays and heritage sightseeing to peaceful off-season wellness retreats and spice plantation excursions.',
                'image' => 'uploads/media/demo_goa_culture.jpg'
            ],
        ],
    ],
];

function getOrCreateMedia($pdo, $filePath, $title) {
    $stmt = $pdo->prepare("SELECT id FROM media WHERE file_path = ? OR filename = ? LIMIT 1");
    $stmt->execute([$filePath, basename($filePath)]);
    $id = $stmt->fetchColumn();
    if ($id) return (int)$id;

    $ins = $pdo->prepare("INSERT INTO media (filename, original_name, file_path, mime_type, file_size, alt_text, created_at, updated_at) VALUES (?, ?, ?, 'image/jpeg', 102400, ?, NOW(), NOW())");
    $ins->execute([basename($filePath), basename($filePath), $filePath, $title]);
    return (int)$pdo->lastInsertId();
}

$validSlugs = array_map(fn($d) => $d['slug'], $destinations);
$inClause = "'" . implode("', '", $validSlugs) . "'";

// Remap tours from deleted destinations to Tamil Nadu
$pdo->query("UPDATE tours SET destination_id = (SELECT id FROM destinations WHERE slug = 'tamil-nadu' LIMIT 1) WHERE destination_id IN (SELECT id FROM destinations WHERE slug NOT IN ($inClause))");

// Delete other destinations
$pdo->query("DELETE FROM destinations WHERE slug NOT IN ($inClause)");

foreach ($destinations as $dest) {
    $featuredMediaId = getOrCreateMedia($pdo, $dest['featured_img_path'], $dest['name'] . ' Hero');
    $introMediaId = getOrCreateMedia($pdo, $dest['intro_img_path'], $dest['name'] . ' Intro');

    $stmt = $pdo->prepare("SELECT id FROM destinations WHERE slug = ? LIMIT 1");
    $stmt->execute([$dest['slug']]);
    $existingId = $stmt->fetchColumn();

    if ($existingId) {
        $upd = $pdo->prepare("
            UPDATE destinations SET
                name = ?, hero_title = ?, hero_subtitle = ?, short_description = ?,
                intro_label = ?, intro_heading = ?, intro_content = ?,
                language = ?, currency = ?, religion = ?, heritage = ?, timezone = ?,
                featured_image_id = ?, intro_media_id = ?,
                is_featured = ?, display_order = ?, status = 'published',
                deleted_at = NULL, updated_at = NOW()
            WHERE id = ?
        ");
        $upd->execute([
            $dest['name'], $dest['hero_title'], $dest['hero_subtitle'], $dest['short_description'],
            $dest['intro_label'], $dest['intro_heading'], $dest['intro_content'],
            $dest['language'], $dest['currency'], $dest['religion'], $dest['heritage'], $dest['timezone'],
            $featuredMediaId, $introMediaId,
            $dest['is_featured'], $dest['display_order'],
            $existingId
        ]);
        $destId = (int)$existingId;
    } else {
        $ins = $pdo->prepare("
            INSERT INTO destinations (
                name, slug, hero_title, hero_subtitle, short_description,
                intro_label, intro_heading, intro_content,
                language, currency, religion, heritage, timezone,
                featured_image_id, intro_media_id,
                is_featured, display_order, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', NOW(), NOW())
        ");
        $ins->execute([
            $dest['name'], $dest['slug'], $dest['hero_title'], $dest['hero_subtitle'], $dest['short_description'],
            $dest['intro_label'], $dest['intro_heading'], $dest['intro_content'],
            $dest['language'], $dest['currency'], $dest['religion'], $dest['heritage'], $dest['timezone'],
            $featuredMediaId, $introMediaId,
            $dest['is_featured'], $dest['display_order']
        ]);
        $destId = (int)$pdo->lastInsertId();
    }

    // Insert Seasonal Activities accordion (destination_sections, section_type = seasonal_activities)
    $pdo->prepare("DELETE FROM destination_sections WHERE destination_id = ? AND section_type = 'seasonal_activities'")->execute([$destId]);
    $sectionStmt = $pdo->prepare("INSERT INTO destination_sections (destination_id, section_type, title, content, media_id, display_order, status, created_at, updated_at) VALUES (?, 'seasonal_activities', ?, ?, ?, ?, 'active', NOW(), NOW())");
    foreach ($dest['seasonal'] as $idx => $item) {
        $seasonalMediaId = getOrCreateMedia($pdo, $item['image'], $dest['name'] . ' — ' . $item['title']);
        $sectionStmt->execute([$destId, $item['title'], $item['content'], $seasonalMediaId, $idx + 1]);
    }

    echo " [OK] Seeded {$dest['name']} (ID: $destId) with " . count($dest['seasonal']) . " Seasonal Activities\n";
}

echo "Successfully seeded the 4 official destinations.\n";
