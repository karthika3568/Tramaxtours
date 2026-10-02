<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Utils\Database;
use App\Utils\JWT;

$db = Database::getConnection();

echo "======================================================================\n";
echo "  RAW BACKEND & DATABASE EVIDENCE COLLECTOR\n";
echo "======================================================================\n\n";

// --- ITEM 2: DB Consistency & Concurrent Submissions ---
echo "--- ITEM 2: DB CONSISTENCY ---\n";
echo "[SQL] SELECT id, reference_id, type, status, created_at FROM contact_messages ORDER BY id;\n";
$stmt = $db->query("SELECT id, reference_id, type, status, created_at FROM contact_messages ORDER BY id");
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($rows, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n\n";

// Concurrent 5 Submissions Simulation
echo "[ACTION] Submitting 5 concurrent requests...\n";
$mh = curl_multi_init();
$handles = [];
for ($i = 1; $i <= 5; $i++) {
    $ch = curl_init('http://127.0.0.1:8080/api/v1/trip-requests');
    $payload = json_encode([
        'name' => "Concurrent Traveler {$i}",
        'email' => "traveler_conc_{$i}_" . time() . "@example.com",
        'phone' => "+91987654321{$i}",
        'destination_name' => "Kerala Backwaters {$i}",
        'travelers' => 2,
        'arrival_date' => '2026-11-10',
        'departure_date' => '2026-11-15',
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_multi_add_handle($mh, $ch);
    $handles[] = $ch;
}

$running = null;
do {
    curl_multi_exec($mh, $running);
    curl_multi_select($mh);
} while ($running > 0);

foreach ($handles as $ch) {
    curl_multi_remove_handle($mh, $ch);
    curl_close($ch);
}
curl_multi_close($mh);

echo "[SQL] SELECT id, reference_id, type, status, created_at FROM contact_messages ORDER BY id DESC LIMIT 5;\n";
$stmt = $db->query("SELECT id, reference_id, type, status, created_at FROM contact_messages ORDER BY id DESC LIMIT 5");
$newRows = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($newRows, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n\n";

// --- ITEM 3: API CONTRACT & UNIFIED ERROR BODIES ---
echo "--- ITEM 3: ONE API CONTRACT & UNIFIED ERROR FORMAT ---\n";
echo "422 Unprocessable Entity Example:\n";
$ch = curl_init('http://127.0.0.1:8080/api/v1/trip-requests');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'name' => '',
    'email' => 'invalid-email',
    'phone' => '12',
    'budget_currency' => 'XYZ',
    'arrival_date' => '2026-11-20',
    'departure_date' => '2026-11-10'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$res422 = curl_exec($ch);
$code422 = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
echo "HTTP Status: {$code422}\nBody: {$res422}\n\n";

echo "409 Conflict Duplicate Guard Example:\n";
$ch = curl_init('http://127.0.0.1:8080/api/v1/trip-requests');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'name' => "Concurrent Traveler 1",
    'email' => "dup_test@example.com",
    'phone' => "+919876543211",
    'destination_name' => "Kerala Backwaters",
    'travelers' => 2,
    'arrival_date' => '2026-11-10',
    'departure_date' => '2026-11-15',
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$res409 = curl_exec($ch);
$code409 = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
echo "HTTP Status: {$code409}\nBody: {$res409}\n\n";

// --- ITEM 4 & 5: EMAIL MASKING, PUBLIC TOKEN & RATE LIMIT ---
echo "--- ITEM 4 & 5: PUBLIC SUMMARY & RATE LIMIT (429) ---\n";
$latest = $newRows[0];
$refId = $latest['reference_id'];
$tokenStmt = $db->prepare("SELECT public_token FROM contact_messages WHERE id = :id");
$tokenStmt->execute([':id' => $latest['id']]);
$pubToken = $tokenStmt->fetchColumn();

echo "Public Summary using unguessable public_token ({$pubToken}):\n";
$ch = curl_init("http://127.0.0.1:8080/api/v1/trip-requests/public-summary/{$pubToken}");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$resSummary = curl_exec($ch);
$codeSummary = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
echo "HTTP Status: {$codeSummary}\nBody: {$resSummary}\n\n";

echo "Rate Limit 429 Test (triggering 65 rapid requests on public-summary):\n";
for ($i = 0; $i < 65; $i++) {
    $ch = curl_init("http://127.0.0.1:8080/api/v1/trip-requests/public-summary/{$pubToken}");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $resRl = curl_exec($ch);
    $codeRl = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
}
echo "HTTP Status after 65 requests: {$codeRl}\nBody: {$resRl}\n\n";

// --- ITEM 7: DOCUMENTS & DIRECT ACCESS FORBIDDEN ---
echo "--- ITEM 7: DOCUMENTS ---\n";
$docDir = dirname(__DIR__) . '/backend/storage/documents';
echo "Directory Listing of backend/storage/documents:\n";
system("dir \"{$docDir}\"");

echo "\nPHP Upload Max File Size & Post Max Size:\n";
echo "upload_max_filesize = " . ini_get('upload_max_filesize') . "\n";
echo "post_max_size = " . ini_get('post_max_size') . "\n\n";

// --- ITEM 8: RBAC 401 / 403 / 200 TESTS ---
echo "--- ITEM 8: RBAC 401 / 403 / 200 TESTS ---\n";
$ch = curl_init('http://127.0.0.1:8080/api/v1/trip-requests');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$res401 = curl_exec($ch);
$code401 = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
echo "Unauthenticated GET /trip-requests -> HTTP {$code401} Body: {$res401}\n\n";

$ch = curl_init('http://127.0.0.1:8080/api/v1/auth/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['email' => 'admin@wanderersouthindia.com', 'password' => 'Admin@12345']));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$loginRes = json_decode(curl_exec($ch), true);
curl_close($ch);
$adminToken = $loginRes['data']['token'] ?? '';

$ch = curl_init('http://127.0.0.1:8080/api/v1/trip-requests');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer {$adminToken}"]);
$res200 = curl_exec($ch);
$code200 = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
echo "Admin Authenticated GET /trip-requests -> HTTP {$code200}\n\n";

echo "[SQL] SELECT r.name AS role_name, p.name AS permission_name, p.group_name FROM roles r JOIN role_permissions rp ON r.id = rp.role_id JOIN permissions p ON rp.permission_id = p.id WHERE p.name LIKE 'trip_requests%' OR p.name LIKE 'contact%';\n";
$stmt = $db->query("SELECT r.name AS role_name, p.name AS permission_name, p.group_name FROM roles r JOIN role_permissions rp ON r.id = rp.role_id JOIN permissions p ON rp.permission_id = p.id WHERE p.name LIKE 'trip_requests%' OR p.name LIKE 'contact%'");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_PRETTY_PRINT) . "\n\n";

// --- ITEM 9: VALIDATION & TRANSACTION ROLLBACK ---
echo "--- ITEM 9: OPTIONAL FIELDS NULL & ROLLBACK ---\n";
$ch = curl_init('http://127.0.0.1:8080/api/v1/trip-requests');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'name' => "Minimal Traveler",
    'phone' => "+919876500000",
    'arrival_date' => '2026-12-01',
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$resMin = json_decode(curl_exec($ch), true);
curl_close($ch);
$minId = $resMin['data']['id'] ?? 0;

echo "Row in DB for minimal submission (verifying NULL columns):\n";
$stmt = $db->prepare("SELECT id, name, country, pickup_location, vehicle_preference, hotel_category, approximate_budget, passport_file_url, flight_ticket_url FROM contact_messages WHERE id = :id");
$stmt->execute([':id' => $minId]);
echo json_encode($stmt->fetch(PDO::FETCH_ASSOC), JSON_PRETTY_PRINT) . "\n\n";

echo "Transaction Rollback Verification:\n";
$countBefore = (int)$db->query("SELECT count(*) FROM contact_messages")->fetchColumn();
echo "Count before failed transaction: {$countBefore}\n";
try {
    $db->beginTransaction();
    $db->exec("INSERT INTO contact_messages (type, name, phone) VALUES ('trip_request', 'Rollback Test', '+919999999999')");
    $db->exec("INSERT INTO non_existent_table_for_rollback (col) VALUES (1)");
    $db->commit();
} catch (\Throwable $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    echo "Caught expected transaction error: " . $e->getMessage() . " -> Rolled back successfully.\n";
}
$countAfter = (int)$db->query("SELECT count(*) FROM contact_messages")->fetchColumn();
echo "Count after rollback: {$countAfter} (Unchanged: " . ($countBefore === $countAfter ? "YES" : "NO") . ")\n\n";

// --- ITEM 10: CONTACT SEPARATION ---
echo "--- ITEM 10: CONTACT SEPARATION ---\n";
$ch = curl_init('http://127.0.0.1:8080/api/v1/contact-messages');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'type' => 'general_inquiry',
    'name' => 'General Inquirer',
    'email' => 'general_contact@example.com',
    'phone' => '+919876543299',
    'message' => 'Question about tour packages and group discounts.',
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$resContact = json_decode(curl_exec($ch), true);
curl_close($ch);
$contactId = $resContact['data']['id'] ?? 0;

echo "Stored Contact Row in DB:\n";
$stmt = $db->prepare("SELECT id, type, name, email, phone, message, status FROM contact_messages WHERE id = :id");
$stmt->execute([':id' => $contactId]);
echo json_encode($stmt->fetch(PDO::FETCH_ASSOC), JSON_PRETTY_PRINT) . "\n\n";

echo "Stats Breakdown by Type & Status:\n";
$stmt = $db->query("SELECT type, status, count(*) as count FROM contact_messages GROUP BY type, status");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_PRETTY_PRINT) . "\n\n";

// --- ITEM 11: TOUR CARD & CATEGORIES ---
echo "--- ITEM 11: TOUR CATEGORIES & SAMPLE TOUR ---\n";
echo "[SQL] SELECT id, name, slug FROM tour_categories ORDER BY id ASC;\n";
$stmt = $db->query("SELECT id, name, slug FROM tour_categories ORDER BY id ASC");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_PRETTY_PRINT) . "\n\n";

echo "Public Tour List Item Payload:\n";
$ch = curl_init('http://127.0.0.1:8080/api/v1/tours?limit=1');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$resTours = json_decode(curl_exec($ch), true);
curl_close($ch);
echo json_encode($resTours['data'][0] ?? $resTours, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n\n";

// --- ITEM 14: REGRESSION ENDPOINTS ---
echo "--- ITEM 14: REGRESSION ENDPOINTS STATUS CODES ---\n";
$endpoints = [
    ['POST', 'http://127.0.0.1:8080/api/v1/contact-messages', ['type' => 'general_inquiry', 'name' => 'Reg Contact', 'phone' => '+919876543210', 'message' => 'Regression test']],
    ['POST', 'http://127.0.0.1:8080/api/v1/bookings', ['tour_id' => 1, 'customer_name' => 'Reg Booker', 'customer_email' => 'booker@example.com', 'customer_phone' => '+919876543210', 'travel_date' => '2026-11-20', 'adults' => 2]],
    ['GET', 'http://127.0.0.1:8080/api/v1/contact-messages', null, ["Authorization: Bearer {$adminToken}"]],
    ['GET', 'http://127.0.0.1:8080/api/v1/trip-requests/stats', null, ["Authorization: Bearer {$adminToken}"]],
    ['POST', 'http://127.0.0.1:8080/api/v1/auth/logout', null, ["Authorization: Bearer {$adminToken}"]],
];

foreach ($endpoints as $ep) {
    $method = $ep[0];
    $url = $ep[1];
    $data = $ep[2] ?? null;
    $headers = $ep[3] ?? ['Content-Type: application/json'];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        $headers[] = 'Content-Type: application/json';
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $body = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    echo "{$method} {$url} -> HTTP {$code}\n";
}

echo "\nEvidence collection completed.\n";
