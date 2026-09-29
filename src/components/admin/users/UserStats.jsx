export default function UserStats({ stats }) {
  const safeStats = stats || {};

  return (
    <div className="users-stats-grid">
      <div className="user-stat-card stat-total">
        <div className="stat-card-icon">👥</div>
        <div className="stat-card-body">
          <span className="stat-card-number">{safeStats.total_staff ?? 0}</span>
          <span className="stat-card-label">Total Customers</span>
        </div>
      </div>

      <div className="user-stat-card stat-active">
        <div className="stat-card-icon">📋</div>
        <div className="stat-card-body">
          <span className="stat-card-number">{safeStats.total_bookings ?? 0}</span>
          <span className="stat-card-label">Total Bookings Placed</span>
        </div>
      </div>

      <div className="user-stat-card stat-super">
        <div className="stat-card-icon">🧳</div>
        <div className="stat-card-body">
          <span className="stat-card-number">{safeStats.total_travelers ?? 0}</span>
          <span className="stat-card-label">Total Travelers Booked</span>
        </div>
      </div>

      <div className="user-stat-card stat-roles">
        <div className="stat-card-icon">✅</div>
        <div className="stat-card-body">
          <span className="stat-card-number">{safeStats.active_staff ?? 0}</span>
          <span className="stat-card-label">Active Accounts</span>
        </div>
      </div>
    </div>
  );
}
