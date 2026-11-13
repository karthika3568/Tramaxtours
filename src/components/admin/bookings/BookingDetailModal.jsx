import { BanknoteIcon, CheckIcon, ClockIcon, CompassIcon, CreditCardIcon, DownloadIcon, LockIcon, MailIcon, PhoneIcon, PrintIcon, SparklesIcon, UserIcon, WhatsAppIcon, XIcon } from '../../../components/common/Icons';
import { useState, useEffect } from 'react';
import useAuth from '../../../hooks/useAuth';
import { getMediaUrl } from '../../../utils/media';
import bookingService from '../../../services/bookingService';

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
  onRecordPaymentDiscussion,
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

  // Payment discussion form state
  const [showDiscussionForm, setShowDiscussionForm] = useState(false);
  const [discussionAgreedPrice, setDiscussionAgreedPrice] = useState(
    booking?.agreed_price !== undefined && booking?.agreed_price !== null ? booking.agreed_price : (booking?.total_price || '')
  );
  const [discussionAdvance, setDiscussionAdvance] = useState(booking?.advance_amount || 0);
  const [discussionPaymentMethod, setDiscussionPaymentMethod] = useState(booking?.payment_method || 'cash');
  const [discussionNotes, setDiscussionNotes] = useState(booking?.payment_discussion_notes || '');
  const [discussionNextStatus, setDiscussionNextStatus] = useState('payment_discussion');
  const [isSubmittingDiscussion, setIsSubmittingDiscussion] = useState(false);

  // Explicit confirmation popup state
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [confirmNotes, setConfirmNotes] = useState('');
  const [confirmAcknowledged, setConfirmAcknowledged] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Sync state when booking changes
  useEffect(() => {
    if (booking) {
      setAdminNotes(booking.admin_notes || '');
      setDiscussionAgreedPrice(
        booking.agreed_price !== undefined && booking.agreed_price !== null ? booking.agreed_price : (booking.total_price || '')
      );
      setDiscussionAdvance(booking.advance_amount || 0);
      setDiscussionPaymentMethod(booking.payment_method || 'cash');
      setDiscussionNotes(booking.payment_discussion_notes || '');
    }
  }, [booking]);

  if (!isOpen || !booking) return null;

  const currency = booking.currency === 'EUR' ? '€' : (booking.currency || 'INR');
  const totalPrice = Number(booking.total_price || 0);
  const agreedPrice = Number(booking.agreed_price !== undefined && booking.agreed_price !== null ? booking.agreed_price : totalPrice);
  const advanceAmount = Number(booking.advance_amount || 0);
  const balanceAmount = Number(booking.balance_amount !== undefined ? booking.balance_amount : Math.max(0, agreedPrice - advanceAmount));

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
      case 'contacted':
        return 'status-badge-contacted';
      case 'payment_discussion':
        return 'status-badge-discussion';
      case 'awaiting_confirmation':
        return 'status-badge-awaiting';
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

  const handleDiscussionSubmit = async (e) => {
    e.preventDefault();
    if (!onRecordPaymentDiscussion) return;
    const priceVal = parseFloat(discussionAgreedPrice);
    const advanceVal = parseFloat(discussionAdvance) || 0;
    if (isNaN(priceVal) || priceVal < 0) return;

    try {
      setIsSubmittingDiscussion(true);
      await onRecordPaymentDiscussion(booking.id, {
        agreed_price: priceVal,
        advance_amount: advanceVal,
        balance_amount: Math.max(0, priceVal - advanceVal),
        payment_method: discussionPaymentMethod,
        payment_discussion_notes: discussionNotes.trim(),
        booking_status: discussionNextStatus,
      });
      setShowDiscussionForm(false);
    } finally {
      setIsSubmittingDiscussion(false);
    }
  };

  const handleExplicitConfirm = async (e) => {
    e.preventDefault();
    if (!onApproveBooking) return;

    try {
      setIsConfirming(true);
      await onApproveBooking(booking.id, {
        agreed_price: Number(discussionAgreedPrice || agreedPrice),
        advance_amount: Number(discussionAdvance || advanceAmount),
        balance_amount: Math.max(0, Number(discussionAgreedPrice || agreedPrice) - Number(discussionAdvance || advanceAmount)),
        payment_method: discussionPaymentMethod || booking.payment_method,
        notes: confirmNotes.trim() || 'Booking confirmed by administrator and official ticket issued',
      });
      setShowConfirmPopup(false);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleDownloadTicketPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      const blob = await bookingService.downloadReceipt(booking.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket_${booking.ticket_number || booking.order_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      alert('Unable to download ticket PDF. Please try again.');
    } finally {
      setIsDownloadingPdf(false);
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
                  Fully Settled
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          ><XIcon size={14} /></button>
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
                  Call: {customerPhone}
                </a>
                {whatsAppUrl && (
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline btn-xs"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', borderColor: '#22c55e', color: '#15803d' }}
                  >
                    WhatsApp Customer
                  </a>
                )}
              </>
            )}
            <button
              type="button"
              className="btn btn-outline btn-xs"
              onClick={() => setShowContactForm(!showContactForm)}
            >
              {showContactForm ? 'Hide Contact Form' : 'Log Call / WhatsApp Note'}
            </button>
            {canEditStatus && (
              <button
                type="button"
                className="btn btn-outline btn-xs"
                onClick={() => setShowDiscussionForm(!showDiscussionForm)}
                style={{ borderColor: '#8b5cf6', color: '#6d28d9' }}
              >
                {showDiscussionForm ? 'Hide Terms Form' : 'Discuss / Negotiate Payment Terms'}
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {booking.ticket_number && (
              <button
                type="button"
                className="btn btn-outline btn-xs"
                onClick={handleDownloadTicketPdf}
                disabled={isDownloadingPdf}
                style={{ borderColor: '#059669', color: '#047857', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <DownloadIcon size={13} /> {isDownloadingPdf ? 'Generating...' : 'Download Ticket PDF'}
              </button>
            )}
            {canEditStatus && booking.booking_status !== 'confirmed' && (
              <button
                type="button"
                className="btn btn-primary btn-xs"
                disabled={isProcessing}
                onClick={() => setShowConfirmPopup(true)}
                style={{ background: '#059669', borderColor: '#059669', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <CheckIcon size={13} /> Confirm Booking &amp; Issue Ticket
              </button>
            )}
            {canEditStatus && booking.booking_status !== 'rejected' && booking.booking_status !== 'cancelled' && (
              <button
                type="button"
                className="btn btn-danger btn-xs"
                disabled={isProcessing}
                onClick={() => onRejectBooking && onRejectBooking(booking.id)}
              >
                Reject Booking
              </button>
            )}
            {booking.booking_status === 'confirmed' && onResendConfirmation && (
              <button
                type="button"
                className="btn btn-outline btn-xs"
                disabled={isProcessing}
                onClick={() => onResendConfirmation(booking.id)}
              >
                Resend Ticket Email
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body booking-modal-content">
          {/* Confirmed Ticket Notice Banner OR Pending Notice */}
          {booking.ticket_number ? (
            <div
              style={{
                background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                border: '1.5px solid #10b981',
                borderRadius: '12px',
                padding: '14px 20px',
                marginBottom: '18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#047857' }}>
                  <SparklesIcon size={14} color="#059669" />
                  <span>Official Confirmed Tour Ticket Issued</span>
                </div>
                <h3 style={{ margin: '4px 0 2px', fontSize: '18px', fontWeight: '800', color: '#065f46' }}>
                  Ticket Number: {booking.ticket_number}
                </h3>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#047857' }}>
                  Confirmed Date: {booking.confirmed_at ? new Date(booking.confirmed_at).toLocaleString() : new Date().toLocaleString()}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleDownloadTicketPdf}
                  disabled={isDownloadingPdf}
                  style={{ background: '#059669', borderColor: '#059669', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                >
                  <DownloadIcon size={14} />
                  <span>{isDownloadingPdf ? 'Downloading...' : 'Download Ticket PDF'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                background: '#fefce8',
                border: '1px solid #fef08a',
                borderRadius: '10px',
                padding: '12px 18px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div>
                <strong style={{ color: '#854d0e', fontSize: '13.5px' }}>
                  Booking Status: {booking.booking_status?.toUpperCase() || 'PENDING'}
                </strong>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#a16207' }}>
                  Initial booking request received. No confirmed ticket has been issued yet. Contact customer, finalize payment terms, then click "Confirm Booking &amp; Issue Ticket".
                </p>
              </div>
              {canEditStatus && (
                <button
                  type="button"
                  className="btn btn-primary btn-xs"
                  onClick={() => setShowConfirmPopup(true)}
                  style={{ background: '#059669', borderColor: '#059669' }}
                >
                  Confirm Booking Now
                </button>
              )}
            </div>
          )}
          {/* Collapsible Contact Log Entry Form */}
          {showContactForm && (
            <div className="detail-card" style={{ background: '#f0fdfa', border: '1px solid #99f6e4', marginBottom: '18px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '14px', color: '#01806c' }}>
                Record Customer Contact Log
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
                <h3 className="detail-card-heading">Customer Information</h3>
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
                <h3 className="detail-card-heading">Trip & Travel Specifications</h3>
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
                  <h3 className="detail-card-heading">Customer Contact History</h3>
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
                              {log.contact_type === 'whatsapp' ? 'WhatsApp' : log.contact_type === 'phone' ? 'Phone Call' : log.contact_type}
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
                  <h3 className="detail-card-heading">Internal Admin Notes</h3>
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
                <h3 className="detail-card-heading">Tour Package Information</h3>
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
                  <h3 className="detail-card-heading" style={{ color: '#01aa90' }}>
                    Payment Discussion &amp; Financial Tracking
                  </h3>
                  {canEditStatus && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-xs"
                        onClick={() => setShowDiscussionForm(!showDiscussionForm)}
                        style={{ borderColor: '#8b5cf6', color: '#6d28d9' }}
                      >
                        {showDiscussionForm ? 'Close Terms' : '✏️ Edit Terms'}
                      </button>
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
                    </div>
                  )}
                </div>

                {/* Collapsible Payment Discussion & Negotiation Form */}
                {showDiscussionForm && (
                  <form
                    onSubmit={handleDiscussionSubmit}
                    style={{
                      background: '#f5f3ff',
                      border: '1.5px solid #c4b5fd',
                      borderRadius: '8px',
                      padding: '14px',
                      marginTop: '12px',
                      marginBottom: '12px',
                    }}
                  >
                    <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: '#5b21b6', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <CreditCardIcon size={14} color="#6d28d9" />
                      <span>Negotiate / Record Agreed Payment Terms</span>
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '11.5px' }}>Agreed Package Price ({currency}) *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control form-control-sm"
                          value={discussionAgreedPrice}
                          onChange={(e) => setDiscussionAgreedPrice(e.target.value)}
                          placeholder="e.g. 35000"
                          required
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '11.5px' }}>Advance Amount ({currency})</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control form-control-sm"
                          value={discussionAdvance}
                          onChange={(e) => setDiscussionAdvance(e.target.value)}
                          placeholder="e.g. 10000"
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '11.5px' }}>Calculated Balance ({currency})</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          readOnly
                          value={`${currency} ${Math.max(0, (parseFloat(discussionAgreedPrice) || 0) - (parseFloat(discussionAdvance) || 0)).toFixed(2)}`}
                          style={{ background: '#f1f5f9', fontWeight: 'bold' }}
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '11.5px' }}>Agreed Payment Mode</label>
                        <select
                          className="form-control form-select form-control-sm"
                          value={discussionPaymentMethod}
                          onChange={(e) => setDiscussionPaymentMethod(e.target.value)}
                        >
                          <option value="cash">Cash (Direct)</option>
                          <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                          <option value="bank_transfer">Bank Transfer / NEFT / IMPS</option>
                          <option value="direct">Direct Payment</option>
                          <option value="pay_on_arrival">Pay on Arrival</option>
                        </select>
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label className="form-label" style={{ fontSize: '11.5px' }}>Discussion Notes &amp; Terms Agreed</label>
                        <textarea
                          rows={2}
                          className="form-control form-control-sm"
                          placeholder="e.g. Customer agreed to ₹32,000 package rate with 30% advance on WhatsApp. Remaining at hotel check-in."
                          value={discussionNotes}
                          onChange={(e) => setDiscussionNotes(e.target.value)}
                        />
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label className="form-label" style={{ fontSize: '11.5px' }}>Update Status To</label>
                        <select
                          className="form-control form-select form-control-sm"
                          value={discussionNextStatus}
                          onChange={(e) => setDiscussionNextStatus(e.target.value)}
                        >
                          <option value="payment_discussion">Payment Discussion (Terms Under Negotiation)</option>
                          <option value="awaiting_confirmation">Awaiting Confirmation (Terms Settled, Awaiting Final Go-Ahead)</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-xs"
                        onClick={() => setShowDiscussionForm(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary btn-xs"
                        disabled={isSubmittingDiscussion}
                        style={{ background: '#7c3aed', borderColor: '#7c3aed' }}
                      >
                        {isSubmittingDiscussion ? 'Saving Terms...' : 'Save Payment Discussion Terms'}
                      </button>
                    </div>
                  </form>
                )}

                <div className="detail-fields-list price-breakdown-list" style={{ marginTop: '12px' }}>
                  <div className="detail-field-row">
                    <span className="field-label">Original Booking Price:</span>
                    <span className="field-value font-bold" style={{ fontSize: '14px', color: '#64748b' }}>
                      {currency} {totalPrice.toFixed(2)}
                    </span>
                  </div>
                  {booking.agreed_price && (
                    <div className="detail-field-row" style={{ background: '#faf5ff', padding: '6px 8px', borderRadius: '4px' }}>
                      <span className="field-label font-bold" style={{ color: '#7c3aed' }}>
                        Agreed Package Price:
                      </span>
                      <span className="field-value font-bold" style={{ fontSize: '15px', color: '#7c3aed' }}>
                        {currency} {agreedPrice.toFixed(2)}
                      </span>
                    </div>
                  )}
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
                  {booking.payment_discussion_notes && (
                    <div className="detail-field-row" style={{ flexDirection: 'column', alignItems: 'flex-start', background: '#f8fafc', padding: '6px 8px', borderRadius: '4px' }}>
                      <span className="field-label font-semibold" style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                        Payment Discussion Remarks:
                      </span>
                      <span className="field-value" style={{ fontStyle: 'italic', fontSize: '12.5px', marginTop: '2px' }}>
                        "{booking.payment_discussion_notes}"
                      </span>
                    </div>
                  )}
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
                      Record Manual Customer Payment
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
                <h3 className="detail-card-heading">Booking Status History</h3>
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
                <h3 className="detail-card-heading">Email &amp; Notification Status</h3>
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
                    <span className="field-label">Customer SMS:</span>
                    <span className="field-value">
                      <span className={`badge badge-sm ${booking.sms_status === 'sent' ? 'badge-success' : booking.sms_status === 'failed' ? 'badge-danger' : 'badge-info'}`}>
                        {booking.sms_status ? booking.sms_status.toUpperCase() : 'SIMULATED / ACTIVE'}
                      </span>
                      {booking.sms_sent_at && (
                        <span className="text-muted-sm" style={{ display: 'block', fontSize: '11px', marginTop: '2px' }}>
                          Sent: {new Date(booking.sms_sent_at).toLocaleString()}
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
              Print Voucher
            </button>
            {booking.ticket_number && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleDownloadTicketPdf}
                disabled={isDownloadingPdf}
                style={{ borderColor: '#059669', color: '#047857' }}
              >
                {isDownloadingPdf ? 'Downloading...' : 'Download Ticket PDF'}
              </button>
            )}
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

      {/* Explicit Confirmation Popup Dialog */}
      {showConfirmPopup && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 9999, background: 'rgba(15, 23, 42, 0.75)' }}
          onClick={() => setShowConfirmPopup(false)}
        >
          <div
            className="modal-container modal-medium"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '580px', borderRadius: '16px', overflow: 'hidden' }}
          >
            <div className="modal-header" style={{ background: '#059669', color: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckIcon size={20} color="#ffffff" />
                <h3 className="modal-title" style={{ color: '#ffffff', margin: 0, fontSize: '18px' }}>
                  Confirm Tour Booking &amp; Issue Ticket
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowConfirmPopup(false)}
                style={{ color: '#ffffff' }}
              >
                <XIcon size={16} />
              </button>
            </div>

            <form onSubmit={handleExplicitConfirm}>
              <div className="modal-body" style={{ padding: '24px' }}>
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '12px 16px', marginBottom: '18px' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#065f46', lineHeight: 1.5 }}>
                    Please verify the finalized customer details and payment agreement below. Once confirmed, an <strong>official unique Ticket Number</strong> will be assigned, a <strong>Confirmed Tour Ticket PDF</strong> will be generated, and confirmation emails &amp; SMS will be dispatched to the customer and admin.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', marginBottom: '16px', background: '#f8fafc', padding: '14px', borderRadius: '8px' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>Customer Name</span>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>{booking.customer?.name || `${booking.customer?.first_name || ''} ${booking.customer?.last_name || ''}`}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>Customer Contact</span>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{booking.customer?.phone || booking.phone || 'N/A'}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{booking.customer?.email}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>Tour Package</span>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>{booking.tour?.title || 'Tour'}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>Travel Date &amp; Guests</span>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>{booking.arrival_date || booking.booking_date} ({booking.tickets_count} Pax)</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>Confirmed Tour Price</span>
                    <div style={{ fontWeight: '800', fontSize: '16px', color: '#059669' }}>
                      {currency} {Number(discussionAgreedPrice || agreedPrice).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>Advance Received / Required</span>
                    <div style={{ fontWeight: '700', color: '#0284c7' }}>
                      {currency} {Number(discussionAdvance || advanceAmount).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '11px', color: '#b91c1c' }}>
                      Balance Due: {currency} {Math.max(0, Number(discussionAgreedPrice || agreedPrice) - Number(discussionAdvance || advanceAmount)).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="form-group mb-3">
                  <label className="form-label font-semibold" style={{ fontSize: '12px' }}>
                    Confirmation Notes / Remarks
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="e.g. Terms finalized with customer via telephone. 50% advance confirmed."
                    value={confirmNotes}
                    onChange={(e) => setConfirmNotes(e.target.value)}
                  />
                </div>

                <div className="form-group mb-2">
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '12.5px', color: '#1e293b' }}>
                    <input
                      type="checkbox"
                      checked={confirmAcknowledged}
                      onChange={(e) => setConfirmAcknowledged(e.target.checked)}
                      style={{ marginTop: '3px' }}
                      required
                    />
                    <span>
                      I have communicated with the customer and verified travel dates, pricing, and payment terms. I authorize generating the <strong>Confirmed Ticket</strong> and sending notification emails &amp; SMS.
                    </span>
                  </label>
                </div>
              </div>

              <div className="modal-footer" style={{ background: '#f8fafc', padding: '14px 24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowConfirmPopup(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isConfirming || !confirmAcknowledged}
                  style={{ background: '#059669', borderColor: '#059669', padding: '8px 20px', fontWeight: '700' }}
                >
                  {isConfirming ? 'Confirming & Issuing Ticket...' : 'Confirm Booking & Issue Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
