<?php

require __DIR__ . '/vendor/autoload.php';
\App\Utils\Env::load(__DIR__ . '/.env');

use App\Utils\Database;
use App\Models\Tour;
use App\Models\Media;

$db = Database::getConnection();

// 1. Create Gallery Media for Mahabalipuram
$galleryMedia = [
    [
        'filename' => 'shore_temple_main.jpg',
        'original_name' => 'Shore-Temple-UNESCO-World-Heritage-Site.jpeg',
        'file_path' => 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&auto=format&fit=crop&q=80',
        'mime_type' => 'image/jpeg',
        'alt_text' => 'Shore Temple UNESCO World Heritage Site Mahabalipuram',
    ],
    [
        'filename' => 'temple_lit.jpg',
        'original_name' => 'Mahabalipuram Temple Illuminated.jpeg',
        'file_path' => 'https://images.unsplash.com/photo-1600100397608-f010e47f2597?w=800&auto=format&fit=crop&q=80',
        'mime_type' => 'image/jpeg',
        'alt_text' => 'Mahabalipuram Temple architecture',
    ],
    [
        'filename' => 'sunrise_beach.jpg',
        'original_name' => 'Bay of Bengal Sunrise Mahabalipuram.jpeg',
        'file_path' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
        'mime_type' => 'image/jpeg',
        'alt_text' => 'Bay of Bengal coastal view Mahabalipuram',
    ],
];

$mediaIds = [];
foreach ($galleryMedia as $gm) {
    $mId = Media::create([
        'filename' => $gm['filename'],
        'original_name' => $gm['original_name'],
        'file_path' => $gm['file_path'],
        'file_size' => 600000,
        'mime_type' => $gm['mime_type'],
        'alt_text' => $gm['alt_text'],
    ]);
    $mediaIds[] = $mId;
}

// 2. Fetch Mahabalipuram Tour
$stmt = $db->prepare('SELECT id FROM tours WHERE slug = "mahabalipuram-day-tour" LIMIT 1');
$stmt->execute();
$tourId = (int) $stmt->fetchColumn();

if ($tourId) {
    // Update main tour overview, pricing, duration, and coordinates
    $updateTour = [
        'base_price' => 50.00,
        'currency' => 'EUR',
        'duration_days' => 1,
        'duration_hours' => 10.0,
        'duration_text' => '10 Hours',
        'languages' => 'English, Tamil',
        'featured_image_id' => $mediaIds[0],
        'map_title' => 'Mahabalipuram UNESCO Heritage Circuit',
        'latitude' => 12.6167,
        'longitude' => 80.1928,
        'map_zoom' => 14,
        'short_description' => "Step back in time with our Mahabalipuram Day Tour, exploring one of Tamil Nadu's most iconic heritage destinations.",
        'overview' => "<p>Step back in time with our <strong>Mahabalipuram Day Tour</strong>, exploring one of Tamil Nadu's most iconic heritage destinations. Also known as <strong>Mamallapuram</strong>, this ancient port town dates back to the <strong>7th–9th century Pallava dynasty</strong> and is renowned for its rock-cut monuments and UNESCO World Heritage Sites carved entirely from granite.</p><p>This tour offers a perfect blend of <strong>history, architecture, spirituality, and coastal beauty</strong>, making it ideal for culture lovers, history enthusiasts, and families.</p>",
    ];

    $fields = [];
    $params = [':id' => $tourId];
    foreach ($updateTour as $col => $val) {
        $fields[] = "`{$col}` = :{$col}";
        $params[":{$col}"] = $val;
    }
    $db->prepare('UPDATE tours SET ' . implode(', ', $fields) . ', updated_at = NOW() WHERE id = :id')->execute($params);

    // Gallery
    Tour::syncGallery($tourId, [
        ['media_id' => $mediaIds[0], 'is_cover' => 1, 'display_order' => 0],
        ['media_id' => $mediaIds[1], 'is_cover' => 0, 'display_order' => 1],
        ['media_id' => $mediaIds[2], 'is_cover' => 0, 'display_order' => 2],
    ]);

    // Highlights
    Tour::syncHighlights($tourId, [
        ['highlight_text' => 'Full-day Mahabalipuram local sightseeing tour', 'display_order' => 0],
        ['highlight_text' => 'Duration: 10 hours', 'display_order' => 1],
        ['highlight_text' => 'Private cab tour (not shared with others)', 'display_order' => 2],
        ['highlight_text' => 'Pickup and drop from your Chennai hotel / residence', 'display_order' => 3],
    ]);

    // Places Covered
    Tour::syncPlaces($tourId, [
        ['name' => 'Shore Temple (UNESCO World Heritage Site)', 'display_order' => 1],
        ['name' => "Krishna's Butter Ball", 'display_order' => 2],
        ['name' => "Arjuna's Penance (Descent of the Ganges)", 'display_order' => 3],
        ['name' => 'Pancha Rathas (Five Rathas)', 'display_order' => 4],
        ['name' => 'Covelong Beach', 'display_order' => 5],
        ['name' => 'ISKCON Temple Chennai', 'display_order' => 6],
    ]);

    // Pricing Tiers
    Tour::syncPricingTiers($tourId, [
        [
            'min_persons' => 2,
            'max_persons' => 3,
            'service_option' => 'Transportation only',
            'currency' => 'EUR',
            'price' => 50.00,
        ],
        [
            'min_persons' => 2,
            'max_persons' => 3,
            'service_option' => 'Transportation with tour guide',
            'currency' => 'EUR',
            'price' => 75.00,
        ],
        [
            'min_persons' => 4,
            'max_persons' => 5,
            'service_option' => 'Transportation only',
            'currency' => 'EUR',
            'price' => 70.00,
        ],
        [
            'min_persons' => 4,
            'max_persons' => 5,
            'service_option' => 'Transportation with tour guide',
            'currency' => 'EUR',
            'price' => 100.00,
        ],
    ]);

    // Includes
    Tour::syncIncludes($tourId, [
        ['item_text' => 'Private transportation for sightseeing in AC vehicle', 'display_order' => 0],
        ['item_text' => 'Vehicle parking charges', 'display_order' => 1],
        ['item_text' => 'Toll gate charges', 'display_order' => 2],
        ['item_text' => 'Driver allowance (batta)', 'display_order' => 3],
        ['item_text' => 'Tour guide (if selected)', 'display_order' => 4],
    ]);

    // Excludes
    Tour::syncExcludes($tourId, [
        ['item_text' => 'Entrance / admission tickets', 'display_order' => 0],
        ['item_text' => 'Accommodation', 'display_order' => 1],
        ['item_text' => 'Food and beverages', 'display_order' => 2],
        ['item_text' => 'Personal expenses & tips', 'display_order' => 3],
    ]);

    // Why Choose
    Tour::syncWhyChoose($tourId, [
        ['title' => 'Explore UNESCO World Heritage monuments', 'display_order' => 0],
        ['title' => 'Experience ancient Pallava architecture', 'display_order' => 1],
        ['title' => 'Enjoy a comfortable private sightseeing tour', 'display_order' => 2],
        ['title' => 'Ideal for families, couples, and history lovers', 'display_order' => 3],
        ['title' => 'Flexible itinerary with professional driver', 'display_order' => 4],
    ]);

    // Itineraries (What to Expect)
    Tour::syncItineraries($tourId, [
        [
            'time_period' => 'Morning (08:30 AM - 11:00 AM)',
            'title' => 'Pickup & Shore Temple Exploration',
            'description' => 'Pickup from your Chennai hotel / residence in a private air-conditioned vehicle. Drive along the scenic East Coast Road (ECR) to Mahabalipuram and visit the iconic Shore Temple, an 8th-century UNESCO World Heritage Site overlooking the Bay of Bengal.',
            'display_order' => 0,
        ],
        [
            'time_period' => 'Late Morning (11:00 AM - 01:30 PM)',
            'title' => "Krishna's Butter Ball, Arjuna's Penance & Pancha Rathas",
            'description' => "Explore the gravity-defying Krishna's Butter Ball natural boulder. Marvel at Arjuna's Penance (Descent of the Ganges) stone relief carving, and walk through the monolithic Pancha Rathas (Five Rathas) rock-cut shrines.",
            'display_order' => 1,
        ],
        [
            'time_period' => 'Afternoon (01:30 PM - 03:00 PM)',
            'title' => 'Authentic Lunch Break & Local Handicrafts',
            'description' => 'Relax and savor authentic South Indian or fresh seafood lunch at a beachside restaurant. Browse traditional stone carving workshops and local seashell handicrafts.',
            'display_order' => 2,
        ],
        [
            'time_period' => 'Evening (03:30 PM - 06:30 PM)',
            'title' => 'Covelong Beach & ISKCON Temple Return Drive',
            'description' => 'Stop by scenic Covelong Beach for refreshing coastal breezes, followed by a visit to the grand ISKCON Temple in Akkarai. Drive back and drop off safely at your Chennai residence/hotel.',
            'display_order' => 3,
        ],
    ]);

    // FAQs
    Tour::syncFaqs($tourId, [
        [
            'question' => 'Is this a private tour and who is it suitable for?',
            'answer' => 'Yes, this is a 100% private customized day tour with an exclusive air-conditioned vehicle and chauffeur. It is ideal for international travelers, couples, families, and history enthusiasts.',
            'display_order' => 0,
        ],
        [
            'question' => 'How long is the Mahabalipuram Day Tour and which places are covered?',
            'answer' => 'The tour duration is approximately 8–10 hours. Key covered attractions include the UNESCO World Heritage Shore Temple, Arjuna\'s Penance, Krishna\'s Butter Ball, Pancha Rathas (Five Rathas), Covelong Beach, and ISKCON Temple.',
            'display_order' => 1,
        ],
        [
            'question' => 'What is included in the Mahabalipuram Day Tour package?',
            'answer' => 'The package includes private AC cab transportation, chauffeur allowances, fuel, toll gate charges, and vehicle parking. Entrance tickets, guide fees, and meal arrangements can be chosen on-demand.',
            'display_order' => 2,
        ],
    ]);

    echo "Mahabalipuram Day Tour enriched successfully with all child data!\n";
}
