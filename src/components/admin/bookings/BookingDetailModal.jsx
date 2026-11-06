import { useState } from 'react';
import useAuth from '../../../hooks/useAuth';
import { getMediaUrl } from '../../../utils/media';

export default function BookingDetailModal({
  booking,
  isOpen,
  onClose,
  onOpenStatusModal,
  onPrintBooking,
  onSaveAdminNotes,
  onApproveBooking,
  onRejectBooking,
  onRecordPayment,
  onAddContactLog,
  onResendConfirmation,
  isSavingNotes = false,
  isProcessing = false,
}) {
  const { hasPermission } = useAuth();
  const canEditStatus = hasPermission('bookings.edit_status');

  const [adminNotes, setAdminNotes] = useState(booking?.admin_notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // Manual payment recording form state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('cash');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  // Contact logging form state
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactType, setContactType] = useState('phone');
  const [contactNotes, setContactNotes] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  if (!isOpen || !booking) return null;

  const currency = booking.currency === 'EUR' ? '€' : (booking.currency || 'INR');
  const totalPrice = Number(booking.total_price || 0);
  const advanceAmount = Number(booking.advance_amount || 0);
  const balanceAmount = Number(booking.balance_amount !== undefined ? booking.balance_amount : Math.max(0, totalPrice - advanceAmount));

  const customerPhone = booking.customer?.phone || booking.phone || '';
  const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
  const whatsAppUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${booking.customer?.name || ''}, greetings from Wanderer South India regarding your tour reservation #${booking.order_number}.`)}`
    : null;

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'status-badge-confirmed';
      case 'completed':
        return 'status-badge-completed';
      case 'cancelled':
      case 'rejected':
        return 'status-badge-cancelled';
      case 'pending':
      default:
        return 'status-badge-pending';
    }
  };

  const getPaymentBadgeClass = (status) => {
    switch (status) {
      case 'paid':
        return 'payment-paid';
      case 'refunded':
      case 'failed':
        return 'payment-danger';
      case 'pending':
      default:
        return 'payment-pending';
    }
  };

  const handleNotesSubmit = async (e) => {
    e.preventDefault();
    if (onSaveAdminNotes) {
      await onSaveAdminNotes(booking.id, adminNotes);
      setIsEditingNotes(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!onRecordPayment) return;
    const amountVal = parseFloat(payAmount);
    if (isNaN(amountVal) || amountVal <= 0) return;

    try {
      setIsSubmittingPay(true);
      await onRecordPayment(booking.id, {
        amount: amountVal,
        payment_method: payMethod,
        payment_date: payDate,
        transaction_reference: payRef.trim() || undefined,
        notes: payNotes.trim() || undefined,
      });
      setShowPaymentForm(false);
      setPayAmount('');
      setPayRef('');
      setPayNotes('');
    } finally {
      setIsSubmittingPay(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!onAddContactLog || !contactNotes.trim()) return;

    try {
      setIsSubmittingContact(true);
      await onAddContactLog(booking.id, {
        contact_type: contactType,
        notes: contactNotes.trim(),
        contacted_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      });
      setShowContactForm(false);
      setContactNotes('');
    } finally {
      setIsSubmittingContact(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container modal-large booking-detail-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '960px' }}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="booking-modal-title-group">
            <h2 className="modal-title">
              Booking Details &amp; Order #{booking.order_number}
            </h2>
            <div className="booking-title-badges">
              <span className={`booking-status-badge ${getStatusBadgeClass(booking.booking_status)}`}>
                {booking.booking_status?.toUpperCase()}
              </span>
              <span className={`payment-status-pill ${getPaymentBadgeClass(booking.payment_status)}`}>
                Payment: {booking.payment_status?.toUpperCase()}
              </span>
              {balanceAmount > 0 ? (
                <span className="badge badge-warning" style={{ fontSize: '11px' }}>
                  Balance Due: {currency} {balanceAmount.toFixed(2)}
                </span>
              ) : (
                <span className="badge badge-success" style={{ fontSize: '11px' }}>
                  Fully Settled ✓
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Action Bar: Customer Contact & Direct Approval */}
        <div style={{ background: '#f8fafc', padding: '12px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {customerPhone && (
              <>
                <a
                  href={`tel:${customerPhone}`}
                  className="btn btn-outline btn-xs"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  📞 Call: {customerPhone}
                </a>
                {whatsAppUrl && (
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline btn-xs"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', borderColor: '#22c55e', color: '#15803d' }}
                  >
                    💬 WhatsApp Customer
                  </a>
                )}
              </>
            )}
            <button
              type="button"
              className="btn btn-outline btn-xs"
              onClick={() => setShowContactForm(!showContactForm)}
            >
              📝 {showContactForm ? 'Hide Contact Form' : 'Log Call / WhatsApp Note'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {canEditStatus && booking.booking_status !== 'confirmed' && (
              <button
                type="button"
                className="btn btn-primary btn-xs"
                disabled={isProcessing}
                onClick={() => onApproveBooking && onApproveBooking(booking.id)}
                style={{ background: '#01aa90', borderColor: '#01aa90' }}
              >
                ✓ Approve Booking &amp; Issue Ticket
              </button>
            )}
            {canEditStatus && booking.booking_status !== 'rejected' && booking.booking_status !== 'cancelled' && (
              <button
                type="button"
                className="btn btn-danger btn-xs"
                disabled={isProcessing}
                onClick={() => onRejectBooking && onRejectBooking(booking.id)}
              >
                ✕ Reject Booking
              </button>
            )}
            {booking.booking_status === 'confirmed' && onResendConfirmation && (
              <button
                type="button"
                className="btn btn-outline btn-xs"
                disabled={isProcessing}
                onClick={() => onResendConfirmation(booking.id)}
              >
                ✉ Resend Ticket Email
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body booking-modal-content">
          {/* Collapsible Contact Log Entry Form */}
          {showContactForm && (
            <div className="detail-card" style={{ background: '#f0fdfa', border: '1px solid #99f6e4', marginBottom: '18px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '14px', color: '#01806c' }}>
                📞 Record Customer Contact Log
              </h4>
              <form onSubmit={handleContactSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr auto', gap: '10px', alignItems: 'start' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '12px' }}>Channel</label>
                    <select
                      className="form-control form-select form-control-sm"
                      value={contactType}
                      onChange={(e) => setContactType(e.target.value)}
                    >
                      <option value="phone">Phone Call</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="email">Email</option>
                      <option value="other">Other / Direct</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '12px' }}>Discussion Notes / Follow-up Details</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Spoke on phone, agreed to pay 50% advance via UPI on Friday..."
                      value={contactNotes}
                      onChange={(e) => setContactNotes(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ paddingTop: '22px' }}>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={isSubmittingContact || !contactNotes.trim()}
                    >
                      {isSubmittingContact ? 'Saving...' : 'Save Log'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          <div className="booking-detail-grid">
            {/* Left Column: Customer & Trip Details */}
            <div className="booking-detail-section">
              {/* Customer Information */}
              <div className="detail-card">
                <h3 className="detail-card-heading">👤 Customer Information</h3>
                <div className="detail-fields-list">
                  <div className="detail-field-row">
                    <span className="field-label">Full Name:</span>
                    <span className="field-value">
                      <strong>{booking.customer?.name || `${booking.customer?.first_name || ''} ${booking.customer?.last_name || ''}`}</strong>
                    </span>
                  </div>
                  <div className="detail-field-row">
                    <span className="field-label">Email:</span>
                    <span className="field-value">
                      <a href={`mailto:${booking.customer?.email}`} className="detail-link">
                        {booking.customer?.email || 'N/A'}
                      </a>
                    </span>
                  </div>
                  <div className="detail-field-row">
                    <span className="field-label">Phone:</span>
                    <span className="field-value">
                      {booking.customer?.phone ? (
                        <a href={`tel:${booking.customer.phone}`} className="detail-link">
                          {booking.customer.phone}
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </span>
                  </div>
                  <div className="detail-field-row">
                    <span className="field-label">Country:</span>
                    <span className="field-value">{booking.customer?.country || booking.country || 'India'}</span>
                  </div>
                </div>
              </div>

              {/* Trip Specifications */}
              <div className="detail-card">
                <h3 className="detail-card-heading">🧳 Trip &amp; Travel Specifications</h3>
                <div className="detail-fields-list">
                  <div className="detail-field-row">
                    <span className="field-label">Destination:</span>
                    <span className="field-value">
                      <strong>{booking.destination_name || booking.tour?.destination_name || booking.tour?.title || 'Not provided'}</strong>
                    </span>
                  </div>
                  <div className="detail-field-row">
                    <span className="field-label">Pickup Location:</span>
                    <span className="field-value">{booking.pickup_location || 'Not provided'}</span>
                  </div>
                  <div className="detail-field-row">
                    <span className="field-label">Travel Date:</span>
                    <span className="field-value">
                      <strong>{booking.arrival_date || booking.booking_date || 'Not provided'}</strong>
                    </span>
                  </div>
                  <div className="detail-field-row">
                    <span className="field-label">Duration:</span>
                    <span className="field-value">{booking.duration_days || booking.tour?.duration_days || '1 Day'}</span>
                  </div>
                  <div className="detail-field-row">
                    <span className="field-label">Guests Count:</span>
                    <span className="field-value font-bold text-accent">
                      {booking.tickets_count} Pax ({booking.adults_count ?? 1} Adults{booking.children_count ? `, ${booking.children_count} Children` : ''})
                    </span>
                  </div>
                  {booking.vehicle_preference && (
                    <div className="detail-field-row">
                      <span className="field-label">Vehicle:</span>
                      <span className="field-value">{booking.vehicle_preference}</span>
                    </div>
                  )}
                  {booking.hotel_category && (
                    <div className="detail-field-row">
                      <span className="field-label">Hotel:</span>
                      <span className="field-value">{booking.hotel_category}</span>
                    </div>
                  )}
                  {booking.special_requests && (
                    <div className="detail-field-row">
                      <span className="field-label">Special Requests:</span>
                      <span className="field-value">{booking.special_requests}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Contact History */}
              <div className="detail-card">
                <div className="detail-card-header-flex">
                  <h3 className="detail-card-heading">📞 Customer Contact History</h3>
                  <button
                    type="button"
                    className="btn btn-outline btn-xs"
                    onClick={() => setShowContactForm(!showContactForm)}
                  >
                    + Add Log
                  </button>
                </div>
                {booking.contact_logs && booking.contact_logs.length > 0 ? (
                  <div className="status-timeline" style={{ marginTop: '10px' }}>
                    {booking.contact_logs.map((log) => (
                      <div key={log.id} className="timeline-item" style={{ paddingBottom: '10px' }}>
                        <div className="timeline-marker" style={{ background: '#0284c7' }}></div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <span className="timeline-transition font-semibold" style={{ textTransform: 'capitalize' }}>
                              {log.contact_type === 'whatsapp' ? '💬 WhatsApp' : log.contact_type === 'phone' ? '📞 Phone Call' : log.contact_type}
                            </span>
                            <span className="timeline-date">
                              {log.contacted_at ? new Date(log.contacted_at).toLocaleString() : ''}
                            </span>
                          </div>
                          <p className="timeline-note" style={{ margin: '4px 0 2px' }}>"{log.notes}"</p>
                          <span className="timeline-author" style={{ fontSize: '11px', color: '#64748b' }}>
                            Logged by: {log.recorded_by_name || 'Staff'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-sm" style={{ marginTop: '8px' }}>
                    No communication attempts recorded yet. Click "+ Add Log" after speaking with the customer.
                  </p>
                )}
              </div>

              {/* Internal Admin Notes */}
              <div className="detail-card admin-notes-card">
                <div className="detail-card-header-flex">
                  <h3 className="detail-card-heading">🔒 Internal Admin Notes</h3>
                  {!isEditingNotes && canEditStatus && (
                    <button
                      type="button"
                      className="btn btn-outline btn-xs"
                      onClick={() => {
                        setAdminNotes(booking.admin_notes || '');
                        setIsEditingNotes(true);
                      }}
                    >
                      Edit
                    </button>
                  )}
                </div>

                {isEditingNotes ? (
                  <form onSubmit={handleNotesSubmit} className="admin-notes-form">
                    <textarea
                      className="form-control admin-notes-textarea"
                      rows={3}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add internal notes about this booking (only visible to admins)..."
                    />
                    <div className="notes-btn-group">
                      <button
                        type="submit"
                        className="btn btn-primary btn-xs"
                        disabled={isSavingNotes}
                      >
                        {isSavingNotes ? 'Saving...' : 'Save Notes'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-xs"
                        onClick={() => setIsEditingNotes(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="admin-notes-content">
                    {booking.admin_notes || <span className="text-muted">No internal notes added yet.</span>}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Tour, Payments & History */}
            <div className="booking-detail-section">
              {/* Tour Package Summary */}
              <div className="detail-card tour-detail-card">
                <h3 className="detail-card-heading">🧭 Tour Package Information</h3>
                <div className="tour-summary-box">
                  {booking.tour?.image_path && (
                    <img
                      src={getMediaUrl(booking.tour.image_path)}
                      alt={booking.tour?.title || 'Tour'}
                      className="tour-thumb-img"
                    />
                  )}
                  <div className="tour-summary-meta">
                    <h4 className="tour-summary-title">{booking.tour?.title || 'Tour Package'}</h4>
                    <p className="tour-summary-sub">
                      <span>Type: {booking.tour?.tour_type || 'Custom Tour'}</span>
                      {booking.tour?.duration_days && <span> • Duration: {booking.tour.duration_days} Days</span>}
                      {booking.tour?.destination_name && <span> • Region: {booking.tour.destination_name}</span>}
                    </p>
                    {booking.tour?.slug && (
                      <a
                        href={`/tours/${booking.tour.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-xs view-public-tour-btn"
                      >
                        View Public Tour Page ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Financial & Payment Breakdown Card */}
              <div className="detail-card" style={{ border: '1.5px solid #01aa90' }}>
                <div className="detail-card-header-flex">
                  <h3 className="detail-card-heading" style={{ color: '#01aa90' }}>💳 Payment Tracking &amp; Balance</h3>
                  {canEditStatus && (
                    <button
                      type="button"
                      className="btn btn-primary btn-xs"
                      onClick={() => {
                        setShowPaymentForm(!showPaymentForm);
                        if (!payAmount && balanceAmount > 0) {
                          setPayAmount(balanceAmount.toString());
                        }
                      }}
                    >
                      + Record Payment
                    </button>
                  )}
                </div>

                <div className="detail-fields-list price-breakdown-list" style={{ marginTop: '12px' }}>
                  <div className="detail-field-row">
                    <span className="field-label">Total Booking Amount:</span>
                    <span className="field-value font-bold" style={{ fontSize: '15px' }}>
                      {currency} {totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="detail-field-row">
                    <span className="field-label">Agreed Payment Mode:</span>
                    <span className="field-value font-bold text-accent" style={{ textTransform: 'capitalize' }}>
                      {booking.payment_method?.replace(/_/g, ' ') || 'Pay on Arrival'}
                    </span>
                  </div>
                  <div className="detail-field-row" style={{ color: '#16a34a' }}>
                    <span className="field-label">Advance / Amount Paid:</span>
                    <span className="field-value font-bold" style={{ fontSize: '14px' }}>
                      {currency} {advanceAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="detail-field-row" style={{ background: balanceAmount > 0 ? '#fff1f2' : '#f0fdf4', padding: '8px 10px', borderRadius: '6px' }}>
                    <span className="field-label font-bold" style={{ color: balanceAmount > 0 ? '#b91c1c' : '#15803d' }}>
                      Remaining Balance Due:
                    </span>
                    <span className="field-value font-bold" style={{ fontSize: '16px', color: balanceAmount > 0 ? '#b91c1c' : '#15803d' }}>
                      {currency} {balanceAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="detail-field-row">
                    <span className="field-label">Payment Status:</span>
                    <span className={`payment-status-dot ${getPaymentBadgeClass(booking.payment_status)}`}>
                      {booking.payment_status || 'pending'}
                    </span>
                  </div>
                </div>

                {/* Collapsible Manual Payment Form */}
                {showPaymentForm && (
                  <form onSubmit={handlePaymentSubmit} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '14px', marginTop: '14px' }}>
                    <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: '#0B1329' }}>
                      💵 Record Manual Customer Payment
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '11.5px' }}>Amount ({currency}) *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          className="form-control form-control-sm"
                          value={payAmount}
                          onChange={(e) => setPayAmount(e.target.value)}
                          placeholder="e.g. 5000"
                          required
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '11.5px' }}>Payment Method *</label>
                        <select
                          className="form-control form-select form-control-sm"
                          value={payMethod}
                          onChange={(e) => setPayMethod(e.target.value)}
                        >
                          <option value="cash">Cash</option>
                          <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                          <option value="bank_transfer">Bank Transfer / NEFT / IMPS</option>
                          <option value="direct">Direct Payment</option>
                          <option value="pay_on_arrival">Pay on Arrival</option>
                        </select>
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '11.5px' }}>Payment Date</label>
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          value={payDate}
                          onChange={(e) => setPayDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '11.5px' }}>Transaction Reference / UTR</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. UPI-12345678 or Cash Receipt"
                          value={payRef}
                          onChange={(e) => setPayRef(e.target.value)}
                        />
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label className="form-label" style={{ fontSize: '11.5px' }}>Notes</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. Received 50% advance for Surfing package..."
                          value={payNotes}
                          onChange={(e) => setPayNotes(e.target.value)}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-xs"
                        onClick={() => setShowPaymentForm(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary btn-xs"
                        disabled={isSubmittingPay}
                      >
                        {isSubmittingPay ? 'Recording...' : 'Confirm & Record Payment'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Recorded Payment History List */}
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '12.5px', color: '#64748b', textTransform: 'uppercase' }}>
                    Payment Installments &amp; Transactions
                  </h4>
                  {booking.payments && booking.payments.length > 0 ? (
                    <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                          <th style={{ padding: '6px', textAlign: 'left' }}>Date</th>
                          <th style={{ padding: '6px', textAlign: 'left' }}>Method</th>
                          <th style={{ padding: '6px', textAlign: 'left' }}>Reference</th>
                          <th style={{ padding: '6px', textAlign: 'right' }}>Amount</th>
                          <th style={{ padding: '6px', textAlign: 'center' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {booking.payments.map((p) => (
                          <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '6px' }}>{p.payment_date || (p.created_at ? p.created_at.substring(0, 10) : '—')}</td>
                            <td style={{ padding: '6px', textTransform: 'capitalize' }}>{p.payment_method?.replace(/_/g, ' ')}</td>
                            <td style={{ padding: '6px', fontFamily: 'monospace', fontSize: '11px' }}>{p.transaction_reference}</td>
                            <td style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>{currency} {Number(p.amount).toFixed(2)}</td>
                            <td style={{ padding: '6px', textAlign: 'center' }}>
                              <span className={`badge badge-sm ${p.status === 'completed' || p.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-muted-sm">No payment transactions recorded yet.</p>
                  )}
                </div>
              </div>

              {/* Status Change History Timeline */}
              <div className="detail-card">
                <h3 className="detail-card-heading">⏱️ Booking Status History</h3>
                {booking.status_history && booking.status_history.length > 0 ? (
                  <div className="status-timeline">
                    {booking.status_history.map((hist, idx) => (
                      <div key={hist.id || idx} className="timeline-item">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <span className="timeline-transition">
                              {hist.previous_status ? `${hist.previous_status} → ` : ''}
                              <strong>{hist.new_status}</strong>
                            </span>
                            <span className="timeline-date">
                              {hist.created_at ? new Date(hist.created_at).toLocaleString() : ''}
                            </span>
                          </div>
                          {hist.changed_by_name && (
                            <span className="timeline-author">by {hist.changed_by_name}</span>
                          )}
                          {hist.notes && <p className="timeline-note">"{hist.notes}"</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-sm">
                    Created on {booking.created_at ? new Date(booking.created_at).toLocaleString() : 'N/A'}.
                  </p>
                )}
              </div>

              {/* Email & Notification Status */}
              <div className="detail-card">
                <h3 className="detail-card-heading">✉️ Email &amp; Notification Status</h3>
                <div className="detail-fields-list">
                  <div className="detail-field-row">
                    <span className="field-label">Customer Email:</span>
                    <span className="field-value">
                      <span className={`badge badge-sm ${booking.customer_email_status === 'sent' ? 'badge-success' : booking.customer_email_status === 'failed' ? 'badge-danger' : 'badge-warning'}`}>
                        {booking.customer_email_status ? booking.customer_email_status.toUpperCase() : 'PENDING'}
                      </span>
                      {booking.customer_email_sent_at && (
                        <span className="text-muted-sm" style={{ display: 'block', fontSize: '11px', marginTop: '2px' }}>
                          Sent: {new Date(booking.customer_email_sent_at).toLocaleString()}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="detail-field-row">
                    <span className="field-label">Admin Copy:</span>
                    <span className="field-value">
                      <span className={`badge badge-sm ${booking.admin_email_status === 'sent' ? 'badge-success' : booking.admin_email_status === 'failed' ? 'badge-danger' : 'badge-warning'}`}>
                        {booking.admin_email_status ? booking.admin_email_status.toUpperCase() : 'PENDING'}
                      </span>
                      {booking.admin_email_sent_at && (
                        <span className="text-muted-sm" style={{ display: 'block', fontSize: '11px', marginTop: '2px' }}>
                          Sent: {new Date(booking.admin_email_sent_at).toLocaleString()}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="detail-field-row">
                    <span className="field-label">Customer Send Count:</span>
                    <span className="field-value">{booking.email_send_count || 0} of 3 maximum</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer booking-modal-footer">
          <div className="modal-footer-left">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => onPrintBooking(booking)}
            >
              🖨️ Print Voucher
            </button>
          </div>
          <div className="modal-footer-right">
            {canEditStatus && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  onClose();
                  onOpenStatusModal(booking);
                }}
              >
                Change Lifecycle Status
              </button>
            )}
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
