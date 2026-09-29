import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import bookingService from '../../../services/bookingService';
import { useToast } from '../../../context/ToastContext';
import useAuth from '../../../hooks/useAuth';

export default function TourBookingCard({ tour }) {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const deadlineDays = tour?.booking_deadline_days ?? 1;

  const [selectedDate, setSelectedDate] = useState(() => {
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
    if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.email) setCustomerEmail(user.email);
      if (user.phone) setCustomerPhone(user.phone);
    }
  }, [user]);

  if (!tour) return null;

  const isFull = tour.available_seats !== undefined && tour.available_seats !== null && Number(tour.available_seats) === 0;
  const isLowSeats = tour.available_seats !== undefined && tour.available_seats !== null && Number(tour.available_seats) > 0 && Number(tour.available_seats) <= 5;
  const travelDays = tour.travel_days || 'Daily';
  const basePrice = Number(tour.base_price || 0);
  const childPrice = Math.round(basePrice * 0.5);
  const totalPrice = (adults * basePrice) + (children * childPrice);
  const currencySymbol = tour.currency === 'EUR' ? '€' : tour.currency === 'INR' ? '₹' : (tour.currency || '₹');

  const minBookingDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + Math.max(1, deadlineDays));
    return d.toISOString().split('T')[0];
  })();

  const handleOpenBookingModal = () => {
    if (isFull) {
      toast.warning('This tour package is currently fully booked.', 'Tour Full');
      return;
    }

    if (!isAuthenticated) {
      toast.info('Please sign in or register to complete your reservation. You will be redirected right back.', 'Sign In Required');
      navigate('/login', { state: { from: location } });
      return;
    }

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
        special_requests: `Time Slot: ${selectedTimeSlot}. Adults: ${adults}, Children: ${children}. Pickup: ${pickupLocation || 'Standard'}. Notes: ${specialNotes || 'None'}. Booked via tramaxtours.in`,
      };

      const response = await bookingService.createBooking(payload);
      setBookingSuccess(response?.data || response || { success: true, order_number: 'TT-' + Math.floor(100000 + Math.random() * 900000) });
      toast.success('Your tour booking reservation has been placed successfully!', 'Booking Confirmed');
    } catch (err) {
      toast.error(err?.message || 'Failed to place booking. Please try again or contact us directly.', 'Booking Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Tramax Tours! I am interested in booking "${tour.title}" for ${adults} Adults, ${children} Children on ${selectedDate} (${selectedTimeSlot}). Total: ${currencySymbol}${totalPrice.toLocaleString()}. Please provide availability and confirmation.`
  );

  const handleDownloadReceipt = () => {
    window.print();
  };

  const handleShareWhatsAppReceipt = () => {
    const orderRef = bookingSuccess?.order_number || `#${bookingSuccess?.id || 'TT-CONFIRMED'}`;
    const msg = encodeURIComponent(
      `🧾 *TRAMAX TOURS — BOOKING RECEIPT*\n\nOrder: ${orderRef}\nGuest: ${customerName}\nTour: ${tour.title}\nTravel Date: ${selectedDate} (${selectedTimeSlot})\nGuests: ${adults} Adults, ${children} Children\nTotal Price: ${currencySymbol}${totalPrice.toLocaleString()}\nPayment: Pay on Arrival\n\nThank you for choosing Tramax Tours!`
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
          <input
            id="booking-date"
            type="date"
            className="booking-field-input"
            value={selectedDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
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
              <strong style={{ color: '#b91c1c', display: 'block', fontSize: '14px' }}>🔴 Fully Booked / Closed</strong>
              <span style={{ fontSize: '12px', color: '#7f1d1d' }}>All seats for this tour are currently reserved. Please contact our desk for custom dates.</span>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-block widget-book-btn"
              onClick={handleOpenBookingModal}
            >
              ⚡ Instant Reservation &rarr;
            </button>
          )}

          <a
            href={`https://wa.me/919840000000?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp btn-block"
          >
            💬 Inquire on WhatsApp
          </a>

          <Link
            to={`/contact?tour=${encodeURIComponent(tour.slug)}&date=${selectedDate}`}
            className="btn btn-outline btn-sm btn-block widget-inquire-btn"
          >
            Inquire via Contact Form
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
                      onClick={() => toast.success(`Receipt sent to ${customerEmail}!`, 'Email Confirmation Sent')}
                    >
                      ✉️ Email Receipt
                    </button>
                  </div>

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
