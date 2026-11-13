<?php

namespace App\Services;

use Dompdf\Dompdf;
use Dompdf\Options;

class PdfService
{
    /**
     * Directory PDF receipts are written to. Deliberately outside `backend/public/`
     * so they are never directly web-accessible — only BookingController::receipt()
     * (which checks ownership/permission) may serve them.
     */
    private static function storagePath(): string
    {
        $dir = dirname(__DIR__) . '/storage/receipts';
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }
        return $dir;
    }

    /**
     * Generate (or regenerate) the booking confirmation PDF and return its file path.
     *
     * @param array $booking Formatted booking (Booking::formatBookingDetails() shape)
     * @return string Absolute file path to the generated PDF
     */
    public static function generateBookingReceipt(array $booking): string
    {
        $options = new Options();
        $options->set('isRemoteEnabled', false);
        $options->set('defaultFont', 'DejaVu Sans');

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml(self::renderReceiptHtml($booking));
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        $path = self::storagePath() . '/' . $booking['order_number'] . '.pdf';
        file_put_contents($path, $dompdf->output());

        return $path;
    }

    /**
     * Path a receipt would be saved at, without generating it.
     */
    public static function receiptPathFor(string $orderNumber): string
    {
        return self::storagePath() . '/' . $orderNumber . '.pdf';
    }

    private static function renderReceiptHtml(array $booking): string
    {
        $e = fn($v) => htmlspecialchars((string) ($v ?? ''), ENT_QUOTES, 'UTF-8');

        $customer = $booking['customer'] ?? [];
        $tour = $booking['tour'] ?? [];
        $billing = $booking['billing_address'] ?? [];

        $currency = $booking['currency'] ?? 'INR';
        $money = fn($amount) => $currency . ' ' . number_format((float) $amount, 2);

        $totalPrice = (float) ($booking['agreed_price'] ?? ($booking['total_price'] ?? 0.0));
        $advanceAmount = (float) ($booking['advance_amount'] ?? 0.0);
        $balanceAmount = (float) ($booking['balance_amount'] ?? max(0.0, $totalPrice - $advanceAmount));
        $ticketNumber = !empty($booking['ticket_number']) ? $booking['ticket_number'] : ('TKT-' . date('Ymd') . '-' . substr(strtoupper(bin2hex(random_bytes(2))), 0, 4));

        $billingLine = trim(implode(', ', array_filter([
            $billing['address_line1'] ?? '',
            $billing['address_line2'] ?? '',
            $billing['city'] ?? '',
            $billing['state'] ?? '',
            $billing['postal_code'] ?? '',
            $billing['country'] ?? '',
        ])));

        $logoPath = dirname(__DIR__, 2) . '/public/logo.png';
        $logoBase64 = file_exists($logoPath) ? 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath)) : '';
        $logoTag = $logoBase64 ? '<img src="' . $logoBase64 . '" style="height: 48px; margin-bottom: 6px;" alt="Wanderer South India" />' : '';

        $paymentMethodFormatted = ucwords(str_replace('_', ' ', (string) ($booking['payment_method'] ?? 'Manual Payment')));
        $travelDate = $booking['arrival_date'] ?? $booking['booking_date'] ?? date('Y-m-d');
        $duration = $booking['duration_days'] ?? $tour['duration_days'] ?? ($tour['duration_text'] ?? '1 Day');

        $approvedText = !empty($booking['confirmed_at']) 
            ? date('d M Y, h:i A', strtotime($booking['confirmed_at'])) 
            : (!empty($booking['approved_at']) ? date('d M Y, h:i A', strtotime($booking['approved_at'])) : date('d M Y, h:i A'));

        $balanceBadge = ($balanceAmount <= 0.001)
            ? '<span class="badge badge-paid">FULLY SETTLED ✓</span>'
            : '<span class="badge badge-balance">BALANCE PAYABLE: ' . $e($money($balanceAmount)) . '</span>';

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
    body { font-family: 'DejaVu Sans', sans-serif; color: #0B1329; font-size: 11.5px; line-height: 1.45; margin: 0; padding: 10px; }
    .header { border-bottom: 3px solid #01AA90; padding-bottom: 12px; margin-bottom: 16px; }
    .brand-row { width: 100%; }
    .brand { font-size: 20px; font-weight: bold; color: #01AA90; }
    .company-sub { font-size: 10px; color: #64748b; font-weight: normal; margin-top: 2px; }
    .doc-type { text-align: right; vertical-align: top; }
    .doc-title { font-size: 15px; font-weight: bold; color: #0B1329; text-transform: uppercase; letter-spacing: 0.5px; }
    .ticket-badge { display: inline-block; background: #01AA90; color: #ffffff; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-top: 3px; }
    .doc-ref { font-size: 12px; font-weight: bold; color: #475569; margin-top: 2px; }
    
    .status-banner { background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 6px; padding: 10px 14px; margin-bottom: 16px; }
    .status-banner td { padding: 2px 4px; }

    .badge { display: inline-block; padding: 4px 10px; border-radius: 10px; font-size: 10.5px; font-weight: bold; }
    .badge-confirmed { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
    .badge-paid { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
    .badge-balance { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }

    table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
    td, th { padding: 5px 4px; text-align: left; vertical-align: top; }
    .label { color: #64748b; width: 35%; font-size: 11px; }
    .value { font-weight: bold; font-size: 11.5px; color: #0B1329; }
    
    .section-title { font-size: 12.5px; font-weight: bold; color: #0B1329; margin: 14px 0 6px; border-bottom: 1.5px solid #01AA90; padding-bottom: 3px; text-transform: uppercase; letter-spacing: 0.5px; }
    
    .box-table { border: 1px solid #e2e8f0; border-radius: 6px; background: #fafafa; }
    .box-table td { border-bottom: 1px solid #f1f5f9; padding: 6px 8px; }
    .box-table tr:last-child td { border-bottom: none; }

    .payment-table { border: 1.5px solid #cbd5e1; }
    .payment-table th { background: #f1f5f9; font-weight: bold; border-bottom: 1.5px solid #cbd5e1; padding: 7px 8px; }
    .payment-table td { padding: 7px 8px; border-bottom: 1px solid #e2e8f0; }
    .highlight-balance { background: #fef2f2; font-weight: bold; color: #b91c1c; font-size: 13px; }
    .highlight-total { font-size: 13px; font-weight: bold; color: #0B1329; background: #f8fafc; }
    
    .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #cbd5e1; color: #64748b; font-size: 9.5px; text-align: center; line-height: 1.5; }
    .contact-box { background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 8px 12px; margin-top: 14px; font-size: 10.5px; }
</style>
</head>
<body>
    <div class="header">
        <table class="brand-row">
            <tr>
                <td style="width: 55%; padding: 0;">
                    {$logoTag}
                    <div class="brand">Wanderer South India</div>
                    <div class="company-sub">Operated by Tramax Tours • South India Tour &amp; Experience Specialists</div>
                    <div style="font-size: 9.5px; color: #64748b; margin-top: 3px;">
                        Phone/WhatsApp: +91 9840291110 • Email: welcome@yourbestdayinindia.com
                    </div>
                </td>
                <td class="doc-type" style="width: 45%; padding: 0;">
                    <div class="doc-title">Confirmed Tour Ticket</div>
                    <div class="ticket-badge">Ticket #: {$e($ticketNumber)}</div>
                    <div class="doc-ref">Booking Ref: #{$e($booking['order_number'])}</div>
                    <div style="color: #64748b; font-size: 10px; margin-top: 3px;">Confirmed On: {$e($approvedText)}</div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Confirmation Banner -->
    <table class="status-banner">
        <tr>
            <td style="width: 50%;">
                <span class="label">Booking Confirmation Status:</span><br>
                <span class="badge badge-confirmed">CONFIRMED ✓</span>
            </td>
            <td style="width: 50%; text-align: right;">
                <span class="label">Payment Settlement Status:</span><br>
                {$balanceBadge}
            </td>
        </tr>
    </table>

    <!-- Traveler Information -->
    <div class="section-title">1. Traveler Information</div>
    <table class="box-table">
        <tr>
            <td class="label">Customer Full Name</td>
            <td class="value">{$e($customer['name'] ?? trim(($booking['first_name'] ?? '') . ' ' . ($booking['last_name'] ?? '')))}</td>
            <td class="label">Primary Mobile Number</td>
            <td class="value">{$e($customer['phone'] ?? $booking['phone'] ?? 'N/A')}</td>
        </tr>
        <tr>
            <td class="label">Email Address</td>
            <td class="value">{$e($customer['email'] ?? $booking['email'] ?? 'N/A')}</td>
            <td class="label">Country of Residence</td>
            <td class="value">{$e($customer['country'] ?? $booking['country'] ?? 'India')}</td>
        </tr>
        <tr>
            <td class="label">Pickup Location</td>
            <td class="value" colspan="3">{$e($booking['pickup_location'] ?? 'Hotel / Airport Pickup')}</td>
        </tr>
        {if:billingLine}
        <tr>
            <td class="label">Billing / Contact Address</td>
            <td class="value" colspan="3">{$e($billingLine ?: 'On File')}</td>
        </tr>
    </table>

    <!-- Tour & Itinerary Specifications -->
    <div class="section-title">2. Tour &amp; Schedule Details</div>
    <table class="box-table">
        <tr>
            <td class="label">Tour Package</td>
            <td class="value" colspan="3" style="font-size: 12.5px; color: #01AA90;">
                {$e($tour['title'] ?? $booking['destination_name'] ?? 'South India Tour')}
            </td>
        </tr>
        <tr>
            <td class="label">Tour Type / Category</td>
            <td class="value">{$e($tour['tour_type'] ?? 'Curated Tour')}</td>
            <td class="label">Scheduled Travel Date</td>
            <td class="value">{$e($travelDate)}</td>
        </tr>
        <tr>
            <td class="label">Tour Duration</td>
            <td class="value">{$e($duration)}</td>
            <td class="label">Travellers Count</td>
            <td class="value">{$e($booking['tickets_count'])} Travellers ({$e($booking['adults_count'] ?? 1)} Adults, {$e($booking['children_count'] ?? 0)} Children)</td>
        </tr>
        {if:vehicle}
        <tr>
            <td class="label">Vehicle Preference</td>
            <td class="value">{$e($booking['vehicle_preference'] ?? 'Air-Conditioned Private Transport')}</td>
            <td class="label">Special Instructions</td>
            <td class="value">{$e($booking['special_requests'] ?? ($booking['customer_notes'] ?? 'None'))}</td>
        </tr>
    </table>

    <!-- Financial & Payment Summary -->
    <div class="section-title">3. Payment &amp; Confirmation Summary</div>
    <table class="payment-table">
        <thead>
            <tr>
                <th>Description</th>
                <th style="text-align: right;">Amount ({$e($currency)})</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Agreed / Confirmed Tour Package Price</td>
                <td style="text-align: right; font-weight: bold; font-size: 12px;">{$e($money($totalPrice))}</td>
            </tr>
            <tr>
                <td>Agreed Payment Method</td>
                <td style="text-align: right; font-weight: bold;">{$e($paymentMethodFormatted)}</td>
            </tr>
            <tr>
                <td>Advance Payment Received</td>
                <td style="text-align: right; color: #15803d; font-weight: bold;">{$e($money($advanceAmount))}</td>
            </tr>
            <tr class="highlight-balance">
                <td><strong>Remaining Balance Payable</strong></td>
                <td style="text-align: right;"><strong>{$e($money($balanceAmount))}</strong></td>
            </tr>
        </tbody>
    </table>

    <!-- Contact & Emergency Notice -->
    <div class="contact-box">
        <strong>Important Tour Instructions:</strong>
        <ul style="margin: 4px 0 0; padding-left: 18px;">
            <li>Please present this confirmed digital ticket or printed voucher to your tour guide / chauffeur at pickup.</li>
            <li>Any remaining balance of <strong>{$e($money($balanceAmount))}</strong> will be settled via <strong>{$e($paymentMethodFormatted)}</strong> as discussed.</li>
            <li>Our local coordinator is available 24/7 for any assistance, flight updates, or pickup timing changes: <strong>+91 9840291110 / +91 8072566010</strong>.</li>
        </ul>
    </div>

    <div class="footer">
        <strong>Wanderer South India (Tramax Tours)</strong> • Authentic Tours, Heritage Journeys &amp; Local Guidance<br>
        Email: welcome@yourbestdayinindia.com • Phone/WhatsApp: +91 9840291110 • Website: www.yourbestdayinindia.com<br>
        Official Confirmed Tour Ticket • Generated under authorized administrator approval.
    </div>
</body>
</html>
HTML;
HTML;
    }
}
