import useAuth from '../../../hooks/useAuth';

export default function BookingTable({
  bookings = [],
  pagination = {},
  loading = false,
  onPageChange,
  onViewDetails,
  onOpenStatusModal,
  onOpenDeleteModal,
  onPrintBooking,
}) {
  const { hasPermission } = useAuth();
  const canEditStatus = hasPermission('bookings.edit_status');
  const canDelete = hasPermission('bookings.delete');

  const { page = 1, total_pages: totalPages = 1, total = 0 } = pagination;

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

  if (!loading && bookings.length === 0) {
    return (
      <div className="empty-booking-container">
        <span className="empty-booking-icon">📋</span>
        <h3 className="empty-booking-title">No Bookings Found</h3>
        <p className="empty-booking-desc">
          No bookings match the current search or filter criteria. Try adjusting or clearing your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="booking-table-card">
      {/* Desktop Table View */}
      <div className="table-responsive hide-on-mobile">
        <table className="admin-table booking-admin-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer & Contact</th>
              <th>Tour Package</th>
              <th>Travel Date</th>
              <th>Guests</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Created</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="booking-table-row">
                {/* Order Number */}
                <td>
                  <span className="order-number-tag">{b.order_number}</span>
                </td>

                {/* Customer */}
                <td>
                  <div className="customer-meta-cell">
                    <strong className="customer-name-txt">{b.customer?.name || 'Guest Traveler'}</strong>
                    <span className="customer-sub-txt">{b.customer?.email}</span>
                    {b.customer?.phone && (
                      <span className="customer-sub-txt phone-txt">{b.customer.phone}</span>
                    )}
                  </div>
                </td>

                {/* Tour Package */}
                <td>
                  <div className="tour-meta-cell">
                    <strong className="tour-title-txt" title={b.tour?.title}>
                      {b.tour?.title || 'Tour Package'}
                    </strong>
                    <span className="tour-sub-txt">
                      {b.tour?.tour_type || 'Custom Tour'} • {b.tour?.duration_days} Day(s)
                    </span>
                  </div>
                </td>

                {/* Travel Date */}
                <td>
                  <span className="booking-date-txt">
                    {b.booking_date ? new Date(b.booking_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Flexible'}
                  </span>
                </td>

                {/* Tickets / Pax */}
                <td>
                  <span className="tickets-badge">{b.tickets_count} Pax</span>
                </td>

                {/* Amount */}
                <td>
                  <span className="booking-price-amount">
                    {b.currency === 'EUR' ? '€' : b.currency} {Number(b.total_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </td>

                {/* Payment Method */}
                <td>
                  <div className="payment-cell">
                    <span className="payment-method-pill">Pay on Arrival</span>
                    <span className={`payment-status-dot ${getPaymentBadgeClass(b.payment_status)}`}>
                      {b.payment_status || 'pending'}
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td>
                  <span className={`booking-status-badge ${getStatusBadgeClass(b.booking_status)}`}>
                    {b.booking_status}
                  </span>
                </td>

                {/* Created Date */}
                <td>
                  <span className="created-date-txt">
                    {b.created_at ? new Date(b.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '---'}
                  </span>
                </td>

                {/* Actions */}
                <td style={{ textAlign: 'right' }}>
                  <div className="booking-row-actions">
                    <button
                      type="button"
                      className="btn btn-outline btn-xs"
                      onClick={() => onViewDetails(b)}
                      title="View complete booking details"
                    >
                      Details
                    </button>

                    {canEditStatus && (
                      <button
                        type="button"
                        className="btn btn-outline btn-xs btn-status-trigger"
                        onClick={() => onOpenStatusModal(b)}
                        title="Update status"
                      >
                        Status
                      </button>
                    )}

                    <button
                      type="button"
                      className="btn btn-outline btn-xs btn-print-trigger"
                      onClick={() => onPrintBooking(b)}
                      title="Print booking order"
                    >
                      🖨️
                    </button>

                    {canDelete && (
                      <button
                        type="button"
                        className="btn-danger-xs"
                        onClick={() => onOpenDeleteModal(b)}
                        title="Delete booking"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="booking-mobile-cards-list hide-on-desktop">
        {bookings.map((b) => (
          <div key={b.id} className="booking-mobile-card">
            <div className="mobile-card-header">
              <span className="order-number-tag">{b.order_number}</span>
              <span className={`booking-status-badge ${getStatusBadgeClass(b.booking_status)}`}>
                {b.booking_status}
              </span>
            </div>

            <div className="mobile-card-body">
              <div className="mobile-meta-row">
                <span className="mobile-meta-label">Customer:</span>
                <span className="mobile-meta-value"><strong>{b.customer?.name}</strong></span>
              </div>
              <div className="mobile-meta-row">
                <span className="mobile-meta-label">Email:</span>
                <span className="mobile-meta-value">{b.customer?.email}</span>
              </div>
              <div className="mobile-meta-row">
                <span className="mobile-meta-label">Tour:</span>
                <span className="mobile-meta-value">{b.tour?.title}</span>
              </div>
              <div className="mobile-meta-row">
                <span className="mobile-meta-label">Travel Date:</span>
                <span className="mobile-meta-value">{b.booking_date}</span>
              </div>
              <div className="mobile-meta-row">
                <span className="mobile-meta-label">Guests:</span>
                <span className="mobile-meta-value">{b.tickets_count} Pax</span>
              </div>
              <div className="mobile-meta-row">
                <span className="mobile-meta-label">Total Amount:</span>
                <span className="mobile-meta-value booking-price-amount">
                  {b.currency === 'EUR' ? '€' : b.currency} {Number(b.total_price || 0).toLocaleString()}
                </span>
              </div>
              <div className="mobile-meta-row">
                <span className="mobile-meta-label">Payment:</span>
                <span className="mobile-meta-value">Pay on Arrival ({b.payment_status})</span>
              </div>
            </div>

            <div className="mobile-card-actions">
              <button
                type="button"
                className="btn btn-outline btn-xs flex-1"
                onClick={() => onViewDetails(b)}
              >
                View Details
              </button>

              {canEditStatus && (
                <button
                  type="button"
                  className="btn btn-outline btn-xs flex-1"
                  onClick={() => onOpenStatusModal(b)}
                >
                  Change Status
                </button>
              )}

              <button
                type="button"
                className="btn btn-outline btn-xs"
                onClick={() => onPrintBooking(b)}
                title="Print order"
              >
                🖨️
              </button>

              {canDelete && (
                <button
                  type="button"
                  className="btn-danger-xs"
                  onClick={() => onOpenDeleteModal(b)}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="booking-pagination-bar">
          <div className="pagination-info">
            Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} total bookings)
          </div>

          <div className="pagination-controls">
            <button
              type="button"
              className="btn btn-outline btn-xs"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || loading}
            >
              ← Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                return (
                  <span key={p} className="pagination-num-wrapper">
                    {prev && p - prev > 1 && <span className="pagination-ellipsis">...</span>}
                    <button
                      type="button"
                      className={`btn btn-xs ${p === page ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => onPageChange(p)}
                      disabled={loading}
                    >
                      {p}
                    </button>
                  </span>
                );
              })}

            <button
              type="button"
              className="btn btn-outline btn-xs"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages || loading}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
