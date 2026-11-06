import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import medicalTripService from '../../services/medicalTripService';
import { useToast } from '../../context/ToastContext';
import { updatePageMeta } from '../../utils/metadata';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';

export default function AdminMedicalTripsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    updatePageMeta({
      title: 'Admin — Medical Trips & Packages | Wanderer South India',
      description: 'Manage executive medical tourism packages, clinical assessments, diagnostics, and travel guidelines.',
    });
  }, []);

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, total_pages: 1 });

  // Filter State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Modal / Action State
  const [tripToDelete, setTripToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Load Trips
  useEffect(() => {
    let mounted = true;
    async function fetchTrips() {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page,
          limit: 15,
          search: debouncedSearch || undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
        };

        if (statusFilter === 'published') {
          params.is_published = 1;
        } else if (statusFilter === 'draft') {
          params.is_published = 0;
        } else if (statusFilter === 'active') {
          params.is_active = 1;
        } else if (statusFilter === 'inactive') {
          params.is_active = 0;
        }

        const res = await medicalTripService.getAdminMedicalTrips(params);
        if (mounted) {
          setTrips(res.items || []);
          setPagination(res.pagination || { page: 1, limit: 15, total: 0, total_pages: 1 });
        }
      } catch (err) {
        if (mounted) {
          setError(err?.message || 'Failed to load medical trip packages.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchTrips();
    return () => {
      mounted = false;
    };
  }, [page, debouncedSearch, statusFilter, categoryFilter, reloadTrigger]);

  // Toggle Publish
  const handleTogglePublish = async (trip) => {
    try {
      setActionLoadingId(trip.id);
      await medicalTripService.togglePublish(trip.id);
      toast.success(
        trip.is_published ? 'Package unpublished and set to Draft.' : 'Package published live on website!',
        'Status Updated'
      );
      setReloadTrigger((p) => p + 1);
    } catch (err) {
      toast.error(err?.message || 'Failed to toggle publish status.', 'Error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle Active
  const handleToggleActive = async (trip) => {
    try {
      setActionLoadingId(trip.id);
      await medicalTripService.toggleActive(trip.id);
      toast.success(
        trip.is_active ? 'Package deactivated.' : 'Package activated.',
        'Status Updated'
      );
      setReloadTrigger((p) => p + 1);
    } catch (err) {
      toast.error(err?.message || 'Failed to toggle active status.', 'Error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete Trip
  const handleDeleteConfirm = async () => {
    if (!tripToDelete) return;
    try {
      setIsDeleting(true);
      await medicalTripService.deleteMedicalTrip(tripToDelete.id);
      toast.success(`Package "${tripToDelete.title}" removed.`, 'Deleted');
      setTripToDelete(null);
      setReloadTrigger((p) => p + 1);
    } catch (err) {
      toast.error(err?.message || 'Failed to delete package.', 'Delete Error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="admin-medical-trips-page pb-16">
      {/* 1. Header */}
      <div className="admin-page-hero-header">
        <div className="admin-page-hero-info">
          <div className="admin-page-hero-icon" aria-hidden="true" style={{ background: '#ecfdf5', color: '#01aa90' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div>
            <h1 className="admin-page-hero-title">Medical Trips</h1>
            <p className="admin-page-hero-subtitle">
              Manage clinical health screening packages, diagnostics, assessments, and travel guidelines.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setReloadTrigger((p) => p + 1)}
            className="admin-page-btn"
            title="Refresh Packages"
            style={{ height: '40px', padding: '0 14px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span>🔄</span> Refresh
          </button>

          <Link
            to="/admin/medical-trips/new"
            className="btn btn-primary"
            style={{ height: '40px', padding: '0 16px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '13.5px' }}
          >
            <span>➕</span> Add Medical Package
          </Link>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="admin-modern-filter-card">
        <select
          className="admin-modern-select"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by status"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <select
          className="admin-modern-select"
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by category"
        >
          <option value="all">All Categories</option>
          <option value="Executive Health Check">Executive Health Check</option>
          <option value="Comprehensive Health Check">Comprehensive Health Check</option>
          <option value="Cardiopulmonary & Wellness">Cardiopulmonary &amp; Wellness</option>
          <option value="Ayurvedic & Holistic Health">Ayurvedic &amp; Holistic Health</option>
        </select>

        <div className="admin-modern-search-box">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            className="admin-modern-search-input"
            placeholder="Search medical packages by title, category, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search medical packages"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="search-clear-btn"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 3. Table Card */}
      <div className="admin-modern-table-card">
        {loading ? (
          <div style={{ padding: '64px 20px', textAlign: 'center' }}>
            <Loading message="Loading medical trip packages..." />
          </div>
        ) : error ? (
          <div style={{ padding: '32px 20px' }}>
            <ErrorState title="Error Loading Packages" message={error} onRetry={() => setReloadTrigger((p) => p + 1)} />
          </div>
        ) : trips.length === 0 ? (
          <div style={{ padding: '64px 20px', textAlign: 'center' }}>
            <span style={{ fontSize: '36px', display: 'block', marginBottom: '8px' }}>🏥</span>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>No Medical Packages Found</h3>
            <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px' }}>
              {debouncedSearch || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'No packages match your search filter criteria. Try clearing filters.'
                : 'No medical trip packages have been created yet. Click "+ Add Medical Package" to create one.'}
            </p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="admin-modern-table" aria-label="Medical Packages List">
                <thead>
                  <tr>
                    <th>Package Details</th>
                    <th style={{ width: '120px' }}>Duration</th>
                    <th style={{ width: '150px' }}>Price</th>
                    <th style={{ width: '140px' }}>Assessments</th>
                    <th style={{ width: '120px' }}>Status</th>
                    <th style={{ width: '110px' }}>Created</th>
                    <th style={{ width: '130px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map((trip) => {
                    const isPublished = Boolean(Number(trip.is_published));
                    const isActive = Boolean(Number(trip.is_active));
                    const thumbUrl = trip.featured_image || trip.banner_image || '/uploads/media/medical_banner_doctor.svg';
                    const isOperating = actionLoadingId === trip.id;

                    return (
                      <tr key={trip.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                              style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '10px',
                                overflow: 'hidden',
                                flexShrink: 0,
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                              }}
                            >
                              <img
                                src={thumbUrl}
                                alt={trip.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.src = '/uploads/media/medical_banner_doctor.svg';
                                }}
                              />
                            </div>
                            <div>
                              <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>
                                {trip.title}
                              </strong>
                              <span style={{ fontSize: '12px', color: '#01aa90', fontWeight: '600' }}>
                                {trip.category || 'Executive Health Check'}
                              </span>
                              <span style={{ fontSize: '11.5px', color: '#64748b', display: 'block' }}>
                                📍 {trip.location || 'Chennai, Tamil Nadu'} • <code style={{ fontSize: '11px', color: '#475569' }}>/{trip.slug}</code>
                              </span>
                            </div>
                          </div>
                        </td>

                        <td style={{ fontWeight: '500', color: '#334155' }}>
                          ⏱️ {trip.duration || '1 Day'}
                        </td>

                        <td>
                          <div>
                            <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                              {trip.currency === 'INR' ? '₹' : (trip.currency || '₹')}
                              {Number(trip.discount_price || trip.price || 0).toLocaleString()}
                            </strong>
                            {trip.discount_price && Number(trip.discount_price) < Number(trip.price) && (
                              <span style={{ fontSize: '11.5px', color: '#94a3b8', textDecoration: 'line-through', marginLeft: '6px' }}>
                                ₹{Number(trip.price).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </td>

                        <td>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: '#f0fdf4',
                              color: '#16a34a',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '700',
                            }}
                          >
                            🔬 {trip.assessments_count || 0} Assessments
                          </span>
                        </td>

                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span className={`admin-status-pill ${isPublished ? 'pill-confirmed' : 'pill-closed'}`} style={{ fontSize: '11px' }}>
                              {isPublished ? 'Published' : 'Draft'}
                            </span>
                            <span style={{ fontSize: '10.5px', color: isActive ? '#059669' : '#dc2626', fontWeight: '600' }}>
                              {isActive ? '● Active' : '○ Inactive'}
                            </span>
                          </div>
                        </td>

                        <td style={{ color: '#64748b', fontSize: '12px', whiteSpace: 'nowrap' }}>
                          {trip.created_at ? new Date(trip.created_at).toLocaleDateString() : '—'}
                        </td>

                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div className="admin-table-actions">
                            {/* View Public Live Link */}
                            <a
                              href={`/tours/medical-trip/${trip.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="admin-action-btn-circle"
                              title="View Public Details Page"
                            >
                              👁️
                            </a>

                            {/* Edit Package */}
                            <Link
                              to={`/admin/medical-trips/${trip.id}/edit`}
                              className="admin-action-btn-circle"
                              title="Edit Package & Assessments"
                            >
                              ✏️
                            </Link>

                            {/* Toggle Publish / Draft */}
                            <button
                              type="button"
                              onClick={() => handleTogglePublish(trip)}
                              disabled={isOperating}
                              className="admin-action-btn-circle"
                              title={isPublished ? 'Unpublish (set to Draft)' : 'Publish Live'}
                              style={{ color: isPublished ? '#d97706' : '#16a34a' }}
                            >
                              {isPublished ? '⏸️' : '🚀'}
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => setTripToDelete(trip)}
                              disabled={isOperating}
                              className="admin-action-btn-circle"
                              title="Delete Medical Trip"
                              style={{ color: '#dc2626' }}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="admin-table-footer">
              <span>
                Showing {pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} packages
              </span>
              <div className="admin-pagination">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="admin-page-btn"
                  title="Previous page"
                >
                  ‹
                </button>
                {Array.from({ length: pagination.total_pages || 1 }, (_, i) => i + 1).map((pNum) => (
                  <button
                    key={pNum}
                    type="button"
                    onClick={() => setPage(pNum)}
                    className={`admin-page-btn ${page === pNum ? 'active' : ''}`}
                  >
                    {pNum}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={page >= (pagination.total_pages || 1)}
                  onClick={() => setPage((p) => Math.min(pagination.total_pages || 1, p + 1))}
                  className="admin-page-btn"
                  title="Next page"
                >
                  ›
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {tripToDelete && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-container" style={{ maxWidth: '480px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>
              Delete Medical Package
            </h3>
            <p style={{ fontSize: '13.5px', color: '#64748b', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete <strong>{tripToDelete.title}</strong>? All associated clinical assessments, tests, reports, and conditions will also be deleted.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setTripToDelete(null)}
                disabled={isDeleting}
                className="btn btn-outline btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="btn btn-danger btn-sm bg-red-600 text-white"
                style={{ background: '#dc2626', borderColor: '#dc2626' }}
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

