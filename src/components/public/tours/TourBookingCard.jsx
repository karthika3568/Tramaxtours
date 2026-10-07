import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import bookingService from '../../../services/bookingService';
import { useToast } from '../../../context/ToastContext';
import { useSiteSettings } from '../../../context/SiteSettingsContext';
import useAuth from '../../../hooks/useAuth';
import { formatWhatsAppUrl, getCleanWhatsAppNumber } from '../../../utils/whatsapp';
import TripRequestForm from '../planner/TripRequestForm';

export default function TourBookingCard({ tour }) {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { getSetting } = useSiteSettings();
  const businessWhatsApp = getSetting('contact_whatsapp', '+91 8072566010');

  const deadlineDays = tour?.booking_deadline_days ?? 1;

  const [selectedDate, setSelectedDate] = useState(() => {
    if (tour?.uses_date_availability) {
      const firstBookable = (tour.availability_dates || []).find((d) => d.is_bookable);
      if (firstBookable) return firstBookable.travel_date;
    }
    const d = new Date();
    d.setDate(d.getDate() + Math.max(1, deadlineDays));
    return d.toISOString().split('T')[0];
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('09:00 AM');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [emailSentStatus, setEmailSentStatus] = useState(null); // 'sent' | 'failed' | null
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  if (!tour) return null;

  const usesDateAvailability = Boolean(tour.uses_date_availability);
  const availabilityDates = tour.availability_dates || [];

  const selectedDateAvailability = usesDateAvailability
    ? availabilityDates.find((d) => d.travel_date === selectedDate) || null
    : null;

  const isFull = usesDateAvailability
    ? (!selectedDateAvailability || !selectedDateAvailability.is_bookable)
    : (tour.available_seats !== undefined && tour.available_seats !== null && Number(tour.available_seats) === 0);
  const isLowSeats = usesDateAvailability
    ? selectedDateAvailability?.status === 'low'
    : (tour.available_seats !== undefined && tour.available_seats !== null && Number(tour.available_seats) > 0 && Number(tour.available_seats) <= 5);
  const seatsLeft = usesDateAvailability ? selectedDateAvailability?.available_seats : tour.available_seats;
  const travelDays = tour.travel_days || 'Daily';
  const basePrice = Number(tour.base_price || 0);
  const childPrice = Math.round(basePrice * 0.5);
  const totalPrice = (adults * basePrice) + (children * childPrice);
  const destinationName = tour.destination?.name || tour.destination_name || (typeof tour.destination === 'string' ? tour.destination : '') || '';
  const currencySymbol = tour.currency === 'EUR' ? '€' : tour.currency === 'INR' ? '₹' : (tour.currency || '₹');

  const minBookingDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + Math.max(1, deadlineDays));
    return d.toISOString().split('T')[0];
  })();

  const handleOpenBookingModal = () => {
    if (isFull) {
      toast.warning(
        usesDateAvailability
          ? 'This date is fully booked or closed. Please choose another available date.'
          : 'This tour package is currently fully booked.',
        'Not Available'
      );
      return;
    }
    setShowBookingModal(true);
  };

  const handlePrintSummary = () => {
    window.print();
  };

  const handleDownloadReceipt = async () => {
    const bookingId = bookingSuccess?.id;
    if (!bookingId) {
      window.print();
      return;
    }
    try {
      setIsDownloadingPdf(true);
      const blob = await bookingService.downloadReceipt(bookingId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `WandererSouthIndia-Receipt-${bookingSuccess.order_number || bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Official PDF receipt downloaded successfully.', 'Download Complete');
    } catch {
      toast.error('Failed to download PDF receipt from server. You can also use the Print button to print or save as PDF.', 'Download Error');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleShareWhatsAppReceipt = () => {
    try {
      const orderRef = bookingSuccess?.order_number || `#${bookingSuccess?.id || 'WSI-CONFIRMED'}`;
      const cleanNum = getCleanWhatsAppNumber(businessWhatsApp);
      const custName = bookingSuccess?.customer?.name || bookingSuccess?.first_name || (user?.name || 'Valued Guest');
      const tourName = tour.title || bookingSuccess?.tour?.title || 'Wanderer South India Tour';
      const bDate = bookingSuccess?.arrival_date || bookingSuccess?.booking_date || selectedDate;
      const guests = bookingSuccess?.tickets_count || (adults + children);
      const totPrice = bookingSuccess?.total_price || totalPrice;
      const msg = encodeURIComponent(
        `🧾 *WANDERER SOUTH INDIA — BOOKING SUMMARY*\n\n• Order Reference: ${orderRef}\n• Customer: ${custName}\n• Tour: ${tourName}\n• Travel Date: ${bDate}\n• Guests: ${guests}\n• Total: ${currencySymbol}${totPrice.toLocaleString()}\n• Payment: Pay on Arrival\n\nThank you for choosing Wanderer South India! Please reply to confirm pickup details.`
      );
      toast.info('Opening WhatsApp chat with booking summary...', 'WhatsApp');
      window.open(`https://wa.me/${cleanNum}?text=${msg}`, '_blank');
    } catch (e) {
      console.error('WhatsApp receipt error:', e);
      toast.error('Unable to open WhatsApp chat. Please check your browser popup settings.');
    }
  };

  const handleResendEmail = async () => {
    const bookingId = bookingSuccess?.id;
    if (!bookingId) return;
    if (cooldownRemaining > 0) {
      toast.warning(`Please wait ${cooldownRemaining}s before resending.`, 'Cooldown Active');
      return;
    }

    try {
      setIsResendingEmail(true);
      const tokenToUse = accessToken || sessionStorage.getItem(`booking_token_${bookingId}`) || null;
      await bookingService.resendConfirmation(bookingId, tokenToUse);
      setEmailSentStatus('sent');
      setCooldownRemaining(60); // Start 60s cooldown timer
      const custEmail = bookingSuccess?.customer?.email || bookingSuccess?.email || user?.email || 'your registered email';
      toast.success(`Booking confirmation receipt has been sent to ${custEmail}.`, 'Email Sent');
    } catch (err) {
      setEmailSentStatus('failed');
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message || 'Unable to send the ticket. Please try again.';
      if (status === 429) {
        setCooldownRemaining(60);
        toast.warning(msg, 'Rate Limit Notice');
      } else {
        toast.error(msg, 'Email Delivery Notice');
      }
    } finally {
      setIsResendingEmail(false);
    }
  };

  return (
    <div className="tour-booking-card-widget">
      {/* Price Header */}
      <div className="booking-widget-header">
        <span className="widget-price-label">Starting From</span>
        <div className="widget-price-amount">
          <span className="widget-currency">{currencySymbol}</span>
          <span className="widget-price-num">{basePrice.toLocaleString()}</span>
          <span className="widget-unit">/ adult</span>
        </div>
      </div>

      {/* Booking Form Controls */}
      <div className="booking-widget-body">
        {/* Date Selector */}
        <div className="booking-field-group">
          <label htmlFor="booking-date" className="booking-field-label">
            <span className="label-icon">📅</span> Select Travel Date:
          </label>
          {usesDateAvailability ? (
            <select
              id="booking-date"
              className="booking-field-select"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            >
              {availabilityDates.length === 0 && <option value="">No dates open for booking</option>}
              {availabilityDates.map((d) => (
                <option key={d.travel_date} value={d.travel_date} disabled={!d.is_bookable}>
                  {d.travel_date}
                  {d.status === 'full' && ' — Fully Booked'}
                  {(d.status === 'closed' || d.status === 'booking_closed') && ' — Closed'}
                  {d.is_bookable && ` — ${d.available_seats} seats left`}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="booking-date"
              type="date"
              className="booking-field-input"
              value={selectedDate}
              min={minBookingDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          )}
          <span className="booking-field-hint">Runs: {travelDays}</span>
        </div>

        {/* Time Slot Selector */}
        <div className="booking-field-group">
          <label htmlFor="booking-time" className="booking-field-label">
            <span className="label-icon">⏱️</span> Select Time Slot:
          </label>
          <select
            id="booking-time"
            className="booking-field-select"
            value={selectedTimeSlot}
            onChange={(e) => setSelectedTimeSlot(e.target.value)}
          >
            <option value="06:00 AM">06:00 AM (Early Sunrise)</option>
            <option value="08:00 AM">08:00 AM (Morning Tour)</option>
            <option value="09:00 AM">09:00 AM (Standard Departure)</option>
            <option value="11:30 AM">11:30 AM (Midday Excursion)</option>
            <option value="02:00 PM">02:00 PM (Afternoon Safari)</option>
          </select>
        </div>

        {/* Guest Quantity Counters */}
        <div className="booking-guests-selector">
          {/* Adults */}
          <div className="guest-counter-row">
            <div>
              <span className="guest-type-name">Adults</span>
              <span className="guest-type-sub">Age 12+ ({currencySymbol}{basePrice.toLocaleString()})</span>
            </div>
            <div className="quantity-controls">
              <button
                type="button"
                className="qty-btn"
                onClick={() => setAdults((prev) => Math.max(1, prev - 1))}
                aria-label="Decrease adults"
              >
                −
              </button>
              <span className="qty-number">{adults}</span>
              <button
                type="button"
                className="qty-btn"
                onClick={() => setAdults((prev) => prev + 1)}
                aria-label="Increase adults"
              >
                +
              </button>
            </div>
          </div>

          {/* Children */}
          <div className="guest-counter-row">
            <div>
              <span className="guest-type-name">Children</span>
              <span className="guest-type-sub">Age 3-11 ({currencySymbol}{childPrice.toLocaleString()})</span>
            </div>
            <div className="quantity-controls">
              <button
                type="button"
                className="qty-btn"
                onClick={() => setChildren((prev) => Math.max(0, prev - 1))}
                aria-label="Decrease children"
              >
                −
              </button>
              <span className="qty-number">{children}</span>
              <button
                type="button"
                className="qty-btn"
                onClick={() => setChildren((prev) => prev + 1)}
                aria-label="Increase children"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Price Breakdown Calculation */}
        <div className="booking-price-summary">
          <div className="price-summary-line">
            <span>{adults} Adult(s) × {currencySymbol}{basePrice.toLocaleString()}</span>
            <span>{currencySymbol}{(adults * basePrice).toLocaleString()}</span>
          </div>
          {children > 0 && (
            <div className="price-summary-line">
              <span>{children} Child(ren) × {currencySymbol}{childPrice.toLocaleString()}</span>
              <span>{currencySymbol}{(children * childPrice).toLocaleString()}</span>
            </div>
          )}
          <div className="price-summary-total">
            <span>Estimated Total:</span>
            <span className="total-amount">{currencySymbol}{totalPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="booking-widget-actions">
          {isFull ? (
            <div className="alert-box-full" style={{ padding: '14px', borderRadius: '10px', background: '#fee2e2', border: '1px solid #fca5a5', textAlign: 'center', marginBottom: '10px' }}>
              <strong style={{ color: '#b91c1c', display: 'block', fontSize: '14px' }}>
                {usesDateAvailability ? '🔴 Selected Date Unavailable' : '🔴 Fully Booked / Closed'}
              </strong>
              <span style={{ fontSize: '12px', color: '#7f1d1d' }}>
                {usesDateAvailability
                  ? 'This date is fully booked, closed, or past the booking cutoff. Please choose another date above.'
                  : 'All seats for this tour are currently reserved. Please contact our desk for custom dates.'}
              </span>
            </div>
          ) : (
            <>
              {isLowSeats && (
                <div className="alert-box-low-seats" style={{ padding: '8px 12px', borderRadius: '8px', background: '#fef3c7', border: '1px solid #fde68a', textAlign: 'center', marginBottom: '8px', fontSize: '12.5px', color: '#92400e', fontWeight: 600 }}>
                  ⚡ Only {seatsLeft} seats left for this date
                </div>
              )}
              <button
                type="button"
                onClick={handleOpenBookingModal}
                className="btn btn-primary btn-block widget-book-btn"
                style={{ textAlign: 'center', cursor: 'pointer', fontWeight: 800, fontSize: '15px' }}
              >
                ⚡ Instant Reservation &rarr;
              </button>
            </>
          )}

          <a
            href={formatWhatsAppUrl(businessWhatsApp, `Hello Wanderer South India! I am interested in booking "${tour.title}" for ${adults} Adults, ${children} Children on ${selectedDate} (${selectedTimeSlot}). Total: ${currencySymbol}${totalPrice.toLocaleString()}. Please provide availability and confirmation.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp btn-block"
          >
            💬 Inquire on WhatsApp
          </a>
        </div>

        {/* Trust Badges */}
        <div className="booking-trust-badges">
          <div className="trust-badge-line">✓ Instant Confirmation & Voucher</div>
          <div className="trust-badge-line">✓ Private AC Vehicle & Chauffeur Guide</div>
          <div className="trust-badge-line">✓ Free Cancellation up to 48 Hours</div>
        </div>
      </div>

      {/* Unified Booking Checkout Modal (reusing TripRequestForm) */}
      {showBookingModal && typeof document !== 'undefined' && createPortal(
        <div
          className="admin-modal-backdrop"
          onClick={() => setShowBookingModal(false)}
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(11, 19, 41, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
          }}
        >
          <div
            className="admin-modal-container booking-checkout-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              zIndex: 100000,
              background: '#ffffff',
              borderRadius: '20px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
              maxWidth: '900px',
              maxHeight: '90vh',
              overflowY: 'auto',
              width: '95%',
              padding: '28px',
            }}
          >
            <div className="admin-modal-header" style={{ marginBottom: '20px' }}>
              <div className="modal-header-info">
                <span className="modal-eyebrow" style={{ color: '#1226de', fontWeight: 700 }}>
                  Wanderer South India • Official Tour Reservation
                </span>
                <h3 className="admin-modal-title" style={{ fontSize: '22px', fontWeight: 800, margin: '4px 0 0' }}>
                  {tour.title}
                </h3>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => {
                  setShowBookingModal(false);
                  setBookingSuccess(null);
                }}
                aria-label="Close dialog"
                style={{ fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div className="admin-modal-body">
              {bookingSuccess ? (
                <div className="booking-success-box text-center" style={{ padding: '24px 12px' }}>
                  <div className="success-icon-big" style={{ fontSize: '52px', marginBottom: '12px' }}>🎉</div>
                  <h4 className="success-title" style={{ fontSize: '22px', fontWeight: '800', color: '#1226de', margin: '0 0 8px' }}>
                    Reservation Placed Successfully!
                  </h4>
                  <p className="success-desc" style={{ fontSize: '15px', color: '#475569', marginBottom: '20px' }}>
                    Thank you, <strong>{bookingSuccess?.customer?.name || bookingSuccess?.first_name || (user?.name || 'Valued Traveler')}</strong>! Your reservation reference is{' '}
                    <strong style={{ color: '#0B1329', fontSize: '16px' }}>#{bookingSuccess?.order_number || bookingSuccess?.id}</strong>.
                  </p>

                  <div
                    className="success-summary-box"
                    style={{
                      background: '#f8fafc',
                      borderRadius: '12px',
                      padding: '20px',
                      textAlign: 'left',
                      fontSize: '14px',
                      color: '#0B1329',
                      border: '1px solid #e2e8f0',
                      marginBottom: '20px',
                    }}
                  >
                    <p style={{ margin: '0 0 8px' }}><strong>Tour Package:</strong> {tour.title}</p>
                    <p style={{ margin: '0 0 8px' }}><strong>Travel Date:</strong> {bookingSuccess?.arrival_date || bookingSuccess?.booking_date || selectedDate} ({selectedTimeSlot})</p>
                    <p style={{ margin: '0 0 8px' }}><strong>Guests / Travelers:</strong> {bookingSuccess?.tickets_count || (adults + children)} ({bookingSuccess?.adults_count || adults} Adults, {bookingSuccess?.children_count || children} Children)</p>
                    <p style={{ margin: '0 0 8px' }}><strong>Total Amount:</strong> {currencySymbol}{(bookingSuccess?.total_price || totalPrice).toLocaleString()} (Pay on Arrival)</p>
                    <p style={{ margin: '0 0 8px' }}><strong>Pickup Location:</strong> {bookingSuccess?.pickup_location || 'Hotel / Airport in South India'}</p>
                    <p style={{ margin: 0 }}><strong>Contact:</strong> {bookingSuccess?.customer?.email || user?.email} • {bookingSuccess?.customer?.phone || user?.phone}</p>
                  </div>

                  {/* Receipt Action Buttons */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '20px' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-md"
                      onClick={handlePrintSummary}
                      title="Print or Save as PDF via browser"
                    >
                      🖨️ Print Summary
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-md"
                      onClick={handleDownloadReceipt}
                      disabled={isDownloadingPdf}
                      title="Download official PDF voucher"
                    >
                      {isDownloadingPdf ? '⏳ Generating PDF...' : '📄 Download PDF Voucher'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-md"
                      onClick={handleShareWhatsAppReceipt}
                      style={{ background: '#16a34a', borderColor: '#16a34a' }}
                      title="Open WhatsApp chat with booking details"
                    >
                      💬 WhatsApp Confirmation
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-md"
                      onClick={handleResendEmail}
                      disabled={isResendingEmail || cooldownRemaining > 0}
                      title="Email official confirmation with receipt PDF"
                      style={{
                        borderColor: emailSentStatus === 'sent' ? '#16a34a' : '#1226de',
                        color: emailSentStatus === 'sent' ? '#16a34a' : '#1226de',
                      }}
                    >
                      {isResendingEmail
                        ? '⏳ Sending Ticket...'
                        : cooldownRemaining > 0
                        ? `⏳ Wait ${cooldownRemaining}s`
                        : emailSentStatus === 'sent'
                        ? '✓ Send Ticket to Email'
                        : '✉️ Send Ticket to Email'}
                    </button>
                  </div>

                  <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '14px' }}>
                    {emailSentStatus === 'sent' ? (
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>
                        ✓ Ticket sent to <strong>{bookingSuccess?.customer?.email || bookingSuccess?.email || user?.email}</strong>.
                      </span>
                    ) : (
                      <>
                        Confirmation ticket & voucher dispatched to <strong>{bookingSuccess?.customer?.email || bookingSuccess?.email || user?.email}</strong>.
                      </>
                    )}
                  </p>

                  {isAuthenticated && (
                    <Link
                      to="/my-bookings"
                      className="btn btn-outline btn-sm btn-block"
                      onClick={() => setShowBookingModal(false)}
                      style={{ marginTop: '8px' }}
                    >
                      👤 View in My Bookings &rarr;
                    </Link>
                  )}
                </div>
              ) : (
                <TripRequestForm
                  isBookingMode={true}
                  tour={{
                    ...tour,
                    selectedDate,
                    timeSlot: selectedTimeSlot,
                  }}
                  prefilledData={{
                    first_name: user?.name ? user.name.split(' ')[0] : '',
                    last_name: user?.name ? user.name.split(' ').slice(1).join(' ') : '',
                    email: user?.email || '',
                    phone: user?.phone || '',
                    arrival_date: selectedDate,
                    adults_count: adults,
                    children_count: children,
                  }}
                  onBookingSuccess={(res) => {
                    setBookingSuccess(res);
                    if (res?.access_token) {
                      setAccessToken(res.access_token);
                      try {
                        sessionStorage.setItem(`booking_token_${res.id}`, res.access_token);
                      } catch (_) {}
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
