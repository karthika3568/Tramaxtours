<?php

require __DIR__ . '/vendor/autoload.php';
\App\Utils\Env::load(__DIR__ . '/.env');

use App\Utils\Database;
use App\Models\Destination;
use App\Models\Tour;

$db = Database::getConnection();

// Seed Destinations
$destinations = [
    [
        'name' => 'Goa',
        'slug' => 'goa',
        'hero_title' => 'Sun-Kissed Beaches, Coastal Heritage & Vibrant Escapes',
        'hero_subtitle' => 'Unwind along golden sands, historic Portuguese quarters, and secluded coastal lagoons.',
        'short_description' => 'Discover Goa with our tours.',
        'intro_heading' => 'Tropical Luxury & Coastal Serenity',
        'intro_content' => 'From the historic churches of Old Goa to the serene sands of Palolem and private sunset yacht cruises, Goa offers a quintessential coastal paradise tailored for discerning travelers.',
        'language' => 'Konkani, English, Hindi',
        'currency' => 'INR (₹)',
        'religion' => 'Hinduism, Christianity',
        'timezone' => 'IST (UTC+5:30)',
        'is_featured' => 1,
        'display_order' => 1,
        'status' => 'published',
        'image_url' => 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=900&auto=format&fit=crop&q=80',
    ],
    [
        'name' => 'Karnataka',
        'slug' => 'karnataka',
        'hero_title' => 'UNESCO Heritage, Coorg Coffee Hills & Majestic Palaces',
        'hero_subtitle' => 'Immerse in royal Mysore splendor, ancient Hampi boulder temples, and mist-laden Western Ghats.',
        'short_description' => 'Discover Karnataka with our tours.',
        'intro_heading' => 'A Tapestry of History and Emerald Wilderness',
        'intro_content' => 'Karnataka bridges monumental UNESCO World Heritage sites at Hampi and Pattadakal with the lush aromas of Coorg coffee plantations and Kabini wildlife safaris.',
        'language' => 'Kannada, English, Hindi',
        'currency' => 'INR (₹)',
        'religion' => 'Hinduism, Jainism, Islam',
        'timezone' => 'IST (UTC+5:30)',
        'is_featured' => 1,
        'display_order' => 2,
        'status' => 'published',
        'image_url' => 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=900&auto=format&fit=crop&q=80',
    ],
    [
        'name' => 'Kerala',
        'slug' => 'kerala',
        'hero_title' => 'God’s Own Country — Backwaters, Tea Mist & Ayurvedic Retreats',
        'hero_subtitle' => 'Glide through palm-fringed Alleppey lagoons, Munnar tea hills, and Wayanad rainforest reserves.',
        'short_description' => 'Discover Kerala with our tours.',
        'intro_heading' => 'Tranquil Waterways and Verdant Mountains',
        'intro_content' => 'Experience bespoke luxury houseboats navigating emerald canals, private spice estate bungalows, and rejuvenate with traditional authentic Ayurveda.',
        'language' => 'Malayalam, English, Tamil',
        'currency' => 'INR (₹)',
        'religion' => 'Hinduism, Christianity, Islam',
        'timezone' => 'IST (UTC+5:30)',
        'is_featured' => 1,
        'display_order' => 3,
        'status' => 'published',
        'image_url' => 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=900&auto=format&fit=crop&q=80',
    ],
    [
        'name' => 'Tamil Nadu',
        'slug' => 'tamil-nadu',
        'hero_title' => 'Living Chola Temples, French Quarters & Nilgiri Tea Hills',
        'hero_subtitle' => 'Marvel at soaring temple gopurams, colonial Chennai landmarks, and charming Ooty mountain vistas.',
        'short_description' => 'Discover Tamil Nadu with our tours.',
        'intro_heading' => 'Millennia of Cultural Splendor and Architectural Genius',
        'intro_content' => 'Home to UNESCO World Heritage monuments in Mahabalipuram, the grandeur of Madurai Meenakshi Temple, and the cool eucalyptus-scented hills of Kodaikanal.',
        'language' => 'Tamil, English',
        'currency' => 'INR (₹)',
        'religion' => 'Hinduism, Christianity, Islam',
        'timezone' => 'IST (UTC+5:30)',
        'is_featured' => 1,
        'display_order' => 4,
        'status' => 'published',
        'image_url' => 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=900&auto=format&fit=crop&q=80',
    ],
    [
        'name' => 'Sri Lanka',
        'slug' => 'sri-lanka',
        'hero_title' => 'Sigiriya Rock Fortress, Tea Country Trains & Wild Safari Coastlines',
        'hero_subtitle' => 'Cross emerald mountain passes, explore historic Dutch Galle forts, and track leopards in Yala.',
        'short_description' => 'Discover Sri Lanka with our tours.',
        'intro_heading' => 'The Resplendent Isle of Wildlife and Ancient Wonder',
        'intro_content' => 'A multifaceted jewel featuring scenic train rides between Kandy and Ella, UNESCO ancient capitals, and secluded Indian Ocean beach villas.',
        'language' => 'Sinhala, Tamil, English',
        'currency' => 'LKR / USD ($)',
        'religion' => 'Buddhism, Hinduism, Christianity',
        'timezone' => 'SLST (UTC+5:30)',
        'is_featured' => 1,
        'display_order' => 5,
        'status' => 'published',
        'image_url' => 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=900&auto=format&fit=crop&q=80',
    ],
    [
        'name' => 'Andhra Pradesh',
        'slug' => 'andhra-pradesh',
        'hero_title' => 'Spiritual Sanctums, Borra Caves & Araku Coffee Valleys',
        'hero_subtitle' => 'Witness sacred Tirumala hill shrines, eastern ghat gorges, and pristine Bay of Bengal shores.',
        'short_description' => 'Discover Andhra Pradesh with our tours.',
        'intro_heading' => 'Sacred Heritage and Serene Eastern Ghats',
        'intro_content' => 'Experience the spiritual epicenter of South India alongside the breathtaking beauty of Araku valley scenic trains and ancient stalactite caves.',
        'language' => 'Telugu, English, Hindi',
        'currency' => 'INR (₹)',
        'religion' => 'Hinduism, Christianity, Islam',
        'timezone' => 'IST (UTC+5:30)',
        'is_featured' => 1,
        'display_order' => 6,
        'status' => 'published',
        'image_url' => 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=900&auto=format&fit=crop&q=80',
    ]
];

foreach ($destinations as $d) {
    // Check if media already exists or create
    $mediaStmt = $db->prepare('SELECT id FROM media WHERE original_name = :name LIMIT 1');
    $mediaStmt->execute([':name' => $d['name'] . '_cover.jpg']);
    $mediaId = $mediaStmt->fetchColumn();

    if (!$mediaId) {
        $mediaId = \App\Models\Media::create([
            'filename' => $d['slug'] . '_dest.jpg',
            'original_name' => $d['name'] . '_cover.jpg',
            'file_path' => $d['image_url'],
            'file_size' => 500000,
            'mime_type' => 'image/jpeg',
            'alt_text' => $d['name'] . ' destination landscape',
        ]);
    }

    $existing = $db->prepare('SELECT id FROM destinations WHERE slug = :slug LIMIT 1');
    $existing->execute([':slug' => $d['slug']]);
    $existingId = $existing->fetchColumn();

    if ($existingId) {
        $update = $db->prepare('UPDATE destinations SET name = :name, hero_title = :ht, hero_subtitle = :hs, short_description = :sd, intro_heading = :ih, intro_content = :ic, featured_image_id = :fi, is_featured = :feat, display_order = :ord, status = "published", deleted_at = NULL WHERE id = :id');
        $update->execute([
            ':name' => $d['name'],
            ':ht' => $d['hero_title'],
            ':hs' => $d['hero_subtitle'],
            ':sd' => $d['short_description'],
            ':ih' => $d['intro_heading'],
            ':ic' => $d['intro_content'],
            ':fi' => $mediaId,
            ':feat' => $d['is_featured'],
            ':ord' => $d['display_order'],
            ':id' => $existingId,
        ]);
        echo "Updated destination: {$d['name']} (ID: {$existingId})\n";
        $destId = $existingId;
    } else {
        $destId = Destination::create([
            'name' => $d['name'],
            'slug' => $d['slug'],
            'hero_title' => $d['hero_title'],
            'hero_subtitle' => $d['hero_subtitle'],
            'short_description' => $d['short_description'],
            'intro_heading' => $d['intro_heading'],
            'intro_content' => $d['intro_content'],
            'language' => $d['language'],
            'currency' => $d['currency'],
            'religion' => $d['religion'],
            'timezone' => $d['timezone'],
            'featured_image_id' => $mediaId,
            'is_featured' => $d['is_featured'],
            'display_order' => $d['display_order'],
            'status' => 'published',
        ]);
        echo "Created destination: {$d['name']} (ID: {$destId})\n";
    }

    // Ensure sample tours exist for this destination
    $toursCountStmt = $db->prepare('SELECT COUNT(*) FROM tours WHERE destination_id = :did AND deleted_at IS NULL');
    $toursCountStmt->execute([':did' => $destId]);
    if ((int) $toursCountStmt->fetchColumn() === 0) {
        // Create 2 curated tours for this destination
        $tour1Slug = $d['slug'] . '-signature-luxury-experience';
        $tour1 = Tour::create([
            'title' => $d['name'] . ' Signature Luxury & Heritage Odyssey',
            'slug' => $tour1Slug,
            'destination_id' => $destId,
            'tour_type' => 'luxury-safari',
            'short_description' => "Experience private chauffeur-guided excursions, 5-star heritage villas, and gourmet dining across {$d['name']}.",
            'overview' => "A handpicked luxury expedition exploring the quintessential highlights and concealed gems of {$d['name']}.",
            'duration_days' => 5,
            'duration_nights' => 4,
            'base_price' => 749,
            'currency' => 'USD',
            'featured_image_id' => $mediaId,
            'is_featured' => 1,
            'display_order' => 1,
            'status' => 'published',
            'inclusions' => ["5-Star Luxury Stays", "Private Chauffeur & AC SUV", "Daily Gourmet Breakfast & Dinner", "All Monument Entry Tickets", "Dedicated 24/7 Concierge"],
            'exclusions' => ["International Flights", "Personal Expenses", "Travel Insurance"],
        ]);

        $tour2Slug = $d['slug'] . '-scenic-family-getaway';
        $tour2 = Tour::create([
            'title' => $d['name'] . ' Scenic Highlights & Family Explorer',
            'slug' => $tour2Slug,
            'destination_id' => $destId,
            'tour_type' => 'scenic-getaways',
            'short_description' => "Delightful family-friendly journeys with cultural immersion and scenic countryside trails in {$d['name']}.",
            'overview' => "An effortless vacation tailored for families and small groups wanting scenic beauty and cultural encounters.",
            'duration_days' => 4,
            'duration_nights' => 3,
            'base_price' => 499,
            'currency' => 'USD',
            'featured_image_id' => $mediaId,
            'is_featured' => 1,
            'display_order' => 2,
            'status' => 'published',
            'inclusions' => ["Boutique Resort Accommodations", "Private Dedicated Vehicle", "Breakfast & Selected Meals", "Guided Excursions"],
            'exclusions' => ["Airfare", "Optional Activities"],
        ]);

        echo "  -> Added tours for {$d['name']}: ID {$tour1}, ID {$tour2}\n";
    }
}

echo "Seeding completed successfully!\n";
