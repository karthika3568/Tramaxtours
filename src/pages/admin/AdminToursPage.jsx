import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import tourService from '../../services/tourService';
import destinationService from '../../services/destinationService';
import { updatePageMeta } from '../../utils/metadata';
import TourFilters from '../../components/admin/tours/TourFilters';
import TourTable from '../../components/admin/tours/TourTable';
import TourDeleteModal from '../../components/admin/tours/TourDeleteModal';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';

export default function AdminToursPage() {
  const { hasPermission } = useAuth();
  const toast = useToast();

  const canCreate = hasPermission('tours.create');
  const canEdit = hasPermission('tours.edit');
  const canDelete = hasPermission('tours.delete');
  const canPublish = hasPermission('tours.publish');

  // Page Title
  useEffect(() => {
    updatePageMeta({
      title: 'Admin - Curated Journeys & Tour Catalog | Tramax Tours',
      description: 'Manage destinations, experiences, pricing and published tour packages.',
    });
  }, []);

  // Data State
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [destinationsList, setDestinationsList] = useState([]);

  // View Mode: 'cards' (editorial grid) | 'table' (compact data table)
  const [viewMode, setViewMode] = useState('cards');

  // Stats Counters from real API response
  const [totalCount, setTotalCount] = useState(0);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [destinationId, setDestinationId] = useState('all');
  const [tourType, setTourType] = useState('all');
  const [status, setStatus] = useState('all');
  const [isFeatured, setIsFeatured] = useState('all');
  const [sortBy, setSortBy] = useState('display_order');
  const [order, setOrder] = useState('ASC');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(12);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Action / Modal State
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [tourToDelete, setTourToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Compute stats from current loaded list or API
  const stats = useMemo(() => {
    const published = tours.filter((t) => t.status === 'published').length;
    const draft = tours.filter((t) => t.status === 'draft').length;
    const featured = tours.filter((t) => Boolean(t.is_featured)).length;
    return { published, draft, featured };
  }, [tours]);

  // Load destinations once for the filter dropdown
  useEffect(() => {
    let isMounted = true;
    async function loadDestinations() {
      try {
        const res = await destinationService.getDestinations({ limit: 100, status: 'all' });
        if (isMounted) {
          setDestinationsList(res.items || res.data || []);
        }
      } catch {
        // Ignore fallback
      }
    }
    loadDestinations();
    return () => {
      isMounted = false;
    };
  }, []);

  // Search Debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Tours
  useEffect(() => {
    let isMounted = true;

    async function loadTours() {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page,
          limit,
          sort_by: sortBy,
          order,
        };

        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }
        if (destinationId && destinationId !== 'all') {
          params.destination_id = destinationId;
        }
        if (tourType && tourType !== 'all') {
          params.tour_type = tourType;
        }
        if (status && status !== 'all') {
          params.status = status;
        } else {
          params.status = 'all';
        }
        if (isFeatured && isFeatured !== 'all') {
          params.is_featured = isFeatured;
        }

        const response = await tourService.getTours(params);
        if (isMounted) {
          const items = response.items || response.data || [];
          const pagination = response.pagination || {};

          setTours(items);
          setTotalPages(pagination.total_pages || 1);
          setTotalCount(pagination.total || items.length);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Failed to load tour packages.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTours();

    return () => {
      isMounted = false;
    };
  }, [page, limit, sortBy, order, debouncedSearch, destinationId, tourType, status, isFeatured, reloadTrigger]);

  const handleRefresh = useCallback(() => {
    setReloadTrigger((prev) => prev + 1);
  }, []);

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setDestinationId('all');
    setTourType('all');
    setStatus('all');
    setIsFeatured('all');
    setSortBy('display_order');
    setOrder('ASC');
    setPage(1);
  };

  // Publish / Unpublish Toggle
  const handlePublishToggle = async (tour) => {
    try {
      setActionLoadingId(tour.id);
      const isCurrentlyPublished = tour.status === 'published';

      if (isCurrentlyPublished) {
        await tourService.unpublishTour(tour.id);
        toast.info(`Tour "${tour.title}" reverted to draft.`, 'Unpublished');
      } else {
        await tourService.publishTour(tour.id);
        toast.success(`Tour "${tour.title}" is now published live!`, 'Published');
      }

      handleRefresh();
    } catch (err) {
      toast.error(err?.message || 'Failed to update publishing status.', 'Action Failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete Handler
  const handleConfirmDelete = async (id, force) => {
    try {
      setIsDeleting(true);
      await tourService.deleteTour(id, force);
      toast.success(
        force
          ? 'Tour permanently force-deleted.'
          : 'Tour soft-deleted successfully.',
        'Deleted'
      );
      setTourToDelete(null);
      handleRefresh();
    } catch (err) {
      toast.error(
        err?.message || 'Failed to delete tour package.',
        'Delete Failed'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const isFiltered =
    Boolean(debouncedSearch) ||
    (destinationId && destinationId !== 'all') ||
    (status && status !== 'all') ||
    (tourType && tourType !== 'all') ||
    (isFeatured && isFeatured !== 'all');

  return (
    <div className="admin-tours-catalog-page">
      {/* Editorial Page Header */}
      <div className="tour-catalog-header-card">
        <div className="catalog-header-main">
          <div className="catalog-header-eyebrow">
            <span className="eyebrow-chip">TOUR CATALOG</span>
          </div>
          <h2 className="catalog-header-title">Curated Journeys</h2>
          <p className="catalog-header-subtitle">
            Manage destinations, experiences, pricing and published tour packages.
          </p>
        </div>

        <div className="catalog-header-actions">
          {/* View Mode Toggle */}
          <div className="view-mode-toggle" role="group" aria-label="Catalog View Mode">
            <button
              type="button"
              className={`view-mode-btn ${viewMode === 'cards' ? 'is-active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Editorial Card Grid View"
              aria-pressed={viewMode === 'cards'}
            >
              <span className="mode-icon">▦</span> Cards
            </button>
            <button
              type="button"
              className={`view-mode-btn ${viewMode === 'table' ? 'is-active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Compact Table View"
              aria-pressed={viewMode === 'table'}
            >
              <span className="mode-icon">☰</span> Table
            </button>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-sm btn-refresh-catalog"
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh tours catalog"
          >
            <span className={loading ? 'spin-icon' : ''}>🔄</span> Refresh
          </button>

          {canCreate && (
            <Link
              to="/admin/tours/new"
              className="btn btn-primary btn-sm btn-new-tour"
            >
              + New Tour Package
            </Link>
          )}
        </div>
      </div>

      {/* Catalog Summary Stats Bar */}
      <div className="catalog-summary-bar">
        <div className="summary-stat-box">
          <span className="summary-stat-label">Total Tours</span>
          <strong className="summary-stat-val val-total">{totalCount}</strong>
        </div>
        <div className="summary-stat-divider" aria-hidden="true" />
        <div className="summary-stat-box">
          <span className="summary-stat-label">Published</span>
          <strong className="summary-stat-val val-published">{stats.published}</strong>
        </div>
        <div className="summary-stat-divider" aria-hidden="true" />
        <div className="summary-stat-box">
          <span className="summary-stat-label">Draft</span>
          <strong className="summary-stat-val val-draft">{stats.draft}</strong>
        </div>
        <div className="summary-stat-divider" aria-hidden="true" />
        <div className="summary-stat-box">
          <span className="summary-stat-label">Featured Spotlight</span>
          <strong className="summary-stat-val val-featured">{stats.featured}</strong>
        </div>
        <div className="summary-stat-divider" aria-hidden="true" />
        <div className="summary-stat-box">
          <span className="summary-stat-label">Page</span>
          <span className="summary-stat-page-txt">{page} of {totalPages}</span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <TourFilters
        search={search}
        onSearchChange={setSearch}
        destinationId={destinationId}
        onDestinationChange={(newDest) => {
          setDestinationId(newDest);
          setPage(1);
        }}
        destinationsList={destinationsList}
        tourType={tourType}
        onTourTypeChange={(newType) => {
          setTourType(newType);
          setPage(1);
        }}
        status={status}
        onStatusChange={(newStatus) => {
          setStatus(newStatus);
          setPage(1);
        }}
        isFeatured={isFeatured}
        onIsFeaturedChange={(newFeatured) => {
          setIsFeatured(newFeatured);
          setPage(1);
        }}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        order={order}
        onOrderChange={setOrder}
        onReset={handleResetFilters}
      />

      {/* Content Area */}
      {loading ? (
        <div className="tour-catalog-loading-grid">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="tour-skeleton-card" aria-hidden="true">
              <div className="skeleton-image shimmer" />
              <div className="skeleton-body">
                <div className="skeleton-line skeleton-badge shimmer" />
                <div className="skeleton-line skeleton-title shimmer" />
                <div className="skeleton-line skeleton-meta shimmer" />
                <div className="skeleton-footer">
                  <div className="skeleton-price shimmer" />
                  <div className="skeleton-buttons shimmer" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState
          title="Unable to load tours"
          message={error}
          onRetry={handleRefresh}
        />
      ) : tours.length === 0 ? (
        <div className="catalog-empty-card">
          <EmptyState
            title={isFiltered ? 'No matching tours found' : 'No journeys yet'}
            description={
              isFiltered
                ? 'No tours match your current search and filter settings. Try clearing filters to see all packages.'
                : 'Your curated travel catalog is waiting for its first experience.'
            }
            actionLabel={
              isFiltered
                ? 'Clear Filters'
                : canCreate
                ? '+ Create Your First Tour'
                : undefined
            }
            onAction={
              isFiltered
                ? handleResetFilters
                : canCreate
                ? () => {}
                : undefined
            }
          />
        </div>
      ) : (
        <>
          {/* Tour Listing View (Cards / Table) */}
          <TourTable
            tours={tours}
            viewMode={viewMode}
            onPublishToggle={handlePublishToggle}
            onDeleteClick={setTourToDelete}
            canEdit={canEdit}
            canDelete={canDelete}
            canPublish={canPublish}
            actionLoadingId={actionLoadingId}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="tour-pagination-bar">
              <span className="pagination-summary">
                Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} total tour packages)
              </span>

              <div className="pagination-nav-group">
                <button
                  type="button"
                  className="btn btn-outline btn-sm btn-pagination-nav"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous Page"
                >
                  ← Previous
                </button>

                <div className="pagination-pages-list">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                    .map((p, idx, arr) => (
                      <span key={p} className="pagination-page-wrapper">
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="pagination-ellipsis">...</span>
                        )}
                        <button
                          type="button"
                          className={`btn-page-number ${p === page ? 'is-active' : ''}`}
                          onClick={() => setPage(p)}
                          aria-current={p === page ? 'page' : undefined}
                        >
                          {p}
                        </button>
                      </span>
                    ))}
                </div>

                <button
                  type="button"
                  className="btn btn-outline btn-sm btn-pagination-nav"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next Page"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {tourToDelete && (
        <TourDeleteModal
          tour={tourToDelete}
          isOpen={Boolean(tourToDelete)}
          onClose={() => setTourToDelete(null)}
          onConfirmDelete={handleConfirmDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}

