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
  isSavingNotes = false,
}) {
  const { hasPermission } = useAuth();
  const canEditStatus = hasPermission('bookings.edit_status');

  const [adminNotes, setAdminNotes] = useState(booking?.admin_notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  if (!isOpen || !booking) return null;

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

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container modal-large booking-detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="booking-modal-title-group">
            <h2 className="modal-title">
              Booking Details & Order #{booking.order_number}
            </h2>
            <div className="booking-title-badges">
              <span className={`booking-status-badge ${getStatusBadgeClass(booking.booking_status)}`}>
                {booking.booking_status?.toUpperCase()}
              </span>
              <span className={`payment-status-pill ${getPaymentBadgeClass(booking.payment_status)}`}>
                Payment: {booking.payment_status?.toUpperCase()}
              </span>
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

        {/* Modal Body */}
        <div className="modal-body booking-modal-content">
          <div className="booking-detail-grid">
            {/* Left Column: Customer & Billing Details */}
            <div className="booking-detail-section">
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
                </div>
              </div>

              {/* Billing Address Card */}
              <div className="detail-card">
                <h3 className="detail-card-heading">📍 Billing Address</h3>
                {booking.billing_address ? (
                  <div className="detail-fields-list">
                    <div className="detail-field-row">
                      <span className="field-label">Address:</span>
                      <span className="field-value">
                        {booking.billing_address.address_line1}
                        {booking.billing_address.address_line2 && `, ${booking.billing_address.address_line2}`}
                      </span>
                    </div>
                    <div className="detail-field-row">
                      <span className="field-label">City / State:</span>
                      <span className="field-value">
                        {booking.billing_address.city || '—'}, {booking.billing_address.state || '—'}
                      </span>
                    </div>
                    <div className="detail-field-row">
                      <span className="field-label">Postal Code:</span>
                      <span className="field-value">{booking.billing_address.postal_code || '—'}</span>
                    </div>
                    <div className="detail-field-row">
                      <span className="field-label">Country:</span>
                      <span className="field-value">{booking.billing_address.country || '—'}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-sm">No separate billing address recorded.</p>
                )}
              </div>

              {/* Customer Special Requests / Notes */}
              {booking.customer_notes && (
                <div className="detail-card">
                  <h3 className="detail-card-heading">💬 Customer Special Requests</h3>
                  <p className="booking-customer-notes-txt">{booking.customer_notes}</p>
                </div>
              )}

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

            {/* Right Column: Tour, Pricing, Payment & Timeline */}
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
                      {booking.tour?.destination_name && <span> • Location: {booking.tour.destination_name}</span>}
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

                <div className="detail-fields-list mt-3">
                  <div className="detail-field-row">
                    <span className="field-label">Scheduled Travel Date:</span>
                    <span className="field-value">
                      <strong>
                        {booking.booking_date
                          ? new Date(booking.booking_date).toLocaleDateString(undefined, {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'Flexible / On Demand'}
                      </strong>
                    </span>
                  </div>
                  <div className="detail-field-row">
                    <span className="field-label">Reserved Guests:</span>
                    <span className="field-value font-semibold">{booking.tickets_count} Pax / Traveler(s)</span>
                  </div>
                  {booking.pricing_tier && (
                    <div className="detail-field-row">
                      <span className="field-label">Pricing Tier:</span>
                      <span className="field-value">{booking.pricing_tier.name || booking.pricing_tier}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="detail-card">
                <h3 className="detail-card-heading">💳 Financial & Payment Breakdown</h3>
                <div className="detail-fields-list price-breakdown-list">
                  <div className="detail-field-row">
                    <span className="field-label">Payment Method:</span>
                    <span className="field-value font-bold text-accent">
                      Pay on Arrival
                    </span>
                  </div>
                  <div className="detail-field-row">
                    <span className="field-label">Payment Status:</span>
                    <span className={`payment-status-dot ${getPaymentBadgeClass(booking.payment_status)}`}>
                      {booking.payment_status || 'pending'}
                    </span>
                  </div>
                  <div className="detail-field-row">
                    <span className="field-label">Unit Price per Pax:</span>
                    <span className="field-value">
                      {booking.currency === 'EUR' ? '€' : booking.currency} {Number(booking.unit_price || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="detail-field-row">
                    <span className="field-label">Subtotal ({booking.tickets_count} Pax):</span>
                    <span className="field-value">
                      {booking.currency === 'EUR' ? '€' : booking.currency} {Number(booking.subtotal || 0).toFixed(2)}
                    </span>
                  </div>
                  {Number(booking.discount_amount) > 0 && (
                    <div className="detail-field-row text-success">
                      <span className="field-label">Discount:</span>
                      <span className="field-value">
                        -{booking.currency === 'EUR' ? '€' : booking.currency} {Number(booking.discount_amount).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {Number(booking.tax_amount) > 0 && (
                    <div className="detail-field-row">
                      <span className="field-label">Taxes & Fees:</span>
                      <span className="field-value">
                        +{booking.currency === 'EUR' ? '€' : booking.currency} {Number(booking.tax_amount).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="detail-field-row total-row">
                    <span className="field-label-total">Total Booking Value:</span>
                    <span className="field-value-total">
                      {booking.currency === 'EUR' ? '€' : booking.currency} {Number(booking.total_price || 0).toFixed(2)}
                    </span>
                  </div>
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
                    Created on {booking.created_at ? new Date(booking.created_at).toLocaleString() : 'N/A'}. No additional status updates recorded yet.
                  </p>
                )}
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
              🖨️ Print Order / Voucher
            </button>
          </div>
          <div className="modal-footer-right">
            {canEditStatus && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  onClose();
                  onOpenStatusModal(booking);
                }}
              >
                Change Booking Status
              </button>
            )}
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
