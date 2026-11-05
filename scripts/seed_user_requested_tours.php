<?php

require_once __DIR__ . '/../backend/vendor/autoload.php';
\App\Utils\Env::load(__DIR__ . '/../backend/.env');

use App\Utils\Database;
use App\Models\Tour;

$pdo = Database::getConnection();

echo "Starting Tour Import / Update...\n";

// Ensure destination Tamil Nadu (ID 123) exists
$destStmt = $pdo->prepare("SELECT id FROM destinations WHERE slug = 'tamil-nadu' OR id = 123 LIMIT 1");
$destStmt->execute();
$destId = $destStmt->fetchColumn();
if (!$destId) {
    $destId = 123;
}

// Ensure categories exist
$categories = [
    'surfing-tour' => ['name' => 'Surfing Tour', 'slug' => 'surfing-tour', 'badge' => '#0284c7', 'desc' => 'Professional ocean surfing lessons, theory & practical wave riding.'],
    'palmleaf-horoscope' => ['name' => 'Palmleaf Horoscope Tour', 'slug' => 'palmleaf-horoscope', 'badge' => '#d97706', 'desc' => 'Ancient Nadi Astrology and Sacred Palm Leaf Reading in Tamil Nadu.'],
    'cultural-tour' => ['name' => 'Cultural Tour', 'slug' => 'cultural-tour', 'badge' => '#059669', 'desc' => 'Cultural and heritage experiences.'],
    'beach-holiday' => ['name' => 'Beach Holiday', 'slug' => 'beach-holiday', 'badge' => '#0284c7', 'desc' => 'Coastal and beach experiences.'],
    'adventure-tour' => ['name' => 'Adventure Tour', 'slug' => 'adventure-tour', 'badge' => '#ea580c', 'desc' => 'Active outdoor and adventure activities.'],
    'pilgrimage' => ['name' => 'Pilgrimage', 'slug' => 'pilgrimage', 'badge' => '#7c3aed', 'desc' => 'Spiritual and temple journeys.']
];

$catMap = [];
foreach ($categories as $slug => $c) {
    $stmt = $pdo->prepare("SELECT id FROM tour_categories WHERE slug = :s LIMIT 1");
    $stmt->execute([':s' => $slug]);
    $cid = $stmt->fetchColumn();
    if (!$cid) {
        $ins = $pdo->prepare("INSERT INTO tour_categories (name, slug, badge_color, description, status, created_at, updated_at) VALUES (:n, :s, :b, :d, 'active', NOW(), NOW())");
        $ins->execute([':n' => $c['name'], ':s' => $slug, ':b' => $c['badge'], ':d' => $c['desc']]);
        $cid = $pdo->lastInsertId();
    }
    $catMap[$slug] = (int) $cid;
}

// Media IDs
$mSurfBanner = 504;
$mSurfWaves = 505;
$mSurfBeach = 506;
$mSurfCoast = 507;

$mPalmBanner = 501;
$mPalmRead = 502;
$mPalmTemple = 503;

// ============================================================================
// 1. SURFING TOUR (YOUR BEST DAY)
// ============================================================================
$surfTitle = 'SURFING (YOUR BEST DAY)';
$surfSlug = 'surfing-your-best-day';
$surfShortDesc = '"Surfing is not a sport, it’s a lifestyle." We help you to make your dream of being a surfer a reality. Whether you know how to swim or not, we will guide you so that you can surf independently with no fear. Just like a pro surfer.';

$surfOverview = <<<'HTML'
<p class="lead"><strong>"Surfing is not a sport, it’s a lifestyle"</strong></p>
<p>When we say that surfing is a lifestyle, we mean it. We help you to make your dream of being a surfer a reality.</p>
<p>Whether you know how to swim or not, we will guide you so that you can surf independently with no fear. Just like a pro surfer.</p>

<div class="surfing-lessons-info" style="margin: 20px 0; padding: 18px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px;">
  <h3 style="color: #166534; margin: 0 0 10px 0; font-size: 18px;">🏄 Surfing Lessons Structure</h3>
  <ul style="margin: 0; padding-left: 20px; color: #15803d; line-height: 1.8;">
    <li><strong>Theatrical lesson for a half hour:</strong> Essential equipment knowledge, safety instructions, rip-current awareness, and board control.</li>
    <li><strong>Practical session for one hour:</strong> Dedicated in-water ocean coaching to catch and ride your waves safely.</li>
  </ul>
</div>

<div class="curriculum-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin: 20px 0;">
  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
    <h4 style="color: #0f172a; margin: 0 0 10px 0; font-size: 16px;">🌱 What do you learn? (For Beginners)</h4>
    <ul style="margin: 0; padding-left: 20px; color: #475569; line-height: 1.8;">
      <li>Equipment and safety instructions</li>
      <li>How to handle the board in the water</li>
      <li>How to stand up on a board</li>
      <li>Surf your first waves close to the beach</li>
    </ul>
  </div>

  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
    <h4 style="color: #0f172a; margin: 0 0 10px 0; font-size: 16px;">🌊 What do you learn? (For Intermediators)</h4>
    <ul style="margin: 0; padding-left: 20px; color: #475569; line-height: 1.8;">
      <li>Refresher on basics, equipment and safety</li>
      <li>How to paddle out behind the breaking waves</li>
      <li>How to take green waves on your own</li>
    </ul>
  </div>
</div>

<div style="display: flex; flex-wrap: wrap; gap: 16px; margin: 20px 0;">
  <div style="flex: 1; min-width: 240px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
    <h4 style="color: #0f172a; margin: 0 0 6px 0; font-size: 15px;">🕒 Opening Times</h4>
    <p style="margin: 0; color: #334155; font-weight: 600;">Every Day from 8:00 AM to 6:00 PM</p>
  </div>

  <div style="flex: 1; min-width: 240px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px;">
    <h4 style="color: #1e40af; margin: 0 0 6px 0; font-size: 15px;">📞 Direct Tour Organizer Contact</h4>
    <p style="margin: 0 0 4px 0; color: #1e3a8a;"><strong>E-Mail:</strong> <a href="mailto:welcome@yourbestdayinindia.com" style="color: #2563eb; text-decoration: none;">welcome@yourbestdayinindia.com</a></p>
    <p style="margin: 0; color: #1e3a8a;"><strong>Phone &amp; WhatsApp:</strong> <a href="https://wa.me/919840291110" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: none; font-weight: 600;">+91 9840291110</a></p>
  </div>
</div>
HTML;

$surfMeta = [
    'organizer_email' => 'welcome@yourbestdayinindia.com',
    'organizer_phone' => '+91 9840291110',
    'organizer_whatsapp' => '+91 9840291110',
    'opening_times' => 'Every Day from 8:00 AM to 6:00 PM',
    'experience_details' => [
        ['title' => 'Theatrical lesson for a half hour', 'description' => 'Equipment instructions, ocean currents, safety protocols, and board control basics.'],
        ['title' => 'Practical session for one hour', 'description' => 'Hands-on ocean wave catching with personal guidance from your instructor.']
    ]
];

// Check if surfing tour already exists
$surfStmt = $pdo->prepare("SELECT id FROM tours WHERE slug = :s OR slug = 'covelong-point-ocean-surfing-expedition' LIMIT 1");
$surfStmt->execute([':s' => $surfSlug]);
$surfId = $surfStmt->fetchColumn();

if ($surfId) {
    $up = $pdo->prepare("
        UPDATE tours SET
            destination_id = :dest_id,
            title = :title,
            slug = :slug,
            short_description = :short_desc,
            overview = :overview,
            tour_type = :tour_type,
            duration_text = :duration_text,
            duration_hours = 1.5,
            duration_days = 1,
            languages = :languages,
            featured_image_id = :img_id,
            base_price = 5000.00,
            currency = 'INR',
            min_persons = 1,
            max_persons = 12,
            available_seats = 20,
            total_seats = 20,
            booking_deadline_days = 1,
            travel_days = 'Daily (8:00 AM - 6:00 PM)',
            map_title = 'Covelong Point Surf Village & Beach',
            latitude = 12.7918,
            longitude = 80.2520,
            map_zoom = 13,
            seo_title = 'SURFING (YOUR BEST DAY) — Surfing Lessons in India',
            seo_description = 'Learn to surf in South India with certified guides. 30-min theory + 1-hour ocean wave session. Transport, lessons & guide included.',
            is_featured = 1,
            display_order = 1,
            status = 'published',
            metadata = :meta,
            deleted_at = NULL,
            updated_at = NOW()
        WHERE id = :id
    ");
    $up->execute([
        ':dest_id' => $destId,
        ':title' => $surfTitle,
        ':slug' => $surfSlug,
        ':short_desc' => $surfShortDesc,
        ':overview' => $surfOverview,
        ':tour_type' => 'Surfing Tours',
        ':duration_text' => '1.5 Hours Lesson (Daily 8 AM - 6 PM)',
        ':languages' => 'English, Tamil',
        ':img_id' => $mSurfBanner,
        ':meta' => json_encode($surfMeta),
        ':id' => $surfId
    ]);
    echo "Updated Surfing Tour (ID: {$surfId})\n";
} else {
    $ins = $pdo->prepare("
        INSERT INTO tours (
            destination_id, title, slug, short_description, overview,
            tour_type, duration_text, duration_hours, duration_days,
            languages, featured_image_id, base_price, currency,
            min_persons, max_persons, available_seats, total_seats,
            booking_deadline_days, travel_days, map_title, latitude, longitude, map_zoom,
            seo_title, seo_description, is_featured, display_order, status, metadata,
            created_at, updated_at
        ) VALUES (
            :dest_id, :title, :slug, :short_desc, :overview,
            :tour_type, :duration_text, 1.5, 1,
            :languages, :img_id, 5000.00, 'INR',
            1, 12, 20, 20,
            1, 'Daily (8:00 AM - 6:00 PM)', 'Covelong Point Surf Village & Beach', 12.7918, 80.2520, 13,
            'SURFING (YOUR BEST DAY) — Surfing Lessons in India', 'Learn to surf in South India with certified guides. 30-min theory + 1-hour ocean wave session. Transport, lessons & guide included.',
            1, 1, 'published', :meta, NOW(), NOW()
        )
    ");
    $ins->execute([
        ':dest_id' => $destId,
        ':title' => $surfTitle,
        ':slug' => $surfSlug,
        ':short_desc' => $surfShortDesc,
        ':overview' => $surfOverview,
        ':tour_type' => 'Surfing Tours',
        ':duration_text' => '1.5 Hours Lesson (Daily 8 AM - 6 PM)',
        ':languages' => 'English, Tamil',
        ':img_id' => $mSurfBanner,
        ':meta' => json_encode($surfMeta)
    ]);
    $surfId = (int) $pdo->lastInsertId();
    echo "Created Surfing Tour (ID: {$surfId})\n";
}

// Surfing Categories
Tour::syncCategories($surfId, [$catMap['surfing-tour'], $catMap['beach-holiday'], $catMap['adventure-tour']]);

// Surfing Highlights
$surfHighlights = [
    '"Surfing is not a sport, it’s a lifestyle" — Turn your dream of being a surfer into reality',
    'Whether you know how to swim or not, our guides coach you to surf independently with no fear',
    'Structured lessons: 30-minute theatrical lesson + 1-hour practical in-water session',
    'For beginners: equipment & safety instructions, board handling, and standing up close to shore',
    'For intermediators: refresher on basics, paddling out behind the break & catching green waves solo',
    'All-inclusive package: 1. Transport, 2. Surfing theory and practical lessons, 3. Dedicated Guide',
    'Open Every Day from 8:00 AM to 6:00 PM with flexible booking slots'
];
$highlightsData = [];
foreach ($surfHighlights as $i => $hl) {
    $highlightsData[] = ['highlight_text' => $hl, 'display_order' => $i + 1];
}
Tour::syncHighlights($surfId, $highlightsData);

// Surfing Pricing Tiers
$surfPricingTiers = [
    [
        'min_persons' => 1,
        'max_persons' => 12,
        'service_option' => 'Prices for Beginners (Starts from 5000 INR) — Includes Transport, Surfing Lessons & Guide',
        'currency' => 'INR',
        'price' => 5000.00,
        'status' => 'active'
    ],
    [
        'min_persons' => 1,
        'max_persons' => 12,
        'service_option' => 'Prices for Intermediators (6000 INR) — Includes Transport, Surfing Lessons & Guide',
        'currency' => 'INR',
        'price' => 6000.00,
        'status' => 'active'
    ]
];
Tour::syncPricingTiers($surfId, $surfPricingTiers);

// Surfing Includes & Excludes
$surfIncludes = [
    '1. Transport (Sanitized private vehicle transfer to and from beach)',
    '2. Surfing theory (half hour) and practical lessons (one hour)',
    '3. Dedicated surf guide & certified instructor',
    'High-grade foam & epoxy surfboards and safety leashes',
    'UV quick-dry protective rashguard provided for each session',
    'Beachside shower, changing facilities, and fresh tender coconut'
];
Tour::syncIncludes($surfId, $surfIncludes);

$surfExcludes = [
    'Personal towels and swimwear',
    'Food and extra beverages outside refreshments',
    'Personal gratuities for instructor / chauffeur'
];
Tour::syncExcludes($surfId, $surfExcludes);

// Surfing Itinerary
$surfItinerary = [
    [
        'time_period' => '30 Minutes',
        'title' => 'Theatrical Lesson & Ocean Safety Instructions',
        'description' => 'Equipment instructions and safety orientation on the sand. Learn how to handle the board in the water, understand rip currents, and practice pop-up mechanics.',
        'display_order' => 1,
        'status' => 'active'
    ],
    [
        'time_period' => '60 Minutes',
        'title' => 'Practical In-Water Wave Session',
        'description' => 'Hands-on wave riding with your instructor. Beginners practice popping up on the board and riding first waves close to the beach; intermediators paddle out behind breaking waves and take green waves independently.',
        'display_order' => 2,
        'status' => 'active'
    ],
    [
        'time_period' => 'Post-Session',
        'title' => 'Debrief, Refreshments & Return Transport',
        'description' => 'Review technique tips with your guide, enjoy fresh tender coconut by the beach, and return via private air-conditioned vehicle.',
        'display_order' => 3,
        'status' => 'active'
    ]
];
Tour::syncItineraries($surfId, $surfItinerary);

// Surfing Why Choose
$surfWhyChoose = [
    ['icon' => '🏄', 'title' => 'Surfing is a Lifestyle, Not Just a Sport', 'description' => 'We help you to make your dream of being a surfer a reality with authentic ocean passion.'],
    ['icon' => '🏊', 'title' => 'Swim or Not — Surf with No Fear', 'description' => 'Whether you know how to swim or not, we will guide you so that you can surf independently with no fear. Just like a pro surfer.'],
    ['icon' => '🚗', 'title' => 'All-Inclusive Convenience', 'description' => 'Prices include: 1. Transport, 2. Surfing theory and practical lessons, 3. Guide.'],
    ['icon' => '⏰', 'title' => 'Open Every Day from 8 AM to 6 PM', 'description' => 'Flexible daily slots to accommodate your schedule.'],
];
Tour::syncWhyChoose($surfId, $surfWhyChoose);

// Surfing FAQs
$surfFaqs = [
    [
        'question' => 'Do I need to know how to swim to join the surfing lessons?',
        'answer' => 'Whether you know how to swim or not, we will guide you so that you can surf independently with no fear. Just like a pro surfer.',
        'display_order' => 1
    ],
    [
        'question' => 'How are the surfing lessons structured?',
        'answer' => 'Surfing lessons include a theatrical lesson for a half hour (30 minutes on equipment, handling, safety) followed by a practical session for one hour in the ocean.',
        'display_order' => 2
    ],
    [
        'question' => 'What do you learn as a beginner?',
        'answer' => 'For beginners, you learn: Equipment and safety instructions, How to handle the board in the water, How to stand up on a board, and how to Surf your first waves close to the beach.',
        'display_order' => 3
    ],
    [
        'question' => 'What do you learn as an intermediator?',
        'answer' => 'For intermediators, you learn: Refresher on basics, equipment and safety, How to paddle out behind the breaking waves, and How to take green waves on your own.',
        'display_order' => 4
    ],
    [
        'question' => 'What are the prices and what do they include?',
        'answer' => 'Prices for beginners start from 5000 INR. Prices for intermediators are 6000 INR. Prices include: 1. Transport, 2. Surfing theory and practical lessons, 3. Guide.',
        'display_order' => 5
    ],
    [
        'question' => 'What are the opening times and contact details?',
        'answer' => 'Opening Times: Every Day from 8 AM to 6 PM. Contact: E-Mail: welcome@yourbestdayinindia.com | Phone and WhatsApp: +91 9840291110.',
        'display_order' => 6
    ]
];
Tour::syncFaqs($surfId, $surfFaqs);

// Surfing Places
$surfPlaces = [
    [
        'name' => 'Covelong Point Beach & Surf Village',
        'short_description' => 'Ideal sandy bottom beach break for beginner lessons, pop-up practice, and safe wave riding.',
        'latitude' => 12.7918,
        'longitude' => 80.2520,
        'display_order' => 1
    ],
    [
        'name' => 'Mahabalipuram Coastal Point Break',
        'short_description' => 'Historic point break rolling along the Coromandel coast for intermediators to catch green waves.',
        'latitude' => 12.6167,
        'longitude' => 80.1928,
        'display_order' => 2
    ]
];
Tour::syncPlaces($surfId, $surfPlaces);

// Surfing Gallery
Tour::syncGallery($surfId, [
    ['media_id' => $mSurfBanner, 'is_cover' => 1, 'display_order' => 1],
    ['media_id' => $mSurfWaves, 'is_cover' => 0, 'display_order' => 2],
    ['media_id' => $mSurfBeach, 'is_cover' => 0, 'display_order' => 3],
    ['media_id' => $mSurfCoast, 'is_cover' => 0, 'display_order' => 4],
]);


// ============================================================================
// 2. PALMLEAF HOROSCOPE (FIND YOUR DESTINY)
// ============================================================================
$palmTitle = 'PALMLEAF HOROSCOPE (FIND YOUR DESTINY)';
$palmSlug = 'palmleaf-horoscope-find-your-destiny';
$palmShortDesc = 'Nadi, in the ancient language of Tamil, means “in search of”. Dictated 3,000 years ago by Maharishis on sacred Palm Leaves specifically for you. Complete 3-procedure reading with dedicated translator and private transport included.';

$palmOverview = <<<'HTML'
<p class="lead"><strong>PALMLEAF HOROSCOPE (FIND YOUR DESTINY)</strong></p>
<p><strong>Nadi</strong>, in the ancient language of Tamil, means <em>“in search of”</em>. Because an individual goes in search of the predictions made for them, to find purpose and direction, the entire system of the Maharishis’ insights and predictions eventually came to be called by this name, <strong>Nadi Astrology</strong>.</p>
<p>Three thousand years ago, personal information about you was dictated by the Maharishis to their disciples and handwritten on special Palm Leaves, also called Nadis. These Palm Leaves were preserved for all this time, for you to access their contents when you need it most. Your Palm Leaf was written specifically for you, to provide you with guidance during the most important times of your life, by allowing you to prepare for future life changing events.</p>
<p>If you are approaching this crossroad in your life, then your Palm Leaf begins to draw you upon the search for its contents.</p>

<div class="procedures-container" style="margin: 24px 0; padding: 20px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 14px;">
  <h3 style="color: #92400e; margin: 0 0 16px 0; font-size: 19px;">📜 Procedures for Palm Leaf Reading</h3>

  <div style="margin-bottom: 16px; padding: 14px; background: #ffffff; border-radius: 10px; border-left: 4px solid #d97706;">
    <h4 style="margin: 0 0 6px 0; color: #78350f; font-size: 16px;">1. Searching for bundle(s)</h4>
    <p style="margin: 0; color: #4b5563; line-height: 1.65;">As soon as we get the appointment, we use your thumb impression, including in which country you were born in, the search will commence. Our expert readers in India will physically search for your Palm Leaf bundle(s), which might contain your individual Palm Leaf.</p>
  </div>

  <div style="margin-bottom: 16px; padding: 14px; background: #ffffff; border-radius: 10px; border-left: 4px solid #d97706;">
    <h4 style="margin: 0 0 6px 0; color: #78350f; font-size: 16px;">2. Matching</h4>
    <p style="margin: 0; color: #4b5563; line-height: 1.65;">Preparation for the matching process by moderator; Once the reader has found your bundle(s) that might contain your Palm Leaf, the matching process and thus the search for your one personal Palm Leaf within the bundle(s) begins.</p>
  </div>

  <div style="padding: 14px; background: #ffffff; border-radius: 10px; border-left: 4px solid #d97706;">
    <h4 style="margin: 0 0 6px 0; color: #78350f; font-size: 16px;">3. Reading</h4>
    <p style="margin: 0; color: #4b5563; line-height: 1.65;">The reading is the most important part of your experience. Based on your individual Palm Leaf, which was identified during the preceding matching process, this final part will let you know about your life.</p>
  </div>
</div>

<div style="display: flex; flex-wrap: wrap; gap: 16px; margin: 20px 0;">
  <div style="flex: 1; min-width: 240px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
    <h4 style="color: #0f172a; margin: 0 0 6px 0; font-size: 15px;">🕒 Opening Times</h4>
    <p style="margin: 0; color: #334155; font-weight: 600;">Every Day from 10:00 AM to 6:00 PM</p>
  </div>

  <div style="flex: 1; min-width: 240px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px;">
    <h4 style="color: #166534; margin: 0 0 6px 0; font-size: 15px;">💰 Price &amp; Inclusions</h4>
    <p style="margin: 0 0 4px 0; color: #15803d; font-weight: 700;">7,000 INR per person</p>
    <p style="margin: 0; color: #166534; font-size: 13.5px;">Includes: 1. Translator | 2. Transportation</p>
  </div>
</div>

<div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin: 20px 0;">
  <h4 style="color: #1e40af; margin: 0 0 6px 0; font-size: 15px;">📞 Contact Organizer</h4>
  <p style="margin: 0 0 4px 0; color: #1e3a8a;"><strong>E-Mail:</strong> <a href="mailto:welcome@yourbestdayinindia.com" style="color: #2563eb; text-decoration: none;">welcome@yourbestdayinindia.com</a></p>
  <p style="margin: 0; color: #1e3a8a;"><strong>Phone &amp; WhatsApp:</strong> <a href="https://wa.me/919840291110" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: none; font-weight: 600;">+91 9840291110</a></p>
</div>
HTML;

$palmMeta = [
    'organizer_email' => 'welcome@yourbestdayinindia.com',
    'organizer_phone' => '+91 9840291110',
    'organizer_whatsapp' => '+91 9840291110',
    'opening_times' => 'Every Day from 10:00 AM to 6:00 PM',
    'procedures' => [
        '1. Searching for bundle(s)' => 'As soon as we get the appointment, we use your thumb impression, including in which country you were born in, the search will commence.',
        '2. Matching' => 'Preparation for the matching process by moderator; Once the reader has found your bundle(s), the matching process begins.',
        '3. Reading' => 'The reading is the most important part of your experience. Based on your individual Palm Leaf, this final part lets you know about your life.'
    ]
];

// Check if palm leaf tour already exists (either under slug or previous ID 168)
$palmStmt = $pdo->prepare("SELECT id FROM tours WHERE slug = :s OR slug = 'sacred-palmleaf-horoscope-tour' OR id = 168 LIMIT 1");
$palmStmt->execute([':s' => $palmSlug]);
$palmId = $palmStmt->fetchColumn();

if ($palmId) {
    $up = $pdo->prepare("
        UPDATE tours SET
            destination_id = :dest_id,
            title = :title,
            slug = :slug,
            short_description = :short_desc,
            overview = :overview,
            tour_type = :tour_type,
            duration_text = :duration_text,
            duration_hours = 4.0,
            duration_days = 1,
            languages = :languages,
            featured_image_id = :img_id,
            base_price = 7000.00,
            currency = 'INR',
            min_persons = 1,
            max_persons = 8,
            available_seats = 20,
            total_seats = 20,
            booking_deadline_days = 1,
            travel_days = 'Daily (10:00 AM - 6:00 PM)',
            map_title = 'Nadi Astrology Palmleaf Center & Vaitheeswaran Kovil',
            latitude = 11.2014,
            longitude = 79.7289,
            map_zoom = 13,
            seo_title = 'PALMLEAF HOROSCOPE (FIND YOUR DESTINY) — Nadi Astrology India',
            seo_description = 'Discover your destiny through 3,000-year-old Maharishi Palm Leaves. 3-step reading with personal translator and AC transport included.',
            is_featured = 1,
            display_order = 2,
            status = 'published',
            metadata = :meta,
            deleted_at = NULL,
            updated_at = NOW()
        WHERE id = :id
    ");
    $up->execute([
        ':dest_id' => $destId,
        ':title' => $palmTitle,
        ':slug' => $palmSlug,
        ':short_desc' => $palmShortDesc,
        ':overview' => $palmOverview,
        ':tour_type' => 'Palmleaf Horoscope Tours',
        ':duration_text' => 'Daily from 10 AM to 6 PM',
        ':languages' => 'English, Tamil (Translator Included)',
        ':img_id' => $mPalmBanner,
        ':meta' => json_encode($palmMeta),
        ':id' => $palmId
    ]);
    echo "Updated Palmleaf Horoscope Tour (ID: {$palmId})\n";
} else {
    $ins = $pdo->prepare("
        INSERT INTO tours (
            destination_id, title, slug, short_description, overview,
            tour_type, duration_text, duration_hours, duration_days,
            languages, featured_image_id, base_price, currency,
            min_persons, max_persons, available_seats, total_seats,
            booking_deadline_days, travel_days, map_title, latitude, longitude, map_zoom,
            seo_title, seo_description, is_featured, display_order, status, metadata,
            created_at, updated_at
        ) VALUES (
            :dest_id, :title, :slug, :short_desc, :overview,
            :tour_type, :duration_text, 4.0, 1,
            :languages, :img_id, 7000.00, 'INR',
            1, 8, 20, 20,
            1, 'Daily (10:00 AM - 6:00 PM)', 'Nadi Astrology Palmleaf Center & Vaitheeswaran Kovil', 11.2014, 79.7289, 13,
            'PALMLEAF HOROSCOPE (FIND YOUR DESTINY) — Nadi Astrology India', 'Discover your destiny through 3,000-year-old Maharishi Palm Leaves. 3-step reading with personal translator and AC transport included.',
            1, 2, 'published', :meta, NOW(), NOW()
        )
    ");
    $ins->execute([
        ':dest_id' => $destId,
        ':title' => $palmTitle,
        ':slug' => $palmSlug,
        ':short_desc' => $palmShortDesc,
        ':overview' => $palmOverview,
        ':tour_type' => 'Palmleaf Horoscope Tours',
        ':duration_text' => 'Daily from 10 AM to 6 PM',
        ':languages' => 'English, Tamil (Translator Included)',
        ':img_id' => $mPalmBanner,
        ':meta' => json_encode($palmMeta)
    ]);
    $palmId = (int) $pdo->lastInsertId();
    echo "Created Palmleaf Horoscope Tour (ID: {$palmId})\n";
}

// Palmleaf Categories
Tour::syncCategories($palmId, [$catMap['palmleaf-horoscope'], $catMap['cultural-tour'], $catMap['pilgrimage']]);

// Palmleaf Highlights
$palmHighlights = [
    'Nadi, in the ancient language of Tamil, means “in search of” — Find your purpose and direction',
    'Dictated 3,000 years ago by Maharishis on special Palm Leaves specifically for your life path',
    'Procedure 1: Searching for bundle(s) using your unique thumb impression and country of birth',
    'Procedure 2: Moderated matching process by expert reader to locate your one personal Palm Leaf',
    'Procedure 3: The Reading — reveals your destiny and guides you through life changing crossroads',
    'Price for palm leaf horoscope: 7,000 INR per person — includes 1. Translator, 2. Transportation',
    'Opening Times: Every Day from 10:00 AM to 6:00 PM with personalized care'
];
$hlData = [];
foreach ($palmHighlights as $i => $hl) {
    $hlData[] = ['highlight_text' => $hl, 'display_order' => $i + 1];
}
Tour::syncHighlights($palmId, $hlData);

// Palmleaf Pricing Tiers
$palmPricingTiers = [
    [
        'min_persons' => 1,
        'max_persons' => 8,
        'service_option' => 'Prices for Palm Leaf Horoscope Per Person (7000 INR) — Includes Translator & Transportation',
        'currency' => 'INR',
        'price' => 7000.00,
        'status' => 'active'
    ]
];
Tour::syncPricingTiers($palmId, $palmPricingTiers);

// Palmleaf Includes & Excludes
$palmIncludes = [
    '1. Translator (Dedicated live interpreter translating the ancient verses into clear English)',
    '2. Transportation (Sanitized private air-conditioned vehicle transfers)',
    'Authentic Nadi bundle search conducted across heritage archives in India',
    'Moderated matching verification and full individual life reading'
];
Tour::syncIncludes($palmId, $palmIncludes);

$palmExcludes = [
    'Personal temple puja offerings or special homams',
    'Personal expenses and driver/translator gratuities'
];
Tour::syncExcludes($palmId, $palmExcludes);

// Palmleaf Itinerary
$palmItinerary = [
    [
        'time_period' => 'Step 1',
        'title' => 'Searching for Bundle(s)',
        'description' => 'As soon as we get the appointment, we use your thumb impression, including in which country you were born in, and the search will commence. Our expert readers in India will physically search for your Palm Leaf bundle(s), which might contain your individual Palm Leaf.',
        'display_order' => 1,
        'status' => 'active'
    ],
    [
        'time_period' => 'Step 2',
        'title' => 'Matching Process',
        'description' => 'Preparation for the matching process by moderator; Once the reader has found your bundle(s) that might contain your Palm Leaf, the matching process and thus the search for your one personal Palm Leaf within the bundle(s) begins.',
        'display_order' => 2,
        'status' => 'active'
    ],
    [
        'time_period' => 'Step 3',
        'title' => 'The Reading & Destiny Revelations',
        'description' => 'The reading is the most important part of your experience. Based on your individual Palm Leaf, which was identified during the preceding matching process, this final part will let you know about your life.',
        'display_order' => 3,
        'status' => 'active'
    ]
];
Tour::syncItineraries($palmId, $palmItinerary);

// Palmleaf Why Choose
$palmWhyChoose = [
    ['icon' => '📜', 'title' => 'Ancient Nadi Heritage', 'description' => 'Nadi means "in search of". Three thousand years ago, personal information was dictated by the Maharishis and preserved for you.'],
    ['icon' => '🗣️', 'title' => 'Dedicated Translator Included', 'description' => 'No language barriers. Your price includes a dedicated translator to guide and translate your entire reading.'],
    ['icon' => '🚗', 'title' => 'Comfortable Private Transportation', 'description' => 'Travel safely and comfortably with private roundtrip vehicle transfers included.'],
    ['icon' => '⏰', 'title' => 'Open Every Day from 10 AM to 6 PM', 'description' => 'Daily appointments available with direct organizer WhatsApp and email assistance.'],
];
Tour::syncWhyChoose($palmId, $palmWhyChoose);

// Palmleaf FAQs
$palmFaqs = [
    [
        'question' => 'What does Nadi mean and what is Nadi Astrology?',
        'answer' => 'Nadi, in the ancient language of Tamil, means “in search of”. Because an individual goes in search of the predictions made for them, to find purpose and direction, the entire system of the Maharishis’ insights and predictions eventually came to be called by this name, Nadi Astrology.',
        'display_order' => 1
    ],
    [
        'question' => 'How were the Palm Leaves prepared and preserved?',
        'answer' => 'Three thousand years ago, personal information about you was dictated by the Maharishis to their disciples and handwritten on special Palm Leaves, also called Nadis. These Palm Leaves were preserved for all this time, for you to access their contents when you need it most.',
        'display_order' => 2
    ],
    [
        'question' => 'What are the procedures for palm leaf reading?',
        'answer' => '1. Searching for bundle(s): we use your thumb impression and country of birth to search for candidate bundles. 2. Matching: moderated verification to identify your one personal leaf. 3. Reading: the reading lets you know about your life and future milestones.',
        'display_order' => 3
    ],
    [
        'question' => 'What are the opening times?',
        'answer' => 'Opening Times: Every Day from 10 AM to 6 PM.',
        'display_order' => 4
    ],
    [
        'question' => 'What are the prices and what is included?',
        'answer' => 'Prices for palm leaf horoscope per person: 7000 INR. Price includes: 1. Translator, 2. Transportation.',
        'display_order' => 5
    ],
    [
        'question' => 'How do I contact or schedule an appointment?',
        'answer' => 'Contact: E-Mail: welcome@yourbestdayinindia.com | Phone and WhatsApp: +91 9840291110.',
        'display_order' => 6
    ]
];
Tour::syncFaqs($palmId, $palmFaqs);

// Palmleaf Places
$palmPlaces = [
    [
        'name' => 'Nadi Astrology Palm Leaf Reading Archive',
        'short_description' => 'Sacred library where centuries-old palm leaf bundles (Nadis) are preserved and matched.',
        'latitude' => 11.2014,
        'longitude' => 79.7289,
        'display_order' => 1
    ],
    [
        'name' => 'Vaitheeswaran Kovil Heritage Precinct',
        'short_description' => 'Historic temple epicenter of Sage Agastya astrological tradition in Tamil Nadu.',
        'latitude' => 11.2023,
        'longitude' => 79.7275,
        'display_order' => 2
    ]
];
Tour::syncPlaces($palmId, $palmPlaces);

// Palmleaf Gallery
Tour::syncGallery($palmId, [
    ['media_id' => $mPalmBanner, 'is_cover' => 1, 'display_order' => 1],
    ['media_id' => $mPalmRead, 'is_cover' => 0, 'display_order' => 2],
    ['media_id' => $mPalmTemple, 'is_cover' => 0, 'display_order' => 3],
]);

echo "✅ Both Tours Successfully Seeded and Synchronized!\n";

