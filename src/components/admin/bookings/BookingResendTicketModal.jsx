import {
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  MailIcon,
  TicketIcon,
  UserIcon,
  XIcon,
} from '../../common/Icons';
import { useState } from 'react';

export default function BookingResendTicketModal({
  booking,
  isOpen,
  onClose,
  onConfirmResend,
  isSending = false,
}) {
  const [includePdf, setIncludePdf] = useState(true);
  const [adminNote, setAdminNote] = useState('');

  if (!isOpen || !booking) return null;

  const customerName =
    booking.customer?.name ||
    booking.customer_name ||
    (booking.customer?.first_name ? `${booking.customer.first_name} ${booking.customer.last_name || ''}` : '') ||
    'Valued Customer';

  const customerEmail =
    booking.customer?.email ||
    booking.customer_email ||
    booking.email ||
    '';

  const customerPhone =
    booking.customer?.phone ||
    booking.customer_phone ||
    booking.phone ||
    'N/A';

  const orderNumber = booking.order_number || `#${booking.id}`;
  const tourTitle = booking.tour?.title || booking.tour_title || 'Selected Tour Package';
  const travelDate = booking.arrival_date || booking.booking_date || 'N/A';
  const paxCount = booking.tickets_count || booking.travelers_count || 1;
  const currency = booking.currency === 'EUR' ? '€' : (booking.currency || 'INR');
  const totalPrice = Number(booking.agreed_price || booking.total_price || 0).toLocaleString();
  const ticketNumber = booking.ticket_number || (booking.booking_status === 'confirmed' ? `TKT-${orderNumber}` : 'Will be generated');

  const emailStatus = booking.customer_email_status || 'not_sent';
  const sentCount = booking.email_send_count || 0;
  const lastSentAt = booking.customer_email_sent_at
    ? new Date(booking.customer_email_sent_at).toLocaleString()
    : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSending) return;
    onConfirmResend(booking.id, {
      includePdf,
      note: adminNote.trim(),
    });
  };

  return (
    <div
      className="admin-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="resend-ticket-modal-title"
    >
      <div
        className="admin-modal-container modal-medium booking-resend-ticket-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '580px', width: '100%' }}
      >
        {/* Modal Header */}
        <div className="admin-modal-header" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #01aa90 0%, #008772 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <MailIcon size={18} />
            </div>
            <div>
              <span className="modal-eyebrow" style={{ color: '#01aa90', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Customer Ticket Dispatch
              </span>
              <h3
                id="resend-ticket-modal-title"
                className="admin-modal-title"
                style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}
              >
                Resend Ticket Email
              </h3>
            </div>
          </div>

          <button
            type="button"
            className="admin-modal-close"
            onClick={onClose}
            disabled={isSending}
            aria-label="Close dialog"
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* Modal Form & Scrollable Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="admin-modal-body" style={{ padding: '22px 24px', flex: '1 1 auto', overflowY: 'auto' }}>
            {/* Target Recipient Banner */}
            <div
              style={{
                background: '#f0fdf4',
                border: '1.5px solid #86efac',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <div style={{ color: '#16a34a', marginTop: '2px', flexShrink: 0 }}>
                <CheckCircleIcon size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', color: '#166534', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Recipient Customer Email
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', wordBreak: 'break-all', marginTop: '2px' }}>
                  {customerEmail || <span style={{ color: '#dc2626' }}>No customer email provided</span>}
                </div>
                <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '4px' }}>
                  Guest: <strong>{customerName}</strong> • Phone: {customerPhone}
                </div>
              </div>
            </div>

            {/* Booking & Ticket Details Card */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '18px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TicketIcon size={14} color="#01aa90" />
                <span>Ticket &amp; Booking Information</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', display: 'block' }}>Order Reference</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{orderNumber}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', display: 'block' }}>Ticket Number</span>
                  <span style={{ fontWeight: 700, color: '#01aa90', background: '#e6f7f5', padding: '1px 6px', borderRadius: '4px' }}>
                    {ticketNumber}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', display: 'block' }}>Tour Package</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{tourTitle}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', display: 'block' }}>Travel Date &amp; Guests</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{travelDate} ({paxCount} Pax)</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', display: 'block' }}>Total Price</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{currency} {totalPrice}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', display: 'block' }}>Booking Status</span>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'capitalize',
                      color: booking.booking_status === 'confirmed' ? '#047857' : '#b45309',
                      background: booking.booking_status === 'confirmed' ? '#d1fae5' : '#fef3c7',
                      padding: '1px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {booking.booking_status || 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Email Dispatch History */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '18px',
                fontSize: '12.5px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Delivery Status:</span>
                <span
                  style={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    color: emailStatus === 'sent' ? '#059669' : emailStatus === 'failed' ? '#dc2626' : '#d97706',
                  }}
                >
                  {emailStatus === 'sent' ? '✓ Previously Delivered' : emailStatus === 'failed' ? '⚠ Previous Attempt Failed' : '● Not Yet Sent'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Total Times Dispatched:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{sentCount} time{sentCount !== 1 ? 's' : ''}</span>
              </div>
              {lastSentAt && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Last Dispatched:</span>
                  <span style={{ color: '#334155', fontWeight: 500 }}>{lastSentAt}</span>
                </div>
              )}
              {booking.last_email_error && (
                <div style={{ color: '#b91c1c', fontSize: '11.5px', marginTop: '4px', background: '#fef2f2', padding: '6px 10px', borderRadius: '6px' }}>
                  Last Error: {booking.last_email_error}
                </div>
              )}
            </div>

            {/* Attach PDF Checkbox Option */}
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: '#1e293b',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={includePdf}
                  onChange={(e) => setIncludePdf(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#01aa90' }}
                />
                <span style={{ fontWeight: 600 }}>
                  Attach Official Tour Ticket PDF Receipt
                </span>
              </label>
              <p style={{ margin: '4px 0 0 26px', fontSize: '11.5px', color: '#64748b' }}>
                Generates a fresh PDF voucher with QR verification code and attaches it to the email.
              </p>
            </div>

            {/* Optional Note / Custom Remarks */}
            <div className="form-group mb-0">
              <label className="form-label" htmlFor="resend-notes" style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                Internal Audit Note (Optional)
              </label>
              <input
                id="resend-notes"
                type="text"
                className="form-control form-control-sm"
                placeholder="e.g. Customer requested copy via WhatsApp / Resending after updated dates"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                style={{ fontSize: '12.5px' }}
              />
            </div>
          </div>

          {/* Modal Footer - Fixed, Sticky, Always Fully Visible! */}
          <div
            className="admin-modal-footer"
            style={{
              padding: '16px 24px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              background: '#f8fafc',
              flexShrink: 0,
              position: 'sticky',
              bottom: 0,
              zIndex: 10,
            }}
          >
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={isSending}
              style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 600 }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSending || !customerEmail}
              style={{
                background: '#059669',
                borderColor: '#059669',
                color: '#ffffff',
                padding: '8px 22px',
                fontSize: '13px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)',
              }}
            >
              <MailIcon size={16} />
              {isSending ? 'Sending Ticket Email...' : 'Resend Ticket Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
