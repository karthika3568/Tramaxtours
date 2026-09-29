import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import adminDashboardService from '../../services/adminDashboardService';
import bookingService from '../../services/bookingService';
import BookingDetailModal from '../../components/admin/bookings/BookingDetailModal';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import { updatePageMeta } from '../../utils/metadata';

export default function AdminDashboardPage() {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    updatePageMeta({
      title: 'Dashboard — Luxury Travel Operations | Tramax Tours',
      description: 'Central operational overview, real-time analytics, and catalog management for Tramax Tours.',
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboard() {
      try {
        setLoading(true);
        setError(null);

        const data = await adminDashboardService.getDashboardData(hasPermission);

        if (isMounted) {
          setDashboardData(data);
          setLastUpdated(data.timestamp ? new Date(data.timestamp) : new Date());
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Failed to load operational metrics.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, [hasPermission, reloadTrigger]);

  const handleRefresh = useCallback(() => {
    setReloadTrigger((prev) => prev + 1);
  }, []);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleViewBooking = async (bookingSummary) => {
    try {
      const full = await bookingService.getBooking(bookingSummary.id);
      setSelectedBooking(full || bookingSummary);
    } catch {
      setSelectedBooking(bookingSummary);
    }
    setIsDetailOpen(true);
  };

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const overview = dashboardData?.overview || {};
  const bookings = overview.bookings || {};
  const tours = overview.tours || {};
  const destinations = overview.destinations || {};
  const reviews = overview.reviews || {};
  const pages = overview.pages || {};
  const pendingActions = dashboardData?.pending_actions || {};
  const recentBookings = dashboardData?.recent_bookings || [];
  const upcomingBookings = dashboardData?.upcoming_bookings || [];
  const recentReviews = dashboardData?.recent_reviews || [];
  const recentTours = dashboardData?.recent_tours || [];

  // Status badge styling helper
  const getBookingStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return 'badge-confirmed';
      case 'completed':
        return 'badge-completed';
      case 'cancelled':
      case 'rejected':
        return 'badge-cancelled';
      case 'pending':
      default:
        return 'badge-pending';
    }
  };

  // Quick Actions Configuration with RBAC Permissions
  const quickActions = [
    {
      label: 'New Tour Package',
      description: 'Create curated itinerary & pricing tiers',
      path: '/admin/tours/new',
      permission: 'tours.create',
      icon: '🧭',
      accent: 'teal',
    },
    {
      label: 'New Destination',
      description: 'Add destination guide, regions & media',
      path: '/admin/destinations/new',
      permission: 'destinations.create',
      icon: '🗺️',
      accent: 'gold',
    },
    {
      label: 'New CMS Page',
      description: 'Publish policy or luxury content page',
      path: '/admin/pages/new',
      permission: 'pages.manage',
      icon: '📄',
      accent: 'purple',
    },
    {
      label: 'Manage Bookings',
      description: 'Inspect orders, dates & payment statuses',
      path: '/admin/bookings',
      permission: 'bookings.view',
      icon: '📋',
      accent: 'teal',
    },
    {
      label: 'Moderate Reviews',
      description: 'Inspect traveler feedback & star ratings',
      path: '/admin/reviews',
      permission: 'reviews.view',
      icon: '💬',
      accent: 'gold',
    },
    {
      label: 'Media Library',
      description: 'Upload high-resolution photography',
      path: '/admin/media',
      permission: 'media.view',
      icon: '🖼️',
      accent: 'slate',
    },
    {
      label: 'Staff & Team',
      description: 'Manage staff accounts & RBAC roles',
      path: '/admin/users',
      permission: 'users.view',
      icon: '👥',
      accent: 'indigo',
    },
  ];

  const accessibleActions = quickActions.filter((act) => {
    if (!act.permission) return true;
    return hasPermission(act.permission);
  });

  return (
    <div className="admin-dashboard-container">
      {/* 1. Dashboard Hero Banner */}
      <section className="dashboard-hero-card">
        <div className="dashboard-hero-content">
          <div className="dashboard-hero-badge">
            <span className="live-pulse-dot" aria-hidden="true" />
            <span>Travel Operations Console</span>
          </div>
          <h1 className="dashboard-hero-title">
            {getGreeting()}, {user?.name || 'Administrator'}
          </h1>
          <p className="dashboard-hero-subtitle">
            Manage your travel operations, curated experiences and guest bookings from one place.
          </p>
        </div>

        <div className="dashboard-hero-actions">
          <div className="hero-sync-info">
            <span className="sync-label">Last synced:</span>
            <span className="sync-time">
              {lastUpdated
                ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Just now'}
            </span>
          </div>
          <button
            type="button"
            className="btn btn-refresh-hero"
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh live operational data"
          >
            <span className={loading ? 'spin-icon' : ''}>🔄</span>
            <span>{loading ? 'Syncing...' : 'Refresh Data'}</span>
          </button>
        </div>
      </section>

      {/* Loading & Error States */}
      {loading && !dashboardData && (
        <div className="dashboard-loading-wrapper">
          <Loading message="Fetching live operational data and booking metrics..." />
        </div>
      )}

      {error && !dashboardData && (
        <div className="dashboard-error-wrapper">
          <ErrorState
            title="Unable to Load Dashboard Data"
            message={error}
            retryText="Retry Connection"
            onRetry={handleRefresh}
          />
        </div>
      )}

      {dashboardData && (
        <>
          {/* 2. Primary KPI Cards Grid */}
          <section className="dashboard-section">
            <div className="section-header-row">
              <div>
                <h2 className="section-title">Operations & Catalog Overview</h2>
                <p className="section-desc">Key performance indicators across bookings, catalog, and reviews</p>
              </div>
            </div>

            <div className="dashboard-kpi-grid">
              {/* Bookings KPI */}
              {hasPermission('bookings.view') && (
                <div className="kpi-card">
                  <div className="kpi-card-header">
                    <span className="kpi-category">Bookings</span>
                    <span className="kpi-icon-box kpi-icon-teal">📋</span>
                  </div>
                  <div className="kpi-card-body">
                    <div className="kpi-stat-number">{bookings.total ?? 0}</div>
                    <div className="kpi-stat-subtext">
                      <span className="highlight-pill highlight-warning">
                        {bookings.pending ?? 0} pending
                      </span>
                      <span className="subtext-note">
                        {bookings.confirmed ?? 0} confirmed
                      </span>
                    </div>
                    <div className="kpi-stat-subtext" style={{ marginTop: '4px' }}>
                      <span className="subtext-note">📅 {bookings.today ?? 0} booked today</span>
                      <span className="subtext-note">🧳 {bookings.upcoming ?? 0} upcoming</span>
                    </div>
                  </div>
                  <div className="kpi-card-footer">
                    <Link to="/admin/bookings" className="kpi-direct-link">
                      View bookings <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Curated Tours KPI */}
              {hasPermission('tours.view') && (
                <div className="kpi-card">
                  <div className="kpi-card-header">
                    <span className="kpi-category">Curated Tours</span>
                    <span className="kpi-icon-box kpi-icon-blue">🧭</span>
                  </div>
                  <div className="kpi-card-body">
                    <div className="kpi-stat-number">{tours.total ?? 0}</div>
                    <div className="kpi-stat-subtext">
                      <span className="highlight-pill highlight-success">
                        {tours.published ?? 0} published
                      </span>
                      <span className="subtext-note">
                        {tours.draft ?? 0} in draft
                      </span>
                    </div>
                  </div>
                  <div className="kpi-card-footer">
                    <Link to="/admin/tours" className="kpi-direct-link">
                      Manage tours <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Destinations KPI */}
              {hasPermission('destinations.view') && (
                <div className="kpi-card">
                  <div className="kpi-card-header">
                    <span className="kpi-category">Destinations</span>
                    <span className="kpi-icon-box kpi-icon-gold">🗺️</span>
                  </div>
                  <div className="kpi-card-body">
                    <div className="kpi-stat-number">{destinations.total ?? 0}</div>
                    <div className="kpi-stat-subtext">
                      <span className="highlight-pill highlight-success">
                        {destinations.published ?? 0} published
                      </span>
                      <span className="subtext-note">
                        {destinations.draft ?? 0} in draft
                      </span>
                    </div>
                  </div>
                  <div className="kpi-card-footer">
                    <Link to="/admin/destinations" className="kpi-direct-link">
                      Explore destinations <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Reviews KPI */}
              {hasPermission('reviews.view') && (
                <div className="kpi-card">
                  <div className="kpi-card-header">
                    <span className="kpi-category">Guest Reviews</span>
                    <span className="kpi-icon-box kpi-icon-amber">💬</span>
                  </div>
                  <div className="kpi-card-body">
                    <div className="kpi-stat-number">{reviews.total ?? 0}</div>
                    <div className="kpi-stat-subtext">
                      <span className="highlight-pill highlight-gold">
                        ★ {Number(reviews.average_rating || 5).toFixed(1)} avg rating
                      </span>
                      <span className="subtext-note">
                        {reviews.pending ?? 0} pending
                      </span>
                    </div>
                  </div>
                  <div className="kpi-card-footer">
                    <Link to="/admin/reviews" className="kpi-direct-link">
                      Moderate reviews <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* CMS Pages KPI */}
              {hasPermission('pages.manage') && (
                <div className="kpi-card">
                  <div className="kpi-card-header">
                    <span className="kpi-category">CMS Pages</span>
                    <span className="kpi-icon-box kpi-icon-purple">📄</span>
                  </div>
                  <div className="kpi-card-body">
                    <div className="kpi-stat-number">{pages.total ?? 0}</div>
                    <div className="kpi-stat-subtext">
                      <span className="highlight-pill highlight-success">
                        {pages.published ?? 0} published
                      </span>
                      <span className="subtext-note">
                        {pages.draft ?? 0} draft
                      </span>
                    </div>
                  </div>
                  <div className="kpi-card-footer">
                    <Link to="/admin/pages" className="kpi-direct-link">
                      Manage pages <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 3. Operational "Needs Attention" Section */}
          <section className="dashboard-section">
            <div className="section-header-row">
              <div>
                <h2 className="section-title">Needs Attention</h2>
                <p className="section-desc">Actionable items requiring review, moderation, or publishing</p>
              </div>
            </div>

            <div className="attention-cards-grid">
              {hasPermission('bookings.view') && (
                <Link to="/admin/bookings" className="attention-row-card">
                  <div className="attention-indicator indicator-warning" />
                  <div className="attention-icon">📋</div>
                  <div className="attention-content">
                    <div className="attention-heading">
                      <span className="attention-count-badge warning-count">
                        {pendingActions.pending_bookings ?? 0}
                      </span>
                      <span className="attention-title">Pending Tour Bookings</span>
                    </div>
                    <p className="attention-subtext">Guest reservations awaiting confirmation & voucher generation</p>
                  </div>
                  <span className="attention-btn-link">Review &rarr;</span>
                </Link>
              )}

              {hasPermission('reviews.view') && (
                <Link to="/admin/reviews" className="attention-row-card">
                  <div className="attention-indicator indicator-warning" />
                  <div className="attention-icon">💬</div>
                  <div className="attention-content">
                    <div className="attention-heading">
                      <span className="attention-count-badge warning-count">
                        {pendingActions.pending_reviews ?? 0}
                      </span>
                      <span className="attention-title">Guest Reviews to Moderate</span>
                    </div>
                    <p className="attention-subtext">Customer feedback submissions pending publication approval</p>
                  </div>
                  <span className="attention-btn-link">Moderate &rarr;</span>
                </Link>
              )}

              {hasPermission('tours.view') && (
                <Link to="/admin/tours" className="attention-row-card">
                  <div className="attention-indicator indicator-info" />
                  <div className="attention-icon">🧭</div>
                  <div className="attention-content">
                    <div className="attention-heading">
                      <span className="attention-count-badge info-count">
                        {pendingActions.draft_tours ?? 0}
                      </span>
                      <span className="attention-title">Draft Tour Packages</span>
                    </div>
                    <p className="attention-subtext">Tour itineraries ready for final review and catalog publishing</p>
                  </div>
                  <span className="attention-btn-link">Inspect &rarr;</span>
                </Link>
              )}

              {hasPermission('destinations.view') && (
                <Link to="/admin/destinations" className="attention-row-card">
                  <div className="attention-indicator indicator-info" />
                  <div className="attention-icon">🗺️</div>
                  <div className="attention-content">
                    <div className="attention-heading">
                      <span className="attention-count-badge info-count">
                        {pendingActions.draft_destinations ?? 0}
                      </span>
                      <span className="attention-title">Draft Destinations</span>
                    </div>
                    <p className="attention-subtext">Regional guides and photo galleries awaiting publication</p>
                  </div>
                  <span className="attention-btn-link">Inspect &rarr;</span>
                </Link>
              )}
            </div>
          </section>

          {/* 4. Booking Overview & Financial Area */}
          {hasPermission('bookings.view') && (
            <section className="dashboard-section">
              <div className="financial-overview-card">
                <div className="financial-card-header">
                  <div className="financial-header-left">
                    <span className="financial-eyebrow">Revenue & Bookings</span>
                    <h3 className="financial-title">Booking Overview</h3>
                    <p className="financial-desc">Real-time status distribution and transaction values</p>
                  </div>
                  <div className="financial-header-right">
                    <div className="financial-total-box">
                      <span className="total-label">Total Booking Value</span>
                      <span className="total-value">
                        € {Number(bookings.total_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="total-method">Pay on Arrival (100% Cash / Settle on Arrival)</span>
                    </div>
                  </div>
                </div>

                {/* Status Segmented Bar */}
                <div className="status-bar-container">
                  <div className="status-bar-top">
                    <span className="status-bar-label">Reservation Lifecycle Breakdown</span>
                    <span className="status-bar-total">{bookings.total ?? 0} Total Bookings</span>
                  </div>

                  <div className="segmented-progress-bar">
                    {bookings.total > 0 ? (
                      <>
                        <div
                          className="segment-item seg-pending"
                          style={{ width: `${((bookings.pending || 0) / bookings.total) * 100}%` }}
                          title={`Pending: ${bookings.pending || 0}`}
                        />
                        <div
                          className="segment-item seg-confirmed"
                          style={{ width: `${((bookings.confirmed || 0) / bookings.total) * 100}%` }}
                          title={`Confirmed: ${bookings.confirmed || 0}`}
                        />
                        <div
                          className="segment-item seg-completed"
                          style={{ width: `${((bookings.completed || 0) / bookings.total) * 100}%` }}
                          title={`Completed: ${bookings.completed || 0}`}
                        />
                        <div
                          className="segment-item seg-cancelled"
                          style={{ width: `${(((bookings.cancelled || 0) + (bookings.rejected || 0)) / bookings.total) * 100}%` }}
                          title={`Cancelled: ${(bookings.cancelled || 0) + (bookings.rejected || 0)}`}
                        />
                      </>
                    ) : (
                      <div className="segment-item seg-empty" style={{ width: '100%' }} />
                    )}
                  </div>

                  <div className="status-legend-row">
                    <div className="legend-item">
                      <span className="legend-chip chip-pending" />
                      <span className="legend-name">Pending</span>
                      <span className="legend-num">{bookings.pending ?? 0}</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-chip chip-confirmed" />
                      <span className="legend-name">Confirmed</span>
                      <span className="legend-num">{bookings.confirmed ?? 0}</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-chip chip-completed" />
                      <span className="legend-name">Completed</span>
                      <span className="legend-num">{bookings.completed ?? 0}</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-chip chip-cancelled" />
                      <span className="legend-name">Cancelled</span>
                      <span className="legend-num">{(bookings.cancelled || 0) + (bookings.rejected || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 5. Feeds Grid: Recent Bookings & Recent Reviews */}
          <div className="dashboard-feeds-grid">
            {/* Recent Bookings Feed */}
            {hasPermission('bookings.view') && (
              <section className="feed-card">
                <div className="feed-card-header">
                  <div>
                    <h3 className="feed-card-title">Recent Reservations</h3>
                    <span className="feed-card-subtitle">Latest traveler bookings across packages</span>
                  </div>
                  <Link to="/admin/bookings" className="feed-header-link">
                    View all bookings &rarr;
                  </Link>
                </div>

                {recentBookings.length > 0 ? (
                  <div className="table-wrapper">
                    <table className="editorial-table">
                      <thead>
                        <tr>
                          <th>Order #</th>
                          <th>Traveler</th>
                          <th>Tour</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentBookings.map((b) => {
                          const travelerInit = b.customer_name ? b.customer_name.charAt(0).toUpperCase() : 'G';
                          return (
                            <tr
                              key={b.id}
                              onClick={() => handleViewBooking(b)}
                              style={{ cursor: 'pointer' }}
                              title="View booking details"
                            >
                              <td>
                                <span className="order-chip">{b.order_number}</span>
                              </td>
                              <td>
                                <div className="traveler-cell">
                                  <div className="traveler-avatar-sm">{travelerInit}</div>
                                  <div className="traveler-meta">
                                    <span className="traveler-name">{b.customer_name?.trim() || 'Guest Traveler'}</span>
                                    <span className="traveler-email">{b.customer_email}</span>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className="tour-title-cell" title={b.tour_title}>
                                  {b.tour_title || 'Curated Tour'}
                                </span>
                              </td>
                              <td>
                                <span className="amount-cell">
                                  {b.currency === 'EUR' ? '€' : b.currency} {Number(b.total_price || 0).toFixed(2)}
                                </span>
                              </td>
                              <td>
                                <span className={`status-pill ${getBookingStatusBadge(b.booking_status)}`}>
                                  {b.booking_status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="feed-empty-state">
                    <span className="empty-icon">📋</span>
                    <p className="empty-text">No traveler bookings recorded yet.</p>
                  </div>
                )}
              </section>
            )}

            {/* Recent Reviews Feed */}
            {hasPermission('reviews.view') && (
              <section className="feed-card">
                <div className="feed-card-header">
                  <div>
                    <h3 className="feed-card-title">Recent Guest Feedback</h3>
                    <span className="feed-card-subtitle">Traveler ratings and experience reviews</span>
                  </div>
                  <Link to="/admin/reviews" className="feed-header-link">
                    Moderate reviews &rarr;
                  </Link>
                </div>

                {recentReviews.length > 0 ? (
                  <div className="reviews-feed-list">
                    {recentReviews.map((rev) => {
                      const authorInit = rev.customer_name ? rev.customer_name.charAt(0).toUpperCase() : 'T';
                      return (
                        <div key={rev.id} className="editorial-review-card">
                          <div className="review-card-top">
                            <div className="review-guest">
                              <div className="guest-avatar">{authorInit}</div>
                              <div className="guest-meta">
                                <span className="guest-name">{rev.customer_name}</span>
                                {rev.customer_country && (
                                  <span className="guest-country">📍 {rev.customer_country}</span>
                                )}
                              </div>
                            </div>
                            <span className={`status-pill ${rev.status === 'approved' ? 'badge-confirmed' : 'badge-pending'}`}>
                              {rev.status}
                            </span>
                          </div>

                          <div className="review-stars-row">
                            <span className="star-rating">
                              {'★'.repeat(Number(rev.rating || 5))}
                            </span>
                            <span className="star-score">({rev.rating}/5)</span>
                            {rev.tour_title && (
                              <span className="review-tour-tag">on {rev.tour_title}</span>
                            )}
                          </div>

                          {rev.content && (
                            <p className="review-quote">
                              &ldquo;{rev.content.length > 120 ? `${rev.content.substring(0, 120)}...` : rev.content}&rdquo;
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="feed-empty-state">
                    <span className="empty-icon">💬</span>
                    <p className="empty-text">No guest reviews submitted yet.</p>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* 5b. Upcoming Bookings — by travel date, not booking-creation date */}
          {hasPermission('bookings.view') && (
            <section className="dashboard-section">
              <div className="section-header-row">
                <div>
                  <h2 className="section-title">Upcoming Tours &amp; Bookings</h2>
                  <p className="section-desc">Confirmed and pending reservations sorted by nearest travel date</p>
                </div>
                <Link to="/admin/bookings?sort_by=booking_date&order=ASC" className="section-header-action">
                  View all &rarr;
                </Link>
              </div>

              {upcomingBookings.length > 0 ? (
                <div className="feed-card">
                  <div className="reviews-feed-list">
                    {upcomingBookings.map((b) => (
                      <button
                        type="button"
                        key={b.id}
                        className="editorial-review-card"
                        style={{ width: '100%', textAlign: 'left', cursor: 'pointer', border: 'none' }}
                        onClick={() => handleViewBooking(b)}
                      >
                        <div className="review-card-top">
                          <div className="review-guest">
                            <div className="guest-avatar">📅</div>
                            <div className="guest-meta">
                              <span className="guest-name">
                                {new Date(b.booking_date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                {' — '}
                                {b.tour_title || 'Curated Tour'}
                              </span>
                              <span className="guest-country">
                                📍 {b.destination_name || 'Unassigned'} • {b.tickets_count} guest{b.tickets_count === 1 ? '' : 's'}
                              </span>
                            </div>
                          </div>
                          <span className={`status-pill ${getBookingStatusBadge(b.booking_status)}`}>
                            {b.booking_status}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="feed-empty-state">
                  <span className="empty-icon">🧳</span>
                  <p className="empty-text">No upcoming travel dates booked yet.</p>
                </div>
              )}
            </section>
          )}

          {/* 6. Curated Tour Packages Snapshot */}
          {hasPermission('tours.view') && recentTours.length > 0 && (
            <section className="dashboard-section">
              <div className="section-header-row">
                <div>
                  <h2 className="section-title">Curated Tours Snapshot</h2>
                  <p className="section-desc">Quick look at curated package catalog and pricing</p>
                </div>
                <Link to="/admin/tours" className="section-header-action">
                  All Tour Packages &rarr;
                </Link>
              </div>

              <div className="tours-snapshot-grid">
                {recentTours.map((tour) => (
                  <div key={tour.id} className="tour-card-snapshot">
                    <div className="snapshot-card-top">
                      <span className="snapshot-type-tag">{tour.tour_type || 'Curated'}</span>
                      <span className={`status-pill ${tour.status === 'published' ? 'badge-confirmed' : 'badge-draft'}`}>
                        {tour.status}
                      </span>
                    </div>
                    <h4 className="snapshot-tour-title">{tour.title}</h4>
                    <p className="snapshot-tour-details">
                      {tour.destination_name ? `📍 ${tour.destination_name} • ` : ''}
                      ⏱️ {tour.duration_days} Day(s)
                    </p>
                    <div className="snapshot-card-bottom">
                      <span className="snapshot-from-price">
                        From <strong>€{Number(tour.base_price || 0).toFixed(2)}</strong>
                      </span>
                      <Link to={`/admin/tours/${tour.id}/edit`} className="snapshot-action-btn">
                        Edit Tour &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 7. Quick Actions Section */}
          {accessibleActions.length > 0 && (
            <section className="dashboard-section">
              <div className="section-header-row">
                <div>
                  <h2 className="section-title">Quick Actions & Administration Shortcuts</h2>
                  <p className="section-desc">Frequently accessed operations and creation workflows</p>
                </div>
              </div>

              <div className="quick-actions-cards-grid">
                {accessibleActions.map((act) => (
                  <Link key={act.path} to={act.path} className={`action-card accent-${act.accent}`}>
                    <div className="action-card-icon-box">
                      <span>{act.icon}</span>
                    </div>
                    <div className="action-card-text">
                      <h4 className="action-card-title">{act.label}</h4>
                      <p className="action-card-desc">{act.description}</p>
                    </div>
                    <span className="action-card-arrow">&rarr;</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <BookingDetailModal
        booking={selectedBooking}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onOpenStatusModal={() => {
          setIsDetailOpen(false);
          navigate('/admin/bookings');
        }}
        onPrintBooking={() => window.print()}
        onSaveAdminNotes={async (bookingId, adminNotes) => {
          try {
            await bookingService.updateBooking(bookingId, { admin_notes: adminNotes });
            setSelectedBooking((prev) => (prev ? { ...prev, admin_notes: adminNotes } : prev));
          } catch {
            // Detail modal has no toast context here; the notes field simply
            // won't reflect the change, which is visible to the admin.
          }
        }}
      />
    </div>
  );
}
