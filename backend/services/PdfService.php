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

        $billingLine = trim(implode(', ', array_filter([
            $billing['address_line1'] ?? '',
            $billing['address_line2'] ?? '',
            $billing['city'] ?? '',
            $billing['state'] ?? '',
            $billing['postal_code'] ?? '',
            $billing['country'] ?? '',
        ])));

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
    body { font-family: 'DejaVu Sans', sans-serif; color: #0B1329; font-size: 12px; }
    .header { border-bottom: 3px solid #01AA90; padding-bottom: 14px; margin-bottom: 20px; }
    .brand { font-size: 22px; font-weight: bold; color: #01AA90; }
    .subtitle { color: #64748b; font-size: 11px; }
    .badge { display: inline-block; background: #e6f7f4; color: #01806C; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
    td, th { padding: 6px 4px; text-align: left; vertical-align: top; }
    .label { color: #64748b; width: 40%; }
    .value { font-weight: bold; }
    .section-title { font-size: 14px; font-weight: bold; color: #0B1329; margin: 18px 0 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    .total-row td { border-top: 2px solid #0B1329; font-size: 14px; font-weight: bold; padding-top: 10px; }
    .footer { margin-top: 30px; padding-top: 14px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 10px; text-align: center; }
</style>
</head>
<body>
    <div class="header">
        <div class="brand">WANDERER SOUTH INDIA</div>
        <div class="subtitle">Booking Confirmation &amp; Receipt</div>
    </div>

    <table>
        <tr>
            <td class="label">Order Number</td>
            <td class="value">{$e($booking['order_number'])}</td>
            <td class="label">Booking Status</td>
            <td class="value"><span class="badge">{$e(strtoupper($booking['booking_status']))}</span></td>
        </tr>
        <tr>
            <td class="label">Booked On</td>
            <td class="value">{$e($booking['created_at'])}</td>
            <td class="label">Payment Method</td>
            <td class="value">{$e(str_replace('_', ' ', ucwords((string) $booking['payment_method'], '_')))}</td>
        </tr>
    </table>

    <div class="section-title">Traveler Details</div>
    <table>
        <tr><td class="label">Name</td><td class="value">{$e($customer['name'] ?? '')}</td></tr>
        <tr><td class="label">Email</td><td class="value">{$e($customer['email'] ?? '')}</td></tr>
        <tr><td class="label">Phone</td><td class="value">{$e($customer['phone'] ?? '')}</td></tr>
        <tr><td class="label">Billing Address</td><td class="value">{$e($billingLine)}</td></tr>
    </table>

    <div class="section-title">Tour Details</div>
    <table>
        <tr><td class="label">Tour</td><td class="value">{$e($tour['title'] ?? '')}</td></tr>
        <tr><td class="label">Destination</td><td class="value">{$e($tour['destination_name'] ?? '')}</td></tr>
        <tr><td class="label">Travel Date</td><td class="value">{$e($booking['booking_date'])}</td></tr>
        <tr><td class="label">Guests</td><td class="value">{$e($booking['tickets_count'])}</td></tr>
    </table>

    <div class="section-title">Payment Summary</div>
    <table>
        <tr><td class="label">Subtotal</td><td class="value">{$e($money($booking['subtotal']))}</td></tr>
        <tr><td class="label">Tax</td><td class="value">{$e($money($booking['tax_amount']))}</td></tr>
        <tr><td class="label">Discount</td><td class="value">-{$e($money($booking['discount_amount']))}</td></tr>
        <tr class="total-row"><td>Total Amount</td><td>{$e($money($booking['total_price']))}</td></tr>
    </table>

    <div class="footer">
        Thank you for booking with Wanderer South India. This is a computer-generated receipt.<br>
        For assistance, contact info@wanderersouthindia.com
    </div>
</body>
</html>
HTML;
    }
}
