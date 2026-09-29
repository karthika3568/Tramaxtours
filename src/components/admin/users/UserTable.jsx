import { Link } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';

export default function UserTable({
  users = [],
  onViewUser,
  onToggleStatus,
  onDeleteUser,
  isOperating = false,
}) {
  const { user: currentUser, hasPermission } = useAuth();
  const canEdit = hasPermission('users.edit');
  const canDelete = hasPermission('users.delete');

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'user-status-active';
      case 'inactive':
        return 'user-status-inactive';
      case 'suspended':
        return 'user-status-suspended';
      default:
        return 'user-status-default';
    }
  };

  const getBookingStatusBadge = (status) => {
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

  const formatDate = (dateString) => {
    if (!dateString) return '—';
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

  if (!users || users.length === 0) {
    return (
      <div className="users-empty-state">
        <span className="empty-icon" aria-hidden="true">👥</span>
        <h3 className="empty-title">No Customers Found</h3>
        <p className="empty-description">
          No customer accounts match your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="users-table-container">
      {/* Desktop Table */}
      <div className="table-responsive hide-on-mobile">
        <table className="admin-data-table users-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact Details</th>
              <th>Bookings & Travelers</th>
              <th>Tours Booked</th>
              <th>Account Status</th>
              <th>Registered</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = currentUser && Number(currentUser.id) === Number(u.id);
              const userInitial = u.name ? u.name.charAt(0).toUpperCase() : 'C';
              const bookingsCount = u.bookings_count ?? (u.booked_tours ? u.booked_tours.length : 0);
              const totalTravelers = u.total_travelers ?? 0;
              const bookedTours = Array.isArray(u.booked_tours) ? u.booked_tours : [];

              return (
                <tr key={u.id} className={`user-row ${isSelf ? 'user-row-self' : ''}`}>
                  {/* Customer Info */}
                  <td>
                    <div className="user-avatar-cell">
                      <div className="user-avatar" aria-hidden="true" style={{ background: '#01AA90', color: '#fff', fontWeight: 'bold' }}>
                        {userInitial}
                      </div>
                      <div className="user-identity">
                        <div className="user-name-line">
                          <strong className="user-name">{u.name}</strong>
                          {isSelf && <span className="self-tag">You</span>}
                        </div>
                        <span className="user-id-sub">Customer #{u.id}</span>
                      </div>
                    </div>
                  </td>

                  {/* Email & Phone */}
                  <td>
                    <div className="user-contact-cell">
                      <a href={`mailto:${u.email}`} className="user-email-link" style={{ fontWeight: 600 }}>
                        {u.email}
                      </a>
                      {u.phone && <span className="user-phone-sub">📞 {u.phone}</span>}
                    </div>
                  </td>

                  {/* Bookings & Travelers Count */}
                  <td>
                    {bookingsCount > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#e6f7f4',
                            color: '#01806C',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '13px',
                            width: 'fit-content',
                          }}
                        >
                          🎟️ {bookingsCount} {bookingsCount === 1 ? 'Booking' : 'Bookings'}
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                          👥 {totalTravelers} {totalTravelers === 1 ? 'Traveler' : 'Travelers / Guests'}
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                        No bookings placed yet
                      </span>
                    )}
                  </td>

                  {/* Tours Booked Pills */}
                  <td style={{ maxWidth: '280px' }}>
                    {bookedTours.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {bookedTours.slice(0, 3).map((b, idx) => {
                          const statusBadge = getBookingStatusBadge(b.booking_status);
                          return (
                            <span
                              key={b.booking_id || idx}
                              title={`Order: ${b.order_number} | Date: ${b.booking_date || 'N/A'} | Status: ${b.booking_status}`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '11.5px',
                                color: '#1e293b',
                                fontWeight: 600,
                              }}
                            >
                              <span
                                style={{
                                  width: '7px',
                                  height: '7px',
                                  borderRadius: '50%',
                                  background: statusBadge.color,
                                  display: 'inline-block',
                                }}
                              />
                              {b.tour_title || 'Tour Booking'}
                              {b.tickets_count > 1 && (
                                <span style={{ color: '#64748b', fontSize: '10.5px' }}>
                                  ({b.tickets_count}p)
                                </span>
                              )}
                            </span>
                          );
                        })}
                        {bookedTours.length > 3 && (
                          <span
                            style={{
                              fontSize: '11px',
                              color: '#01AA90',
                              fontWeight: 700,
                              alignSelf: 'center',
                            }}
                          >
                            +{bookedTours.length - 3} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td>
                    <span className={`user-status-badge ${getStatusBadgeClass(u.status)}`}>
                      <span className="status-dot" aria-hidden="true" />
                      {u.status}
                    </span>
                  </td>

                  {/* Created Date */}
                  <td>
                    <span className="text-muted-cell">{formatDate(u.created_at)}</span>
                  </td>

                  {/* Actions */}
                  <td className="text-right">
                    <div className="user-action-buttons">
                      {/* View Details */}
                      <button
                        type="button"
                        className="btn btn-outline btn-xs action-btn"
                        onClick={() => onViewUser(u)}
                        title="View customer profile & booking history"
                        aria-label={`View details for ${u.name}`}
                      >
                        👁️ View
                      </button>

                      {/* Edit */}
                      {canEdit && (
                        <Link
                          to={`/admin/users/${u.id}/edit`}
                          className="btn btn-outline btn-xs action-btn"
                          title="Edit customer details"
                          aria-label={`Edit ${u.name}`}
                        >
                          ✏️ Edit
                        </Link>
                      )}

                      {/* Activate / Deactivate */}
                      {canEdit && !isSelf && (
                        <button
                          type="button"
                          className={`btn btn-xs action-btn ${u.status === 'active' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                          onClick={() => onToggleStatus(u)}
                          disabled={isOperating}
                          title={u.status === 'active' ? 'Disable account' : 'Activate account'}
                          aria-label={`${u.status === 'active' ? 'Disable' : 'Activate'} account for ${u.name}`}
                        >
                          {u.status === 'active' ? '⏸️' : '▶️'}
                        </button>
                      )}

                      {/* Delete Customer */}
                      {canDelete && !isSelf && (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-xs action-btn"
                          onClick={() => onDeleteUser(u)}
                          disabled={isOperating}
                          title="Delete customer account"
                          aria-label={`Delete ${u.name}`}
                        >
                          🗑️
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
      <div className="users-mobile-cards show-on-mobile">
        {users.map((u) => {
          const isSelf = currentUser && Number(currentUser.id) === Number(u.id);
          const userInitial = u.name ? u.name.charAt(0).toUpperCase() : 'C';
          const bookingsCount = u.bookings_count ?? (u.booked_tours ? u.booked_tours.length : 0);
          const totalTravelers = u.total_travelers ?? 0;
          const bookedTours = Array.isArray(u.booked_tours) ? u.booked_tours : [];

          return (
            <div key={u.id} className={`user-mobile-card ${isSelf ? 'mobile-card-self' : ''}`}>
              <div className="mobile-card-header">
                <div className="user-avatar-cell">
                  <div className="user-avatar" aria-hidden="true" style={{ background: '#01AA90', color: '#fff', fontWeight: 'bold' }}>
                    {userInitial}
                  </div>
                  <div>
                    <div className="user-name-line">
                      <strong className="user-name">{u.name}</strong>
                      {isSelf && <span className="self-tag">You</span>}
                    </div>
                    <span className="user-email-sub">{u.email}</span>
                  </div>
                </div>
                <span className={`user-status-badge ${getStatusBadgeClass(u.status)}`}>
                  {u.status}
                </span>
              </div>

              <div className="mobile-card-body">
                <div className="mobile-meta-row">
                  <span className="meta-label">Bookings:</span>
                  <span style={{ fontWeight: 700, color: '#01806C' }}>
                    🎟️ {bookingsCount} Bookings ({totalTravelers} Travelers)
                  </span>
                </div>
                {bookedTours.length > 0 && (
                  <div className="mobile-meta-row" style={{ alignItems: 'flex-start' }}>
                    <span className="meta-label">Tours:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {bookedTours.map((b, idx) => (
                        <span
                          key={b.booking_id || idx}
                          style={{
                            background: '#f1f5f9',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}
                        >
                          {b.tour_title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {u.phone && (
                  <div className="mobile-meta-row">
                    <span className="meta-label">Phone:</span>
                    <span>{u.phone}</span>
                  </div>
                )}
                <div className="mobile-meta-row">
                  <span className="meta-label">Registered:</span>
                  <span>{formatDate(u.created_at)}</span>
                </div>
              </div>

              <div className="mobile-card-actions">
                <button
                  type="button"
                  className="btn btn-outline btn-xs action-btn"
                  onClick={() => onViewUser(u)}
                >
                  👁️ View Details
                </button>

                {canEdit && (
                  <Link
                    to={`/admin/users/${u.id}/edit`}
                    className="btn btn-outline btn-xs action-btn"
                  >
                    ✏️ Edit
                  </Link>
                )}

                {canDelete && !isSelf && (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-xs action-btn"
                    onClick={() => onDeleteUser(u)}
                    disabled={isOperating}
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
