export default function BookingDeleteModal({
  booking,
  isOpen,
  onClose,
  onConfirmDelete,
  isDeleting = false,
}) {
  if (!isOpen || !booking) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container modal-small booking-delete-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title text-danger">⚠️ Delete Booking Record</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p className="delete-warning-text">
            Are you sure you want to remove booking order <strong>#{booking.order_number}</strong>?
          </p>
          <div className="delete-booking-summary">
            <div><strong>Customer:</strong> {booking.customer?.name} ({booking.customer?.email})</div>
            <div><strong>Tour:</strong> {booking.tour?.title}</div>
            <div><strong>Amount:</strong> {booking.currency === 'EUR' ? '€' : booking.currency} {Number(booking.total_price || 0).toFixed(2)}</div>
            <div><strong>Status:</strong> {booking.booking_status}</div>
          </div>
          <p className="delete-soft-note text-muted-sm mt-3">
            Note: This performs a safe soft-delete. The booking data and transaction history are archived in the database and can be restored if necessary.
          </p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => onConfirmDelete(booking.id)}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
