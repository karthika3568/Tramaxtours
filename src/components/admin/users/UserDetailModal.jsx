import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function UserDetailModal({ user, onClose }) {
  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!user) return null;

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : 'C';
  const bookedTours = Array.isArray(user.booked_tours) ? user.booked_tours : [];
  const bookingsCount = user.bookings_count ?? bookedTours.length;
  const totalTravelers = user.total_travelers ?? 0;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return { bg: '#dcfce7', color: '#15803d', label: 'Confirmed' };
      case 'completed':
        return { bg: '#e0e7ff', color: '#4338ca', label: 'Completed' };
      case 'cancelled':
      case 'rejected':
        return { bg: '#fee2e2', color: '#b91c1c', label: 'Cancelled' };
      default:
        return { bg: '#fef3c7', color: '#b45309', label: 'Pending' };
    }
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="admin-modal-container user-detail-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '800px', width: '95%' }}
      >
        {/* Modal Header */}
        <div className="admin-modal-header">
          <div className="modal-header-info">
            <span className="modal-eyebrow">Customer & Bookings Profile</span>
            <h2 className="admin-modal-title">{user.name}</h2>
          </div>
          <button
            type="button"
            className="admin-modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Customer Profile Header Card */}
          <div className="user-profile-header-card" style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div
              className="user-profile-avatar"
              style={{
                background: '#1226de',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '24px',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {userInitial}
            </div>
            <div className="user-profile-meta" style={{ flex: 1 }}>
              <h3 className="user-profile-name" style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>
                {user.name}
              </h3>
              <p className="user-profile-email" style={{ margin: '4px 0', color: '#64748b' }}>
                ✉️ {user.email} {user.phone && ` • 📞 ${user.phone}`}
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px', alignItems: 'center' }}>
                <span className={`user-status-badge user-status-${user.status || 'active'}`}>
                  <span className="status-dot" aria-hidden="true" />
                  {user.status || 'active'}
                </span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Member since: {formatDate(user.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div style={{ background: '#e6f7f4', padding: '14px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0a178c', textTransform: 'uppercase' }}>
                Total Bookings
              </span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0a178c', marginTop: '4px' }}>
                🎟️ {bookingsCount}
              </div>
            </div>

            <div style={{ background: '#eff6ff', padding: '14px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>
                Total Travelers Booked
              </span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#1d4ed8', marginTop: '4px' }}>
                👥 {totalTravelers}
              </div>
            </div>
          </div>

          {/* Booked Tours Table / Section */}
          <div className="user-detail-section">
            <h4 className="detail-section-title" style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '12px' }}>
              📋 Tour Bookings & History ({bookedTours.length})
            </h4>

            {bookedTours.length > 0 ? (
              <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                <table className="admin-data-table" style={{ width: '100%', fontSize: '13px' }}>
                  <thead style={{ background: '#f8fafc' }}>
                    <tr>
                      <th style={{ padding: '10px 12px' }}>Order Number</th>
                      <th style={{ padding: '10px 12px' }}>Booked Tour</th>
                      <th style={{ padding: '10px 12px' }}>Tour Date</th>
                      <th style={{ padding: '10px 12px' }}>Travelers</th>
                      <th style={{ padding: '10px 12px' }}>Amount</th>
                      <th style={{ padding: '10px 12px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookedTours.map((b, idx) => {
                      const statusBadge = getStatusBadge(b.booking_status);
                      return (
                        <tr key={b.booking_id || idx}>
                          <td style={{ padding: '10px 12px', fontWeight: 700, color: '#1e293b' }}>
                            <Link to={`/admin/bookings`} style={{ color: '#1226de', textDecoration: 'none' }}>
                              {b.order_number}
                            </Link>
                          </td>
                          <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                            {b.tour_slug ? (
                              <Link to={`/tours/${b.tour_slug}`} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>
                                {b.tour_title} ↗
                              </Link>
                            ) : (
                              b.tour_title
                            )}
                          </td>
                          <td style={{ padding: '10px 12px', color: '#64748b' }}>
                            {formatDate(b.booking_date)}
                          </td>
                          <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                            👥 {b.tickets_count || 1} {b.tickets_count === 1 ? 'Guest' : 'Guests'}
                          </td>
                          <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>
                            {b.currency || 'USD'} {Number(b.total_price || 0).toFixed(2)}
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span
                              style={{
                                background: statusBadge.bg,
                                color: statusBadge.color,
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                textTransform: 'capitalize',
                              }}
                            >
                              {b.booking_status || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 20px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>🎟️</span>
                <strong style={{ color: '#475569', display: 'block' }}>No tour bookings placed yet</strong>
                <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0 0' }}>
                  When this customer books any day tours or sightseeing excursions, their reservations will appear here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="admin-modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
