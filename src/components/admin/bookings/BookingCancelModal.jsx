import { AlertTriangleIcon, XCircleIcon, XIcon } from '../../common/Icons';
import { useState } from 'react';

export default function BookingCancelModal({
  booking,
  isOpen,
  onClose,
  onConfirmCancel,
  isCancelling = false,
}) {
  const [cancelNotes, setCancelNotes] = useState('Customer requested cancellation');

  if (!isOpen || !booking) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmCancel(booking.id, cancelNotes.trim() || 'Booking cancelled by administrator');
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="admin-modal-container modal-small booking-cancel-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px' }}
      >
        <div className="admin-modal-header">
          <h3 className="admin-modal-title text-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <XCircleIcon size={20} color="#dc2626" /> Cancel Booking #{booking.order_number}
          </h3>
          <button
            type="button"
            className="admin-modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <XIcon size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body" style={{ padding: '20px' }}>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '16px' }}>
              Are you sure you want to cancel this booking? This will update the status to <strong>Cancelled</strong>, release any reserved seats, and notify the customer if applicable.
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px', fontSize: '13px', lineHeight: '1.6' }}>
              <div><strong>Customer:</strong> {booking.customer?.name} ({booking.customer?.email})</div>
              <div><strong>Tour:</strong> {booking.tour?.title}</div>
              <div><strong>Date:</strong> {booking.booking_date}</div>
              <div><strong>Amount:</strong> {booking.currency === 'EUR' ? '€' : (booking.currency || 'INR')} {Number(booking.agreed_price || booking.total_price || 0).toLocaleString()}</div>
            </div>

            <div className="form-group">
              <label className="form-label text-sm" htmlFor="cancel-notes">
                Reason for Cancellation
              </label>
              <textarea
                id="cancel-notes"
                className="form-textarea form-textarea-sm"
                rows="3"
                placeholder="E.g. Customer requested date change / Personal reasons / Weather conditions"
                value={cancelNotes}
                onChange={(e) => setCancelNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={onClose}
              disabled={isCancelling}
            >
              Keep Booking
            </button>
            <button
              type="submit"
              className="btn btn-danger btn-sm"
              disabled={isCancelling}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <XCircleIcon size={15} /> {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
