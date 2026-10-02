export default function BookingPrintModal({ booking, isOpen, onClose }) {
  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop print-modal-backdrop" onClick={onClose}>
      <div
        className="modal-container modal-large booking-print-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Controls (Hidden in Print) */}
        <div className="modal-header no-print">
          <h2 className="modal-title">🖨️ Printable Order / Voucher</h2>
          <div className="print-controls-right">
            <button type="button" className="btn btn-primary btn-sm" onClick={handlePrint}>
              Print Now 🖨️
            </button>
            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="modal-body booking-printable-document" id="booking-printable-area">
          {/* Document Header / Company Branding */}
          <div className="print-doc-header">
            <div className="print-brand">
              <h1 className="print-company-name">WANDERER SOUTH INDIA</h1>
              <p className="print-company-sub">Premium South India Tourism & Travel Experiences</p>
              <p className="print-company-contact">info@wanderersouthindia.com • www.wanderersouthindia.com</p>
            </div>
            <div className="print-voucher-meta">
              <div className="print-doc-type">BOOKING CONFIRMATION & VOUCHER</div>
              <div className="print-order-num">Order #: <strong>{booking.order_number}</strong></div>
              <div className="print-date">
                Date: {booking.created_at ? new Date(booking.created_at).toLocaleDateString() : new Date().toLocaleDateString()}
              </div>
              <div className="print-status-tag">
                Status: <strong>{booking.booking_status?.toUpperCase()}</strong>
              </div>
            </div>
          </div>

          <hr className="print-divider" />

          {/* Customer & Billing Info Grid */}
          <div className="print-grid-2col">
            <div className="print-box">
              <h3 className="print-box-title">Traveler / Customer Details</h3>
              <p><strong>Name:</strong> {booking.customer?.name || `${booking.customer?.first_name || ''} ${booking.customer?.last_name || ''}`}</p>
              <p><strong>Email:</strong> {booking.customer?.email || 'N/A'}</p>
              <p><strong>Phone:</strong> {booking.customer?.phone || 'N/A'}</p>
            </div>
            <div className="print-box">
              <h3 className="print-box-title">Billing Address</h3>
              {booking.billing_address ? (
                <>
                  <p>{booking.billing_address.address_line1}</p>
                  {booking.billing_address.address_line2 && <p>{booking.billing_address.address_line2}</p>}
                  <p>{booking.billing_address.city}, {booking.billing_address.state} {booking.billing_address.postal_code}</p>
                  <p>{booking.billing_address.country}</p>
                </>
              ) : (
                <p>Same as Traveler details</p>
              )}
            </div>
          </div>

          {/* Tour Details Table */}
          <div className="print-tour-section">
            <h3 className="print-box-title">Tour Reservation Summary</h3>
            <table className="print-table">
              <thead>
                <tr>
                  <th>Tour Package</th>
                  <th>Travel Date</th>
                  <th>Duration</th>
                  <th>Guests</th>
                  <th>Unit Rate</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>{booking.tour?.title || 'Tour Package'}</strong>
                    {booking.pricing_tier && <div className="print-sub-text">Option: {booking.pricing_tier.name || booking.pricing_tier}</div>}
                  </td>
                  <td>
                    {booking.booking_date
                      ? new Date(booking.booking_date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Flexible'}
                  </td>
                  <td>{booking.tour?.duration_days ? `${booking.tour.duration_days} Day(s)` : 'Standard'}</td>
                  <td>{booking.tickets_count} Pax</td>
                  <td>{booking.currency === 'EUR' ? '€' : booking.currency} {Number(booking.unit_price || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>
                    {booking.currency === 'EUR' ? '€' : booking.currency} {Number(booking.subtotal || 0).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pricing & Payment Summary Grid */}
          <div className="print-grid-2col print-totals-section">
            <div className="print-box print-payment-box">
              <h3 className="print-box-title">Payment Information</h3>
              <p><strong>Method:</strong> Pay on Arrival</p>
              <p><strong>Payment Status:</strong> {booking.payment_status?.toUpperCase() || 'PENDING'}</p>
              <p className="print-note">
                * Note: Payment is collected directly at the destination prior to the commencement of the tour.
              </p>
            </div>
            <div className="print-box print-summary-box">
              <div className="print-calc-row">
                <span>Subtotal:</span>
                <span>{booking.currency === 'EUR' ? '€' : booking.currency} {Number(booking.subtotal || 0).toFixed(2)}</span>
              </div>
              {Number(booking.discount_amount) > 0 && (
                <div className="print-calc-row">
                  <span>Discount:</span>
                  <span>-{booking.currency === 'EUR' ? '€' : booking.currency} {Number(booking.discount_amount).toFixed(2)}</span>
                </div>
              )}
              {Number(booking.tax_amount) > 0 && (
                <div className="print-calc-row">
                  <span>Taxes & Fees:</span>
                  <span>+{booking.currency === 'EUR' ? '€' : booking.currency} {Number(booking.tax_amount).toFixed(2)}</span>
                </div>
              )}
              <hr className="print-calc-divider" />
              <div className="print-calc-row print-total-final">
                <strong>Total Payable:</strong>
                <strong>{booking.currency === 'EUR' ? '€' : booking.currency} {Number(booking.total_price || 0).toFixed(2)}</strong>
              </div>
            </div>
          </div>

          {booking.customer_notes && (
            <div className="print-notes-section">
              <h4 className="print-notes-title">Customer Special Requests:</h4>
              <p className="print-notes-body">{booking.customer_notes}</p>
            </div>
          )}

          {/* Document Footer */}
          <div className="print-doc-footer">
            <p>Thank you for booking with Wanderer South India! Please retain this voucher for tour check-in.</p>
            <p className="print-timestamp">Generated on {new Date().toLocaleString()} by Wanderer South India Management System</p>
          </div>
        </div>

        {/* Modal Footer (Hidden in Print) */}
        <div className="modal-footer no-print">
          <button type="button" className="btn btn-primary" onClick={handlePrint}>
            Print / Save PDF 🖨️
          </button>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
