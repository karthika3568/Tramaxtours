/**
 * Utility to generate and print/download a high-quality branded PDF Trip Planning Voucher
 * for Wonderer South India.
 */

export function printTripVoucher(data, siteSettings = {}) {
  const siteName = siteSettings.site_name || 'Wonderer South India';
  const sitePhone = siteSettings.contact_phone || '+91 8072566010';
  const siteEmail = siteSettings.contact_email || 'contact@wonderersouthindia.in';
  const siteWhatsApp = siteSettings.contact_whatsapp || '+91 8072566010';
  const refNumber = data.order_number || data.id ? `WSI-TRIP-#${data.id || data.order_number}` : `WSI-REQ-${Date.now().toString().slice(-6)}`;

  const printWindow = window.open('', '_blank', 'width=850,height=950');
  if (!printWindow) {
    alert('Please allow popups to download/print your Trip Plan Voucher.');
    return;
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Custom Trip Plan &amp; Quotation Request — ${refNumber}</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      font-size: 13px;
      line-height: 1.5;
    }
    .voucher-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #1226de;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 900;
      color: #0B1329;
      margin: 0;
      letter-spacing: -0.02em;
    }
    .brand-tagline {
      font-size: 11px;
      color: #1226de;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 2px;
    }
    .voucher-ref-box {
      text-align: right;
    }
    .ref-badge {
      display: inline-block;
      background: rgba(18, 38, 222, 0.08);
      color: #1226de;
      font-weight: 800;
      font-size: 12px;
      padding: 4px 12px;
      border-radius: 999px;
      border: 1px solid rgba(18, 38, 222, 0.25);
    }
    .date-label {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
    }
    .section-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 16px;
      margin-bottom: 14px;
    }
    .section-title {
      font-size: 13px;
      font-weight: 800;
      color: #0B1329;
      margin: 0 0 10px 0;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      display: flex;
      align-items: center;
      gap: 6px;
      border-bottom: 1px dashed #cbd5e1;
      padding-bottom: 6px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px 16px;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px 14px;
    }
    .field-label {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
      display: block;
    }
    .field-value {
      font-size: 13px;
      color: #0f172a;
      font-weight: 700;
    }
    .highlight-pill {
      display: inline-block;
      background: #e0f2fe;
      color: #0369a1;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
    }
    .budget-highlight {
      background: #fef3c7;
      color: #92400e;
      padding: 4px 10px;
      border-radius: 8px;
      font-weight: 800;
      display: inline-block;
    }
    .voucher-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 14px;
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #64748b;
    }
    .quote-box {
      background: #ecfdf5;
      border: 1.5px solid #6ee7b7;
      border-radius: 12px;
      padding: 14px;
      margin-top: 14px;
      text-align: center;
    }
    .quote-amount {
      font-size: 22px;
      font-weight: 900;
      color: #047857;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="no-print" style="background: #0B1329; color: #fff; padding: 12px 20px; margin-bottom: 20px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
    <div><strong>Ready to Print or Save as PDF:</strong> Click the button on the right or press Ctrl+P.</div>
    <button onclick="window.print()" style="background: #1226de; color: #fff; border: none; padding: 8px 18px; border-radius: 8px; font-weight: 800; cursor: pointer;">🖨️ Print / Save PDF</button>
  </div>

  <div class="voucher-header">
    <div>
      <h1 class="brand-title">${siteName}</h1>
      <div class="brand-tagline">Customized Tours • Verified Chauffeurs • South India Packages</div>
      <div style="font-size: 11px; color: #475569; margin-top: 4px;">
        📞 ${sitePhone} | 💬 WhatsApp: ${siteWhatsApp} | ✉️ ${siteEmail}
      </div>
    </div>
    <div class="voucher-ref-box">
      <span class="ref-badge">${refNumber}</span>
      <div class="date-label">Date: ${new Date(data.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
      <div class="date-label">Status: <strong style="text-transform: uppercase; color: #1226de;">${data.status || 'Pending Quotation'}</strong></div>
    </div>
  </div>

  <!-- SECTION 1: CUSTOMER & CONTACT INFORMATION -->
  <div class="section-box">
    <div class="section-title">👤 1. Guest &amp; Contact Details</div>
    <div class="grid-3">
      <div>
        <span class="field-label">Full Name:</span>
        <span class="field-value">${data.name || 'Valued Guest'}</span>
      </div>
      <div>
        <span class="field-label">WhatsApp Contact:</span>
        <span class="field-value">${data.whatsapp_number || data.phone || 'N/A'}</span>
      </div>
      <div>
        <span class="field-label">Email Address:</span>
        <span class="field-value">${data.email || 'N/A'}</span>
      </div>
      <div>
        <span class="field-label">Country / Nationality:</span>
        <span class="field-value">${data.country || 'India'}</span>
      </div>
      <div>
        <span class="field-label">Preferred Contact Mode:</span>
        <span class="field-value">${Array.isArray(data.preferred_contact_methods) ? data.preferred_contact_methods.join(', ') : (data.preferred_contact_methods || 'WhatsApp')}</span>
      </div>
      <div>
        <span class="field-label">Tour / Reference Name:</span>
        <span class="field-value">${data.tour_title || data.subject || 'Custom Tour'}</span>
      </div>
    </div>
  </div>

  <!-- SECTION 2: DESTINATION & DATES -->
  <div class="section-box">
    <div class="section-title">📍 2. Destination, Schedule &amp; Party</div>
    <div class="grid-3">
      <div>
        <span class="field-label">Requested Destination(s):</span>
        <span class="field-value highlight-pill">${data.destination_name || data.destination || 'South India'}</span>
      </div>
      <div>
        <span class="field-label">Pickup Location:</span>
        <span class="field-value">${data.pickup_location || 'Airport / Hotel Pickup'}</span>
      </div>
      <div>
        <span class="field-label">Duration:</span>
        <span class="field-value">${data.duration_days || '5 Days / 4 Nights'}</span>
      </div>
      <div>
        <span class="field-label">Arrival Travel Date:</span>
        <span class="field-value">${data.travel_date || data.arrival_date || 'Flexible'}</span>
      </div>
      <div>
        <span class="field-label">Departure Date:</span>
        <span class="field-value">${data.departure_date || 'Flexible'}</span>
      </div>
      <div>
        <span class="field-label">Party Size (Guests):</span>
        <span class="field-value">${data.adults_count || 1} Adults, ${data.children_count || 0} Children, ${data.infants_count || 0} Infants</span>
      </div>
    </div>
  </div>

  <!-- SECTION 3: TRANSPORTATION & FLIGHT SCHEDULE -->
  <div class="section-box">
    <div class="section-title">🚗 3. Chauffeur Vehicle &amp; Flight Schedules</div>
    <div class="grid-3">
      <div>
        <span class="field-label">Vehicle Preference:</span>
        <span class="field-value">${data.vehicle_preference || 'Innova Crysta'}</span>
      </div>
      <div>
        <span class="field-label">Airport Transfers:</span>
        <span class="field-value">${data.airport_pickup ? '✓ Pickup' : ''} ${data.airport_drop ? '✓ Drop' : ''}</span>
      </div>
      <div>
        <span class="field-label">Guide Required:</span>
        <span class="field-value">${data.tour_guide_required ? `Yes (${data.preferred_language || 'English'})` : 'No'}</span>
      </div>
      <div>
        <span class="field-label">Arrival Flight / Train:</span>
        <span class="field-value">${data.arrival_flight_train_number || 'To be shared'} ${data.arrival_time ? `(${data.arrival_time})` : ''}</span>
      </div>
      <div>
        <span class="field-label">Departure Flight / Train:</span>
        <span class="field-value">${data.departure_flight_train_number || 'To be shared'} ${data.departure_time ? `(${data.departure_time})` : ''}</span>
      </div>
      <div>
        <span class="field-label">Preferred Guide Language:</span>
        <span class="field-value">${data.preferred_language || 'English'}</span>
      </div>
    </div>
  </div>

  <!-- SECTION 4: ACCOMMODATION & BUDGET -->
  <div class="section-box">
    <div class="section-title">🏨 4. Accommodation &amp; Budget Preference</div>
    <div class="grid-3">
      <div>
        <span class="field-label">Hotel Category:</span>
        <span class="field-value">${data.hotel_category || '3 Star Deluxe'}</span>
      </div>
      <div>
        <span class="field-label">Rooms Requested:</span>
        <span class="field-value">${data.rooms_count || 1} Room(s) • ${data.room_type || 'Double Room'}</span>
      </div>
      <div>
        <span class="field-label">Estimated Budget:</span>
        <span class="field-value budget-highlight">${data.budget_currency || 'INR'} ${data.approximate_budget ? Number(data.approximate_budget).toLocaleString() : 'Custom Quotation'}</span>
      </div>
    </div>
  </div>

  ${data.quotation_amount ? `
  <div class="quote-box">
    <div style="font-size: 12px; color: #047857; font-weight: 800; text-transform: uppercase;">Official Wonderer South India Quotation</div>
    <div class="quote-amount">₹${Number(data.quotation_amount).toLocaleString()}</div>
    ${data.admin_notes ? `<div style="font-size: 12px; color: #065f46; margin-top: 4px;"><em>Notes: ${data.admin_notes}</em></div>` : ''}
  </div>
  ` : ''}

  ${data.message || data.special_requests ? `
  <div class="section-box" style="margin-top: 10px;">
    <div class="section-title">📝 Special Requests &amp; Sightseeing Notes</div>
    <div style="font-size: 12px; color: #334155; line-height: 1.6;">${data.message || data.special_requests}</div>
  </div>
  ` : ''}

  <div class="voucher-footer">
    <div>
      <strong>${siteName}</strong> — Direct WhatsApp Hotline: ${siteWhatsApp}
    </div>
    <div>
      Generated on ${new Date().toLocaleString()}
    </div>
  </div>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
