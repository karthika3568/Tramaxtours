import { useState, useEffect } from 'react';
import { 
  PrintIcon, 
  XIcon, 
  DownloadIcon, 
  TicketIcon, 
  FileTextIcon, 
  CheckCircleIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  CreditCardIcon,
} from '../../../components/common/Icons';
import { bookingService } from '../../../services/bookingService';
import { useToast } from '../../../context/ToastContext';

/**
 * High-resolution Vector SVG Barcode Generator
 * Produces crisp, non-blurry parallel lines for 1200+ DPI print outputs.
 */
function BarcodeSvg({ value, height = 36, className = 'ticket-barcode-svg' }) {
  const str = String(value || 'TKT-000000');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const binary = Math.abs(hash).toString(2).padStart(30, '10110010');
  const fullBits = `1010${binary}${binary.split('').reverse().join('')}10101`;

  return (
    <svg 
      className={className} 
      height={height} 
      viewBox={`0 0 ${fullBits.length * 2.2} ${height}`} 
      preserveAspectRatio="none"
      aria-label={`Barcode for ${str}`}
    >
      {fullBits.split('').map((bit, idx) =>
        bit === '1' ? (
          <rect 
            key={idx} 
            x={idx * 2.2} 
            y="0" 
            width={idx % 4 === 0 ? 2.4 : 1.4} 
            height={height} 
            fill="#0b1329" 
          />
        ) : null
      )}
    </svg>
  );
}

export default function BookingPrintModal({ booking, isOpen, onClose }) {
  const toast = useToast();
  const [layoutMode, setLayoutMode] = useState('a4'); // 'a4' | 'compact'
  const [data, setData] = useState(booking || {});
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Synchronize and dynamically fetch latest database record
  useEffect(() => {
    if (!isOpen || !booking?.id) return;
    setData(booking);

    let isMounted = true;
    setIsLoadingDetails(true);

    bookingService
      .getBooking(booking.id)
      .then((fresh) => {
        if (isMounted && fresh) {
          setData(fresh);
        }
      })
      .catch((err) => {
        console.warn('Could not refresh full booking record, using provided data:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingDetails(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, booking?.id]);

  if (!isOpen || !booking) return null;

  // Formatters
  const formatMoney = (amount, cur = 'INR') => {
    const num = Number(amount || 0);
    const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
    const sym = symbols[cur] || (cur ? cur + ' ' : '₹');
    return `${sym} ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (val) => {
    if (!val) return 'Flexible / To be confirmed';
    try {
      return new Date(val).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return String(val);
    }
  };

  const formatDateTime = (val) => {
    if (!val) return 'N/A';
    try {
      return new Date(val).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return String(val);
    }
  };

  const formatPaymentMethod = (method) => {
    if (!method) return 'Pay on Arrival / Direct Payment';
    return String(method)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Dynamic Data Mapping
  const currency = data.currency || 'INR';
  const totalPrice = Number(data.agreed_price ?? (data.total_price ?? 0));
  const advanceAmount = Number(data.advance_amount ?? 0);
  const balanceAmount = Number(data.balance_amount ?? Math.max(0, totalPrice - advanceAmount));

  const ticketNumber =
    data.ticket_number ||
    `TKT-${data.order_number || String(data.id).padStart(6, '0')}`;

  const customerName =
    data.customer?.name ||
    `${data.first_name || ''} ${data.last_name || ''}`.trim() ||
    data.name ||
    'Guest Traveler';

  const customerEmail = data.customer?.email || data.email || 'N/A';
  const customerPhone = data.customer?.phone || data.phone || 'N/A';
  const customerCountry = data.customer?.country || data.country || 'India';
  const pickupLocation = data.pickup_location || 'Hotel / Airport Pickup (To be coordinated)';

  const tourTitle = data.tour?.title || data.destination_name || 'South India Curated Experience';
  const tourType = data.tour?.tour_type || (Array.isArray(data.tour_types) ? data.tour_types.join(', ') : 'Curated Tour');
  const duration = data.duration_days
    ? `${data.duration_days} Day(s)`
    : data.tour?.duration_days
    ? `${data.tour.duration_days} Day(s)`
    : 'Standard';

  const travelDate = data.arrival_date || data.booking_date;
  const passengersCount = Number(data.tickets_count || 1);
  const adultsCount = Number(data.adults_count ?? passengersCount);
  const childrenCount = Number(data.children_count ?? 0);

  const confirmedDateText = data.confirmed_at
    ? formatDateTime(data.confirmed_at)
    : data.approved_at
    ? formatDateTime(data.approved_at)
    : data.created_at
    ? formatDateTime(data.created_at)
    : 'Confirmed';

  const isConfirmed = data.booking_status === 'confirmed';
  const isSettled = balanceAmount <= 0.001;

  // Actions
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      const blob = await bookingService.downloadReceipt(data.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${data.order_number || data.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Official PDF ticket downloaded successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to download official PDF receipt.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="modal-backdrop print-modal-backdrop" onClick={onClose}>
      <div
        className="modal-container modal-large booking-print-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '940px' }}
      >
        {/* ============================================================== */}
        {/* Modal Controls Bar (Hidden during Print)                       */}
        {/* ============================================================== */}
        <div className="modal-header no-print" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 className="modal-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <PrintIcon size={20} /> Print Tour Ticket
            </h2>
            {isLoadingDetails && (
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Refreshing latest details...</span>
            )}
          </div>

          {/* Layout Selector & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div className="print-layout-controls" role="group" aria-label="Ticket Layout Mode">
              <button
                type="button"
                className={`btn-layout-toggle ${layoutMode === 'a4' ? 'active' : ''}`}
                onClick={() => setLayoutMode('a4')}
                title="Full A4 formal voucher and audit summary"
              >
                <FileTextIcon size={14} /> A4 Voucher
              </button>
              <button
                type="button"
                className={`btn-layout-toggle ${layoutMode === 'compact' ? 'active' : ''}`}
                onClick={() => setLayoutMode('compact')}
                title="Compact Boarding Pass ticket format"
              >
                <TicketIcon size={14} /> Boarding Pass
              </button>
            </div>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              title="Download backend-generated official PDF matching email attachment"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <DownloadIcon size={14} />
              {isDownloadingPdf ? 'Generating PDF...' : 'Download Official PDF'}
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handlePrint}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <PrintIcon size={14} /> Print Now
            </button>

            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close modal"
            >
              <XIcon size={14} />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* Printable Area (Sent to Browser Print Dialog)                  */}
        {/* ============================================================== */}
        <div className="modal-body booking-printable-document" id="booking-printable-area">
          {layoutMode === 'a4' ? (
            /* ============================================================== */
            /* LAYOUT 1: A4 FORMAL VOUCHER & CONFIRMATION CERTIFICATE         */
            /* ============================================================== */
            <div className="a4-voucher-wrapper">
              {/* Document Header & Company Branding */}
              <div className="print-doc-header">
                <div className="print-brand-row">
                  <img
                    src="/logo.png"
                    alt="Wanderer South India Logo"
                    className="print-brand-logo"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div>
                    <h1 className="print-company-name">WANDERER SOUTH INDIA</h1>
                    <p className="print-company-sub">
                      Operated by Tramax Tours • South India Tour &amp; Experience Specialists
                    </p>
                    <p className="print-company-contact">
                      Phone/WhatsApp: +91 9840291110 • Email: welcome@yourbestdayinindia.com
                    </p>
                  </div>
                </div>

                <div className="print-voucher-meta">
                  <div className="print-doc-type">CONFIRMED TOUR TICKET &amp; VOUCHER</div>
                  <div className="print-ticket-badge">Ticket #: {ticketNumber}</div>
                  <div className="print-order-num">Booking Ref: #{data.order_number}</div>
                  <div className="print-date">Issued / Confirmed: {confirmedDateText}</div>
                </div>
              </div>

              {/* Status Ribbon */}
              <div className="print-status-banner">
                <div className="print-status-item">
                  <span className="print-status-label">Booking Confirmation Status:</span>
                  <span className={`print-badge ${isConfirmed ? 'print-badge-confirmed' : 'print-badge-pending'}`}>
                    <CheckCircleIcon size={12} /> {String(data.booking_status || 'PENDING').toUpperCase()}
                  </span>
                </div>
                <div className="print-status-item" style={{ alignItems: 'flex-end' }}>
                  <span className="print-status-label">Payment Settlement Status:</span>
                  {isSettled ? (
                    <span className="print-badge print-badge-paid">FULLY SETTLED ✓</span>
                  ) : (
                    <span className="print-badge print-badge-balance">
                      BALANCE PAYABLE: {formatMoney(balanceAmount, currency)}
                    </span>
                  )}
                </div>
              </div>

              {/* Section 1: Traveler Details & Address */}
              <div className="print-section-title">1. Traveler Information &amp; Contacts</div>
              <div className="print-grid-2col">
                <div className="print-box">
                  <div className="print-box-title">Primary Traveler</div>
                  <div className="print-info-row">
                    <span className="print-info-label">Customer Name:</span>
                    <span className="print-info-value">{customerName}</span>
                  </div>
                  <div className="print-info-row">
                    <span className="print-info-label">Primary Mobile:</span>
                    <span className="print-info-value">{customerPhone}</span>
                  </div>
                  <div className="print-info-row">
                    <span className="print-info-label">Email Address:</span>
                    <span className="print-info-value">{customerEmail}</span>
                  </div>
                  <div className="print-info-row">
                    <span className="print-info-label">Country:</span>
                    <span className="print-info-value">{customerCountry}</span>
                  </div>
                </div>

                <div className="print-box">
                  <div className="print-box-title">Pickup &amp; Billing Details</div>
                  <div className="print-info-row">
                    <span className="print-info-label">Pickup Location:</span>
                    <span className="print-info-value">{pickupLocation}</span>
                  </div>
                  <div className="print-info-row">
                    <span className="print-info-label">Billing Address:</span>
                    <span className="print-info-value">
                      {data.billing_address ? (
                        `${data.billing_address.address_line1 || ''}${
                          data.billing_address.city ? ', ' + data.billing_address.city : ''
                        }${data.billing_address.state ? ', ' + data.billing_address.state : ''}${
                          data.billing_address.postal_code ? ' ' + data.billing_address.postal_code : ''
                        }${data.billing_address.country ? ', ' + data.billing_address.country : ''}`
                      ) : (
                        'Same as traveler address on file'
                      )}
                    </span>
                  </div>
                  {data.preferred_language && (
                    <div className="print-info-row">
                      <span className="print-info-label">Language:</span>
                      <span className="print-info-value">{data.preferred_language}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Tour & Schedule Details */}
              <div className="print-section-title">2. Tour &amp; Schedule Specifications</div>
              <div className="print-box" style={{ marginBottom: '12px' }}>
                <div className="print-grid-2col" style={{ marginBottom: 0 }}>
                  <div>
                    <div className="print-info-row">
                      <span className="print-info-label">Tour Package:</span>
                      <span className="print-info-value" style={{ color: '#01aa90', fontSize: '0.875rem' }}>
                        {tourTitle}
                      </span>
                    </div>
                    <div className="print-info-row">
                      <span className="print-info-label">Tour Category:</span>
                      <span className="print-info-value">{tourType}</span>
                    </div>
                    <div className="print-info-row">
                      <span className="print-info-label">Duration:</span>
                      <span className="print-info-value">{duration}</span>
                    </div>
                  </div>
                  <div>
                    <div className="print-info-row">
                      <span className="print-info-label">Scheduled Date:</span>
                      <span className="print-info-value">{formatDate(travelDate)}</span>
                    </div>
                    <div className="print-info-row">
                      <span className="print-info-label">Travellers:</span>
                      <span className="print-info-value">
                        {passengersCount} Guest(s) ({adultsCount} Adults{childrenCount > 0 ? `, ${childrenCount} Children` : ''})
                      </span>
                    </div>
                    <div className="print-info-row">
                      <span className="print-info-label">Private Vehicle:</span>
                      <span className="print-info-value">
                        {data.vehicle_preference || 'Private AC Vehicle with Chauffeur'}
                      </span>
                    </div>
                  </div>
                </div>

                {(data.special_requests || data.customer_notes) && (
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #e2e8f0' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                      Special Requests / Notes:{' '}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#475569' }}>
                      {data.special_requests || data.customer_notes}
                    </span>
                  </div>
                )}
              </div>

              {/* Section 3: Financial & Payment Breakdown */}
              <div className="print-section-title">3. Financial &amp; Payment Breakdown</div>
              <table className="print-payment-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th style={{ textAlign: 'right' }}>Amount ({currency})</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      Agreed / Confirmed Tour Package Price ({passengersCount} Pax)
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {formatMoney(totalPrice, currency)}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      Payment Method
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {formatPaymentMethod(data.payment_method)}
                    </td>
                  </tr>
                  <tr>
                    <td>Advance Payment Received</td>
                    <td style={{ textAlign: 'right', color: '#15803d', fontWeight: 700 }}>
                      {formatMoney(advanceAmount, currency)}
                    </td>
                  </tr>
                  <tr className={isSettled ? 'print-tr-settled' : 'print-tr-highlight'}>
                    <td>
                      <strong>Remaining Balance Payable</strong>
                    </td>
                    <td style={{ textAlign: 'right', fontSize: '0.9375rem' }}>
                      <strong>{formatMoney(balanceAmount, currency)}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Important Check-in Notes */}
              <div className="print-notice-box">
                <strong>Important Tour Check-In &amp; Assistance Instructions:</strong>
                <ul className="print-notice-list">
                  <li>Please present this digital ticket or printed voucher to your tour guide / chauffeur at pickup.</li>
                  {!isSettled && (
                    <li>
                      Remaining balance of <strong>{formatMoney(balanceAmount, currency)}</strong> will be settled via{' '}
                      <strong>{formatPaymentMethod(data.payment_method)}</strong> prior to departure.
                    </li>
                  )}
                  <li>
                    24/7 Dispatch &amp; Emergency Helpline:{' '}
                    <strong>+91 9840291110 / +91 8072566010</strong> (Call or WhatsApp anytime).
                  </li>
                </ul>
              </div>

              {/* Security Verification & Barcode */}
              <div className="print-security-row">
                <div className="print-barcode-block">
                  <BarcodeSvg value={ticketNumber} height={32} />
                  <span className="print-barcode-text">*{ticketNumber}*</span>
                </div>
                <div className="print-seal-block">
                  <div className="print-seal-text">✓ OFFICIAL VERIFIED VOUCHER</div>
                  <div>Issued under Tramax Tours Management Authorization</div>
                </div>
              </div>

              {/* Document Footer */}
              <div className="print-doc-footer">
                <p style={{ margin: 0 }}>
                  Wanderer South India (Tramax Tours) • Authentic Tours, Heritage Journeys &amp; Local Guidance
                </p>
                <p className="print-timestamp">
                  Generated on {new Date().toLocaleString()} • Order #{data.order_number}
                </p>
              </div>
            </div>
          ) : (
            /* ============================================================== */
            /* LAYOUT 2: COMPACT BOARDING PASS TICKET FORMAT                  */
            /* ============================================================== */
            <div className="compact-ticket-card">
              {/* Left / Main Boarding Pass */}
              <div className="compact-main-pass">
                <div className="compact-pass-header">
                  <div>
                    <h2 className="compact-brand-title">WANDERER SOUTH INDIA</h2>
                    <p className="compact-brand-sub">Operated by Tramax Tours • Tourism Voucher</p>
                  </div>
                  <div className="compact-doc-label">BOARDING PASS</div>
                </div>

                <div className="compact-tour-banner">
                  <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>
                    Experience &amp; Destination
                  </div>
                  <h3 className="compact-tour-title">{tourTitle}</h3>
                  <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                    Type: <strong>{tourType}</strong> • Duration: <strong>{duration}</strong>
                  </div>
                </div>

                <div className="compact-grid-3col">
                  <div className="compact-cell">
                    <span className="compact-cell-label">Passenger Name</span>
                    <span className="compact-cell-value">{customerName}</span>
                  </div>
                  <div className="compact-cell">
                    <span className="compact-cell-label">Scheduled Date</span>
                    <span className="compact-cell-value">{formatDate(travelDate)}</span>
                  </div>
                  <div className="compact-cell">
                    <span className="compact-cell-label">Guests Count</span>
                    <span className="compact-cell-value">
                      {passengersCount} Pax ({adultsCount}A{childrenCount > 0 ? `, ${childrenCount}C` : ''})
                    </span>
                  </div>

                  <div className="compact-cell">
                    <span className="compact-cell-label">Pickup Point</span>
                    <span className="compact-cell-value" style={{ fontSize: '0.75rem' }}>{pickupLocation}</span>
                  </div>
                  <div className="compact-cell">
                    <span className="compact-cell-label">Mobile Contact</span>
                    <span className="compact-cell-value">{customerPhone}</span>
                  </div>
                  <div className="compact-cell">
                    <span className="compact-cell-label">Booking Status</span>
                    <span className="compact-cell-value" style={{ color: isConfirmed ? '#15803d' : '#a16207' }}>
                      {String(data.booking_status || 'PENDING').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem' }}>
                    Total Price: <strong>{formatMoney(totalPrice, currency)}</strong>
                  </div>
                  <div>
                    {isSettled ? (
                      <span className="print-badge print-badge-paid" style={{ fontSize: '0.6875rem' }}>FULLY PAID</span>
                    ) : (
                      <span className="print-badge print-badge-balance" style={{ fontSize: '0.6875rem' }}>
                        DUE: {formatMoney(balanceAmount, currency)} ({formatPaymentMethod(data.payment_method)})
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ fontSize: '0.6875rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                  <span>24/7 Helpline: +91 9840291110</span>
                  <span>Booking Ref: #{data.order_number}</span>
                </div>
              </div>

              {/* Perforation Line & Notches */}
              <div className="compact-perforation">
                <div className="compact-notch-top"></div>
                <div className="compact-notch-bottom"></div>
              </div>

              {/* Right / Tear-Off Stub */}
              <div className="compact-stub">
                <div>
                  <div className="compact-stub-header">
                    <h4 className="compact-stub-title">TRAMAX TOURS</h4>
                    <p className="compact-stub-sub">Passenger Stub</p>
                  </div>

                  <div className="compact-stub-body">
                    <div>
                      <div className="compact-cell-label">Passenger</div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                        {customerName.length > 20 ? customerName.slice(0, 18) + '...' : customerName}
                      </div>
                    </div>

                    <div>
                      <div className="compact-cell-label">Ticket Number</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#01aa90' }}>
                        {ticketNumber}
                      </div>
                    </div>

                    <div>
                      <div className="compact-cell-label">Travel Date</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a' }}>
                        {formatDate(travelDate)}
                      </div>
                    </div>

                    <div>
                      <div className="compact-cell-label">Guests</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a' }}>
                        {passengersCount} Person(s)
                      </div>
                    </div>
                  </div>
                </div>

                <div className="compact-stub-barcode">
                  <BarcodeSvg value={ticketNumber} height={28} />
                  <div style={{ fontSize: '0.625rem', fontFamily: 'monospace', color: '#64748b', marginTop: '2px' }}>
                    {ticketNumber}
                  </div>
                  <div style={{ fontSize: '0.5625rem', color: '#94a3b8', textTransform: 'uppercase', marginTop: '4px' }}>
                    Retain for Tour Entry
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* Modal Footer Controls (Hidden during Print)                    */}
        {/* ============================================================== */}
        <div className="modal-footer no-print" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
            Tip: Use <strong>A4 Voucher</strong> for official documentation or <strong>Boarding Pass</strong> for a compact ticket.
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <DownloadIcon size={14} />
              {isDownloadingPdf ? 'Downloading...' : 'Download Official PDF'}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handlePrint}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <PrintIcon size={14} /> Print Ticket
            </button>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
