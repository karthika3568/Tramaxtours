<?php

require_once __DIR__ . '/vendor/autoload.php';
\App\Utils\Env::load(__DIR__ . '/.env');

use App\Utils\Database;

$pdo = Database::getConnection();

echo "Seeding the 4 official destinations (Tamil Nadu, Kerala, Karnataka, Goa)...\n";

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
        'faqs' => [
            ['question' => 'Best Time to Visit Chennai & Tamil Nadu', 'answer' => 'Tamil Nadu can be explored throughout the year, but the most pleasant season is from October to March, when the climate is ideal for temple visits, heritage walks, hill stations, and coastal sightseeing.'],
            ['question' => 'Comfortable Private Sightseeing', 'answer' => 'Discover Tamil Nadu in comfort with private, air-conditioned transportation and a dedicated chauffeur guide, allowing flexible itineraries across cities, temples, hill stations, and coastal destinations at your own pace.'],
            ['question' => 'Cultural & Heritage Experiences', 'answer' => 'Experience the soul of South India through ancient temples, UNESCO heritage sites, classical arts, traditional villages, spiritual centers, and vibrant local festivals that reflect Tamil Nadu’s timeless identity.'],
            ['question' => 'Flexible Tour Across All Seasons', 'answer' => 'Tamil Nadu tours are available year-round, with itineraries customized to suit seasonal conditions, festival calendars, and traveler preferences—perfect for families, pilgrims, culture lovers, and explorers alike.'],
        ],
        'seasonal' => [
            ['title' => 'Best Time to Visit Chennai', 'content' => 'Tamil Nadu can be explored throughout the year, but the most pleasant season is from October to March, when the climate is ideal for temple visits, heritage walks, hill stations, and coastal sightseeing.', 'image' => 'uploads/media/demo_tamilnadu_chennai.jpg'],
            ['title' => 'Comfortable Private Sightseeing', 'content' => 'Discover Tamil Nadu in comfort with private, air-conditioned transportation and a dedicated chauffeur guide, allowing flexible itineraries across cities, temples, hill stations, and coastal destinations at your own pace.', 'image' => 'uploads/media/demo_tamilnadu_pondicherry.jpg'],
            ['title' => 'Cultural & Heritage Experiences', 'content' => 'Experience the soul of South India through ancient temples, UNESCO heritage sites, classical arts, traditional villages, spiritual centers, and vibrant local festivals that reflect Tamil Nadu’s timeless identity.', 'image' => 'uploads/media/demo_tamilnadu_thanjavur.jpg'],
            ['title' => 'Flexible Tours Across All Seasons', 'content' => 'Tamil Nadu tours are available year-round, with itineraries customized to suit seasonal conditions, festival calendars, and traveler preferences — perfect for families, pilgrims, culture lovers, and explorers alike.', 'image' => 'uploads/media/demo_tamilnadu_madurai.jpg'],
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
        'faqs' => [
            ['question' => 'Best Time to Visit Kerala', 'answer' => 'The ideal season to explore Kerala is between September and March for cool pleasant backwater cruises, and June to August for authentic monsoon Ayurvedic wellness therapies.'],
            ['question' => 'Private Houseboat & Chauffeur Safaris', 'answer' => 'Sail along serene backwaters in luxury air-conditioned houseboats with private chef and dedicated guide, complemented by private transfers across tea estates and coastal sanctuaries.'],
            ['question' => 'Spice Trails & Wildlife Safaris', 'answer' => 'Walk through fragrant cardamom, pepper, and vanilla plantations in Thekkady, and cruise Lake Periyar to view wild elephants, exotic birds, and tropical flora in their natural habitat.'],
            ['question' => 'Holistic Ayurveda & Classical Arts', 'answer' => 'Experience time-honored Ayurvedic rejuvenation treatments, witness dramatic Kathakali dance performances, and discover Kalaripayattu martial art demonstrations.'],
        ],
        'seasonal' => [
            ['title' => 'Best Time to Visit Kerala', 'content' => 'The ideal season to explore Kerala is between September and March for cool pleasant backwater cruises, and June to August for authentic monsoon Ayurvedic wellness therapies.', 'image' => 'uploads/media/demo_kerala_alappuzha.jpg'],
            ['title' => 'Private Houseboat & Chauffeur Safaris', 'content' => 'Sail along serene backwaters in luxury air-conditioned houseboats with private chef and dedicated guide, complemented by private transfers across tea estates and coastal sanctuaries.', 'image' => 'uploads/media/demo_kerala_munnar.jpg'],
            ['title' => 'Spice Trails & Wildlife Safaris', 'content' => 'Walk through fragrant cardamom, pepper, and vanilla plantations in Thekkady, and cruise Lake Periyar to view wild elephants, exotic birds, and tropical flora in their natural habitat.', 'image' => 'uploads/media/demo_kerala_nationalparks.jpg'],
            ['title' => 'Holistic Ayurveda & Classical Arts', 'content' => 'Experience time-honored Ayurvedic rejuvenation treatments, witness dramatic Kathakali dance performances, and discover Kalaripayattu martial art demonstrations.', 'image' => 'uploads/media/demo_kerala_cochin.jpg'],
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
        'faqs' => [
            ['question' => 'Best Time to Visit Karnataka', 'answer' => 'October to April provides cool, sunny weather perfect for exploring the rock-cut monuments of Hampi, Mysore Palace festivities, and wildlife safaris.'],
            ['question' => 'Royal Heritage & Architectural Wonders', 'answer' => 'Marvel at the illuminated Mysore Palace, explore the boulder-strewn ruins of the UNESCO Vijayanagara Empire in Hampi, and study the intricate Hoysala temple carvings.'],
            ['question' => 'Coffee Plantations & Nature Escapes', 'answer' => 'Immerse yourself in lush coffee and spice estates in Coorg and Chikmagalur, staying in luxury plantation bungalows with private nature walks.'],
            ['question' => 'Wildlife Safaris & Nature Sanctuaries', 'answer' => 'Embark on private guided Jeep safaris in Kabini and Bandipur Tiger Reserve to encounter wild Bengal tigers, leopards, and herds of Asian elephants.'],
        ],
        'seasonal' => [
            ['title' => 'Best Time to Visit Karnataka', 'content' => 'October to April provides cool, sunny weather perfect for exploring the rock-cut monuments of Hampi, Mysore Palace festivities, and wildlife safaris.', 'image' => 'uploads/media/demo_karnataka_hampi.jpg'],
            ['title' => 'Royal Heritage & Architectural Wonders', 'content' => 'Marvel at the illuminated Mysore Palace, explore the boulder-strewn ruins of the UNESCO Vijayanagara Empire in Hampi, and study the intricate Hoysala temple carvings.', 'image' => 'uploads/media/demo_karnataka_mysore.jpg'],
            ['title' => 'Coffee Plantations & Nature Escapes', 'content' => 'Immerse yourself in lush coffee and spice estates in Coorg and Chikmagalur, staying in luxury plantation bungalows with private nature walks.', 'image' => 'uploads/media/demo_karnataka_coorg.jpg'],
            ['title' => 'Wildlife Safaris & Nature Sanctuaries', 'content' => 'Embark on private guided Jeep safaris in Kabini and Bandipur Tiger Reserve to encounter wild Bengal tigers, leopards, and herds of Asian elephants.', 'image' => 'uploads/media/demo_karnataka_nationalparks.jpg'],
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
        'faqs' => [
            ['question' => 'Best Time to Visit Goa', 'answer' => 'November to March is the peak season with sunny skies, warm tropical waters, and vibrant seaside cafe culture.'],
            ['question' => 'Old Goa & UNESCO Baroque Churches', 'answer' => 'Visit the Basilica of Bom Jesus and Se Cathedral, showcasing magnificent 16th-century Portuguese architecture and sacred art.'],
            ['question' => 'Spice Plantations & Mandovi River Cruises', 'answer' => 'Take an aromatic walking tour through organic spice plantations followed by private sunset cruises along the Mandovi River.'],
            ['question' => 'Private Chauffeur Coastal Explorations', 'answer' => 'Travel in sanitized luxury private vehicles to explore hidden beaches in South Goa, historic forts like Fort Aguada and Chapora, and traditional Latin Quarter villas.'],
        ],
        'seasonal' => [
            ['title' => 'Best Time to Visit Goa', 'content' => 'November to March is the peak season with sunny skies, warm tropical waters, and vibrant seaside cafe culture.', 'image' => 'uploads/media/demo_goa_beach_2.jpg'],
            ['title' => 'Old Goa & UNESCO Baroque Churches', 'content' => 'Visit the Basilica of Bom Jesus and Se Cathedral, showcasing magnificent 16th-century Portuguese architecture and sacred art.', 'image' => 'uploads/media/demo_goa_oldgoa.jpg'],
            ['title' => 'Spice Plantations & Mandovi River Cruises', 'content' => 'Take an aromatic walking tour through organic spice plantations followed by private sunset cruises along the Mandovi River.', 'image' => 'uploads/media/demo_goa_culture.jpg'],
            ['title' => 'Private Chauffeur Coastal Explorations', 'content' => 'Travel in sanitized luxury private vehicles to explore hidden beaches in South Goa, historic forts like Fort Aguada and Chapora, and traditional Latin Quarter villas.', 'image' => 'uploads/media/demo_goa_margoa.jpg'],
        ],
    ],
];

// Helper to get or insert media
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

// Remap any tours pointing to other destinations to Tamil Nadu
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

    // Insert FAQs
    $pdo->prepare("DELETE FROM destination_faqs WHERE destination_id = ?")->execute([$destId]);
    $faqStmt = $pdo->prepare("INSERT INTO destination_faqs (destination_id, question, answer, display_order, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'published', NOW(), NOW())");
    foreach ($dest['faqs'] as $idx => $faq) {
        $faqStmt->execute([$destId, $faq['question'], $faq['answer'], $idx + 1]);
    }

    // Insert Seasonal Activities accordion (destination_sections, section_type = seasonal_activities)
    $pdo->prepare("DELETE FROM destination_sections WHERE destination_id = ? AND section_type = 'seasonal_activities'")->execute([$destId]);
    $sectionStmt = $pdo->prepare("INSERT INTO destination_sections (destination_id, section_type, title, content, media_id, display_order, status, created_at, updated_at) VALUES (?, 'seasonal_activities', ?, ?, ?, ?, 'active', NOW(), NOW())");
    foreach ($dest['seasonal'] as $idx => $item) {
        $seasonalMediaId = getOrCreateMedia($pdo, $item['image'], $dest['name'] . ' — ' . $item['title']);
        $sectionStmt->execute([$destId, $item['title'], $item['content'], $seasonalMediaId, $idx + 1]);
    }

    echo " [OK] Processed {$dest['name']} (ID: $destId)\n";
}

echo "Successfully seeded the 4 official destinations.\n";
