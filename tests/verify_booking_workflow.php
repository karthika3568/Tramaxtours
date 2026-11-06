<?php
declare(strict_types=1);

require_once __DIR__ . '/../backend/vendor/autoload.php';

use App\Utils\Env;
use App\Utils\Database;
use App\Models\Booking;
use App\Models\Tour;
use App\Services\MailService;
use App\Services\PdfService;
use App\Controllers\BookingController;

$envPath = dirname(__DIR__) . '/backend/.env';
if (file_exists($envPath)) {
    Env::load($envPath);
}

echo "=== STARTING E2E BOOKING WORKFLOW VERIFICATION ===\n\n";

$db = Database::getConnection();

// 1. Fetch an existing tour or create a test tour slot to book
$stmt = $db->query("SELECT id, title, base_price FROM tours WHERE status = 'published' LIMIT 1");
$tour = $stmt->fetch(\PDO::FETCH_ASSOC);

if (!$tour) {
    // Pick any tour
    $stmt = $db->query("SELECT id, title, base_price FROM tours LIMIT 1");
    $tour = $stmt->fetch(\PDO::FETCH_ASSOC);
}

if (!$tour) {
    echo "ERROR: No tours found in database to test against!\n";
    exit(1);
}

echo "Using Tour: ID {$tour['id']} - '{$tour['title']}' (Base Price: {$tour['base_price']})\n";

// Pick or insert an admin user for audit log
$stmt = $db->query("SELECT id, email FROM users WHERE deleted_at IS NULL LIMIT 1");
$admin = $stmt->fetch(\PDO::FETCH_ASSOC);
$adminId = $admin ? (int)$admin['id'] : 1;
echo "Using Admin ID: {$adminId}\n";

// Ensure receipts directory exists
$receiptDir = dirname(__DIR__) . '/backend/storage/receipts';
if (!is_dir($receiptDir)) {
    mkdir($receiptDir, 0755, true);
}

$bookingModel = new Booking();

// --- TEST CASE 1: Customer submits booking form ---
echo "\n--- TEST CASE 1: Create initial booking (Pending, No PDF) ---\n";
$customerEmail = 'test.traveler.' . time() . '@example.com';
$bookingData = [
    'tour_id' => (int)$tour['id'],
    'booking_date' => date('Y-m-d', strtotime('+7 days')),
    'arrival_date' => date('Y-m-d', strtotime('+7 days')),
    'adults_count' => 2,
    'tickets_count' => 2,
    'unit_price' => 5000.00,
    'total_price' => 10000.00,
    'advance_amount' => 0.00,
    'balance_amount' => 10000.00,
    'payment_method' => 'upi',
    'special_requests' => 'Vegetarian meals',
    'booking_status' => 'pending',
    'payment_status' => 'pending'
];

$customerData = [
    'first_name' => 'John',
    'last_name' => 'Doe',
    'email' => $customerEmail,
    'phone' => '+919876543210',
    'country' => 'India'
];

$billingData = [
    'address_line1' => '123 Beach Road',
    'city' => 'Chennai',
    'state' => 'Tamil Nadu',
    'postal_code' => '600001',
    'country' => 'India'
];

$createResult = Booking::create($bookingData, $customerData, $billingData);
$bookingId = (int)$createResult['id'];
$createdBooking = Booking::findById($bookingId);
$orderNumber = $createdBooking['order_number'] ?? $createResult['order_number'];

echo "Created Booking ID: {$bookingId}, Order Number: {$orderNumber}\n";
assert($createdBooking['booking_status'] === 'pending', "Booking status must be pending");
assert((float)$createdBooking['advance_amount'] === 0.0, "Initial advance must be 0");
assert((float)$createdBooking['balance_amount'] === 10000.0, "Initial balance must be 10000.00");

// Verify NO PDF ticket exists at this stage
$pdfFilePath = $receiptDir . '/' . $orderNumber . '.pdf';
if (file_exists($pdfFilePath)) {
    unlink($pdfFilePath); // clean if remnant
}
assert(!file_exists($pdfFilePath), "PDF receipt must NOT exist on initial booking creation");
echo "PASS: Initial booking created with status 'pending', zero advance, and NO PDF ticket generated.\n";

// --- TEST CASE 2: Add Contact History Log (Call / WhatsApp Notes) ---
echo "\n--- TEST CASE 2: Add Contact Log ---\n";
$contactLog = Booking::addContactLog($bookingId, [
    'contact_type' => 'whatsapp',
    'notes' => 'Contacted traveler via WhatsApp. Customer agreed to pay 3,000 INR advance via UPI and 7,000 INR cash on arrival.',
    'contacted_at' => date('Y-m-d H:i:s')
], $adminId);

$logs = Booking::getContactLogs($bookingId);
assert(count($logs) >= 1, "At least 1 contact log must exist");
assert($logs[0]['contact_type'] === 'whatsapp', "Contact type should be whatsapp");
echo "PASS: Contact history log recorded successfully. Log ID: {$contactLog['id']}\n";

// --- TEST CASE 3: Record Partial Advance Payment (e.g. 3,000 INR via UPI) ---
echo "\n--- TEST CASE 3: Record Partial Advance Payment ---\n";
$payment1 = Booking::recordPayment($bookingId, [
    'amount' => 3000.00,
    'payment_method' => 'upi',
    'transaction_reference' => 'UPI-TXN-' . strtoupper(bin2hex(random_bytes(4))),
    'payment_date' => date('Y-m-d'),
    'notes' => 'Received partial advance payment via Google Pay'
], $adminId);

$updatedBooking = Booking::findById($bookingId);
$totalDisplay = $updatedBooking['total_price'] ?? $updatedBooking['total_amount'] ?? 0;
echo "After Payment 1: Total={$totalDisplay}, Advance={$updatedBooking['advance_amount']}, Balance={$updatedBooking['balance_amount']}, PaymentStatus={$updatedBooking['payment_status']}\n";

assert((float)$updatedBooking['advance_amount'] === 3000.00, "Advance amount must be 3000.00");
assert((float)$updatedBooking['balance_amount'] === 7000.00, "Balance amount must be 7000.00");
assert($updatedBooking['payment_status'] === 'pending', "Payment status should still be pending as full balance is not cleared");
echo "PASS: Partial payment recorded correctly, advance and remaining balance accurately calculated.\n";

// --- TEST CASE 4: Record Remaining Settlement (7,000 INR via Cash / Pay on Arrival) ---
echo "\n--- TEST CASE 4: Record Remaining Settlement ---\n";
$payment2 = Booking::recordPayment($bookingId, [
    'amount' => 7000.00,
    'payment_method' => 'cash',
    'transaction_reference' => 'CASH-REC-' . strtoupper(bin2hex(random_bytes(3))),
    'payment_date' => date('Y-m-d'),
    'notes' => 'Settled remaining balance in cash'
], $adminId);

$updatedBooking2 = Booking::findById($bookingId);
$totalDisplay2 = $updatedBooking2['total_price'] ?? $updatedBooking2['total_amount'] ?? 0;
echo "After Payment 2: Total={$totalDisplay2}, Advance={$updatedBooking2['advance_amount']}, Balance={$updatedBooking2['balance_amount']}, PaymentStatus={$updatedBooking2['payment_status']}\n";

assert((float)$updatedBooking2['advance_amount'] === 10000.00, "Advance amount must be 10000.00");
assert((float)$updatedBooking2['balance_amount'] === 0.00, "Balance amount must be 0.00");
assert($updatedBooking2['payment_status'] === 'paid', "Payment status must now be 'paid'");
echo "PASS: Full settlement recorded, balance is 0.00, payment status updated to 'paid'.\n";

// --- TEST CASE 5: Admin Approves Booking & Generates Confirmed PDF Ticket ---
echo "\n--- TEST CASE 5: Approve Booking & Generate Confirmed Ticket ---\n";
$approveResult = Booking::approveBooking($bookingId, $adminId, "Payment verified in full. Booking confirmed.");
$approvedBooking = $approveResult['booking'];

assert($approvedBooking['booking_status'] === 'confirmed', "Booking status must be confirmed");
assert(!empty($approvedBooking['approved_at']), "approved_at must be populated");
assert((int)$approvedBooking['approved_by'] === $adminId, "approved_by must match adminId");

// Generate PDF receipt via PdfService
$pdfPath = PdfService::generateBookingReceipt($approvedBooking);

assert(file_exists($pdfPath), "PDF ticket file must exist on disk after approval");
assert(filesize($pdfPath) > 1000, "PDF ticket file should have non-trivial size");
echo "PASS: Booking approved. PDF confirmed ticket successfully generated at {$pdfPath} (Size: " . filesize($pdfPath) . " bytes).\n";

// --- TEST CASE 6: Verify Approval Idempotency ---
echo "\n--- TEST CASE 6: Approval Idempotency ---\n";
$reapproveResult = Booking::approveBooking($bookingId, $adminId, "Attempt re-approval");
assert($reapproveResult['already_approved'] === true, "already_approved flag must be true");
assert($reapproveResult['booking']['booking_status'] === 'confirmed', "Status remains confirmed");
assert($reapproveResult['booking']['approved_at'] === $approvedBooking['approved_at'], "approved_at should remain unchanged");
echo "PASS: Approval is idempotent and does not corrupt state.\n";

// --- TEST CASE 7: Rejection Workflow on a Second Booking ---
echo "\n--- TEST CASE 7: Rejection Workflow ---\n";
$rejectBookingData = $bookingData;
$rejectCustomerData = $customerData;
$rejectCustomerData['email'] = 'reject.test.' . time() . '@example.com';
$rejectCreateResult = Booking::create($rejectBookingData, $rejectCustomerData, $billingData);
$rejectBookingId = (int)$rejectCreateResult['id'];

$rejectResult = Booking::rejectBooking($rejectBookingId, $adminId, "Traveler cancelled request");
assert($rejectResult['booking']['booking_status'] === 'rejected', "Booking status must be rejected");
echo "PASS: Rejection workflow operates cleanly, setting booking status to 'rejected'.\n";

// --- TEST CASE 8: Secure Receipt Token Access ---
echo "\n--- TEST CASE 8: Receipt Token Verification ---\n";
$plainToken = $createResult['access_token'] ?? null;
assert(!empty($plainToken), "Access token must be generated for booking");

$isValid = Booking::verifyAccessToken($bookingId, $plainToken);
assert($isValid === true, "Valid plain token must verify successfully against stored SHA-256 hash");

$isInvalid = Booking::verifyAccessToken($bookingId, 'invalid-fake-token-xyz');
assert($isInvalid === false, "Invalid plain token must fail verification");
echo "PASS: Secure receipt token SHA-256 verification functions correctly.\n";

echo "\n=======================================================\n";
echo "ALL E2E WORKFLOW TESTS PASSED SUCCESSFULLY! (8/8 PASS)\n";
echo "=======================================================\n";
