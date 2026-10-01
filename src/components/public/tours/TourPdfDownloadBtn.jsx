import { useState } from 'react';
import { useCurrency } from '../../../context/CurrencyContext';

export default function TourPdfDownloadBtn({ tour }) {
  const { formatPrice } = useCurrency();
  const [isGenerating, setIsGenerating] = useState(false);

  if (!tour) return null;

  const handleDownloadPdf = () => {
    setIsGenerating(true);

    const destinationName = tour.destination?.name || tour.destination_name || 'South India';
    const priceText = tour.base_price ? formatPrice(tour.base_price) : 'On Request';
    const travelDays = tour.travel_days || 'Daily Departures';
    const duration = tour.duration_days ? `${tour.duration_days} Day(s)` : (tour.duration_text || 'Full Day');

    // Parse highlights
    let highlights = [];
    if (Array.isArray(tour.highlights)) {
      highlights = tour.highlights;
    } else if (typeof tour.highlights === 'string') {
      try {
        const parsed = JSON.parse(tour.highlights);
        highlights = Array.isArray(parsed) ? parsed : [tour.highlights];
      } catch {
        highlights = tour.highlights.split('\n').filter(Boolean);
      }
    }

    // Parse inclusions / exclusions
    let inclusions = [];
    if (Array.isArray(tour.inclusions)) {
      inclusions = tour.inclusions;
    } else if (typeof tour.inclusions === 'string') {
      try {
        const parsed = JSON.parse(tour.inclusions);
        inclusions = Array.isArray(parsed) ? parsed : [tour.inclusions];
      } catch {
        inclusions = tour.inclusions.split('\n').filter(Boolean);
      }
    }

    let exclusions = [];
    if (Array.isArray(tour.exclusions)) {
      exclusions = tour.exclusions;
    } else if (typeof tour.exclusions === 'string') {
      try {
        const parsed = JSON.parse(tour.exclusions);
        exclusions = Array.isArray(parsed) ? parsed : [tour.exclusions];
      } catch {
        exclusions = tour.exclusions.split('\n').filter(Boolean);
      }
    }

    // Parse itinerary days
    const itinerary = Array.isArray(tour.itinerary) && tour.itinerary.length > 0
      ? tour.itinerary
      : Array.isArray(tour.itinerary_days) && tour.itinerary_days.length > 0
      ? tour.itinerary_days
      : null;

    // Create a styled printable HTML document in a new window
    const printWindow = window.open('', '_blank', 'width=850,height=950');
    if (!printWindow) {
      alert('Please allow popups to download the Tour PDF Brochure.');
      setIsGenerating(false);
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>${tour.title} — Wonderer South India Itinerary</title>
        <style>
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            line-height: 1.5;
            margin: 0;
            padding: 20px;
            background: #ffffff;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #064d71;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .brand-title {
            font-size: 24px;
            font-weight: 800;
            color: #064d71;
            letter-spacing: 0.5px;
            margin: 0;
          }
          .brand-sub {
            font-size: 12px;
            color: #FC961B;
            font-weight: 700;
            text-transform: uppercase;
          }
          .contact-meta {
            text-align: right;
            font-size: 11.5px;
            color: #64748b;
          }
          .tour-hero {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 18px;
            margin-bottom: 20px;
          }
          .tour-title {
            font-size: 22px;
            font-weight: 800;
            color: #0f172a;
            margin: 0 0 10px;
          }
          .badge-row {
            display: flex;
            gap: 10px;
            margin-bottom: 12px;
            flex-wrap: wrap;
          }
          .badge {
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
          }
          .badge-blue { background: #e0f2fe; color: #0369a1; }
          .badge-green { background: #e6f7f4; color: #01806C; }
          .badge-orange { background: #ffedd5; color: #c2410c; }
          .tour-desc {
            font-size: 13.5px;
            color: #334155;
            margin: 0;
          }
          .section-heading {
            font-size: 16px;
            font-weight: 800;
            color: #064d71;
            border-bottom: 1.5px solid #cbd5e1;
            padding-bottom: 6px;
            margin: 22px 0 12px;
          }
          .highlights-list {
            padding-left: 20px;
            margin: 0;
            font-size: 13px;
          }
          .highlights-list li {
            margin-bottom: 6px;
            color: #334155;
          }
          .inc-exc-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
          }
          .inc-box {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 12px;
          }
          .exc-box {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 12px;
          }
          .box-title {
            font-size: 13px;
            font-weight: 800;
            margin: 0 0 8px;
          }
          .inc-title { color: #166534; }
          .exc-title { color: #991b1b; }
          .check-list {
            list-style: none;
            padding: 0;
            margin: 0;
            font-size: 12px;
          }
          .check-list li {
            margin-bottom: 5px;
            line-height: 1.4;
          }
          .itinerary-day {
            border-left: 3px solid #01AA90;
            padding-left: 14px;
            margin-bottom: 14px;
          }
          .day-title {
            font-size: 14px;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 4px;
          }
          .day-desc {
            font-size: 12.5px;
            color: #475569;
            margin: 0;
          }
          .footer-note {
            margin-top: 25px;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
          }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="brand-title">WONDERER SOUTH INDIA</h1>
            <span class="brand-sub">Private Tours, Chauffeur Guides & Handcrafted Itineraries</span>
          </div>
          <div class="contact-meta">
            <div>📞 WhatsApp: +91 8072566010</div>
            <div>✉️ Email: info@wandersouthindia.com</div>
            <div>🌐 www.wandersouthindia.com</div>
          </div>
        </div>

        <div class="tour-hero">
          <h2 class="tour-title">${tour.title}</h2>
          <div class="badge-row">
            <span class="badge badge-blue">📍 Destination: ${destinationName}</span>
            <span class="badge badge-green">⏱️ Duration: ${duration}</span>
            <span class="badge badge-orange">🗓️ Runs: ${travelDays}</span>
            <span class="badge badge-blue">🏷️ Starting From: ${priceText}</span>
          </div>
          <p class="tour-desc">
            ${tour.short_description || tour.description || 'Enjoy a private, customized tour across premier destinations in South India with a sanitized AC vehicle and certified chauffeur guide.'}
          </p>
        </div>

        ${highlights.length > 0 ? `
          <div class="section-heading">✨ Tour Highlights</div>
          <ul class="highlights-list">
            ${highlights.map((h) => `<li>${typeof h === 'string' ? h : h.text || h.title}</li>`).join('')}
          </ul>
        ` : ''}

        ${itinerary && itinerary.length > 0 ? `
          <div class="section-heading">📅 Day-by-Day Itinerary</div>
          ${itinerary.map((day, idx) => `
            <div class="itinerary-day">
              <h4 class="day-title">Day ${day.day_number || idx + 1}: ${day.title || 'Sightseeing & Excursions'}</h4>
              <p class="day-desc">${day.description || 'Full day guided exploration, historical sightseeing, and cultural experience.'}</p>
            </div>
          `).join('')}
        ` : ''}

        <div class="section-heading">📋 Inclusions & Exclusions</div>
        <div class="inc-exc-grid">
          <div class="inc-box">
            <h4 class="box-title inc-title">✅ What is Included</h4>
            <ul class="check-list">
              ${inclusions.length > 0 ? inclusions.map((item) => `<li>✓ ${typeof item === 'string' ? item : item.name}</li>`).join('') : `
                <li>✓ Dedicated sanitized AC vehicle (Sedan / SUV / Tempo)</li>
                <li>✓ Professional English/German speaking chauffeur</li>
                <li>✓ All fuel, toll gates, interstate taxes and parking charges</li>
                <li>✓ Hotel pickup and drop-off in South India</li>
              `}
            </ul>
          </div>
          <div class="exc-box">
            <h4 class="box-title exc-title">❌ What is Excluded</h4>
            <ul class="check-list">
              ${exclusions.length > 0 ? exclusions.map((item) => `<li>✕ ${typeof item === 'string' ? item : item.name}</li>`).join('') : `
                <li>✕ Monument and temple entrance camera fees</li>
                <li>✕ Meals, beverages and personal shopping expenses</li>
                <li>✕ Gratuities and tips for driver/guide (optional)</li>
              `}
            </ul>
          </div>
        </div>

        <div class="footer-note">
          © ${new Date().getFullYear()} Wonderer South India. All Rights Reserved. For bookings and custom inquiries, contact info@wandersouthindia.com or +91 8072566010.
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setIsGenerating(false);
  };

  return (
    <button
      type="button"
      className="btn btn-outline btn-sm btn-download-itinerary-pdf"
      onClick={handleDownloadPdf}
      disabled={isGenerating}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        borderRadius: '8px',
        fontWeight: 700,
        fontSize: '13px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      title="Download & Print Tour Itinerary Brochure"
    >
      <span>📄</span>
      <span>{isGenerating ? 'Preparing PDF...' : 'Download Itinerary (PDF)'}</span>
    </button>
  );
}
