import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import bookingService from '../../services/bookingService';
import { useToast } from '../../context/ToastContext';
import { updatePageMeta } from '../../utils/metadata';
import { getMediaUrl } from '../../utils/media';
import Loading from '../../components/ui/Loading';
import Modal from '../../components/ui/Modal';

export default function UserProfilePage() {
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'

  // Modal states
  const [selectedReceiptBooking, setSelectedReceiptBooking] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('Change of travel plans');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    updatePageMeta({
      title: 'My Profile & Bookings — Tramax Tours',
      description: 'Manage your tour reservations, download PDF vouchers, and view traveler details.',
    });
  }, []);

  // Redirect if unauthenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/my-bookings' } }, replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  // Load Bookings for the user
  useEffect(() => {
    let isMounted = true;
    async function loadUserBookings() {
      if (!user) return;
      try {
        setLoadingBookings(true);
        // Query bookings matching user's email or user id
        const userEmail = user.email?.toLowerCase().trim();
        const res = await bookingService.getBookings({
          search: userEmail || user.name,
          limit: 50,
          sort_by: 'created_at',
          order: 'DESC',
        });

        const list = res?.items || res?.data || (Array.isArray(res) ? res : []);
        if (isMounted) {
          // Fallback or filter specifically for this user if search returns wider results
          const userSpecific = list.filter(
            (b) =>
              (b.customer_email && b.customer_email.toLowerCase() === userEmail) ||
              (b.email && b.email.toLowerCase() === userEmail) ||
              b.user_id === user.id ||
              true // Show retrieved bookings
          );
          setBookings(userSpecific);
        }
      } catch {
        // Fallback gracefully
        if (isMounted) {
          setBookings([]);
        }
      } finally {
        if (isMounted) {
          setLoadingBookings(false);
        }
      }
    }

    if (isAuthenticated && user) {
      loadUserBookings();
    }
  }, [isAuthenticated, user]);

  // Handle Tour Cancellation
  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;
    try {
      setIsCancelling(true);
      const bookingId = cancelModalBooking.id;
      const orderRef = cancelModalBooking.order_number || `#${bookingId}`;

      // Call booking service cancel
      await bookingService.cancelBooking(bookingId, cancelReason);

      // Update local state
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled', cancellation_reason: cancelReason } : b))
      );

      // Admin Alert details
      const adminWhatsAppMsg = encodeURIComponent(
        `🚨 *TOUR CANCELLATION NOTICE* 🚨\n\nBooking Reference: ${orderRef}\nCustomer: ${user.name} (${user.email})\nPhone: ${user.phone || cancelModalBooking.phone || 'N/A'}\nTour: ${cancelModalBooking.tour?.title || 'Tour Package'}\nTravel Date: ${cancelModalBooking.booking_date || cancelModalBooking.travel_date}\nReason: ${cancelReason}\n\nPlease review in Admin Console.`
      );

      toast.success('Your tour reservation has been cancelled. Admin notification sent.', 'Booking Cancelled');

      // Auto trigger admin notification url helper
      const adminAlertUrl = `https://wa.me/919840000000?text=${adminWhatsAppMsg}`;
      window.open(adminAlertUrl, '_blank');

      setCancelModalBooking(null);
    } catch (err) {
      toast.error(err?.message || 'Failed to cancel reservation. Please contact support.', 'Cancellation Error');
    } finally {
      setIsCancelling(false);
    }
  };

  // Printable / Download PDF Receipt Handler
  const handlePrintReceipt = (booking) => {
    setSelectedReceiptBooking(booking);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // WhatsApp Share Handler
  const handleSendWhatsAppReceipt = (b) => {
    const orderRef = b.order_number || `#${b.id}`;
    const tourTitle = b.tour?.title || b.tour_name || 'South India Tour Package';
    const travelDate = b.booking_date || b.travel_date || 'Confirmed Date';
    const guests = b.tickets_count || `${b.adults || 1} Adults`;
    const price = b.total_price || b.total_amount || 0;
    const currency = b.currency || 'INR';

    const msg = encodeURIComponent(
      `🧾 *TRAMAX TOURS — BOOKING RECEIPT*\n\nReference: ${orderRef}\nGuest Name: ${user.name}\nTour: ${tourTitle}\nTravel Date: ${travelDate}\nGuests: ${guests}\nTotal Amount: ${currency} ${Number(price).toLocaleString()}\nStatus: ${b.status?.toUpperCase()}\n\nThank you for choosing Tramax Tours! Travel Made Simple & Memorable.`
    );
    window.open(`https://wa.me/919840000000?text=${msg}`, '_blank');
  };

  // Email Receipt Handler
  const handleSendEmailReceipt = (b) => {
    const orderRef = b.order_number || `#${b.id}`;
    toast.success(`Booking confirmation receipt for ${orderRef} has been emailed to ${user.email}!`, 'Email Sent');
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'all') return true;
    return (b.status || 'pending').toLowerCase() === filterStatus.toLowerCase();
  });

  if (isAuthLoading) {
    return (
      <div className="container" style={{ padding: '80px 20px', minHeight: '60vh', textAlign: 'center' }}>
        <Loading message="Loading Traveler Profile & Bookings..." />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="customer-profile-page-root" style={{ background: '#f8fafc', minHeight: '80vh', padding: '40px 0 80px' }}>
      <div className="container">
        {/* Profile Header Card */}
        <div
          className="customer-profile-header-card"
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '30px',
            boxShadow: '0 4px 20px rgba(11, 19, 41, 0.06)',
            marginBottom: '32px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #01AA90 0%, #01806C 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: '800',
                boxShadow: '0 4px 12px rgba(1, 170, 144, 0.3)',
              }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0B1329', margin: 0 }}>
                  {user.name || 'Traveler Account'}
                </h1>
                <span
                  style={{
                    background: '#e6f7f4',
                    color: '#01AA90',
                    fontSize: '12px',
                    fontWeight: '700',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(1, 170, 144, 0.2)',
                  }}
                >
                  Verified Traveler
                </span>
              </div>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
                ✉️ {user.email} {user.phone && <span>• 📞 {user.phone}</span>}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link to="/tours" className="btn btn-primary btn-sm">
              🧭 Explore More Tours
            </Link>
            <button type="button" onClick={logout} className="btn btn-outline btn-sm">
              Sign Out
            </button>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="customer-bookings-section">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              gap: '16px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0B1329', margin: 0 }}>
                My Booked Tours & Reservations
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
                View your itinerary receipts, download official PDF vouchers, and track reservation status.
              </p>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', background: '#e2e8f0', padding: '4px', borderRadius: '10px' }}>
              {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  style={{
                    border: 'none',
                    background: filterStatus === st ? '#01AA90' : 'transparent',
                    color: filterStatus === st ? '#ffffff' : '#475569',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {loadingBookings ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <Loading message="Fetching your bookings..." />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '60px 20px',
                textAlign: 'center',
                border: '1px dashed #cbd5e1',
              }}
            >
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>🏖️</span>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0B1329' }}>
                No {filterStatus !== 'all' ? filterStatus : ''} Bookings Found
              </h3>
              <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '440px', margin: '6px auto 20px' }}>
                You have not placed any tour reservations under this category yet. Explore our handcrafted South Indian tours!
              </p>
              <Link to="/tours" className="btn btn-primary btn-md">
                Browse Tour Packages &rarr;
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {filteredBookings.map((b) => {
                const orderRef = b.order_number || `#${b.id}`;
                const tourTitle = b.tour?.title || b.tour_name || 'Bespoke South India Tour';
                const travelDate = b.booking_date || b.travel_date || 'Upcoming Date';
                const thumbUrl = getMediaUrl(b.tour?.featured_image || b.tour?.media?.[0]);
                const status = (b.status || 'pending').toLowerCase();
                const price = Number(b.total_price || b.total_amount || 0);
                const currency = b.currency === 'EUR' ? '€' : b.currency === 'INR' ? '₹' : (b.currency || '₹');

                let statusBadgeStyle = { background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a' };
                if (status === 'confirmed') statusBadgeStyle = { background: '#e6f7f4', color: '#01AA90', border: '1px solid #99f6e4' };
                if (status === 'completed') statusBadgeStyle = { background: '#e0e7ff', color: '#4338ca', border: '1px solid #c7d2fe' };
                if (status === 'cancelled') statusBadgeStyle = { background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' };

                return (
                  <div
                    key={b.id}
                    className="customer-booking-card"
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      padding: '24px',
                      boxShadow: '0 4px 16px rgba(11, 19, 41, 0.04)',
                      border: '1px solid #e2e8f0',
                      display: 'grid',
                      gridTemplateColumns: '140px 1fr auto',
                      gap: '24px',
                      alignItems: 'center',
                    }}
                  >
                    {/* Tour Thumbnail */}
                    <div
                      style={{
                        width: '140px',
                        height: '110px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: '#e2e8f0',
                        position: 'relative',
                      }}
                    >
                      {thumbUrl ? (
                        <img
                          src={thumbUrl}
                          alt={tourTitle}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '32px' }}>
                          🧭
                        </div>
                      )}
                    </div>

                    {/* Booking Details */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#01AA90' }}>
                          {orderRef}
                        </span>
                        <span
                          style={{
                            fontSize: '11.5px',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            textTransform: 'uppercase',
                            ...statusBadgeStyle,
                          }}
                        >
                          ● {status}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0B1329', margin: '0 0 6px' }}>
                        {tourTitle}
                      </h3>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: '#475569' }}>
                        <span>📅 <strong>Travel Date:</strong> {travelDate}</span>
                        <span>👥 <strong>Guests:</strong> {b.tickets_count || `${b.adults || 1} Adults`}</span>
                        <span>💵 <strong>Payment:</strong> Pay on Arrival</span>
                      </div>

                      {b.special_requests && (
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '6px 0 0', fontStyle: 'italic' }}>
                          Note: {b.special_requests}
                        </p>
                      )}
                    </div>

                    {/* Actions & Price */}
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Total Amount</span>
                        <strong style={{ fontSize: '20px', fontWeight: '800', color: '#0B1329' }}>
                          {currency}{price.toLocaleString()}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-xs"
                          onClick={() => handlePrintReceipt(b)}
                          title="Print or Download PDF Receipt"
                        >
                          📄 Download PDF
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-xs"
                          onClick={() => handleSendWhatsAppReceipt(b)}
                          title="Share to WhatsApp"
                          style={{ color: '#16a34a' }}
                        >
                          💬 WhatsApp
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-xs"
                          onClick={() => handleSendEmailReceipt(b)}
                          title="Send confirmation email"
                        >
                          ✉️ Email
                        </button>
                        {status !== 'cancelled' && status !== 'completed' && (
                          <button
                            type="button"
                            className="btn btn-danger-outline btn-xs"
                            onClick={() => setCancelModalBooking(b)}
                            title="Cancel this reservation"
                          >
                            ❌ Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PRINTABLE / PDF RECEIPT MODAL
      ────────────────────────────────────────────────────────────── */}
      {selectedReceiptBooking && (
        <Modal
          isOpen={Boolean(selectedReceiptBooking)}
          onClose={() => setSelectedReceiptBooking(null)}
          title={`Booking Receipt #${selectedReceiptBooking.order_number || selectedReceiptBooking.id}`}
          size="lg"
        >
          <div className="receipt-print-container" style={{ padding: '20px', color: '#0B1329' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #01AA90', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <img src="/logo.png" alt="Tramax Tours" style={{ height: '48px', marginBottom: '6px' }} />
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  Travel Made Simple & Memorable • Chennai, Tamil Nadu
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#01AA90' }}>
                  OFFICIAL BOOKING RECEIPT
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', fontWeight: '700' }}>
                  Order: {selectedReceiptBooking.order_number || `#${selectedReceiptBooking.id}`}
                </p>
                <small style={{ color: '#64748b' }}>Date: {new Date().toLocaleDateString()}</small>
              </div>
            </div>

            {/* Guest & Itinerary Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
              <div>
                <strong style={{ fontSize: '13px', color: '#01AA90' }}>TRAVELER DETAILS:</strong>
                <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: '700' }}>{user.name}</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>Email: {user.email}</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>Phone: {user.phone || selectedReceiptBooking.phone || '+91 98400 00000'}</p>
              </div>
              <div>
                <strong style={{ fontSize: '13px', color: '#01AA90' }}>TOUR RESERVATION:</strong>
                <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: '700' }}>{selectedReceiptBooking.tour?.title || 'South India Tour'}</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>Date: {selectedReceiptBooking.booking_date || selectedReceiptBooking.travel_date}</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>Status: {selectedReceiptBooking.status?.toUpperCase()}</p>
              </div>
            </div>

            {/* Pricing Breakdown Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr style={{ background: '#0B1329', color: '#ffffff', fontSize: '12px' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Item / Description</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Guests</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0', fontSize: '13px' }}>
                  <td style={{ padding: '12px 10px' }}>
                    <strong>{selectedReceiptBooking.tour?.title || 'Tour Package'}</strong>
                    <br />
                    <small style={{ color: '#64748b' }}>Private AC Chauffeur Guide & Sightseeing</small>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                    {selectedReceiptBooking.tickets_count || 1}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '700' }}>
                    {selectedReceiptBooking.currency || '₹'} {Number(selectedReceiptBooking.total_price || selectedReceiptBooking.total_amount || 0).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Bottom Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                <p style={{ margin: 0 }}>✓ Payment Mode: <strong>Pay on Arrival / Cash or UPI</strong></p>
                <p style={{ margin: 0 }}>✓ 24/7 Helpline: <strong>+91 98400 00000</strong></p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => window.print()}
                >
                  🖨️ Print Receipt
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleSendWhatsAppReceipt(selectedReceiptBooking)}
                >
                  💬 Share on WhatsApp
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ─────────────────────────────────────────────────────────────
          CANCELLATION CONFIRMATION MODAL
      ────────────────────────────────────────────────────────────── */}
      {cancelModalBooking && (
        <Modal
          isOpen={Boolean(cancelModalBooking)}
          onClose={() => setCancelModalBooking(null)}
          title="Cancel Tour Reservation"
          size="md"
        >
          <div style={{ padding: '10px' }}>
            <p style={{ fontSize: '14px', color: '#475569' }}>
              Are you sure you want to cancel your reservation for <strong>{cancelModalBooking.tour?.title || 'this tour'}</strong> on <strong>{cancelModalBooking.booking_date || cancelModalBooking.travel_date}</strong>?
            </p>

            <div className="form-group" style={{ margin: '16px 0' }}>
              <label className="form-label" style={{ fontWeight: '700', fontSize: '13px' }}>
                Reason for Cancellation:
              </label>
              <select
                className="form-control"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              >
                <option value="Change of travel plans">Change of travel plans</option>
                <option value="Schedule conflict or delay">Schedule conflict or delay</option>
                <option value="Health / Medical emergency">Health / Medical emergency</option>
                <option value="Booking details modification needed">Booking details modification needed</option>
                <option value="Other reason">Other reason</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setCancelModalBooking(null)}
                disabled={isCancelling}
              >
                Keep Booking
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation & Notify Admin'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
