import { 
  CheckCircleIcon, CheckIcon, DownloadIcon, EditIcon, EyeIcon, 
  FileTextIcon, MailIcon, PrintIcon, TrashIcon, XCircleIcon, XIcon 
} from '../../common/Icons';
import useAuth from '../../../hooks/useAuth';

export default function BookingTable({
  bookings = [],
  pagination = {},
  loading = false,
  sortBy = 'created_at',
  order = 'DESC',
  onSortChange,
  onPageChange,
  onViewDetails,
  onEditBooking,
  onConfirmBooking,
  onCancelBooking,
  onOpenStatusModal,
  onOpenDeleteModal,
  onPrintBooking,
  onResendEmail,
  onDownloadTicket,
}) {
  const { hasPermission } = useAuth();
  const canEditStatus = hasPermission('bookings.edit_status');
  const canDelete = hasPermission('bookings.delete');

  const { page = 1, total_pages: totalPages = 1, total = 0, limit = 15 } = pagination;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return {
          bg: '#dcfce7',
          color: '#15803d',
          border: '#bbf7d0',
          label: 'Confirmed',
          icon: '✓',
        };
      case 'completed':
        return {
          bg: '#e0f2fe',
          color: '#0369a1',
          border: '#bae6fd',
          label: 'Completed',
          icon: '★',
        };
      case 'contacted':
        return {
          bg: '#e0e7ff',
          color: '#3730a3',
          border: '#c7d2fe',
          label: 'Contacted',
          icon: '📞',
        };
      case 'payment_discussion':
        return {
          bg: '#f3e8ff',
          color: '#6b21a8',
          border: '#e9d5ff',
          label: 'Payment Discussion',
          icon: '💬',
        };
      case 'awaiting_confirmation':
        return {
          bg: '#fef3c7',
          color: '#b45309',
          border: '#fde68a',
          label: 'Awaiting Confirm',
          icon: '⏳',
        };
      case 'cancelled':
        return {
          bg: '#fee2e2',
          color: '#b91c1c',
          border: '#fecaca',
          label: 'Cancelled',
          icon: '✕',
        };
      case 'rejected':
        return {
          bg: '#f1f5f9',
          color: '#64748b',
          border: '#cbd5e1',
          label: 'Rejected',
          icon: '✕',
        };
      case 'pending':
      default:
        return {
          bg: '#fffbeb',
          color: '#d97706',
          border: '#fef3c7',
          label: 'Pending',
          icon: '⏳',
        };
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case 'paid':
        return { bg: '#dcfce7', color: '#166534', label: 'Paid' };
      case 'refunded':
        return { bg: '#fee2e2', color: '#991b1b', label: 'Refunded' };
      case 'failed':
        return { bg: '#fee2e2', color: '#dc2626', label: 'Failed' };
      case 'pending':
      default:
        return { bg: '#fef3c7', color: '#92400e', label: 'Pending' };
    }
  };

  const handleHeaderSort = (colKey) => {
    if (!onSortChange) return;
    if (sortBy === colKey) {
      onSortChange(colKey, order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      onSortChange(colKey, 'DESC');
    }
  };

  const renderSortIndicator = (colKey) => {
    if (sortBy !== colKey) return <span style={{ opacity: 0.3, marginLeft: '4px' }}>↕</span>;
    return <span style={{ color: '#01aa90', marginLeft: '4px', fontWeight: 'bold' }}>{order === 'ASC' ? '↑' : '↓'}</span>;
  };

  if (!loading && bookings.length === 0) {
    return (
      <div className="empty-booking-container" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '48px 24px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#94a3b8' }}>
          <FileTextIcon size={32} />
        </div>
        <h3 className="empty-booking-title" style={{ fontSize: '18px', fontWeight: '800', color: '#0B1329', margin: '0 0 8px' }}>
          No Bookings Found
        </h3>
        <p className="empty-booking-desc" style={{ fontSize: '14px', color: '#64748b', maxWidth: '440px', margin: '0 auto' }}>
          No booking records match your search or filter settings. Try adjusting the query, clearing selected filters, or checking back later.
        </p>
      </div>
    );
  }

  return (
    <div className="booking-table-card" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
      {/* Desktop Table View */}
      <div className="table-responsive hide-on-mobile" style={{ overflowX: 'auto' }}>
        <table className="admin-table booking-admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th onClick={() => handleHeaderSort('order_number')} style={{ cursor: 'pointer', padding: '14px 16px', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                Order / Ticket # {renderSortIndicator('order_number')}
              </th>
              <th onClick={() => handleHeaderSort('customer_name')} style={{ cursor: 'pointer', padding: '14px 16px', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                Customer & Contact {renderSortIndicator('customer_name')}
              </th>
              <th onClick={() => handleHeaderSort('tour_title')} style={{ cursor: 'pointer', padding: '14px 16px', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                Tour Package {renderSortIndicator('tour_title')}
              </th>
              <th onClick={() => handleHeaderSort('booking_date')} style={{ cursor: 'pointer', padding: '14px 16px', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                Travel Date {renderSortIndicator('booking_date')}
              </th>
              <th style={{ padding: '14px 16px', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                Guests
              </th>
              <th onClick={() => handleHeaderSort('total_price')} style={{ cursor: 'pointer', padding: '14px 16px', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                Amount {renderSortIndicator('total_price')}
              </th>
              <th onClick={() => handleHeaderSort('payment_status')} style={{ cursor: 'pointer', padding: '14px 16px', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                Payment {renderSortIndicator('payment_status')}
              </th>
              <th onClick={() => handleHeaderSort('booking_status')} style={{ cursor: 'pointer', padding: '14px 16px', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                Status {renderSortIndicator('booking_status')}
              </th>
              <th onClick={() => handleHeaderSort('created_at')} style={{ cursor: 'pointer', padding: '14px 16px', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                Created {renderSortIndicator('created_at')}
              </th>
              <th style={{ padding: '14px 16px', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right', whiteSpace: 'nowrap' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const statusBadge = getStatusBadge(b.booking_status);
              const payBadge = getPaymentBadge(b.payment_status);
              const currency = b.currency === 'EUR' ? '€' : (b.currency || 'INR');
              const finalAmount = Number(b.agreed_price !== undefined && b.agreed_price !== null ? b.agreed_price : (b.total_price || 0));

              return (
                <tr
                  key={b.id}
                  className="booking-table-row"
                  style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s ease' }}
                >
                  {/* Order & Ticket Number */}
                  <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <span
                        className="order-number-tag"
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: '700',
                          color: '#0f766e',
                          background: '#f0fdfa',
                          border: '1px solid #ccfbf1',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          display: 'inline-block',
                          width: 'fit-content',
                        }}
                      >
                        {b.order_number}
                      </span>
                      {b.ticket_number ? (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            color: '#15803d',
                            background: '#dcfce7',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            border: '1px solid #bbf7d0',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            width: 'fit-content',
                          }}
                        >
                          ✓ {b.ticket_number}
                        </span>
                      ) : (
                        <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>ID: #{b.id}</span>
                      )}
                    </div>
                  </td>

                  {/* Customer Information */}
                  <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                    <div className="customer-meta-cell" style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '150px' }}>
                      <strong className="customer-name-txt" style={{ color: '#0B1329', fontSize: '13.5px' }}>
                        {b.customer?.name || 'Guest Traveler'}
                      </strong>
                      <span className="customer-sub-txt" style={{ color: '#64748b', fontSize: '12px' }}>
                        {b.customer?.email}
                      </span>
                      {b.customer?.phone && (
                        <span className="customer-sub-txt phone-txt" style={{ color: '#475569', fontSize: '11px', fontWeight: '500' }}>
                          📞 {b.customer.phone}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Tour Package */}
                  <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                    <div className="tour-meta-cell" style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '160px' }}>
                      <strong className="tour-title-txt" style={{ color: '#0f172a', fontSize: '13px', lineHeight: 1.3 }} title={b.tour?.title}>
                        {b.tour?.title || b.destination_name || 'Tour Package'}
                      </strong>
                      <span className="tour-sub-txt" style={{ color: '#64748b', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                        {(b.is_medical_booking || b.medical_trip_id || b.tour?.tour_type === 'Medical Tourism') ? (
                          <span style={{ background: '#ccfbf1', color: '#0f766e', borderRadius: '4px', padding: '1px 5px', fontSize: '10px', fontWeight: '700' }}>
                            🏥 Medical Tourism
                          </span>
                        ) : (
                          b.tour?.tour_type || 'Tour'
                        )} {b.tour?.duration_days ? `• ${b.tour.duration_days} Days` : ''}
                      </span>
                    </div>
                  </td>

                  {/* Travel Date */}
                  <td style={{ padding: '14px 16px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                    <span className="booking-date-txt" style={{ color: '#334155', fontWeight: '600', fontSize: '12.5px' }}>
                      {b.booking_date || b.arrival_date || 'Flexible'}
                    </span>
                  </td>

                  {/* Guests */}
                  <td style={{ padding: '14px 16px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                    <span className="tickets-badge" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '3px 8px', fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                      {b.tickets_count || 1} Pax
                    </span>
                  </td>

                  {/* Amount & Agreed Price */}
                  <td style={{ padding: '14px 16px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span className="booking-price-amount" style={{ fontWeight: '800', color: '#01aa90', fontSize: '14px' }}>
                        {currency} {finalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      {Number(b.advance_amount || 0) > 0 && (
                        <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600' }}>
                          Adv: {currency} {Number(b.advance_amount).toFixed(0)}
                        </span>
                      )}
                      {Number(b.balance_amount || 0) > 0 && (
                        <span style={{ fontSize: '10.5px', color: '#dc2626' }}>
                          Bal: {currency} {Number(b.balance_amount).toFixed(0)}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Payment */}
                  <td style={{ padding: '14px 16px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: '#64748b' }}>
                        {b.payment_method?.replace(/_/g, ' ') || 'Pay on Arrival'}
                      </span>
                      <span
                        style={{
                          background: payBadge.bg,
                          color: payBadge.color,
                          borderRadius: '12px',
                          padding: '1px 8px',
                          fontSize: '11px',
                          fontWeight: '700',
                          display: 'inline-block',
                          width: 'fit-content',
                        }}
                      >
                        {payBadge.label}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '14px 16px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                    <span
                      style={{
                        background: statusBadge.bg,
                        color: statusBadge.color,
                        border: `1px solid ${statusBadge.border}`,
                        borderRadius: '20px',
                        padding: '3px 10px',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>{statusBadge.icon}</span> {statusBadge.label}
                    </span>
                  </td>

                  {/* Created Date */}
                  <td style={{ padding: '14px 16px', verticalAlign: 'middle', color: '#64748b', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {b.created_at ? new Date(b.created_at).toLocaleDateString() : '---'}
                  </td>

                  {/* Actions (Requirement 7) */}
                  <td style={{ padding: '14px 16px', verticalAlign: 'middle', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div className="booking-row-actions" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      {/* View Action */}
                      <button
                        type="button"
                        className="btn btn-outline btn-xs"
                        onClick={() => onViewDetails(b)}
                        title="View complete booking details"
                        aria-label="View booking details"
                        style={{ padding: '4px 8px', borderRadius: '6px' }}
                      >
                        <EyeIcon size={13} />
                      </button>

                      {/* Edit Action */}
                      {canEditStatus && onEditBooking && (
                        <button
                          type="button"
                          className="btn btn-outline btn-xs"
                          onClick={() => onEditBooking(b)}
                          title="Edit booking details, pricing & guests"
                          aria-label="Edit booking"
                          style={{ padding: '4px 8px', borderRadius: '6px', color: '#2563eb', borderColor: '#bfdbfe' }}
                        >
                          <EditIcon size={13} />
                        </button>
                      )}

                      {/* Quick Confirm Action */}
                      {canEditStatus && onConfirmBooking && ['pending', 'contacted', 'payment_discussion', 'awaiting_confirmation'].includes(b.booking_status) && (
                        <button
                          type="button"
                          className="btn btn-xs"
                          onClick={() => onConfirmBooking(b)}
                          title="Confirm booking and issue ticket"
                          aria-label="Confirm booking"
                          style={{ padding: '4px 8px', borderRadius: '6px', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }}
                        >
                          <CheckCircleIcon size={13} />
                        </button>
                      )}

                      {/* Quick Cancel Action */}
                      {canEditStatus && onCancelBooking && !['cancelled', 'rejected'].includes(b.booking_status) && (
                        <button
                          type="button"
                          className="btn btn-xs"
                          onClick={() => onCancelBooking(b)}
                          title="Cancel booking"
                          aria-label="Cancel booking"
                          style={{ padding: '4px 8px', borderRadius: '6px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}
                        >
                          <XCircleIcon size={13} />
                        </button>
                      )}

                      {/* Resend Email Action */}
                      {onResendEmail && (
                        <button
                          type="button"
                          className="btn btn-outline btn-xs"
                          onClick={() => onResendEmail(b)}
                          title="Resend email confirmation / ticket to customer"
                          aria-label="Resend email"
                          style={{ padding: '4px 8px', borderRadius: '6px' }}
                        >
                          <MailIcon size={13} />
                        </button>
                      )}

                      {/* Print Ticket / Voucher Action */}
                      <button
                        type="button"
                        className="btn btn-outline btn-xs"
                        onClick={() => onPrintBooking(b)}
                        title="Print booking order & voucher"
                        aria-label="Print booking"
                        style={{ padding: '4px 8px', borderRadius: '6px' }}
                      >
                        <PrintIcon size={13} />
                      </button>

                      {/* Delete Action */}
                      {canDelete && (
                        <button
                          type="button"
                          className="btn-danger-xs"
                          onClick={() => onOpenDeleteModal(b)}
                          title="Delete booking record"
                          aria-label="Delete booking"
                          style={{ padding: '4px 8px', borderRadius: '6px' }}
                        >
                          <TrashIcon size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="booking-mobile-cards-list hide-on-desktop" style={{ display: 'none', padding: '16px', gap: '14px' }}>
        {bookings.map((b) => {
          const statusBadge = getStatusBadge(b.booking_status);
          const payBadge = getPaymentBadge(b.payment_status);
          const currency = b.currency === 'EUR' ? '€' : (b.currency || 'INR');
          const finalAmount = Number(b.agreed_price !== undefined && b.agreed_price !== null ? b.agreed_price : (b.total_price || 0));

          return (
            <div
              key={b.id}
              className="booking-mobile-card"
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="order-number-tag" style={{ fontFamily: 'monospace', fontWeight: '700', color: '#0f766e', background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '2px 8px', borderRadius: '6px' }}>
                  {b.order_number}
                </span>
                <span style={{ background: statusBadge.bg, color: statusBadge.color, border: `1px solid ${statusBadge.border}`, borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: '700' }}>
                  {statusBadge.label}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', marginBottom: '14px' }}>
                <div><strong>Customer:</strong> {b.customer?.name} ({b.customer?.email})</div>
                <div><strong>Tour:</strong> {b.tour?.title || b.destination_name}</div>
                <div><strong>Travel Date:</strong> {b.booking_date} ({b.tickets_count || 1} Pax)</div>
                <div><strong>Amount:</strong> <strong style={{ color: '#01aa90' }}>{currency} {finalAmount.toLocaleString()}</strong></div>
                <div><strong>Payment:</strong> {b.payment_method} ({payBadge.label})</div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-outline btn-xs flex-1" onClick={() => onViewDetails(b)}>
                  View
                </button>
                {canEditStatus && onEditBooking && (
                  <button type="button" className="btn btn-outline btn-xs flex-1" onClick={() => onEditBooking(b)}>
                    Edit
                  </button>
                )}
                {canEditStatus && onConfirmBooking && ['pending', 'contacted', 'payment_discussion'].includes(b.booking_status) && (
                  <button type="button" className="btn btn-xs flex-1" onClick={() => onConfirmBooking(b)} style={{ background: '#dcfce7', color: '#15803d' }}>
                    Confirm
                  </button>
                )}
                {canEditStatus && onCancelBooking && !['cancelled', 'rejected'].includes(b.booking_status) && (
                  <button type="button" className="btn btn-xs flex-1" onClick={() => onCancelBooking(b)} style={{ background: '#fee2e2', color: '#dc2626' }}>
                    Cancel
                  </button>
                )}
                <button type="button" className="btn btn-outline btn-xs" onClick={() => onPrintBooking(b)}>
                  <PrintIcon size={12} />
                </button>
                {canDelete && (
                  <button type="button" className="btn-danger-xs" onClick={() => onOpenDeleteModal(b)}>
                    <TrashIcon size={12} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Footer */}
      <div
        className="booking-pagination-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '16px 20px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
        }}
      >
        <div className="pagination-info" style={{ fontSize: '13px', color: '#64748b' }}>
          Showing <strong>{bookings.length}</strong> of <strong>{total}</strong> bookings (Page <strong>{page}</strong> of <strong>{totalPages}</strong>)
        </div>

        {totalPages > 1 && (
          <div className="pagination-controls" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              className="btn btn-outline btn-xs"
              onClick={() => onPageChange(1)}
              disabled={page <= 1 || loading}
              title="First Page"
            >
              «
            </button>
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
                  <span key={p} style={{ display: 'inline-flex', alignItems: 'center' }}>
                    {prev && p - prev > 1 && <span style={{ padding: '0 4px', color: '#94a3b8' }}>...</span>}
                    <button
                      type="button"
                      className={`btn btn-xs ${p === page ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => onPageChange(p)}
                      disabled={loading}
                      style={{ minWidth: '28px' }}
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
            <button
              type="button"
              className="btn btn-outline btn-xs"
              onClick={() => onPageChange(totalPages)}
              disabled={page >= totalPages || loading}
              title="Last Page"
            >
              »
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
