import { useState } from 'react';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', description: 'Initial booking awaiting review or confirmation' },
  { value: 'confirmed', label: 'Confirmed', description: 'Tour reservation is approved and confirmed' },
  { value: 'completed', label: 'Completed', description: 'Tour successfully executed and finished' },
  { value: 'cancelled', label: 'Cancelled', description: 'Booking cancelled by customer or operator' },
  { value: 'rejected', label: 'Rejected', description: 'Booking declined due to capacity or policy' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending (Due on Arrival)' },
  { value: 'paid', label: 'Paid (Settled)' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

export default function BookingStatusModal({
  booking,
  isOpen,
  onClose,
  onSubmitStatus,
  isSubmitting = false,
}) {
  const [newStatus, setNewStatus] = useState(booking?.booking_status || 'pending');
  const [paymentStatus, setPaymentStatus] = useState(booking?.payment_status || 'pending');
  const [notes, setNotes] = useState('');

  if (!isOpen || !booking) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitStatus({
      bookingId: booking.id,
      booking_status: newStatus,
      payment_status: paymentStatus,
      notes: notes.trim(),
    });
  };

  const handleQuickAction = (statusVal, payStatusVal = null) => {
    setNewStatus(statusVal);
    if (payStatusVal) {
      setPaymentStatus(payStatusVal);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container modal-medium booking-status-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">
            Update Status — Order #{booking.order_number}
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Quick action shortcuts */}
            <div className="status-quick-actions">
              <span className="quick-actions-label">Quick Actions:</span>
              <div className="quick-buttons-row">
                <button
                  type="button"
                  className={`btn btn-xs ${newStatus === 'confirmed' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => handleQuickAction('confirmed')}
                >
                  ✓ Confirm
                </button>
                <button
                  type="button"
                  className={`btn btn-xs ${newStatus === 'completed' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => handleQuickAction('completed', 'paid')}
                >
                  ★ Complete & Settle
                </button>
                <button
                  type="button"
                  className={`btn btn-xs ${newStatus === 'cancelled' ? 'btn-danger' : 'btn-outline'}`}
                  onClick={() => handleQuickAction('cancelled')}
                >
                  ✕ Cancel
                </button>
              </div>
            </div>

            {/* Booking Status Select */}
            <div className="form-group mt-3">
              <label htmlFor="booking_status_select" className="form-label font-semibold">
                Booking Lifecycle Status <span className="text-danger">*</span>
              </label>
              <select
                id="booking_status_select"
                className="form-control form-select"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                required
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} — {opt.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Status Select */}
            <div className="form-group mt-3">
              <label htmlFor="payment_status_select" className="form-label font-semibold">
                Payment Status (Pay on Arrival)
              </label>
              <select
                id="payment_status_select"
                className="form-control form-select"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
              >
                {PAYMENT_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reason / Notes */}
            <div className="form-group mt-3">
              <label htmlFor="status_notes_input" className="form-label font-semibold">
                Audit Notes / Reason for Status Change
              </label>
              <textarea
                id="status_notes_input"
                className="form-control"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Confirmed with customer over phone; Received cash payment at tour start..."
              />
              <span className="form-helper-text">
                This note will be recorded in the permanent booking audit history.
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating Status...' : 'Apply Status Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
