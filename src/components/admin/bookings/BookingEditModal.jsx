import { AlertTriangleIcon, CheckIcon, EditIcon, XIcon } from '../../common/Icons';
import { useState, useEffect } from 'react';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'payment_discussion', label: 'Payment Discussion' },
  { value: 'awaiting_confirmation', label: 'Awaiting Confirmation' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rejected', label: 'Rejected' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: 'pay_on_arrival', label: 'Pay on Arrival' },
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI (GPay / PhonePe / Paytm)' },
  { value: 'bank_transfer', label: 'Bank Transfer / NEFT' },
  { value: 'direct', label: 'Direct Payment' },
];

export default function BookingEditModal({
  booking,
  isOpen,
  onClose,
  onSave,
  isSaving = false,
}) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    country: 'India',
    pickup_location: '',
    booking_date: '',
    adults_count: 1,
    children_count: 0,
    total_price: 0,
    agreed_price: 0,
    advance_amount: 0,
    payment_method: 'pay_on_arrival',
    payment_status: 'pending',
    booking_status: 'pending',
    special_requests: '',
    admin_notes: '',
  });

  useEffect(() => {
    if (booking) {
      const cust = booking.customer || {};
      const fName = cust.first_name || booking.first_name || (cust.name ? cust.name.split(' ')[0] : '');
      const lName = cust.last_name || booking.last_name || (cust.name ? cust.name.split(' ').slice(1).join(' ') : '');

      setFormData({
        first_name: fName,
        last_name: lName,
        email: cust.email || booking.email || '',
        phone: cust.phone || booking.phone || '',
        country: cust.country || booking.country || 'India',
        pickup_location: booking.pickup_location || '',
        booking_date: booking.booking_date || booking.arrival_date || '',
        adults_count: Number(booking.adults_count || 1),
        children_count: Number(booking.children_count || 0),
        total_price: Number(booking.total_price || 0),
        agreed_price: Number(booking.agreed_price !== undefined && booking.agreed_price !== null ? booking.agreed_price : (booking.total_price || 0)),
        advance_amount: Number(booking.advance_amount || 0),
        payment_method: booking.payment_method || 'pay_on_arrival',
        payment_status: booking.payment_status || 'pending',
        booking_status: booking.booking_status || 'pending',
        special_requests: booking.special_requests || booking.customer_notes || '',
        admin_notes: booking.admin_notes || '',
      });
    }
  }, [booking]);

  if (!isOpen || !booking) return null;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const computedBalance = Math.max(0, (Number(formData.agreed_price) || Number(formData.total_price) || 0) - (Number(formData.advance_amount) || 0));

  const handleSubmit = (e) => {
    e.preventDefault();
    const ticketsCount = Math.max(1, (Number(formData.adults_count) || 1) + (Number(formData.children_count) || 0));

    const payload = {
      ...formData,
      tickets_count: ticketsCount,
      balance_amount: computedBalance,
      customer: {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
      },
    };

    onSave(booking.id, payload);
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="admin-modal-container modal-large booking-edit-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '850px' }}
      >
        <div className="admin-modal-header">
          <div className="modal-header-info">
            <h3 className="admin-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <EditIcon size={20} color="#01aa90" /> Edit Booking #{booking.order_number}
            </h3>
            <span className="modal-eyebrow" style={{ color: '#64748b', fontSize: '13px' }}>
              Tour: <strong>{booking.tour?.title || 'Tour Package'}</strong>
            </span>
          </div>
          <button
            type="button"
            className="admin-modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <XIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
            
            {/* Section 1: Customer Details */}
            <div className="edit-modal-section">
              <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0B1329', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                👤 Customer Information
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div>
                  <label className="form-label text-sm" htmlFor="edit-first-name">First Name *</label>
                  <input
                    id="edit-first-name"
                    name="first_name"
                    type="text"
                    required
                    className="form-input form-input-sm"
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label text-sm" htmlFor="edit-last-name">Last Name *</label>
                  <input
                    id="edit-last-name"
                    name="last_name"
                    type="text"
                    required
                    className="form-input form-input-sm"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label text-sm" htmlFor="edit-email">Email Address *</label>
                  <input
                    id="edit-email"
                    name="email"
                    type="email"
                    required
                    className="form-input form-input-sm"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label text-sm" htmlFor="edit-phone">Phone / WhatsApp *</label>
                  <input
                    id="edit-phone"
                    name="phone"
                    type="text"
                    required
                    className="form-input form-input-sm"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label text-sm" htmlFor="edit-country">Country / Nationality</label>
                  <input
                    id="edit-country"
                    name="country"
                    type="text"
                    className="form-input form-input-sm"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label text-sm" htmlFor="edit-pickup">Pickup Location</label>
                  <input
                    id="edit-pickup"
                    name="pickup_location"
                    type="text"
                    placeholder="Hotel / Airport / Station"
                    className="form-input form-input-sm"
                    value={formData.pickup_location}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Tour & Date Details */}
            <div className="edit-modal-section">
              <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0B1329', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                📅 Schedule & Guests
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div>
                  <label className="form-label text-sm" htmlFor="edit-booking-date">Travel / Arrival Date *</label>
                  <input
                    id="edit-booking-date"
                    name="booking_date"
                    type="date"
                    required
                    className="form-input form-input-sm"
                    value={formData.booking_date}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label text-sm" htmlFor="edit-adults">Adult Guests (12+ yrs)</label>
                  <input
                    id="edit-adults"
                    name="adults_count"
                    type="number"
                    min="1"
                    className="form-input form-input-sm"
                    value={formData.adults_count}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label text-sm" htmlFor="edit-children">Children (Age 3-11)</label>
                  <input
                    id="edit-children"
                    name="children_count"
                    type="number"
                    min="0"
                    className="form-input form-input-sm"
                    value={formData.children_count}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Pricing & Payments */}
            <div className="edit-modal-section">
              <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0B1329', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                💳 Pricing, Advance & Payment
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div>
                  <label className="form-label text-sm" htmlFor="edit-total-price">Catalog / Total Price ({booking.currency || 'INR'})</label>
                  <input
                    id="edit-total-price"
                    name="total_price"
                    type="number"
                    step="0.01"
                    className="form-input form-input-sm"
                    value={formData.total_price}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label text-sm" htmlFor="edit-agreed-price">Agreed Negotiated Rate</label>
                  <input
                    id="edit-agreed-price"
                    name="agreed_price"
                    type="number"
                    step="0.01"
                    className="form-input form-input-sm"
                    value={formData.agreed_price}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label text-sm" htmlFor="edit-advance">Advance Paid</label>
                  <input
                    id="edit-advance"
                    name="advance_amount"
                    type="number"
                    step="0.01"
                    className="form-input form-input-sm"
                    value={formData.advance_amount}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label text-sm">Remaining Balance</label>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: '700', color: computedBalance > 0 ? '#b91c1c' : '#15803d', fontSize: '14px' }}>
                    {booking.currency || 'INR'} {computedBalance.toFixed(2)}
                  </div>
                </div>
                <div>
                  <label className="form-label text-sm" htmlFor="edit-pay-method">Payment Method</label>
                  <select
                    id="edit-pay-method"
                    name="payment_method"
                    className="form-select form-select-sm"
                    value={formData.payment_method}
                    onChange={handleChange}
                  >
                    {PAYMENT_METHOD_OPTIONS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label text-sm" htmlFor="edit-pay-status">Payment Status</label>
                  <select
                    id="edit-pay-status"
                    name="payment_status"
                    className="form-select form-select-sm"
                    value={formData.payment_status}
                    onChange={handleChange}
                  >
                    {PAYMENT_STATUS_OPTIONS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: Lifecycle Status & Notes */}
            <div className="edit-modal-section">
              <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0B1329', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                📋 Status & Notes
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label text-sm" htmlFor="edit-booking-status">Booking Status</label>
                  <select
                    id="edit-booking-status"
                    name="booking_status"
                    className="form-select form-select-sm"
                    value={formData.booking_status}
                    onChange={handleChange}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label className="form-label text-sm" htmlFor="edit-requests">Special Requests / Customer Notes</label>
                  <textarea
                    id="edit-requests"
                    name="special_requests"
                    rows="3"
                    className="form-textarea form-textarea-sm"
                    placeholder="Dietary requirements, accessibility, etc."
                    value={formData.special_requests}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label text-sm" htmlFor="edit-admin-notes">Internal Admin Notes</label>
                  <textarea
                    id="edit-admin-notes"
                    name="admin_notes"
                    rows="3"
                    className="form-textarea form-textarea-sm"
                    placeholder="Internal team notes, vehicle driver assigned, etc."
                    value={formData.admin_notes}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

          </div>

          <div className="admin-modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-outline btn-md"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-md"
              disabled={isSaving}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <CheckIcon size={16} /> {isSaving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
