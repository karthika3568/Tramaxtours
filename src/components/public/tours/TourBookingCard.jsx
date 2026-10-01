import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import bookingService from '../../../services/bookingService';
import { useToast } from '../../../context/ToastContext';
import { useSiteSettings } from '../../../context/SiteSettingsContext';
import useAuth from '../../../hooks/useAuth';
import { useCurrency } from '../../../context/CurrencyContext';
import { formatWhatsAppUrl } from '../../../utils/whatsapp';

export default function TourBookingCard({ tour }) {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { currency, formatPrice, convertPrice } = useCurrency();
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
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Auto-fill logged-in customer info
  useEffect(() => {
    function applyUserDefaults() {
      if (user) {
        if (user.name) setCustomerName(user.name);
        if (user.email) setCustomerEmail(user.email);
        if (user.phone) setCustomerPhone(user.phone);
      }
    }
    applyUserDefaults();
  }, [user]);

  if (!tour) return null;

  const usesDateAvailability = Boolean(tour.uses_date_availability);
  const availabilityDates = tour.availability_dates || [];

  // For tours with configured dates, the selected date must be one of the bookable
  // ones; otherwise fall back to the tour's legacy global seat count.
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
  const rawBasePrice = Number(tour.base_price || 0);
  const basePrice = currency.code === 'INR' ? rawBasePrice : convertPrice(rawBasePrice);
  const childPrice = Math.round(basePrice * 0.5);
  const totalPrice = (adults * basePrice) + (children * childPrice);
  const destinationName = tour.destination?.name || tour.destination_name || (typeof tour.destination === 'string' ? tour.destination : '') || '';
  const currencySymbol = currency.symbol;

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

    // Directly open the booking & reservation modal for guests without login requirement
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      toast.warning('Please provide your name, email, and phone number to complete booking.', 'Details Required');
      return;
    }

    try {
      setIsSubmitting(true);
      const nameParts = customerName.trim().split(' ');
      const firstName = nameParts[0] || 'Traveler';
      const lastName = nameParts.slice(1).join(' ') || 'Guest';

      const payload = {
        tour_id: tour.id,
        first_name: firstName,
        last_name: lastName,
        email: customerEmail.trim().toLowerCase(),
        phone: customerPhone.trim(),
        address_line1: pickupLocation.trim() || 'Hotel Pickup in South India',
        city: 'Chennai',
        state: 'Tamil Nadu',
        postal_code: '600001',
        country: 'India',
        booking_date: selectedDate,
        tickets_count: adults + children,
        adults: Number(adults),
        children: Number(children),
        unit_price: basePrice,
        subtotal: totalPrice,
        total_price: totalPrice,
        currency: tour.currency || 'INR',
        payment_method: 'pay_on_arrival',
        payment_status: 'pending',
        status: 'pending',
        special_requests: `Time Slot: ${selectedTimeSlot}. Adults: ${adults}, Children: ${children}. Pickup: ${pickupLocation || 'Standard'}. Notes: ${specialNotes || 'None'}. Booked via Wonderer South India`,
      };

      const response = await bookingService.createBooking(payload);
      setBookingSuccess(response?.data || response || { success: true, order_number: 'WSI-' + Math.floor(100000 + Math.random() * 900000) });
      toast.success('Your tour booking reservation has been placed successfully!', 'Booking Confirmed');
    } catch (err) {
      toast.error(err?.message || 'Failed to place booking. Please try again or contact us directly.', 'Booking Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Wonderer South India! I am interested in booking "${tour.title}" for ${adults} Adults, ${children} Children on ${selectedDate} (${selectedTimeSlot}). Total: ${currencySymbol}${totalPrice.toLocaleString()}. Please provide availability and confirmation.`
  );

  const handleDownloadReceipt = async () => {
    const bookingId = bookingSuccess?.id;
    if (!bookingId) {
      window.print();
      return;
    }
    try {
      const blob = await bookingService.downloadReceipt(bookingId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `WondererSouthIndia-Receipt-${bookingSuccess.order_number || bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download receipt. Please try again.', 'Download Error');
    }
  };

  const handleShareWhatsAppReceipt = () => {
    const orderRef = bookingSuccess?.order_number || `#${bookingSuccess?.id || 'WSI-CONFIRMED'}`;
    const msg = encodeURIComponent(
      `🧾 *WONDERER SOUTH INDIA — BOOKING RECEIPT*\n\nOrder: ${orderRef}\nGuest: ${customerName}\nTour: ${tour.title}\nTravel Date: ${selectedDate} (${selectedTimeSlot})\nGuests: ${adults} Adults, ${children} Children\nTotal Price: ${currencySymbol}${totalPrice.toLocaleString()}\nPayment: Pay on Arrival\n\nThank you for choosing Wonderer South India!`
    );
    window.open(`https://wa.me/919840000000?text=${msg}`, '_blank');
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
                className="btn btn-primary btn-block widget-book-btn"
                onClick={handleOpenBookingModal}
              >
                ⚡ Instant Reservation &rarr;
              </button>
            </>
          )}

          <a
            href={formatWhatsAppUrl(businessWhatsApp, `Hello Wonderer South India! I am interested in booking "${tour.title}" for ${adults} Adults, ${children} Children on ${selectedDate} (${selectedTimeSlot}). Total: ${currencySymbol}${totalPrice.toLocaleString()}. Please provide availability and confirmation.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp btn-block"
          >
            💬 Inquire on WhatsApp
          </a>

          <Link
            to={`/plan-your-trip?tour=${encodeURIComponent(tour.title)}&destination=${encodeURIComponent(destinationName)}`}
            className="btn btn-outline btn-sm btn-block widget-inquire-btn"
            style={{ fontWeight: '700', padding: '10px' }}
          >
            📝 Plan &amp; Customize Itinerary (10-Step Wizard)
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="booking-trust-badges">
          <div className="trust-badge-line">✓ Instant Confirmation & Voucher</div>
          <div className="trust-badge-line">✓ Private AC Vehicle & Chauffeur Guide</div>
          <div className="trust-badge-line">✓ Free Cancellation up to 48 Hours</div>
        </div>
      </div>

      {/* Booking Checkout Modal */}
      {showBookingModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowBookingModal(false)} role="dialog" aria-modal="true">
          <div className="admin-modal-container booking-checkout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="modal-header-info">
                <span className="modal-eyebrow">Online Reservation & Checkout</span>
                <h3 className="admin-modal-title">{tour.title}</h3>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => {
                  setShowBookingModal(false);
                  setBookingSuccess(null);
                }}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <div className="admin-modal-body">
              {bookingSuccess ? (
                <div className="booking-success-box text-center" style={{ padding: '20px 10px' }}>
                  <div className="success-icon-big" style={{ fontSize: '48px', marginBottom: '8px' }}>🎉</div>
                  <h4 className="success-title" style={{ fontSize: '20px', fontWeight: '800', color: '#01AA90', margin: '0 0 6px' }}>
                    Reservation Placed Successfully!
                  </h4>
                  <p className="success-desc" style={{ fontSize: '14px', color: '#475569', marginBottom: '16px' }}>
                    Thank you, <strong>{customerName}</strong>! Your reservation reference is{' '}
                    <strong style={{ color: '#0B1329' }}>#{bookingSuccess.order_number || bookingSuccess.id}</strong>.
                  </p>

                  <div
                    className="success-summary-box"
                    style={{
                      background: '#f8fafc',
                      borderRadius: '12px',
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '13px',
                      color: '#0B1329',
                      border: '1px solid #e2e8f0',
                      marginBottom: '16px',
                    }}
                  >
                    <p style={{ margin: '0 0 6px' }}><strong>Tour:</strong> {tour.title}</p>
                    <p style={{ margin: '0 0 6px' }}><strong>Travel Date:</strong> {selectedDate} ({selectedTimeSlot})</p>
                    <p style={{ margin: '0 0 6px' }}><strong>Guests:</strong> {adults} Adults, {children} Children</p>
                    <p style={{ margin: '0 0 6px' }}><strong>Total Amount:</strong> {currencySymbol}{totalPrice.toLocaleString()} (Pay on Arrival)</p>
                    <p style={{ margin: 0 }}><strong>Customer:</strong> {customerName} • {customerEmail} • {customerPhone}</p>
                  </div>

                  {/* Receipt Action Buttons */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '16px' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={handleDownloadReceipt}
                    >
                      📄 Download / Print PDF Receipt
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={handleShareWhatsAppReceipt}
                      style={{ background: '#16a34a', borderColor: '#16a34a' }}
                    >
                      💬 Send to WhatsApp
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={async () => {
                        try {
                          await bookingService.resendConfirmation(bookingSuccess.id);
                          toast.success(`Confirmation resent to ${customerEmail}.`, 'Email Sent');
                        } catch (err) {
                          toast.error(err?.message || 'Failed to resend confirmation email.', 'Email Error');
                        }
                      }}
                    >
                      ✉️ Resend Email Receipt
                    </button>
                  </div>

                  <p style={{ fontSize: '11.5px', color: '#64748b', marginBottom: '12px' }}>
                    A confirmation with your PDF receipt has already been emailed to <strong>{customerEmail}</strong>.
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
                <form onSubmit={handleBookingSubmit} className="checkout-form">
                  <div className="checkout-summary-bar">
                    <div>
                      <strong>{selectedDate}</strong> at <strong>{selectedTimeSlot}</strong>
                    </div>
                    <div className="checkout-total-tag">
                      Total: <strong>{currencySymbol}{totalPrice.toLocaleString()}</strong> ({adults + children} Guests)
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label htmlFor="modal-customer-name" className="form-label required">
                      Your Full Name
                    </label>
                    <input
                      id="modal-customer-name"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Karthik Ramaswamy"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field-group">
                    <label htmlFor="modal-customer-email" className="form-label required">
                      Email Address
                    </label>
                    <input
                      id="modal-customer-email"
                      type="email"
                      className="form-input"
                      placeholder="e.g. karthik@gmail.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field-group">
                    <label htmlFor="modal-customer-phone" className="form-label required">
                      Mobile / WhatsApp Number
                    </label>
                    <input
                      id="modal-customer-phone"
                      type="tel"
                      className="form-input"
                      placeholder="e.g. +91 98400 00000"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field-group">
                    <label htmlFor="modal-pickup-location" className="form-label">
                      Hotel Pickup Address / Location
                    </label>
                    <input
                      id="modal-pickup-location"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Radisson Blu Hotel, Chennai or Central Station"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                    />
                  </div>

                  <div className="form-field-group">
                    <label htmlFor="modal-special-notes" className="form-label">
                      Special Requests / Notes (Optional)
                    </label>
                    <textarea
                      id="modal-special-notes"
                      className="form-input"
                      rows={2}
                      placeholder="e.g. Need child booster seat, vegetarian lunch preference, etc."
                      value={specialNotes}
                      onChange={(e) => setSpecialNotes(e.target.value)}
                    />
                  </div>

                  <div className="checkout-terms-note">
                    🔒 No advance payment required now. Pay on arrival with Cash, UPI, or Card.
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-block btn-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Confirming Reservation...' : `Confirm Booking • ${currencySymbol}${totalPrice.toLocaleString()}`}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
